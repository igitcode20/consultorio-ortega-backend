const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// 🔥 CORREGIDO: Importamos con llaves { } y extraemos "protect" que es tu función real del archivo
const { protect } = require('../middlewares/authMiddleware'); 

// 1. SOLICITAR UNA CITA (Para Pacientes)
// Cambiamos "authMiddleware" por "protect" para que coincida con tu archivo
router.post('/book', protect, async (expressReq, expressRes) => {
  try {
    const { specialty, date, time } = expressReq.body;
    
    const newAppointment = new Appointment({
      patientId: expressReq.user.id, // Tu middleware guarda los datos en req.user
      specialty,
      date,
      time,
      status: 'pending' // Por defecto se guarda como pendiente
    });

    await newAppointment.save();
    expressRes.status(201).json({ message: "Solicitud de cita creada correctamente", appointment: newAppointment });
  } catch (err) {
    expressRes.status(500).json({ message: "Error al solicitar la cita", error: err.message });
  }
});

// 2. OBTENER TODAS LAS CITAS (Para Pacientes y para la Doctora/Admin)
router.get('/all', protect, async (expressReq, expressRes) => {
  try {
    // Si quien consulta es la Doctora/Admin, le mandamos TODAS las citas con los datos de los pacientes
    if (expressReq.user.role === 'admin') {
      const appointments = await Appointment.find()
        .populate('patientId', 'name email')
        .sort({ date: 1, time: 1 });
      return expressRes.json(appointments);
    } 
    
    // Si es un Paciente normal, SOLO le mandamos sus propias solicitudes
    const myAppointments = await Appointment.find({ patientId: expressReq.user.id })
      .sort({ createdAt: -1 });
    expressRes.json(myAppointments);

  } catch (err) {
    expressRes.status(500).json({ message: "Error al obtener las citas", error: err.message });
  }
});

// 3. CAMBIAR ESTADO DE LA CITA (Solo la Doctora/Admin desde el Dashboard)
router.put('/:id/status', protect, async (expressReq, expressRes) => {
  try {
    // Validación de seguridad para que ningún paciente intercepte la ruta
    if (expressReq.user.role !== 'admin') {
      return expressRes.status(403).json({ message: "Acceso denegado. No tienes permisos de Administrador." });
    }

    const { status } = expressReq.body; // Recibe 'confirmed' o 'rejected'
    
    if (!['confirmed', 'rejected', 'pending'].includes(status)) {
      return expressRes.status(400).json({ message: "El estado proporcionado no es válido." });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      expressReq.params.id,
      { status },
      { new: true } // Retorna el documento modificado
    ).populate('patientId', 'name email');

    if (!updatedAppointment) {
      return expressRes.status(404).json({ message: "No se encontró la cita especificada." });
    }

    expressRes.json({ message: `Cita actualizada con éxito a: ${status}`, appointment: updatedAppointment });
  } catch (err) {
    expressRes.status(500).json({ message: "Error al actualizar el estado de la cita", error: err.message });
  }
});

// 4. OBTENER LISTA DE PACIENTES REGISTRADOS (Para las estadísticas del AdminDashboard)
router.get('/users', protect, async (expressReq, expressRes) => {
  try {
    if (expressReq.user.role !== 'admin') {
      return expressRes.status(403).json({ message: "Acceso denegado." });
    }
    // Filtramos para traer únicamente los usuarios con rol de paciente
    const patients = await User.find({ role: 'patient' }).select('name email');
    expressRes.json(patients);
  } catch (err) {
    expressRes.status(500).json({ message: "Error al obtener la lista de pacientes", error: err.message });
  }
});

module.exports = router;