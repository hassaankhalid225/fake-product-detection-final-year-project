const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const VerificationLog = require('../models/VerificationLog');
const { getContractInstance } = require('../utils/blockchain');
const crypto = require('crypto');

router.post('/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const ipAddress = req.ip || req.connection.remoteAddress;

        let product = await Product.findOne({ serialNumber });
        if (!product) {
            await VerificationLog.create({ serialNumber, ipAddress, status: 'Fake / Not Found' });
            return res.status(404).json({ status: 'Fake / Not Found', msg: 'Product not found in Database' });
        }

        // Checking if already verified numerous times (potential duplicate/fake alert)
        const logsCount = await VerificationLog.countDocuments({ serialNumber });

        if (logsCount > 10) {
            await VerificationLog.create({ serialNumber, productId: product._id, ipAddress, status: 'Duplicate Serial Detected' });
            return res.json({ status: 'Duplicate Serial Detected', count: logsCount, product });
        }

        // Blockchain Verification (Ethereum/Hardhat)
        let isBlockchainVerified = false;
        const blockchain = await getContractInstance();

        if (blockchain) {
            try {
                const { contract } = blockchain;
                const productFromBC = await contract.verifyProduct(serialNumber);
                
                // If it doesn't throw, it exists. We can compare basic fields if we want extra security
                // For now, if it returns data and isRegistered is true, it's verified on BC
                if (productFromBC.isRegistered) {
                    isBlockchainVerified = true;
                }
            } catch (bcErr) {
                console.log('Product not found on blockchain or contract error:', bcErr.message);
            }
        }

        // Final verification logic
        if (isBlockchainVerified) {
            await VerificationLog.create({ serialNumber, productId: product._id, ipAddress, status: 'Verified Original Product' });
            return res.json({ 
                status: 'Verified Original Product', 
                product,
                blockchainVerified: true
            });
        } else {
            // If it's in DB but not BC, it's a warning state
            await VerificationLog.create({ serialNumber, productId: product._id, ipAddress, status: 'Database Match Only' });
            return res.json({ 
                status: 'Partial Verification', 
                msg: 'Product found in local database but NOT verified on blockchain ledger.', 
                product,
                blockchainVerified: false
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
