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

        // --- FYP ADVANCED: Anomaly Detection ---
        const allLogs = await VerificationLog.find({ serialNumber }).sort({ createdAt: -1 });
        const logsCount = allLogs.length;
        const uniqueIps = [...new Set(allLogs.map(log => log.ipAddress))].length;
        
        let anomalyFlag = false;
        let anomalyReason = "";

        // Rule 1: High frequency scanning from different IPs (Cloning detected)
        if (uniqueIps > 3 && logsCount > 5) {
            anomalyFlag = true;
            anomalyReason = "MULTIPLE_IP_DETECTED (Probable Counterfeit/Clone)";
        }

        // Rule 2: Rapid scanning (Bot detection)
        if (allLogs.length > 0) {
            const lastScan = new Date(allLogs[0].createdAt);
            const now = new Date();
            const diffMinutes = Math.abs(now - lastScan) / (1000 * 60);
            if (diffMinutes < 1 && logsCount > 2) {
                anomalyFlag = true;
                anomalyReason = "RAPID_SCAN_ANOMALY (Potential Automated Activity)";
            }
        }

        const riskProfile = {
            scanCount: logsCount,
            uniqueLocations: uniqueIps,
            anomalyDetected: anomalyFlag,
            anomalyReason: anomalyReason,
            trustScore: anomalyFlag ? 30 : (logsCount > 1 ? 85 : 100)
        };

        // Blockchain Verification (Ethereum/Hardhat)
        let isBlockchainVerified = false;
        const blockchain = await getContractInstance();

        if (blockchain) {
            try {
                const { contract } = blockchain;
                const productFromBC = await contract.verifyProduct(serialNumber);
                if (productFromBC.isRegistered) {
                    isBlockchainVerified = true;
                }
            } catch (bcErr) {
                console.log('Blockchain check failed:', bcErr.message);
            }
        }

        // Final response construction
        const status = anomalyFlag ? 'Suspicious Activity Detected' : (isBlockchainVerified ? 'Verified Original Product' : 'Partial Verification');
        
        await VerificationLog.create({ 
            serialNumber, 
            productId: product._id, 
            ipAddress, 
            status: status 
        });

        res.json({ 
            status, 
            product,
            blockchainVerified: isBlockchainVerified,
            riskProfile
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
