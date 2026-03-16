const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
        return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(
            authHeader.split(' ')[1],
            process.env.JWT_SECRET
        );
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate employee and return JWT
 * @access Public
 */
router.post('/login', async (req, res) => {
    const { employeeId, password } = req.body;

    if (!employeeId?.trim() || !password?.trim())
        return res.status(400).json({ message: 'Please provide Employee ID and password' });

    try {
        const user = await User.findOne({
            employeeId: employeeId.trim().toUpperCase(),
            isActive: true,
        }).select('+password');

        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        res.json({
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                employeeId: user.employeeId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  POST /api/auth/register
 * @desc   Disabled — accounts are managed via seed script only
 * @access Blocked
 */
router.post('/register', (req, res) => {
    res.status(403).json({ message: 'Registration is not open. Contact your system administrator.' });
});

/**
 * @route  GET /api/auth/me
 * @desc   Return the currently authenticated user
 * @access Private
 */
router.get('/me', authMiddleware, (req, res) => {
    const { _id, employeeId, name, email, role } = req.user;
    res.json({ id: _id, employeeId, name, email, role });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware; // export for use in other routes


/**
 * @route  PUT /api/auth/change-password
 * @desc   Change password for the logged-in user
 * @access Private
 */
router.put('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword?.trim() || !newPassword?.trim())
        return res.status(400).json({ message: 'Please provide current and new password' });

    if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });

    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.matchPassword(currentPassword)))
            return res.status(401).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save(); // pre('save') hook will hash it
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});