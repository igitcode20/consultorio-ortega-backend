// models/Inventory.js

const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Medicamentos', 'Equipos Médicos', 'Insumos', 'Jeringas', 'Otros']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    minStock: {
        type: Number,
        default: 5
    },
    unit: {
        type: String,
        default: 'unidades'
    },
    location: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);