const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// Submit a new report (Consumer)
router.post('/', async (req, res) => {
    try {
        const { serialNumber, productName, details } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        const newReport = new Report({
            serialNumber,
            productName,
            details,
            ipAddress
        });

        await newReport.save();
        res.status(201).json({ msg: 'Report submitted successfully', report: newReport });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all reports (Admin)
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
