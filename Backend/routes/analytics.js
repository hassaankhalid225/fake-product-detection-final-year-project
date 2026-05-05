const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const VerificationLog = require('../models/VerificationLog');
const Report = require('../models/Report');

// Get overview stats
router.get('/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalVerifications = await VerificationLog.countDocuments();
        const fakeAttempts = await VerificationLog.countDocuments({ status: { $ne: 'Verified Original Product' } });
        const totalReports = await Report.countDocuments();

        // recent logs
        const recentLogs = await VerificationLog.find().sort({ createdAt: -1 }).limit(10).populate('productId', 'productName');
        const recentReports = await Report.find().sort({ createdAt: -1 }).limit(5);

        res.json({ totalProducts, totalVerifications, fakeAttempts, totalReports, recentLogs, recentReports });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
