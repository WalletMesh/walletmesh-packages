/**
 * Persistence configuration for the store
 *
 * Handles session persistence with proper serialization of Maps and Sets
 *
 * @module state/persistConfig
 */

import type { BlockchainProvider } from '../api/types/chainProviders.js';
import type { SessionState } from '../api/types/sessionState.js';

/**
 * Validates a rehydrated session to ensure it's still valid
 */
export function validateRehydratedSession(session: SessionState): boolean {
  // Check required fields
  if (!session.sessionId || !session.walletId || !session.activeAccount) {
    return false;
  }

  // Check if session has expired (24 hours by default)
  const now = Date.now();
  const sessionAge = now - session.lifecycle.createdAt;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (sessionAge > maxAge) {
    return false;
  }

  // Additional validation can be added here
  return true;
}

/**
 * Process rehydrated sessions to ensure they're valid and up-to-date
 */
export function processRehydratedSessions(sessions: Map<string, SessionState>): Map<string, SessionState> {
  const validSessions = new Map<string, SessionState>();

  for (const [sessionId, session] of sessions) {
    if (validateRehydratedSession(session)) {
      // Reset status to disconnected - will be updated when connection is re-established
      session.status = 'disconnected';
      // Clear the provider instance as it can't be serialized
      // Provider instance will be recreated when connection is re-established
      (session.provider as { instance: BlockchainProvider | null }).instance = null;
      validSessions.set(sessionId, session);
    }
  }

  return validSessions;
}
