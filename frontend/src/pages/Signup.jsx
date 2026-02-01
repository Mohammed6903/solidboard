import { createSignal } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { register } from '../store/authStore';
import '../styles/pages/auth.css';

export default function Signup() {
    const navigate = useNavigate();
    const [name, setName] = createSignal('');
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [error, setError] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password() !== confirmPassword()) {
            setError('Passwords do not match');
            return;
        }

        if (password().length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(name(), email(), password());
            navigate('/board');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="auth-page">
            <div class="auth-card">
                <A href="/" class="auth-card__back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </A>

                <div class="auth-card__header">
                    <div class="auth-card__logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </div>
                    <h1 class="auth-card__title">Create account</h1>
                    <p class="auth-card__subtitle">Start organizing your projects today</p>
                </div>

                <form class="auth-form" onSubmit={handleSubmit}>
                    {error() && <div class="auth-form__error">{error()}</div>}

                    <div class="auth-form__group">
                        <label class="auth-form__label" for="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            class="auth-form__input"
                            placeholder="Enter your name"
                            value={name()}
                            onInput={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div class="auth-form__group">
                        <label class="auth-form__label" for="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            class="auth-form__input"
                            placeholder="Enter your email"
                            value={email()}
                            onInput={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div class="auth-form__group">
                        <label class="auth-form__label" for="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            class="auth-form__input"
                            placeholder="Create a password"
                            value={password()}
                            onInput={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div class="auth-form__group">
                        <label class="auth-form__label" for="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            class="auth-form__input"
                            placeholder="Confirm your password"
                            value={confirmPassword()}
                            onInput={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        class="auth-form__submit"
                        disabled={loading()}
                    >
                        {loading() ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div class="auth-card__footer">
                    Already have an account? <A href="/login">Sign in</A>
                </div>
            </div>
        </div>
    );
}
