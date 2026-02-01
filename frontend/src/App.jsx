import { Router, Route, Navigate } from '@solidjs/router';
import { Show, lazy, Suspense } from 'solid-js';
import { isAuthenticated } from './store/authStore';
import { getAnnouncement } from './utils/accessibility';
import BoardPage from './pages/BoardPage';

import './styles/variables.css';
import './styles/global.css';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const BoardsListPage = lazy(() => import('./pages/BoardsListPage'));

// Loading spinner
function LoadingSpinner() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            color: 'var(--text-secondary)',
        }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
        </div>
    );
}

// Protected route wrapper
function ProtectedRoute(props) {
    return (
        <Show when={isAuthenticated()} fallback={<Navigate href="/login" />}>
            {props.children}
        </Show>
    );
}

// Public route (redirect to boards if already logged in)
function PublicRoute(props) {
    return (
        <Show when={!isAuthenticated()} fallback={<Navigate href="/boards" />}>
            {props.children}
        </Show>
    );
}

function App() {
    return (
        <>
            <Suspense fallback={<LoadingSpinner />}>
                <Router>
                    <Route path="/" component={() => (
                        <PublicRoute>
                            <Landing />
                        </PublicRoute>
                    )} />
                    <Route path="/login" component={() => (
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    )} />
                    <Route path="/signup" component={() => (
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    )} />
                    <Route path="/boards" component={() => (
                        <ProtectedRoute>
                            <BoardsListPage />
                        </ProtectedRoute>
                    )} />
                    <Route path="/board/:boardId" component={() => (
                        <ProtectedRoute>
                            <BoardPage />
                        </ProtectedRoute>
                    )} />
                    <Route path="*" component={() => <Navigate href="/" />} />
                </Router>
            </Suspense>

            {/* Live region for screen reader announcements */}
            <div
                class="live-region"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                {getAnnouncement()}
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
}

export default App;
