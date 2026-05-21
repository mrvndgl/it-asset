const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { authMiddleware } = require('./AuthRoutes');

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ message: 'Admin access required' });
    next();
};

/**
 * @route  GET /api/tickets
 * @desc   Get tickets — admin gets all, staff gets own department + own name
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query = {
                department: req.user.department,
                submittedBy: req.user.name,
            };
        }
        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error('Get tickets error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  POST /api/tickets
 * @desc   Create a new ticket
 * @access Private
 */
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, category, priority, department } = req.body;

    if (!title?.trim() || !category || !priority || !department?.trim())
        return res.status(400).json({ message: 'Please provide all required fields' });

    try {
        const ticket = await Ticket.create({
            title: title.trim(),
            description: description?.trim() ?? '',
            category,
            priority,
            department: department.trim(),
            submittedBy: req.user.name,
            status: 'Open',
        });
        res.status(201).json(ticket);
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  PATCH /api/tickets/:id/status
 * @desc   Update ticket status — admin only
 * @access Admin
 */
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

    if (!validStatuses.includes(status))
        return res.status(400).json({ message: 'Invalid status' });

    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        console.error('Update ticket status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  DELETE /api/tickets/:id
 * @desc   Delete a ticket — admin only
 * @access Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json({ message: 'Ticket deleted' });
    } catch (err) {
        console.error('Delete ticket error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;