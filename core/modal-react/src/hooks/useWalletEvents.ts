/**
 * Wallet event subscription hook for WalletMesh
 *
 * A single, flexible API for all event subscription needs. Replaces multiple
 * specialized event hooks with one comprehensive solution.
 *
 * @module hooks/useWalletEvents
 */

import type { ModalEventMap, SessionState } from '@walletmesh/modal-core';
import { useStore as useModalCoreStore } from '@walletmesh/modal-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { createComponentLogger } from '../utils/logger.js';

/**
 * Event handler type
 */
export type WalletEventHandler<T = unknown> = (payload: T) => void;

/**
 * Event subscription options
 */
export interface EventOptions {
  /** Fire handler only once then auto-unsubscribe */
  once?: boolean;
  /** Dependency array for the effect */
  deps?: React.DependencyList;
}

/**
 * Event subscription configuration
 */
export type EventConfig<K extends keyof ModalEventMap = keyof ModalEventMap> =
  | K // Single event name
  | [K, WalletEventHandler<ModalEventMap[K]>] // Event name with handler
  | [K, WalletEventHandler<ModalEventMap[K]>, EventOptions]; // Event with handler and options

/**
 * Event handlers map
 */
export type EventHandlers = {
  [K in keyof ModalEventMap]?: WalletEventHandler<ModalEventMap[K]>;
};

/**
 * Event hook return type
 */
export interface UseWalletEventsReturn {
  /** Subscribe to a new event at runtime */
  on: <K extends keyof ModalEventMap>(
    event: K,
    handler: WalletEventHandler<ModalEventMap[K]>,
    options?: EventOptions,
  ) => () => void;
  /** Unsubscribe from an event */
  off: <K extends keyof ModalEventMap>(event: K, handler?: WalletEventHandler<ModalEventMap[K]>) => void;
  /** Subscribe to an event once */
  once: <K extends keyof ModalEventMap>(
    event: K,
    handler: WalletEventHandler<ModalEventMap[K]>,
  ) => () => void;
  /** Pause all event subscriptions */
  pause: () => void;
  /** Resume all event subscriptions */
  resume: () => void;
  /** Whether subscriptions are currently paused */
  isPaused: boolean;
  /** Currently active event subscriptions */
  activeEvents: string[];
}

/**
 * Internal subscription management
 */
interface Subscription {
  event: keyof ModalEventMap;
  // biome-ignore lint/suspicious/noExplicitAny: Event handlers need to handle various event types
  handler: WalletEventHandler<any>;
  unsubscribe: () => void;
  options?: EventOptions;
}

/**
 * Maps event names to state subscriptions (internal helper)
 */
function subscribeToEvent<K extends keyof ModalEventMap>(
  event: K,
  handler: (data: ModalEventMap[K]) => void,
): () => void {
  // Direct store subscription based on event type
  const store = useModalCoreStore;

  switch (event) {
    case 'connection:established':
    case 'connection:failed':
    case 'connection:lost': {
      let previousSession: SessionState | null = null;
      return store.subscribe((state) => {
        const activeSessionId = state.active?.sessionId;
        const activeSession = activeSessionId ? state.entities?.sessions?.[activeSessionId] : null;

        if (!previousSession && activeSession && event === 'connection:established') {
          const wallet = activeSession.walletId ? state.entities?.wallets?.[activeSession.walletId] : null;
          handler({ wallet } as unknown as ModalEventMap[K]);
        } else if (previousSession && !activeSession) {
          if (event === 'connection:failed') {
            handler({
              error: { code: 'CONNECTION_FAILED', message: 'Connection failed' },
            } as unknown as ModalEventMap[K]);
          } else if (event === 'connection:lost') {
            handler({ reason: 'Connection lost' } as unknown as ModalEventMap[K]);
          }
        }

        previousSession = activeSession || null;
      });
    }

    case 'wallet:selected': {
      let previousWalletId: string | null = null;
      return store.subscribe((state) => {
        const activeSessionId = state.active?.sessionId;
        const activeSession = activeSessionId ? state.entities?.sessions?.[activeSessionId] : null;
        const currentWalletId = activeSession?.walletId || null;

        if (currentWalletId && currentWalletId !== previousWalletId) {
          const wallet = state.entities?.wallets?.[currentWalletId];
          if (wallet) {
            handler({ wallet } as unknown as ModalEventMap[K]);
          }
        }

        previousWalletId = currentWalletId;
      });
    }

    case 'view:changed': {
      let previousView: string | null = null;
      return store.subscribe((state) => {
        const currentView = state.ui.currentView;
        if (currentView !== previousView && previousView !== null) {
          handler({ view: currentView, previousView: previousView || currentView } as ModalEventMap[K]);
        }
        previousView = currentView;
      });
    }

    default:
      // For unmapped events, return a no-op unsubscribe
      return () => {};
  }
}

