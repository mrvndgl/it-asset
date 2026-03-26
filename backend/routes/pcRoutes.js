const express = require('express');
const PC = require('../models/PC');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const pcs = await PC.find();
        res.json(pcs.map(pc => ({ ...pc.toObject(), id: pc._id.toString() })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const pc = new PC(req.body);
        const saved = await pc.save();
        res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await PC.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!updated) return res.status(404).json({ error: 'PC not found' });
        res.json({ ...updated.toObject(), id: updated._id.toString() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await PC.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'PC not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;