/**
 * Configuration options for wallet operation timeouts
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
 * Error thrown when a wallet operation exceeds its timeout
 */
export class TimeoutError extends Error {
  constructor(operation: string, timeout: number) {
    super(`${operation} timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap with a timeout
 * @param timeoutMs The timeout duration in milliseconds
 * @param operation The name of the operation for error reporting
 * @returns Promise that will reject with TimeoutError if it exceeds the timeout
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(operation, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};
