import type { SessionState } from '../../../api/types/sessionState.js';

/**
 * Event types supported by the mapping service
 */
export type WalletEventType =
  | 'view:change'
  | 'connection:established'
  | 'connection:failed'
  | 'connection:lost'
  | 'chain:switch'
  | 'account:change'
  | 'session:update'
  | 'session:end'
  | 'message:sent'
  | 'message:received';

/**
 * Base event interface
 */
export interface BaseWalletEvent {
  type: WalletEventType;
  timestamp: number;
}

/**
 * View change event
 */
export interface ViewChangeEvent extends BaseWalletEvent {
  type: 'view:change';
  from: string;
  to: string;
}

/**
 * Connection established event
 */
export interface ConnectionEstablishedEvent extends BaseWalletEvent {
  type: 'connection:established';
  walletId: string;
  address: string;
  addresses: string[];
  chainId: string;
}

/**
 * Connection failed event
 */
export interface ConnectionFailedEvent extends BaseWalletEvent {
  type: 'connection:failed';
  walletId?: string;
  error: unknown;
  code?: string;
}

/**
 * Connection lost event
 */
export interface ConnectionLostEvent extends BaseWalletEvent {
  type: 'connection:lost';
  walletId: string;
  reason?: string;
}

/**
 * Chain switch event
 */
export interface ChainSwitchEvent extends BaseWalletEvent {
  type: 'chain:switch';
  walletId: string;
  fromChainId: string;
  toChainId: string;
}

/**
 * Account change event
 */
export interface AccountChangeEvent extends BaseWalletEvent {
  type: 'account:change';
  walletId: string;
  fromAddresses: string[];
  toAddresses: string[];
}

/**
 * Union type of all wallet events
 */
export type WalletEvent =
  | ViewChangeEvent
  | ConnectionEstablishedEvent
  | ConnectionFailedEvent
  | ConnectionLostEvent
  | ChainSwitchEvent
  | AccountChangeEvent;

/**
 * State change detection result
 */
export interface StateChangeResult {
  hasChanged: boolean;
  events: WalletEvent[];
}

/**
 * Utility for mapping state changes to events and transforming event data.
 *
 * This utility provides:
 * - State change detection
 * - Event transformation
 * - Event type mapping
 * - State diffing utilities
 *
 * @example
 * ```typescript
 * const eventMapper = new EventMappingService();
 *
 * // Detect state changes
 * const changes = eventMapper.detectStateChanges(prevState, currentState);
 *
 * // Transform events
 * const event = eventMapper.transformConnectionEvent(session);
 * ```
 */
export class EventMappingService {
  /**
   * Detects view changes between states.
   *
   * @param prevView - Previous view state
   * @param currentView - Current view state
   * @returns View change event or null
   */
  detectViewChange(prevView: string, currentView: string): ViewChangeEvent | null {
    if (prevView === currentView) return null;

    return {
      type: 'view:change',
      from: prevView,
      to: currentView,
      timestamp: Date.now(),
    };
  }

  /**
   * Detects session connection changes.
   *
   * @param prevSessions - Previous sessions map
   * @param currentSessions - Current sessions map
   * @returns Array of connection events
   */
  detectConnectionChanges(
    prevSessions: Map<string, SessionState>,
    currentSessions: Map<string, SessionState>,
  ): WalletEvent[] {
    const events: WalletEvent[] = [];

    // Check for new connections
    for (const [sessionId, session] of currentSessions) {
      const prevSession = prevSessions.get(sessionId);

      if (!prevSession && session.status === 'connected') {
        // New connection established
        events.push(this.transformConnectionEstablished(session));
      } else if (prevSession && prevSession.status !== 'connected' && session.status === 'connected') {
        // Connection status changed to connected
        events.push(this.transformConnectionEstablished(session));
      }
    }

    // Check for lost connections
    for (const [sessionId, prevSession] of prevSessions) {
      const currentSession = currentSessions.get(sessionId);

      if (
        !currentSession ||
        (currentSession && currentSession.status !== 'connected' && prevSession.status === 'connected')
      ) {
        // Connection lost
        events.push({
          type: 'connection:lost',
          walletId: prevSession.walletId,
          reason: 'disconnected',
          timestamp: Date.now(),
        });
      }
    }

    return events;
  }

