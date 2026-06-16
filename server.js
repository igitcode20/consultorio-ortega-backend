const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

connectDB();

// Aumento de capacidad a 50mb para recibir las fotos en base64 sin cuellos de botella
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({ origin: 'http://localhost:5173' }));

// Rutas Globales
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor e infraestructura ejecutándose en http://localhost:${PORT}`);
});