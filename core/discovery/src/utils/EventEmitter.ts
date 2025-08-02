import { defaultLogger } from '../core/logger.js';

/**
 * Browser-compatible EventEmitter implementation.
 * Provides a subset of Node.js EventEmitter functionality for browser environments.
 *
 * @category Utils
 * @since 0.2.0
 */
export class EventEmitter {
  private events: Map<string | symbol, Array<(...args: unknown[]) => void>> = new Map();
  private maxListeners = 10;

  /**
   * Add a listener for the specified event.
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
   */
  off(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return this.removeListener(event, listener);
  }

  /**
   * Remove all listeners for the specified event, or all events if no event is specified.
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
   */
  listenerCount(event: string | symbol): number {
    return this.events.get(event)?.length ?? 0;
  }

  /**
   * Get all listeners for the specified event.
   */
  listeners(event: string | symbol): Array<(...args: unknown[]) => void> {
    return [...(this.events.get(event) ?? [])];
  }

  /**
   * Get all event names.
   */
  eventNames(): Array<string | symbol> {
    return [...this.events.keys()];
  }

  /**
   * Set the maximum number of listeners.
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * Get the maximum number of listeners.
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * Check for potential memory leaks by analyzing listener counts.
   * Returns information about events that may have memory leaks.
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
   */
  prependOnceListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
    const onceWrapper = (...args: unknown[]) => {
      this.removeListener(event, onceWrapper);
      listener(...args);
    };

    return this.prependListener(event, onceWrapper);
  }
}
