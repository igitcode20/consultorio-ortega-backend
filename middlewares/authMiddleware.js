const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; 
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token no válido, acceso denegado' });
        }
    } else {
        return res.status(401).json({ message: 'No autorizado, se requiere iniciar sesión' });
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