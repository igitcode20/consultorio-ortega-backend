// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas públicas (requieren autenticación)
router.post('/create', protect, orderController.createOrder);
router.post('/:orderId/upload-proof', protect, orderController.uploadPaymentProof);
router.get('/my-orders', protect, orderController.getUserOrders);

// Rutas de administrador
router.get('/all', protect, admin, orderController.getAllOrders);
router.put('/:orderId/status', protect, admin, orderController.updateOrderStatus);
router.put('/:orderId/confirm-payment', protect, admin, orderController.confirmPayment);

// Reportes
router.get('/sales-report', protect, admin, orderController.getSalesReport);
router.get('/stats', protect, admin, orderController.getStats);

module.exports = router;