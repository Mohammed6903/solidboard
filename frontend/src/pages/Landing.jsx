import { A } from '@solidjs/router';
import { createSignal, onMount, onCleanup } from 'solid-js';
import '../styles/pages/landing.css';

export default function Landing() {
    const [scrolled, setScrolled] = createSignal(false);
    const [visibleSections, setVisibleSections] = createSignal(new Set());

    onMount(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        onCleanup(() => window.removeEventListener('scroll', handleScroll));

        // Intersection observer for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setVisibleSections(prev => new Set([...prev, entry.target.id]));
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
        onCleanup(() => observer.disconnect());
    });

    return (
        <div class="landing">
            {/* Animated Background Blobs */}
            <div class="landing-bg">
                <div class="landing-blob landing-blob--1"></div>
                <div class="landing-blob landing-blob--2"></div>
                <div class="landing-blob landing-blob--3"></div>
            </div>

            {/* Navigation */}
            <nav class={`landing-nav ${scrolled() ? 'landing-nav--scrolled' : ''}`}>
                <div class="landing-nav__logo">
                    <div class="landing-nav__logo-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                    </div>
                    <span class="landing-nav__logo-text">SolidBoard</span>
                </div>

                <div class="landing-nav__actions">
                    <A href="/login" class="landing-btn landing-btn--ghost">Log in</A>
                    <A href="/signup" class="landing-btn landing-btn--primary">Get Started</A>
                </div>
            </nav>

            {/* Hero Section */}
            <section class="hero">
                <div class="hero__content">
                    <div class="hero__badge">
                        <span class="hero__badge-dot"></span>
                        Built with SolidJS + Express + MongoDB
                    </div>

                    <h1 class="hero__title">
                        Organize Your&nbsp;Work,
                        <br />
                        <span class="hero__title-gradient">Achieve More</span>
                    </h1>

                    <p class="hero__subtitle">
                        A beautifully crafted Kanban board that helps you manage projects with
                        intuitive drag-and-drop, smart filters, and real-time organization.
                    </p>

                    <div class="hero__actions">
                        <A href="/signup" class="landing-btn landing-btn--hero">
                            Start For Free
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </A>
                        <A href="/login" class="landing-btn landing-btn--outline">
                            Sign In
                        </A>
                    </div>

                    {/* Stats */}
                    <div class="hero__stats">
                        <div class="hero__stat">
                            <span class="hero__stat-value">∞</span>
                            <span class="hero__stat-label">Boards</span>
                        </div>
                        <div class="hero__stat-divider"></div>
                        <div class="hero__stat">
                            <span class="hero__stat-value">JWT</span>
                            <span class="hero__stat-label">Secure Auth</span>
                        </div>
                        <div class="hero__stat-divider"></div>
                        <div class="hero__stat">
                            <span class="hero__stat-value">D&D</span>
                            <span class="hero__stat-label">Drag & Drop</span>
                        </div>
                    </div>
                </div>

                {/* Hero Visual — Floating App Screenshot */}
                <div class="hero__visual">
                    <div class="hero__board-preview-img-wrapper">
                        <img
                            src="/images/tasks-lists-1.png"
                            alt="SolidBoard Kanban Interface"
                            class="hero__board-preview-img"
                        />
                    </div>
                </div>
            </section>

            {/* Product Showcase Section */}
            <section class="showcase" id="showcase" data-animate>
                <div class={`showcase__inner ${visibleSections().has('showcase') ? 'visible' : ''}`}>
                    <div class="showcase__header">
                        <h2 class="features__title">Designing for efficiency</h2>
                        <p class="features__subtitle">Clean, intuitive, and packed with features to help you ship faster.</p>
                    </div>

                    <div class="showcase__grid">
                        <div class="showcase__item">
                            <div class="showcase__image-container">
                                <img src="/images/board-lists-1.png" alt="Board Management" loading="lazy" />
                            </div>
                            <h3>Manage Multiple Boards</h3>
                            <p>Organize different projects in separate workspaces.</p>
                        </div>
                        <div class="showcase__item">
                            <div class="showcase__image-container">
                                <img src="/images/tasks-list-1-with-filter.png" alt="Filtering Tasks" loading="lazy" />
                            </div>
                            <h3>Powerful Filtering</h3>
                            <p>Find what you need instantly with tag and priority filters.</p>
                        </div>
                        <div class="showcase__item showcase__item--wide">
                            <div class="showcase__image-container">
                                <img src="/images/tasks-list-2.png" alt="Task Management" loading="lazy" />
                            </div>
                            <h3>Rich Task Details</h3>
                            <p>Add descriptions, due dates, labels, and subtasks (coming soon).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section class="features" id="features" data-animate>
                <div class={`features__inner ${visibleSections().has('features') ? 'visible' : ''}`}>
                    <div class="features__header">
                        <span class="features__tag">Features</span>
                        <h2 class="features__title">Everything you need to stay organized</h2>
                        <p class="features__subtitle">Powerful features designed to boost your productivity and keep your projects on track.</p>
                    </div>

                    <div class="features__grid">
                        <div class="feature-card">
                            <div class="feature-card__icon feature-card__icon--indigo">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M9 21V9" />
                                </svg>
                            </div>
                            <h3 class="feature-card__title">Kanban Boards</h3>
                            <p class="feature-card__desc">
                                Visualize workflow with customizable columns. Drag and drop tasks to update status.
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-card__icon feature-card__icon--violet">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" />
                                </svg>
                            </div>
                            <h3 class="feature-card__title">Labels & Priority</h3>
                            <p class="feature-card__desc">
                                Categorize with colorful labels and set priorities to focus on what matters most.
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-card__icon feature-card__icon--cyan">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <h3 class="feature-card__title">Due Dates</h3>
                            <p class="feature-card__desc">
                                Never miss a deadline. Visual indicators for overdue, urgent, and upcoming tasks.
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-card__icon feature-card__icon--emerald">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h3 class="feature-card__title">Search & Filter</h3>
                            <p class="feature-card__desc">
                                Find any task instantly with powerful search. Filter by priority, tags, or keywords.
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-card__icon feature-card__icon--amber">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h3 class="feature-card__title">Comments</h3>
                            <p class="feature-card__desc">
                                Add comments to tasks to keep notes, discuss progress, and track decisions.
                            </p>
                        </div>

                        <div class="feature-card">
                            <div class="feature-card__icon feature-card__icon--rose">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 class="feature-card__title">Secure & Private</h3>
                            <p class="feature-card__desc">
                                JWT authentication and encrypted passwords keep your data safe and private.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section class="tech-stack" id="tech-stack" data-animate>
                <div class={`tech-stack__inner ${visibleSections().has('tech-stack') ? 'visible' : ''}`}>
                    <span class="features__tag">Tech Stack</span>
                    <h2 class="features__title">Built with Modern Technologies</h2>
                    <div class="tech-stack__grid">
                        <div class="tech-card">
                            <span class="tech-card__emoji">⚡</span>
                            <h4>SolidJS</h4>
                            <p>Reactive UI with fine-grained reactivity</p>
                        </div>
                        <div class="tech-card">
                            <span class="tech-card__emoji">🚀</span>
                            <h4>Express.js</h4>
                            <p>Fast, minimal backend framework</p>
                        </div>
                        <div class="tech-card">
                            <span class="tech-card__emoji">🍃</span>
                            <h4>MongoDB</h4>
                            <p>Flexible document database</p>
                        </div>
                        <div class="tech-card">
                            <span class="tech-card__emoji">🔐</span>
                            <h4>JWT Auth</h4>
                            <p>Secure token-based authentication</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section class="cta">
                <div class="cta__content">
                    <h2 class="cta__title">Ready to get organized?</h2>
                    <p class="cta__subtitle">Create your free account and start managing projects today.</p>
                    <A href="/signup" class="landing-btn landing-btn--hero landing-btn--lg">
                        Get Started — It's Free
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </A>
                </div>
            </section>

            {/* Footer */}
            <footer class="landing-footer">
                <div class="landing-footer__inner">
                    <div class="landing-footer__brand">
                        <div class="landing-nav__logo-icon" style="width: 28px; height: 28px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            </svg>
                        </div>
                        <span>SolidBoard</span>
                    </div>
                    <p class="landing-footer__copy">© 2026 SolidBoard. Built with SolidJS, Express.js & MongoDB.</p>
                </div>
            </footer>
        </div>
    );
}
