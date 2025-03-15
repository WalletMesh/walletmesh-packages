import type { ChainType } from './chains.js';
import type { ProviderInterface } from './providers.js';

/**
 * Events Module
 * Defines the event system used for wallet client communication
 *
 * @module events
 */

/**
 * Client event types
 * Defines all possible events that can be emitted by the wallet client
 *
 * @enum {string}
 */
export enum ClientEventType {
  /** Emitted when a connection attempt starts */
  CONNECTING = 'connecting',
  /** Emitted when connection is established */
  CONNECTED = 'connected',
  /** Emitted when disconnected from wallet */
  DISCONNECTED = 'disconnected',
  /** Emitted when blockchain network changes */
  CHAIN_CHANGED = 'chainChanged',
  /** Emitted when account list changes */
  ACCOUNTS_CHANGED = 'accountsChanged',
  /** Emitted when an error occurs */
  ERROR = 'error',
}

/**
 * Base event interface
 * Common properties for all events
 *
 * @interface ClientEvent
 */
export interface ClientEvent {
  /** Type of the event */
  type: ClientEventType;
}

/**
 * Connection Events
 * Events related to wallet connection state changes
 */

/**
 * Emitted when connection process starts
 * @interface ConnectingEvent
 * @extends {ClientEvent}
 */
export interface ConnectingEvent extends ClientEvent {
  type: ClientEventType.CONNECTING;
  /** Type of provider being connected to */
  providerType: ProviderInterface;
}

/**
 * Emitted when connection is established
 * @interface ConnectedEvent
 * @extends {ClientEvent}
 */
export interface ConnectedEvent extends ClientEvent {
  type: ClientEventType.CONNECTED;
  /** Connected blockchain network type */
  chainType: ChainType;
  /** Connected provider type */
  providerType: ProviderInterface;
  /** Connected account addresses */
  accounts: string[];
}

/**
 * Emitted when disconnected from wallet
 * @interface DisconnectedEvent
 * @extends {ClientEvent}
 */
export interface DisconnectedEvent extends ClientEvent {
  type: ClientEventType.DISCONNECTED;
  /** Optional reason for disconnection */
  reason?: string;
}

/**
 * State Change Events
 * Events related to wallet state changes
 */

/**
 * Emitted when blockchain network changes
 * @interface ChainChangedEvent
 * @extends {ClientEvent}
 */
export interface ChainChangedEvent extends ClientEvent {
  type: ClientEventType.CHAIN_CHANGED;
  /** New chain type */
  chainType: ChainType;
  /** New chain ID */
  chainId: string;
}

/**
 * Emitted when account list changes
 * @interface AccountsChangedEvent
 * @extends {ClientEvent}
 */
export interface AccountsChangedEvent extends ClientEvent {
  type: ClientEventType.ACCOUNTS_CHANGED;
  /** New list of account addresses */
  accounts: string[];
}

/**
 * Error event
 * Emitted when an error occurs
 *
 * @interface ErrorEvent
 * @extends {ClientEvent}
 */
export interface ErrorEvent extends ClientEvent {
  type: ClientEventType.ERROR;
  /** Error that occurred */
  error: Error;
  /** Optional context where error occurred */
  context?: string;
}

/**
 * Union type of all possible client events
 * Used for type-safe event handling
 *
 * @type WalletClientEvent
 */
export type WalletClientEvent =
  | ConnectingEvent
  | ConnectedEvent
  | DisconnectedEvent
  | ChainChangedEvent
  | AccountsChangedEvent
  | ErrorEvent;

/**
 * Event listener type
 * Type-safe event handler function
 *
 * @template T - Type of event being listened for
 */
export type EventListener<T extends WalletClientEvent> = (event: T) => void;

/**
 * Event emitter interface
 * Defines standard event emitter functionality
 *
 * @interface EventEmitter
 */
export interface EventEmitter {
  /**
   * Register event listener
   * @template T - Type of event to listen for
   * @param event - Event type
   * @param listener - Event handler function
   */
  on<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void;

  /**
   * Remove event listener
   * @template T - Type of event to stop listening for
   * @param event - Event type
   * @param listener - Event handler function to remove
   */
  off<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void;

  /**
   * Emit an event
   * @template T - Type of event to emit
   * @param event - Event object to emit
   */
  emit<T extends WalletClientEvent>(event: T): void;
}
