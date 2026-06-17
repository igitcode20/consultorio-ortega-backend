// routes/inventoryRoutes.js

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Todas las rutas de inventario son solo para admin
router.post('/create', protect, admin, inventoryController.createInventoryItem);
router.get('/all', protect, admin, inventoryController.getAllInventory);
router.put('/:id/stock', protect, admin, inventoryController.updateStock);
router.delete('/:id', protect, admin, inventoryController.deleteInventoryItem);
router.get('/report', protect, admin, inventoryController.getInventoryReport);

module.exports = router;