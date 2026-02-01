// Drag and Drop utilities for Kanban board
import { createSignal } from 'solid-js';
import { announce } from './accessibility';

// Drag state
const [dragState, setDragState] = createSignal({
    isDragging: false,
    draggedId: null,
    draggedType: null, // 'task' or 'column'
    sourceColumnId: null,
    sourceIndex: null,
});

const [dropTarget, setDropTarget] = createSignal({
    columnId: null,
    index: null,
    position: null, // 'before', 'after', or 'inside'
});

export const getDragState = () => dragState();
export const getDropTarget = () => dropTarget();

// Start dragging
export const startDrag = (id, type, columnId, index) => {
    setDragState({
        isDragging: true,
        draggedId: id,
        draggedType: type,
        sourceColumnId: columnId,
        sourceIndex: index,
    });
    announce(`Started dragging ${type}`);
};

// Update drop target
export const updateDropTarget = (columnId, index, position) => {
    setDropTarget({ columnId, index, position });
};

// End dragging
export const endDrag = () => {
    setDragState({
        isDragging: false,
        draggedId: null,
        draggedType: null,
        sourceColumnId: null,
        sourceIndex: null,
    });
    setDropTarget({ columnId: null, index: null, position: null });
};

// Calculate drop position from mouse Y relative to element
export const getDropPosition = (e, element) => {
    const rect = element.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midpoint = rect.height / 2;
    return y < midpoint ? 'before' : 'after';
};

// Calculate drop index from position
export const calculateDropIndex = (tasksInColumn, dropIndex, position, sourceIndex, isSameColumn) => {
    let targetIndex = dropIndex;

    if (position === 'after') {
        targetIndex++;
    }

    // Adjust for same column moves
    if (isSameColumn && sourceIndex < targetIndex) {
        targetIndex--;
    }

    return Math.max(0, Math.min(targetIndex, tasksInColumn));
};

// Create drag image (used for custom drag preview)
export const createDragImage = (element) => {
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    clone.style.opacity = '0.8';
    clone.style.transform = 'rotate(3deg)';
    clone.style.width = element.offsetWidth + 'px';
    document.body.appendChild(clone);
    return clone;
};

export const removeDragImage = (element) => {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
};

// Keyboard-based drag and drop
export const handleKeyboardDrag = (e, taskId, columnId, tasks, columns, moveTask) => {
    if (!e.ctrlKey && !e.metaKey) return false;

    const currentColumnIndex = columns.findIndex(c => c.id === columnId);
    const currentTaskIndex = tasks.findIndex(t => t.id === taskId);

    switch (e.key) {
        case 'ArrowUp':
            if (currentTaskIndex > 0) {
                e.preventDefault();
                moveTask(taskId, columnId, currentTaskIndex - 1);
                announce('Moved task up');
                return true;
            }
            break;

        case 'ArrowDown':
            if (currentTaskIndex < tasks.length - 1) {
                e.preventDefault();
                moveTask(taskId, columnId, currentTaskIndex + 1);
                announce('Moved task down');
                return true;
            }
            break;

        case 'ArrowLeft':
            if (currentColumnIndex > 0) {
                e.preventDefault();
                const newColumn = columns[currentColumnIndex - 1];
                moveTask(taskId, newColumn.id, 0);
                announce(`Moved task to ${newColumn.title}`);
                return true;
            }
            break;

        case 'ArrowRight':
            if (currentColumnIndex < columns.length - 1) {
                e.preventDefault();
                const newColumn = columns[currentColumnIndex + 1];
                moveTask(taskId, newColumn.id, 0);
                announce(`Moved task to ${newColumn.title}`);
                return true;
            }
            break;
    }

    return false;
};

export { setDragState, setDropTarget };
