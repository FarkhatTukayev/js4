const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All course routes are protected
router.use(protect);

router
    .route('/')
    .get(getCourses)
    .post(createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(authorize('admin'), deleteCourse);

module.exports = router;
