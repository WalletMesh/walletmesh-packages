/**
 * Aztec events hook for contract event subscriptions
 *
 * Provides a React hook for subscribing to and querying Aztec contract events,
 * with support for both real-time subscriptions and historical queries.
 *
 * @module hooks/useAztecEvents
 */

import type { ContractArtifact } from '@aztec/aztec.js';
import { ErrorFactory } from '@walletmesh/modal-core';
import {
  type EventQueryOptions,
  queryPrivateEvents as queryPrivateUtil,
  queryEvents as queryUtil,
  subscribeToEvents as subscribeUtil,
} from '@walletmesh/modal-core/providers/aztec/lazy';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

// Re-export EventQueryOptions type
export type { EventQueryOptions };

/**
 * Event subscription hook return type
 *
 * @public
 */
export interface UseAztecEventsReturn {
  /** Array of events received (real-time + historical) */
  events: unknown[];
  /** Whether currently listening for events */
  isListening: boolean;
  /** Whether loading historical events */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Start listening for events */
  subscribe: () => void;
  /** Stop listening for events */
  unsubscribe: () => void;
  /** Query historical events */
  queryHistorical: (options?: EventQueryOptions) => Promise<unknown[]>;
  /** Query private events */
  queryPrivate: (recipients: unknown[], options?: EventQueryOptions) => Promise<unknown[]>;
  /** Clear all events from state */
  clearEvents: () => void;
}

/**
 * Hook for subscribing to Aztec contract events
 *
 * This hook provides real-time event subscriptions and historical event
 * queries for Aztec contracts. It automatically manages subscriptions
 * and cleans up when the component unmounts.
 *
 * @param contractAddress - The contract address to watch (optional)
 * @param artifact - The contract artifact containing event definitions (optional)
 * @param eventName - Name of the event to subscribe to (optional)
 * @param autoSubscribe - Whether to automatically start subscription (default: true)
 * @returns Event subscription functions and state
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook provides:
 * - Real-time event subscriptions with automatic polling
 * - Historical event queries with block range filtering
 * - Private event queries for encrypted events
 * - Automatic cleanup on unmount
 * - Loading and error state management
 *
 * Events are accumulated in the events array, with new events
 * appended as they arrive. Use clearEvents() to reset.
 *
 * @example
 * ```tsx
 * import { useAztecEvents } from '@walletmesh/modal-react';
 * import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
 *
 * function TokenEvents({ tokenAddress }) {
 *   const {
 *     events,
 *     isListening,
 *     subscribe,
 *     unsubscribe,
 *     queryHistorical
 *   } = useAztecEvents(
 *     tokenAddress,
 *     TokenContractArtifact,
 *     'Transfer'
 *   );
 *
 *   // Query last 100 blocks on mount
 *   useEffect(() => {
 *     queryHistorical({ fromBlock: -100 });
 *   }, []);
 *
 *   return (
 *     <div>
 *       <button onClick={isListening ? unsubscribe : subscribe}>
 *         {isListening ? 'Stop Listening' : 'Start Listening'}
 *       </button>
 *
 *       <h3>Transfer Events ({events.length})</h3>
 *       {events.map((event, i) => (
 *         <div key={i}>
 *           From: {event.from} To: {event.to} Amount: {event.amount}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Private events with manual subscription
 * function PrivateEvents({ contractAddress, artifact }) {
 *   const { aztecWallet } = useAztecWallet();
 *   const {
 *     events,
 *     queryPrivate,
 *     isLoading
 *   } = useAztecEvents(
 *     contractAddress,
 *     artifact,
 *     'PrivateTransfer',
 *     false // Don't auto-subscribe
 *   );
 *
 *   const loadMyEvents = async () => {
 *     const myAddress = wallet.getAddress();
 *     const privateEvents = await queryPrivate([myAddress]);
 *     console.log('My private events:', privateEvents);
 *   };
 *
 *   return (
 *     <button onClick={loadMyEvents} disabled={isLoading}>
 *       Load My Private Events
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecEvents(
  contractAddress?: unknown | null,
  artifact?: ContractArtifact | null,
  eventName?: string | null,
  autoSubscribe = true,
): UseAztecEventsReturn {
  const { aztecWallet, isAvailable } = useAztecWallet();
  const [events, setEvents] = useState<unknown[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to events
  const subscribe = useCallback(async () => {
    if (!aztecWallet || !contractAddress || !artifact || !eventName || !isAvailable) {
      setError(new Error('Missing required parameters for event subscription'));
      return;
    }

    if (isListening) {
      return; // Already subscribed
    }

    setError(null);
    setIsListening(true);

    try {
      const unsubscribeFn = await subscribeUtil(
        aztecWallet,
        contractAddress,
        artifact,
        eventName,
        (event) => {
          // Append new event to the list
          setEvents((prev) => [...prev, event]);
        },
      );

      unsubscribeRef.current = unsubscribeFn;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to subscribe to events');
      setError(errorMessage);
      setIsListening(false);
      console.error('Failed to subscribe to events:', err);
    }
  }, [aztecWallet, contractAddress, artifact, eventName, isAvailable, isListening]);

  // Unsubscribe from events
  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Query historical events
  const queryHistorical = useCallback(
    async (options?: EventQueryOptions) => {
      if (!aztecWallet || !contractAddress || !artifact || !eventName) {
        throw ErrorFactory.invalidParams('Missing required parameters for event query');
      }

      setIsLoading(true);
      setError(null);

      try {
        const historicalEvents = await queryUtil(aztecWallet, contractAddress, artifact, eventName, options);

        // Add to events list
        setEvents((prev) => [...prev, ...historicalEvents]);

        return historicalEvents;
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to query events');
        setError(errorMessage);
        throw errorMessage;
      } finally {
        setIsLoading(false);
      }
    },
    [aztecWallet, contractAddress, artifact, eventName],
  );

  // Query private events
  const queryPrivate = useCallback(
    async (recipients: unknown[], options?: EventQueryOptions) => {
      if (!aztecWallet || !contractAddress || !artifact || !eventName) {
        throw ErrorFactory.invalidParams('Missing required parameters for private event query');
      }

      setIsLoading(true);
      setError(null);

      try {
        const privateEvents = await queryPrivateUtil(
          aztecWallet,
          contractAddress,
          artifact,
          eventName,
          recipients,
          options,
        );

        // Add to events list
        setEvents((prev) => [...prev, ...privateEvents]);

        return privateEvents;
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to query private events');
        setError(errorMessage);
        throw errorMessage;
      } finally {
        setIsLoading(false);
      }
    },
    [aztecWallet, contractAddress, artifact, eventName],
  );

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto-subscribe on mount if requested
  useEffect(() => {
    if (autoSubscribe && aztecWallet && contractAddress && artifact && eventName && isAvailable) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [autoSubscribe, aztecWallet, contractAddress, artifact, eventName, isAvailable, subscribe, unsubscribe]);

  return {
    events,
    isListening,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    queryHistorical,
    queryPrivate,
    clearEvents,
  };
}
