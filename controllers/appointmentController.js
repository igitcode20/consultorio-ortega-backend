// controllers/appointmentController.js

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const transporter = require('../config/mailer');
const { 
    getAppointmentConfirmationTemplate,
    getReminderTemplate 
} = require('../utils/emailTemplates');

// 📧 Función para enviar correo
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Consultorio Ortega Castellón" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado a ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando correo a ${to}:`, error);
        return false;
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { specialty, date, time } = req.body;
        const userId = req.user._id || req.user.id;
        
        const patient = await User.findById(userId);
        if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

        const appointment = await Appointment.create({
            patientId: userId,
            specialty,
            date,
            time,
            status: 'pending'
        });

        // Notificación al admin en consola
        console.log(`\n📱 Nueva Cita Agendada!\nPaciente: ${patient.name}\nTeléfono: ${patient.phone}\nEmail: ${patient.email}\nEspecialidad: ${appointment.specialty}\nFecha: ${appointment.date}\nHora: ${appointment.time}\n`);

        res.status(201).json({ 
            message: '✨ Solicitud creada con éxito. Espera la confirmación del médico.', 
            appointment 
        });
    } catch (error) {
        console.error("Error en createAppointment:", error);
        res.status(500).json({ message: "Error al guardar la cita", error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        ).populate('patientId', 'name email phone');

        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // 🔥 Si la cita es confirmada, enviar correo
        if (status === 'confirmed' && appointment.patientId) {
            const patient = appointment.patientId;
            
            // Enviar correo de confirmación
            const template = getAppointmentConfirmationTemplate(patient, appointment);
            const emailSent = await sendEmail(
                patient.email, 
                template.subject, 
                template.html
            );
            
            if (emailSent) {
                console.log(`📧 Correo de confirmación enviado a ${patient.email}`);
            }
        }

        res.json({ 
            message: `✅ Cita marcada como ${status}`,
            appointment 
        });
    } catch (error) {
        console.error('Error en updateAppointmentStatus:', error);
        res.status(500).json({ error: error.message });
    }
};

// 📋 Obtener todas las citas (admin)
exports.getAllAppointments = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const appointments = await Appointment.find()
                .populate('patientId', 'name email phone department')
                .sort({ date: 1, time: 1 });
            return res.json(appointments);
        }
        const myAppointments = await Appointment.find({ patientId: req.user._id || req.user.id })
            .sort({ createdAt: -1 });
        res.json(myAppointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};