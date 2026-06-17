// utils/emailTemplates.js

// 📧 Formatear hora (ej: 2:30 PM)
const formatTime = (time) => {
    if (!time) return 'No especificada';
    let [hours, minutes] = time.split(':');
    let hrs = parseInt(hours, 10);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    return `${hrs}:${minutes} ${ampm}`;
};

// ✅ Plantilla: Confirmación de Cita
const getAppointmentConfirmationTemplate = (patient, appointment) => {
    const timeFormatted = formatTime(appointment.time);
    
    return {
        subject: '✅ ¡Tu Cita Médica ha sido Confirmada!',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0084cc, #006699); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🩺 Consultorio Ortega Castellón</h1>
                    <p style="color: #b3d9ff; margin: 5px 0 0 0; font-size: 14px;">Tu salud, nuestra prioridad</p>
                </div>
                
                <!-- Body -->
                <div style="background: #ffffff; padding: 30px 25px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #22c55e; margin-top: 0;">✅ Cita Confirmada</h2>
                    
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                        Hola <strong>${patient.name}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                        Nos complace informarte que tu cita médica ha sido <strong style="color: #22c55e;">confirmada</strong>.
                        Aquí tienes los detalles:
                    </p>
                    
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">🩺 Especialidad:</td>
                                <td style="padding: 8px 0; color: #1e293b;">${appointment.specialty}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">📅 Fecha:</td>
                                <td style="padding: 8px 0; color: #1e293b;">${appointment.date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">⏰ Hora:</td>
                                <td style="padding: 8px 0; color: #1e293b;">${timeFormatted}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            📍 <strong>Ubicación:</strong> Juigalpa Chontales, Barrio San Antonio, segunda entrada, 1 Cuadra al Este.
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">
                            📞 <strong>Teléfono:</strong> 84334235
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 4px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                            ⏰ <strong>Te recomendamos llegar 10 minutos antes</strong> para completar tus datos.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                        © 2026 Consultorio Clínico y Farmacia Ortega Castellón. Todos los derechos reservados.
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">
                        Este es un mensaje automático, por favor no responder a este correo.
                    </p>
                </div>
            </div>
        `
    };
};

// ⏰ Plantilla: Recordatorio de Cita
const getReminderTemplate = (patient, appointment) => {
    const timeFormatted = formatTime(appointment.time);
    
    return {
        subject: '⏰ Recordatorio de tu Cita Médica - Mañana',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Recordatorio de Cita</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px 25px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #d97706; margin-top: 0;">¡Hola, ${patient.name}! 👋</h2>
                    
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                        Te recordamos que tienes una cita médica agendada para <strong>mañana</strong>.
                        No olvides asistir puntualmente.
                    </p>
                    
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">🩺 Especialidad:</td>
                                <td style="padding: 8px 0; color: #1e293b;">${appointment.specialty}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">📅 Fecha:</td>
                                <td style="padding: 8px 0; color: #1e293b;">${appointment.date} (Mañana)</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">⏰ Hora:</td>
                                <td style="padding: 8px 0; color: #1e293b;">${timeFormatted}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            📍 <strong>Ubicación:</strong> Juigalpa Chontales, Barrio San Antonio, segunda entrada, 1 Cuadra al Este.
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">
                            📞 <strong>Teléfono:</strong> 84334235
                        </p>
                    </div>
                    
                    <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 12px 15px; border-radius: 4px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #166534;">
                            💚 <strong>¡Te esperamos!</strong> Llegar 10 minutos antes te ayudará a evitar contratiempos.
                        </p>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                        © 2026 Consultorio Clínico y Farmacia Ortega Castellón
                    </p>
                </div>
            </div>
        `
    };
};

module.exports = {
    getAppointmentConfirmationTemplate,
    getReminderTemplate,
    formatTime
};