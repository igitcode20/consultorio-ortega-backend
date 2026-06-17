// controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const transporter = require('../config/mailer');

// 📦 Calcular costo de envío según distancia
const getShippingCost = (department, address) => {
    // Definimos zonas de envío para Juigalpa
    const zones = {
        'Zona 1': { cost: 30, areas: ['Centro', 'Barrio San Antonio', 'Barrio El Calvario'] },
        'Zona 2': { cost: 40, areas: ['Barrio Santa Ana', 'Barrio La Merced', 'Barrio El Rosario'] },
        'Zona 3': { cost: 50, areas: ['Barrio San Juan', 'Barrio El Progreso', 'Barrio La Esperanza'] },
        'Zona 4': { cost: 60, areas: ['Barrio El Porvenir', 'Colonia El Paraíso', 'Zona Rural'] }
    };

    // Solo hay delivery en Juigalpa
    if (department !== 'Juigalpa') {
        return { available: false, message: '🚫 El servicio de delivery solo está disponible en Juigalpa, Chontales.' };
    }

    // Buscar la zona según la dirección (simplificado)
    let cost = 40; // costo por defecto
    for (const [zone, data] of Object.entries(zones)) {
        if (data.areas.some(area => address.toLowerCase().includes(area.toLowerCase()))) {
            cost = data.cost;
            break;
        }
    }

    return { available: true, cost };
};

// 🛒 Crear un nuevo pedido
exports.createOrder = async (req, res) => {
    try {
        const { products, address, department, phone, deliveryNotes } = req.body;
        const userId = req.user._id;

        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validar que los productos existan y tengan stock
        let totalAmount = 0;
        const orderProducts = [];
        
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Producto ${item.productId} no encontrado` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
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

        // Calcular costo de envío
        const shippingInfo = getShippingCost(department, address);
        if (!shippingInfo.available) {
            return res.status(400).json({ message: shippingInfo.message });
        }

        // Crear el pedido
        const order = await Order.create({
            userId,
            products: orderProducts,
            totalAmount,
            shippingCost: shippingInfo.cost,
            department,
            address,
            phone: phone || user.phone,
            paymentStatus: 'pending',
            orderStatus: 'pending',
            deliveryNotes: deliveryNotes || ''
        });

        // Reducir el stock de los productos
        for (const item of products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json({
            message: '✅ Pedido creado exitosamente',
            order,
            shippingCost: shippingInfo.cost,
            totalWithShipping: totalAmount + shippingInfo.cost,
            paymentInstructions: `📱 Realiza el pago a la wallet móvil: +50584334235 (Sindy Castellón) y sube el comprobante.`
        });

    } catch (error) {
        console.error('Error en createOrder:', error);
        res.status(500).json({ error: error.message });
    }
};

// 📤 Subir comprobante de pago
exports.uploadPaymentProof = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentProof } = req.body; // Base64 de la imagen

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Verificar que el usuario sea el dueño del pedido o admin
        if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        order.paymentProof = paymentProof;
        order.paymentStatus = 'pending'; // Esperando confirmación del admin
        await order.save();

        // Notificar al admin (simulado por ahora)
        console.log(`📢 Nuevo comprobante de pago para orden ${orderId}`);

        res.json({
            message: '✅ Comprobante subido exitosamente, esperando confirmación del administrador',
            order
        });

    } catch (error) {
        console.error('Error en uploadPaymentProof:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Confirmar pago por el admin
exports.confirmPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { confirm } = req.body; // true o false

        const order = await Order.findById(orderId).populate('userId', 'name email phone');
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        if (confirm) {
            order.paymentStatus = 'confirmed';
            order.orderStatus = 'processing';
            await order.save();

            // Enviar notificación al cliente (simulada)
            console.log(`📱 Enviando notificación a ${order.userId.phone}: Tu pago ha sido confirmado. Tu pedido está siendo procesado.`);

            // Enviar correo de confirmación
            const mailOptions = {
                from: `"Consultorio Ortega Castellón" <${process.env.EMAIL_USER}>`,
                to: order.userId.email,
                subject: '✅ Pago Confirmado - Tu pedido está en proceso',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #22c55e; border-radius: 12px;">
                        <h2 style="color: #22c55e;">✅ Pago Confirmado</h2>
                        <p>Hola ${order.userId.name},</p>
                        <p>Tu pago ha sido confirmado. Tu pedido está siendo preparado para envío.</p>
                        <p><strong>Total:</strong> C$${order.totalAmount + order.shippingCost}</p>
                        <p><strong>Estado:</strong> ${order.orderStatus}</p>
                        <p>Te notificaremos cuando tu pedido esté en camino.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);

            res.json({
                message: '✅ Pago confirmado exitosamente',
                order
            });

        } else {
            order.paymentStatus = 'pending';
            order.orderStatus = 'pending';
            await order.save();

            res.json({
                message: '❌ Pago rechazado. El cliente debe subir un nuevo comprobante.',
                order
            });
        }

    } catch (error) {
        console.error('Error en confirmPayment:', error);
        res.status(500).json({ error: error.message });
    }
};

// 📋 Obtener todos los pedidos (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email phone department')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📋 Obtener pedidos de un usuario
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🚚 Actualizar estado del pedido (admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        const order = await Order.findById(orderId).populate('userId', 'name email phone');
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        order.orderStatus = orderStatus;
        await order.save();

        // Notificar al cliente
        if (orderStatus === 'shipped') {
            console.log(`📱 Pedido ${orderId} enviado a ${order.userId.phone}`);
        }

        res.json({
            message: `✅ Estado del pedido actualizado a: ${orderStatus}`,
            order
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📊 Reportes
exports.getSalesReport = async (req, res) => {
    try {
        const { period } = req.query; // 'daily', 'weekly', 'monthly', 'quarterly'
        
        let startDate = new Date();
        switch(period) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarterly':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            default:
                startDate = new Date(0); // Desde el principio
        }

        const orders = await Order.find({
            createdAt: { $gte: startDate },
            paymentStatus: 'confirmed'
        }).populate('userId', 'name email department');

        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount + order.shippingCost, 0);
        const totalOrders = orders.length;

        // Agrupar por departamento
        const byDepartment = {};
        orders.forEach(order => {
            const dept = order.department || 'Desconocido';
            byDepartment[dept] = (byDepartment[dept] || 0) + 1;
        });

        // Productos más vendidos
        const productSales = {};
        orders.forEach(order => {
            order.products.forEach(product => {
                const key = product.productId.toString();
                if (!productSales[key]) {
                    productSales[key] = {
                        name: product.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[key].quantity += product.quantity;
                productSales[key].revenue += product.price * product.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        res.json({
            period,
            startDate,
            summary: {
                totalSales,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
            },
            byDepartment,
            topProducts,
            orders: orders.slice(0, 50) // Últimos 50 pedidos
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📦 Obtener estadísticas generales
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ paymentStatus: 'pending' });
        const confirmedOrders = await Order.countDocuments({ paymentStatus: 'confirmed' });
        const totalProducts = await Product.countDocuments();

        // Ventas totales
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