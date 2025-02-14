/**
 * Configuration options for wallet operation timeouts.
 *
 * Provides customizable timeout durations for different types
 * of wallet operations to ensure they don't hang indefinitely.
 *
 * @example
 * ```typescript
 * const config: TimeoutConfig = {
 *   connectionTimeout: 45000,  // 45 seconds for initial connection
 *   operationTimeout: 15000    // 15 seconds for other operations
 * };
 *
 * const wallet = await connect(walletInfo, config);
 * ```
 */
export interface TimeoutConfig {
  /**
   * Timeout in milliseconds for initial wallet connection
   * @default 30000 (30 seconds)
   */
  connectionTimeout?: number;

  /**
   * Timeout in milliseconds for other wallet operations
   * @default 10000 (10 seconds)
   */
  operationTimeout?: number;
}

/**
 * Specialized error for timeout conditions.
 *
 * Thrown when a wallet operation fails to complete within
 * its specified time limit. Includes details about the
 * operation and duration in the error message.
 *
 * @example
 * ```typescript
 * try {
 *   await withTimeout(operation, 5000, 'Connect Wallet');
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.error('Connection timed out:', error.message);
 *   }
 * }
 * ```
 */
export class TimeoutError extends Error {
  constructor(operation: string, timeout: number) {
    super(`${operation} timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Adds timeout functionality to any Promise-based operation.
 *
 * Wraps a promise with a timeout mechanism that will reject
 * if the operation doesn't complete within the specified time.
 * Uses Promise.race internally to implement the timeout.
 *
 * @typeParam T - The type of value that the promise resolves to
 * @param promise - The promise to wrap with a timeout
 * @param timeoutMs - The timeout duration in milliseconds
 * @param operation - The name of the operation for error reporting
 * @returns Promise that resolves with the original value or rejects with TimeoutError
 *
 * @example
 * ```typescript
 * // Wrap a wallet connection with 30 second timeout
 * const result = await withTimeout(
 *   wallet.connect(),
 *   30000,
 *   'Wallet Connection'
 * );
 *
 * // Using with custom error handling
 * try {
 *   const result = await withTimeout(
 *     slowOperation(),
 *     5000,
 *     'Slow Operation'
 *   );
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     // Handle timeout specifically
 *     handleTimeout();
 *   } else {
 *     // Handle other errors
 *     handleError(error);
 *   }
 * }
 * ```
 *
 * @remarks
 * The timeout is implemented using Promise.race between the original
 * promise and a timeout promise. When the timeout triggers, the original
 * operation may continue running in the background even though the
 * promise has rejected.
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(operation, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};
