// controllers/appointmentController.js

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const transporter = require('../config/mailer');

// 📧 Función para enviar correo
const sendEmail = async (to, subject, html) => {
    try {
        if (!to) return false;
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
        console.error(`❌ Error enviando correo:`, error.message);
        return false;
    }
};

// 📝 Formatear hora
const formatTime = (time) => {
    if (!time) return 'No especificada';
    let [hours, minutes] = time.split(':');
    let hrs = parseInt(hours, 10);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    return `${hrs}:${minutes} ${ampm}`;
};

// 📧 Plantilla de confirmación
const getConfirmationTemplate = (patient, appointment) => {
    const timeFormatted = formatTime(appointment.time);
    return {
        subject: '✅ ¡Tu Cita Médica ha sido Confirmada!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #22c55e; border-radius: 12px;">
                <h2 style="color: #22c55e; text-align: center;">✅ Cita Confirmada</h2>
                <p>Hola <strong>${patient.name}</strong>,</p>
                <p>Tu cita médica ha sido <strong style="color: #22c55e;">confirmada</strong>.</p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>🩺 Especialidad:</strong> ${appointment.specialty}</p>
                    <p><strong>📅 Fecha:</strong> ${appointment.date}</p>
                    <p><strong>⏰ Hora:</strong> ${timeFormatted}</p>
                </div>
                <p><strong>📍 Ubicación:</strong> Juigalpa Chontales, Barrio San Antonio</p>
                <p><strong>📞 Teléfono:</strong> 84334235</p>
                <hr>
                <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 Consultorio Ortega Castellón</p>
            </div>
        `
    };
};

// ============================================
// 📝 CREAR CITA
// ============================================
exports.createAppointment = async (req, res) => {
    try {
        console.log('📝 Creando cita...');
        
        const { specialty, date, time } = req.body;
        const userId = req.user._id || req.user.id;
        
        if (!specialty || !date || !time) {
            return res.status(400).json({ 
                message: '❌ Todos los campos son obligatorios' 
            });
        }

        const patient = await User.findById(userId).maxTimeMS(5000);
        if (!patient) {
            return res.status(404).json({ message: '❌ Paciente no encontrado' });
        }

        console.log(`👤 Paciente: ${patient.name}`);

        const appointment = await Appointment.create({
            patientId: userId,
            specialty,
            date,
            time,
            status: 'pending'
        });

        console.log(`✅ Cita creada: ${appointment._id}`);

        res.status(201).json({ 
            message: '✨ Solicitud creada con éxito', 
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

// ============================================
// 📋 OBTENER CITAS
// ============================================
exports.getAllAppointments = async (req, res) => {
    try {
        console.log('📋 Obteniendo citas...');
        
        if (req.user.role === 'admin') {
            const appointments = await Appointment.find()
                .populate('patientId', 'name email phone department')
                .sort({ date: 1, time: 1 })
                .lean()
                .maxTimeMS(10000);
            
            return res.json(appointments);
        }
        
        const myAppointments = await Appointment.find({ 
            patientId: req.user._id || req.user.id 
        })
        .sort({ createdAt: -1 })
        .lean()
        .maxTimeMS(5000);
        
        res.json(myAppointments);
    } catch (error) {
        console.error('❌ Error en getAllAppointments:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ✅ ACTUALIZAR ESTADO
// ============================================
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;
        
        console.log(`📝 Actualizando cita ${appointmentId} a: ${status}`);

        if (!['pending', 'confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: '❌ Estado no válido' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId, 
            { status }, 
            { 
                new: true,
                runValidators: true,
                maxTimeMS: 5000
            }
        ).populate('patientId', 'name email phone');

        if (!appointment) {
            return res.status(404).json({ message: '❌ Cita no encontrada' });
        }

        console.log(`✅ Cita ${appointment._id} actualizada a ${status}`);

        // Enviar correo si es confirmada
        if (status === 'confirmed' && appointment.patientId?.email) {
            try {
                const patient = appointment.patientId;
                const template = getConfirmationTemplate(patient, appointment);
                await sendEmail(patient.email, template.subject, template.html);
                console.log(`📧 Correo enviado a ${patient.email}`);
            } catch (emailError) {
                console.error('❌ Error enviando correo:', emailError.message);
            }
        }

        res.json({ 
            message: `✅ Cita ${status === 'confirmed' ? 'confirmada' : status === 'rejected' ? 'rechazada' : 'actualizada'}`,
            appointment 
        });

    } catch (error) {
        console.error('❌ Error en updateAppointmentStatus:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al actualizar el estado'
        });
    }
};