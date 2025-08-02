/**
 * Mock EventTarget for testing cross-origin discovery protocol
 * without requiring a browser environment.
 */
export class MockEventTarget implements EventTarget {
  private listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
  private dispatchedEvents: CustomEvent[] = [];

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | AddEventListenerOptions,
  ): void {
    if (!listener) return;

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(listener);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | EventListenerOptions,
  ): void {
    if (!listener) return;

    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    if (event instanceof CustomEvent) {
      this.dispatchedEvents.push(event);
    }

    const listeners = this.listeners.get(event.type);
    if (!listeners) {
      return true;
    }

    // Call all listeners synchronously
    for (const listener of listeners) {
      try {
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else {
          listener.handleEvent(event);
        }
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    }

    return !event.defaultPrevented;
  }

  /**
   * Get all dispatched events for testing verification.
   */
  getDispatchedEvents(): CustomEvent[] {
    return [...this.dispatchedEvents];
  }

  /**
   * Get dispatched events of a specific type.
   */
  getDispatchedEventsOfType(type: string): CustomEvent[] {
    return this.dispatchedEvents.filter((event) => event.type === type);
  }

  /**
   * Clear all dispatched events.
   */
  clearDispatchedEvents(): void {
    this.dispatchedEvents = [];
  }

  /**
   * Clear event history (alias for clearDispatchedEvents).
   */
  clearEventHistory(): void {
    this.clearDispatchedEvents();
  }

  /**
   * Get the count of listeners for a specific event type.
   */
  getListenerCount(type: string): number {
    return this.listeners.get(type)?.size ?? 0;
  }

  /**
   * Check if there are any listeners for a specific event type.
   */
  hasListeners(type: string): boolean {
    return this.getListenerCount(type) > 0;
  }

  /**
   * Get all event types that have listeners.
   */
  getListenedEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all listeners.
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Simulate a delay before dispatching an event (useful for async testing).
   */
  async dispatchEventWithDelay(event: Event, delayMs: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return this.dispatchEvent(event);
  }

  /**
   * Get statistics about the mock event target.
   */
  getStats() {
    return {
      totalEventTypes: this.listeners.size,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      dispatchedEventsCount: this.dispatchedEvents.length,
      listenedEventTypes: this.getListenedEventTypes(),
      eventTypeCounts: Array.from(this.listeners.entries()).map(([type, listeners]) => ({
        type,
        listenerCount: listeners.size,
      })),
    };
  }
}
