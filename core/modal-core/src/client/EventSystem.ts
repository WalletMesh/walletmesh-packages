/**
 * Event System for WalletMeshClient
 *
 * This module provides a comprehensive event system for wallet-related events including:
 * - Type-safe event definitions
 * - Event aggregation and forwarding
 * - Event filtering and transformation
 * - Subscription management
 * - Event persistence and replay
 *
 * ## Architecture Overview
 *
 * The EventSystem acts as the central nervous system for WalletMesh, enabling:
 * - **Reactive Programming**: Components react to state changes via events
 * - **Loose Coupling**: Publishers and subscribers are decoupled
 * - **Event History**: Optional persistence for event replay and debugging
 * - **Performance**: Priority-based subscription ordering and efficient filtering
 *
 * ## Event Categories
 *
 * - **Connection Events**: Track wallet connection lifecycle
 * - **State Events**: Monitor connection state changes
 * - **Provider Events**: Handle provider-specific events
 * - **Chain Events**: Track blockchain network switches
 * - **Account Events**: Monitor account/address changes
 * - **Modal Events**: Track UI state transitions
 * - **Discovery Events**: Handle wallet discovery
 * - **Error Events**: Centralized error handling
 *
 * ## Best Practices
 *
 * 1. **Use Typed Events**: Always use the WalletEventMap types
 * 2. **Clean Up Subscriptions**: Store and call unsubscribe functions
 * 3. **Handle Errors**: Add error handlers for robust applications
 * 4. **Filter Events**: Use options to reduce unnecessary callbacks
 * 5. **Prioritize Critical Handlers**: Use priority for time-sensitive logic
 *
 * @module client/EventSystem
 * @packageDocumentation
 */

import type { WalletConnection } from '../api/types/connection.js';
import type { ConnectionEstablishedEvent } from '../api/types/events.js';
import type { Logger } from '../internal/core/logger/logger.js';
import type { SupportedChain } from '../types.js';

/**
 * Core wallet events
 *
 * Type-safe event map defining all possible events in the wallet lifecycle.
 * Each event includes relevant data and a timestamp for tracking.
 *
 * @example
 * ```typescript
 * // Type-safe event subscription
 * eventSystem.on('connection:established', (event) => {
 *   // TypeScript knows event has walletId, connection, timestamp
 *   console.log(`Connected wallet ${event.walletId} at ${event.timestamp}`);
 * });
 *
 * // Filtered subscription for specific wallet
 * eventSystem.on('accounts:changed', (event) => {
 *   updateAccountList(event.accounts);
 * }, { walletId: 'metamask' });
 * ```
 *
 * @public
 */
export interface WalletEventMap {
  // Connection events
  'connection:initiated': { walletId: string; timestamp: number };
  'connection:established': ConnectionEstablishedEvent;
  'connection:failed': { walletId: string; error: Error; timestamp: number };
  'connection:lost': { walletId: string; reason?: string; timestamp: number };
  'connection:restored': { walletId: string; connection: WalletConnection; timestamp: number };

  // State change events
  'connection:added': WalletConnection;
  'connection:removed': { walletId: string; timestamp: number };
  'connection:changed': WalletConnection;

  // Provider events
  'provider:error': { walletId: string; error: Error; timestamp: number };

  // Chain events
  'chain:switched': {
    sessionId: string;
    fromChain: SupportedChain;
    toChain: SupportedChain;
    walletId: string;
    isNewChain: boolean;
    timestamp: number;
  };
  'chain:switching': { walletId: string; toChain: SupportedChain; timestamp: number };
  'chain:switch_failed': { walletId: string; chain: SupportedChain; error: Error; timestamp: number };

  // Account events
  'accounts:changed': { walletId: string; accounts: string[]; timestamp: number };
  'account:selected': { walletId: string; account: string; timestamp: number };

  // Modal events
  'modal:opened': { timestamp: number };
  'modal:closed': { timestamp: number };
  'view:changed': { from: string; to: string; timestamp: number };
  'view:changing': { from: string; to: string; timestamp: number };

  // Client events
  'client:initialized': { timestamp: number };
  'client:destroyed': { timestamp: number };
  'active_wallet:changed': { walletId: string; timestamp: number };

