const Appointment = require('../models/Appointment');
const User = require('../models/User');

const triggerWhatsAppNotification = async (appointment, patientName) => {
    console.log(`\n📱 [WHATSAPP ADMIN]: ¡Nueva Cita Agendada!\nPaciente: ${patientName}\nEspecialidad: ${appointment.specialty}\nFecha: ${appointment.date}\nHora: ${appointment.time}\n`);
};

exports.bookAppointment = async (req, res) => {
    try {
        const { date, time, specialty } = req.body;
        const patient = await User.findById(req.user.id);

        const appointment = await Appointment.create({
            patientId: req.user.id, date, time, specialty
        });

        await triggerWhatsAppNotification(appointment, patient.name);
        res.status(201).json({ message: 'Cita guardada y notificada a WhatsApp', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('patientId', 'name email').sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        const updatedApp = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedApp) return res.status(404).json({ message: 'Cita no encontrada' });

        res.json({ message: `Cita marcada como ${status}`, updatedApp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await Appointment.deleteMany({ patientId: req.params.id });
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Usuario y sus citas asociados eliminados con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};