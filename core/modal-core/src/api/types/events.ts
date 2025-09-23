/**
 * Consolidated event system interfaces for the modal system
 *
 * This module consolidates all event types from across the system:
 * - Modal events (view, connection, state)
 * - Session events (from sessionState.ts)
 * - Provider events (from providerInstances.ts)
 * - Transport events (from types.ts)
 * - Wallet events (discovery, availability)
 *
 * ## Event System Architecture
 *
 * The event system provides a unified interface for all wallet-related events,
 * enabling reactive programming patterns throughout the application.
 *
 * ### Event Categories
 *
 * 1. **View Events** (`view:*`) - Modal UI state changes
 * 2. **Connection Events** (`connection:*`) - Wallet connection lifecycle
 * 3. **State Events** (`state:*`) - General state updates
 * 4. **Wallet Events** (`wallet:*`) - Wallet discovery and availability
 * 5. **Session Events** (`session:*`) - Session lifecycle management
 * 6. **Provider Events** (`provider:*`) - Provider status and operations
 * 7. **Transport Events** (`transport:*`) - Low-level communication
 * 8. **Chain Events** (`chain:*`) - Blockchain network changes
 *
 * ### Event Flow Example
 *
 * ```
 * User clicks connect → wallet:selected
 *                     → connection:initiated
 *                     → transport:connected
 *                     → connection:establishing
 *                     → provider:connected
 *                     → session:created
 *                     → connection:established
 * ```
 *
 * ## Usage Examples
 *
 * ```typescript
 * // Subscribe to specific events
 * emitter.on('connection:established', (event) => {
 *   console.log(`Connected to ${event.walletId}`);
 * });
 *
 * // Subscribe to event categories
 * emitter.onCategory('connection', (eventName, data) => {
 *   console.log(`Connection event: ${eventName}`);
 * });
 *
 * // Type-safe event emission
 * emitter.emit('chain:switched', {
 *   walletId: 'metamask',
 *   fromChainId: '0x1',
 *   toChainId: '0x89',
 *   // ... other required fields
 * });
 * ```
 *
 * @module types/events
 * @packageDocumentation
 */

import type { ChainType, ModalView, SupportedChain } from '../../core/types.js';
import type { ModalError } from '../../schemas/errors.js';
import type { SessionState, SessionStatus } from './sessionState.js';
/**
 * Provider instance for event definitions
 * @public
 */
export type ProviderInstance = {
  id: string;
  chainType: ChainType;
  walletId: string;
};

/**
 * Provider status for event definitions
 * @public
 */
export type ProviderStatus = 'initializing' | 'available' | 'connected' | 'disconnected' | 'error';

/**
 * Consolidated modal event map with standardized event names
 *
 * Event naming convention:
 * - View events: `view:*` - Modal view state changes
 * - Connection events: `connection:*` - Wallet connection lifecycle
 * - State events: `state:*` - General state updates
 * - Wallet events: `wallet:*` - Wallet discovery and availability
 * - Session events: `session:*` - Session lifecycle and management
 * - Provider events: `provider:*` - Provider lifecycle and operations
 * - Transport events: `transport:*` - Transport communication events
 * - Chain events: `chain:*` - Chain switching and management
 *
 * @example
 * ```typescript
 * // Type-safe event handling
 * function handleEvent<K extends keyof ModalEventMap>(
 *   event: K,
 *   handler: (data: ModalEventMap[K]) => void
 * ) {
 *   emitter.on(event, handler);
 * }
 *
 * // Usage with full type safety
 * handleEvent('connection:established', (data) => {
 *   // TypeScript knows all properties of ConnectionEstablishedEvent
 *   console.log(data.walletId, data.chainId, data.accounts);
 * });
 * ```
 *
 * @public
 */
export interface ModalEventMap {
  // === VIEW EVENTS ===
  'view:changing': ViewChangingEvent;
  'view:changed': ViewChangedEvent;

  // === CONNECTION EVENTS ===
  'connection:initiated': ConnectionInitiatedEvent;
  'connection:establishing': ConnectionEstablishingEvent;
  'connection:established': ConnectionEstablishedEvent;
  'connection:failed': ConnectionFailedEvent;
  'connection:lost': ConnectionLostEvent;
  'connection:restored': ConnectionRestoredEvent;

