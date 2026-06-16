const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        if (!req.file) return res.status(400).json({ message: 'La imagen del producto es requerida' });

        const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const newProduct = await Product.create({
            name, description, price, stock, category, image: imageBase64
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        let updateData = { name, description, price, stock, category };

        if (req.file) {
            updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });

        res.json({ message: 'Producto actualizado con éxito', updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado del catálogo correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};