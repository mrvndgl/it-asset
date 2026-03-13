const express = require('express');
const Printer = require('../models/Printer');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const printers = await Printer.find();
        res.json(printers.map(p => ({ ...p.toObject(), id: p._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const printer = new Printer(req.body);
        const saved = await printer.save();
        res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Printer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Printer not found' });
        res.json({ ...updated.toObject(), id: updated._id.toString() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Printer.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Printer not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
