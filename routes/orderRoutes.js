// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/all', protect, admin, orderController.getAllOrders);
router.put('/:orderId/status', protect, admin, orderController.updateOrderStatus);
router.put('/:orderId/confirm-payment', protect, admin, orderController.confirmPayment);

module.exports = router;