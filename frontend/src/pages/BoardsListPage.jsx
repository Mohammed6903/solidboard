import { createSignal, createEffect, For, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { boardsState, setBoards } from '../store/kanbanStore';
import { boardApi } from '../utils/api';
import { Button } from '../components/common';
import '../styles/pages/boards-list.css';

export default function BoardsListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = createSignal(true);
    const [newBoardTitle, setNewBoardTitle] = createSignal('');
    const [newBoardTags, setNewBoardTags] = createSignal('');
    const [isCreating, setIsCreating] = createSignal(false);

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
            const newBoard = await boardApi.create({
                title: newBoardTitle(),
                tags: tags
            });
            setBoards([...boardsState.boards, newBoard]);
            setNewBoardTitle('');
            setNewBoardTags('');
            navigate(`/board/${newBoard._id}`);
        } catch (err) {
            console.error("Failed to create board", err);
        } finally {
            setIsCreating(false);
        }
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
