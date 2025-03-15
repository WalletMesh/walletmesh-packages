import type { ChainType } from '../../types/chains.js';
import type { BaseProvider, ProviderCapability, ProviderInterface } from '../../types/providers.js';
import { ConnectionState } from '../types.js';

/**
 * Error thrown when connection attempt times out
 */
export class ConnectionTimeoutError extends Error {
  constructor(timeout: number) {
    super(`Connection timed out after ${timeout}ms`);
    this.name = 'ConnectionTimeoutError';
  }
}

/**
 * Interface for managing provider creation and capabilities
 */
export interface ProviderFactory {
  createProvider(type: ProviderInterface, chain: ChainType): BaseProvider;
  getCapabilities(type: ProviderInterface): ProviderCapability;
}

/**
 * Interface for managing events
 */
export interface EventManager {
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

/**
 * State management interface for base connector
 * @interface ConnectorState
 */
export interface ConnectorState {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Current chain type if connected */
  chain: ChainType | null;
  /** Current provider interface if connected */
  provider: ProviderInterface | null;
  /** Connected account addresses */
  accounts: string[];
  /** Last error if in error state */
  error: Error | null;
}

/**
 * Extended error types for base connector
 */

/**
 * Error thrown when attempting to use an uninitialized connector
 */
export class ConnectorNotInitializedError extends Error {
  constructor() {
    super('Connector not initialized');
    this.name = 'ConnectorNotInitializedError';
  }
}

/**
 * Error thrown when attempting to connect while another connection is in progress
 */
export class ConnectionInProgressError extends Error {
  constructor() {
    super('Connection already in progress');
    this.name = 'ConnectionInProgressError';
  }
}

/**
 * Create initial connector state
 * @returns Default connector state
 */
export const createInitialState = (): ConnectorState => ({
  connectionState: ConnectionState.DISCONNECTED,
  chain: null,
  provider: null,
  accounts: [],
  error: null,
});
