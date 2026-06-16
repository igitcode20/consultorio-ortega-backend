const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Notificación interna (podes expandirla luego a una API de WhatsApp real)
const triggerWhatsAppNotification = async (appointment, patientName) => {
    console.log(`\n📱 [WHATSAPP ADMIN]: ¡Nueva Cita Agendada!\nPaciente: ${patientName}\nEspecialidad: ${appointment.specialty}\nFecha: ${appointment.date}\nHora: ${appointment.time}\n`);
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

        await triggerWhatsAppNotification(appointment, patient.name);
        res.status(201).json({ message: '✨ Solicitud creada con éxito', appointment });
    } catch (error) {
        console.error("Error en createAppointment:", error);
        res.status(500).json({ message: "Error al guardar la cita", error: error.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const appointments = await Appointment.find().populate('patientId', 'name email').sort({ date: 1, time: 1 });
            return res.json(appointments);
        }
        const myAppointments = await Appointment.find({ patientId: req.user._id || req.user.id }).sort({ createdAt: -1 });
        res.json(myAppointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedApp = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('patientId', 'name email');
        
        if (!updatedApp) return res.status(404).json({ message: 'Cita no encontrada' });
        
        res.json({ message: `Cita marcada como ${status}`, updatedApp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};