import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },
    columnId: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    labels: [{
        type: String,
    }],
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dueDate: {
        type: Date,
    },
    comments: [commentSchema],
}, {
    timestamps: true,
});

// Index for faster queries
taskSchema.index({ board: 1, columnId: 1 });
taskSchema.index({ board: 1, order: 1 });

export default mongoose.model('Task', taskSchema);