  /**
   * Detects chain changes in a session.
   *
   * @param prevSession - Previous session state
   * @param currentSession - Current session state
   * @returns Chain switch event or null
   */
  detectChainChange(prevSession: SessionState, currentSession: SessionState): ChainSwitchEvent | null {
    if (prevSession.chain.chainId === currentSession.chain.chainId) return null;

    return {
      type: 'chain:switch',
      walletId: currentSession.walletId,
      fromChainId: String(prevSession.chain.chainId),
      toChainId: String(currentSession.chain.chainId),
      timestamp: Date.now(),
    };
  }

  /**
   * Detects account changes in a session.
   *
   * @param prevSession - Previous session state
   * @param currentSession - Current session state
   * @returns Account change event or null
   */
  detectAccountChange(prevSession: SessionState, currentSession: SessionState): AccountChangeEvent | null {
    // Compare addresses arrays
    const prevAddresses = prevSession.accounts.map((a) => a.address).sort();
    const currentAddresses = currentSession.accounts.map((a) => a.address).sort();

    // Check if arrays are equal
    const hasChanged =
      prevAddresses.length !== currentAddresses.length ||
      !prevAddresses.every((addr, index) => addr === currentAddresses[index]);

    if (!hasChanged) return null;

    return {
      type: 'account:change',
      walletId: currentSession.walletId,
      fromAddresses: prevAddresses,
      toAddresses: currentAddresses,
      timestamp: Date.now(),
    };
  }

  /**
   * Transforms a session into a connection established event.
   *
   * @param session - Session state
   * @returns Connection established event
   */
  transformConnectionEstablished(session: SessionState): ConnectionEstablishedEvent {
    return {
      type: 'connection:established',
      walletId: session.walletId,
      address: session.activeAccount.address,
      addresses: session.accounts.map((acc) => acc.address),
      chainId: String(session.chain.chainId),
      timestamp: Date.now(),
    };
  }

  /**
   * Transforms an error into a connection failed event.
   *
   * @param error - Error object
   * @param walletId - Optional wallet ID
   * @returns Connection failed event
   */
  transformConnectionFailed(error: unknown, walletId?: string): ConnectionFailedEvent {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = this.extractErrorCode(error);

    return {
      type: 'connection:failed',
      walletId: walletId || 'unknown',
      error: errorMessage,
      ...(errorCode && { code: errorCode }),
      timestamp: Date.now(),
    };
  }

  /**
   * Extracts wallet ID from an error object.
   *
   * @param error - Error object
   * @returns Wallet ID or undefined
   */
  extractWalletIdFromError(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined;

    // Check common error data patterns
    const errorObj = error as Record<string, unknown>;

    // Check data.walletId
    if (errorObj['data'] && typeof errorObj['data'] === 'object') {
      const data = errorObj['data'] as Record<string, unknown>;
      if (typeof data['walletId'] === 'string') {
        return data['walletId'];
      }
    }

    // Check direct walletId property
    if (typeof errorObj['walletId'] === 'string') {
      return errorObj['walletId'];
    }

    return undefined;
  }

  /**
   * Extracts error code from an error object.
   *
   * @param error - Error object
   * @returns Error code or undefined
   */
  private extractErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined;

    const errorObj = error as Record<string, unknown>;

    // Check code property
    if (typeof errorObj['code'] === 'string') {
      return errorObj['code'];
    }

    // Check data.code
    if (errorObj['data'] && typeof errorObj['data'] === 'object') {
      const data = errorObj['data'] as Record<string, unknown>;
      if (typeof data['code'] === 'string') {
        return data['code'];
      }
    }

    return undefined;
  }

  /**
   * Validates if an event name is supported.
   *
   * @param eventName - Event name to validate
   * @returns True if supported
   */
  isEventSupported(eventName: string): boolean {
    const supportedEvents = this.getAvailableEvents();
    return supportedEvents.includes(eventName as WalletEventType);
  }

  /**
   * Gets all available event types.
   *
   * @returns Array of supported event types
   */
  getAvailableEvents(): WalletEventType[] {
    return [
      'view:change',
      'connection:established',
      'connection:failed',
      'connection:lost',
      'chain:switch',
      'account:change',
      'session:update',
      'session:end',
      'message:sent',
      'message:received',
    ];
  }
}
