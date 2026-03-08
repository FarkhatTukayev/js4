const Enrollment = require('../models/Enrollment');

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private
exports.getEnrollments = async (req, res, next) => {
    try {
        let query;
        // If not admin, only see own enrollments
        if (req.user.role !== 'admin') {
            query = Enrollment.find({ userId: req.user.id }).populate('courseId');
        } else {
            query = Enrollment.find().populate('courseId').populate('userId');
        }

        const enrollments = await query;
        res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new enrollment
// @route   POST /api/enrollments
// @access  Private
exports.createEnrollment = async (req, res, next) => {
    try {
        req.body.userId = req.user.id;

        // Check if already enrolled
        const existing = await Enrollment.findOne({
            userId: req.user.id,
            courseId: req.body.courseId
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        const enrollment = await Enrollment.create(req.body);

        res.status(201).json({ success: true, data: enrollment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
    try {
        let enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        if (enrollment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        enrollment = await Enrollment.findByIdAndUpdate(req.params.id, {
            progress: req.body.progress
        }, {
            new: true,
            runValidators: true
        });

        // Emit socket event to the user's specific room
        if (req.app.get('io')) {
            req.app.get('io').to(req.user.id.toString()).emit('enrollment:progress', enrollment);
        }

        res.status(200).json({ success: true, data: enrollment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
