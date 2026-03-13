const mongoose = require('mongoose');
const pcSchema = new mongoose.Schema({
    employeeName: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    serialNumber: { type: String, required: true },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    ipAddress: { type: String, default: '' },
    macAddress: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    dateOfIssue: { type: String, default: '' },
    location: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    status: { type: String, enum: ['assigned', 'available', 'maintenance'], default: 'available' },
}, { timestamps: true });
module.exports = mongoose.model('PC', pcSchema);