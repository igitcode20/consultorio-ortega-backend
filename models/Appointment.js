const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Asegúrate de que apunte a tu modelo de Usuarios
    required: true
  },
  specialty: {
    type: String,
    required: true,
    enum: ['Medicina General', 'Ortopedia', 'Pediatría']
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  // 🔥 ESTE ES EL CAMPO NUEVO QUE DEBÉS AGREGAR:
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);