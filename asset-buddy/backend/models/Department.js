const mongoose = require('mongoose');
const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, default: '' },
    pcCount: { type: Number, default: 0 },
    printerCount: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Department', departmentSchema);
