import { createSignal, onMount, Show, For, createEffect, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Button } from '../components/common';
import { currentUser, logout } from '../store/authStore';
import { boardApi, taskApi } from '../utils/api';
import { announce } from '../utils/accessibility';
import '../styles/components/board.css';

export default function BoardPage() {
    const navigate = useNavigate();
    const [board, setBoard] = createSignal(null);
    const [tasks, setTasks] = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal('');

    // Filter state
    const [searchQuery, setSearchQuery] = createSignal('');
    const [priorityFilter, setPriorityFilter] = createSignal('all');

    // New task form state (enhanced)
    const [addingTaskColumnId, setAddingTaskColumnId] = createSignal(null);
    const [newTaskTitle, setNewTaskTitle] = createSignal('');
    const [newTaskDescription, setNewTaskDescription] = createSignal('');
    const [newTaskPriority, setNewTaskPriority] = createSignal('medium');
    const [newTaskDueDate, setNewTaskDueDate] = createSignal('');
    const [savingTask, setSavingTask] = createSignal(false);

    // Drag state
    const [draggedTask, setDraggedTask] = createSignal(null);

    let taskInputRef;

    // Load board and tasks on mount
    onMount(async () => {
        try {
            const boards = await boardApi.getAll();

            let activeBoard;
            if (boards.length === 0) {
                activeBoard = await boardApi.create({ title: 'My First Board' });
            } else {
                activeBoard = boards[0];
            }

            const { board: boardData, tasks: boardTasks } = await boardApi.getById(activeBoard._id);
            setBoard(boardData);
            setTasks(boardTasks);
        } catch (err) {
            setError(err.message);
            console.error('Failed to load board:', err);
        } finally {
            setLoading(false);
        }
    });

    // Focus input when adding task
    createEffect(() => {
        if (addingTaskColumnId() && taskInputRef) {
            taskInputRef.focus();
        }
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Filter tasks based on search and priority
    const filteredTasks = createMemo(() => {
        let result = tasks();

        // Filter by search query
        const query = searchQuery().trim().toLowerCase();
        if (query) {
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
            );
        }

        // Filter by priority
        if (priorityFilter() !== 'all') {
            result = result.filter(t => t.priority === priorityFilter());
        }

        return result;
    });

    // Get tasks for a specific column (with filters applied)
    const getColumnTasks = (columnId) => {
        return filteredTasks()
            .filter(t => t.columnId === columnId)
            .sort((a, b) => a.order - b.order);
    };

    // Check if any filters are active
    const hasActiveFilters = () => searchQuery().trim() || priorityFilter() !== 'all';

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setPriorityFilter('all');
    };

    // Reset task form
    const resetTaskForm = () => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setAddingTaskColumnId(null);
    };

    // Add new task (enhanced)
    const handleAddTask = async (columnId) => {
        const title = newTaskTitle().trim();
        if (!title || savingTask()) return;

        setSavingTask(true);
        try {
            const taskData = {
                boardId: board()._id,
                columnId,
                title,
                description: newTaskDescription().trim(),
                priority: newTaskPriority(),
            };

            // Add due date if set
            if (newTaskDueDate()) {
                taskData.dueDate = new Date(newTaskDueDate()).toISOString();
            }

            const newTask = await taskApi.create(taskData);

            setTasks(prev => [...prev, newTask]);
            resetTaskForm();
            announce(`Task "${title}" created`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingTask(false);
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        try {
            await taskApi.delete(taskId);
            setTasks(prev => prev.filter(t => t._id !== taskId));
            announce('Task deleted');
        } catch (err) {
            setError(err.message);
        }
    };

    // Move task to different column
    const handleMoveTask = async (taskId, newColumnId, newOrder = 0) => {
        try {
            await taskApi.move(taskId, {
                columnId: newColumnId,
                order: newOrder,
            });

            const { tasks: refreshedTasks } = await boardApi.getById(board()._id);
            setTasks(refreshedTasks);
            announce('Task moved');
        } catch (err) {
            setError(err.message);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        const task = draggedTask();
        if (!task || task.columnId === columnId) {
            setDraggedTask(null);
            return;
        }

        await handleMoveTask(task._id, columnId, 0);
        setDraggedTask(null);
    };

    const handleKeyDown = (e, columnId) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask(columnId);
        } else if (e.key === 'Escape') {
            resetTaskForm();
        }
    };

    const user = currentUser();

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#22c55e',
            medium: '#f59e0b',
            high: '#f97316',
            urgent: '#ef4444',
        };
        return colors[priority] || colors.medium;
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            urgent: 'Urgent',
        };
        return labels[priority] || priority;
    };

    // Format due date for display
    const formatDueDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(date);
        dueDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Overdue', class: 'overdue' };
        if (diffDays === 0) return { text: 'Today', class: 'today' };
        if (diffDays === 1) return { text: 'Tomorrow', class: 'soon' };
        if (diffDays <= 7) return { text: `${diffDays} days`, class: 'soon' };

        return {
            text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            class: 'normal'
        };
    };

    // Check if task is overdue
    const isOverdue = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div class="board-wrapper">
            {/* Header */}
            <header class="board-header">
                <div class="board-header__left">
                    <h1 class="board-header__title">
                        {board()?.title || 'Loading...'}
                    </h1>
                </div>

                <div class="board-header__right">
                    <Show when={user}>
                        <div style={{ display: 'flex', 'align-items': 'center', gap: 'var(--space-sm)' }}>
                            <div
                                class="avatar avatar--sm"
                                style={{ background: user.color || 'var(--accent-primary)' }}
                                title={user.name}
                            >
                                {user.avatar || user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', 'font-size': 'var(--font-size-sm)' }}>
                                {user.name}
                            </span>
                        </div>
                    </Show>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </Button>
                </div>
            </header>

            {/* Filter Bar */}
            <div class="filter-bar">
                <div class="filter-bar__search">
                    <svg class="filter-bar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        class="filter-bar__search-input"
                        placeholder="Search tasks..."
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div class="filter-bar__filters">
                    <button
                        class={`filter-bar__filter ${priorityFilter() === 'all' ? 'filter-bar__filter--active' : ''}`}
                        onClick={() => setPriorityFilter('all')}
                    >
                        All
                    </button>
                    <button
                        class={`filter-bar__filter filter-bar__filter--low ${priorityFilter() === 'low' ? 'filter-bar__filter--active' : ''}`}
                        onClick={() => setPriorityFilter('low')}
                    >
                        Low
                    </button>
                    <button
                        class={`filter-bar__filter filter-bar__filter--medium ${priorityFilter() === 'medium' ? 'filter-bar__filter--active' : ''}`}
                        onClick={() => setPriorityFilter('medium')}
                    >
                        Medium
                    </button>
                    <button
                        class={`filter-bar__filter filter-bar__filter--high ${priorityFilter() === 'high' ? 'filter-bar__filter--active' : ''}`}
                        onClick={() => setPriorityFilter('high')}
                    >
                        High
                    </button>
                    <button
                        class={`filter-bar__filter filter-bar__filter--urgent ${priorityFilter() === 'urgent' ? 'filter-bar__filter--active' : ''}`}
                        onClick={() => setPriorityFilter('urgent')}
                    >
                        Urgent
                    </button>
                </div>

                <Show when={hasActiveFilters()}>
                    <button class="filter-bar__clear" onClick={clearFilters}>
                        Clear filters
                    </button>
                </Show>

                <Show when={hasActiveFilters()}>
                    <span class="filter-bar__count">
                        {filteredTasks().length} of {tasks().length} tasks
                    </span>
                </Show>
            </div>

            {/* Error Message */}
            <Show when={error()}>
                <div class="board-error">
                    {error()}
                    <button onClick={() => setError('')}>Dismiss</button>
                </div>
            </Show>

            {/* Board Columns */}
            <Show when={!loading()} fallback={
                <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center', flex: 1 }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading board...</p>
                </div>
            }>
                <main class="board" role="region" aria-label="Kanban board columns">
                    <For each={board()?.columns || []}>
                        {(column) => (
                            <div
                                class="column"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column._id)}
                            >
                                <div class="column__header">
                                    <h2 class="column__title">
                                        <span
                                            class="column__color"
                                            style={{ background: column.color }}
                                        ></span>
                                        {column.title}
                                        <span class="column__count">
                                            {getColumnTasks(column._id).length}
                                        </span>
                                    </h2>
                                </div>

                                <div class="column__tasks">
                                    <For each={getColumnTasks(column._id)}>
                                        {(task) => (
                                            <div
                                                class={`task-card ${isOverdue(task.dueDate) ? 'task-card--overdue' : ''}`}
                                                draggable="true"
                                                onDragStart={(e) => handleDragStart(e, task)}
                                            >
                                                <div class="task-card__header">
                                                    <span
                                                        class="task-card__priority-badge"
                                                        style={{ background: getPriorityColor(task.priority) }}
                                                    >
                                                        {getPriorityLabel(task.priority)}
                                                    </span>
                                                    <button
                                                        class="task-card__delete"
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        title="Delete task"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                            <path d="M18 6L6 18M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <h3 class="task-card__title">{task.title}</h3>
                                                <Show when={task.description}>
                                                    <p class="task-card__desc">{task.description}</p>
                                                </Show>
                                                <div class="task-card__footer">
                                                    <Show when={task.dueDate}>
                                                        {(() => {
                                                            const due = formatDueDate(task.dueDate);
                                                            return (
                                                                <span class={`task-card__due-date task-card__due-date--${due.class}`}>
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                                    </svg>
                                                                    {due.text}
                                                                </span>
                                                            );
                                                        })()}
                                                    </Show>
                                                    <Show when={task.comments?.length > 0}>
                                                        <span class="task-card__comments">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                            </svg>
                                                            {task.comments.length}
                                                        </span>
                                                    </Show>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>

                                {/* Enhanced Add Task Area */}
                                <Show when={addingTaskColumnId() === column._id} fallback={
                                    <button
                                        class="column__add-btn"
                                        onClick={() => setAddingTaskColumnId(column._id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        Add task
                                    </button>
                                }>
                                    <div class="column__add-form">
                                        <input
                                            ref={taskInputRef}
                                            type="text"
                                            class="column__task-input"
                                            placeholder="Task title..."
                                            value={newTaskTitle()}
                                            onInput={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, column._id)}
                                            disabled={savingTask()}
                                        />
                                        <textarea
                                            class="column__task-textarea"
                                            placeholder="Description (optional)..."
                                            value={newTaskDescription()}
                                            onInput={(e) => setNewTaskDescription(e.target.value)}
                                            rows="2"
                                            disabled={savingTask()}
                                        />
                                        <div class="column__task-options">
                                            <div class="column__task-option">
                                                <label>Priority</label>
                                                <select
                                                    class="column__task-select"
                                                    value={newTaskPriority()}
                                                    onChange={(e) => setNewTaskPriority(e.target.value)}
                                                    disabled={savingTask()}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div class="column__task-option">
                                                <label>Due Date</label>
                                                <input
                                                    type="date"
                                                    class="column__task-date"
                                                    value={newTaskDueDate()}
                                                    onInput={(e) => setNewTaskDueDate(e.target.value)}
                                                    disabled={savingTask()}
                                                />
                                            </div>
                                        </div>
                                        <div class="column__add-actions">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddTask(column._id)}
                                                disabled={savingTask() || !newTaskTitle().trim()}
                                            >
                                                {savingTask() ? 'Adding...' : 'Add Task'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={resetTaskForm}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </Show>
                            </div>
                        )}
                    </For>
                </main>
            </Show>
        </div>
    );
}