  // === STATE EVENTS ===
  'state:updated': StateUpdatedEvent;
  'state:reset': StateResetEvent;

  // === WALLET EVENTS ===
  'wallet:discovered': WalletDiscoveredEvent;
  'wallet:available': WalletAvailableEvent;
  'wallet:unavailable': WalletUnavailableEvent;
  'wallet:selected': WalletSelectedEvent;

  // === SESSION EVENTS ===
  'session:created': SessionCreatedEvent;
  'session:updated': SessionUpdatedEvent;
  'session:status-changed': SessionStatusChangedEvent;
  'session:ended': SessionEndedEvent;
  'session:expired': SessionExpiredEvent;
  'session:error': SessionErrorEvent;

  // === PROVIDER EVENTS ===
  'provider:registered': ProviderRegisteredEvent;
  'provider:unregistered': ProviderUnregisteredEvent;
  'provider:status-changed': ProviderStatusChangedEvent;
  'provider:connected': ProviderConnectedEvent;
  'provider:disconnected': ProviderDisconnectedEvent;
  'provider:error': ProviderErrorEvent;

  // === TRANSPORT EVENTS ===
  'transport:connected': TransportConnectedEvent;
  'transport:disconnected': TransportDisconnectedEvent;
  'transport:message': TransportMessageEvent;
  'transport:error': TransportErrorEvent;

  // === CHAIN EVENTS ===
  'chain:switching': ChainSwitchingEvent;
  'chain:switched': ChainSwitchedEvent;
  'chain:switch-failed': ChainSwitchFailedEvent;
  'chain:added': ChainAddedEvent;
}

/**
 * View is changing from one state to another
 * @public
 */
export interface ViewChangingEvent {
  from: ModalView;
  to: ModalView;
  timestamp: number;
}

/**
 * View has changed to a new state
 * @public
 */
export interface ViewChangedEvent {
  view: ModalView;
  previousView: ModalView;
  timestamp: number;
}

/**
 * Connection process has been initiated
 * @public
 */
export interface ConnectionInitiatedEvent {
  walletId: string;
  chainType?: string | undefined;
  timestamp: number;
}

/**
 * Connection has been successfully established
 * @public
 */
export interface ConnectionEstablishedEvent {
  walletId: string;
  address: string;
  chain: SupportedChain;
  chainType: string;
  provider: unknown;
  accounts: string[];
  timestamp: number;
}

/**
 * Connection attempt failed
 * @public
 */
export interface ConnectionFailedEvent {
  walletId: string;
  error: ModalError;
  timestamp: number;
}

/**
 * Existing connection was lost
 * @public
 */
export interface ConnectionLostEvent {
  walletId: string;
  reason?: string | undefined;
  timestamp: number;
}

/**
 * General state update event
 * @public
 */
export interface StateUpdatedEvent {
  type: 'accounts' | 'chain' | 'network';
  data: unknown;
  timestamp: number;
}

/**
 * Wallet became available
 * @public
 */
export interface WalletAvailableEvent {
  walletId: string;
  timestamp: number;
}

/**
 * Wallet became unavailable
 * @public
 */
export interface WalletUnavailableEvent {
  walletId: string;
  reason?: string | undefined;
  timestamp: number;
}

/**
 * Type guard to check if an event is a valid modal event
 *
 * Validates that a string is a recognized event name in the system.
 * Useful for runtime validation of event names from external sources.
 *
 * @param event - Event name to validate
 * @returns True if event is a valid ModalEventMap key
 *
 * @example
 * ```typescript
 * function subscribeToEvent(eventName: string, handler: Function) {
 *   if (!isModalEvent(eventName)) {
 *     throw new Error(`Unknown event: ${eventName}`);
 *   }
 *
 *   // TypeScript now knows eventName is keyof ModalEventMap
 *   emitter.on(eventName, handler);
 * }
 *
 * // Validate events from configuration
 * const eventsToTrack = ['connection:established', 'unknown:event'];
 * const validEvents = eventsToTrack.filter(isModalEvent);
 * ```
 *
 * @public
 */
