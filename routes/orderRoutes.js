// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

// 🔥 RUTAS PARA CLIENTES (PACIENTES)
router.post('/create', protect, orderController.createOrder);
router.post('/:orderId/upload-proof', protect, orderController.uploadPaymentProof);
router.get('/my-orders', protect, orderController.getUserOrders); // 🆕 NUEVA

// Rutas de administrador
router.get('/all', protect, admin, orderController.getAllOrders);
router.put('/:orderId/status', protect, admin, orderController.updateOrderStatus);
router.put('/:orderId/confirm-payment', protect, admin, orderController.confirmPayment);
router.get('/stats', protect, admin, orderController.getStats);

module.exports = router;