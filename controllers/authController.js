// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, department, address } = req.body;
        
        // Validar que todos los campos requeridos estén presentes
        if (!name || !email || !phone || !password || !department) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos: nombre, email, teléfono, contraseña y departamento' 
            });
        }

        // Verificar si el usuario ya existe
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Verificar si el teléfono ya está registrado
        let phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            department,
            address: address || '',
            role: 'patient'
        });

        res.status(201).json({ 
            message: 'Usuario registrado con éxito',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                department: newUser.department
            }
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Credenciales incorrectas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciales incorrectas' });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name,
                email: user.email,
                phone: user.phone,
                department: user.department,
                role: user.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};