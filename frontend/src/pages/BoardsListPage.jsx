import { createSignal, createEffect, For, Show, createMemo, Index } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { boardsState, setBoards } from '../store/kanbanStore';
import { boardApi } from '../utils/api';
import { Button } from '../components/common';
import '../styles/pages/boards-list.css';

// Column presets
const COLUMN_PRESETS = {
    kanban: [
        { title: 'To Do', order: 0, color: 'var(--column-todo)' },
        { title: 'In Progress', order: 1, color: 'var(--column-progress)' },
        { title: 'Done', order: 2, color: 'var(--column-done)' }
    ],
    scrum: [
        { title: 'Backlog', order: 0, color: 'var(--column-todo)' },
        { title: 'Sprint', order: 1, color: 'var(--column-todo)' },
        { title: 'In Progress', order: 2, color: 'var(--column-progress)' },
        { title: 'Review', order: 3, color: 'var(--column-review)' },
        { title: 'Done', order: 4, color: 'var(--column-done)' }
    ],
    simple: [
        { title: 'Tasks', order: 0, color: 'var(--column-todo)' },
        { title: 'Completed', order: 1, color: 'var(--column-done)' }
    ]
};

export default function BoardsListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = createSignal(true);
    const [newBoardTitle, setNewBoardTitle] = createSignal('');
    const [newBoardTags, setNewBoardTags] = createSignal('');
    const [isCreating, setIsCreating] = createSignal(false);

    // Column customization state
    const [selectedPreset, setSelectedPreset] = createSignal('kanban');
    const [customColumns, setCustomColumns] = createSignal([]);
    const [showCustomEditor, setShowCustomEditor] = createSignal(false);

    // Filter state
    const [searchQuery, setSearchQuery] = createSignal('');
    const [selectedTag, setSelectedTag] = createSignal('');

    // Load boards on mount
    createEffect(async () => {
        setLoading(true);
        try {
            const boards = await boardApi.getAll();
            setBoards(boards);
        } catch (err) {
            console.error("Failed to load boards", err);
        } finally {
            setLoading(false);
        }
    });

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardTitle().trim()) return;

        setIsCreating(true);
        try {
            const tags = newBoardTags().split(',').map(t => t.trim()).filter(Boolean);

            // Get columns based on selection
            let columns;
            if (showCustomEditor() && customColumns().length > 0) {
                columns = customColumns();
            } else {
                columns = COLUMN_PRESETS[selectedPreset()];
            }

            // Ensure every column has an order field
            columns = columns.map((col, index) => ({
                ...col,
                order: col.order ?? index
            }));

            const newBoard = await boardApi.create({
                title: newBoardTitle(),
                tags: tags,
                columns: columns
            });
            setBoards([...boardsState.boards, newBoard]);
            setNewBoardTitle('');
            setNewBoardTags('');
            setSelectedPreset('kanban');
            setCustomColumns([]);
            setShowCustomEditor(false);
            navigate(`/board/${newBoard._id}`);
        } catch (err) {
            console.error("Failed to create board", err);
        } finally {
            setIsCreating(false);
        }
    };

    // Column management helpers
    const addCustomColumn = () => {
        setCustomColumns([...customColumns(), { title: '', color: 'var(--column-todo)' }]);
    };

    const updateCustomColumn = (index, field, value) => {
        const updated = [...customColumns()];
        updated[index] = { ...updated[index], [field]: value };
        setCustomColumns(updated);
    };

    const removeCustomColumn = (index) => {
        setCustomColumns(customColumns().filter((_, i) => i !== index));
    };

    const handleDeleteBoard = async (e, boardId) => {
        e.stopPropagation(); // Prevent navigation when clicking delete

        if (!confirm('Are you sure you want to delete this board? All tasks will be lost.')) {
            return;
        }

        try {
            await boardApi.delete(boardId);
            setBoards(boardsState.boards.filter(b => (b._id || b.id) !== boardId));
        } catch (err) {
            console.error("Failed to delete board", err);
            alert('Failed to delete board. Please try again.');
        }
    };

    // Get all unique tags from boards
    const allTags = createMemo(() => {
        const tags = new Set();
        boardsState.boards.forEach(board => {
            if (board.tags && Array.isArray(board.tags)) {
                board.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    });

    // Filter boards by name and tags
    const filteredBoards = createMemo(() => {
        let result = boardsState.boards;

        // Filter by search query
        const query = searchQuery().toLowerCase().trim();
        if (query) {
            result = result.filter(board =>
                board.title.toLowerCase().includes(query)
            );
        }

        // Filter by selected tag
        if (selectedTag()) {
            result = result.filter(board =>
                board.tags && board.tags.includes(selectedTag())
            );
        }

        return result;
    });

    return (
        <div class="boards-page">
            <header class="boards-header glass-strong">
                <h1>My Boards</h1>
            </header>

            {/* Filter Controls */}
            <div class="boards-filters">
                <input
                    type="text"
                    class="boards-search"
                    placeholder="Search boards..."
                    value={searchQuery()}
                    onInput={(e) => setSearchQuery(e.target.value)}
                />
                <div class="boards-tags-filter">
                    <button
                        class={`tag-filter ${!selectedTag() ? 'tag-filter--active' : ''}`}
                        onClick={() => setSelectedTag('')}
                    >
                        All
                    </button>
                    <For each={allTags()}>
                        {(tag) => (
                            <button
                                class={`tag-filter ${selectedTag() === tag ? 'tag-filter--active' : ''}`}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </button>
                        )}
                    </For>
                </div>
            </div>

            <main class="boards-container">
                <div class="boards-grid">
                    {/* Create New Board Card */}
                    <div class="board-card board-card--create glass">
                        <form onSubmit={handleCreateBoard}>
                            <h3>Create New Board</h3>
                            <input
                                type="text"
                                value={newBoardTitle()}
                                onInput={(e) => setNewBoardTitle(e.target.value)}
                                placeholder="Board Title"
                                class="board-input"
                                disabled={isCreating()}
                            />
                            <input
                                type="text"
                                value={newBoardTags()}
                                onInput={(e) => setNewBoardTags(e.target.value)}
                                placeholder="Tags (comma separated)"
                                class="board-input"
                                disabled={isCreating()}
                            />

                            {/* Column Preset Selector */}
                            <div class="column-preset-section">
                                <label class="preset-label">Columns</label>
                                <div class="preset-buttons">
                                    <button
                                        type="button"
                                        class={`preset-btn ${selectedPreset() === 'simple' && !showCustomEditor() ? 'preset-btn--active' : ''}`}
                                        onClick={() => { setSelectedPreset('simple'); setShowCustomEditor(false); }}
                                    >
                                        Simple (2)
                                    </button>
                                    <button
                                        type="button"
                                        class={`preset-btn ${selectedPreset() === 'kanban' && !showCustomEditor() ? 'preset-btn--active' : ''}`}
                                        onClick={() => { setSelectedPreset('kanban'); setShowCustomEditor(false); }}
                                    >
                                        Kanban (3)
                                    </button>
                                    <button
                                        type="button"
                                        class={`preset-btn ${selectedPreset() === 'scrum' && !showCustomEditor() ? 'preset-btn--active' : ''}`}
                                        onClick={() => { setSelectedPreset('scrum'); setShowCustomEditor(false); }}
                                    >
                                        Scrum (5)
                                    </button>
                                    <button
                                        type="button"
                                        class={`preset-btn ${showCustomEditor() ? 'preset-btn--active' : ''}`}
                                        onClick={() => {
                                            setShowCustomEditor(true);
                                            if (customColumns().length === 0) {
                                                setCustomColumns([{ title: '', color: 'var(--column-todo)' }]);
                                            }
                                        }}
                                    >
                                        Custom
                                    </button>
                                </div>

                                {/* Preview selected columns */}
                                <Show when={!showCustomEditor()}>
                                    <div class="preset-preview">
                                        <For each={COLUMN_PRESETS[selectedPreset()]}>
                                            {(col) => (
                                                <span class="preset-column" style={{ 'border-left-color': col.color }}>
                                                    {col.title}
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                </Show>

                                {/* Custom Column Editor */}
                                <Show when={showCustomEditor()}>
                                    <div class="custom-columns-editor">
                                        <Index each={customColumns()}>
                                            {(col, index) => (
                                                <div class="custom-column-row">
                                                    <input
                                                        type="text"
                                                        value={col().title}
                                                        onInput={(e) => updateCustomColumn(index, 'title', e.target.value)}
                                                        placeholder={`Column ${index + 1}`}
                                                        class="custom-column-input"
                                                    />
                                                    <select
                                                        value={col().color}
                                                        onChange={(e) => updateCustomColumn(index, 'color', e.target.value)}
                                                        class="custom-column-color"
                                                    >
                                                        <option value="var(--column-todo)">Blue</option>
                                                        <option value="var(--column-progress)">Yellow</option>
                                                        <option value="var(--column-review)">Purple</option>
                                                        <option value="var(--column-done)">Green</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        class="custom-column-remove"
                                                        onClick={() => removeCustomColumn(index)}
                                                        disabled={customColumns().length <= 1}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </Index>
                                        <button
                                            type="button"
                                            class="add-column-btn"
                                            onClick={addCustomColumn}
                                        >
                                            + Add Column
                                        </button>
                                    </div>
                                </Show>
                            </div>

                            <Button type="submit" disabled={isCreating() || !newBoardTitle().trim()}>
                                {isCreating() ? 'Creating...' : 'Create Board'}
                            </Button>
                        </form>
                    </div>

                    {/* Existing Boards */}
                    <For each={filteredBoards()}>
                        {(board) => (
                            <div
                                class="board-card glass"
                                onClick={() => navigate(`/board/${board._id || board.id}`)}
                            >
                                {/* Delete Button */}
                                <button
                                    class="board-card__delete"
                                    onClick={(e) => handleDeleteBoard(e, board._id || board.id)}
                                    title="Delete board"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>

                                <div class="board-card__content">
                                    <h3 class="board-title">{board.title}</h3>
                                    {board.tags && board.tags.length > 0 && (
                                        <div class="board-tags">
                                            <For each={board.tags}>
                                                {(tag) => (
                                                    <span class="board-tag">{tag}</span>
                                                )}
                                            </For>
                                        </div>
                                    )}
                                    <p class="board-meta">
                                        Last updated: {new Date(board.updatedAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                                <div class="board-card__footer">
                                    <span class="board-arrow">→</span>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </main>
        </div>
    );
}
