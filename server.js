// server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const app = express();

// Middlewares
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔌 Conectado exitosamente a MongoDB Atlas'))
    .catch(err => console.error('❌ Error crítico al conectar MongoDB:', err));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const postRoutes = require('./routes/postRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Tarea programada para recordatorios de citas
const Appointment = require('./models/Appointment');
const transporter = require('./config/mailer');
const { getReminderTemplate } = require('./utils/emailTemplates');

cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Escaneando recordatorios para citas de mañana...');
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const appointments = await Appointment.find({
            date: tomorrowStr,
            status: 'confirmed'
        }).populate('patientId', 'name email phone');

        if (appointments.length === 0) {
            console.log('✨ No hay citas confirmadas para mañana.');
            return;
        }

        let sentCount = 0;
        for (const appointment of appointments) {
            if (appointment.patientId?.email) {
                try {
                    const template = getReminderTemplate(appointment.patientId, appointment);
                    const mailOptions = {
                        from: `"Consultorio Ortega Castellón" <${process.env.EMAIL_USER}>`,
                        to: appointment.patientId.email,
                        subject: template.subject,
                        html: template.html
                    };
                    await transporter.sendMail(mailOptions);
                    sentCount++;
                    console.log(`⏰ Recordatorio enviado a ${appointment.patientId.email}`);
                } catch (error) {
                    console.error(`❌ Error enviando recordatorio a ${appointment.patientId.email}:`, error);
                }
            }
        }
        console.log(`📧 ${sentCount} recordatorios enviados exitosamente.`);

    } catch (error) {
        console.error("❌ Error ejecutando la tarea programada:", error);
    }
}, {
    scheduled: true,
    timeZone: "America/Managua"
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📧 Sistema de correos configurado con: ${process.env.EMAIL_USER}`);
});