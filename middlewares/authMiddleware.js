// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id || decoded._id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            req.user = user; 
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token no válido' });
        }
    } else {
        return res.status(401).json({ message: 'No autorizado, se requiere token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Reservado para la Administradora' });
    }
};

module.exports = { protect, admin };