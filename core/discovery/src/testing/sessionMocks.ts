/**
 * Session and ID generation utilities for testing.
 *
 * Provides deterministic and controllable ID generation for testing
 * scenarios where predictable session IDs, UUIDs, and other identifiers
 * are needed for test reproducibility and assertion accuracy.
 *
 * @module sessionMocks
 * @category Testing
 * @since 1.0.0
 */

/**
 * Options for creating test sessions and IDs.
 */
export interface TestIdOptions {
  /** Prefix for the generated ID */
  prefix?: string;
  /** Make the ID deterministic based on input */
  deterministic?: boolean;
  /** Custom sequence number */
  sequence?: number;
}

/**
 * Mock crypto object for controlled testing.
 *
 * Replaces crypto.randomUUID with a deterministic implementation
 * that generates predictable UUIDs for testing purposes.
 *
 * @example
 * ```typescript
 * import { MockCrypto, setupMockCrypto } from '@walletmesh/discovery/testing';
 *
 * describe('UUID Generation Tests', () => {
 *   let cleanup: () => void;
 *
 *   beforeEach(() => {
 *     cleanup = setupMockCrypto();
 *   });
 *
 *   afterEach(() => {
 *     cleanup();
 *   });
 *
 *   it('should generate predictable UUIDs', () => {
 *     const uuid1 = crypto.randomUUID();
 *     const uuid2 = crypto.randomUUID();
 *
 *     expect(uuid1).toBe('test-uuid-1');
 *     expect(uuid2).toBe('test-uuid-2');
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export class MockCrypto {
  private uuidCounter = 0;
  private readonly prefix: string;

  constructor(prefix = 'test-uuid') {
    this.prefix = prefix;
  }

  /**
   * Generate a deterministic UUID.
   *
   * @returns A predictable UUID string
   */
  randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
    this.uuidCounter += 1;
    return formatAsUUID(`${this.prefix}-${this.uuidCounter}`);
  }

  /**
   * Reset the UUID counter.
   */
  reset(): void {
    this.uuidCounter = 0;
  }

  /**
   * Set the next UUID counter value.
   *
   * @param value - The next counter value
   */
  setCounter(value: number): void {
    this.uuidCounter = value;
  }

  /**
   * Get the current counter value.
   *
   * @returns Current counter value
   */
  getCounter(): number {
    return this.uuidCounter;
  }
}

