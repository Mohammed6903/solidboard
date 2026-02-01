// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('kanban_token');

// API fetch wrapper with auth
export const api = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
};

// Auth endpoints
export const authApi = {
    login: (email, password) =>
        api('/auth/login', { method: 'POST', body: { email, password } }),

    register: (name, email, password) =>
        api('/auth/register', { method: 'POST', body: { name, email, password } }),

    getMe: () => api('/auth/me'),
};

// Board endpoints
export const boardApi = {
    getAll: () => api('/boards'),

    getById: (id) => api(`/boards/${id}`),

    create: (data) => api('/boards', { method: 'POST', body: data }),

    update: (id, data) => api(`/boards/${id}`, { method: 'PUT', body: data }),

    delete: (id) => api(`/boards/${id}`, { method: 'DELETE' }),
};

// Task endpoints
export const taskApi = {
    getByBoard: (boardId) => api(`/tasks/board/${boardId}`),

    create: (data) => api('/tasks', { method: 'POST', body: data }),

    update: (id, data) => api(`/tasks/${id}`, { method: 'PUT', body: data }),

    move: (id, data) => api(`/tasks/${id}/move`, { method: 'PUT', body: data }),

    delete: (id) => api(`/tasks/${id}`, { method: 'DELETE' }),

    addComment: (id, text) =>
        api(`/tasks/${id}/comments`, { method: 'POST', body: { text } }),
};
