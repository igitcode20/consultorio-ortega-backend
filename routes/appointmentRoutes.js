// routes/appointmentRoutes.js

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create', protect, appointmentController.createAppointment);
router.get('/all', protect, appointmentController.getAllAppointments);
router.put('/:id/status', protect, appointmentController.updateAppointmentStatus);

module.exports = router;