import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { currentUser } from './authStore';
import { mockUsers, mockLabels } from './mockData'; // Fallback / Utils

// --- Global UI State ---
const [isTaskModalOpen, setIsTaskModalOpen] = createSignal(false);
const [isBoardModalOpen, setIsBoardModalOpen] = createSignal(false);
const [selectedTaskId, setSelectedTaskId] = createSignal(null);

// --- Boards State ---
// In a real app, this would be fetched from backend. 
// We'll use a local store to simulate "global" state across pages for now, 
// or this could wrap API calls.
const [boardsState, setBoardsState] = createStore({
    boards: [],
    activeBoardId: null,
    loading: false,
    error: null
});

// --- Actions ---

function setBoards(boards) {
    setBoardsState('boards', boards);
}

function addBoard(board) {
    setBoardsState('boards', (prev) => [...prev, board]);
}

function updateBoard(boardId, updates) {
    setBoardsState('boards', (b) => b._id === boardId, updates);
}

function deleteBoard(boardId) {
    setBoardsState('boards', (prev) => prev.filter(b => b._id !== boardId));
}

function setActiveBoard(boardId) {
    setBoardsState('activeBoardId', boardId);
}

// --- Helpers ---

export function getUserById(userId) {
    // Try to find in current user or mock users
    const cur = currentUser();
    if (cur && cur._id === userId) return cur;
    return mockUsers.find(u => u.id === userId) || {
        _id: userId,
        name: 'Unassigned',
        avatar: '?',
        color: '#71717a'
    };
}

export function getLabelById(labelId) {
    return mockLabels.find(l => l.id === labelId) || {
        id: labelId,
        name: 'Label',
        color: '#71717a'
    };
}

// --- Exports ---
export {
    isTaskModalOpen,
    setIsTaskModalOpen,
    isBoardModalOpen,
    setIsBoardModalOpen,
    selectedTaskId,
    setSelectedTaskId,
    boardsState,
    setBoards,
    addBoard,
    updateBoard,
    deleteBoard,
    setActiveBoard
};
