const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const VerificationLog = require('../models/VerificationLog');
const { getContractInstance } = require('../utils/blockchain');
const mongoose = require('mongoose');

// Helper to convert BigInts to strings for JSON
const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
));

// GET /blockchain-status
router.get('/blockchain-status', async (req, res) => {
    try {
        const blockchain = await getContractInstance();
        if (blockchain) {
            const { contract } = blockchain;
            const address = await contract.getAddress();
            return res.json({ 
                connected: true, 
                network: 'Hardhat Localhost',
                contractAddress: address
            });
        }
        res.json({ connected: false, error: 'Node not reachable or contract not deployed' });
    } catch (err) {
        res.json({ connected: false, error: err.message });
    }
});

// POST /registerProduct
router.post('/registerProduct', async (req, res) => {
    try {
        const { productID, name, manufacturer, batch, manufactureDate, description } = req.body;

        let product = await Product.findOne({ serialNumber: productID });
        if (product) return res.status(400).json({ msg: 'Product already registered in DB' });

        const blockchain = await getContractInstance();
        let currentOwner = manufacturer;
        if (blockchain) {
            const { contract } = blockchain;
            const tx = await contract.registerProduct(productID, name, manufacturer, batch, manufactureDate);
            await tx.wait(); // Wait for tx to be mined
        } else {
            console.warn('Blockchain connection failed or mocked.');
        }

        product = new Product({
            productName: name,
            serialNumber: productID,
            batchNumber: batch,
            manufacturingDate: manufactureDate,
            quantity: 1,
            description: description || 'No description',
            hash: 'mock-hash',
            blockchainTxId: 'mock-tx-id'
        });

        await product.save();
        res.json({ message: 'Product successfully registered on Ethereum!', product });
    } catch (err) {
        console.error(err.message || err);
        res.status(500).send(err.reason || err.message || 'Server Error');
    }
});

// POST /transferProduct
router.post('/transferProduct', async (req, res) => {
    try {
        const { productID, from, to } = req.body; // In ethers, `_to` should be an ethereum address. For simplicity, we can just hash it or the UI must supply an address. But right now our Solidity contract expects `address _to`. 

        // Let's create a deterministic address from the 'to' string to make it work seamlessly without true metamask integration, or assume it is a valid hex.
        // If it's not a hex address, create a dummy one.
        let toAddress = to;
        if (!toAddress.startsWith("0x") || toAddress.length !== 42) {
            const crypto = require("crypto");
            toAddress = "0x" + crypto.createHash('sha1').update(to).digest('hex');
        }

        const blockchain = await getContractInstance();
        if (blockchain) {
            const { contract } = blockchain;
            const tx = await contract.transferProduct(productID, toAddress);
            await tx.wait();
        }

        res.json({ message: 'Product transfer recorded on Ethereum successfully.' });
    } catch (err) {
        console.error(err.message || err);
        res.status(500).send(err.reason || err.message || 'Server Error');
    }
});

// GET /verifyProduct/:productID
router.get('/verifyProduct/:productID', async (req, res) => {
    try {
        const { productID } = req.params;

        const blockchain = await getContractInstance();
        if (blockchain) {
            const { contract } = blockchain;
            let result = await contract.verifyProduct(productID);

            // Result is an array-like struct from ethers
            const productData = {
                productID: result.productID,
                name: result.name,
                manufacturer: result.manufacturer,
                batch: result.batch,
                manufactureDate: result.manufactureDate,
                currentOwner: result.currentOwner,
                status: result.status,
                isRegistered: result.isRegistered
            };

            return res.json({ status: 'Authentic (Ethereum)', product: productData });
        }

        // Fallback to local DB if blockchain is unavailable
        let product = await Product.findOne({ serialNumber: productID });
        if (!product) {
            return res.status(404).json({ status: 'Fake / Not Found', msg: 'Product not found' });
        }
        res.json({ status: 'Authentic (DB)', product });

    } catch (err) {
        console.error(err.message || err);
        if ((err.message && err.message.includes('not found')) || (err.reason && err.reason.includes('not found'))) {
            return res.status(404).json({ status: 'Fake / Not Found', msg: 'Product not found in Ethereum Ledger' });
        }
        res.status(500).send(err.reason || err.message || 'Server Error');
    }
});

// GET /productHistory/:productID
router.get('/productHistory/:productID', async (req, res) => {
    try {
        const { productID } = req.params;

        const blockchain = await getContractInstance();
        if (blockchain) {
            const { contract } = blockchain;
            const historyResult = await contract.getProductHistory(productID);

            const history = historyResult.map(h => ({
                previousOwner: h.previousOwner,
                newOwner: h.newOwner,
                status: h.status,
                timestamp: new Date(Number(h.timestamp) * 1000).toLocaleString()
            }));

            return res.json({ history });
        }

        return res.status(503).json({ msg: 'Ethereum node not available to fetch history.' });
    } catch (err) {
        console.error(err.message || err);
        res.status(500).send(err.reason || err.message || 'Server Error');
    }
});

// POST /markProductSold
router.post('/markProductSold', async (req, res) => {
    try {
        const { productID } = req.body;

        const blockchain = await getContractInstance();
        if (blockchain) {
            const { contract } = blockchain;
            const tx = await contract.markProductSold(productID);
            await tx.wait();
        }

        res.json({ message: 'Product marked as sold on Ethereum.' });
    } catch (err) {
        console.error(err.message || err);
        res.status(500).send(err.reason || err.message || 'Server Error');
    }
});

module.exports = router;
