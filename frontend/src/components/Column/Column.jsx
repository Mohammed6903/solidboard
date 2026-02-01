import { Show, For, createSignal, createMemo } from 'solid-js';
import { Button } from '../common';
import { TaskCard } from '../TaskCard/TaskCard';
import {
    getFilteredTasksByColumn,
    createTask,
    moveTask,
    updateColumn,
    deleteColumn,
} from '../../store/kanbanStore';
import {
    getDragState,
    getDropTarget,
    updateDropTarget,
    endDrag,
    calculateDropIndex,
} from '../../utils/dragAndDrop';
import { announce } from '../../utils/accessibility';
import '../../styles/components/column.css';

export function Column(props) {
    const [isQuickAddOpen, setIsQuickAddOpen] = createSignal(false);
    const [quickAddTitle, setQuickAddTitle] = createSignal('');
    const [isEditing, setIsEditing] = createSignal(false);
    const [editTitle, setEditTitle] = createSignal('');
    const [showMenu, setShowMenu] = createSignal(false);

    let inputRef;

    const tasks = createMemo(() => getFilteredTasksByColumn(props.column.id));

    const isDragOver = createMemo(() => {
        const target = getDropTarget();
        return target.columnId === props.column.id;
    });

    // Quick Add handlers
    const handleQuickAdd = () => {
        setIsQuickAddOpen(true);
        setTimeout(() => inputRef?.focus(), 0);
    };

    const handleQuickAddSubmit = (e) => {
        e?.preventDefault();
        const title = quickAddTitle().trim();
        if (title) {
            createTask(props.column.id, { title });
            setQuickAddTitle('');
            announce(`Created task: ${title}`);
        }
        setIsQuickAddOpen(false);
    };

    const handleQuickAddCancel = () => {
        setQuickAddTitle('');
        setIsQuickAddOpen(false);
    };

    const handleQuickAddKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleQuickAddCancel();
        } else if (e.key === 'Enter') {
            handleQuickAddSubmit();
        }
    };

    // Column edit handlers
    const handleStartEdit = () => {
        setEditTitle(props.column.title);
        setIsEditing(true);
        setShowMenu(false);
    };

    const handleSaveEdit = () => {
        const title = editTitle().trim();
        if (title && title !== props.column.title) {
            updateColumn(props.column.id, { title });
        }
        setIsEditing(false);
    };

    const handleDeleteColumn = () => {
        if (confirm(`Delete "${props.column.title}" and all its tasks?`)) {
            deleteColumn(props.column.id);
            announce(`Deleted column: ${props.column.title}`);
        }
        setShowMenu(false);
    };

    // Drag and Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        const dragState = getDragState();
        if (!dragState.isDragging || dragState.draggedType !== 'task') return;

        // Calculate drop position
        const taskElements = e.currentTarget.querySelectorAll('.task-card');
        let dropIndex = tasks().length;

        for (let i = 0; i < taskElements.length; i++) {
            const rect = taskElements[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
                dropIndex = i;
                break;
            }
        }

        updateDropTarget(props.column.id, dropIndex, 'before');
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            updateDropTarget(null, null, null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dragState = getDragState();
        const dropTarget = getDropTarget();

        if (!dragState.isDragging || !dropTarget.columnId) return;

        const taskId = dragState.draggedId;
        const isSameColumn = dragState.sourceColumnId === props.column.id;

        const targetIndex = calculateDropIndex(
            tasks().length,
            dropTarget.index,
            'before',
            isSameColumn ? dragState.sourceIndex : -1,
            isSameColumn
        );

        moveTask(taskId, props.column.id, targetIndex);
        announce(`Moved task to ${props.column.title}`);
        endDrag();
    };

    return (
        <section
            class={`column ${isDragOver() ? 'column--drag-over' : ''}`}
            aria-label={`${props.column.title} column, ${tasks().length} tasks`}
        >
            {/* Column Header */}
            <div class="column__header">
                <div class="column__title-wrapper">
                    <div
                        class="column__color"
                        style={{ background: props.column.color }}
                    />

                    <Show when={!isEditing()} fallback={
                        <input
                            type="text"
                            class="input"
                            value={editTitle()}
                            onInput={(e) => setEditTitle(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            autofocus
                        />
                    }>
                        <h3 class="column__title">{props.column.title}</h3>
                    </Show>

                    <span class="column__count">{tasks().length}</span>
                </div>

                <div class="column__actions">
                    <div class="dropdown">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon
                            onClick={() => setShowMenu(!showMenu())}
                            aria-label="Column options"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                            </svg>
                        </Button>

                        <Show when={showMenu()}>
                            <div class="dropdown__menu">
                                <button class="dropdown__item" onClick={handleStartEdit}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Rename
                                </button>
                                <button class="dropdown__item dropdown__item--danger" onClick={handleDeleteColumn}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>

            {/* Column Body */}
            <div
                class="column__body"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div class="column__tasks" role="listbox" aria-label={`Tasks in ${props.column.title}`}>
                    <Show when={tasks().length > 0} fallback={
                        <div class="column__empty">
                            <svg class="column__empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                            <span>No tasks yet</span>
                        </div>
                    }>
                        <For each={tasks()}>
                            {(task, index) => (
                                <TaskCard task={task} index={index()} />
                            )}
                        </For>
                    </Show>
                </div>
            </div>

            {/* Column Footer */}
            <div class="column__footer">
                <Show when={!isQuickAddOpen()} fallback={
                    <form class="column__quick-add" onSubmit={handleQuickAddSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            class="input column__quick-add-input"
                            placeholder="Task title..."
                            value={quickAddTitle()}
                            onInput={(e) => setQuickAddTitle(e.target.value)}
                            onKeyDown={handleQuickAddKeyDown}
                        />
                        <div class="column__quick-add-actions">
                            <Button type="submit" size="sm">Add</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={handleQuickAddCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                }>
                    <Button
                        variant="ghost"
                        class="column__add-btn"
                        onClick={handleQuickAdd}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add task
                    </Button>
                </Show>
            </div>
        </section>
    );
}
