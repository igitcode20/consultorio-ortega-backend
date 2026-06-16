const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware'); 
const transporter = require('../config/mailer'); 

// 1. SOLICITAR UNA CITA (Pacientes)
router.post('/book', protect, async (expressReq, expressRes) => {
  try {
    const { specialty, date, time } = expressReq.body;
    const newAppointment = new Appointment({
      patientId: expressReq.user.id,
      specialty,
      date,
      time,
      status: 'pending'
    });
    await newAppointment.save();
    expressRes.status(201).json({ message: "Solicitud creada correctamente", appointment: newAppointment });
  } catch (err) {
    expressRes.status(500).json({ message: "Error", error: err.message });
  }
});

// 2. OBTENER TODAS LAS CITAS (Admin ve todas, Paciente ve las suyas)
router.get('/all', protect, async (expressReq, expressRes) => {
  try {
    if (expressReq.user.role === 'admin') {
      const appointments = await Appointment.find()
        .populate('patientId', 'name email')
        .sort({ date: 1, time: 1 });
      return expressRes.json(appointments);
    } 
    const myAppointments = await Appointment.find({ patientId: expressReq.user.id }).sort({ createdAt: -1 });
    expressRes.json(myAppointments);
  } catch (err) {
    expressRes.status(500).json({ message: "Error", error: err.message });
  }
});

// 3. CAMBIAR ESTADO Y ENVIAR EMAIL AL PACIENTE
router.put('/:id/status', protect, async (expressReq, expressRes) => {
  try {
    if (expressReq.user.role !== 'admin') {
      return expressRes.status(403).json({ message: "Acceso denegado." });
    }

    const { status } = expressReq.body; 
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      expressReq.params.id,
      { status },
      { new: true }
    ).populate('patientId', 'name email');

    if (!updatedAppointment) {
      return expressRes.status(404).json({ message: "No se encontró la cita." });
    }

    // 📬 Si la Doctora aprueba, se va el correo al instante
    if (status === 'confirmed' && updatedAppointment.patientId?.email) {
      
      // Formateador interno de hora militar a 12h (AM/PM) para el cuerpo del mensaje
      const formatTime12h = (timeStr) => {
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
      };

      const mailOptions = {
        from: `"Consultorio Médico Ortega" <${process.env.EMAIL_USER}>`,
        to: updatedAppointment.patientId.email,
        subject: '¡Tu cita médica ha sido Confirmada! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0084cc; text-align: center;">¡Hola, ${updatedAppointment.patientId.name}! 👋</h2>
            <p style="font-size: 1rem; line-height: 1.5; color: #334155; text-align: center;">
              Te informamos que tu solicitud de cita médica ha sido revisada y exitosamente <strong>Confirmada</strong>.
            </p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0084cc;">
              <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> ${updatedAppointment.specialty}</p>
              <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${updatedAppointment.date}</p>
              <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${formatTime12h(updatedAppointment.time)}</p>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; text-align: center;">
              Si deseas reprogramar o cancelar, por favor comunícate con el consultorio con anticipación.
            </p>
            <p style="font-weight: bold; color: #0084cc; text-align: center; margin-top: 25px;">
              Consultorio Médico Ortega & Castellón
            </p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("❌ Error enviando email de confirmación:", error);
        else console.log("📧 Email de confirmación enviado a:", updatedAppointment.patientId.email);
      });
    }

    expressRes.json({ message: "Estado actualizado", appointment: updatedAppointment });
  } catch (err) {
    expressRes.status(500).json({ message: "Error", error: err.message });
  }
});

// 4. OBTENER PACIENTES TOTALES
router.get('/users', protect, async (expressReq, expressRes) => {
  try {
    if (expressReq.user.role !== 'admin') return expressRes.status(403).json({ message: "Acceso denegado." });
    const patients = await User.find({ role: 'patient' }).select('name email');
    expressRes.json(patients);
  } catch (err) {
    expressRes.status(500).json({ message: "Error", error: err.message });
  }
});

module.exports = router;