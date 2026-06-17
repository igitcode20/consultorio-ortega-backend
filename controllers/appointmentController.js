// controllers/appointmentController.js

const Appointment = require('../models/Appointment');
const User = require('../models/User');

// 📧 Función para enviar correo (SIMPLIFICADA)
const sendSimpleEmail = async (to, subject, html) => {
    try {
        // Si no hay destinatario, salir
        if (!to) {
            console.log('⚠️ No hay email para enviar');
            return false;
        }

        // Importar transporter solo cuando se necesite
        const transporter = require('../config/mailer');
        
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

// 📝 Función para formatear hora
const formatTime = (time) => {
    if (!time) return 'No especificada';
    let [hours, minutes] = time.split(':');
    let hrs = parseInt(hours, 10);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    return `${hrs}:${minutes} ${ampm}`;
};

// 📧 Plantilla de confirmación (SIMPLIFICADA)
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

// 📝 CREAR CITA - VERSIÓN SIMPLIFICADA Y SEGURA
exports.createAppointment = async (req, res) => {
    try {
        console.log('📝 Creando cita...');
        
        const { specialty, date, time } = req.body;
        const userId = req.user._id || req.user.id;
        
        // Validar campos obligatorios
        if (!specialty || !date || !time) {
            return res.status(400).json({ 
                message: '❌ Todos los campos son obligatorios' 
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

        // Respuesta exitosa
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

// ✅ ACTUALIZAR ESTADO DE LA CITA - CON ENVÍO DE CORREO
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`📝 Actualizando cita ${req.params.id} a: ${status}`);

        // Validar estado
        if (!['pending', 'confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: '❌ Estado no válido' });
        }

        // Actualizar cita
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
                const template = getConfirmationTemplate(patient, appointment);
                
                await sendSimpleEmail(
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