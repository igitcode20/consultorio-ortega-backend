// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conexión exitosa a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1); // Detiene el servidor si falla la conexión
    }
};

module.exports = connectDB;