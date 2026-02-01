import { Show, createSignal } from 'solid-js';
import { Button } from '../common';
import {
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    getUsers,
} from '../../store/kanbanStore';
import { debounce } from '../../utils/helpers';
import '../../styles/components/board.css';

export function FilterBar() {
    const [localSearch, setLocalSearch] = createSignal(searchQuery());

    const debouncedSearch = debounce((value) => {
        setSearchQuery(value);
    }, 300);

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setLocalSearch(value);
        debouncedSearch(value);
    };

    const togglePriorityFilter = (priority) => {
        const current = filterOptions();
        setFilterOptions({
            ...current,
            priority: current.priority === priority ? null : priority,
        });
    };

    const clearFilters = () => {
        setLocalSearch('');
        setSearchQuery('');
        setFilterOptions({ assignee: null, priority: null, labels: [] });
    };

    const hasActiveFilters = () => {
        const filters = filterOptions();
        return searchQuery() || filters.priority || filters.assignee || filters.labels.length > 0;
    };

    return (
        <div class="filter-bar">
            <div class="filter-bar__search">
                <svg class="filter-bar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="search"
                    class="input filter-bar__search-input"
                    placeholder="Search tasks..."
                    value={localSearch()}
                    onInput={handleSearchInput}
                    aria-label="Search tasks"
                />
            </div>

            <div class="filter-bar__filters">
                <button
                    class={`filter-bar__filter ${filterOptions().priority === 'urgent' ? 'filter-bar__filter--active' : ''}`}
                    onClick={() => togglePriorityFilter('urgent')}
                >
                    🔴 Urgent
                </button>
                <button
                    class={`filter-bar__filter ${filterOptions().priority === 'high' ? 'filter-bar__filter--active' : ''}`}
                    onClick={() => togglePriorityFilter('high')}
                >
                    🟠 High
                </button>
                <button
                    class={`filter-bar__filter ${filterOptions().priority === 'medium' ? 'filter-bar__filter--active' : ''}`}
                    onClick={() => togglePriorityFilter('medium')}
                >
                    🟡 Medium
                </button>
                <button
                    class={`filter-bar__filter ${filterOptions().priority === 'low' ? 'filter-bar__filter--active' : ''}`}
                    onClick={() => togglePriorityFilter('low')}
                >
                    🟢 Low
                </button>
            </div>

            <Show when={hasActiveFilters()}>
                <button class="filter-bar__clear btn btn--ghost btn--sm" onClick={clearFilters}>
                    Clear filters
                </button>
            </Show>
        </div>
    );
}
