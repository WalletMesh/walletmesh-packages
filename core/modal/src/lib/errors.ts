export class WalletError extends Error {
  override name = 'WalletError';

  constructor(
    message: string,
    public readonly code: number,
    public override readonly cause?: unknown,
  ) {
    super(message);
  }

  override toString(): string {
    const msg = `${this.name}(${this.code}): ${this.message}`;
    if (this.cause) {
      return `${msg}, Cause: ${this.cause}`;
    }
    return msg;
  }
}

export class WalletConnectionError extends WalletError {
  override name = 'WalletConnectionError';

  constructor(message: string, cause?: unknown) {
    super(message, -30000, cause); // Start wallet error codes at -30000
  }
}

export class WalletDisconnectionError extends WalletError {
  override name = 'WalletDisconnectionError';

  constructor(message: string, cause?: unknown) {
    super(message, -30001, cause);
  }
}

export class WalletSessionError extends WalletError {
  override name = 'WalletSessionError';

  constructor(message: string, cause?: unknown) {
    super(message, -30002, cause);
  }
}

/**
 * Utility function to handle wallet-related errors with consistent error types and messages
 * @param err - The original error
 * @param action - The action that was being performed (e.g., 'connect wallet')
 * @returns A specific WalletError subclass instance
 */
export const handleWalletError = (err: unknown, action: string): WalletError => {
  console.error(`${action} error:`, err);
  const message = err instanceof Error ? err.message : `Failed to ${action.toLowerCase()}`;

  // Map to specific error types based on action
  switch (action) {
    case 'connect wallet':
      return new WalletConnectionError(message, err);
    case 'resume session':
      return new WalletSessionError(message, err);
    case 'disconnect wallet':
      return new WalletDisconnectionError(message, err);
    default:
      return new WalletError(message, -30099, err); // Generic wallet error
  }
};
