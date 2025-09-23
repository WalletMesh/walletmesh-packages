/**
 * Connection status enum and utilities for wallet management
 *
 * This module provides a centralized enum for all connection status values
 * to replace string unions and improve type safety throughout the codebase.
 *
 * @module api/types/connectionStatus
 * @public
 */

// Import and re-export ConnectionStatus from core types to avoid circular dependencies
import { ConnectionStatus } from '../../core/types.js';
export { ConnectionStatus };

/**
 * Status groups for common checks
 * @public
 */
export const CONNECTION_STATUS_GROUPS = {
  /** Statuses that indicate the wallet is actively connecting */
  CONNECTING_STATES: [ConnectionStatus.Connecting, ConnectionStatus.Reconnecting] as const,
  /** Statuses that indicate an issue with the connection */
  ERROR_STATES: [ConnectionStatus.Error] as const,
  /** Statuses that indicate the wallet is available for use */
  ACTIVE_STATES: [ConnectionStatus.Connected] as const,
  /** Statuses that indicate the wallet is not available */
  INACTIVE_STATES: [ConnectionStatus.Disconnected, ConnectionStatus.Error] as const,
} as const;

/**
 * Utility functions for status checking
 * @public
 */

/**
 * Check if the connection status indicates the wallet is connected
 *
 * @param status - The connection status to check
 * @returns True if the wallet is connected and ready for use
 * @example
 * ```typescript
 * if (isConnected(status)) {
 *   // Safe to make wallet requests
 *   const balance = await wallet.getBalance();
 * }
 * ```
 */
export function isConnected(status: ConnectionStatus): boolean {
  return status === ConnectionStatus.Connected;
}

/**
 * Check if the connection status indicates a connection attempt is in progress
 *
 * @param status - The connection status to check
 * @returns True if currently connecting or reconnecting to a wallet
 * @remarks This includes both initial connection attempts and reconnection attempts
 * @example
 * ```typescript
 * if (isConnecting(status)) {
 *   // Show loading spinner
 *   showConnectionSpinner();
 * }
 * ```
 */
export function isConnecting(status: ConnectionStatus): boolean {
  return (CONNECTION_STATUS_GROUPS.CONNECTING_STATES as readonly ConnectionStatus[]).includes(status);
}

/**
 * Check if the connection status indicates the wallet is disconnected
 *
 * @param status - The connection status to check
 * @returns True if the wallet is disconnected
 * @example
 * ```typescript
 * if (isDisconnected(status)) {
 *   // Show connect button
 *   showConnectButton();
 * }
 * ```
 */
export function isDisconnected(status: ConnectionStatus): boolean {
  return status === ConnectionStatus.Disconnected;
}

/**
 * Check if the connection status indicates an error state
 *
 * @param status - The connection status to check
 * @returns True if the connection is in an error state
 * @example
 * ```typescript
 * if (isError(status)) {
 *   // Show error message and retry button
 *   showErrorMessage('Connection failed');
 *   showRetryButton();
 * }
 * ```
 */
export function isError(status: ConnectionStatus): boolean {
  return status === ConnectionStatus.Error;
}

/**
 * Check if the connection status indicates reconnection is in progress
 *
 * @param status - The connection status to check
 * @returns True if currently attempting to reconnect
 * @remarks Reconnection typically happens after a temporary connection loss
 * @example
 * ```typescript
 * if (isReconnecting(status)) {
 *   // Show reconnecting message
 *   showMessage('Reconnecting to wallet...');
 * }
 * ```
 */
export function isReconnecting(status: ConnectionStatus): boolean {
  return status === ConnectionStatus.Reconnecting;
}

/**
 * Check if the connection status indicates the wallet is in an active/usable state
 *
 * @param status - The connection status to check
 * @returns True if the wallet is in a state where operations can be performed
 * @remarks Currently only Connected status is considered active
 * @example
 * ```typescript
 * if (isActiveState(status)) {
 *   // Enable transaction buttons
 *   enableTransactionUI();
 * }
 * ```
 */
export function isActiveState(status: ConnectionStatus): boolean {
  return (CONNECTION_STATUS_GROUPS.ACTIVE_STATES as readonly ConnectionStatus[]).includes(status);
}

/**
 * Check if the connection status indicates the wallet is in an inactive/unusable state
 *
 * @param status - The connection status to check
 * @returns True if the wallet cannot perform operations
 * @remarks Includes both Disconnected and Error states
 * @example
 * ```typescript
 * if (isInactiveState(status)) {
 *   // Disable transaction UI
 *   disableTransactionUI();
 *   // Show appropriate message
 *   showInactiveMessage();
 * }
 * ```
 */
export function isInactiveState(status: ConnectionStatus): boolean {
  return (CONNECTION_STATUS_GROUPS.INACTIVE_STATES as readonly ConnectionStatus[]).includes(status);
}

/**
 * Get a human-readable description of the connection status
 *
 * @param status - The connection status to describe
 * @returns A user-friendly description of the status
 * @example
 * ```typescript
 * const description = getStatusDescription(status);
 * // For ConnectionStatus.Connecting: "Connecting to wallet"
 * // For ConnectionStatus.Error: "Connection error occurred"
 * showStatusMessage(description);
 * ```
 */
export function getStatusDescription(status: ConnectionStatus): string {
  switch (status) {
    case ConnectionStatus.Disconnected:
      return 'Wallet is not connected';
    case ConnectionStatus.Connecting:
      return 'Connecting to wallet';
    case ConnectionStatus.Connected:
      return 'Wallet is connected and ready';
    case ConnectionStatus.Error:
      return 'Connection error occurred';
    case ConnectionStatus.Reconnecting:
      return 'Reconnecting to wallet';
    default:
      return 'Unknown status';
  }
}

/**
 * Type guard to check if a string is a valid ConnectionStatus
 *
 * @param value - The string value to check
 * @returns True if the value is a valid ConnectionStatus enum value
 * @example
 * ```typescript
 * const statusFromApi = "connected";
 *
 * if (isValidConnectionStatus(statusFromApi)) {
 *   // TypeScript knows statusFromApi is ConnectionStatus
 *   handleStatus(statusFromApi);
 * } else {
 *   console.error('Invalid status:', statusFromApi);
 * }
 * ```
 */
export function isValidConnectionStatus(value: string): value is ConnectionStatus {
  return Object.values(ConnectionStatus).includes(value as ConnectionStatus);
}
