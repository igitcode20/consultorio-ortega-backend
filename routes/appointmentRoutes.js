const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware'); 
const transporter = require('../config/mailer'); 

// 1. SOLICITAR UNA CITA (Ahora usando /create para coincidir con el Front)
router.post('/create', protect, async (req, res) => {
  try {
    const { specialty, date, time } = req.body;
    const newAppointment = new Appointment({
      patientId: req.user.id,
      specialty,
      date,
      time,
      status: 'pending'
    });
    await newAppointment.save();
    res.status(201).json({ message: "✨ Solicitud creada correctamente", appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ message: "Error al crear la cita", error: err.message });
  }
});

// 2. OBTENER TODAS LAS CITAS
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const appointments = await Appointment.find()
        .populate('patientId', 'name email')
        .sort({ date: 1, time: 1 });
      return res.json(appointments);
    } 
    const myAppointments = await Appointment.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    res.json(myAppointments);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener citas", error: err.message });
  }
});

// 3. CAMBIAR ESTADO Y ENVIAR EMAIL
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Acceso denegado." });

    const { status } = req.body; 
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patientId', 'name email');

    if (!updatedAppointment) return res.status(404).json({ message: "Cita no encontrada." });

    if (status === 'confirmed' && updatedAppointment.patientId?.email) {
      const formatTime12h = (t) => {
        let [h, m] = t.split(':');
        h = parseInt(h, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${m} ${ampm}`;
      };

      const mailOptions = {
        from: `"Consultorio Médico Ortega" <${process.env.EMAIL_USER}>`,
        to: updatedAppointment.patientId.email,
        subject: '¡Tu cita médica ha sido Confirmada! 🎉',
        html: `<div><h2>¡Hola, ${updatedAppointment.patientId.name}!</h2><p>Tu cita ha sido confirmada.</p></div>`
      };
      transporter.sendMail(mailOptions);
    }
    res.json({ message: "Estado actualizado", appointment: updatedAppointment });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar", error: err.message });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Acceso denegado." });
    const patients = await User.find({ role: 'patient' }).select('name email');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

module.exports = router;