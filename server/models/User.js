import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false, // Don't include password in queries by default
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    avatar: {
        type: String,
        default: function () {
            return this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
        }
    },
    color: {
        type: String,
        default: function () {
            const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
