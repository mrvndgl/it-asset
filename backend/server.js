const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const pcRoutes = require('./routes/pcRoutes');
const printerRoutes = require('./routes/printerRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/AuthRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'https://it-asset-mu.vercel.app'], // allow both common frontend ports
    credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { dbName: 'asset-buddy' })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.send('Backend server is running'));

// Routes
app.use('/api/pcs', pcRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));