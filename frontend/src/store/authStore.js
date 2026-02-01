import { createSignal } from 'solid-js';
import { authApi } from '../utils/api';

const TOKEN_KEY = 'kanban_token';
const USER_KEY = 'kanban_user';

// Initialize from localStorage
const storedUser = localStorage.getItem(USER_KEY);
const storedToken = localStorage.getItem(TOKEN_KEY);

const [user, setUser] = createSignal(storedUser ? JSON.parse(storedUser) : null);
const [token, setToken] = createSignal(storedToken);
const [loading, setLoading] = createSignal(false);

// Check if user is authenticated
export const isAuthenticated = () => !!token() && !!user();

// Get current user
export const currentUser = () => user();

// Login
export const login = async (email, password) => {
    setLoading(true);
    try {
        const data = await authApi.login(email, password);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data));

        // Update signals
        setToken(data.token);
        setUser(data);

        return data;
    } finally {
        setLoading(false);
    }
};

// Register
export const register = async (name, email, password) => {
    setLoading(true);
    try {
        const data = await authApi.register(name, email, password);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data));

        // Update signals
        setToken(data.token);
        setUser(data);

        return data;
    } finally {
        setLoading(false);
    }
};

// Logout
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
};

// Check token validity on app load
export const checkAuth = async () => {
    if (!token()) return false;

    try {
        const userData = await authApi.getMe();
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return true;
    } catch (error) {
        logout();
        return false;
    }
};

export { user, token, loading };
