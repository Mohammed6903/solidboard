import { createSignal, createEffect, createMemo, For, Show } from 'solid-js';
import {
    isTaskModalOpen,
    setIsTaskModalOpen,
    selectedTaskId,
    setSelectedTaskId
} from '../../store/kanbanStore';
import { taskApi } from '../../utils/api';
import { Button } from '../common';
import '../../styles/components/task-modal.css';

export default function TaskModal(props) {
    const [title, setTitle] = createSignal('');
    const [description, setDescription] = createSignal('');
    const [priority, setPriority] = createSignal('medium');
    const [dueDate, setDueDate] = createSignal('');
    const [columnId, setColumnId] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    // Tag editing state
    const [taskTags, setTaskTags] = createSignal([]);
    const [tagInput, setTagInput] = createSignal('');
    const [showTagDropdown, setShowTagDropdown] = createSignal(false);

    // Available tags from props
    const availableTags = () => props.availableTags || [];

    // Filtered suggestions based on input
    const filteredSuggestions = createMemo(() => {
        const query = tagInput().toLowerCase().trim();
        if (!query) return [];
        const current = taskTags();
        return availableTags()
            .filter(tag =>
                tag.toLowerCase().includes(query) &&
                !current.includes(tag)
            )
            .slice(0, 8);
    });

    // Whether to show "create new" option
    const showCreateOption = createMemo(() => {
        const query = tagInput().trim();
        if (!query) return false;
        const existing = availableTags().find(t => t.toLowerCase() === query.toLowerCase());
        const alreadyAdded = taskTags().includes(query);
        return !existing && !alreadyAdded;
    });

    // Load task data when modal opens or selectedTaskId changes
    createEffect(() => {
        const isOpen = isTaskModalOpen();
        const taskId = selectedTaskId();

        if (isOpen && taskId) {
            setLoading(true);
            try {
                const task = props.tasks?.find(t => (t._id || t.id) === taskId);
                if (task) {
                    setTitle(task.title || '');
                    setDescription(task.description || '');
                    setPriority(task.priority || 'medium');
                    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                    setColumnId(task.columnId || '');
                    setTaskTags(task.labels || task.tags || []);
                }
            } catch (err) {
                console.error("Failed to load task details", err);
            } finally {
                setLoading(false);
            }
        } else if (isOpen && !taskId) {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setTaskTags([]);
        }
        // Reset tag input
        setTagInput('');
        setShowTagDropdown(false);
    });

    const handleClose = () => {
        setIsTaskModalOpen(false);
        setSelectedTaskId(null);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const taskId = selectedTaskId();
            const payload = {
                title: title(),
                description: description(),
                priority: priority(),
                dueDate: dueDate() ? new Date(dueDate()).toISOString() : null,
                tags: taskTags()
            };

            if (taskId) {
                await taskApi.update(taskId, payload);
                if (props.onTaskUpdated) {
                    props.onTaskUpdated();
                }
            }
            handleClose();
        } catch (err) {
            console.error("Failed to save task", err);
        } finally {
            setLoading(false);
        }
    };

    const addTag = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !taskTags().includes(trimmed)) {
            setTaskTags([...taskTags(), trimmed]);
        }
        setTagInput('');
        setShowTagDropdown(false);
    };

    const removeTag = (tagToRemove) => {
        setTaskTags(taskTags().filter(t => t !== tagToRemove));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput().trim();
            if (val) addTag(val);
        } else if (e.key === 'Escape') {
            setShowTagDropdown(false);
        } else if (e.key === 'Backspace' && !tagInput() && taskTags().length > 0) {
            setTaskTags(taskTags().slice(0, -1));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleClose();
    };

    return (
        <Show when={isTaskModalOpen()}>
            <div class="modal-overlay" onClick={handleClose}>
                <div
                    class="modal-content glass-strong"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={handleKeyDown}
                >
                    <div class="modal-header">
                        <h2>{selectedTaskId() ? 'Edit Task' : 'New Task'}</h2>
                        <button class="modal-close" onClick={handleClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={title()}
                                onInput={(e) => setTitle(e.target.value)}
                                placeholder="Task title"
                                class="modal-input"
                            />
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea
                                value={description()}
                                onInput={(e) => setDescription(e.target.value)}
                                placeholder="Add a more detailed description..."
                                class="modal-textarea"
                                rows="5"
                            />
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Priority</label>
                                <select
                                    value={priority()}
                                    onChange={(e) => setPriority(e.target.value)}
                                    class="modal-select"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate()}
                                    onInput={(e) => setDueDate(e.target.value)}
                                    class="modal-input"
                                />
                            </div>
                        </div>

                        {/* Tag Editor */}
                        <div class="form-group">
                            <label>Tags</label>
                            <div class="modal-tag-editor">
                                {/* Selected tags */}
                                <Show when={taskTags().length > 0}>
                                    <div class="modal-selected-tags">
                                        <For each={taskTags()}>
                                            {(tag) => (
                                                <span class="modal-tag-pill">
                                                    {tag}
                                                    <button
                                                        class="modal-tag-remove"
                                                        onClick={() => removeTag(tag)}
                                                        type="button"
                                                    >×</button>
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                </Show>

                                {/* Tag input with dropdown */}
                                <div class="modal-tag-combobox">
                                    <input
                                        type="text"
                                        value={tagInput()}
                                        onInput={(e) => {
                                            setTagInput(e.target.value);
                                            setShowTagDropdown(true);
                                        }}
                                        onFocus={() => { if (tagInput()) setShowTagDropdown(true); }}
                                        onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder={taskTags().length > 0 ? "Add another tag..." : "Search or create tags..."}
                                        class="modal-tag-input"
                                    />

                                    {/* Dropdown suggestions */}
                                    <Show when={showTagDropdown() && (filteredSuggestions().length > 0 || showCreateOption())}>
                                        <div class="modal-tag-dropdown">
                                            <For each={filteredSuggestions()}>
                                                {(suggestion) => (
                                                    <button
                                                        class="modal-tag-option"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            addTag(suggestion);
                                                        }}
                                                        type="button"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                )}
                                            </For>
                                            <Show when={showCreateOption()}>
                                                <button
                                                    class="modal-tag-option modal-tag-option--new"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        addTag(tagInput().trim());
                                                    }}
                                                    type="button"
                                                >
                                                    + Create "{tagInput().trim()}"
                                                </button>
                                            </Show>
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <Button variant="ghost" onClick={handleClose} disabled={loading()}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading()}>
                            {loading() ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </Show>
    );
}
