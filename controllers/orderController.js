// controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ============================================
// ✅ CONFIRMAR PAGO - CON VALIDACIONES
// ============================================
exports.confirmPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { confirm } = req.body;
        
        console.log(`💰 Confirmando pago orden ${orderId}: ${confirm ? 'APROBADO' : 'RECHAZADO'}`);

        const order = await Order.findById(orderId)
            .populate('userId', 'name email phone')
            .maxTimeMS(5000);
            
        if (!order) {
            return res.status(404).json({ message: '❌ Pedido no encontrado' });
        }

        if (confirm) {
            order.paymentStatus = 'confirmed';
            order.orderStatus = 'processing';
        } else {
            order.paymentStatus = 'pending';
            order.orderStatus = 'pending';
        }

        await order.save({ maxTimeMS: 5000 });

        console.log(`✅ Pago ${confirm ? 'confirmado' : 'rechazado'}`);

        res.json({
            message: confirm ? '✅ Pago confirmado' : '❌ Pago rechazado',
            order
        });

    } catch (error) {
        console.error('❌ Error en confirmPayment:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al confirmar el pago'
        });
    }
};

// ============================================
// 📋 OBTENER TODOS LOS PEDIDOS
// ============================================
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email phone department')
            .sort({ createdAt: -1 })
            .lean()
            .maxTimeMS(10000);
            
        res.json(orders);
    } catch (error) {
        console.error('❌ Error en getAllOrders:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// 🚚 ACTUALIZAR ESTADO DEL PEDIDO
// ============================================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: '❌ Estado no válido' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus },
            { new: true, maxTimeMS: 5000 }
        ).populate('userId', 'name email phone');

        if (!order) {
            return res.status(404).json({ message: '❌ Pedido no encontrado' });
        }

        res.json({
            message: `✅ Estado actualizado a: ${orderStatus}`,
            order
        });

    } catch (error) {
        console.error('❌ Error en updateOrderStatus:', error);
        res.status(500).json({ error: error.message });
    }
};