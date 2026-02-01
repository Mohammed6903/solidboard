import { For, Show, createSignal } from 'solid-js';
import { Button } from '../common';
import { Column } from '../Column/Column';
import { FilterBar } from '../FilterBar/FilterBar';
import {
    getActiveBoard,
    getColumns,
    createColumn,
    resetToMockData,
} from '../../store/kanbanStore';
import { announce } from '../../utils/accessibility';
import '../../styles/components/board.css';

export function Board() {
    const [isAddingColumn, setIsAddingColumn] = createSignal(false);
    const [newColumnTitle, setNewColumnTitle] = createSignal('');

    let inputRef;

    const columns = () => getColumns();
    const board = () => getActiveBoard();

    const handleAddColumn = () => {
        setIsAddingColumn(true);
        setTimeout(() => inputRef?.focus(), 0);
    };

    const handleSubmitColumn = (e) => {
        e?.preventDefault();
        const title = newColumnTitle().trim();
        if (title) {
            createColumn(title);
            setNewColumnTitle('');
            announce(`Created column: ${title}`);
        }
        setIsAddingColumn(false);
    };

    const handleCancelAddColumn = () => {
        setNewColumnTitle('');
        setIsAddingColumn(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleCancelAddColumn();
        } else if (e.key === 'Enter') {
            handleSubmitColumn();
        }
    };

    const handleReset = () => {
        if (confirm('Reset all data to demo state? This cannot be undone.')) {
            resetToMockData();
            announce('Board reset to demo data');
        }
    };

    return (
        <div class="board-wrapper">
            {/* Header */}
            <header class="board-header">
                <div class="board-header__left">
                    <h1 class="board-header__title">{board()?.title || 'Kanban Board'}</h1>
                </div>

                <div class="board-header__right">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        Reset Demo
                    </Button>
                </div>
            </header>

            {/* Filter Bar */}
            <FilterBar />

            {/* Board Columns */}
            <main class="board" role="region" aria-label="Kanban board columns">
                <For each={columns()}>
                    {(column, index) => (
                        <Column column={column} index={index()} />
                    )}
                </For>

                {/* Add Column */}
                <Show when={!isAddingColumn()} fallback={
                    <form class="board__add-column-form" onSubmit={handleSubmitColumn}>
                        <input
                            ref={inputRef}
                            type="text"
                            class="input"
                            placeholder="Column title..."
                            value={newColumnTitle()}
                            onInput={(e) => setNewColumnTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div class="board__add-column-actions">
                            <Button type="submit" size="sm">Add Column</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={handleCancelAddColumn}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                }>
                    <button class="board__add-column" onClick={handleAddColumn}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Column
                    </button>
                </Show>
            </main>
        </div>
    );
}
