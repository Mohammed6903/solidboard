// Accessibility utilities for the Kanban board
import { createSignal } from 'solid-js';

// Create a live region for screen reader announcements
const [announcement, setAnnouncement] = createSignal('');

export const announce = (message, priority = 'polite') => {
    // Clear first to ensure re-announcement of same message
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 50);
};

export const getAnnouncement = () => announcement();

// Focus management
export const focusElement = (selector, container = document) => {
    const element = container.querySelector(selector);
    if (element) {
        element.focus();
        return true;
    }
    return false;
};

export const focusFirst = (container) => {
    const focusable = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) {
        focusable[0].focus();
        return true;
    }
    return false;
};

export const focusLast = (container) => {
    const focusable = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) {
        focusable[focusable.length - 1].focus();
        return true;
    }
    return false;
};

// Focus trap for modals
export const createFocusTrap = (containerRef) => {
    const handleKeyDown = (e) => {
        if (e.key !== 'Tab' || !containerRef()) return;

        const container = containerRef();
        const focusable = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    return {
        activate: () => document.addEventListener('keydown', handleKeyDown),
        deactivate: () => document.removeEventListener('keydown', handleKeyDown),
    };
};

// Keyboard navigation helpers
export const handleArrowNavigation = (e, items, currentIndex, onNavigate) => {
    let newIndex = currentIndex;

    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault();
            newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
        case 'End':
            e.preventDefault();
            newIndex = items.length - 1;
            break;
        default:
            return;
    }

    onNavigate(newIndex);
};

// Format dates for screen readers
export const formatDateForSR = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Priority labels for screen readers
export const getPriorityLabel = (priority) => {
    const labels = {
        low: 'Low priority',
        medium: 'Medium priority',
        high: 'High priority',
        urgent: 'Urgent priority',
    };
    return labels[priority] || 'Unknown priority';
};
