const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/courses', courses);
app.use('/api/enrollments', enrollments);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

// Basic Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

module.exports = app;
