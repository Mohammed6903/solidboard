import express from 'express';
import Task from '../models/Task.js';
import Board from '../models/Board.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Helper to verify board ownership
const verifyBoardAccess = async (boardId, userId) => {
    const board = await Board.findOne({ _id: boardId, owner: userId });
    return board;
};

// @route   GET /api/tasks/tags
// @desc    Get all unique tags from user's tasks
router.get('/tags', async (req, res) => {
    try {
        // Get all boards owned by user
        const boards = await Board.find({ owner: req.user._id });
        const boardIds = boards.map(b => b._id);

        // Get all tasks from user's boards
        const tasks = await Task.find({ board: { $in: boardIds } });

        // Extract unique tags
        const tagsSet = new Set();
        tasks.forEach(task => {
            if (task.labels && Array.isArray(task.labels)) {
                task.labels.forEach(label => tagsSet.add(label));
            }
        });

        res.json(Array.from(tagsSet).sort());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tasks/board/:boardId
// @desc    Get all tasks for a board
router.get('/board/:boardId', async (req, res) => {
    try {
        const board = await verifyBoardAccess(req.params.boardId, req.user._id);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const tasks = await Task.find({ board: req.params.boardId })
            .populate('assignee', 'name email avatar color')
            .populate('comments.user', 'name email avatar color')
            .sort({ order: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/tasks
// @desc    Create new task
router.post('/', async (req, res) => {
    try {
        const { boardId, columnId, title, description, priority, labels, tags, assignee, dueDate } = req.body;

        const board = await verifyBoardAccess(boardId, req.user._id);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Get the highest order in this column
        const lastTask = await Task.findOne({ board: boardId, columnId })
            .sort({ order: -1 });
        const order = lastTask ? lastTask.order + 1 : 0;

        const task = await Task.create({
            title,
            description: description || '',
            board: boardId,
            columnId,
            order,
            priority: priority || 'medium',
            labels: labels || tags || [],
            assignee,
            dueDate,
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'name email avatar color');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const board = await verifyBoardAccess(task.board, req.user._id);
        if (!board) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { title, description, priority, labels, tags, assignee, dueDate } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, priority, labels: labels || tags, assignee, dueDate },
            { new: true, runValidators: true }
        ).populate('assignee', 'name email avatar color')
            .populate('comments.user', 'name email avatar color');

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/tasks/:id/move
// @desc    Move task to different column or reorder
router.put('/:id/move', async (req, res) => {
    try {
        const { columnId, order } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const board = await verifyBoardAccess(task.board, req.user._id);
        if (!board) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const oldColumnId = task.columnId;
        const oldOrder = task.order;

        // Update task position
        task.columnId = columnId;
        task.order = order;
        await task.save();

        // Reorder tasks in the old column if moved to a different column
        if (oldColumnId !== columnId) {
            await Task.updateMany(
                { board: task.board, columnId: oldColumnId, order: { $gt: oldOrder } },
                { $inc: { order: -1 } }
            );

            // Make room in new column
            await Task.updateMany(
                { board: task.board, columnId, order: { $gte: order }, _id: { $ne: task._id } },
                { $inc: { order: 1 } }
            );
        } else {
            // Reorder within same column
            if (order > oldOrder) {
                await Task.updateMany(
                    { board: task.board, columnId, order: { $gt: oldOrder, $lte: order }, _id: { $ne: task._id } },
                    { $inc: { order: -1 } }
                );
            } else if (order < oldOrder) {
                await Task.updateMany(
                    { board: task.board, columnId, order: { $gte: order, $lt: oldOrder }, _id: { $ne: task._id } },
                    { $inc: { order: 1 } }
                );
            }
        }

        const updatedTask = await Task.findById(task._id)
            .populate('assignee', 'name email avatar color');

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const board = await verifyBoardAccess(task.board, req.user._id);
        if (!board) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await task.deleteOne();

        // Reorder remaining tasks in the column
        await Task.updateMany(
            { board: task.board, columnId: task.columnId, order: { $gt: task.order } },
            { $inc: { order: -1 } }
        );

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
router.post('/:id/comments', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const board = await verifyBoardAccess(task.board, req.user._id);
        if (!board) {
            return res.status(403).json({ message: 'Access denied' });
        }

        task.comments.push({
            user: req.user._id,
            text: req.body.text,
        });

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('assignee', 'name email avatar color')
            .populate('comments.user', 'name email avatar color');

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
