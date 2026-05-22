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

const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ message: 'Admin access required' });
    next();
};

// ─── Auth Routes ─────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/login
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
                department: user.department,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  POST /api/auth/register
 * @desc   Disabled
 */
router.post('/register', (req, res) => {
    res.status(403).json({ message: 'Registration is not open. Contact your system administrator.' });
});

/**
 * @route  GET /api/auth/me
 */
router.get('/me', authMiddleware, (req, res) => {
    const { _id, employeeId, name, email, role, department } = req.user;
    res.json({ id: _id, employeeId, name, email, role, department });
});

/**
 * @route  PUT /api/auth/change-password
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
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── User Management Routes (Admin only) ─────────────────────────────────────

/**
 * @route  GET /api/auth/users
 * @desc   Get all users
 * @access Admin
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  POST /api/auth/users
 * @desc   Create a new user
 * @access Admin
 */
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, employeeId, password, department, role } = req.body;

    if (!name?.trim() || !employeeId?.trim() || !password?.trim() || !department?.trim())
        return res.status(400).json({ message: 'Please provide all required fields' });

    if (password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters' });

    try {
        const existing = await User.findOne({ employeeId: employeeId.trim().toUpperCase() });
        if (existing)
            return res.status(400).json({ message: 'Employee ID already exists' });

        const user = await User.create({
            name: name.trim(),
            employeeId: employeeId.trim().toUpperCase(),
            password,
            department: department.trim(),
            role: role || 'user',
            isActive: true,
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            employeeId: user.employeeId,
            department: user.department,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  PUT /api/auth/users/:id
 * @desc   Update a user
 * @access Admin
 */
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, department, role, isActive } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, department, role, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  DELETE /api/auth/users/:id
 * @desc   Delete a user
 * @access Admin
 */
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  PATCH /api/auth/users/:id/toggle-active
 * @desc   Toggle user active status
 * @access Admin
 */
router.patch('/users/:id/toggle-active', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isActive = !user.isActive;
        await user.save();
        res.json({ id: user._id, isActive: user.isActive });
    } catch (err) {
        console.error('Toggle active error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * @route  PATCH /api/auth/users/:id/reset-password
 * @desc   Admin resets a user's password
 * @access Admin    
 */
router.patch('/users/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword?.trim() || newPassword.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters' });

    try {
        const user = await User.findById(req.params.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save(); // pre('save') hook will hash it
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;