export function isModalEvent(event: string): event is keyof ModalEventMap {
  return event in modalEventNames;
}

/**
 * Chain has been switched
 * @public
 */
export interface ChainSwitchedEvent {
  walletId: string;
  walletSessionId: string;
  fromChainId: string;
  toChainId: string;
  fromChainStateId: string;
  toChainStateId: string;
  isNewChain: boolean;
  timestamp: number;
}

// === NEW CONSOLIDATED EVENT INTERFACES ===

/**
 * Connection is being established
 * @public
 */
export interface ConnectionEstablishingEvent {
  walletId: string;
  chainType: ChainType;
  chain?: SupportedChain;
  attempt: number;
  timestamp: number;
}

/**
 * Connection was restored after being lost
 * @public
 */
export interface ConnectionRestoredEvent {
  walletId: string;
  address: string;
  chain: SupportedChain;
  chainType: ChainType;
  timestamp: number;
}

/**
 * State has been reset
 * @public
 */
export interface StateResetEvent {
  reason: 'user_action' | 'error' | 'timeout' | 'cleanup';
  timestamp: number;
}

/**
 * Wallet was discovered through discovery protocol
 * @public
 */
export interface WalletDiscoveredEvent {
  walletId: string;
  metadata: {
    name: string;
    icon: string;
    version?: string;
    chains: ChainType[];
  };
  source: 'injected' | 'announced' | 'extension' | 'manual';
  timestamp: number;
}

/**
 * Wallet was selected by user
 * @public
 */
export interface WalletSelectedEvent {
  walletId: string;
  chainType?: ChainType;
  method: 'click' | 'keyboard' | 'programmatic';
  timestamp: number;
}

// === SESSION EVENTS ===

/**
 * Session was created
 * @public
 */
export interface SessionCreatedEvent {
  session: SessionState;
  timestamp: number;
}

/**
 * Session was updated
 * @public
 */
export interface SessionUpdatedEvent {
  session: SessionState;
  changes: Partial<SessionState>;
  timestamp: number;
}

/**
 * Session status changed
 * @public
 */
export interface SessionStatusChangedEvent {
  sessionId: string;
  walletId: string;
  status: SessionStatus;
  previousStatus: SessionStatus;
  timestamp: number;
}

/**
 * Session ended
 * @public
 */
export interface SessionEndedEvent {
  sessionId: string;
  walletId: string;
  reason: 'user_disconnect' | 'timeout' | 'error' | 'wallet_disconnect';
  duration: number;
  timestamp: number;
}

/**
 * Session expired
 * @public
 */
export interface SessionExpiredEvent {
  sessionId: string;
  walletId: string;
  expiresAt: number;
  timestamp: number;
}

/**
 * Session encountered an error
 * @public
 */
export interface SessionErrorEvent {
  sessionId: string;
  walletId: string;
  error: ModalError;
  timestamp: number;
}

// === PROVIDER EVENTS ===

/**
 * Provider was registered
 * @public
 */
export interface ProviderRegisteredEvent {
  provider: ProviderInstance;
  timestamp: number;
}

/**
 * Provider was unregistered
 * @public
 */
export interface ProviderUnregisteredEvent {
  chainType: ChainType;
  walletId: string;
  reason: 'cleanup' | 'error' | 'replacement' | 'manual';
  timestamp: number;
}

/**
 * Provider status changed
 * @public
 */
export interface ProviderStatusChangedEvent {
  provider: ProviderInstance;
  oldStatus: ProviderStatus;
  newStatus: ProviderStatus;
  timestamp: number;
}

/**
 * Provider connected
 * @public
 */
export interface ProviderConnectedEvent {
  provider: ProviderInstance;
  addresses: string[];
  chain: SupportedChain;
  timestamp: number;
}

/**
 * Provider disconnected
 * @public
 */
export interface ProviderDisconnectedEvent {
  provider: ProviderInstance;
  reason?: string;
  timestamp: number;
}

/**
 * Provider encountered an error
 * @public
 */
export interface ProviderErrorEvent {
  provider: ProviderInstance;
  error: ModalError;
  operation?: string;
  timestamp: number;
}

