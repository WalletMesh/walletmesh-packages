/**
 * Approval Queue Manager for request-based approval tracking.
 *
 * This module provides a secure approval queue that tracks each request
 * by its unique JSON-RPC request ID, preventing race conditions where
 * concurrent requests could bypass user approval.
 *
 * @module @walletmesh/router/approval
 */

/**
 * Possible states for an approval request.
 */
export type ApprovalState = 'pending' | 'awaiting_approval' | 'approved' | 'denied' | 'complete';

/**
 * Context information for an approval request.
 * Each request has its own context keyed by the unique JSON-RPC request ID.
 */
export interface ApprovalContext {
  /** Unique JSON-RPC request ID - the key that prevents race conditions */
  requestId: string | number;
  /** Chain ID where the request will be executed */
  chainId: string;
  /** Method name being called */
  method: string;
  /** Method parameters */
  params?: unknown | undefined;
  /** Origin of the request (e.g., "https://app.example.com") */
  origin?: string | undefined;
  /** Session ID for the request */
  sessionId?: string | undefined;
  /** Unique transaction status ID for correlation with transaction tracking */
  txStatusId?: string | undefined;
  /** Current state of the approval */
  state: ApprovalState;
  /** Timestamp when the approval was queued */
  queuedAt: number;
}

/**
 * Configuration options for the approval queue manager.
 */
export interface ApprovalQueueConfig {
  /** Default timeout in milliseconds. Defaults to 5 minutes (300000ms) */
  defaultTimeout?: number | undefined;
  /** Callback invoked when an approval request times out */
  onTimeout?: ((context: ApprovalContext) => void) | undefined;
  /** Enable debug logging */
  debug?: boolean | undefined;
}

/**
 * Internal resolver structure for Promise-based blocking.
 */
interface ApprovalResolver {
  resolve: (approved: boolean) => void;
  reject: (error: Error) => void;
}

const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Manages a queue of pending approval requests with Promise-based blocking.
 *
 * Key features:
 * - Each request is keyed by its unique JSON-RPC request ID
 * - Requests block on a Promise until explicitly resolved
 * - Automatic timeout handling with cleanup
 * - Thread-safe for concurrent request handling
 *
 * @example
 * ```typescript
 * const manager = new ApprovalQueueManager({
 *   defaultTimeout: 60000, // 1 minute
 *   onTimeout: (ctx) => console.log(`Request ${ctx.requestId} timed out`),
 * });
 *
 * // Queue an approval (blocks until resolved)
 * const approved = await manager.queueApproval({
 *   requestId: 'req-123',
 *   chainId: 'aztec:31337',
 *   method: 'aztec_wmExecuteTx',
 *   params: { ... },
 *   origin: 'https://app.example.com',
 *   state: 'pending',
 *   queuedAt: Date.now(),
 * });
 *
 * // In wallet UI, resolve the approval
 * manager.resolveApproval('req-123', true); // or false to deny
 * ```
 */
export class ApprovalQueueManager {
  /** Map of pending approval contexts keyed by request ID */
  private pending: Map<string | number, ApprovalContext> = new Map();

  /** Map of Promise resolvers for blocking approvals */
  private resolvers: Map<string | number, ApprovalResolver> = new Map();

  /** Map of timeout handles for automatic cleanup */
  private timeouts: Map<string | number, ReturnType<typeof setTimeout>> = new Map();

  /** Configuration for the manager */
  private config: ApprovalQueueConfig;

  constructor(config: ApprovalQueueConfig = {}) {
    this.config = {
      defaultTimeout: config.defaultTimeout ?? DEFAULT_TIMEOUT,
      onTimeout: config.onTimeout,
      debug: config.debug ?? false,
    };
  }

