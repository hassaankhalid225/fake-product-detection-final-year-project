const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true },
    productName: { type: String },
    details: { type: String, required: true },
    ipAddress: { type: String },
    status: { type: String, enum: ['Pending', 'Investigating', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
