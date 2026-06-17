// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    department: { 
        type: String, 
        required: true,
        enum: ['Juigalpa', 'Chontales', 'Managua', 'Santo Domingo', 'Santo Tomás', 'El Lovago', 'La Guinea']
    },
    address: { type: String, default: '' },
    role: { type: String, enum: ['patient', 'admin'], default: 'patient' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);