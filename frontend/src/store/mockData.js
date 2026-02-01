// Mock data for the Kanban board
export const mockUsers = [
    { id: 'user-1', name: 'Alex Johnson', avatar: 'AJ', color: '#6366f1' },
    { id: 'user-2', name: 'Sarah Chen', avatar: 'SC', color: '#8b5cf6' },
    { id: 'user-3', name: 'Mike Rivera', avatar: 'MR', color: '#06b6d4' },
    { id: 'user-4', name: 'Emma Wilson', avatar: 'EW', color: '#10b981' },
];

export const mockLabels = [
    { id: 'label-1', name: 'Frontend', color: 'var(--label-1)' },
    { id: 'label-2', name: 'Backend', color: 'var(--label-2)' },
    { id: 'label-3', name: 'Design', color: 'var(--label-3)' },
    { id: 'label-4', name: 'Bug', color: 'var(--label-4)' },
    { id: 'label-5', name: 'Feature', color: 'var(--label-5)' },
    { id: 'label-6', name: 'Urgent', color: 'var(--label-6)' },
];

export const createMockData = () => {
    const now = new Date().toISOString();

    return {
        boards: [
            {
                id: 'board-1',
                title: 'Product Development',
                description: 'Main product development board',
                createdAt: now,
            }
        ],

        columns: [
            { id: 'col-1', title: 'Backlog', boardId: 'board-1', order: 0, color: 'var(--column-todo)' },
            { id: 'col-2', title: 'To Do', boardId: 'board-1', order: 1, color: 'var(--column-todo)' },
            { id: 'col-3', title: 'In Progress', boardId: 'board-1', order: 2, color: 'var(--column-progress)' },
            { id: 'col-4', title: 'Review', boardId: 'board-1', order: 3, color: 'var(--column-review)' },
            { id: 'col-5', title: 'Done', boardId: 'board-1', order: 4, color: 'var(--column-done)' },
        ],

        tasks: [
            {
                id: 'task-1',
                title: 'Implement user authentication',
                description: 'Set up OAuth 2.0 authentication with Google and GitHub providers. Include session management and secure token storage.',
                columnId: 'col-3',
                priority: 'high',
                labels: ['label-1', 'label-5'],
                assigneeId: 'user-1',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
                updatedAt: now,
                comments: [
                    { id: 'c1', userId: 'user-2', text: 'Should we use NextAuth for this?', createdAt: now }
                ],
                order: 0,
            },
            {
                id: 'task-2',
                title: 'Design system documentation',
                description: 'Create comprehensive documentation for our design tokens, components, and usage guidelines.',
                columnId: 'col-2',
                priority: 'medium',
                labels: ['label-3'],
                assigneeId: 'user-2',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
                updatedAt: now,
                comments: [],
                order: 0,
            },
            {
                id: 'task-3',
                title: 'Fix navigation dropdown bug',
                description: 'The dropdown menu closes unexpectedly when clicking on submenu items. Need to investigate event propagation.',
                columnId: 'col-2',
                priority: 'urgent',
                labels: ['label-4', 'label-1'],
                assigneeId: 'user-3',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
                updatedAt: now,
                comments: [],
                order: 1,
            },
            {
                id: 'task-4',
                title: 'API rate limiting implementation',
                description: 'Implement rate limiting on all public API endpoints using token bucket algorithm.',
                columnId: 'col-1',
                priority: 'medium',
                labels: ['label-2'],
                assigneeId: null,
                dueDate: null,
                createdAt: now,
                updatedAt: now,
                comments: [],
                order: 0,
            },
            {
                id: 'task-5',
                title: 'Dashboard analytics widgets',
                description: 'Build reusable chart components for the analytics dashboard including line, bar, and pie charts.',
                columnId: 'col-4',
                priority: 'high',
                labels: ['label-1', 'label-3'],
                assigneeId: 'user-4',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
                updatedAt: now,
                comments: [
                    { id: 'c2', userId: 'user-1', text: 'Charts look great! Just need minor alignment fixes.', createdAt: now }
                ],
                order: 0,
            },
            {
                id: 'task-6',
                title: 'Mobile responsive improvements',
                description: 'Optimize layout for tablet and mobile viewports. Focus on navigation and data tables.',
                columnId: 'col-5',
                priority: 'low',
                labels: ['label-1', 'label-3'],
                assigneeId: 'user-2',
                dueDate: null,
                createdAt: now,
                updatedAt: now,
                comments: [],
                order: 0,
            },
            {
                id: 'task-7',
                title: 'Database migration scripts',
                description: 'Create migration scripts for the new user preferences schema.',
                columnId: 'col-1',
                priority: 'low',
                labels: ['label-2'],
                assigneeId: 'user-3',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
                updatedAt: now,
                comments: [],
                order: 1,
            },
            {
                id: 'task-8',
                title: 'Performance optimization',
                description: 'Profile and optimize render performance. Target: reduce initial load time by 40%.',
                columnId: 'col-3',
                priority: 'high',
                labels: ['label-1', 'label-5'],
                assigneeId: 'user-1',
                dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
                updatedAt: now,
                comments: [],
                order: 1,
            },
        ],

        users: mockUsers,
        labels: mockLabels,
        activeBoardId: 'board-1',
    };
};

// Generate unique IDs
export const generateId = () => {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