// === TRANSPORT EVENTS ===

/**
 * Transport connected
 * @public
 */
export interface TransportConnectedEvent {
  type: 'transport:connected';
  transportType: string;
  timestamp: number;
}

/**
 * Transport disconnected
 * @public
 */
export interface TransportDisconnectedEvent {
  type: 'transport:disconnected';
  transportType: string;
  reason?: string;
  timestamp: number;
}

/**
 * Transport message received
 * @public
 */
export interface TransportMessageEvent {
  type: 'transport:message';
  transportType: string;
  data: unknown;
  timestamp: number;
}

/**
 * Transport error occurred
 * @public
 */
export interface TransportErrorEvent {
  type: 'transport:error';
  transportType: string;
  error: ModalError;
  timestamp: number;
}

// === CHAIN EVENTS ===

/**
 * Chain switch is starting
 * @public
 */
export interface ChainSwitchingEvent {
  walletId: string;
  sessionId: string;
  fromChain: SupportedChain;
  toChain: SupportedChain;
  fromChainType: ChainType;
  toChainType: ChainType;
  timestamp: number;
}

/**
 * Chain switch failed
 * @public
 */
export interface ChainSwitchFailedEvent {
  walletId: string;
  sessionId: string;
  targetChain: SupportedChain;
  targetChainType: ChainType;
  error: ModalError;
  timestamp: number;
}

/**
 * New chain was added to wallet
 * @public
 */
export interface ChainAddedEvent {
  walletId: string;
  chain: SupportedChain;
  chainType: ChainType;
  chainConfig: {
    name: string;
    rpcUrl?: string;
    explorerUrl?: string;
  };
  timestamp: number;
}

/**
 * Object containing all modal event names for iteration
 * @public
 */
export const modalEventNames: Record<keyof ModalEventMap, keyof ModalEventMap> = {
  // View events
  'view:changing': 'view:changing',
  'view:changed': 'view:changed',

  // Connection events
  'connection:initiated': 'connection:initiated',
  'connection:establishing': 'connection:establishing',
  'connection:established': 'connection:established',
  'connection:failed': 'connection:failed',
  'connection:lost': 'connection:lost',
  'connection:restored': 'connection:restored',

  // State events
  'state:updated': 'state:updated',
  'state:reset': 'state:reset',

  // Wallet events
  'wallet:discovered': 'wallet:discovered',
  'wallet:available': 'wallet:available',
  'wallet:unavailable': 'wallet:unavailable',
  'wallet:selected': 'wallet:selected',

  // Session events
  'session:created': 'session:created',
  'session:updated': 'session:updated',
  'session:status-changed': 'session:status-changed',
  'session:ended': 'session:ended',
  'session:expired': 'session:expired',
  'session:error': 'session:error',

  // Provider events
  'provider:registered': 'provider:registered',
  'provider:unregistered': 'provider:unregistered',
  'provider:status-changed': 'provider:status-changed',
  'provider:connected': 'provider:connected',
  'provider:disconnected': 'provider:disconnected',
  'provider:error': 'provider:error',

  // Transport events
  'transport:connected': 'transport:connected',
  'transport:disconnected': 'transport:disconnected',
  'transport:message': 'transport:message',
  'transport:error': 'transport:error',

  // Chain events
  'chain:switching': 'chain:switching',
  'chain:switched': 'chain:switched',
  'chain:switch-failed': 'chain:switch-failed',
  'chain:added': 'chain:added',
} as const;

/**
 * Event category groupings for filtering and subscriptions
 *
 * Groups related events together for bulk subscriptions and filtering.
 * Use with `onCategory` method or for implementing custom event routers.
 *
 * @example
 * ```typescript
 * // Subscribe to all connection-related events
 * eventCategories.connection.forEach(eventName => {
 *   emitter.on(eventName, (data) => {
 *     logConnectionEvent(eventName, data);
 *   });
 * });
 *
 * // Filter events by category
 * function isConnectionEvent(eventName: string): boolean {
 *   return eventCategories.connection.includes(eventName as any);
 * }
 *
 * // Create category-specific event bus
 * class ConnectionEventBus {
 *   constructor(private emitter: EventEmitter) {
 *     this.subscribeToCategory();
 *   }
 *
 *   private subscribeToCategory() {
 *     this.emitter.onCategory('connection', this.handleEvent);
 *   }
 * }
 * ```
 *
 * @public
 */
