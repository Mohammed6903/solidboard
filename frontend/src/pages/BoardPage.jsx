import { createSignal, onMount, Show, For, createEffect, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { Button } from '../components/common';
import { currentUser, logout } from '../store/authStore';
import { boardApi, taskApi, tagApi } from '../utils/api';
import { announce } from '../utils/accessibility';
import { getDragState } from '../utils/dragAndDrop';
import { TaskCard } from '../components/TaskCard/TaskCard';
import TaskModal from '../components/TaskModal/TaskModal';
import '../styles/components/board.css';

export default function BoardPage() {
    const navigate = useNavigate();
    const params = useParams();
    const [board, setBoard] = createSignal(null);
    const [tasks, setTasks] = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal('');

    // Filter state
    const [searchQuery, setSearchQuery] = createSignal('');
    const [priorityFilter, setPriorityFilter] = createSignal('all');
    const [tagFilter, setTagFilter] = createSignal('all');
    const [availableTags, setAvailableTags] = createSignal([]);

    // New task form state (enhanced)
    const [addingTaskColumnId, setAddingTaskColumnId] = createSignal(null);
    const [newTaskTitle, setNewTaskTitle] = createSignal('');
    const [newTaskDescription, setNewTaskDescription] = createSignal('');
    const [newTaskPriority, setNewTaskPriority] = createSignal('medium');
    const [newTaskDueDate, setNewTaskDueDate] = createSignal('');
    const [newTaskTags, setNewTaskTags] = createSignal([]);
    const [tagInput, setTagInput] = createSignal('');
    const [showTagDropdown, setShowTagDropdown] = createSignal(false);
    const [savingTask, setSavingTask] = createSignal(false);

    let taskInputRef;

    // Load board and tasks based on route param
    const loadBoardData = async () => {
        const boardId = params.boardId;
        if (!boardId) return;

        setLoading(true);
        try {
            const { board: boardData, tasks: boardTasks } = await boardApi.getById(boardId);
            setBoard(boardData);
            setTasks(boardTasks);

            // Load available tags
            const tags = await tagApi.getAll();
            setAvailableTags(tags);
        } catch (err) {
            setError(err.message);
            console.error('Failed to load board:', err);
        } finally {
            setLoading(false);
        }
    };

    createEffect(() => {
        if (params.boardId) {
            loadBoardData();
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

    // Filter tasks based on search, priority, and tags
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

        // Filter by tag
        if (tagFilter() !== 'all') {
            result = result.filter(t => t.tags && t.tags.includes(tagFilter()));
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
    const hasActiveFilters = () => searchQuery().trim() || priorityFilter() !== 'all' || tagFilter() !== 'all';

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setPriorityFilter('all');
        setTagFilter('all');
    };

    // Reset task form
    const resetTaskForm = () => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setNewTaskTags([]);
        setTagInput('');
        setShowTagDropdown(false);
        setAddingTaskColumnId(null);
    };

    // Tag helper functions
    const addTagToTask = (tag) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !newTaskTags().includes(trimmedTag)) {
            setNewTaskTags([...newTaskTags(), trimmedTag]);
        }
        setTagInput('');
        setShowTagDropdown(false);
    };

    const removeTagFromTask = (tag) => {
        setNewTaskTags(newTaskTags().filter(t => t !== tag));
    };

    const getFilteredTagSuggestions = () => {
        const input = tagInput().toLowerCase().trim();
        if (!input) return availableTags().filter(t => !newTaskTags().includes(t));
        return availableTags().filter(t =>
            t.toLowerCase().includes(input) && !newTaskTags().includes(t)
        );
    };

    // Add new task (enhanced)
    const handleAddTask = async (columnId) => {
        const title = newTaskTitle().trim();
        if (!title || savingTask()) return;

        setSavingTask(true);
        try {
            const taskData = {
                boardId: board()?.id || board()?._id,
                columnId,
                title,
                description: newTaskDescription().trim(),
                priority: newTaskPriority(),
                tags: newTaskTags(),
            };

            // Add due date if set
            if (newTaskDueDate()) {
                taskData.dueDate = new Date(newTaskDueDate()).toISOString();
            }

            const newTask = await taskApi.create(taskData);

            setTasks(prev => [...prev, newTask]);

            // Refresh available tags in case new ones were added
            const updatedTags = await tagApi.getAll();
            setAvailableTags(updatedTags);

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

            // Refresh tasks from API using the correct board ID
            const boardId = board()?.id || board()?._id;
            if (boardId) {
                const { tasks: refreshedTasks } = await boardApi.getById(boardId);
                setTasks(refreshedTasks);
            }
            announce('Task moved');
        } catch (err) {
            setError(err.message);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        const dragState = getDragState();

        if (!dragState.isDragging || dragState.draggedType !== 'task') {
            return;
        }

        const taskId = dragState.draggedId;
        const sourceColumnId = dragState.sourceColumnId;

        // Don't do anything if dropping in the same column
        if (sourceColumnId === columnId) {
            return;
        }

        // Move the task to the new column
        await handleMoveTask(taskId, columnId, 0);
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
            <header class="board-header glass-strong">
                <div class="board-header__left">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/boards')}>
                        ←
                    </Button>
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
                    </Button>
                </div>
            </header>

            {/* Filter Bar */}
            <div class="filter-bar">
                <div class="filter-bar__search">
                    <svg class="filter-bar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        class="filter-bar__search-input"
                        placeholder="Filter tasks..."
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
                        Med
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

                {/* Tag Filter Dropdown */}
                <Show when={availableTags().length > 0}>
                    <div class="filter-bar__tag-filter">
                        <select
                            class="filter-bar__tag-select"
                            value={tagFilter()}
                            onChange={(e) => setTagFilter(e.target.value)}
                        >
                            <option value="all">All Tags</option>
                            <For each={availableTags()}>
                                {(tag) => (
                                    <option value={tag}>{tag}</option>
                                )}
                            </For>
                        </select>
                    </div>
                </Show>

                <Show when={hasActiveFilters()}>
                    <button class="filter-bar__clear" onClick={clearFilters}>
                        Clear
                    </button>
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
                                class={`column ${getDragState().draggedId && getDragState().draggedType === 'task' ? 'column--droppable' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.id)}
                            >
                                <div class="column__header">
                                    <h2 class="column__title">
                                        <span
                                            class="column__color"
                                            style={{ background: column.color }}
                                        ></span>
                                        {column.title}
                                        <span class="column__count">
                                            {getColumnTasks(column.id).length}
                                        </span>
                                    </h2>
                                </div>

                                <div class="column__tasks">
                                    <For each={getColumnTasks(column.id)}>
                                        {(task, index) => (
                                            <TaskCard
                                                task={task}
                                                index={index()}
                                                columnId={column.id}
                                                onDelete={() => handleDeleteTask(task._id)}
                                            />
                                        )}
                                    </For>
                                </div>


                                {/* Enhanced Add Task Area */}
                                <Show when={addingTaskColumnId() === column.id} fallback={
                                    <button
                                        class="column__add-btn"
                                        onClick={() => setAddingTaskColumnId(column.id)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        Create Task
                                    </button>
                                }>
                                    <div class="column__add-form glass">
                                        <input
                                            ref={taskInputRef}
                                            type="text"
                                            class="column__task-input"
                                            placeholder="Task title *"
                                            value={newTaskTitle()}
                                            onInput={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddTask(column.id);
                                                } else if (e.key === 'Escape') {
                                                    resetTaskForm();
                                                }
                                            }}
                                            disabled={savingTask()}
                                        />
                                        <textarea
                                            class="column__task-textarea"
                                            placeholder="Description (optional)"
                                            value={newTaskDescription()}
                                            onInput={(e) => setNewTaskDescription(e.target.value)}
                                            disabled={savingTask()}
                                            rows="2"
                                        />
                                        <div class="column__task-details">
                                            <select
                                                class="column__task-select"
                                                value={newTaskPriority()}
                                                onChange={(e) => setNewTaskPriority(e.target.value)}
                                                disabled={savingTask()}
                                            >
                                                <option value="low">Low Priority</option>
                                                <option value="medium">Medium Priority</option>
                                                <option value="high">High Priority</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                            <input
                                                type="date"
                                                class="column__task-date"
                                                value={newTaskDueDate()}
                                                onInput={(e) => setNewTaskDueDate(e.target.value)}
                                                disabled={savingTask()}
                                                placeholder="Due date"
                                            />
                                        </div>

                                        {/* Tag Input Combobox */}
                                        <div class="column__tag-input-wrapper">
                                            <div class="column__selected-tags">
                                                <For each={newTaskTags()}>
                                                    {(tag) => (
                                                        <span class="column__tag-pill">
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                class="column__tag-remove"
                                                                onClick={() => removeTagFromTask(tag)}
                                                            >×</button>
                                                        </span>
                                                    )}
                                                </For>
                                            </div>
                                            <div class="column__tag-combobox">
                                                <input
                                                    type="text"
                                                    class="column__tag-input"
                                                    placeholder={newTaskTags().length > 0 ? "Add another tag..." : "Add tags..."}
                                                    value={tagInput()}
                                                    onInput={(e) => {
                                                        setTagInput(e.target.value);
                                                        setShowTagDropdown(true);
                                                    }}
                                                    onFocus={() => setShowTagDropdown(true)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && tagInput().trim()) {
                                                            e.preventDefault();
                                                            addTagToTask(tagInput());
                                                        } else if (e.key === 'Escape') {
                                                            setShowTagDropdown(false);
                                                        }
                                                    }}
                                                    disabled={savingTask()}
                                                />
                                                <Show when={showTagDropdown() && (getFilteredTagSuggestions().length > 0 || tagInput().trim())}>
                                                    <div class="column__tag-dropdown">
                                                        <For each={getFilteredTagSuggestions()}>
                                                            {(tag) => (
                                                                <button
                                                                    type="button"
                                                                    class="column__tag-option"
                                                                    onClick={() => addTagToTask(tag)}
                                                                >
                                                                    {tag}
                                                                </button>
                                                            )}
                                                        </For>
                                                        <Show when={tagInput().trim() && !availableTags().includes(tagInput().trim())}>
                                                            <button
                                                                type="button"
                                                                class="column__tag-option column__tag-option--new"
                                                                onClick={() => addTagToTask(tagInput())}
                                                            >
                                                                + Create "{tagInput().trim()}"
                                                            </button>
                                                        </Show>
                                                    </div>
                                                </Show>
                                            </div>
                                        </div>

                                        <div class="column__add-actions">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddTask(column.id)}
                                                disabled={savingTask() || !newTaskTitle().trim()}
                                            >
                                                {savingTask() ? 'Adding...' : 'Add Task'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={resetTaskForm}
                                                disabled={savingTask()}
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
            <TaskModal onTaskUpdated={loadBoardData} />
        </div>
    );
}
