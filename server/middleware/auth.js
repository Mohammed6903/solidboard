import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
