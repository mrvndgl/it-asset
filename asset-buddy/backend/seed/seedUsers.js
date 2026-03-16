/**
 * Seed Script — creates exactly 2 IT personnel accounts
 * Run once: node seed/seedUsers.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the actual User model so the pre('save') hook handles hashing
const User = require('../models/User');

const IT_USERS = [
    {
        employeeId: 'IT001',
        name: 'Admin',
        email: 'admin@company.com',
        password: 'Admin@1234',
        role: 'admin',
    },
    {
        employeeId: 'IT002',
        name: 'IT Staff',
        email: 'staff@company.com',
        password: 'Staff@1234',
        role: 'user',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        for (const u of IT_USERS) {
            // Remove existing so we can re-seed cleanly
            await User.deleteOne({ employeeId: u.employeeId });

            // Use new User() + save() so pre('save') hook fires and hashes password ONCE
            const user = new User(u);
            await user.save();
            console.log(`Created ${u.employeeId} (${u.role})`);
        }

        console.log('\nSeeding complete.');
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();