// controllers/inventoryController.js

const Inventory = require('../models/Inventory');

// ➕ Crear o actualizar item de inventario
exports.createInventoryItem = async (req, res) => {
    try {
        const { productName, category, quantity, minStock, unit, location, notes } = req.body;
        
        const item = await Inventory.create({
            productName,
            category,
            quantity,
            minStock: minStock || 5,
            unit: unit || 'unidades',
            location: location || '',
            notes: notes || ''
        });

        res.status(201).json({
            message: '✅ Item de inventario creado exitosamente',
            item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📋 Obtener todo el inventario
exports.getAllInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ category: 1, productName: 1 });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔄 Actualizar stock
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body; // 'add' o 'subtract'

        const item = await Inventory.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item no encontrado' });
        }

        if (operation === 'add') {
            item.quantity += quantity;
        } else if (operation === 'subtract') {
            if (item.quantity < quantity) {
                return res.status(400).json({ message: 'Stock insuficiente' });
            }
            item.quantity -= quantity;
        } else {
            return res.status(400).json({ message: 'Operación no válida. Use "add" o "subtract"' });
        }

        item.lastUpdated = new Date();
        await item.save();

        res.json({
            message: '✅ Stock actualizado exitosamente',
            item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🗑️ Eliminar item de inventario
exports.deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Inventory.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Item no encontrado' });
        }
        res.json({ message: '✅ Item eliminado del inventario' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📊 Reporte de inventario
exports.getInventoryReport = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ category: 1 });

        // Productos con bajo stock
        const lowStock = inventory.filter(item => item.quantity <= item.minStock);

        // Resumen por categoría
        const byCategory = {};
        inventory.forEach(item => {
            const cat = item.category || 'Sin categoría';
            if (!byCategory[cat]) {
                byCategory[cat] = { items: 0, totalQuantity: 0 };
            }
            byCategory[cat].items += 1;
            byCategory[cat].totalQuantity += item.quantity;
        });

        res.json({
            totalItems: inventory.length,
            lowStock,
            byCategory,
            inventory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};