export const eventCategories = {
  view: ['view:changing', 'view:changed'] as const,
  connection: [
    'connection:initiated',
    'connection:establishing',
    'connection:established',
    'connection:failed',
    'connection:lost',
    'connection:restored',
  ] as const,
  state: ['state:updated', 'state:reset'] as const,
  wallet: ['wallet:discovered', 'wallet:available', 'wallet:unavailable', 'wallet:selected'] as const,
  session: [
    'session:created',
    'session:updated',
    'session:status-changed',
    'session:ended',
    'session:expired',
    'session:error',
  ] as const,
  provider: [
    'provider:registered',
    'provider:unregistered',
    'provider:status-changed',
    'provider:connected',
    'provider:disconnected',
    'provider:error',
  ] as const,
  transport: [
    'transport:connected',
    'transport:disconnected',
    'transport:message',
    'transport:error',
  ] as const,
  chain: ['chain:switching', 'chain:switched', 'chain:switch-failed', 'chain:added'] as const,
} as const;

/**
 * Helper type for event categories
 * @public
 */
export type EventCategory = keyof typeof eventCategories;

/**
 * Get events for a specific category
 * @public
 */
export function getEventsByCategory(category: EventCategory): readonly string[] {
  return eventCategories[category];
}

/**
 * Check if event belongs to a category
 * @public
 */
export function isEventInCategory(event: keyof ModalEventMap, category: EventCategory): boolean {
  return eventCategories[category].includes(event as never);
}

/**
 * Event emitter interface for all modal events
 *
 * Provides a type-safe interface for event emission and subscription
 * across the entire modal system. Implementations handle event dispatch,
 * subscription management, and category-based filtering.
 *
 * ## Implementation Requirements
 *
 * - Must maintain subscription order for predictable event flow
 * - Should handle errors in listeners without affecting other listeners
 * - Must support synchronous event emission for state consistency
 * - Should provide memory-efficient subscription management
 *
 * @example
 * ```typescript
 * class MyEventEmitter implements EventEmitter {
 *   private listeners = new Map<string, Set<Function>>();
 *
 *   emit<K extends keyof ModalEventMap>(
 *     event: K,
 *     payload: ModalEventMap[K]
 *   ): void {
 *     const handlers = this.listeners.get(event);
 *     handlers?.forEach(handler => {
 *       try {
 *         handler(payload);
 *       } catch (error) {
 *         console.error(`Error in ${event} handler:`, error);
 *       }
 *     });
 *   }
 *
 *   on<K extends keyof ModalEventMap>(
 *     event: K,
 *     listener: (payload: ModalEventMap[K]) => void
 *   ): () => void {
 *     // Implementation
 *     return () => this.off(event, listener);
 *   }
 * }
 * ```
 *
 * @public
 */
export interface EventEmitter {
  /** Emit an event */
  emit<K extends keyof ModalEventMap>(event: K, payload: ModalEventMap[K]): void;

  /** Subscribe to an event */
  on<K extends keyof ModalEventMap>(event: K, listener: (payload: ModalEventMap[K]) => void): () => void;

  /** Subscribe to an event once */
  once<K extends keyof ModalEventMap>(event: K, listener: (payload: ModalEventMap[K]) => void): () => void;

  /** Unsubscribe from an event */
  off<K extends keyof ModalEventMap>(event: K, listener: (payload: ModalEventMap[K]) => void): void;

  /** Subscribe to multiple events in a category */
  onCategory(
    category: EventCategory,
    listener: (event: keyof ModalEventMap, payload: unknown) => void,
  ): () => void;

  /** Remove all listeners */
  removeAllListeners(event?: keyof ModalEventMap): void;

  /** Get listener count for an event */
  listenerCount(event: keyof ModalEventMap): number;

  /** Get all registered events */
  getRegisteredEvents(): Array<keyof ModalEventMap>;
}
