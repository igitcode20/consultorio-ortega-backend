// =========================================================================
// 🔥 PASO 1: ¡REGLA DE ORO! LA PRIMERA LÍNEA DE TODO TU PROYECTO
// =========================================================================
require('dotenv').config(); 

// =========================================================================
// 🧪 PASO 2: LOG DE CONTROL (Para que veas en consola si se está leyendo bien)
// =========================================================================
console.log("-----------------------------------------");
console.log("🔍 CONTROL DE VARIABLES DE ENTORNO:");
console.log("User Correo:", process.env.EMAIL_USER ? process.env.EMAIL_USER : "❌ NO SE LEE (Vacío)");
console.log("Clave Correo:", process.env.EMAIL_PASS ? "✅ SÍ SE LEE" : "❌ NO SE LEE (Vacío)");
console.log("-----------------------------------------");

// =========================================================================
// 📦 PASO 3: IMPORTAR LIBRERÍAS GLOBALES
// =========================================================================
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

// =========================================================================
// 🚀 PASO 4: INICIALIZAR EXPRESS Y MIDDLEWARES
// =========================================================================
const app = express();

app.use(cors());
app.use(express.json()); // Para que el backend entienda JSON en el body

// =========================================================================
// 🔌 PASO 5: CONEXIÓN A LA BASE DE DATOS (MONGOOSE)
// =========================================================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔌 Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('❌ Error crítico al conectar MongoDB:', err));

// =========================================================================
// 🛣️ PASO 6: IMPORTAR RUTAS (Después de cargar el .env para evitar errores)
// =========================================================================
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

// Si tenés más rutas en tu proyecto, van aquí abajo:
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// =========================================================================
// ⏰ PASO 7: TAREA PROGRAMADA (CRON) - RECORDATORIOS AUTOMÁTICOS
// =========================================================================
const Appointment = require('./models/Appointment');
const transporter = require('./config/mailer');

// Se ejecuta todos los días a las 08:00 AM hora local de Nicaragua
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Iniciando escaneo diario de recordatorios para las citas de mañana...');
  try {
    // Calculamos el día de mañana de forma segura evitando desfases UTC de los servidores en la nube
    const todayLocal = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Managua" }));
    const tomorrow = new Date(todayLocal);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${year}-${month}-${day}`; // Formato exacto: "YYYY-MM-DD"

    console.log(`🔍 Buscando citas confirmadas para la fecha local: ${tomorrowStr}`);

    // Buscamos citas confirmadas para mañana
    const appointmentsTomorrow = await Appointment.find({
      date: tomorrowStr,
      status: 'confirmed'
    }).populate('patientId', 'name email');

    if (appointmentsTomorrow.length === 0) {
      console.log('✨ No hay citas confirmadas para mañana. No se enviaron correos.');
      return;
    }

    appointmentsTomorrow.forEach(cita => {
      if (cita.patientId?.email) {
        
        // Formateador interno a AM/PM para el mensaje de correo
        let [hours, minutes] = cita.time.split(':');
        let hrs = parseInt(hours, 10);
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12 || 12;
        const timeFormatted = `${hrs}:${minutes} ${ampm}`;

        const reminderMailOptions = {
          from: `"Consultorio Médico Ortega" <${process.env.EMAIL_USER}>`,
          to: cita.patientId.email,
          subject: '⏰ Recordatorio de tu Cita Médica de Mañana',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f59e0b; border-radius: 12px;">
              <h2 style="color: #d97706; text-align: center;">¡Hola, ${cita.patientId.name}! ✨</h2>
              <p style="font-size: 1rem; color: #334155; text-align: center;">
                Este es un recordatorio automático de que tienes una consulta médica agendada para el día de <strong>mañana</strong>.
              </p>
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
                <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> ${cita.specialty}</p>
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${cita.date} (Mañana)</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${timeFormatted}</p>
              </div>
              <p style="font-size: 0.85rem; color: #64748b; text-align: center;">
                Te recomendamos llegar 10 minutos antes. ¡Te esperamos!
              </p>
            </div>
          `
        };

        transporter.sendMail(reminderMailOptions, (err) => {
          if (err) console.error(`❌ Error al enviar recordatorio a ${cita.patientId.email}:`, err);
          else console.log(`⏰ Recordatorio enviado con éxito a: ${cita.patientId.email}`);
        });
      }
    });

  } catch (error) {
    console.error("❌ Error ejecutando la tarea programada de cron:", error);
  }
}, {
  scheduled: true,
  timeZone: "America/Managua" // 🔥 Obliga al reloj a trabajar con la hora de Nicaragua
});

// =========================================================================
// 🟢 PASO 8: LEVANTAR EL PUERTO
// =========================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo con éxito en el puerto ${PORT}`);
});