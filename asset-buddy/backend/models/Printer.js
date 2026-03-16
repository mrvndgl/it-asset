const mongoose = require('mongoose');
const printerSchema = new mongoose.Schema({
    printerName: { type: String, required: true },
    printerModel: { type: String, required: true },
    tonerCartridge: { type: String, default: '' },
    drumUnit: { type: String, default: '' },
    department: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    password: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
}, { timestamps: true });
module.exports = mongoose.model('Printer', printerSchema);