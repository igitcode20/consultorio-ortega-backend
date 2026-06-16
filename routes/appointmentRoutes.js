const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
// Asegúrate de importar tu middleware de autenticación (ej: verificar token)
const authMiddleware = require('../middleware/auth'); 

// 1. SOLICITAR UNA CITA (Pacientes)
router.post('/book', authMiddleware, async (expressReq, expressRes) => {
  try {
    const { specialty, date, time } = expressReq.body;
    
    const newAppointment = new Appointment({
      patientId: expressReq.user.id, // Obtenido del token por el middleware
      specialty,
      date,
      time,
      status: 'pending' // Forzado a pendiente al crearse
    });

    await newAppointment.save();
    expressRes.status(201).json({ message: "Solicitud de cita creada correctamente", appointment: newAppointment });
  } catch (err) {
    expressRes.status(500).json({ message: "Error al solicitar la cita", error: err.message });
  }
});

// 2. OBTENER TODAS LAS CITAS (Para el Admin y el Historial del Paciente)
router.get('/all', authMiddleware, async (expressReq, expressRes) => {
  try {
    // Si es Administrador, le mandamos TODAS las citas con los nombres de los pacientes
    if (expressReq.user.role === 'admin') {
      const appointments = await Appointment.find()
        .populate('patientId', 'name email')
        .sort({ date: 1, time: 1 });
      return expressRes.json(appointments);
    } 
    
    // Si es un Paciente normal, SOLO le mandamos sus propias citas
    const myAppointments = await Appointment.find({ patientId: expressReq.user.id })
      .sort({ createdAt: -1 });
    expressRes.json(myAppointments);

  } catch (err) {
    expressRes.status(500).json({ message: "Error al obtener las citas", error: err.message });
  }
});

// 3. 🔥 NUEVA RUTA: CAMBIAR ESTADO DE LA CITA (Solo la Doctora/Admin)
router.put('/:id/status', authMiddleware, async (expressReq, expressRes) => {
  try {
    // Protección de seguridad en el backend
    if (expressReq.user.role !== 'admin') {
      return expressRes.status(403).json({ message: "No tenés permisos de Administrador para hacer esto, mae." });
    }

    const { status } = expressReq.body; // Viene 'confirmed' o 'rejected' desde el frontend
    
    if (!['confirmed', 'rejected', 'pending'].includes(status)) {
      return expressRes.status(400).json({ message: "Estado no válido." });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      expressReq.params.id,
      { status },
      { new: true } // Para que devuelva la cita ya modificada
    ).populate('patientId', 'name email');

    if (!updatedAppointment) {
      return expressRes.status(404).json({ message: "No se encontró la cita." });
    }

    expressRes.json({ message: `Cita actualizada a: ${status}`, appointment: updatedAppointment });
  } catch (err) {
    expressRes.status(500).json({ message: "Error al actualizar la cita", error: err.message });
  }
});

// 4. OBTENER LISTA DE PACIENTES TOTALES (Para las estadísticas del Dashboard)
router.get('/users', authMiddleware, async (expressReq, expressRes) => {
  try {
    if (expressReq.user.role !== 'admin') {
      return expressRes.status(403).json({ message: "Acceso denegado." });
    }
    // Buscamos solo los usuarios que sean pacientes
    const patients = await User.find({ role: 'patient' }).select('name email');
    expressRes.json(patients);
  } catch (err) {
    expressRes.status(500).json({ message: "Error al obtener pacientes", error: err.message });
  }
});

module.exports = router;