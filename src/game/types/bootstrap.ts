/**
 * Bootstrap 5 TypeScript interface definitions
 * 
 * This file provides type-safe interfaces for Bootstrap 5 components
 * used throughout the application.
 */

/**
 * Bootstrap Modal component interface
 */
export interface BootstrapModal {
    show(): void;
    hide(): void;
    dispose(): void;
}

/**
 * Bootstrap Toast component interface
 */
export interface BootstrapToast {
    show(): void;
    hide(): void;
    dispose(): void;
    isShown(): boolean;
}

/**
 * Bootstrap Modal constructor options
 */
export interface BootstrapModalOptions {
    backdrop?: boolean | 'static';
    keyboard?: boolean;
    focus?: boolean;
}

/**
 * Bootstrap Toast constructor options
 */
export interface BootstrapToastOptions {
    animation?: boolean;
    autohide?: boolean;
    delay?: number;
}

/**
 * Bootstrap global namespace interface
 */
export interface BootstrapGlobal {
    Modal: new (element: HTMLElement, options?: BootstrapModalOptions) => BootstrapModal;
    Toast: new (element: HTMLElement, options?: BootstrapToastOptions) => BootstrapToast;
}

/**
 * Extended Window interface with Bootstrap global and game instance
 */
declare global {
    interface Window {
        bootstrap: BootstrapGlobal;
        game?: import('../Game').Game;
    }
}