  /**
   * Log a debug message if debug mode is enabled.
   */
  private log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(`[ApprovalQueue] ${message}`, data ?? '');
    }
  }

  /**
   * Queue an approval request and block until it is resolved.
   *
   * This method creates a Promise that will not resolve until either:
   * 1. `resolveApproval()` is called with the same requestId
   * 2. The timeout expires (rejects with error)
   *
   * @param context - The approval context containing request details
   * @param timeout - Optional timeout in ms (defaults to config.defaultTimeout)
   * @returns Promise that resolves to true if approved, false if denied
   * @throws Error if the request times out or is already pending
   */
  async queueApproval(context: ApprovalContext, timeout?: number): Promise<boolean> {
    const { requestId } = context;

    // Check if this request is already pending
    if (this.pending.has(requestId)) {
      this.log(`Request ${requestId} is already pending`);
      throw new Error(`Approval request ${requestId} is already pending`);
    }

    this.log(`Queuing approval for request ${requestId}`, { method: context.method, origin: context.origin });

    // Store the context
    const approvalContext: ApprovalContext = {
      ...context,
      state: 'awaiting_approval',
      queuedAt: context.queuedAt || Date.now(),
    };
    this.pending.set(requestId, approvalContext);

    // Create the blocking Promise
    const approvalPromise = new Promise<boolean>((resolve, reject) => {
      this.resolvers.set(requestId, { resolve, reject });
    });

    // Set up timeout
    const timeoutMs = timeout ?? this.config.defaultTimeout ?? DEFAULT_TIMEOUT;
    const timeoutHandle = setTimeout(() => {
      this.handleTimeout(requestId);
    }, timeoutMs);
    this.timeouts.set(requestId, timeoutHandle);

    try {
      const approved = await approvalPromise;
      return approved;
    } finally {
      // Cleanup is handled by resolveApproval or handleTimeout
    }
  }

  /**
   * Handle timeout for an approval request.
   */
  private handleTimeout(requestId: string | number): void {
    const context = this.pending.get(requestId);
    const resolver = this.resolvers.get(requestId);

    if (context && resolver) {
      this.log(`Request ${requestId} timed out`);

      // Update state
      context.state = 'denied';

      // Invoke timeout callback if provided
      if (this.config.onTimeout) {
        this.config.onTimeout(context);
      }

      // Reject the promise
      resolver.reject(new Error(`Approval request ${requestId} timed out`));

      // Cleanup
      this.cleanup(requestId);
    }
  }

  /**
   * Resolve an approval request with the user's decision.
   *
   * This unblocks the Promise returned by `queueApproval()` for this request.
   *
   * @param requestId - The unique request ID to resolve
   * @param approved - true if user approved, false if denied
   * @returns true if the approval was found and resolved, false otherwise
   */
  resolveApproval(requestId: string | number, approved: boolean): boolean {
    const context = this.pending.get(requestId);
    const resolver = this.resolvers.get(requestId);

    if (!context || !resolver) {
      this.log(`No pending approval found for request ${requestId}`);
      return false;
    }

    this.log(`Resolving approval for request ${requestId}: ${approved ? 'APPROVED' : 'DENIED'}`);

    // Update state
    context.state = approved ? 'approved' : 'denied';

    // Resolve the Promise (unblock the request)
    resolver.resolve(approved);

    // Cleanup
    this.cleanup(requestId);

    return true;
  }

  /**
   * Get a pending approval context by request ID.
   *
   * @param requestId - The request ID to look up
   * @returns The approval context if found, undefined otherwise
   */
  getPending(requestId: string | number): ApprovalContext | undefined {
    return this.pending.get(requestId);
  }

  /**
   * Get all pending approval contexts.
   *
   * @returns Array of all pending approval contexts
   */
  getAllPending(): ApprovalContext[] {
    return Array.from(this.pending.values());
  }

  /**
   * Get the count of pending approvals.
   *
   * @returns Number of pending approval requests
   */
  getPendingCount(): number {
    return this.pending.size;
  }

  /**
   * Check if there is a pending approval for a request ID.
   *
   * @param requestId - The request ID to check
   * @returns true if there is a pending approval
   */
  hasPending(requestId: string | number): boolean {
    return this.pending.has(requestId);
  }

  /**
   * Clean up resources for a specific request ID.
   *
   * @param requestId - The request ID to clean up
   */
  cleanup(requestId: string | number): void {
    this.log(`Cleaning up request ${requestId}`);

    // Clear timeout
    const timeout = this.timeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(requestId);
    }

    // Remove from maps
    this.pending.delete(requestId);
    this.resolvers.delete(requestId);
  }

  /**
   * Clean up all pending approvals.
   * This will reject all pending Promises.
   */
  cleanupAll(): void {
    this.log('Cleaning up all pending approvals');

    for (const resolver of this.resolvers.values()) {
      resolver.reject(new Error('Approval queue was cleared'));
    }

    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }

    this.pending.clear();
    this.resolvers.clear();
    this.timeouts.clear();
  }
}
