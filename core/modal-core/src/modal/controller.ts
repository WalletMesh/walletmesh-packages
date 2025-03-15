/**
 * Modal controller implementation that coordinates state and view management
 * Provides the main interface for controlling the modal UI and managing its lifecycle
 */

import type {
  ModalController,
  ModalConfig,
  ModalState,
  StateListener,
  ModalControllerOptions,
} from '../types/modal.js';
import type { ProviderInterface } from '../types/providers.js';
import type { ChainType } from '../types/chains.js';
import { ModalStateManager } from './state.js';
import { ViewSystem } from './views.js';

/**
 * Implementation of the modal controller
 * Coordinates state management, view transitions, and user interactions
 * @implements {ModalController}
 */
export class ModalControllerImpl implements ModalController {
  private stateManager: ModalStateManager;
  private viewSystem: ViewSystem;

  /**
   * Create a new ModalControllerImpl instance
   * @param options - Configuration options for the controller
   */
  constructor(options: ModalControllerOptions = {}) {
    this.stateManager = new ModalStateManager(options.config, options.initialState);
    this.viewSystem = new ViewSystem({
      defaultView: 'walletSelection',
      validateTransitions: true,
    });

    // Subscribe to state changes to handle view transitions
    this.stateManager.subscribe((state) => {
      this.handleStateChange(state);
    });
  }

  /**
   * Open the modal
   * Displays the modal UI and resets to the wallet selection view
   */
  open(): void {
    this.stateManager.dispatch({ type: 'OPEN' });
  }

  /**
   * Close the modal
   * Hides the modal UI and resets state
   */
  close(): void {
    this.stateManager.dispatch({ type: 'CLOSE' });
  }

  /**
   * Select a wallet for connection
   * @param walletId - Identifier of the selected wallet
   */
  selectWallet(walletId: string): void {
    this.stateManager.dispatch({
      type: 'SELECT_WALLET',
      wallet: walletId,
    });
  }

  /**
   * Select a provider interface
   * @param providerInterface - The selected provider interface
   */
  selectProvider(providerInterface: ProviderInterface): void {
    this.stateManager.dispatch({
      type: 'SELECT_PROVIDER',
      provider: providerInterface,
    });
  }

  /**
   * Select a blockchain network
   * @param chain - The selected blockchain network
   */
  selectChain(chain: ChainType): void {
    this.stateManager.dispatch({
      type: 'SELECT_CHAIN',
      chain,
    });
  }

  /**
   * Initiate wallet connection
   * Starts the connection process with the selected wallet
   * @throws {Error} If no wallet is selected
   */
  async connect(): Promise<void> {
    const state = this.getState();

    if (!state.selectedWallet) {
      throw new Error('No wallet selected');
    }

    try {
      this.stateManager.dispatch({ type: 'START_CONNECTING' });

      // Connection logic will be injected by UI framework implementations
      // They will handle the actual connection using WalletClient

      this.stateManager.dispatch({ type: 'CONNECTION_SUCCESS' });
    } catch (error) {
      this.stateManager.dispatch({
        type: 'CONNECTION_ERROR',
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Cancel current operation
   * Returns to previous view or closes modal depending on state
   */
  cancel(): void {
    const state = this.getState();

    if (state.isLoading) {
      // If in loading state, go back to previous view
      this.back();
    } else {
      // Otherwise close the modal
      this.close();
    }
  }

  /**
   * Navigate back to previous view
   * Handles view transitions based on current state
   */
  back(): void {
    this.stateManager.dispatch({ type: 'BACK' });
  }

  /**
   * Get current modal state
   * @returns Current state of the modal
   */
  getState(): ModalState {
    return this.stateManager.getState();
  }

  /**
   * Subscribe to state updates
   * @param listener - Function to be called when state changes
   * @returns Function to unsubscribe
   */
  subscribe(listener: StateListener): () => void {
    return this.stateManager.subscribe(listener);
  }

  /**
   * Reset modal state
   * Returns modal to initial state
   */
  reset(): void {
    this.stateManager.dispatch({ type: 'RESET' });
  }

  /**
   * Update modal configuration
   * @param config - Partial configuration updates to apply
   */
  updateConfig(config: Partial<ModalConfig>): void {
    this.stateManager.updateConfig(config);
  }

  /**
   * Get current configuration
   * @returns Current modal configuration
   */
  getConfig(): ModalConfig {
    return this.stateManager.getConfig();
  }

  /**
   * Handle state changes and manage view transitions
   * @private
   * @param state - New modal state
   */
  private async handleStateChange(state: ModalState): Promise<void> {
    const { currentView } = state;
    const previousView = this.getPreviousView();

    if (previousView && previousView !== currentView) {
      try {
        const success = await this.viewSystem.executeTransition(previousView, currentView, state);

        if (!success) {
          console.warn(`Invalid view transition: ${previousView} -> ${currentView}`);
        }
      } catch (error) {
        console.error('Error during view transition:', error);
      }
    }
  }

  /**
   * Get the previous view from state
   * This is a placeholder - actual implementation would track view history
   * @private
   * @returns Previous view or null
   */
  private getPreviousView(): ModalState['currentView'] | null {
    // For now we just return null, but in a real implementation
    // we would track the view history in the state
    return null;
  }
}