/**
 * Wallet event subscription hook
 *
 * A single, flexible API for subscribing to wallet events. Supports:
 * - Single event subscriptions
 * - Multiple event subscriptions
 * - One-time event subscriptions
 * - Runtime subscription management
 * - Pause/resume functionality
 * - Full TypeScript support
 *
 * @returns Event management functions and state
 *
 * @example
 * ```tsx
 * // Single event
 * useWalletEvents('connection:established', (data) => {
 *   console.log('Connected:', data);
 * });
 *
 * // Multiple events with object syntax
 * const { pause, resume } = useWalletEvents({
 *   'connection:established': (data) => console.log('Connected:', data),
 *   'connection:lost': (data) => console.log('Disconnected:', data),
 *   'accounts:changed': (data) => console.log('Accounts changed:', data),
 * });
 *
 * // Array syntax with options
 * const { on, off } = useWalletEvents([
 *   ['connection:established', handleConnect],
 *   ['connection:lost', handleDisconnect, { once: true }],
 * ]);
 *
 * // Runtime subscription
 * const { on, off } = useWalletEvents();
 *
 * const unsubscribe = on('chain:switched', (data) => {
 *   console.log('Chain switched to:', data.chainId);
 * });
 *
 * // Later...
 * unsubscribe();
 * // or
 * off('chain:switched');
 * ```
 *
 * @public
 */
