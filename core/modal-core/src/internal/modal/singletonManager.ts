/**
 * Modal singleton manager
 *
 * Ensures only one modal instance can be open at a time across the entire application.
 * Manages global modal state and prevents multiple modals from conflicting.
 *
 * @internal
 */

import type { ModalController } from '../../types.js';
import type { Logger } from '../core/logger/logger.js';

/**
 * Global modal state
 */
interface GlobalModalState {
  activeModal: ModalController | null;
  activeModalId: string | null;
  lockCount: number;
}

/**
 * Modal singleton manager class
 */
export class ModalSingletonManager {
  private static instance: ModalSingletonManager | null = null;
  private state: GlobalModalState = {
    activeModal: null,
    activeModalId: null,
    lockCount: 0,
  };
  private modalRegistry = new Map<string, ModalController>();
  private logger: Logger | undefined;

  // Store event listener references for cleanup
  private keydownHandler: (event: KeyboardEvent) => void;
  private popstateHandler: () => void;

  private constructor(logger?: Logger) {
    this.logger = logger;

    // Initialize event handlers
    this.keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.state.activeModal) {
        this.logger?.debug('[ModalSingleton] Escape key pressed, closing active modal');
        this.state.activeModal.close();
      }
    };

    this.popstateHandler = () => {
      if (this.state.activeModal) {
        this.logger?.debug('[ModalSingleton] Browser back button pressed, closing active modal');
        this.state.activeModal.close();
      }
    };

    // Add global event listeners for modal management
    if (typeof window !== 'undefined') {
      this.setupGlobalListeners();
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(logger?: Logger): ModalSingletonManager {
    if (!ModalSingletonManager.instance) {
      ModalSingletonManager.instance = new ModalSingletonManager(logger);
    }
    return ModalSingletonManager.instance;
  }

  /**
   * Register a modal instance
   */
  registerModal(id: string, modal: ModalController): void {
    this.modalRegistry.set(id, modal);
    this.logger?.debug('[ModalSingleton] Registered modal', { id });
  }

  /**
   * Unregister a modal instance
   */
  unregisterModal(id: string): void {
    this.modalRegistry.delete(id);

    // If this was the active modal, clear it
    if (this.state.activeModalId === id) {
      this.state.activeModal = null;
      this.state.activeModalId = null;
    }

    this.logger?.debug('[ModalSingleton] Unregistered modal', { id });
  }

  /**
   * Request to open a modal
   * @returns true if allowed to open, false if blocked
   */
  requestOpen(id: string): boolean {
    const modal = this.modalRegistry.get(id);
    if (!modal) {
      this.logger?.warn('[ModalSingleton] Attempted to open unregistered modal', { id });
      return false;
    }

    // If there's an active modal and it's not this one, close it first
    if (this.state.activeModal && this.state.activeModalId !== id) {
      this.logger?.debug('[ModalSingleton] Closing active modal to open new one', {
        activeId: this.state.activeModalId,
        newId: id,
      });

      try {
        this.state.activeModal.close();
      } catch (error) {
        this.logger?.error('[ModalSingleton] Error closing active modal', error);
      }
    }

    // Set this modal as active
    this.state.activeModal = modal;
    this.state.activeModalId = id;
    this.state.lockCount++;

    this.logger?.debug('[ModalSingleton] Modal open approved', { id, lockCount: this.state.lockCount });
    return true;
  }

  /**
   * Notify that a modal has closed
   */
  notifyClosed(id: string): void {
    if (this.state.activeModalId === id) {
      this.state.activeModal = null;
      this.state.activeModalId = null;
      this.state.lockCount = Math.max(0, this.state.lockCount - 1);

      this.logger?.debug('[ModalSingleton] Modal closed', { id, lockCount: this.state.lockCount });
    }
  }

  /**
   * Get the currently active modal
   */
  getActiveModal(): ModalController | null {
    return this.state.activeModal;
  }

  /**
   * Check if a specific modal is active
   */
  isModalActive(id: string): boolean {
    return this.state.activeModalId === id;
  }

  /**
   * Check if any modal is active
   */
  hasActiveModal(): boolean {
    return this.state.activeModal !== null;
  }

  /**
   * Force close all modals
   */
  closeAllModals(): void {
    this.logger?.debug('[ModalSingleton] Closing all modals');

    for (const [id, modal] of this.modalRegistry) {
      try {
        if (modal.getState().isOpen) {
          modal.close();
        }
      } catch (error) {
        this.logger?.error('[ModalSingleton] Error closing modal', { id, error });
      }
    }

    this.state.activeModal = null;
    this.state.activeModalId = null;
    this.state.lockCount = 0;
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalListeners(): void {
    // Listen for escape key to close active modal
    window.addEventListener('keydown', this.keydownHandler);

    // Listen for browser back button
    window.addEventListener('popstate', this.popstateHandler);
  }

  /**
   * Clean up global event listeners
   */
  private cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
      window.removeEventListener('popstate', this.popstateHandler);
    }
  }

  /**
   * Reset singleton (for testing)
   */
  static reset(): void {
    if (ModalSingletonManager.instance) {
      ModalSingletonManager.instance.cleanup();
      ModalSingletonManager.instance.closeAllModals();
      ModalSingletonManager.instance.modalRegistry.clear();
    }
    ModalSingletonManager.instance = null;
  }
}