  // Discovery events
  'discovery:event': {
    type: 'wallet_discovered' | 'wallet_available' | 'wallet_unavailable';
    walletInfo: unknown;
    metadata?: Record<string, unknown>;
    timestamp: number;
  };

  // Error events
  'error:global': { error: Error; context: string; timestamp: number };
  'error:wallet': { walletId: string; error: Error; timestamp: number };
  'error:connection': { walletId: string; error: Error; timestamp: number };
}

/**
 * Event subscription options
 *
 * Advanced options for fine-grained control over event subscriptions.
 * Enables filtering, transformation, and prioritization of event handlers.
 *
 * @example
 * ```typescript
 * // Subscribe only to MetaMask events
 * const options: EventSubscriptionOptions = {
 *   walletId: 'metamask',
 *   priority: 10, // Higher priority than default
 *   filter: (event) => event.accounts?.length > 0,
 *   transform: (event) => ({ ...event, normalized: true })
 * };
 *
 * eventSystem.on('connection:established', handler, options);
 * ```
 *
 * @public
 */
export interface EventSubscriptionOptions {
  /** Only receive events from specific wallet */
  walletId?: string;
  /** Only receive events from specific chain */
  chain?: SupportedChain;
  /** Filter events based on custom criteria */
  filter?: (event: unknown) => boolean;
  /** Transform event data before calling handler */
  transform?: (event: unknown) => unknown;
  /** Subscribe only once */
  once?: boolean;
  /** Priority for event handling (higher = earlier) */
  priority?: number;
}

/**
 * Event handler function type
 *
 * @public
 */
export type EventHandler<T> = (event: T) => void | Promise<void>;

/**
 * Event subscription interface
 *
 * @public
 */
export interface EventSubscription {
  /** Event name */
  event: string;
  /** Handler function */
  handler: EventHandler<unknown>;
  /** Subscription options */
  options: EventSubscriptionOptions;
  /** Subscription ID */
  id: string;
  /** Creation timestamp */
  createdAt: number;
  /** Call count */
  callCount: number;
}

/**
 * Event history entry
 *
 * @public
 */
export interface EventHistoryEntry {
  /** Event name */
  event: string;
  /** Event data */
  data: unknown;
  /** Timestamp */
  timestamp: number;
  /** Event ID */
  id: string;
}

/**
 * Event system configuration
 *
 * @public
 */
export interface EventSystemConfig {
  /** Maximum number of events to keep in history */
  maxHistorySize?: number;
  /** Whether to enable event persistence */
  enablePersistence?: boolean;
  /** Whether to enable event replay */
  enableReplay?: boolean;
  /** Maximum subscription priority */
  maxPriority?: number;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Comprehensive Event System for WalletMeshClient
 *
 * The EventSystem provides a robust event-driven architecture for wallet interactions.
 * It supports advanced features like event replay, priority handling, and filtering.
 *
 * ## Key Features
 *
 * - **Type Safety**: Full TypeScript support with WalletEventMap
 * - **Event History**: Optional persistence for debugging and replay
 * - **Priority Handling**: Process critical events first
 * - **Smart Filtering**: Reduce noise with wallet/chain filters
 * - **Error Resilience**: Isolated handler errors don't break the system
 * - **Performance**: Efficient subscription management and dispatch
 *
 * ## Usage Patterns
 *
 * ### Basic Event Subscription
 * ```typescript
 * const eventSystem = new EventSystem(logger);
 *
 * // Subscribe to all connection events
 * eventSystem.on('connection:established', (event) => {
 *   updateUI(event.walletId, event.accounts);
 * });
 * ```
 *
 * ### Filtered Subscriptions
 * ```typescript
 * // Only receive MetaMask events on Ethereum mainnet
 * eventSystem.on('chain:switched', handleChainSwitch, {
 *   walletId: 'metamask',
 *   chainId: '0x1'
 * });
 * ```
 *
 * ### Event Replay for New Components
 * ```typescript
 * // Replay recent events when component mounts
 * eventSystem.replayEvents('connection:established', (event) => {
 *   restoreConnectionState(event);
 * }, { since: Date.now() - 60000 }); // Last minute
 * ```
 *
 * ### Priority Event Handling
 * ```typescript
 * // Critical error handler runs first
 * eventSystem.on('error:global', handleCriticalError, {
 *   priority: 100
 * });
 *
 * // Normal error logging runs after
 * eventSystem.on('error:global', logError, {
 *   priority: 10
 * });
 * ```
 *
 * ### Event History and Debugging
 * ```typescript
 * const eventSystem = new EventSystem(logger, {
 *   maxHistorySize: 1000,
 *   enablePersistence: true,
 *   enableReplay: true
 * });
 *
 * // Get recent events for debugging
 * const recentErrors = eventSystem.getEventHistory('error:wallet', 10);
 * console.log('Last 10 wallet errors:', recentErrors);
 * ```
 *
 * @public
 */
export class EventSystem {
  private readonly logger: Logger;
  private readonly config: Required<EventSystemConfig>;

