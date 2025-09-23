import type { JSONRPCEventHandler, JSONRPCEventMap } from './types.js';

/**
 * Represents an event handler entry with optional pattern matching support.
 * Used internally by EventManager to store handlers and their associated patterns.
 *
 * @typeParam T - The event map type containing all possible events
 * @typeParam K - The specific event key being handled
 */
interface EventHandlerEntry<T extends JSONRPCEventMap, K extends keyof T> {
  /** The function that handles the event */
  handler: JSONRPCEventHandler<T, K>;
  /** Optional RegExp pattern for wildcard matching */
  pattern?: RegExp | undefined;
}

/**
 * Manages event subscriptions and dispatching with pattern matching support.
 * Supports both exact event names and wildcard patterns for flexible event handling.
 *
 * @typeParam T - The event map defining all possible events and their payload types
 *
 * @example
 * ```typescript
 * // Define event types
 * type EventMap = {
 *   'user:joined': { username: string };
 *   'user:left': { username: string };
 *   'chat:message': { from: string; text: string };
 *   'system:error': { code: number; message: string };
 * };
 *
 * // Create event manager
 * const events = new EventManager<EventMap>();
 *
 * // Register handlers with exact matches
 * events.on('user:joined', ({ username }) => {
 *   console.log(`${username} joined`);
 * });
 *
 * // Register handlers with wildcards
 * events.on('user:*', (params) => {
 *   // Handles both user:joined and user:left
 *   console.log('User event:', params);
 * });
 *
 * events.on('*:error', ({ code, message }) => {
 *   // Handles any error events
 *   console.error(`Error ${code}: ${message}`);
 * });
 * ```
 */
export class EventManager<T extends JSONRPCEventMap = JSONRPCEventMap> {
  private handlers = new Map<string, Set<EventHandlerEntry<T, keyof T>>>();

  /**
   * Registers an event handler with optional pattern matching
   * @param eventPattern Event name or pattern (supports * wildcards)
   * @param handler Function to handle the event
   * @returns Cleanup function to remove the handler
   *
   * @example
   * ```typescript
   * // Exact match
   * events.on('userJoined', handler);
   *
   * // Pattern match
   * events.on('user.*', handler);     // All user events
   * events.on('*.error', handler);    // All error events
   * events.on('eth_*', handler);      // All eth_ methods
   * ```
   */
  public on<K extends keyof T>(eventPattern: K | string, handler: JSONRPCEventHandler<T, K>): () => void {
    const key = String(eventPattern);
    const entry: EventHandlerEntry<T, K> = {
      handler: handler as JSONRPCEventHandler<T, keyof T>,
      pattern: key.includes('*') ? this.createPattern(key) : undefined,
    };

    const handlers = this.handlers.get(key) || new Set();
    this.handlers.set(key, handlers);
    handlers.add(entry as EventHandlerEntry<T, keyof T>);

    return () => {
      const existingHandlers = this.handlers.get(key);
      if (existingHandlers) {
        existingHandlers.delete(entry as EventHandlerEntry<T, keyof T>);
        if (existingHandlers.size === 0) {
          this.handlers.delete(key);
        }
      }
    };
  }

  /**
   * Handles an event by calling all matching handlers, including pattern-matched handlers.
   * If a handler throws an error, it is caught and logged without affecting other handlers.
   *
   * @param event - The name of the event to handle
   * @param params - The event parameters/payload
   *
   * @example
   * ```typescript
   * // Inside your transport layer
   * ws.on('message', data => {
   *   const event = JSON.parse(data);
   *   events.handleEvent('user:joined', {
   *     username: event.username
   *   });
   * });
   * ```
   */
  public handleEvent<K extends keyof T>(event: K, params: T[K]): void {
    const eventStr = String(event);

    // Find all handlers that match this event
    for (const [pattern, handlers] of this.handlers) {
      for (const entry of handlers) {
        if (this.matchesEvent(eventStr, pattern, entry.pattern)) {
          try {
            entry.handler(params);
          } catch (error) {
            console.error('Error in event handler:', error);
          }
        }
      }
    }
  }

  /**
   * Removes all registered event handlers.
   * Use this for cleanup when shutting down or resetting the event system.
   *
   * @example
   * ```typescript
   * // Clean up during shutdown
   * events.removeAllHandlers();
   * ws.close();
   * ```
   */
  public removeAllHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Gets all handlers registered for a specific event.
   * Does not include pattern-matched handlers.
   *
   * @param event - The name of the event to get handlers for
   * @returns A Set of handlers if any exist, undefined otherwise
   *
   * @example
   * ```typescript
   * // Check existing handlers
   * const handlers = events.getHandlers('user:joined');
   * if (handlers) {
   *   console.log(`Found ${handlers.size} handlers`);
   * }
   * ```
   */
  public getHandlers<K extends keyof T>(event: K): Set<JSONRPCEventHandler<T, K>> | undefined {
    const handlers = this.handlers.get(String(event));
    if (!handlers) return undefined;

    const result = new Set<JSONRPCEventHandler<T, K>>();
    for (const entry of handlers) {
      result.add(entry.handler as JSONRPCEventHandler<T, K>);
    }
    return result;
  }

  /**
   * Checks if there are any handlers registered for a specific event.
   * Only checks for exact matches, not pattern-matched handlers.
   *
   * @param event - The name of the event to check
   * @returns True if handlers exist for the event, false otherwise
   *
   * @example
   * ```typescript
   * // Check before emitting expensive events
   * if (events.hasHandlers('analytics:data')) {
   *   // Only gather analytics if someone is listening
   *   const data = gatherAnalytics();
   *   events.handleEvent('analytics:data', data);
   * }
   * ```
   */
  public hasHandlers(event: keyof T): boolean {
    const handlers = this.handlers.get(String(event));
    return handlers !== undefined && handlers.size > 0;
  }

  /**
   * Creates a RegExp pattern from a wildcard string.
   * Converts glob-style patterns (with *) to regular expressions.
   *
   * @param pattern - The wildcard pattern to convert
   * @returns A RegExp that matches the pattern
   *
   * @example
   * Internal examples:
   * - "user:*" becomes /^user:.*$/
   * - "*.error" becomes /^.*\.error$/
   * - "eth_*" becomes /^eth_.*$/
   */
  private createPattern(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regex = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`);
  }

  /**
   * Checks if an event name matches a pattern string or RegExp.
   * Used internally to determine which handlers should receive an event.
   *
   * @param event - The event name to check
   * @param patternStr - The original pattern string
   * @param pattern - Optional compiled RegExp for the pattern
   * @returns True if the event matches the pattern
   */
  private matchesEvent(event: string, patternStr: string, pattern?: RegExp): boolean {
    if (!pattern) {
      return event === patternStr;
    }
    return pattern.test(event);
  }
}
