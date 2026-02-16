import { Show, For, createMemo } from 'solid-js';
import { Avatar } from '../common';
import {
    getUserById,
    setSelectedTaskId,
    setIsTaskModalOpen
} from '../../store/kanbanStore';
import {
    startDrag,
    endDrag,
    getDragState
} from '../../utils/dragAndDrop';
import { formatDueDate } from '../../utils/helpers';
import '../../styles/components/task-card.css';

export function TaskCard(props) {
    const assignee = createMemo(() => {
        if (props.task.assignee && typeof props.task.assignee === 'object') {
            return props.task.assignee;
        }
        return props.task.assigneeId ? getUserById(props.task.assigneeId) : null;
    });

    const dueInfo = createMemo(() => formatDueDate(props.task.dueDate));

    const isDragging = createMemo(() =>
        getDragState().draggedId === (props.task._id || props.task.id)
    );

    const handleClick = () => {
        const taskId = props.task._id || props.task.id;
        setSelectedTaskId(taskId);
        setIsTaskModalOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const handleDragStart = (e) => {
        const taskId = props.task._id || props.task.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
        startDrag(taskId, 'task', props.task.columnId, props.index);
    };

    const handleDragEnd = () => {
        endDrag();
    };

    return (
        <article
            class={`task-card task-card--priority-${props.task.priority} ${isDragging() ? 'task-card--dragging' : ''}`}
            draggable="true"
            tabIndex="0"
            role="option"
            aria-selected="false"
            aria-label={`${props.task.title}, ${props.task.priority} priority`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div class="task-card__content">
                <div class="task-card__header">
                    <h4 class="task-card__title">{props.task.title}</h4>

                    {/* Delete Button (visible on hover via CSS) */}
                    <button
                        class="task-card__delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (props.onDelete) {
                                const taskId = props.task._id || props.task.id;
                                props.onDelete(taskId);
                            }
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Task Tags */}
                <Show when={(props.task.labels || props.task.tags)?.length > 0}>
                    <div class="task-card__tags">
                        <For each={(props.task.labels || props.task.tags).slice(0, 3)}>
                            {(tag) => (
                                <span class="task-card__tag">
                                    {tag}
                                </span>
                            )}
                        </For>
                        <Show when={(props.task.labels || props.task.tags).length > 3}>
                            <span class="task-card__tag task-card__tag--more">+{(props.task.labels || props.task.tags).length - 3}</span>
                        </Show>
                    </div>
                </Show>

                {/* Footer */}
                <div class="task-card__footer">
                    <div class="task-card__meta">
                        {/* Due Date */}
                        <Show when={dueInfo()}>
                            <span class={`task-card__date ${dueInfo().isOverdue ? 'task-card__date--overdue' :
                                dueInfo().isUrgent ? 'task-card__date--soon' :
                                    dueInfo().isToday ? 'task-card__date--today' : ''
                                }`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {dueInfo().label}
                            </span>
                        </Show>

                        {/* Comments Count */}
                        <Show when={props.task.comments && props.task.comments.length > 0}>
                            <span class="task-card__icon">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                {props.task.comments.length}
                            </span>
                        </Show>
                    </div>

                    {/* Assignee */}
                    <Show when={assignee()}>
                        <Avatar
                            size="sm"
                            name={assignee().name}
                            initials={assignee().avatar}
                            color={assignee().color}
                        />
                    </Show>
                </div>
            </div>
        </article>
    );
}
