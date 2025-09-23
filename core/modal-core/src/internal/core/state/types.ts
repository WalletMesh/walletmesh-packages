/**
 * State management type definitions
 * @module state/types
 * @internal
 */

/**
 * State selector function
 * Extracts specific values from state
 * @template T - The state object type
 * @template U - The selected value type
 * @typedef {function(T): U} StateSelector
 */
export type StateSelector<T extends object, U> = (state: T) => U;

/**
 * State update function
 * Either partial state object or function that receives current state and returns partial update
 * @template T - The state object type
 * @typedef {(Partial<T>|function(T): Partial<T>)} StateUpdater
 */
export type StateUpdater<T extends object> = Partial<T> | ((state: T) => Partial<T>);

/**
 * State change listener
 * Called when state changes
 * @template T - The state object type
 * @typedef {function(T, T): void} StateListener
 */
export type StateListener<T extends object> = (state: T, prevState: T) => void;

/**
 * State manager interface
 * Generic type-safe state management
 * @interface StateManager
 * @template T - The state object type
 */
export interface StateManager<T extends object> {
  /**
   * Get current state
   * @returns {T} The current state object
   */
  getState(): T;

  /**
   * Update state
   * @param {StateUpdater<T>} update - Partial state update or function that produces update
   * @param {string} [action] - Optional action name for debugging
   * @returns {void}
   */
  setState(update: StateUpdater<T>, action?: string): void;

  /**
   * Subscribe to state changes
   * @param {StateListener<T>} listener - Function called when state changes
   * @returns {function(): void} Unsubscribe function
   */
  subscribe(listener: StateListener<T>): () => void;

  /**
   * Get a specific slice of state using a selector
   * @template U - The selected value type
   * @param {StateSelector<T, U>} selector - Function to extract values from state
   * @returns {U} The selected value
   */
  select<U>(selector: StateSelector<T, U>): U;

  /**
   * Apply multiple updates in a single batch
   * Only triggers one update notification
   * @param {Array<StateUpdater<T>>} updates - Array of state updates
   * @param {string} [action] - Optional action name for debugging
   * @returns {void}
   */
  batch(updates: Array<StateUpdater<T>>, action?: string): void;

  /**
   * Reset state to initial values
   * @returns {void}
   */
  reset(): void;

  /**
   * Destroy manager and clean up subscriptions
   * @returns {void}
   */
  destroy(): void;
}
