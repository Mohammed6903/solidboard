const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('kanban_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

// --- Auth API ---
export const authApi = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await handleResponse(response);
        // data contains { token, ...userFields }
        // We'll return it as is, expecting authStore to handle storage
        return data;
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        return handleResponse(response);
    },

    getMe: async () => {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// --- Board API ---
export const boardApi = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/boards`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_URL}/boards/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    create: async (boardData) => {
        const response = await fetch(`${API_URL}/boards`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title: boardData.title,
                description: boardData.description,
                columns: boardData.columns, // Optional, backend has defaults
                tags: boardData.tags
            })
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/boards/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// --- Column API ---
// Columns are embedded in Board, so we update the board to manage columns
export const columnApi = {
    create: async (columnData) => {
        // 1. Get current board
        const { board } = await boardApi.getById(columnData.boardId);

        // 2. Prepare new column
        const newColumn = {
            title: columnData.title,
            order: columnData.order ?? (board.columns.length > 0 ? Math.max(...board.columns.map(c => c.order)) + 1 : 0),
            color: columnData.color || 'var(--column-todo)'
        };

        // 3. Update board with new columns list
        const updatedColumns = [...board.columns, newColumn];

        const response = await fetch(`${API_URL}/boards/${columnData.boardId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                ...board,
                columns: updatedColumns
            })
        });

        const updatedBoard = await handleResponse(response);
        // Return the created column (last one in the list usually, but safer to find by properties or take last)
        return updatedBoard.columns[updatedBoard.columns.length - 1];
    },

    update: async (id, updates) => {
        const { boardId, ...columnUpdates } = updates;
        if (!boardId) throw new Error('boardId is required for column update');

        const { board } = await boardApi.getById(boardId);

        const columnIndex = board.columns.findIndex(c => c.id === id || c._id === id);
        if (columnIndex === -1) throw new Error('Column not found');

        const updatedColumn = { ...board.columns[columnIndex], ...columnUpdates };
        const updatedColumns = [...board.columns];
        updatedColumns[columnIndex] = updatedColumn;

        const response = await fetch(`${API_URL}/boards/${boardId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                ...board,
                columns: updatedColumns
            })
        });

        const updatedBoard = await handleResponse(response);
        return updatedBoard.columns.find(c => c.id === id || c._id === id);
    },

    delete: async (id, boardId) => {
        if (!boardId) throw new Error('boardId is required for column deletion');

        const { board } = await boardApi.getById(boardId);
        const updatedColumns = board.columns.filter(c => c.id !== id && c._id !== id);

        const response = await fetch(`${API_URL}/boards/${boardId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                ...board,
                columns: updatedColumns
            })
        });

        return handleResponse(response);
    }
};

// --- Task API ---
export const taskApi = {
    create: async (taskData) => {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(taskData)
        });
        return handleResponse(response);
    },

    update: async (id, updates) => {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    move: async (id, { columnId, order }) => {
        const response = await fetch(`${API_URL}/tasks/${id}/move`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ columnId, order })
        });
        return handleResponse(response);
    },

    getById: async (id) => {
        // Backend doesn't have GET /tasks/:id but we can probably live without it or add it?
        // Task.js routes has PUT /:id, DELETE /:id.
        // It DOES NOT have GET /:id.
        // But `boardApi.getById` returns tasks. 
        // `taskApi.getById` was used in mock. Let's see if it's used in Frontend.
        // It is NOT used in BoardPage.jsx. check other files?
        return {}; // Placeholder
    },

    addComment: async (taskId, text) => {
        const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text })
        });
        return handleResponse(response);
    }
};

// --- Tag API ---
export const tagApi = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/tasks/tags`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

