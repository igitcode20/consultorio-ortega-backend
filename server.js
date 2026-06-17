// server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ============================================
// MIDDLEWARES CON TIME-OUTS
// ============================================
app.use(cors({
    origin: '*',
    credentials: true
}));

// Aumentar límite de tamaño para imágenes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Timeout global para peticiones (30 segundos)
app.use((req, res, next) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
});

// ============================================
// CONEXIÓN A MONGODB CON TIME-OUTS
// ============================================
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
})
.then(() => console.log('🔌 Conectado exitosamente a MongoDB Atlas'))
.catch(err => console.error('❌ Error crítico al conectar MongoDB:', err));

// ============================================
// IMPORTAR RUTAS
// ============================================
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const postRoutes = require('./routes/postRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// ============================================
// USAR RUTAS
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});