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
                                <td style="padding: 8px 0; color: #1e293b;">${formatTime(appointment.time)}</td>
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

// ⏰ Plantilla: Recordatorio de Cita (24 horas antes)
const getReminderTemplate = (patient, appointment) => {
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
                                <td style="padding: 8px 0; color: #1e293b;">${formatTime(appointment.time)}</td>
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

// 📦 Plantilla: Confirmación de Pago de Pedido
const getPaymentConfirmationTemplate = (user, order) => {
    return {
        subject: '✅ Pago Confirmado - Tu Pedido está en Proceso',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">💰 Pago Confirmado</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px 25px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #22c55e; margin-top: 0;">✅ ¡Tu Pago ha sido Confirmado!</h2>
                    
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                        Hola <strong>${user.name}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                        Tu pago ha sido confirmado exitosamente. Tu pedido está siendo preparado para envío.
                    </p>
                    
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #16a34a;">📦 Detalles del Pedido</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">Número de Pedido:</td>
                                <td style="padding: 8px 0; color: #1e293b;">#${order._id.slice(-6)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">Total Pagado:</td>
                                <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 18px;">C$${(order.totalAmount + order.shippingCost).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: 600; color: #475569;">Estado:</td>
                                <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">En Procesamiento</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            🚚 <strong>Dirección de Envío:</strong> ${order.address}, ${order.department}
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">
                            📱 <strong>Teléfono de Contacto:</strong> ${order.phone}
                        </p>
                        ${order.deliveryNotes ? `
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">
                            📝 <strong>Notas:</strong> ${order.deliveryNotes}
                        </p>
                        ` : ''}
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 4px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                            🕐 <strong>Próximos pasos:</strong> Recibirás una notificación cuando tu pedido esté en camino.
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

// 📋 Plantilla: Notificación de Nuevo Pedido (para el admin)
const getNewOrderAdminTemplate = (order, user) => {
    return {
        subject: '🛒 Nuevo Pedido Recibido - Revisar Comprobante',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                <div style="background: linear-gradient(135deg, #0084cc, #006699); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🛒 Nuevo Pedido</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px 25px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #0084cc; margin-top: 0;">📦 Pedido #${order._id.slice(-6)}</h2>
                    
                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #0369a1;">🧑‍⚕️ Datos del Cliente</h4>
                        <p style="margin: 5px 0;"><strong>Nombre:</strong> ${user.name}</p>
                        <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${user.phone}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 5px 0;"><strong>Departamento:</strong> ${order.department}</p>
                        <p style="margin: 5px 0;"><strong>Dirección:</strong> ${order.address}</p>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <h4 style="margin-top: 0;">🛍️ Productos</h4>
                        ${order.products.map(p => `
                            <p style="margin: 5px 0;">• ${p.name} x${p.quantity} - C$${(p.price * p.quantity).toFixed(2)}</p>
                        `).join('')}
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                        <p style="margin: 5px 0;"><strong>Subtotal:</strong> C$${order.totalAmount.toFixed(2)}</p>
                        <p style="margin: 5px 0;"><strong>Envío:</strong> C$${order.shippingCost.toFixed(2)}</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #0084cc;"><strong>Total:</strong> C$${(order.totalAmount + order.shippingCost).toFixed(2)}</p>
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 4px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                            ⚠️ <strong>Estado del Pago:</strong> ${order.paymentStatus === 'pending' ? '⏳ Pendiente - Revisar comprobante' : '✅ Confirmado'}
                        </p>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                        Consultorio Clínico y Farmacia Ortega Castellón
                    </p>
                </div>
            </div>
        `
    };
};

module.exports = {
    getAppointmentConfirmationTemplate,
    getReminderTemplate,
    getPaymentConfirmationTemplate,
    getNewOrderAdminTemplate,
    formatTime
};