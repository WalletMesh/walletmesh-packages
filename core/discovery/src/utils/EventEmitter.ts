import { defaultLogger } from '../core/logger.js';

/**
 * Browser-compatible EventEmitter implementation.
 *
 * Provides a subset of Node.js EventEmitter functionality for browser environments
 * with built-in memory leak detection and error handling. Used as the base class
 * for protocol state machines and other event-driven components in the discovery package.
 *
 * ## Features
 * - **Browser-compatible**: Works in all modern browsers without Node.js dependencies
 * - **Memory leak detection**: Automatic warnings when listener count exceeds limits
 * - **Error isolation**: Listener errors don't affect other listeners
 * - **Duplicate prevention**: Automatically prevents duplicate listener registration
 * - **Flexible event types**: Supports both string and symbol event names
 * - **Node.js API compatibility**: Familiar API for Node.js developers
 *
 * ## Common Usage Patterns
 * State machines, protocol handlers, and other event-driven components extend
 * this class to provide structured event communication.
 *
 * @example Basic event handling
 * ```typescript
 * const emitter = new EventEmitter();
 *
 * // Add listener
 * emitter.on('data', (payload) => {
 *   console.log('Received:', payload);
 * });
 *
 * // Emit event
 * emitter.emit('data', { message: 'Hello' });
 * ```
 *
 * @example One-time listeners
 * ```typescript
 * emitter.once('connect', () => {
 *   console.log('Connected - this will only fire once');
 * });
 *
 * emitter.emit('connect'); // Logs message
 * emitter.emit('connect'); // No output - listener was removed
 * ```
 *
 * @example Memory leak detection
 * ```typescript
 * emitter.setMaxListeners(5);
 *
 * // Add many listeners...
 * for (let i = 0; i < 10; i++) {
 *   emitter.on('event', () => {});
 * }
 * // Warning logged when exceeding 5 listeners
 *
 * const leakCheck = emitter.checkMemoryLeaks();
 * if (leakCheck.hasLeaks) {
 *   console.log('Potential memory leaks detected');
 * }
 * ```
 *
 * @category Utils
 * @since 0.2.0
 * @see {@link ProtocolStateMachine} for usage in state machines
 */
export class EventEmitter {
  private events: Map<string | symbol, Array<(...args: unknown[]) => void>> = new Map();
  private maxListeners = 10;

  /**
   * Add a listener for the specified event.
   *
   * Registers a function to be called whenever the specified event is emitted.
   * Automatically prevents duplicate listeners and provides memory leak warnings
   * when the listener count exceeds the configured maximum.
   *
   * @param event - The event name to listen for (string or symbol)
   * @param listener - The function to call when the event is emitted
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * emitter.on('stateChange', (newState) => {
   *   console.log('State changed to:', newState);
   * });
   *
   * // Method chaining
   * emitter
   *   .on('connect', handleConnect)
   *   .on('disconnect', handleDisconnect);
   * ```
   *
   * @see {@link once} for one-time listeners
   * @see {@link removeListener} to remove listeners
   */
  on(event: string | symbol, listener: (...args: unknown[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    if (!listeners) {
      return this;
    }

    // Prevent duplicate listeners
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener);
    }

    // Warn if listener count exceeds maxListeners
    if (listeners.length > this.maxListeners && this.maxListeners !== 0) {
      defaultLogger.warn(
        `Possible EventEmitter memory leak detected. ${listeners.length} ${String(event)} listeners added. Use emitter.setMaxListeners() to increase limit`,
      );
    }

    return this;
  }

