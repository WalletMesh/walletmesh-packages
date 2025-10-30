/**
 * Provider Registry
 *
 * Stores provider instances outside of Zustand state to prevent cross-origin errors.
 *
 * **Why This Exists:**
 * - Provider instances contain Window object references (popup, iframe)
 * - Storing these in Zustand state causes Immer to try freezing Window objects
 * - Freezing cross-origin Window objects triggers SecurityError
 * - Solution: Store providers separately, only metadata in state
 *
 * **Design:**
 * - Map<sessionId, provider> for O(1) lookup
 * - Automatic cleanup when sessions are removed
 * - Thread-safe for concurrent access
 *
 * @module internal/session/ProviderRegistry
 * @internal
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';

/**
 * Registry for storing provider instances outside Zustand state
 *
 * Prevents cross-origin errors by keeping Window-referencing objects
 * separate from serializable state.
 *
 * @internal
 */
export class ProviderRegistry {
  private providers = new Map<string, BlockchainProvider>();

  /**
   * Store a provider for a session
   *
   * @param sessionId - Session identifier
   * @param provider - Provider instance to store
   */
  set(sessionId: string, provider: BlockchainProvider): void {
    this.providers.set(sessionId, provider);
  }

  /**
   * Retrieve a provider for a session
   *
   * @param sessionId - Session identifier
   * @returns Provider instance or null if not found
   */
  get(sessionId: string): BlockchainProvider | null {
    return this.providers.get(sessionId) ?? null;
  }

  /**
   * Check if a provider exists for a session
   *
   * @param sessionId - Session identifier
   * @returns True if provider exists
   */
  has(sessionId: string): boolean {
    return this.providers.has(sessionId);
  }

  /**
   * Remove a provider for a session
   *
   * @param sessionId - Session identifier
   * @returns True if provider was found and removed
   */
  delete(sessionId: string): boolean {
    return this.providers.delete(sessionId);
  }

  /**
   * Get all stored session IDs
   *
   * @returns Array of session IDs
   */
  getSessionIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get count of stored providers
   *
   * @returns Number of providers
   */
  getCount(): number {
    return this.providers.size;
  }

  /**
   * Clear all providers
   *
   * Used for cleanup or reset scenarios
   */
  clear(): void {
    this.providers.clear();
  }

  /**
   * Get all providers (for debugging)
   *
   * @returns Map of all providers
   * @internal
   */
  getAll(): Map<string, BlockchainProvider> {
    return new Map(this.providers);
  }
}

/**
 * Global provider registry instance
 *
 * Shared across all parts of the application that need provider access.
 * Ensures consistent provider storage regardless of where accessed.
 *
 * @internal
 */
export const globalProviderRegistry = new ProviderRegistry();

/**
 * Helper function to get provider for a session
 *
 * Convenience wrapper around registry access with better error messaging.
 *
 * @param sessionId - Session identifier
 * @returns Provider instance or null
 * @internal
 */
export function getProviderForSession(sessionId: string): BlockchainProvider | null {
  return globalProviderRegistry.get(sessionId);
}

/**
 * Helper function to set provider for a session
 *
 * Convenience wrapper around registry storage with validation.
 *
 * @param sessionId - Session identifier
 * @param provider - Provider instance
 * @throws Error if sessionId is empty
 * @internal
 */
export function setProviderForSession(sessionId: string, provider: BlockchainProvider): void {
  if (!sessionId) {
    throw new Error('Session ID is required to store provider');
  }
  globalProviderRegistry.set(sessionId, provider);
}

/**
 * Helper function to remove provider for a session
 *
 * Convenience wrapper for cleanup operations.
 *
 * @param sessionId - Session identifier
 * @returns True if provider was removed
 * @internal
 */
export function removeProviderForSession(sessionId: string): boolean {
  return globalProviderRegistry.delete(sessionId);
}
