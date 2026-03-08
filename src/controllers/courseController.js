const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private (Authorized users)
exports.getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Only admin/instructor - for this lab admin for deletion, we'll let users create for simplicity or admin only)
exports.createCourse = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.instructorId = req.user.id;

        const course = await Course.create(req.body);

        // Emit socket event (we will handle this via global io if possible)
        if (req.app.get('io')) {
            req.app.get('io').emit('course:new', course);
        }

        res.status(201).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Make sure user is course owner or admin
        if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only according to requirements)
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        await course.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
