const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        comment: { type: String, required: true, trim: true },
        postedBy: { type: String, required: true },
        role: { type: String, enum: ['admin', 'user'], default: 'user' },
    },
    { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
    {
        ticketId: { type: String, unique: true },
        title: { type: String, required: [true, 'Title is required'], trim: true },
        description: { type: String, trim: true, default: '' },
        category: {
            type: String,
            enum: ['Hardware', 'Software', 'Network', 'Account', 'Other'],
            required: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },
        department: { type: String, required: true, trim: true },
        submittedBy: { type: String, required: true, trim: true },
        comments: [commentSchema],
    },
    { timestamps: true }
);

ticketSchema.pre('save', async function () {
    if (this.ticketId) return;
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(4, '0')}`;
});

module.exports = mongoose.model('Ticket', ticketSchema);