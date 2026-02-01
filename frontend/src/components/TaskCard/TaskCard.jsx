import { Show, For, createMemo } from 'solid-js';
import { Avatar } from '../common';
import {
    getUserById,
    getLabelById,
    setSelectedTaskId,
    setIsTaskModalOpen
} from '../../store/kanbanStore';
import {
    startDrag,
    endDrag,
    getDragState
} from '../../utils/dragAndDrop';
import { formatDueDate } from '../../utils/helpers';
import { getPriorityLabel } from '../../utils/accessibility';
import '../../styles/components/task-card.css';

export function TaskCard(props) {
    const assignee = createMemo(() =>
        props.task.assigneeId ? getUserById(props.task.assigneeId) : null
    );

    const labels = createMemo(() =>
        props.task.labels.map(id => getLabelById(id)).filter(Boolean)
    );

    const dueInfo = createMemo(() => formatDueDate(props.task.dueDate));

    const isDragging = createMemo(() =>
        getDragState().draggedId === props.task.id
    );

    const handleClick = () => {
        setSelectedTaskId(props.task.id);
        setIsTaskModalOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', props.task.id);
        startDrag(props.task.id, 'task', props.task.columnId, props.index);
    };

    const handleDragEnd = () => {
        endDrag();
    };

    return (
        <article
            class={`task-card ${isDragging() ? 'task-card--dragging' : ''}`}
            draggable="true"
            tabIndex="0"
            role="option"
            aria-selected="false"
            aria-label={`${props.task.title}, ${getPriorityLabel(props.task.priority)}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Priority Indicator */}
            <div class={`task-card__priority task-card__priority--${props.task.priority}`} />

            <div class="task-card__content">
                {/* Labels */}
                <Show when={labels().length > 0}>
                    <div class="task-card__labels">
                        <For each={labels().slice(0, 3)}>
                            {(label) => (
                                <span
                                    class="task-card__label"
                                    style={{ background: label.color, color: 'white' }}
                                >
                                    {label.name}
                                </span>
                            )}
                        </For>
                        <Show when={labels().length > 3}>
                            <span class="task-card__label">+{labels().length - 3}</span>
                        </Show>
                    </div>
                </Show>

                {/* Title */}
                <h4 class="task-card__title">{props.task.title}</h4>

                {/* Footer */}
                <div class="task-card__footer">
                    <div class="task-card__meta">
                        {/* Due Date */}
                        <Show when={dueInfo()}>
                            <span class={`task-card__due ${dueInfo().isOverdue ? 'task-card__due--overdue' :
                                    dueInfo().isUrgent ? 'task-card__due--urgent' : ''
                                }`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                {dueInfo().label}
                            </span>
                        </Show>

                        {/* Comments Count */}
                        <Show when={props.task.comments.length > 0}>
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
