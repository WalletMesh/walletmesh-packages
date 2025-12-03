/**
 * Event emitter implementation for the modal system
 *
 * Provides a lightweight, type-safe event emitter for internal component
 * communication. Implements the standard EventEmitter pattern with error
 * isolation to prevent listener failures from affecting other listeners.
 *
 * ## Design Principles
 *
 * - **Simplicity**: Minimal API surface for easy understanding
 * - **Type Safety**: Generic types for event payloads
 * - **Error Isolation**: Listener errors don't break the emitter
 * - **Memory Efficient**: Automatic cleanup of empty listener sets
 *
 * ## Usage Patterns
 *
 * ```typescript
 * // Create typed event emitter
 * interface MyEvents {
 *   'data:loaded': { records: number };
 *   'error:occurred': { message: string };
 * }
 *
 * const emitter = new EventEmitter();
 *
 * // Type-safe listeners
 * emitter.on<MyEvents['data:loaded']>('data:loaded', (event) => {
 *   console.log(`Loaded ${event.records} records`);
 * });
 *
 * // Emit events
 * emitter.emit('data:loaded', { records: 42 });
 * ```
 *
 * @module events/eventEmitter
 * @internal
 */

// biome-ignore lint/suspicious/noExplicitAny: Generic event type needs to accept any payload
export type EventListener<T = any> = (event: T) => void;

/**
 * Simple event emitter for internal use
 *
 * A lightweight event emitter that provides the core pub/sub functionality
 * needed by modal components. Designed for internal use with a focus on
 * simplicity and reliability.
 *
 * @example
 * ```typescript
 * const emitter = new EventEmitter();
 *
 * // Subscribe to events
 * emitter.on('user:login', (user) => {
 *   console.log(`User ${user.name} logged in`);
 * });
 *
 * // One-time listener
 * emitter.once('app:ready', () => {
 *   console.log('App initialized');
 * });
 *
 * // Emit events
 * emitter.emit('user:login', { name: 'Alice', id: 123 });
 *
 * // Check listeners
 * console.log(`Listeners for user:login: ${emitter.listenerCount('user:login')}`);
 *
 * // Cleanup
 * emitter.removeAllListeners('user:login');
 * ```
 */
export class EventEmitter {
  private listeners = new Map<string, Set<EventListener>>();

  /**
   * Add an event listener
   *
   * Registers a listener function for the specified event. Multiple listeners
   * can be registered for the same event and will be called in order.
   *
   * @param event - Event name to listen for
   * @param listener - Function to call when event is emitted
   *
   * @example
   * ```typescript
   * emitter.on('connection:ready', (data) => {
   *   console.log('Connection established:', data);
   * });
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: Generic event handler needs to accept any type
  on<T = any>(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
  }

  /**
   * Remove an event listener
   */
  // biome-ignore lint/suspicious/noExplicitAny: Generic event handler needs to accept any type
  off<T = any>(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Add a one-time event listener
   *
   * Registers a listener that will be automatically removed after being
   * called once. Useful for initialization events or one-time notifications.
   *
   * @param event - Event name to listen for
   * @param listener - Function to call once when event is emitted
   *
   * @example
   * ```typescript
   * emitter.once('app:initialized', () => {
   *   console.log('App ready - this will only log once');
   *   startApplication();
   * });
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: Generic event handler needs to accept any type
  once<T = any>(event: string, listener: EventListener<T>): void {
    const onceListener = (data: T) => {
      this.off(event, onceListener);
      listener(data);
    };
    this.on(event, onceListener);
  }

  /**
   * Emit an event
   *
   * Calls all registered listeners for the event with the provided data.
   * Listeners are called synchronously in the order they were registered.
   * Errors in listeners are caught and logged to prevent cascade failures.
   *
   * @param event - Event name to emit
   * @param data - Data to pass to listeners
   *
   * @example
   * ```typescript
   * // Emit with data
   * emitter.emit('user:updated', {
   *   id: 123,
   *   name: 'Alice',
   *   email: 'alice@example.com'
   * });
   *
   * // Emit without data
   * emitter.emit('cache:cleared', null);
   * ```
   */
  // biome-ignore lint/suspicious/noExplicitAny: Generic event data type
  emit<T = any>(event: string, data: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data);
        } catch (error) {
          // Don't let listener errors break the emitter
          // This ensures one bad listener doesn't prevent others from running
          console.error('Event listener error:', error);
        }
      }
    }
  }

  /**
   * Get all event names
   *
   * Returns an array of all event names that have registered listeners.
   * Useful for debugging and introspection.
   *
   * @returns Array of event names with active listeners
   *
   * @example
   * ```typescript
   * const events = emitter.eventNames();
   * console.log('Active events:', events);
   * // Output: ['user:login', 'data:update', 'error:occurred']
   * ```
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   *
   * Clears listeners to prevent memory leaks and clean up resources.
   * Call without arguments to remove all listeners for all events.
   *
   * @param event - Optional event name to clear listeners for
   *
   * @example
   * ```typescript
   * // Remove all listeners for specific event
   * emitter.removeAllListeners('user:logout');
   *
   * // Remove all listeners for all events
   * emitter.removeAllListeners();
   * ```
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
