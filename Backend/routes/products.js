const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { getContractInstance } = require('../utils/blockchain');
const crypto = require('crypto');
// Assume middleware auth is implemented, skipping for brevity
// const auth = require('../middleware/auth');

router.post('/', async (req, res) => {
    try {
        const { productName, serialNumber, batchNumber, manufacturingDate, expiryDate, quantity, description } = req.body;

        let product = await Product.findOne({ serialNumber });
        if (product) return res.status(400).json({ msg: 'Product already registered' });

        const dataString = `${productName}${serialNumber}${batchNumber}${manufacturingDate}${description}`;
        const hash = crypto.createHash('sha256').update(dataString).digest('hex');

        // Blockchain Integration (Ethereum/Hardhat)
        let blockchainTxId = 'Pending';
        const blockchain = await getContractInstance();

        if (blockchain) {
            const { contract } = blockchain;
            const company = req.body.company || 'UnknownCompany';
            
            // Calling the Solidity registerProduct function
            // (productID, name, manufacturer, batch, manufactureDate)
            const tx = await contract.registerProduct(
                serialNumber, 
                productName, 
                company, 
                batchNumber, 
                manufacturingDate.toString()
            );
            
            // Wait for transaction to be mined
            const receipt = await tx.wait();
            blockchainTxId = receipt.hash; // Using the real transaction hash
        } else {
            console.log('Blockchain connection failed, proceeding with DB only for now.');
            blockchainTxId = 'Not_on_Blockchain';
        }

        product = new Product({
            productName, serialNumber, batchNumber, manufacturingDate, expiryDate, quantity, description,
            hash, blockchainTxId
        });

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
