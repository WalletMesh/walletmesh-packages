/**
 * Deep equality utility for comparing complex objects
 *
 * This module provides a robust deep equality comparison function that:
 * - Handles nested objects and arrays
 * - Is insensitive to property ordering
 * - Detects circular references
 * - Handles edge cases (null, undefined, NaN, etc.)
 *
 * Used primarily for duplicate response detection in the discovery protocol
 * to avoid false positives from property ordering differences.
 *
 * @module utils/deepEqual
 * @packageDocumentation
 */

/**
 * Compare two values for deep equality.
 *
 * This function performs a deep comparison of two values, handling:
 * - Primitives (string, number, boolean, null, undefined, symbol, bigint)
 * - Objects (with property order independence)
 * - Arrays (with order sensitivity)
 * - Dates, RegExp, and other built-in types
 * - Circular references (prevents infinite loops)
 * - NaN equality (NaN === NaN returns true)
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param visited - Internal set for tracking visited objects (circular reference detection)
 * @returns true if values are deeply equal, false otherwise
 *
 * @example Basic usage
 * ```typescript
 * deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true (property order independent)
 * deepEqual([1, 2, 3], [1, 2, 3]); // true
 * deepEqual([1, 2, 3], [3, 2, 1]); // false (array order matters)
 * ```
 *
 * @example With nested objects
 * ```typescript
 * const obj1 = { user: { name: 'Alice', age: 30 }, items: [1, 2, 3] };
 * const obj2 = { items: [1, 2, 3], user: { age: 30, name: 'Alice' } };
 * deepEqual(obj1, obj2); // true
 * ```
 *
 * @example With circular references
 * ```typescript
 * const obj1: any = { a: 1 };
 * obj1.self = obj1;
 * const obj2: any = { a: 1 };
 * obj2.self = obj2;
 * deepEqual(obj1, obj2); // true
 * ```
 *
 * @category Utilities
 * @since 0.8.0
 */
export function deepEqual(a: unknown, b: unknown, visited = new WeakSet()): boolean {
  // Handle same reference (fast path)
  if (a === b) {
    return true;
  }

  // Handle NaN (NaN !== NaN in JavaScript, but we want to treat them as equal)
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  // Handle null and undefined
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  // Handle different types
  if (typeof a !== typeof b) {
    return false;
  }

  // Handle primitives (string, number, boolean, symbol, bigint)
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }

  // Both are objects from here on

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // Handle circular references
  if (visited.has(a as object)) {
    return true; // Assume equal if we've seen this object before
  }
  visited.add(a as object);

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], visited)) {
        return false;
      }
    }

    return true;
  }

  // One is array, other is not
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle plain objects
  const aKeys = Object.keys(a as object).sort();
  const bKeys = Object.keys(b as object).sort();

  // Different number of keys
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  // Different keys (after sorting)
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) {
      return false;
    }
  }

  // Compare values for each key
  for (const key of aKeys) {
    const aValue = (a as Record<string, unknown>)[key];
    const bValue = (b as Record<string, unknown>)[key];

    if (!deepEqual(aValue, bValue, visited)) {
      return false;
    }
  }

  return true;
}