  /**
   * Add a one-time listener for the specified event.
   *
   * Registers a function to be called only the first time the specified event
   * is emitted. The listener is automatically removed after being called once.
   *
   * @param event - The event name to listen for (string or symbol)
   * @param listener - The function to call when the event is emitted
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * emitter.once('ready', () => {
   *   console.log('System is ready');
   * });
   *
   * emitter.emit('ready'); // Logs message
   * emitter.emit('ready'); // No output - listener was removed
   * ```
   *
   * @see {@link on} for persistent listeners
   */
  once(event: string | symbol, listener: (...args: unknown[]) => void): this {
    const onceWrapper = (...args: unknown[]) => {
      this.removeListener(event, onceWrapper);
      listener(...args);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Remove a listener from the specified event.
   *
   * Removes the first occurrence of the specified listener from the event.
   * If the listener was added multiple times, only one instance is removed.
   * Automatically cleans up the event entry if no listeners remain.
   *
   * @param event - The event name to remove the listener from
   * @param listener - The exact function reference to remove
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * const handler = (data) => console.log(data);
   * emitter.on('data', handler);
   *
   * // Remove the specific listener
   * emitter.removeListener('data', handler);
   * ```
   *
   * @see {@link off} for alias
   * @see {@link removeAllListeners} to remove all listeners
   */
  removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
    if (!this.events.has(event)) {
      return this;
    }

    const listeners = this.events.get(event);
    if (!listeners) {
      return this;
    }
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * Alias for removeListener.
   *
   * Convenience method that provides the same functionality as removeListener
   * with a shorter name, following Node.js EventEmitter convention.
   *
   * @param event - The event name to remove the listener from
   * @param listener - The exact function reference to remove
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * const handler = () => {};
   * emitter.on('event', handler);
   * emitter.off('event', handler); // Same as removeListener
   * ```
   *
   * @see {@link removeListener} for full documentation
   */
  off(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return this.removeListener(event, listener);
  }

  /**
   * Remove all listeners for the specified event, or all events if no event is specified.
   *
   * Efficiently removes all listeners for a specific event or clears all listeners
   * for all events. Useful for cleanup operations and preventing memory leaks.
   *
   * @param event - Optional event name. If not provided, removes all listeners for all events
   * @returns This EventEmitter instance for method chaining
   *
   * @example Remove all listeners for specific event
   * ```typescript
   * emitter.removeAllListeners('data');
   * ```
   *
   * @example Remove all listeners for all events
   * ```typescript
   * emitter.removeAllListeners(); // Clears everything
   * ```
   *
   * @see {@link removeListener} to remove specific listeners
   */
  removeAllListeners(event?: string | symbol): this {
    if (event === undefined) {
      this.events.clear();
    } else {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * Emit an event with the specified arguments.
   *
   * Synchronously calls all listeners registered for the specified event,
   * passing the provided arguments to each listener. Errors in individual
   * listeners are caught and logged but don't affect other listeners.
   *
   * @param event - The event name to emit
   * @param args - Arguments to pass to the listeners
   * @returns `true` if there were listeners for the event, `false` otherwise
   *
   * @example
   * ```typescript
   * // Emit with no arguments
   * const hasListeners = emitter.emit('ready');
   *
   * // Emit with arguments
   * emitter.emit('data', { id: 1, message: 'Hello' });
   *
   * // Emit with multiple arguments
   * emitter.emit('error', error, context, timestamp);
   * ```
   *
   * @example Error handling
   * ```typescript
   * emitter.on('test', () => {
   *   throw new Error('Listener error');
   * });
   *
   * emitter.emit('test'); // Error is logged but doesn't throw
   * ```
   */
  emit(event: string | symbol, ...args: unknown[]): boolean {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event);
    if (!listeners) {
      return false;
    }
    const listenersCopy = [...listeners];
    for (const listener of listenersCopy) {
      try {
        listener(...args);
      } catch (error) {
        defaultLogger.error('Error in event listener:', error);
      }
    }

    return true;
  }

  /**
   * Get the listener count for the specified event.
   *
   * Returns the number of listeners currently registered for the specified event.
   * Useful for debugging and monitoring event usage patterns.
   *
   * @param event - The event name to count listeners for
   * @returns The number of listeners for the event (0 if none)
   *
   * @example
   * ```typescript
   * emitter.on('data', handler1);
   * emitter.on('data', handler2);
   *
   * console.log(emitter.listenerCount('data')); // 2
   * console.log(emitter.listenerCount('unknown')); // 0
   * ```
   *
   * @see {@link listeners} to get the actual listener functions
   */
  listenerCount(event: string | symbol): number {
    return this.events.get(event)?.length ?? 0;
  }

  /**
   * Get all listeners for the specified event.
   *
   * Returns a copy of the array of listeners for the specified event.
   * The returned array is a defensive copy and can be safely modified
   * without affecting the original listeners.
   *
   * @param event - The event name to get listeners for
   * @returns Array of listener functions (empty array if none)
   *
   * @example
   * ```typescript
   * const handler1 = () => console.log('Handler 1');
   * const handler2 = () => console.log('Handler 2');
   *
   * emitter.on('test', handler1);
   * emitter.on('test', handler2);
   *
   * const listeners = emitter.listeners('test');
   * console.log(listeners.length); // 2
   * ```
   *
   * @see {@link listenerCount} to just get the count
   */
  listeners(event: string | symbol): Array<(...args: unknown[]) => void> {
    return [...(this.events.get(event) ?? [])];
  }

  /**
   * Get all event names.
   *
   * Returns an array containing all event names (strings and symbols) that
   * currently have listeners attached. Useful for introspection and debugging.
   *
   * @returns Array of event names that have listeners
   *
   * @example
   * ```typescript
   * emitter.on('connect', () => {});
   * emitter.on('disconnect', () => {});
   * emitter.on(Symbol('secret'), () => {});
   *
   * const events = emitter.eventNames();
   * console.log(events); // ['connect', 'disconnect', Symbol(secret)]
   * ```
   */
  eventNames(): Array<string | symbol> {
    return [...this.events.keys()];
  }

  /**
   * Set the maximum number of listeners.
   *
   * Configures the maximum number of listeners that can be added to any single
   * event before a memory leak warning is issued. Set to 0 to disable warnings.
   *
   * @param n - Maximum number of listeners (0 to disable warnings)
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * // Set higher limit for events that legitimately need many listeners
   * emitter.setMaxListeners(50);
   *
   * // Disable memory leak warnings
   * emitter.setMaxListeners(0);
   * ```
   *
   * @see {@link getMaxListeners} to get current limit
   * @see {@link checkMemoryLeaks} for leak detection
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * Get the maximum number of listeners.
   *
   * Returns the current maximum listener limit configured for this emitter.
   * This is the threshold above which memory leak warnings are issued.
   *
   * @returns Current maximum listener limit (0 means warnings disabled)
   *
   * @example
   * ```typescript
   * console.log(emitter.getMaxListeners()); // 10 (default)
   * emitter.setMaxListeners(20);
   * console.log(emitter.getMaxListeners()); // 20
   * ```
   *
   * @see {@link setMaxListeners} to change the limit
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * Check for potential memory leaks by analyzing listener counts.
   *
   * Analyzes all events and identifies those that have more listeners than
   * the configured maximum. Returns detailed information about potential
   * memory leaks for debugging and monitoring purposes.
   *
   * @returns Object containing leak detection results
   * @returns returns.hasLeaks - Whether any potential leaks were detected
   * @returns returns.suspiciousEvents - Array of events with excessive listeners
   *
   * @example
   * ```typescript
   * emitter.setMaxListeners(3);
   *
   * // Add many listeners
   * for (let i = 0; i < 5; i++) {
   *   emitter.on('data', () => {});
   * }
   *
   * const leakCheck = emitter.checkMemoryLeaks();
   * if (leakCheck.hasLeaks) {
   *   console.log('Suspicious events:', leakCheck.suspiciousEvents);
   *   // Output: [{ event: 'data', count: 5, maxAllowed: 3 }]
   * }
   * ```
   *
   * @see {@link setMaxListeners} to configure leak detection threshold
   */
  checkMemoryLeaks(): {
    hasLeaks: boolean;
    suspiciousEvents: Array<{ event: string | symbol; count: number; maxAllowed: number }>;
  } {
    const suspiciousEvents: Array<{ event: string | symbol; count: number; maxAllowed: number }> = [];

    for (const [event, listeners] of this.events) {
      if (listeners.length > this.maxListeners && this.maxListeners !== 0) {
        suspiciousEvents.push({
          event,
          count: listeners.length,
          maxAllowed: this.maxListeners,
        });
      }
    }

    return {
      hasLeaks: suspiciousEvents.length > 0,
      suspiciousEvents,
    };
  }

  /**
   * Prepend a listener to the beginning of the listeners array.
   *
   * Adds a listener that will be called before any existing listeners for
   * the specified event. This is useful when you need to ensure a listener
   * runs first, such as for logging or validation.
   *
   * @param event - The event name to listen for
   * @param listener - The function to call when the event is emitted
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * emitter.on('data', () => console.log('Second'));
   * emitter.prependListener('data', () => console.log('First'));
   *
   * emitter.emit('data');
   * // Output:
   * // First
   * // Second
   * ```
   *
   * @see {@link on} for normal listener addition
   * @see {@link prependOnceListener} for one-time prepended listeners
   */
  prependListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    if (!listeners) {
      return this;
    }
    listeners.unshift(listener);

    // Warn if listener count exceeds maxListeners
    if (listeners.length > this.maxListeners && this.maxListeners !== 0) {
      defaultLogger.warn(
        `Possible EventEmitter memory leak detected. ${listeners.length} ${String(event)} listeners added. Use emitter.setMaxListeners() to increase limit`,
      );
    }

    return this;
  }

  /**
   * Prepend a one-time listener to the beginning of the listeners array.
   *
   * Adds a listener that will be called before any existing listeners and
   * automatically removed after being called once. Combines the behavior
   * of prependListener and once.
   *
   * @param event - The event name to listen for
   * @param listener - The function to call when the event is emitted
   * @returns This EventEmitter instance for method chaining
   *
   * @example
   * ```typescript
   * emitter.on('startup', () => console.log('Normal startup'));
   * emitter.prependOnceListener('startup', () => console.log('Pre-startup'));
   *
   * emitter.emit('startup');
   * // Output:
   * // Pre-startup
   * // Normal startup
   *
   * emitter.emit('startup');
   * // Output:
   * // Normal startup (prepended listener was removed)
   * ```
   *
   * @see {@link prependListener} for persistent prepended listeners
   * @see {@link once} for one-time listeners at the end
   */
  prependOnceListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
    const onceWrapper = (...args: unknown[]) => {
      this.removeListener(event, onceWrapper);
      listener(...args);
    };

    return this.prependListener(event, onceWrapper);
  }
}
