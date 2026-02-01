import express from 'express';
import User from '../models/User.js';
import Board from '../models/Board.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ email, password, name });

        // Create default board for new user
        await Board.create({
            title: 'My First Board',
            description: 'Welcome to your Kanban board!',
            owner: user._id,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            color: user.color,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            color: user.color,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        color: req.user.color,
    });
});

export default router;