  // Subscription management
  private readonly subscriptions = new Map<string, EventSubscription[]>();
  private readonly subscriptionsByWallet = new Map<string, Set<string>>();
  private subscriptionIdCounter = 0;

  // Event history and persistence
  private readonly eventHistory: EventHistoryEntry[] = [];
  private eventIdCounter = 0;

  // Error handling
  private readonly errorHandlers = new Set<(error: Error, context: string) => void>();

  constructor(logger: Logger, config: EventSystemConfig = {}) {
    this.logger = logger;
    this.config = {
      maxHistorySize: 1000,
      enablePersistence: false,
      enableReplay: false,
      maxPriority: 100,
      debug: false,
      ...config,
    };

    this.logger.debug('EventSystem initialized', { config: this.config });
  }

  /**
   * Subscribe to an event
   *
   * Creates a subscription to a specific event type with optional filtering
   * and transformation. Returns an unsubscribe function for cleanup.
   *
   * @param event - Event name to subscribe to
   * @param handler - Event handler function
   * @param options - Subscription options for filtering and priority
   * @returns Unsubscribe function - Call this to remove the subscription
   *
   * @example
   * ```typescript
   * // Basic subscription
   * const unsubscribe = eventSystem.on('connection:established', (event) => {
   *   console.log(`Connected: ${event.walletId}`);
   * });
   *
   * // Filtered subscription
   * const unsubMetaMask = eventSystem.on('accounts:changed',
   *   (event) => updateAccounts(event.accounts),
   *   { walletId: 'metamask' }
   * );
   *
   * // Cleanup when done
   * unsubscribe();
   * unsubMetaMask();
   * ```
   *
   * @public
   */
  on<K extends keyof WalletEventMap>(
    event: K,
    handler: EventHandler<WalletEventMap[K]>,
    options: EventSubscriptionOptions = {},
  ): () => void {
    const subscription: EventSubscription = {
      event,
      handler: handler as EventHandler<unknown>,
      options,
      id: this.generateSubscriptionId(),
      createdAt: Date.now(),
      callCount: 0,
    };

    // Add to subscriptions map
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    const eventSubscriptions = this.subscriptions.get(event);
    if (!eventSubscriptions) return () => {};

    // Insert subscription based on priority
    const priority = options.priority || 0;
    let insertIndex = eventSubscriptions.length;

    for (let i = 0; i < eventSubscriptions.length; i++) {
      const subscription = eventSubscriptions[i];
      if (!subscription) continue;
      const existingPriority = subscription.options.priority || 0;
      if (priority > existingPriority) {
        insertIndex = i;
        break;
      }
    }

    eventSubscriptions.splice(insertIndex, 0, subscription);

    // Track by wallet if specified
    if (options.walletId) {
      if (!this.subscriptionsByWallet.has(options.walletId)) {
        this.subscriptionsByWallet.set(options.walletId, new Set());
      }
      this.subscriptionsByWallet.get(options.walletId)?.add(subscription.id);
    }

    this.logger.debug('Event subscription added', {
      event,
      subscriptionId: subscription.id,
      walletId: options.walletId,
      priority,
      totalSubscriptions: eventSubscriptions.length,
    });

    // Return unsubscribe function
    return () => this.unsubscribe(subscription.id);
  }