export function useWalletEvents(): UseWalletEventsReturn;
export function useWalletEvents<K extends keyof ModalEventMap>(
  event: K,
  handler: WalletEventHandler<ModalEventMap[K]>,
  options?: EventOptions,
): UseWalletEventsReturn;
export function useWalletEvents(handlers: EventHandlers, options?: EventOptions): UseWalletEventsReturn;
export function useWalletEvents(events: EventConfig[], options?: EventOptions): UseWalletEventsReturn;
export function useWalletEvents(
  config?: EventConfig | EventConfig[] | EventHandlers | keyof ModalEventMap,
  // biome-ignore lint/suspicious/noExplicitAny: Overloaded function needs flexible parameter type
  handlerOrOptions?: WalletEventHandler<any> | EventOptions,
  options?: EventOptions,
): UseWalletEventsReturn {
  const logger = useMemo(() => createComponentLogger('useWalletEvents'), []);
  const { client } = useWalletMeshContext();
  const [isPaused, setIsPaused] = useState(false);
  const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());
  const [activeEvents, setActiveEvents] = useState<string[]>([]);

  // Normalize configuration
  const normalizedConfig = useMemo(() => {
    if (!config) return [];

    // Single event with handler
    if (typeof config === 'string' && typeof handlerOrOptions === 'function') {
      return [[config, handlerOrOptions, options] as EventConfig];
    }

    // Event handlers object
    if (!Array.isArray(config) && typeof config === 'object') {
      const configs: EventConfig[] = [];
      for (const [event, handler] of Object.entries(config)) {
        if (handler) {
          configs.push([
            event as keyof ModalEventMap,
            // biome-ignore lint/suspicious/noExplicitAny: Handler type is determined at runtime
            handler as WalletEventHandler<any>,
            handlerOrOptions as EventOptions,
          ]);
        }
      }
      return configs;
    }

    // Array of event configs
    if (Array.isArray(config)) {
      return config.map((item): EventConfig => {
        if (Array.isArray(item)) {
          return item as EventConfig;
        }
        // Should not reach here based on type definitions
        return [item as keyof ModalEventMap, () => {}, undefined] as unknown as EventConfig;
      });
    }

    return [];
  }, [config, handlerOrOptions, options]);

  // Subscribe to initial events
  useEffect(() => {
    if (!client) {
      // Client is created asynchronously, so it may not be available immediately
      // This is normal during initial render and not an error condition
      return;
    }

    const newSubscriptions = new Map<string, Subscription>();

    for (const eventConfig of normalizedConfig) {
      let event: keyof ModalEventMap;
      // biome-ignore lint/suspicious/noExplicitAny: Handler type is determined by event type
      let handler: WalletEventHandler<any> | undefined;
      let eventOptions: EventOptions | undefined;

      if (typeof eventConfig === 'string') {
        event = eventConfig;
      } else if (Array.isArray(eventConfig)) {
        [event, handler, eventOptions] = eventConfig;
      } else {
        continue;
      }

      if (!handler) continue;

      const subscriptionKey = `${event}_${Date.now()}_${Math.random()}`;
      let fired = false;

      // biome-ignore lint/suspicious/noExplicitAny: Event data type matches handler expectation
      const wrappedHandler = (data: any) => {
        if (isPaused) return;

        if (eventOptions?.once) {
          if (!fired) {
            fired = true;
            handler(data);
            // Auto-unsubscribe
            const sub = newSubscriptions.get(subscriptionKey);
            if (sub) {
              sub.unsubscribe();
              newSubscriptions.delete(subscriptionKey);
              setActiveEvents(Array.from(newSubscriptions.values()).map((s) => s.event));
            }
          }
        } else {
          handler(data);
        }
      };

      try {
        const unsubscribe = subscribeToEvent(event, wrappedHandler);
        newSubscriptions.set(subscriptionKey, {
          event,
          handler,
          unsubscribe,
          ...(eventOptions && { options: eventOptions }),
        });
      } catch (error) {
        logger.error(`Failed to subscribe to event "${event}":`, error);
      }
    }

    subscriptionsRef.current = newSubscriptions;
    setActiveEvents(Array.from(newSubscriptions.values()).map((s) => s.event));

    // Cleanup
    return () => {
      for (const sub of newSubscriptions.values()) {
        try {
          sub.unsubscribe();
        } catch (error) {
          logger.error('Failed to unsubscribe:', error);
        }
      }
    };
  }, [client, normalizedConfig, isPaused, logger]);

  // Control functions
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const on = useCallback(
    <K extends keyof ModalEventMap>(
      event: K,
      handler: WalletEventHandler<ModalEventMap[K]>,
      eventOptions?: EventOptions,
    ): (() => void) => {
      if (!client) {
        // Client is created asynchronously, return no-op until available
        return () => {};
      }

      const subscriptionKey = `${event}_${Date.now()}_${Math.random()}`;
      let fired = false;

      const wrappedHandler = (data: ModalEventMap[K]) => {
        if (isPaused) return;

        if (eventOptions?.once) {
          if (!fired) {
            fired = true;
            handler(data);
            // Auto-unsubscribe
            const sub = subscriptionsRef.current.get(subscriptionKey);
            if (sub) {
              sub.unsubscribe();
              subscriptionsRef.current.delete(subscriptionKey);
              setActiveEvents(Array.from(subscriptionsRef.current.values()).map((s) => s.event));
            }
          }
        } else {
          handler(data);
        }
      };

      try {
        const unsubscribe = subscribeToEvent(event, wrappedHandler);
        subscriptionsRef.current.set(subscriptionKey, {
          event,
          handler,
          unsubscribe,
          ...(eventOptions && { options: eventOptions }),
        });
        setActiveEvents(Array.from(subscriptionsRef.current.values()).map((s) => s.event));

        return () => {
          const sub = subscriptionsRef.current.get(subscriptionKey);
          if (sub) {
            sub.unsubscribe();
            subscriptionsRef.current.delete(subscriptionKey);
            setActiveEvents(Array.from(subscriptionsRef.current.values()).map((s) => s.event));
          }
        };
      } catch (error) {
        logger.error(`Failed to create runtime subscription for "${event}":`, error);
        return () => {};
      }
    },
    [client, isPaused, logger],
  );

  const once = useCallback(
    <K extends keyof ModalEventMap>(
      event: K,
      handler: WalletEventHandler<ModalEventMap[K]>,
    ): (() => void) => {
      return on(event, handler, { once: true });
    },
    [on],
  );

  const off = useCallback(
    <K extends keyof ModalEventMap>(event: K, handler?: WalletEventHandler<ModalEventMap[K]>) => {
      const toRemove: string[] = [];

      for (const [key, sub] of subscriptionsRef.current.entries()) {
        if (sub.event === event && (!handler || sub.handler === handler)) {
          toRemove.push(key);
        }
      }

      for (const key of toRemove) {
        const sub = subscriptionsRef.current.get(key);
        if (sub) {
          try {
            sub.unsubscribe();
            subscriptionsRef.current.delete(key);
          } catch (error) {
            logger.error(`Failed to unsubscribe from "${event}":`, error);
          }
        }
      }

      setActiveEvents(Array.from(subscriptionsRef.current.values()).map((s) => s.event));
    },
    [logger],
  );

  return {
    on,
    off,
    once,
    pause,
    resume,
    isPaused,
    activeEvents,
  };
}

// Re-export event types from modal-core
export type {
  ModalEventMap,
  StateUpdatedEvent,
  ChainSwitchedEvent,
  ConnectionEstablishedEvent,
  ConnectionFailedEvent,
  ConnectionLostEvent,
  ProviderStatusChangedEvent,
  WalletDiscoveredEvent,
  ConnectionRestoredEvent,
} from '@walletmesh/modal-core';
