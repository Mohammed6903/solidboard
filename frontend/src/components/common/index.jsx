import { splitProps, mergeProps } from 'solid-js';
import './styles.css';

// Button Component
export function Button(props) {
    const merged = mergeProps({
        variant: 'primary',
        size: 'md',
        type: 'button'
    }, props);

    const [local, rest] = splitProps(merged, [
        'variant', 'size', 'icon', 'class', 'children'
    ]);

    const classes = () => {
        const base = 'btn';
        const variant = `btn--${local.variant}`;
        const size = local.size !== 'md' ? `btn--${local.size}` : '';
        const iconOnly = local.icon && !local.children ? 'btn--icon' : '';
        return [base, variant, size, iconOnly, local.class].filter(Boolean).join(' ');
    };

    return (
        <button class={classes()} {...rest}>
            {local.icon && <span class="btn__icon">{local.icon}</span>}
            {local.children}
        </button>
    );
}

// Avatar Component
export function Avatar(props) {
    const merged = mergeProps({ size: 'md' }, props);

    return (
        <div
            class={`avatar avatar--${merged.size}`}
            style={{ background: merged.color || 'var(--accent-primary)' }}
            title={merged.name}
            aria-label={merged.name}
        >
            {merged.initials || merged.name?.charAt(0) || '?'}
        </div>
    );
}

// Input Component
export function Input(props) {
    const [local, rest] = splitProps(props, ['label', 'class']);

    return (
        <div class="form-group">
            {local.label && <label class="form-label">{local.label}</label>}
            <input class={`input ${local.class || ''}`} {...rest} />
        </div>
    );
}

// Textarea Component
export function Textarea(props) {
    const [local, rest] = splitProps(props, ['label', 'class']);

    return (
        <div class="form-group">
            {local.label && <label class="form-label">{local.label}</label>}
            <textarea class={`input input--textarea ${local.class || ''}`} {...rest} />
        </div>
    );
}

// Select Component
export function Select(props) {
    const [local, rest] = splitProps(props, ['label', 'options', 'class']);

    return (
        <div class="form-group">
            {local.label && <label class="form-label">{local.label}</label>}
            <select class={`select ${local.class || ''}`} {...rest}>
                {local.options?.map(opt => (
                    <option value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
