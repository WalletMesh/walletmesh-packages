/**
 * Modal view system implementation
 * Manages view transitions and lifecycle hooks for the modal UI
 */

import type { ModalView, ModalState } from '../types/modal.js';

/**
 * View lifecycle hooks
 * Defines optional callbacks for view transitions
 * @interface ViewHooks
 */
export interface ViewHooks {
  /** Called when entering the view */
  onEnter?: () => void | Promise<void>;
  /** Called when exiting the view */
  onExit?: () => void | Promise<void>;
}

/**
 * View definition with metadata and hooks
 * Defines a complete view with its transitions and validation
 * @interface ViewDefinition
 * @extends ViewHooks
 */
export interface ViewDefinition extends ViewHooks {
  /** View identifier */
  id: ModalView;
  /** Allowed transitions from this view */
  allowedTransitions: ModalView[];
  /** Validation function for the view */
  validate?: (state: ModalState) => boolean;
}

/**
 * View system configuration options
 * @interface ViewSystemConfig
 */
export interface ViewSystemConfig {
  /** Default view to show */
  defaultView?: ModalView;
  /** Whether to validate transitions */
  validateTransitions?: boolean;
}

/**
 * Modal view system manager
 * Handles view registration, transitions, and lifecycle management
 */
export class ViewSystem {
  private views: Map<ModalView, ViewDefinition>;
  private config: ViewSystemConfig;

  /**
   * Create a new ViewSystem instance
   * @param config - Optional configuration options
   */
  constructor(config: ViewSystemConfig = {}) {
    this.views = new Map();
    this.config = {
      defaultView: 'walletSelection',
      validateTransitions: true,
      ...config,
    };

    this.registerDefaultViews();
  }

  /**
   * Register default view definitions
   * Sets up the standard modal views and their transitions
   * @private
   */
  private registerDefaultViews(): void {
    // Wallet Selection View
    this.registerView({
      id: 'walletSelection',
      allowedTransitions: ['providerSelection', 'connecting'],
      validate: (state) => !state.selectedWallet,
      onEnter: () => {
        // Reset wallet selection when entering this view
        return undefined;
      },
    });

    // Provider Selection View
    this.registerView({
      id: 'providerSelection',
      allowedTransitions: ['connecting', 'walletSelection'],
      validate: (state) => Boolean(state.selectedWallet && !state.selectedProvider),
      onEnter: () => {
        // Setup provider detection
        return undefined;
      },
    });

    // Connecting View
    this.registerView({
      id: 'connecting',
      allowedTransitions: ['connected', 'error', 'providerSelection', 'walletSelection'],
      validate: (state) => Boolean(state.selectedWallet),
    });

    // Connected View
    this.registerView({
      id: 'connected',
      allowedTransitions: [],
      validate: (state) => Boolean(state.selectedWallet && state.selectedProvider),
    });

    // Error View
    this.registerView({
      id: 'error',
      allowedTransitions: ['walletSelection', 'error', 'connecting'],
      validate: () => true, // Error view should be accessible from any state
      onEnter: () => {
        return undefined;
      },
      onExit: () => {
        // Clear error state when leaving error view
        return undefined;
      },
    });
  }

  /**
   * Register a new view definition
   * @param view - The view definition to register
   */
  registerView(view: ViewDefinition): void {
    this.views.set(view.id, view);
  }

  /**
   * Get a view definition
   * @param id - The view identifier
   * @returns The view definition or undefined if not found
   */
  getView(id: ModalView): ViewDefinition | undefined {
    return this.views.get(id);
  }

  /**
   * Check if a transition is valid
   * @param from - Source view
   * @param to - Target view
   * @param state - Current modal state
   * @returns True if the transition is valid
   */
  isValidTransition(from: ModalView, to: ModalView, state: ModalState): boolean {
    const fromView = this.views.get(from);
    const toView = this.views.get(to);

    if (!fromView || !toView) {
      return false;
    }

    // Special case: Error view transitions
    if (from === 'error') {
      return true; // Allow transitions from error view to any other view
    }

    if (to === 'error') {
      return true; // Allow transitions to error view from any view
    }

    // Check if transition is allowed
    if (!fromView.allowedTransitions.includes(to)) {
      return false;
    }

    // Validate target view if validation is enabled
    if (this.config.validateTransitions && toView.validate) {
      return toView.validate(state);
    }

    return true;
  }

  /**
   * Execute view transition
   * Handles lifecycle hooks and validation
   * @param from - Source view
   * @param to - Target view
   * @param state - Current modal state
   * @returns Promise that resolves to true if transition was successful
   */
  async executeTransition(from: ModalView, to: ModalView, state: ModalState): Promise<boolean> {
    // Validate transition
    if (!this.isValidTransition(from, to, state)) {
      return false;
    }

    const fromView = this.views.get(from);
    const toView = this.views.get(to);

    try {
      // Execute exit hooks
      if (fromView?.onExit) {
        await fromView.onExit();
      }

      // Execute enter hooks
      if (toView?.onEnter) {
        await toView.onEnter();
      }

      return true;
    } catch (error) {
      console.error('Error during view transition:', error);
      return false;
    }
  }

  /**
   * Get allowed transitions from a view
   * @param from - Source view
   * @returns Array of allowed target views
   */
  getAllowedTransitions(from: ModalView): ModalView[] {
    const view = this.views.get(from);
    return view?.allowedTransitions || [];
  }

  /**
   * Update view system configuration
   * @param updates - Partial configuration updates to apply
   */
  updateConfig(updates: Partial<ViewSystemConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   * @returns A copy of the current configuration
   */
  getConfig(): ViewSystemConfig {
    return { ...this.config };
  }
}
