const express = require('express');
const Department = require('../models/Department');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments.map(d => ({ ...d.toObject(), id: d._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const dept = new Department(req.body);
        const saved = await dept.save();
        res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Department not found' });
        res.json({ ...updated.toObject(), id: updated._id.toString() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Department.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Department not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;