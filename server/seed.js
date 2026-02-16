/**
 * SolidBoard Seed Script
 * Creates 3 demo users with realistic boards and tasks
 * showcasing all features: priorities, labels, due dates,
 * drag-and-drop columns, comments, and filtering.
 *
 * Usage:  node seed.js          — seed data
 *         node seed.js --clear  — remove seed data only
 *
 * Default credentials:
 *   alex@demo.com    / password123
 *   sarah@demo.com   / password123
 *   jordan@demo.com  / password123
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Board from './models/Board.js';
import Task from './models/Task.js';

dotenv.config();

// ─── Helpers ────────────────────────────────────────────────
const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
};

const SEED_PASSWORD = 'password123';

// ─── Users ──────────────────────────────────────────────────
const USERS = [
    { name: 'Alex Morgan', email: 'alex@demo.com', color: '#6366f1' },
    { name: 'Sarah Chen', email: 'sarah@demo.com', color: '#8b5cf6' },
    { name: 'Jordan Rivera', email: 'jordan@demo.com', color: '#06b6d4' },
];

// ─── Boards & Tasks per user ────────────────────────────────
// Each board definition includes its columns and tasks.

function getUserBoards(userId) {
    return {
        alex: [
            {
                title: 'SaaS Product Launch',
                tags: ['product', 'launch', 'q1-2026'],
                columns: [
                    { title: 'Backlog', order: 0, color: 'var(--column-backlog)' },
                    { title: 'To Do', order: 1, color: 'var(--column-todo)' },
                    { title: 'In Progress', order: 2, color: 'var(--column-progress)' },
                    { title: 'Code Review', order: 3, color: 'var(--column-review)' },
                    { title: 'Done', order: 4, color: 'var(--column-done)' },
                ],
                // Tasks mapped by column index (0-based)
                tasks: [
                    // Backlog (column 0)
                    { col: 0, title: 'Research competitor pricing models', priority: 'low', labels: ['research'], order: 0, dueDate: daysFromNow(21), description: 'Analyze top 5 competitors and create a comparison matrix.' },
                    { col: 0, title: 'Draft privacy policy', priority: 'low', labels: ['legal'], order: 1, dueDate: daysFromNow(30) },
                    { col: 0, title: 'Plan referral program', priority: 'medium', labels: ['marketing'], order: 2 },

                    // To Do (column 1)
                    { col: 1, title: 'Design onboarding flow', priority: 'high', labels: ['design', 'ux'], order: 0, dueDate: daysFromNow(5), description: 'Create 3-step onboarding wizard with progress indicator.' },
                    { col: 1, title: 'Setup Stripe integration', priority: 'urgent', labels: ['backend', 'payment'], order: 1, dueDate: daysFromNow(3) },
                    { col: 1, title: 'Write API documentation', priority: 'medium', labels: ['docs'], order: 2, dueDate: daysFromNow(10) },
                    { col: 1, title: 'Create email templates', priority: 'medium', labels: ['marketing'], order: 3, dueDate: daysFromNow(7) },

                    // In Progress (column 2)
                    { col: 2, title: 'Build dashboard analytics page', priority: 'high', labels: ['frontend', 'feature'], order: 0, dueDate: daysFromNow(2), description: 'Show MRR, churn rate, active users chart with Chart.js.' },
                    { col: 2, title: 'Implement JWT refresh tokens', priority: 'urgent', labels: ['backend', 'security'], order: 1, dueDate: daysFromNow(-1), description: 'Token rotation with 15min access / 7d refresh.' },

                    // Code Review (column 3)
                    { col: 3, title: 'PR #42 - User settings page', priority: 'medium', labels: ['frontend'], order: 0, dueDate: daysFromNow(1) },

                    // Done (column 4)
                    { col: 4, title: 'Setup CI/CD pipeline', priority: 'high', labels: ['devops'], order: 0, description: 'GitHub Actions → build → test → deploy to Railway.' },
                    { col: 4, title: 'Design system & component library', priority: 'high', labels: ['design', 'frontend'], order: 1 },
                    { col: 4, title: 'MongoDB Atlas cluster setup', priority: 'medium', labels: ['backend', 'devops'], order: 2 },
                ],
            },
            {
                title: 'Personal Goals 2026',
                tags: ['personal', 'goals'],
                columns: [
                    { title: 'Want To', order: 0, color: '#818cf8' },
                    { title: 'Working On', order: 1, color: '#fbbf24' },
                    { title: 'Achieved', order: 2, color: '#34d399' },
                ],
                tasks: [
                    { col: 0, title: 'Read 24 books this year', priority: 'low', labels: ['reading'], order: 0, description: 'Currently at 4/24. Next: "Designing Data-Intensive Applications".' },
                    { col: 0, title: 'Learn Rust basics', priority: 'medium', labels: ['learning'], order: 1, dueDate: daysFromNow(60) },
                    { col: 0, title: 'Run a half marathon', priority: 'medium', labels: ['fitness'], order: 2, dueDate: daysFromNow(90) },
                    { col: 1, title: 'Complete AWS Solutions Architect', priority: 'high', labels: ['learning', 'career'], order: 0, dueDate: daysFromNow(14) },
                    { col: 1, title: 'Build portfolio website', priority: 'high', labels: ['career'], order: 1, dueDate: daysFromNow(7) },
                    { col: 2, title: 'Contribute to 3 open-source repos', priority: 'medium', labels: ['career'], order: 0 },
                    { col: 2, title: 'Set up emergency fund', priority: 'high', labels: ['finance'], order: 1 },
                ],
            },
        ],
        sarah: [
            {
                title: 'Mobile App – FitTrack',
                tags: ['mobile', 'react-native', 'fitness'],
                columns: [
                    { title: 'Icebox', order: 0, color: 'var(--column-backlog)' },
                    { title: 'Sprint Backlog', order: 1, color: 'var(--column-todo)' },
                    { title: 'In Dev', order: 2, color: 'var(--column-progress)' },
                    { title: 'QA Testing', order: 3, color: '#f59e0b' },
                    { title: 'Shipped', order: 4, color: 'var(--column-done)' },
                ],
                tasks: [
                    // Icebox
                    { col: 0, title: 'Apple Watch integration', priority: 'low', labels: ['feature', 'ios'], order: 0 },
                    { col: 0, title: 'Social sharing to Instagram stories', priority: 'low', labels: ['feature', 'social'], order: 1 },
                    { col: 0, title: 'AI workout recommendations', priority: 'medium', labels: ['feature', 'ai'], order: 2, description: 'Use GPT-4 API to suggest workouts based on user history.' },

                    // Sprint Backlog
                    { col: 1, title: 'Push notification reminders', priority: 'high', labels: ['feature'], order: 0, dueDate: daysFromNow(4) },
                    { col: 1, title: 'Dark mode support', priority: 'medium', labels: ['ui', 'accessibility'], order: 1, dueDate: daysFromNow(6) },
                    { col: 1, title: 'Fix crash on Android 14 devices', priority: 'urgent', labels: ['bug', 'android'], order: 2, dueDate: daysFromNow(1), description: 'Crash report in Sentry #1842. Affects ~12% of users.' },

                    // In Dev
                    { col: 2, title: 'Workout history calendar view', priority: 'high', labels: ['feature', 'ui'], order: 0, dueDate: daysFromNow(3) },
                    { col: 2, title: 'Progress photos comparison', priority: 'medium', labels: ['feature'], order: 1, dueDate: daysFromNow(5) },

                    // QA Testing
                    { col: 3, title: 'Nutrition tracker MVP', priority: 'high', labels: ['feature'], order: 0, dueDate: daysFromNow(0) },
                    { col: 3, title: 'Offline sync mechanism', priority: 'high', labels: ['backend', 'feature'], order: 1, description: 'Queue API calls when offline, replay on reconnect.' },

                    // Shipped
                    { col: 4, title: 'User authentication (OAuth + Email)', priority: 'high', labels: ['backend', 'security'], order: 0 },
                    { col: 4, title: 'Exercise database (500+ exercises)', priority: 'medium', labels: ['data', 'backend'], order: 1 },
                    { col: 4, title: 'Custom workout builder', priority: 'high', labels: ['feature'], order: 2 },
                ],
            },
            {
                title: 'Home Renovation',
                tags: ['personal', 'home'],
                columns: [
                    { title: 'Planning', order: 0, color: '#818cf8' },
                    { title: 'In Progress', order: 1, color: '#f59e0b' },
                    { title: 'Completed', order: 2, color: '#34d399' },
                ],
                tasks: [
                    { col: 0, title: 'Get kitchen cabinet quotes', priority: 'high', labels: ['kitchen'], order: 0, dueDate: daysFromNow(10) },
                    { col: 0, title: 'Choose bathroom tiles', priority: 'medium', labels: ['bathroom'], order: 1, dueDate: daysFromNow(14) },
                    { col: 0, title: 'Find electrician for rewiring', priority: 'urgent', labels: ['electrical'], order: 2, dueDate: daysFromNow(3) },
                    { col: 1, title: 'Paint living room (Sage Green)', priority: 'medium', labels: ['painting'], order: 0, dueDate: daysFromNow(2) },
                    { col: 1, title: 'Install smart thermostat', priority: 'low', labels: ['smart-home'], order: 1 },
                    { col: 2, title: 'Replace front door lock', priority: 'high', labels: ['security'], order: 0 },
                    { col: 2, title: 'Fix leaking faucet in master bath', priority: 'urgent', labels: ['plumbing'], order: 1 },
                ],
            },
        ],
        jordan: [
            {
                title: 'E-commerce Platform',
                tags: ['ecommerce', 'fullstack', 'startup'],
                columns: [
                    { title: 'Backlog', order: 0, color: 'var(--column-backlog)' },
                    { title: 'To Do', order: 1, color: 'var(--column-todo)' },
                    { title: 'In Progress', order: 2, color: 'var(--column-progress)' },
                    { title: 'Review', order: 3, color: 'var(--column-review)' },
                    { title: 'Done', order: 4, color: 'var(--column-done)' },
                ],
                tasks: [
                    // Backlog
                    { col: 0, title: 'Multi-currency support', priority: 'medium', labels: ['feature', 'i18n'], order: 0 },
                    { col: 0, title: 'Wishlist & favorites', priority: 'low', labels: ['feature', 'ux'], order: 1 },
                    { col: 0, title: 'Seller analytics dashboard', priority: 'medium', labels: ['feature', 'analytics'], order: 2 },

                    // To Do
                    { col: 1, title: 'Implement product search with Algolia', priority: 'high', labels: ['search', 'feature'], order: 0, dueDate: daysFromNow(5) },
                    { col: 1, title: 'Order status email notifications', priority: 'high', labels: ['email', 'feature'], order: 1, dueDate: daysFromNow(4) },
                    { col: 1, title: 'Admin panel — user management', priority: 'medium', labels: ['admin', 'frontend'], order: 2, dueDate: daysFromNow(8) },

                    // In Progress
                    { col: 2, title: 'Shopping cart & checkout flow', priority: 'urgent', labels: ['feature', 'payment'], order: 0, dueDate: daysFromNow(2), description: 'Stripe checkout session with coupon code support.' },
                    { col: 2, title: 'Product image gallery with zoom', priority: 'high', labels: ['ui', 'feature'], order: 1, dueDate: daysFromNow(3) },
                    { col: 2, title: 'Inventory management system', priority: 'high', labels: ['backend', 'feature'], order: 2, dueDate: daysFromNow(6), description: 'Track stock levels, low-stock alerts, batch updates.' },

                    // Review
                    { col: 3, title: 'Product review & rating system', priority: 'medium', labels: ['feature', 'ux'], order: 0, dueDate: daysFromNow(1) },
                    { col: 3, title: 'SEO-friendly product pages', priority: 'high', labels: ['seo', 'frontend'], order: 1 },

                    // Done
                    { col: 4, title: 'User registration & profile', priority: 'high', labels: ['auth', 'backend'], order: 0 },
                    { col: 4, title: 'Product catalog CRUD', priority: 'high', labels: ['backend', 'feature'], order: 1 },
                    { col: 4, title: 'Responsive product listing page', priority: 'medium', labels: ['frontend', 'ui'], order: 2 },
                    { col: 4, title: 'Category & filter navigation', priority: 'medium', labels: ['frontend', 'ux'], order: 3 },
                ],
            },
            {
                title: 'Learning Roadmap',
                tags: ['learning', 'self-improvement'],
                columns: [
                    { title: 'To Learn', order: 0, color: '#818cf8' },
                    { title: 'Studying', order: 1, color: '#f59e0b' },
                    { title: 'Mastered', order: 2, color: '#34d399' },
                ],
                tasks: [
                    { col: 0, title: 'GraphQL & Apollo', priority: 'medium', labels: ['backend'], order: 0, description: 'Complete "The Road to GraphQL" book and build a project.' },
                    { col: 0, title: 'Kubernetes fundamentals', priority: 'low', labels: ['devops'], order: 1 },
                    { col: 0, title: 'System design patterns', priority: 'high', labels: ['architecture'], order: 2, dueDate: daysFromNow(30) },
                    { col: 1, title: 'TypeScript advanced types', priority: 'high', labels: ['frontend'], order: 0, dueDate: daysFromNow(7), description: 'Generics, conditional types, mapped types, template literals.' },
                    { col: 1, title: 'PostgreSQL performance tuning', priority: 'medium', labels: ['database'], order: 1, dueDate: daysFromNow(14) },
                    { col: 2, title: 'React & Next.js', priority: 'high', labels: ['frontend'], order: 0 },
                    { col: 2, title: 'Node.js & Express', priority: 'high', labels: ['backend'], order: 1 },
                    { col: 2, title: 'MongoDB & Mongoose', priority: 'medium', labels: ['database'], order: 2 },
                    { col: 2, title: 'Docker basics', priority: 'medium', labels: ['devops'], order: 3 },
                    { col: 2, title: 'Git advanced workflows', priority: 'low', labels: ['tools'], order: 4 },
                ],
            },
        ],
    };
}

// ─── Main Seed Function ─────────────────────────────────────
async function seed() {
    await connectDB();

    const clearOnly = process.argv.includes('--clear');

    console.log('\n🌱 SolidBoard Seeder\n');

    // ── Step 1: Clean existing seed users ───────────────────
    const seedEmails = USERS.map(u => u.email);
    const existingUsers = await User.find({ email: { $in: seedEmails } });

    if (existingUsers.length > 0) {
        const existingIds = existingUsers.map(u => u._id);
        const boards = await Board.find({ owner: { $in: existingIds } });
        const boardIds = boards.map(b => b._id);

        const deletedTasks = await Task.deleteMany({ board: { $in: boardIds } });
        const deletedBoards = await Board.deleteMany({ owner: { $in: existingIds } });
        const deletedUsers = await User.deleteMany({ email: { $in: seedEmails } });

        console.log(`🗑  Cleared previous seed data:`);
        console.log(`   ${deletedUsers.deletedCount} users, ${deletedBoards.deletedCount} boards, ${deletedTasks.deletedCount} tasks\n`);
    }

    if (clearOnly) {
        console.log('✅ Clear complete. Exiting.\n');
        await mongoose.disconnect();
        process.exit(0);
    }

    // ── Step 2: Create users ────────────────────────────────
    const createdUsers = {};
    for (const userData of USERS) {
        const user = await User.create({
            ...userData,
            password: SEED_PASSWORD,
        });
        const key = userData.email.split('@')[0]; // alex, sarah, jordan
        createdUsers[key] = user;
        console.log(`👤 Created user: ${user.name} (${user.email})`);
    }

    // ── Step 3: Create boards & tasks ───────────────────────
    let totalBoards = 0;
    let totalTasks = 0;

    for (const [username, user] of Object.entries(createdUsers)) {
        const allBoardDefs = getUserBoards(user._id);
        const boardDefs = allBoardDefs[username] || [];

        for (const def of boardDefs) {
            const board = await Board.create({
                title: def.title,
                owner: user._id,
                columns: def.columns,
                tags: def.tags || [],
            });
            totalBoards++;

            // Map column index → column _id
            const colIdMap = {};
            board.columns.forEach((col, i) => {
                colIdMap[i] = col._id.toString();
            });

            // Create tasks for this board
            for (const taskDef of (def.tasks || [])) {
                await Task.create({
                    title: taskDef.title,
                    description: taskDef.description || '',
                    board: board._id,
                    columnId: colIdMap[taskDef.col],
                    order: taskDef.order,
                    priority: taskDef.priority,
                    labels: taskDef.labels || [],
                    assignee: user._id,
                    dueDate: taskDef.dueDate || undefined,
                });
                totalTasks++;
            }

            console.log(`  📋 Board: "${def.title}" → ${def.tasks?.length || 0} tasks`);
        }
        console.log('');
    }

    // ── Summary ─────────────────────────────────────────────
    console.log('━'.repeat(50));
    console.log(`\n✅ Seeding complete!`);
    console.log(`   👤 ${Object.keys(createdUsers).length} users`);
    console.log(`   📋 ${totalBoards} boards`);
    console.log(`   📌 ${totalTasks} tasks\n`);
    console.log('🔑 Login credentials:');
    for (const u of USERS) {
        console.log(`   ${u.email}  /  ${SEED_PASSWORD}`);
    }
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
