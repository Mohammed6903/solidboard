// Helper utilities for the Kanban board

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format due date with urgency
export const formatDueDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));

    let label;
    let isOverdue = false;
    let isUrgent = false;

    if (diffDays < 0) {
        label = diffDays === -1 ? 'Yesterday' : `${Math.abs(diffDays)} days overdue`;
        isOverdue = true;
    } else if (diffDays === 0) {
        label = 'Today';
        isUrgent = true;
    } else if (diffDays === 1) {
        label = 'Tomorrow';
        isUrgent = true;
    } else if (diffDays <= 7) {
        label = `${diffDays} days`;
        isUrgent = diffDays <= 2;
    } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return { label, isOverdue, isUrgent };
};

// Debounce function
export const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Throttle function
export const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Clamp number between min and max
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Generate initials from name
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Pluralize word
export const pluralize = (count, singular, plural = singular + 's') => {
    return count === 1 ? singular : plural;
};

// Priority order for sorting
export const priorityOrder = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
};

// Sort tasks by priority
export const sortByPriority = (tasks) => {
    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Filter empty values from object
export const filterEmpty = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
};

// Escape HTML entities
export const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

// Get contrast color for background
export const getContrastColor = (hexColor) => {
    // Default to light text for dark backgrounds
    if (!hexColor || hexColor.startsWith('var(')) return 'var(--text-primary)';

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
};
