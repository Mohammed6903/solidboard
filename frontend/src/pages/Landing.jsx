import { A } from '@solidjs/router';
import '../styles/pages/landing.css';

export default function Landing() {
    return (
        <div class="landing">
            {/* Navigation */}
            <nav class="landing-nav">
                <div class="landing-nav__logo">
                    <div class="landing-nav__logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </div>
                    Kanban
                </div>

                <div class="landing-nav__actions">
                    <A href="/login" class="btn btn--ghost">Log in</A>
                    <A href="/signup" class="btn btn--primary">Sign up free</A>
                </div>
            </nav>

            {/* Hero Section */}
            <section class="hero">
                <div class="hero__content">
                    <div class="hero__badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Built with SolidJS
                    </div>

                    <h1 class="hero__title">
                        Organize Your Work,<br />
                        <span class="hero__title-gradient">Achieve More</span>
                    </h1>

                    <p class="hero__subtitle">
                        A powerful, beautiful Kanban board to manage your projects.
                        Drag, drop, and watch your productivity soar.
                    </p>

                    <div class="hero__actions">
                        <A href="/signup" class="btn hero__btn hero__btn--primary">
                            Get Started Free
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </A>
                        <A href="/login" class="btn btn--secondary hero__btn">
                            Sign In
                        </A>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section class="features">
                <div class="features__header">
                    <h2 class="features__title">Everything you need to stay organized</h2>
                    <p class="features__subtitle">Powerful features to boost your productivity</p>
                </div>

                <div class="features__grid">
                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                        </div>
                        <h3 class="feature-card__title">Kanban Boards</h3>
                        <p class="feature-card__desc">
                            Visualize your workflow with customizable columns. Drag and drop tasks to update status instantly.
                        </p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h3 class="feature-card__title">Team Collaboration</h3>
                        <p class="feature-card__desc">
                            Assign tasks to team members, add comments, and keep everyone aligned on project progress.
                        </p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <h3 class="feature-card__title">Due Dates</h3>
                        <p class="feature-card__desc">
                            Never miss a deadline. Set due dates and get visual indicators for overdue or urgent tasks.
                        </p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        </div>
                        <h3 class="feature-card__title">Labels & Priority</h3>
                        <p class="feature-card__desc">
                            Categorize tasks with colorful labels and set priorities to focus on what matters most.
                        </p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                        <h3 class="feature-card__title">Search & Filter</h3>
                        <p class="feature-card__desc">
                            Find any task instantly with powerful search and filter by assignee, priority, or labels.
                        </p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3 class="feature-card__title">Secure & Private</h3>
                        <p class="feature-card__desc">
                            Your data is safe with JWT authentication and secure MongoDB storage.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer class="landing-footer">
                <p>© 2026 Kanban Board. Built with SolidJS, Express.js and MongoDB.</p>
            </footer>
        </div>
    );
}
