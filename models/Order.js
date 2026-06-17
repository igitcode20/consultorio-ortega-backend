// models/Order.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'confirmed'],
        default: 'pending'
    },
    paymentProof: {
        type: String,
        default: ''
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryNotes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);