/**
 * Create a test session ID.
 *
 * Generates session IDs suitable for testing discovery protocol
 * functionality. Can be deterministic or random based on options.
 *
 * @param options - Configuration options for session ID generation
 * @returns A session ID string
 *
 * @example
 * ```typescript
 * import { createTestSessionId } from '@walletmesh/discovery/testing';
 *
 * // Create deterministic session ID
 * const sessionId1 = createTestSessionId({ prefix: 'session', deterministic: true });
 * const sessionId2 = createTestSessionId({ prefix: 'session', deterministic: true });
 *
 * expect(sessionId1).toBe('session-1');
 * expect(sessionId2).toBe('session-2');
 *
 * // Create custom session ID
 * const customSession = createTestSessionId({
 *   prefix: 'discovery',
 *   sequence: 42
 * });
 * expect(customSession).toBe('discovery-42');
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createTestSessionId(options: TestIdOptions = {}): string {
  const { prefix = 'test-session', deterministic = true, sequence } = options;

  if (sequence !== undefined) {
    return `${prefix}-${sequence}`;
  }

  if (deterministic) {
    // Use a global counter for deterministic IDs
    const counter = getOrCreateCounter('sessionId');
    counter.value += 1;
    return `${prefix}-${counter.value}`;
  }

  // Generate a more random-looking but still testable ID
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create a test UUID.
 *
 * Generates UUIDs suitable for testing. Can be in proper UUID format
 * or simplified format depending on testing needs.
 *
 * @param options - Configuration options for UUID generation
 * @returns A UUID string
 *
 * @example
 * ```typescript
 * import { createTestUUID } from '@walletmesh/discovery/testing';
 *
 * // Create simple deterministic UUID
 * const uuid1 = createTestUUID({ deterministic: true });
 * const uuid2 = createTestUUID({ deterministic: true });
 *
 * expect(uuid1).toBe('test-uuid-1');
 * expect(uuid2).toBe('test-uuid-2');
 *
 * // Create UUID with custom prefix
 * const walletUuid = createTestUUID({ prefix: 'wallet' });
 * expect(walletUuid).toMatch(/^wallet-\d+$/);
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createTestUUID(options: TestIdOptions = {}): string {
  const { prefix = 'test-uuid', deterministic = true, sequence } = options;

  if (sequence !== undefined) {
    return formatAsUUID(`${prefix}-${sequence}`);
  }

  if (deterministic) {
    const counter = getOrCreateCounter('uuid');
    counter.value += 1;
    return formatAsUUID(`${prefix}-${counter.value}`);
  }

  // Generate a more random UUID
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return formatAsUUID(`${prefix}-${result}`);
}

/**
 * Create a test responder ID.
 *
 * Generates responder IDs for testing discovery responses.
 * Responder IDs are typically shorter and more human-readable.
 *
 * @param options - Configuration options
 * @returns A responder ID string
 *
 * @example
 * ```typescript
 * import { createTestResponderId } from '@walletmesh/discovery/testing';
 *
 * const responderId = createTestResponderId({ prefix: 'wallet' });
 * expect(responderId).toMatch(/^wallet-responder-\d+$/);
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createTestResponderId(options: TestIdOptions = {}): string {
  const { prefix = 'test', deterministic = true, sequence } = options;

  if (sequence !== undefined) {
    return `${prefix}-responder-${sequence}`;
  }

  if (deterministic) {
    const counter = getOrCreateCounter('responderId');
    counter.value += 1;
    return `${prefix}-responder-${counter.value}`;
  }

  const timestamp = Date.now();
  return `${prefix}-responder-${timestamp}`;
}

/**
 * Create a batch of test session IDs.
 *
 * Useful for testing scenarios that involve multiple sessions
 * or concurrent discovery operations.
 *
 * @param count - Number of session IDs to create
 * @param options - Configuration options
 * @returns Array of session ID strings
 *
 * @example
 * ```typescript
 * import { createTestSessionBatch } from '@walletmesh/discovery/testing';
 *
 * const sessionIds = createTestSessionBatch(3, { prefix: 'batch' });
 * expect(sessionIds).toEqual(['batch-1', 'batch-2', 'batch-3']);
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createTestSessionBatch(count: number, options: TestIdOptions = {}): string[] {
  const sessions: string[] = [];
  const baseOptions = { ...options, deterministic: true };

  for (let i = 0; i < count; i++) {
    sessions.push(createTestSessionId({ ...baseOptions, sequence: i + 1 }));
  }

  return sessions;
}

/**
 * Set up mock crypto for testing.
 *
 * Replaces the global crypto.randomUUID with a mock implementation
 * and provides a cleanup function to restore the original.
 *
 * @param prefix - Prefix for generated UUIDs
 * @returns Cleanup function to restore original crypto
 *
 * @example
 * ```typescript
 * import { setupMockCrypto } from '@walletmesh/discovery/testing';
 *
 * describe('Tests with mock crypto', () => {
 *   let cleanup: () => void;
 *
 *   beforeEach(() => {
 *     cleanup = setupMockCrypto('test');
 *   });
 *
 *   afterEach(() => {
 *     cleanup();
 *   });
 *
 *   it('should use mock UUIDs', () => {
 *     expect(crypto.randomUUID()).toBe('test-1');
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function setupMockCrypto(prefix = 'test-uuid'): () => void {
  const originalCrypto = globalThis.crypto;
  const mockCrypto = new MockCrypto(prefix);

  // Set up mock crypto
  if (originalCrypto) {
    const originalRandomUUID = originalCrypto.randomUUID;
    originalCrypto.randomUUID = () => mockCrypto.randomUUID();

    return () => {
      originalCrypto.randomUUID = originalRandomUUID;
    };
  }

  // Create minimal crypto mock
  (globalThis as unknown as { crypto: { randomUUID: () => string } }).crypto = {
    randomUUID: () => mockCrypto.randomUUID(),
  };

  return () => {
    (globalThis as unknown as { crypto?: unknown }).crypto = undefined;
  };
}

/**
 * Reset all test ID counters.
 *
 * Useful for ensuring test isolation by resetting all
 * deterministic ID generation state.
 *
 * @example
 * ```typescript
 * import { resetTestIdCounters } from '@walletmesh/discovery/testing';
 *
 * beforeEach(() => {
 *   resetTestIdCounters();
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function resetTestIdCounters(): void {
  testCounters.clear();
}

// Internal counter management
const testCounters = new Map<string, { value: number }>();

function getOrCreateCounter(name: string): { value: number } {
  if (!testCounters.has(name)) {
    testCounters.set(name, { value: 0 });
  }
  const counter = testCounters.get(name);
  if (!counter) {
    throw new Error(`Counter '${name}' not found`);
  }
  return counter;
}

function formatAsUUID(input: string): `${string}-${string}-${string}-${string}-${string}` {
  // Simple UUID-like formatting for testing
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const padded = cleaned.padEnd(32, '0').substring(0, 32);

  return `${padded.substring(0, 8)}-${padded.substring(8, 12)}-${padded.substring(12, 16)}-${padded.substring(16, 20)}-${padded.substring(20, 32)}`;
}
