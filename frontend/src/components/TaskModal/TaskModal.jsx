import { createSignal, createEffect, onMount, For, Show } from 'solid-js';
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

    // Load task data when modal opens or selectedTaskId changes
    createEffect(async () => {
        const isOpen = isTaskModalOpen();
        const taskId = selectedTaskId();

        if (isOpen && taskId) {
            setLoading(true);
            try {
                // In a real app we might fetch fresh data, or use props.
                // For now, let's assume we can fetch it or find it in the store.
                // Since we don't have a direct "getTask" in store that returns synchronously without fetching,
                // we'll simulate a fetch or use the api if available.
                const task = await taskApi.getById(taskId);
                if (task) {
                    setTitle(task.title);
                    setDescription(task.description || '');
                    setPriority(task.priority || 'medium');
                    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                    setColumnId(task.columnId);
                }
            } catch (err) {
                console.error("Failed to load task details", err);
            } finally {
                setLoading(false);
            }
        } else if (isOpen && !taskId) {
            // New task mode (if we reuse this modal for creating new tasks from a global button)
            // Reset fields
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
        }
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
                dueDate: dueDate() ? new Date(dueDate()).toISOString() : null
            };

            if (taskId) {
                await taskApi.update(taskId, payload);
                // Trigger a refresh of the board or update local store
                if (props.onTaskUpdated) {
                    props.onTaskUpdated();
                }
            } else {
                // Create logic if needed here
            }
            handleClose();
        } catch (err) {
            console.error("Failed to save task", err);
        } finally {
            setLoading(false);
        }
    };

    // Close on escape
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
