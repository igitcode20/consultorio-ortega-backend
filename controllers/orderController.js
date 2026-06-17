// controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ============================================
// 🛒 CREAR PEDIDO - SOLO JUICIALPA
// ============================================
exports.createOrder = async (req, res) => {
    try {
        console.log('🛒 Creando pedido...');
        console.log('📦 Body:', req.body);
        
        const { products, address, department, phone, deliveryNotes } = req.body;
        const userId = req.user._id || req.user.id;

        // Validar campos obligatorios
        if (!products || products.length === 0) {
            return res.status(400).json({ message: '❌ El carrito está vacío' });
        }

        if (!address) {
            return res.status(400).json({ message: '❌ La dirección es obligatoria' });
        }

        // 🔥 SOLO JUICIALPA - CHONTALES
        if (department !== 'Juigalpa') {
            return res.status(400).json({ 
                message: '❌ El servicio de delivery solo está disponible en Juigalpa, Chontales. Por favor, selecciona Juigalpa como departamento.' 
            });
        }

        // Buscar usuario
        const user = await User.findById(userId).maxTimeMS(5000);
        if (!user) {
            return res.status(404).json({ message: '❌ Usuario no encontrado' });
        }

        // Procesar productos
        let totalAmount = 0;
        const orderProducts = [];
        
        for (const item of products) {
            const product = await Product.findById(item.productId).maxTimeMS(5000);
            if (!product) {
                return res.status(404).json({ 
                    message: `❌ Producto no encontrado` 
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `❌ Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
                });
            }
            
            orderProducts.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });
            
            totalAmount += product.price * item.quantity;
        }

        // Costo de envío base para Juigalpa
        const shippingCost = 40;

        // Crear pedido
        const order = await Order.create({
            userId,
            products: orderProducts,
            totalAmount,
            shippingCost,
            department,
            address,
            phone: phone || user.phone,
            paymentStatus: 'pending',
            orderStatus: 'pending',
            deliveryNotes: deliveryNotes || ''
        });

        // Reducir stock
        for (const item of products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        console.log(`✅ Pedido creado: ${order._id}`);

        res.status(201).json({
            message: '✅ Pedido creado exitosamente',
            order,
            paymentInstructions: `📱 Realiza el pago a la wallet móvil: +50584334235 (Sindy Castellón) y sube el comprobante.`,
            totalWithShipping: totalAmount + shippingCost
        });

    } catch (error) {
        console.error('❌ Error en createOrder:', error);
        res.status(500).json({ 
            message: 'Error al crear el pedido', 
            error: error.message 
        });
    }
};

// ============================================
// 📤 SUBIR COMPROBANTE DE PAGO (NUEVA)
// ============================================
exports.uploadPaymentProof = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentProof } = req.body; // Base64 de la imagen
        
        console.log(`📤 Subiendo comprobante para orden ${orderId}`);

        if (!paymentProof) {
            return res.status(400).json({ message: '❌ El comprobante es obligatorio' });
        }

        const order = await Order.findById(orderId).maxTimeMS(5000);
        if (!order) {
            return res.status(404).json({ message: '❌ Pedido no encontrado' });
        }

        // Verificar que el usuario sea el dueño del pedido
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '❌ No autorizado' });
        }

        // Guardar comprobante
        order.paymentProof = paymentProof;
        order.paymentStatus = 'pending'; // Esperando confirmación del admin
        await order.save({ maxTimeMS: 5000 });

        console.log(`✅ Comprobante subido para orden ${orderId}`);

        res.json({
            message: '✅ Comprobante subido exitosamente. Espera la confirmación del administrador.',
            order
        });

    } catch (error) {
        console.error('❌ Error en uploadPaymentProof:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'Error al subir el comprobante'
        });
    }
};

// ============================================
// ✅ CONFIRMAR PAGO
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

// ============================================
// 📊 OBTENER ESTADÍSTICAS
// ============================================
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ paymentStatus: 'pending' });
        const confirmedOrders = await Order.countDocuments({ paymentStatus: 'confirmed' });
        const totalProducts = await Product.countDocuments();

        const sales = await Order.aggregate([
            { $match: { paymentStatus: 'confirmed' } },
            { $group: {
                _id: null,
                total: { $sum: { $add: ['$totalAmount', '$shippingCost'] } }
            }}
        ]);

        const totalSales = sales.length > 0 ? sales[0].total : 0;

        res.json({
            totalUsers,
            totalOrders,
            pendingOrders,
            confirmedOrders,
            totalProducts,
            totalSales
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};