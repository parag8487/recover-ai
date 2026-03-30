const User = require('../models/User');
const jwt = require('jsonwebtoken');
const memory = require('../utils/MemoryStorage');
const mongoose = require('mongoose');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user;
        if (process.env.DEMO_MODE !== 'true' && mongoose.connection.readyState === 1) {
            user = await User.findOne({ email: email.toLowerCase().trim() });
            if (user) return res.status(400).json({ message: 'User already exists' });

            user = new User({ name, email, password, role });
            await user.save();
        } else {
            // Memory Fallback
            const existing = await memory.findUserByEmail(email.toLowerCase().trim());
            if (existing) return res.status(400).json({ message: 'User already exists (Demo Mode)' });
            user = await memory.createUser({ name, email, password, role });
        }

        const id = user._id || user.id;
        res.status(201).json({
            token: generateToken(id.toString()),
            user: { id: id.toString(), name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user;
        if (process.env.DEMO_MODE !== 'true' && mongoose.connection.readyState === 1) {
            user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        } else {
            user = await memory.findUserByEmail(email.toLowerCase().trim());
            if (!user || user.password !== password) {
                return res.status(400).json({ message: 'Invalid credentials (Demo Mode)' });
            }
        }


        const idStr = (user._id || user.id).toString();
        res.status(200).json({
            token: generateToken(idStr),
            user: {
                id: idStr,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getMe = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
