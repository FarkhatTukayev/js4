const express = require('express');
const {
    getEnrollments,
    createEnrollment,
    updateProgress
} = require('../controllers/enrollmentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getEnrollments)
    .post(createEnrollment);

router.put('/:id/progress', updateProgress);

module.exports = router;
