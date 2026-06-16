const FAQ = {
    "1": "📍 Ubicación: Estamos ubicados frente al parque central de la localidad. ¡Te esperamos!",
    "2": "🕒 Horarios: Atendemos de Lunes a Viernes de 8:00 AM a 6:00 PM, y Sábados de 8:00 AM a 1:00 PM.",
    "3": "📞 Citas: Puedes agendar registrándote en nuestra plataforma con tu cuenta e ingresando al menú 'Agendar Cita'.",
    "4": "💊 Farmacia: Contamos con un amplio stock de medicamentos ortopédicos y generales con descuentos todos los días.",
    "5": "💳 Métodos de pago: Aceptamos efectivo, transferencias bancarias y todas las tarjetas de crédito/débito."
};

exports.askChatbot = (req, res) => {
    const { option } = req.body;
    const respuesta = FAQ[option] || "❌ Opción no válida. Por favor selecciona un número del 1 al 5.";
    res.json({ respuesta });
};