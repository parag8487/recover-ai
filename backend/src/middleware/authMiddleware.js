const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const memory = require('../utils/MemoryStorage');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            if (process.env.DEMO_MODE === 'true') {
                req.user = await memory.findUserById(decoded.id);
            } else if (mongoose.connection.readyState === 1) {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                req.user = await memory.findUserById(decoded.id);
            }

            if (!req.user) {
                console.log('Auth Failure: User not found for ID', decoded.id);
                return res.status(401).json({ message: 'User not found in current storage mode' });
            }
            next();
        } catch (error) {
            console.log('Auth Failure: Token verification failed', error.message);
            res.status(401).json({ message: 'Not authorized' });
        }
    } else if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = authMiddleware;
