// controllers/chatbotController.js

const FAQ = {
    "1": "📍 **Ubicación:** Estamos ubicados frente al parque central de la localidad. ¡Te esperamos!",
    "2": "🕒 **Horarios:** Atendemos de Lunes a Viernes de 8:00 AM a 6:00 PM, y Sábados de 8:00 AM a 1:00 PM.",
    "3": "📞 **Citas:** Puedes agendar registrándote en nuestra plataforma con tu cuenta e ingresando al menú 'Agendar Cita'.",
    "4": "💊 **Farmacia:** Contamos con un amplio stock de medicamentos ortopédicos y generales con descuentos todos los días.",
    "5": "💳 **Métodos de pago:** Aceptamos efectivo, transferencias bancarias y todas las tarjetas de crédito/débito.",
    "6": "🚚 **Delivery:** El servicio de entrega a domicilio (delivery) solo está disponible en el departamento de **Juigalpa, Chontales**. Los costos varían según la distancia: C$30, C$40, C$50 y C$60.",
    "7": "📱 **Pago:** Puedes pagar a través de nuestra wallet móvil al número **+50584334235** (Sindy Castellón). Debes subir el comprobante de pago en la plataforma para que el administrador confirme tu pedido.",
    "8": "📦 **Pedidos:** Para realizar un pedido, ve a la sección 'Farmacia', agrega los productos al carrito y sigue los pasos de pago. ¡Es fácil y seguro!"
};

exports.askChatbot = (req, res) => {
    const { option } = req.body;
    
    // Si el mensaje contiene palabras clave, responder automáticamente
    const message = (option || '').toLowerCase();
    
    if (message.includes('delivery') || message.includes('domicilio') || message.includes('envío') || message.includes('envio')) {
        return res.json({ 
            respuesta: "🚚 **Información de Delivery:**\n\nEl servicio de entrega a domicilio solo está disponible en el departamento de **Juigalpa, Chontales**.\n\n📦 Costos de envío según la distancia:\n• Zona 1: C$30\n• Zona 2: C$40\n• Zona 3: C$50\n• Zona 4: C$60\n\n📱 Para más información, llama al: 84334235" 
        });
    }
    
    if (message.includes('pago') || message.includes('wallet') || message.includes('comprobante')) {
        return res.json({ 
            respuesta: "💳 **Métodos de Pago:**\n\n📱 Puedes pagar a través de nuestra wallet móvil:\n**Número:** +50584334235\n**Titular:** Sindy Castellón\n\n📤 Después de realizar el pago, sube el comprobante en la sección 'Mis Pedidos' para que el administrador lo confirme.\n\n⚠️ Tu pedido será procesado una vez que el pago sea confirmado." 
        });
    }
    
    const respuesta = FAQ[option] || "❌ Opción no válida. Por favor selecciona un número del 1 al 8.\n\n1. 📍 Ubicación\n2. 🕒 Horarios\n3. 📞 Citas\n4. 💊 Farmacia\n5. 💳 Métodos de pago\n6. 🚚 Delivery\n7. 📱 Pago con Wallet\n8. 📦 Pedidos";
    res.json({ respuesta });
};