/**
 * Modal Types Module
 * Defines core types for the framework-agnostic modal system
 * This module provides the foundation for implementing wallet connection modals
 * across different UI frameworks
 *
 * @module modal
 */

import type { ChainType } from './chains.js';
import type { ProviderInterface } from './providers.js';

/**
 * Modal view state identifiers
 * Defines all possible views/screens in the modal UI
 *
 * @type ModalView
 */
export type ModalView =
  | 'walletSelection' // Initial wallet selection screen
  | 'providerSelection' // Provider interface selection when multiple are available
  | 'connecting' // Connection in progress
  | 'connected' // Successfully connected
  | 'error'; // Error state

/**
 * Modal configuration options
 * Defines customization options for the modal behavior and appearance
 *
 * @interface ModalConfig
 */
export interface ModalConfig {
  /** Theme setting for the modal UI */
  theme?: 'light' | 'dark' | 'system';
  /** Whether to show provider interface selection */
  showProviderSelection?: boolean;
  /** Default chain to connect to */
  defaultChain?: ChainType;
  /** Auto-close delay after successful connection (ms) */
  autoCloseDelay?: number;
  /** Whether to persist wallet selection */
  persistWalletSelection?: boolean;
}

/**
 * Modal internal state
 * Represents the complete state of the modal at any given time
 *
 * @interface ModalState
 */
export interface ModalState {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Current view being displayed */
  currentView: ModalView;
  /** Selected wallet identifier */
  selectedWallet: string | null;
  /** Selected provider interface */
  selectedProvider: ProviderInterface | null;
  /** Selected blockchain */
  selectedChain: ChainType | null;
  /** Error information if in error state */
  error: Error | null;
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * View transition definition
 * Defines rules for transitioning between modal views
 *
 * @interface ViewTransition
 */
export interface ViewTransition {
  /** Starting view */
  from: ModalView;
  /** Target view */
  to: ModalView;
  /** Action that triggers the transition */
  action: string;
  /** Optional condition that must be met for transition */
  condition?: (state: ModalState) => boolean;
}

/**
 * Modal state update listener
 * Function type for subscribers to state changes
 *
 * @type StateListener
 */
export type StateListener = (state: ModalState) => void;

/**
 * Modal action types
 * Defines all possible actions that can modify the modal state
 *
 * @type ModalAction
 */
export type ModalAction =
  | { type: 'OPEN' } // Open the modal
  | { type: 'CLOSE' } // Close the modal
  | { type: 'SELECT_WALLET'; wallet: string } // Select a wallet
  | { type: 'SELECT_PROVIDER'; provider: ProviderInterface } // Select a provider
  | { type: 'SELECT_CHAIN'; chain: ChainType } // Select a chain
  | { type: 'START_CONNECTING' } // Begin connection
  | { type: 'CONNECTION_SUCCESS' } // Connection succeeded
  | { type: 'CONNECTION_ERROR'; error: Error } // Connection failed
  | { type: 'RESET' } // Reset state
  | { type: 'BACK' }; // Navigate back

/**
 * Modal controller interface
 * Defines the public API for interacting with the modal
 *
 * @interface ModalController
 */
export interface ModalController {
  /** Open the modal */
  open(): void;

  /** Close the modal */
  close(): void;

  /**
   * Select a wallet for connection
   * @param walletId - ID of the selected wallet
   */
  selectWallet(walletId: string): void;

  /**
   * Select a provider interface
   * @param providerInterface - The selected provider interface
   */
  selectProvider(providerInterface: ProviderInterface): void;

  /**
   * Select a blockchain network
   * @param chain - The selected chain
   */
  selectChain(chain: ChainType): void;

  /**
   * Initiate wallet connection
   * @returns Promise that resolves when connection is complete
   */
  connect(): Promise<void>;

  /** Cancel current operation */
  cancel(): void;

  /** Navigate back to previous view */
  back(): void;

  /**
   * Get current modal state
   * @returns Current state of the modal
   */
  getState(): ModalState;

  /**
   * Subscribe to state updates
   * @param listener - Function to call when state changes
   * @returns Function to unsubscribe
   */
  subscribe(listener: StateListener): () => void;

  /** Reset modal state */
  reset(): void;
}

/**
 * Modal controller factory options
 * Options for creating a new modal controller instance
 *
 * @interface ModalControllerOptions
 */
export interface ModalControllerOptions {
  /** Initial configuration */
  config?: ModalConfig;
  /** Initial state overrides */
  initialState?: Partial<ModalState>;
}
