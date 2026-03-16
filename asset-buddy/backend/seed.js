const mongoose = require('mongoose');
require('dotenv').config();

const PC = require('./models/PC');
const Printer = require('./models/Printer');
const Department = require('./models/Department');

const pcs = [
    { employeeName: "Ahmad Hassan", employeeId: "EMP001", serialNumber: "SN-2024-001", manufacturer: "Dell", model: "Latitude 5540", ipAddress: "192.168.1.101", macAddress: "AA:BB:CC:DD:EE:01", ram: "16GB", storage: "512GB SSD", dateOfIssue: "2024-01-15", location: "Building A, Floor 3", assignedTo: "Engineering", status: "assigned" },
    { employeeName: "Sara Ahmed", employeeId: "EMP002", serialNumber: "SN-2024-002", manufacturer: "HP", model: "EliteBook 840 G10", ipAddress: "192.168.1.102", macAddress: "AA:BB:CC:DD:EE:02", ram: "32GB", storage: "1TB SSD", dateOfIssue: "2024-02-20", location: "Building A, Floor 2", assignedTo: "Marketing", status: "assigned" },
    { employeeName: "Mohammed Ali", employeeId: "EMP003", serialNumber: "SN-2024-003", manufacturer: "Lenovo", model: "ThinkPad X1 Carbon", ipAddress: "192.168.1.103", macAddress: "AA:BB:CC:DD:EE:03", ram: "16GB", storage: "512GB SSD", dateOfIssue: "2024-03-10", location: "Building B, Floor 1", assignedTo: "Finance", status: "assigned" },
    { employeeName: "Fatima Khan", employeeId: "EMP004", serialNumber: "SN-2024-004", manufacturer: "Dell", model: "OptiPlex 7010", ipAddress: "192.168.1.104", macAddress: "AA:BB:CC:DD:EE:04", ram: "8GB", storage: "256GB SSD", dateOfIssue: "2024-01-25", location: "Building A, Floor 1", assignedTo: "HR", status: "assigned" },
    { employeeName: "Unassigned", employeeId: "-", serialNumber: "SN-2024-005", manufacturer: "HP", model: "ProDesk 400 G9", ipAddress: "192.168.1.105", macAddress: "AA:BB:CC:DD:EE:05", ram: "16GB", storage: "512GB SSD", dateOfIssue: "2024-04-01", location: "IT Storage", assignedTo: "-", status: "available" },
    { employeeName: "Omar Syed", employeeId: "EMP006", serialNumber: "SN-2024-006", manufacturer: "Lenovo", model: "ThinkCentre M70q", ipAddress: "192.168.1.106", macAddress: "AA:BB:CC:DD:EE:06", ram: "16GB", storage: "512GB SSD", dateOfIssue: "2023-11-15", location: "Building B, Floor 2", assignedTo: "Operations", status: "maintenance" },
    { employeeName: "Aisha Malik", employeeId: "EMP007", serialNumber: "SN-2024-007", manufacturer: "Dell", model: "Latitude 7440", ipAddress: "192.168.1.107", macAddress: "AA:BB:CC:DD:EE:07", ram: "32GB", storage: "1TB SSD", dateOfIssue: "2024-05-12", location: "Building C, Floor 1", assignedTo: "Sales", status: "assigned" },
    { employeeName: "Unassigned", employeeId: "-", serialNumber: "SN-2024-008", manufacturer: "HP", model: "EliteDesk 800 G9", ipAddress: "192.168.1.108", macAddress: "AA:BB:CC:DD:EE:08", ram: "16GB", storage: "256GB SSD", dateOfIssue: "2024-06-01", location: "IT Storage", assignedTo: "-", status: "available" },
];

const printers = [
    { printerName: "ENG-PRN-01", printerModel: "HP LaserJet Pro M404dn", tonerCartridge: "CF258A", drumUnit: "CF232A", department: "Engineering", ipAddress: "192.168.2.201", password: "admin123", location: "Building A, Floor 3", status: "active" },
    { printerName: "MKT-PRN-01", printerModel: "Canon imageCLASS MF445dw", tonerCartridge: "Canon 057", drumUnit: "Canon 057 Drum", department: "Marketing", ipAddress: "192.168.2.202", password: "admin456", location: "Building A, Floor 2", status: "active" },
    { printerName: "FIN-PRN-01", printerModel: "Brother HL-L6200DW", tonerCartridge: "TN-850", drumUnit: "DR-820", department: "Finance", ipAddress: "192.168.2.203", password: "admin789", location: "Building B, Floor 1", status: "active" },
    { printerName: "HR-PRN-01", printerModel: "HP LaserJet Enterprise M507dn", tonerCartridge: "CF289A", drumUnit: "CF289A Drum", department: "HR", ipAddress: "192.168.2.204", password: "hr_admin", location: "Building A, Floor 1", status: "maintenance" },
    { printerName: "OPS-PRN-01", printerModel: "Xerox VersaLink B400", tonerCartridge: "106R03580", drumUnit: "101R00554", department: "Operations", ipAddress: "192.168.2.205", password: "ops_admin", location: "Building B, Floor 2", status: "active" },
    { printerName: "OPS-PRN-02", printerModel: "HP Color LaserJet Pro M255dw", tonerCartridge: "W2110A", drumUnit: "W2120A", department: "Operations", ipAddress: "192.168.2.206", password: "ops_admin2", location: "Building B, Floor 2", status: "inactive" },
];

const departments = [
    { name: "Engineering", location: "Building A, Floor 3", pcCount: 45, printerCount: 3 },
    { name: "Marketing", location: "Building A, Floor 2", pcCount: 22, printerCount: 2 },
    { name: "Finance", location: "Building B, Floor 1", pcCount: 18, printerCount: 2 },
    { name: "HR", location: "Building A, Floor 1", pcCount: 12, printerCount: 1 },
    { name: "Operations", location: "Building B, Floor 2", pcCount: 30, printerCount: 4 },
    { name: "Sales", location: "Building C, Floor 1", pcCount: 25, printerCount: 2 },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await PC.deleteMany({});
    await Printer.deleteMany({});
    await Department.deleteMany({});
    console.log('All data cleared');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});