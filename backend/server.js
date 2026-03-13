const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ✅ All imports FIRST before using them
const pcRoutes = require('./routes/pcRoutes');
const printerRoutes = require('./routes/printerRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.send('Backend server is running'));

// ✅ Routes registered AFTER imports
app.use('/api/pcs', pcRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/departments', departmentRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));