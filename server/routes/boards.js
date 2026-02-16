import express from 'express';
import Board from '../models/Board.js';
import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/boards
// @desc    Get all boards for user
router.get('/', async (req, res) => {
    try {
        const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/boards/:id
// @desc    Get board by ID with tasks
router.get('/:id', async (req, res) => {
    try {
        const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const tasks = await Task.find({ board: board._id })
            .populate('assignee', 'name email avatar color')
            .populate('comments.user', 'name email avatar color')
            .sort({ order: 1 });

        res.json({ board, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/boards
// @desc    Create new board
router.post('/', async (req, res) => {
    try {
        const board = await Board.create({
            title: req.body.title || 'My Board',
            owner: req.user._id,
            columns: req.body.columns,
            tags: req.body.tags || [],
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/boards/:id
// @desc    Update board
router.put('/:id', async (req, res) => {
    try {
        const board = await Board.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { title: req.body.title, columns: req.body.columns, tags: req.body.tags },
            { new: true, runValidators: true }
        );

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/boards/:id
// @desc    Delete board and all tasks
router.delete('/:id', async (req, res) => {
    try {
        const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Delete all tasks in this board
        await Task.deleteMany({ board: board._id });

        res.json({ message: 'Board deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
