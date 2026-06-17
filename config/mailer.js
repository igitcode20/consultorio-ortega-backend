// config/mailer.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️ Error en la configuración de correos:', error.message);
  } else {
    console.log('🚀 Servidor listo para enviar correos automáticos');
  }
});

module.exports = transporter;