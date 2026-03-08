const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
