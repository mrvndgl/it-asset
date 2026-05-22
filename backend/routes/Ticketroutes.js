const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { authMiddleware } = require('./AuthRoutes');

const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ message: 'Admin access required' });
    next();
};

/**
 * @route  GET /api/tickets
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query = { department: req.user.department, submittedBy: req.user.name };
        }
        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error('Get tickets error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  GET /api/tickets/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        console.error('Get ticket error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  POST /api/tickets
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
 * @access Admin
 */
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status))
        return res.status(400).json({ message: 'Invalid status' });
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  POST /api/tickets/:id/comments
 * @access Both admin and staff
 */
router.post('/:id/comments', authMiddleware, async (req, res) => {
    const { comment } = req.body;
    if (!comment?.trim())
        return res.status(400).json({ message: 'Comment cannot be empty' });
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.comments.push({
            comment: comment.trim(),
            postedBy: req.user.name,
            role: req.user.role,
        });
        await ticket.save();
        res.status(201).json(ticket.comments[ticket.comments.length - 1]);
    } catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route  DELETE /api/tickets/:id
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