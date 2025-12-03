/**
 * Polling configuration options
 * @public
 */
export interface PollingOptions {
  /** Polling interval in milliseconds */
  interval: number;
  /** Whether to run callback immediately on start */
  immediate?: boolean;
  /** Maximum number of polling attempts (0 = infinite) */
  maxAttempts?: number;
  /** Whether to stop polling on error */
  stopOnError?: boolean;
}

/**
 * Poller instance interface
 * @public
 */
export interface Poller {
  /** Unique identifier for the poller */
  id: string;
  /** Start polling */
  start(): void;
  /** Stop polling */
  stop(): void;
  /** Check if polling is active */
  isActive(): boolean;
  /** Update polling interval */
  setInterval(interval: number): void;
  /** Dispose of the poller */
  dispose(): void;
}

/**
 * Internal poller implementation
 * @internal
 */
class PollerImpl implements Poller {
  private intervalId: NodeJS.Timeout | null = null;
  private attempts = 0;
  private isRunning = false;

  constructor(
    public readonly id: string,
    private callback: () => void | Promise<void>,
    private options: PollingOptions,
  ) {}

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.attempts = 0;

    // Run immediately if configured
    if (this.options.immediate) {
      this.runCallback();
    }

    // Start interval
    this.intervalId = setInterval(() => {
      this.runCallback();
    }, this.options.interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  setInterval(interval: number): void {
    this.options.interval = interval;

    // Restart with new interval if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  dispose(): void {
    this.stop();
  }

  private async runCallback(): Promise<void> {
    try {
      // Check max attempts
      if (this.options.maxAttempts && this.attempts >= this.options.maxAttempts) {
        this.stop();
        return;
      }

      this.attempts++;
      await this.callback();
    } catch (error) {
      if (this.options.stopOnError) {
        this.stop();
      }
      // Log error but don't throw
      console.error(`Polling error in ${this.id}:`, error);
    }
  }
}

/**
 * Utility for managing polling operations across the application.
 *
 * This utility provides:
 * - Centralized polling management
 * - Automatic cleanup
 * - Error handling
 * - Dynamic interval updates
 *
 * @example
 * ```typescript
 * const pollingService = new PollingService();
 *
 * // Create a poller
 * const poller = pollingService.createPoller('balance-check', 5000, async () => {
 *   await checkBalance();
 * });
 *
 * // Start polling
 * poller.start();
 *
 * // Stop all pollers
 * pollingService.stopAll();
 * ```
 */
export class PollingService {
  private pollers = new Map<string, Poller>();
  private pollerCounter = 0;

  /**
   * Creates a new poller instance.
   *
   * @param key - Unique key for the poller
   * @param interval - Polling interval in milliseconds
   * @param callback - Function to call on each poll
   * @param options - Additional polling options
   * @returns Poller instance
   */
  createPoller(
    key: string,
    interval: number,
    callback: () => void | Promise<void>,
    options?: Partial<PollingOptions>,
  ): Poller {
    // Stop existing poller with same key
    this.stopPoller(key);

    const pollerId = `${key}-${++this.pollerCounter}`;
    const pollerOptions: PollingOptions = {
      interval,
      immediate: false,
      maxAttempts: 0,
      stopOnError: false,
      ...options,
    };

    const poller = new PollerImpl(pollerId, callback, pollerOptions);
    this.pollers.set(key, poller);

    return poller;
  }

  /**
   * Manages a polling interval with automatic lifecycle.
   * Returns a disposable to stop polling.
   *
   * @param key - Unique key for the poller
   * @param interval - Polling interval in milliseconds
   * @param callback - Function to call on each poll
   * @returns Disposable function to stop polling
   */
  managePollInterval(key: string, interval: number, callback: () => void | Promise<void>): () => void {
    const poller = this.createPoller(key, interval, callback, { immediate: true });
    poller.start();

    return () => {
      this.stopPoller(key);
    };
  }

  /**
   * Gets an existing poller by key.
   *
   * @param key - Poller key
   * @returns Poller instance or undefined
   */
  getPoller(key: string): Poller | undefined {
    return this.pollers.get(key);
  }

  /**
   * Stops a specific poller.
   *
   * @param key - Poller key to stop
   */
  stopPoller(key: string): void {
    const poller = this.pollers.get(key);
    if (poller) {
      poller.dispose();
      this.pollers.delete(key);
    }
  }

  /**
   * Stops all active pollers.
   */
  stopAll(): void {
    for (const [, poller] of this.pollers) {
      poller.dispose();
    }
    this.pollers.clear();
  }

  /**
   * Gets all active poller keys.
   *
   * @returns Array of active poller keys
   */
  getActivePollers(): string[] {
    return Array.from(this.pollers.keys()).filter((key) => {
      const poller = this.pollers.get(key);
      return poller?.isActive();
    });
  }

  /**
   * Updates the interval of an existing poller.
   *
   * @param key - Poller key
   * @param interval - New interval in milliseconds
   */
  updateInterval(key: string, interval: number): void {
    const poller = this.pollers.get(key);
    if (poller) {
      poller.setInterval(interval);
    }
  }

  /**
   * Disposes of the service and all pollers.
   */
  async dispose(): Promise<void> {
    this.stopAll();
  }

  /**
   * Creates a debounced poller that resets on each call.
   * Useful for user-triggered polling that should delay after activity.
   *
   * @param key - Unique key for the poller
   * @param delay - Delay in milliseconds before polling starts
   * @param callback - Function to call
   * @returns Function to trigger/reset the debounced polling
   */
  createDebouncedPoller(key: string, delay: number, callback: () => void | Promise<void>): () => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Stop existing poller
      this.stopPoller(key);

      // Start new timeout
      timeoutId = setTimeout(() => {
        const poller = this.createPoller(key, delay, callback);
        poller.start();
      }, delay);
    };
  }
}
