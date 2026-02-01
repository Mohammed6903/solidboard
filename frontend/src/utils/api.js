import { createMockData, generateId } from '../store/mockData';

// Storage keys
const STORAGE_KEY = 'kanban_data';
const TOKEN_KEY = 'kanban_token';
const USER_KEY = 'kanban_user';

// Initialize data if empty
const initializeData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const initialData = createMockData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(stored);
};

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get/set data
const getData = () => {
    return initializeData();
};

const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// --- Auth API ---
export const authApi = {
    login: async (email, password) => {
        await delay();
        const data = getData();
        const user = data.users.find(u => u.email === email || true); // Mock login: allow any
        if (user) {
            localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return { user, token: 'mock-jwt-token' };
        }
        throw new Error('Invalid credentials');
    },

    register: async (name, email, password) => {
        await delay();
        const data = getData();
        const newUser = { id: generateId(), name, email, avatar: name[0], color: '#6366f1' };
        data.users.push(newUser);
        saveData(data);

        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        return { user: newUser, token: 'mock-jwt-token' };
    },

    getMe: async () => {
        await delay(200);
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) throw new Error('Not authenticated');
        return JSON.parse(userStr);
    }
};

// --- Board API ---
export const boardApi = {
    getAll: async () => {
        await delay();
        const data = getData();
        return data.boards;
    },

    getById: async (id) => {
        await delay();
        const data = getData();
        const board = data.boards.find(b => b.id === id || b._id === id);
        if (!board) throw new Error('Board not found');

        // Populate columns
        const boardColumns = data.columns.filter(c => c.boardId === id).sort((a, b) => a.order - b.order);

        // Populate tasks
        const boardTasks = data.tasks.filter(t => boardColumns.some(c => c.id === t.columnId));

        return {
            board: { ...board, columns: boardColumns },
            tasks: boardTasks
        };
    },

    create: async (boardData) => {
        await delay();
        const data = getData();
        const newBoard = {
            id: generateId(),
            title: boardData.title,
            description: boardData.description || '',
            tags: boardData.tags || [],
            createdAt: new Date().toISOString(),
            _id: generateId() // Ensure compatibility if mixing id/_id
        };
        // Fix ID consistency
        newBoard.id = newBoard._id;

        data.boards.push(newBoard);

        // Create default columns
        const defaultColumns = [
            { id: generateId(), title: 'To Do', boardId: newBoard.id, order: 0, color: 'var(--column-todo)', _id: generateId() },
            { id: generateId(), title: 'In Progress', boardId: newBoard.id, order: 1, color: 'var(--column-progress)', _id: generateId() },
            { id: generateId(), title: 'Done', boardId: newBoard.id, order: 2, color: 'var(--column-done)', _id: generateId() }
        ];
        defaultColumns.forEach(c => { c.id = c._id; }); // Sync IDs

        data.columns.push(...defaultColumns);
        saveData(data);
        return newBoard;
    },

    delete: async (id) => {
        await delay();
        const data = getData();
        const index = data.boards.findIndex(b => b.id === id || b._id === id);
        if (index === -1) throw new Error('Board not found');
        data.boards.splice(index, 1);
        saveData(data);
        return { success: true };
    }
};

// --- Task API ---
export const taskApi = {
    create: async (taskData) => {
        await delay();
        const data = getData();
        const newTask = {
            id: generateId(),
            _id: generateId(),
            ...taskData,
            tags: taskData.tags || [],
            createdAt: new Date().toISOString(),
            comments: []
        };
        newTask.id = newTask._id;

        // Auto-add new tags to taskTags storage
        if (newTask.tags && newTask.tags.length > 0) {
            if (!data.taskTags) data.taskTags = [];
            newTask.tags.forEach(tag => {
                if (!data.taskTags.includes(tag)) {
                    data.taskTags.push(tag);
                }
            });
        }

        data.tasks.push(newTask);
        saveData(data);
        return newTask;
    },

    update: async (id, updates) => {
        await delay();
        const data = getData();
        const index = data.tasks.findIndex(t => t.id === id || t._id === id);
        if (index === -1) throw new Error('Task not found');

        // Auto-add new tags to taskTags storage
        if (updates.tags && updates.tags.length > 0) {
            if (!data.taskTags) data.taskTags = [];
            updates.tags.forEach(tag => {
                if (!data.taskTags.includes(tag)) {
                    data.taskTags.push(tag);
                }
            });
        }

        const updatedTask = { ...data.tasks[index], ...updates, updatedAt: new Date().toISOString() };
        data.tasks[index] = updatedTask;
        saveData(data);
        return updatedTask;
    },

    delete: async (id) => {
        await delay();
        const data = getData();
        data.tasks = data.tasks.filter(t => t.id !== id && t._id !== id);
        saveData(data);
        return { success: true };
    },

    move: async (id, { columnId, order }) => {
        await delay();
        const data = getData();
        const task = data.tasks.find(t => t.id === id || t._id === id);
        if (!task) throw new Error('Task not found');

        task.columnId = columnId;
        task.order = order; // Simplified reordering
        saveData(data);
        return task;
    },

    getById: async (id) => {
        await delay();
        const data = getData();
        const task = data.tasks.find(t => t.id === id || t._id === id);
        if (!task) throw new Error('Task not found');
        return task;
    }
};

// --- Tag API ---
export const tagApi = {
    getAll: async () => {
        await delay(100);
        const data = getData();
        return data.taskTags || [];
    }
};
