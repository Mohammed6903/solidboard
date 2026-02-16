import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        default: 'var(--column-todo)',
    },
});

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Board title is required'],
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    columns: {
        type: [columnSchema],
        default: [
            { title: 'Backlog', order: 0, color: 'var(--column-backlog)' },
            { title: 'To Do', order: 1, color: 'var(--column-todo)' },
            { title: 'In Progress', order: 2, color: 'var(--column-progress)' },
            { title: 'Review', order: 3, color: 'var(--column-review)' },
            { title: 'Done', order: 4, color: 'var(--column-done)' },
        ],
    },
    tags: [{
        type: String,
        trim: true,
    }],
}, {
    timestamps: true,
});

export default mongoose.model('Board', boardSchema);
