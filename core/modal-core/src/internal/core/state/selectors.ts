/**
 * State selector utilities
 * @module state/selectors
 * @internal
 */

import type { StateSelector } from './types.js';

/**
 * Creates a selector that extracts specific properties from state
 * @template T - The state object type
 * @template K - Keys of properties to extract
 * @param {K[]} keys - Array of property keys to extract
 * @returns {StateSelector<T, Pick<T, K>>} Selector that returns picked properties
 * @public
 */
export function createPropertySelector<T extends object, K extends keyof T>(
  keys: K[],
): StateSelector<T, Pick<T, K>> {
  return (state: T): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      result[key] = state[key];
    }
    return result;
  };
}

/**
 * Creates a selector that applies a transformation to state
 * @template T - The state object type
 * @template U - The selected value type
 * @template V - The transformed value type
 * @param {StateSelector<T, U>} selector - Base selector to get data
 * @param {function(U): V} transform - Function to transform selected data
 * @returns {StateSelector<T, V>} Selector that returns transformed value
 * @public
 */
export function createTransformSelector<T extends object, U, V>(
  selector: StateSelector<T, U>,
  transform: (selected: U) => V,
): StateSelector<T, V> {
  return (state: T): V => {
    const selected = selector(state);
    return transform(selected);
  };
}

/**
 * Creates a selector that combines multiple selectors
 * @template T - The state object type
 * @template U - The combined result type
 * @param {{[K in keyof U]: StateSelector<T, U[K]>}} selectors - Map of selectors to combine
 * @returns {StateSelector<T, U>} Selector that returns combined results
 * @public
 */
export function createCombinedSelector<T extends object, U extends Record<string, unknown>>(
  selectors: { [K in keyof U]: StateSelector<T, U[K]> },
): StateSelector<T, U> {
  return (state: T): U => {
    const result = {} as U;
    for (const [key, selector] of Object.entries(selectors)) {
      result[key as keyof U] = selector(state);
    }
    return result;
  };
}

/**
 * Creates a memoized selector that only recomputes when inputs change
 * Simple implementation - for complex scenarios, consider using reselect library
 * @template T - The state object type
 * @template U - The selected value type
 * @param {StateSelector<T, U>} selector - Selector function to memoize
 * @returns {StateSelector<T, U>} Memoized selector
 * @public
 */
export function createMemoizedSelector<T extends object, U>(
  selector: StateSelector<T, U>,
): StateSelector<T, U> {
  let lastState: T | undefined;
  let lastResult: U | undefined;

  return (state: T): U => {
    if (lastState === state) {
      return lastResult as U;
    }

    const result = selector(state);
    lastState = state;
    lastResult = result;
    return result;
  };
}

/**
 * Creates a selector that checks a condition on state
 * @template T - The state object type
 * @param {function(T): boolean} predicate - Function that tests a condition on state
 * @returns {StateSelector<T, boolean>} Selector that returns boolean result
 * @public
 */
export function createPredicateSelector<T extends object>(
  predicate: (state: T) => boolean,
): StateSelector<T, boolean> {
  return predicate;
}

/**
 * Creates a selector that extracts a nested property from state
 * @template T - The state object type
 * @template V - The value type at the path
 * @param {(string|number)[]} path - Array of property keys forming path to nested value
 * @param {V} [defaultValue] - Optional default value if path doesn't exist
 * @returns {StateSelector<T, V|undefined>} Selector that returns value at path or default
 * @public
 */
export function createPathSelector<T extends object, V>(
  path: (string | number)[],
  defaultValue?: V,
): StateSelector<T, V | undefined> {
  return (state: T): V | undefined => {
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic path traversal requires any type
    let current: any = state;

    for (const key of path) {
      if (current === undefined || current === null) {
        return defaultValue;
      }
      current = current[key];
    }

    return current === undefined ? defaultValue : current;
  };
}
