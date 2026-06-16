const express = require('express');
const router = express.Router();
const { bookAppointment, getAllAppointments, updateAppointmentStatus, getAllUsers, deleteUser } = require('../controllers/appointmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/book', protect, bookAppointment); 
router.get('/all', protect, admin, getAllAppointments); 
router.put('/:id/status', protect, admin, updateAppointmentStatus); 
router.get('/users', protect, admin, getAllUsers); 
router.delete('/users/:id', protect, admin, deleteUser); 

module.exports = router;