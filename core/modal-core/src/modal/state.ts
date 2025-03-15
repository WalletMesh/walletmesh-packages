/**
 * Modal state management implementation
 * Provides centralized state management for the modal UI
 */

import type { ModalState, ModalAction, StateListener, ModalConfig } from '../types/modal.js';

/**
 * Default initial state for the modal
 * @type {ModalState}
 */
const DEFAULT_STATE: ModalState = {
  isOpen: false,
  currentView: 'walletSelection',
  selectedWallet: null,
  selectedProvider: null,
  selectedChain: null,
  error: null,
  isLoading: false,
};

/**
 * Modal state manager class
 * Manages state transitions and view updates for the modal UI
 */
export class ModalStateManager {
  private state: ModalState;
  private listeners: Set<StateListener>;
  private config: ModalConfig;

  /**
   * Create a new ModalStateManager instance
   * @param config - Optional modal configuration
   * @param initialState - Optional initial state overrides
   */
  constructor(config: ModalConfig = {}, initialState: Partial<ModalState> = {}) {
    this.state = { ...DEFAULT_STATE, ...initialState };
    this.listeners = new Set();
    this.config = config;
  }

  /**
   * Get current state
   * @returns A copy of the current state
   */
  getState(): ModalState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   * @param listener - Function to be called when state changes
   * @returns Function to unsubscribe
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update state and notify listeners
   * @private
   * @param updates - Partial state updates to apply
   */
  private setState(updates: Partial<ModalState>): void {
    const newState = { ...this.state, ...updates };

    // Only update and notify if state actually changed
    if (JSON.stringify(newState) !== JSON.stringify(this.state)) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  /**
   * Notify all subscribers of state change
   * @private
   */
  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.setState(DEFAULT_STATE);
  }

  /**
   * Handle state transitions based on actions
   * @param action - The action to process
   */
  dispatch(action: ModalAction): void {
    let updates: Partial<ModalState>;

    switch (action.type) {
      case 'OPEN':
        updates = {
          isOpen: true,
          currentView: 'walletSelection',
          selectedWallet: null,
          selectedProvider: null,
          error: null,
        };
        break;

      case 'CLOSE':
        updates = {
          isOpen: false,
          currentView: 'walletSelection',
          selectedWallet: null,
          selectedProvider: null,
          error: null,
        };
        break;

      case 'SELECT_WALLET':
        updates = {
          selectedWallet: action.wallet,
          currentView: this.config.showProviderSelection ? 'providerSelection' : 'connecting',
          error: null,
        };
        break;

      case 'SELECT_PROVIDER':
        updates = {
          selectedProvider: action.provider,
          currentView: 'connecting',
          error: null,
        };
        break;

      case 'SELECT_CHAIN':
        updates = {
          selectedChain: action.chain,
          error: null,
        };
        break;

      case 'START_CONNECTING':
        updates = {
          currentView: 'connecting',
          isLoading: true,
          error: null,
        };
        break;

      case 'CONNECTION_SUCCESS':
        updates = {
          currentView: 'connected',
          isLoading: false,
          error: null,
        };
        break;

      case 'CONNECTION_ERROR':
        updates = {
          currentView: 'error',
          isLoading: false,
          error: action.error,
        };
        break;

      case 'BACK':
        this.handleBackAction();
        return;

      case 'RESET':
        this.reset();
        return;

      default:
        console.error('Unknown action type:', (action as ModalAction).type);
        return;
    }

    this.setState(updates);
  }

  /**
   * Handle back navigation between views
   * Manages state transitions when navigating backwards
   * @private
   */
  private handleBackAction(): void {
    switch (this.state.currentView) {
      case 'providerSelection':
        // Always reset selection when going back from provider selection
        this.setState({
          currentView: 'walletSelection',
          selectedWallet: null,
          selectedProvider: null,
          error: null,
          isLoading: false,
        });
        break;

      case 'connecting':
        // Reset provider but keep wallet when going back during connection
        if (this.config.showProviderSelection) {
          this.setState({
            currentView: 'providerSelection',
            selectedProvider: null,
            error: null,
            isLoading: false,
          });
        } else {
          this.setState({
            currentView: 'walletSelection',
            selectedWallet: null,
            selectedProvider: null,
            error: null,
            isLoading: false,
          });
        }
        break;

      case 'error':
        // Reset everything on error
        this.setState({
          currentView: 'walletSelection',
          selectedWallet: null,
          selectedProvider: null,
          error: null,
          isLoading: false,
        });
        break;

      default:
        // No back action for other views
        break;
    }
  }

  /**
   * Update configuration
   * @param updates - Partial configuration updates to apply
   */
  updateConfig(updates: Partial<ModalConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   * @returns A copy of the current configuration
   */
  getConfig(): ModalConfig {
    return { ...this.config };
  }
}
