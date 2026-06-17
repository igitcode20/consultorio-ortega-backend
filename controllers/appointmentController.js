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
        if (!to) {
            console.log('⚠️ No hay email para enviar');
            return false;
        }

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
        console.error(`❌ Error enviando correo a ${to}:`, error.message);
        return false;
    }
};

// 📝 CREAR CITA
exports.createAppointment = async (req, res) => {
    try {
        console.log('📝 Creando cita...');
        console.log('📝 Body:', req.body);
        console.log('📝 User ID:', req.user?._id || req.user?.id);
        
        const { specialty, date, time } = req.body;
        const userId = req.user._id || req.user.id;
        
        // Validar campos obligatorios
        if (!specialty || !date || !time) {
            return res.status(400).json({ 
                message: '❌ Todos los campos son obligatorios: specialty, date, time' 
            });
        }

        // Buscar paciente
        const patient = await User.findById(userId);
        if (!patient) {
            return res.status(404).json({ message: '❌ Paciente no encontrado' });
        }

        console.log(`👤 Paciente: ${patient.name} (${patient.email})`);

        // Crear cita
        const appointment = await Appointment.create({
            patientId: userId,
            specialty,
            date,
            time,
            status: 'pending'
        });

        console.log(`✅ Cita creada: ${appointment._id}`);

        // Notificación en consola
        console.log(`
📱 NUEVA CITA AGENDADA!
👤 Paciente: ${patient.name}
📧 Email: ${patient.email || 'No disponible'}
📱 Teléfono: ${patient.phone || 'No disponible'}
🩺 Especialidad: ${appointment.specialty}
📅 Fecha: ${appointment.date}
⏰ Hora: ${appointment.time}
        `);

        res.status(201).json({ 
            message: '✨ Solicitud creada con éxito. Espera la confirmación del médico.', 
            appointment 
        });

    } catch (error) {
        console.error('❌ Error en createAppointment:', error);
        res.status(500).json({ 
            message: 'Error al guardar la cita', 
            error: error.message 
        });
    }
};

// 📋 OBTENER TODAS LAS CITAS
exports.getAllAppointments = async (req, res) => {
    try {
        console.log('📋 Obteniendo citas...');
        
        if (req.user.role === 'admin') {
            const appointments = await Appointment.find()
                .populate('patientId', 'name email phone department')
                .sort({ date: 1, time: 1 });
            return res.json(appointments);
        }
        
        const myAppointments = await Appointment.find({ 
            patientId: req.user._id || req.user.id 
        }).sort({ createdAt: -1 });
        
        res.json(myAppointments);
    } catch (error) {
        console.error('❌ Error en getAllAppointments:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ ACTUALIZAR ESTADO DE LA CITA
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`📝 Actualizando cita ${req.params.id} a: ${status}`);

        if (!['pending', 'confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: '❌ Estado no válido' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        ).populate('patientId', 'name email phone');

        if (!appointment) {
            return res.status(404).json({ message: '❌ Cita no encontrada' });
        }

        console.log(`✅ Cita ${appointment._id} actualizada a ${status}`);

        // 🔥 ENVIAR CORREO DE CONFIRMACIÓN
        if (status === 'confirmed' && appointment.patientId && appointment.patientId.email) {
            try {
                const patient = appointment.patientId;
                const template = getAppointmentConfirmationTemplate(patient, appointment);
                
                await sendEmail(
                    patient.email,
                    template.subject,
                    template.html
                );
                
                console.log(`📧 Correo de confirmación enviado a ${patient.email}`);
            } catch (emailError) {
                console.error('❌ Error enviando correo:', emailError.message);
                // No fallamos la operación si el correo falla
            }
        }

        res.json({ 
            message: `✅ Cita marcada como ${status}`,
            appointment 
        });

    } catch (error) {
        console.error('❌ Error en updateAppointmentStatus:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al actualizar el estado de la cita'
        });
    }
};