import { Show, onMount, onCleanup, createEffect } from 'solid-js';
import { Portal } from 'solid-js/web';
import { createFocusTrap } from '../../utils/accessibility';

export function Modal(props) {
    let modalRef;
    let previousActiveElement;

    const focusTrap = createFocusTrap(() => modalRef);

    onMount(() => {
        previousActiveElement = document.activeElement;
        focusTrap.activate();
        document.body.style.overflow = 'hidden';

        // Focus the modal container
        modalRef?.focus();
    });

    onCleanup(() => {
        focusTrap.deactivate();
        document.body.style.overflow = '';
        previousActiveElement?.focus();
    });

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            props.onClose?.();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            props.onClose?.();
        }
    };

    return (
        <Show when={props.open}>
            <Portal>
                <div
                    class="modal-backdrop"
                    onClick={handleBackdropClick}
                    onKeyDown={handleKeyDown}
                >
                    <div
                        ref={modalRef}
                        class={`modal ${props.size === 'lg' ? 'modal--lg' : ''}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={props.titleId || 'modal-title'}
                        tabIndex="-1"
                    >
                        <Show when={props.title || props.onClose}>
                            <div class="modal__header">
                                <h2 id={props.titleId || 'modal-title'} class="modal__title">
                                    {props.title}
                                </h2>
                                <Show when={props.onClose}>
                                    <button
                                        class="btn btn--ghost btn--icon modal__close"
                                        onClick={props.onClose}
                                        aria-label="Close modal"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </Show>
                            </div>
                        </Show>

                        <div class="modal__body">
                            {props.children}
                        </div>

                        <Show when={props.footer}>
                            <div class="modal__footer">
                                {props.footer}
                            </div>
                        </Show>
                    </div>
                </div>
            </Portal>
        </Show>
    );
}