  /**
   * Subscribe to an event once
   *
   * @param event - Event name to subscribe to
   * @param handler - Event handler function
   * @param options - Subscription options
   * @returns Unsubscribe function
   * @public
   */
  once<K extends keyof WalletEventMap>(
    event: K,
    handler: EventHandler<WalletEventMap[K]>,
    options: EventSubscriptionOptions = {},
  ): () => void {
    return this.on(event, handler, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event by subscription ID
   *
   * @param subscriptionId - ID of the subscription to remove
   * @public
   */
  unsubscribe(subscriptionId: string): void {
    for (const [event, subscriptions] of this.subscriptions) {
      const index = subscriptions.findIndex((sub) => sub.id === subscriptionId);
      if (index !== -1) {
        const subscription = subscriptions[index];
        if (!subscription) continue;

        subscriptions.splice(index, 1);

        // Remove from wallet tracking
        if (subscription.options.walletId) {
          const walletSubs = this.subscriptionsByWallet.get(subscription.options.walletId);
          if (walletSubs) {
            walletSubs.delete(subscriptionId);
            if (walletSubs.size === 0) {
              this.subscriptionsByWallet.delete(subscription.options.walletId);
            }
          }
        }

        this.logger.debug('Event subscription removed', {
          event,
          subscriptionId,
          walletId: subscription.options.walletId,
        });
        break;
      }
    }
  }

  /**
   * Remove all subscriptions for a specific wallet
   *
   * @param walletId - ID of the wallet
   * @public
   */
  unsubscribeWallet(walletId: string): void {
    const walletSubs = this.subscriptionsByWallet.get(walletId);
    if (!walletSubs) return;

    const subscriptionIds = Array.from(walletSubs);
    for (const subscriptionId of subscriptionIds) {
      this.unsubscribe(subscriptionId);
    }

    this.logger.debug('All wallet subscriptions removed', { walletId, count: subscriptionIds.length });
  }

  /**
   * Emit an event to all subscribers
   *
   * Dispatches an event to all matching subscribers in priority order.
   * Automatically adds timestamp if not provided. Handles async handlers
   * gracefully and isolates errors to prevent cascade failures.
   *
   * @param event - Event name from WalletEventMap
   * @param data - Event data matching the event type
   *
   * @example
   * ```typescript
   * // Emit connection established
   * eventSystem.emit('connection:established', {
   *   walletId: 'metamask',
   *   connection: walletConnection,
   *   timestamp: Date.now()
   * });
   *
   * // Emit error event
   * eventSystem.emit('error:wallet', {
   *   walletId: 'metamask',
   *   error: new Error('Connection failed'),
   *   timestamp: Date.now()
   * });
   *
   * // Emit chain switch
   * eventSystem.emit('chain:switched', {
   *   sessionId: 'abc123',
   *   walletId: 'metamask',
   *   fromChain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
   *   toChain: { chainId: '0x89', chainType: ChainType.Evm, name: 'Polygon', required: false },
   *   isNewChain: true,
   *   timestamp: Date.now()
   * });
   * ```
   *
   * @public
   */
  emit<K extends keyof WalletEventMap>(event: K, data: WalletEventMap[K]): void {
    // Add timestamp if not present
    const eventData = {
      ...data,
      timestamp: (data as { timestamp?: number }).timestamp || Date.now(),
    };

    // Add to history
    this.addToHistory(event, eventData);

    // Get subscriptions for this event
    const subscriptions = this.subscriptions.get(event) || [];

    if (this.config.debug) {
      this.logger.debug('Emitting event', {
        event,
        subscriberCount: subscriptions.length,
        data: eventData,
      });
    }

    // Process subscriptions
    for (const subscription of subscriptions) {
      try {
        // Check filters
        if (!this.shouldHandleEvent(subscription, eventData)) {
          continue;
        }

        // Transform data if needed
        const transformedData = subscription.options.transform
          ? subscription.options.transform(eventData)
          : eventData;

        // Call handler
        const result = subscription.handler(transformedData);

        // Handle async handlers
        if (result instanceof Promise) {
          result.catch((error) => {
            this.handleEventError(error, `Async handler for event ${event}`);
          });
        }

        // Update call count
        subscription.callCount++;

        // Remove one-time subscriptions
        if (subscription.options.once) {
          this.unsubscribe(subscription.id);
        }
      } catch (error) {
        this.handleEventError(error as Error, `Handler for event ${event}`);
      }
    }
  }

  /**
   * Get event history for a specific event type
   *
   * Retrieves historical events for debugging, analytics, or replay.
   * Useful for understanding event sequences and debugging issues.
   *
   * @param event - Event name (optional, returns all if not specified)
   * @param limit - Maximum number of events to return (most recent)
   * @returns Array of event history entries with timestamps and IDs
   *
   * @example
   * ```typescript
   * // Get all connection events
   * const connections = eventSystem.getEventHistory('connection:established');
   * console.log(`Total connections: ${connections.length}`);
   *
   * // Get last 5 errors for debugging
   * const recentErrors = eventSystem.getEventHistory('error:wallet', 5);
   * recentErrors.forEach(entry => {
   *   console.log(`[${entry.timestamp}] ${entry.data.error.message}`);
   * });
   *
   * // Get all events for analysis
   * const allEvents = eventSystem.getEventHistory();
   * const eventsByType = allEvents.reduce((acc, entry) => {
   *   acc[entry.event] = (acc[entry.event] || 0) + 1;
   *   return acc;
   * }, {});
   * ```
   *
   * @public
   */
  getEventHistory(event?: string, limit?: number): EventHistoryEntry[] {
    let history = event ? this.eventHistory.filter((entry) => entry.event === event) : this.eventHistory;

    if (limit) {
      history = history.slice(-limit);
    }

    return [...history]; // Return copy
  }

  /**
   * Clear event history
   *
   * @param event - Specific event to clear (optional, clears all if not specified)
   * @public
   */
  clearHistory(event?: string): void {
    if (event) {
      for (let i = this.eventHistory.length - 1; i >= 0; i--) {
        const historyEntry = this.eventHistory[i];
        if (historyEntry && historyEntry.event === event) {
          this.eventHistory.splice(i, 1);
        }
      }
    } else {
      this.eventHistory.length = 0;
    }

    this.logger.debug('Event history cleared', { event: event || 'all' });
  }

  /**
   * Replay events to new subscribers
   *
   * Replays historical events to restore state or catch up new components.
   * Particularly useful for components that mount after events have occurred.
   *
   * @param event - Event name to replay
   * @param handler - Handler to receive replayed events
   * @param options - Replay options (since timestamp, limit)
   *
   * @example
   * ```typescript
   * // Component mounting - replay recent connections
   * componentDidMount() {
   *   // Replay connections from last 5 minutes
   *   eventSystem.replayEvents('connection:established',
   *     (event) => this.handleConnection(event),
   *     { since: Date.now() - 300000 }
   *   );
   * }
   *
   * // Restore all wallet states on page reload
   * eventSystem.replayEvents('connection:established', (event) => {
   *   restoreWalletState(event.walletId, event.connection);
   * });
   *
   * // Get last 3 chain switches for UI
   * eventSystem.replayEvents('chain:switched',
   *   (event) => addToChainHistory(event),
   *   { limit: 3 }
   * );
   * ```
   *
   * @public
   */
  replayEvents<K extends keyof WalletEventMap>(
    event: K,
    handler: EventHandler<WalletEventMap[K]>,
    options: { since?: number; limit?: number } = {},
  ): void {
    if (!this.config.enableReplay) {
      this.logger.warn('Event replay is disabled');
      return;
    }

    let history = this.getEventHistory(event);

    // Filter by timestamp if specified
    if (options.since) {
      history = history.filter((entry) => entry.timestamp >= (options.since ?? 0));
    }

    // Apply limit if specified
    if (options.limit) {
      history = history.slice(-options.limit);
    }

    this.logger.debug('Replaying events', {
      event,
      eventCount: history.length,
      since: options.since,
      limit: options.limit,
    });

    // Replay events
    for (const entry of history) {
      try {
        handler(entry.data as Parameters<typeof handler>[0]);
      } catch (error) {
        this.handleEventError(error as Error, `Replay handler for event ${event}`);
      }
    }
  }

  /**
   * Get subscription statistics
   *
   * Provides insights into event system usage for monitoring and optimization.
   * Useful for debugging subscription leaks and understanding event flow.
   *
   * @returns Subscription statistics including counts and breakdown
   *
   * @example
   * ```typescript
   * const stats = eventSystem.getStats();
   * console.log(`Total subscriptions: ${stats.totalSubscriptions}`);
   * console.log(`Event types: ${stats.eventTypes}`);
   * console.log(`History size: ${stats.historySize}`);
   *
   * // Check for subscription leaks
   * if (stats.totalSubscriptions > 1000) {
   *   console.warn('High subscription count - check for leaks');
   * }
   *
   * // Monitor specific events
   * Object.entries(stats.subscriptionsByEvent).forEach(([event, count]) => {
   *   if (count > 10) {
   *     console.log(`${event}: ${count} subscribers`);
   *   }
   * });
   * ```
   *
   * @public
   */
  getStats(): {
    totalSubscriptions: number;
    eventTypes: number;
    walletSubscriptions: number;
    historySize: number;
    subscriptionsByEvent: Record<string, number>;
  } {
    const subscriptionsByEvent: Record<string, number> = {};
    let totalSubscriptions = 0;

    for (const [event, subscriptions] of this.subscriptions) {
      subscriptionsByEvent[event] = subscriptions.length;
      totalSubscriptions += subscriptions.length;
    }

    return {
      totalSubscriptions,
      eventTypes: this.subscriptions.size,
      walletSubscriptions: this.subscriptionsByWallet.size,
      historySize: this.eventHistory.length,
      subscriptionsByEvent,
    };
  }

  /**
   * Add global error handler
   *
   * @param handler - Error handler function
   * @returns Remove handler function
   * @public
   */
  onError(handler: (error: Error, context: string) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Clean up event system resources
   *
   * @public
   */
  destroy(): void {
    this.logger.debug('Destroying EventSystem');

    // Clear all subscriptions
    this.subscriptions.clear();
    this.subscriptionsByWallet.clear();

    // Clear history
    this.eventHistory.length = 0;

    // Clear error handlers
    this.errorHandlers.clear();

    this.logger.info('EventSystem destroyed');
  }

  // Private implementation methods

  private generateSubscriptionId(): string {
    return `sub_${++this.subscriptionIdCounter}_${Date.now()}`;
  }

  private generateEventId(): string {
    return `evt_${++this.eventIdCounter}_${Date.now()}`;
  }

  /**
   * Determine if a subscription should handle an event
   *
   * Applies subscription filters including wallet ID, chain ID, and custom filters.
   * This enables efficient event routing and reduces unnecessary handler calls.
   */
  private shouldHandleEvent(subscription: EventSubscription, eventData: unknown): boolean {
    // Check wallet filter
    if (subscription.options.walletId) {
      const walletId =
        (eventData as { walletId?: string; connection?: { walletId?: string } }).walletId ||
        (eventData as { connection?: { walletId?: string } }).connection?.walletId;
      if (walletId !== subscription.options.walletId) {
        return false;
      }
    }

    // Check chain filter
    if (subscription.options.chain) {
      const chain =
        (eventData as { chain?: SupportedChain; connection?: { chain?: SupportedChain } }).chain ||
        (eventData as { connection?: { chain?: SupportedChain } }).connection?.chain;
      if (chain && chain.chainId !== subscription.options.chain.chainId) {
        return false;
      }
    }

    // Check custom filter
    if (subscription.options.filter) {
      try {
        return subscription.options.filter(eventData);
      } catch (error) {
        this.handleEventError(error as Error, 'Event filter function');
        return false;
      }
    }

    return true;
  }

  private addToHistory(event: string, data: unknown): void {
    if (!this.config.enablePersistence) return;

    const entry: EventHistoryEntry = {
      event,
      data,
      timestamp: Date.now(),
      id: this.generateEventId(),
    };

    this.eventHistory.push(entry);

    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory.splice(0, this.eventHistory.length - this.config.maxHistorySize);
    }
  }

  private handleEventError(error: Error, context: string): void {
    this.logger.error('Event system error', { error, context });

    // Notify error handlers
    for (const handler of this.errorHandlers) {
      try {
        handler(error, context);
      } catch (handlerError) {
        this.logger.error('Error in error handler', handlerError);
      }
    }

    // Emit global error event
    this.emit('error:global', { error, context, timestamp: Date.now() });
  }
}
