/**
 * Connection service for WalletMesh
 *
 * Handles wallet connection and disconnection lifecycle.
 * Simplified version that delegates to specialized services.
 *
 * @module services/connection/ConnectionService
 * @category Services
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import type { SessionCreationContext, SessionService } from '../session/SessionService.js';
import type { SessionInfo } from '../session/SessionService.js';
export type { SessionInfo } from '../session/SessionService.js';
import { ConnectionStatus } from '../../api/types/connectionStatus.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { ChainType, WalletInfo } from '../../types.js';
import type { ErrorAnalysis, HealthService } from '../health/HealthService.js';
import type { WalletPreferenceService } from '../preferences/WalletPreferenceService.js';
import type { UIService } from '../ui/UiService.js';

/**
 * Connection arguments
 */
export interface ConnectArgs {
  /** Wallet ID to connect */
  walletId: string;
  /** Chain type to connect to */
  chainType?: ChainType;
  /** Chain ID to connect to */
  chainId?: string;
}

/**
 * Connection options
 */
export interface ConnectOptions extends ConnectArgs {
  /** Force new connection even if already connected */
  force?: boolean;
  /** Silent connection (no UI feedback) */
  silent?: boolean;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Auto-retry on failure */
  autoRetry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * Disconnection options
 */
export interface DisconnectOptions {
  /** Reason for disconnection */
  reason?: string;
  /** Whether to clear session data */
  clearSession?: boolean;
  /** Silent disconnection (no UI feedback) */
  silent?: boolean;
}

/**
 * Connection progress
 */
export interface ConnectionProgress {
  /** Current step */
  step: 'initializing' | 'connecting' | 'authenticating' | 'finalizing';
  /** Progress percentage (0-100) */
  percentage: number;
  /** Progress message */
  message: string;
}

/**
 * Connection validation result
 */
export interface ConnectionValidation {
  /** Whether validation passed */
  valid: boolean;
  /** Validation error if failed */
  error?: string;
  /** Suggested action */
  suggestedAction?: string;
}

/**
 * Connection service result
 */
export interface ConnectionServiceResult {
  /** Whether operation succeeded */
  success: boolean;
  /** Session info if successful */
  session?: SessionInfo;
  /** Error if failed */
  error?: Error;
  /** Recovery attempts made */
  recoveryAttempts?: number;
}

/**
 * Connection configuration
 */
export interface ConnectionConfig {
  /** Default connection timeout */
  defaultTimeout?: number;
  /** Enable auto-retry */
  enableAutoRetry?: boolean;
  /** Default max retries */
  defaultMaxRetries?: number;
  /** Enable auto-connect */
  enableAutoConnect?: boolean;
  /** Retry delay in milliseconds */
  retryDelay?: number;
}

/**
 * Connection service dependencies
 */
export interface ConnectionServiceDependencies extends BaseServiceDependencies {
  logger: Logger;
  sessionService: SessionService;
  healthService: HealthService;
  uiService: UIService;
  preferenceService: WalletPreferenceService;
}

/**
 * Connection service for managing wallet connections
 *
 * Handles the connection lifecycle and coordinates with other services.
 */
export class ConnectionService {
  private logger: Logger;
  private sessionService: SessionService;
  private healthService: HealthService;
  private uiService: UIService;
  private preferenceService: WalletPreferenceService;
  private config: ConnectionConfig;
  private connectionInProgress = false;

  constructor(dependencies: ConnectionServiceDependencies, config: ConnectionConfig = {}) {
    this.logger = dependencies.logger;
    this.sessionService = dependencies.sessionService;
    this.healthService = dependencies.healthService;
    this.uiService = dependencies.uiService;
    this.preferenceService = dependencies.preferenceService;

    this.config = {
      defaultTimeout: 30000, // 30 seconds
      enableAutoRetry: true,
      defaultMaxRetries: 3,
      enableAutoConnect: true,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Connect to a wallet
   */
  async connect(options: ConnectOptions): Promise<ConnectionServiceResult> {
    const { walletId, chainType, chainId, force = false, silent = false } = options;

    // Check if already connecting
    if (this.connectionInProgress && !force) {
      return {
        success: false,
        error: ErrorFactory.connectionFailed('Connection already in progress'),
      };
    }

    // Validate connection parameters
    const validation = this.validateConnectionParamsInternal(walletId, options);
    if (!validation.valid) {
      return {
        success: false,
        error: ErrorFactory.connectionFailed(validation.error || 'Invalid connection parameters'),
      };
    }

    // Get current session
    const activeSession = this.sessionService.getActiveSession();
    if (activeSession && !force) {
      this.logger.info('Already connected', { walletId: activeSession.walletId });
      return {
        success: true,
        session: activeSession,
      };
    }

    this.connectionInProgress = true;

    // Update UI state
    if (!silent) {
      this.uiService.setLoading(true, 'Connecting to wallet...');
      this.uiService.navigateToView('connecting');
    }

    try {
      // Start connection progress
      this.updateProgress('initializing', 10, 'Initializing connection...');

      // TODO: Actual wallet connection would happen here
      // This would involve using the wallet adapter/provider system
      // For now, we'll simulate a connection
      await this.simulateConnection(walletId);

      this.updateProgress('connecting', 40, 'Establishing connection...');

      // Create mock wallet info for now
      const walletInfo: WalletInfo = {
        id: walletId,
        name: walletId,
        icon: '',
        chains: chainType ? [chainType] : [],
      };

      // Create mock account
      const account = '0x1234567890123456789012345678901234567890';

      this.updateProgress('authenticating', 70, 'Authenticating...');

      // Create session
      const sessionContext: SessionCreationContext = {
        wallet: walletInfo,
        account,
        ...(chainId !== undefined && { chainId }),
      };

      const session = await this.sessionService.createSession(sessionContext);
      if (!session) {
        throw ErrorFactory.connectionFailed('Failed to create session');
      }

      this.updateProgress('finalizing', 90, 'Finalizing connection...');

      // Add to preference history
      this.preferenceService.addToHistory(walletId, walletInfo);

      // Update UI state
      if (!silent) {
        this.uiService.setLoading(false);
        this.uiService.navigateToView('connected');
        this.uiService.setSelectedWallet(walletInfo);
      }

      this.updateProgress('finalizing', 100, 'Connected successfully');

      this.logger.info('Connection successful', { walletId, sessionId: session.id });

      return {
        success: true,
        session,
      };
    } catch (error) {
      this.logger.error('Connection failed', error);

      // Analyze error for recovery
      const errorAnalysis = this.healthService.analyzeError(error as Error);

      // Attempt recovery if configured
      if (this.config.enableAutoRetry && errorAnalysis.recoverable) {
        const recoveryResult = await this.attemptRecovery(walletId, options, errorAnalysis);
        if (recoveryResult.success) {
          return recoveryResult;
        }
      }

      // Update UI state
      if (!silent) {
        this.uiService.setLoading(false);
        this.uiService.setError((error as Error).message);
        this.uiService.navigateToView('error');
      }

      return {
        success: false,
        error: error as Error,
      };
    } finally {
      this.connectionInProgress = false;
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(options: DisconnectOptions = {}): Promise<ConnectionServiceResult> {
    const { reason = 'User initiated', clearSession = true, silent = false } = options;

    const activeSession = this.sessionService.getActiveSession();
    if (!activeSession) {
      this.logger.info('No active session to disconnect');
      return {
        success: true,
      };
    }

    try {
      // Update UI state
      if (!silent) {
        this.uiService.setLoading(true, 'Disconnecting...');
      }

      // TODO: Actual wallet disconnection would happen here
      // This would involve cleaning up the provider/adapter
      await this.simulateDisconnection();

      // Clear session
      if (clearSession) {
        this.sessionService.deleteSession(activeSession.id);
      } else {
        // Just update status
        this.sessionService.updateSession(activeSession.id, {
          status: ConnectionStatus.Disconnected,
        });
      }

      // Reset health metrics
      this.healthService.resetMetrics();

      // Update UI state
      if (!silent) {
        this.uiService.setLoading(false);
        this.uiService.navigateToView('wallet-selection');
        this.uiService.setSelectedWallet(undefined);
      }

      this.logger.info('Disconnection successful', { reason });

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('Disconnection failed', error);

      // Update UI state
      if (!silent) {
        this.uiService.setLoading(false);
        this.uiService.setError((error as Error).message);
      }

      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Reconnect to wallet
   */
  async reconnect(options: Partial<ConnectOptions> = {}): Promise<ConnectionServiceResult> {
    const activeSession = this.sessionService.getActiveSession();
    if (!activeSession) {
      return {
        success: false,
        error: ErrorFactory.connectionFailed('No session to reconnect'),
      };
    }

    // Disconnect first
    await this.disconnect({ silent: true, clearSession: false });

    // Reconnect with same wallet
    return this.connect({
      walletId: activeSession.walletId,
      ...(activeSession.chainId !== undefined && { chainId: activeSession.chainId }),
      force: true,
      ...options,
    });
  }

  /**
   * Switch account
   */
  async switchAccount(account: string): Promise<ConnectionServiceResult> {
    const activeSession = this.sessionService.getActiveSession();
    if (!activeSession) {
      return {
        success: false,
        error: ErrorFactory.connectionFailed('No active session'),
      };
    }

    try {
      // TODO: Actual account switching would happen here
      // This would involve requesting account change from the wallet

      // Update session
      const updated = this.sessionService.updateSession(activeSession.id, {
        account,
      });

      if (!updated) {
        throw ErrorFactory.connectionFailed('Failed to update session');
      }

      this.logger.info('Account switched', { account });

      const updatedSession = this.sessionService.getSession(activeSession.id);
      return {
        success: true,
        ...(updatedSession && { session: updatedSession }),
      };
    } catch (error) {
      this.logger.error('Account switch failed', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Validate connection parameters (internal)
   */
  private validateConnectionParamsInternal(
    walletId?: string,
    _options?: ConnectOptions,
  ): ConnectionValidation {
    if (!walletId) {
      return {
        valid: false,
        error: 'Wallet ID is required',
      };
    }

    // Additional validation can be added here
    // - Check if wallet is supported
    // - Check if chain is supported
    // - Check network availability

    return { valid: true };
  }

  /**
   * Attempt recovery after connection failure
   */
  private async attemptRecovery(
    _walletId: string,
    options: ConnectOptions,
    analysis: ErrorAnalysis,
  ): Promise<ConnectionServiceResult> {
    const maxRetries = options.maxRetries || this.config.defaultMaxRetries || 3;
    let attemptCount = 0;

    this.healthService.startRecovery();

    while (attemptCount < maxRetries) {
      attemptCount++;

      this.logger.info('Attempting recovery', {
        attempt: attemptCount,
        strategy: analysis.suggestedStrategy,
      });

      // Wait before retry
      const delay = analysis.retryDelay || this.config.retryDelay || 1000;
      await this.delay(delay);

      // Record attempt start
      const attemptStart = Date.now();

      try {
        // Try to reconnect based on strategy
        let result: ConnectionServiceResult;

        switch (analysis.suggestedStrategy) {
          case 'retry':
            result = await this.connect({ ...options, autoRetry: false });
            break;

          case 'reconnect':
            await this.disconnect({ silent: true });
            result = await this.connect({ ...options, force: true, autoRetry: false });
            break;

          default:
            result = await this.connect({ ...options, autoRetry: false });
        }

        if (result.success) {
          this.healthService.recordRecoveryAttempt(
            analysis.suggestedStrategy,
            true,
            undefined,
            Date.now() - attemptStart,
          );
          this.healthService.stopRecovery();
          return { ...result, recoveryAttempts: attemptCount };
        }
      } catch (error) {
        this.healthService.recordRecoveryAttempt(
          analysis.suggestedStrategy,
          false,
          error as Error,
          Date.now() - attemptStart,
        );
      }
    }

    this.healthService.stopRecovery();
    return {
      success: false,
      error: ErrorFactory.connectionFailed(`Recovery failed after ${attemptCount} attempts`),
      recoveryAttempts: attemptCount,
    };
  }

  /**
   * Update connection progress
   */
  private updateProgress(step: ConnectionProgress['step'], percentage: number, message: string): void {
    this.uiService.setConnectionProgress(percentage);
    this.logger.debug('Connection progress', { step, percentage, message });
  }

  /**
   * Simulate connection (temporary)
   */
  private async simulateConnection(walletId: string): Promise<void> {
    // Simulate async connection
    await this.delay(1000);
    this.logger.debug('Simulated connection to', walletId);
  }

  /**
   * Simulate disconnection (temporary)
   */
  private async simulateDisconnection(): Promise<void> {
    // Simulate async disconnection
    await this.delay(500);
    this.logger.debug('Simulated disconnection');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    const activeSession = this.sessionService.getActiveSession();
    if (!activeSession) {
      return ConnectionStatus.Disconnected;
    }
    return activeSession.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.getConnectionStatus() === ConnectionStatus.Connected;
  }

  /**
   * Get active session
   */
  getActiveSession(): SessionInfo | null {
    return this.sessionService.getActiveSession();
  }

  /**
   * Auto-connect to preferred wallet
   */
  async autoConnect(): Promise<ConnectionServiceResult> {
    if (!this.config.enableAutoConnect) {
      return {
        success: false,
        error: ErrorFactory.connectionFailed('Auto-connect is disabled'),
      };
    }

    const preferredWallet = this.preferenceService.getPreferredWallet();
    if (!preferredWallet) {
      return {
        success: false,
        error: ErrorFactory.connectionFailed('No preferred wallet for auto-connect'),
      };
    }

    this.logger.info('Auto-connecting to preferred wallet', { walletId: preferredWallet });

    return this.connect({
      walletId: preferredWallet,
      silent: true,
    });
  }

  // === Additional utility methods expected by tests ===

  /**
   * Validate connection parameters (test-compatible version)
   */
  validateConnectionParams(
    walletId?: string,
    options?: ConnectOptions & { showModal?: boolean },
  ): { isValid: boolean; error?: string } {
    // If no wallet ID is provided, check if modal is disabled
    if (!walletId) {
      // If modal is explicitly disabled, reject
      if (options && options.showModal === false) {
        return { isValid: false, error: 'No wallet specified and modal disabled' };
      }
      // Otherwise, allow (modal enabled by default)
      return { isValid: true };
    }
    return { isValid: true };
  }

  /**
   * Generate connection progress information
   */
  generateConnectionProgress(
    step: string,
    walletId?: string,
    details?: string,
  ): {
    progress: number;
    step: string;
    details?: string;
  } {
    const progressMap: Record<string, number> = {
      initializing: 0,
      connecting: 25,
      authenticating: 50,
      finalizing: 75,
      connected: 100,
      failed: 0,
    };

    const stepMap: Record<string, string> = {
      initializing: 'Initializing',
      connecting: 'Connecting to wallet',
      authenticating: 'Authenticating',
      finalizing: 'Finalizing',
      connected: 'Connected',
      failed: 'Failed',
    };

    const result: { progress: number; step: string; details?: string } = {
      progress: progressMap[step] || 0,
      step: stepMap[step] || step,
    };

    if (details) {
      result.details = details;
    } else if (walletId && step === 'connecting') {
      result.details = walletId;
    }

    return result;
  }

  /**
   * Validate wallet availability
   */
  validateWalletAvailability(
    walletId: string,
    wallets: Map<string, unknown>,
  ): {
    isValid: boolean;
    error?: string;
  } {
    if (wallets.has(walletId)) {
      return { isValid: true };
    }

    const availableWallets = Array.from(wallets.keys()).join(', ');
    return {
      isValid: false,
      error: `Wallet '${walletId}' is not available. Available wallets: ${availableWallets}`,
    };
  }

  /**
   * Validate connection establishment result
   */
  validateConnectionEstablished(
    result: unknown,
    expectedWalletId?: string,
  ): {
    isValid: boolean;
    error?: string;
  } {
    if (!result || typeof result !== 'object') {
      return { isValid: false, error: 'Invalid connection result' };
    }

    const connResult = result as Record<string, unknown>;
    if (!connResult['walletId'] || !connResult['address']) {
      return { isValid: false, error: 'Connection result missing required fields' };
    }

    if (expectedWalletId && connResult['walletId'] !== expectedWalletId) {
      return {
        isValid: false,
        error: `Expected connection to ${expectedWalletId}, but connected to ${connResult['walletId']}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
    const exponentialDelay = baseDelay * 2 ** attempt;
    const withJitter = exponentialDelay + Math.random() * (exponentialDelay * 0.2);
    return Math.min(withJitter, maxDelay);
  }

  /**
   * Validate retry conditions
   */
  validateRetryConditions(
    error: Error,
    attemptCount: number,
    maxAttempts = 3,
  ): { isValid: boolean; error?: string } {
    if (attemptCount >= maxAttempts) {
      return { isValid: false, error: `Max retry attempts (${maxAttempts}) exceeded` };
    }

    const errorMessage = error.message.toLowerCase();

    // Check for user rejection patterns
    const userRejectionPatterns = ['user rejected', 'user denied', 'transaction was rejected'];

    for (const pattern of userRejectionPatterns) {
      if (errorMessage.includes(pattern)) {
        return { isValid: false, error: 'User rejected connection - not retrying' };
      }
    }

    // Check for wallet unavailable patterns
    const unavailablePatterns = ['wallet not available', 'not installed', 'wallet not found'];

    for (const pattern of unavailablePatterns) {
      if (errorMessage.includes(pattern)) {
        return { isValid: false, error: 'Wallet not available - not retrying' };
      }
    }

    return { isValid: true };
  }

  /**
   * Extract connection variables for UI
   */
  extractConnectionVariables(
    isConnecting: boolean,
    walletId: string | null,
    chainId?: string,
  ): { walletId: string; chain?: string } | undefined {
    if (!isConnecting || !walletId) {
      return undefined;
    }

    const result: { walletId: string; chain?: string } = { walletId };
    if (chainId) {
      result.chain = chainId;
    }

    return result;
  }

  /**
   * Generate disconnection reason
   */
  generateDisconnectionReason(type: string, details?: string): string {
    const reasonMap: Record<string, string> = {
      user: 'User initiated disconnection',
      error: 'Disconnected due to error',
      timeout: 'Disconnected due to timeout',
      forced: 'Forced disconnection',
    };

    const baseReason = reasonMap[type] || 'Disconnected';
    return details ? `${baseReason}: ${details}` : baseReason;
  }

  /**
   * Validate disconnection safety
   */
  validateDisconnectionSafety(
    sessions: Map<string, SessionInfo>,
    targetWalletId?: string,
    options?: { force?: boolean },
  ): { isValid: boolean; error?: string; pendingTransactions?: number } {
    if (options?.force) {
      return { isValid: true };
    }

    let totalPendingTransactions = 0;
    const walletsWithPending: string[] = [];

    for (const [walletId, session] of sessions.entries()) {
      // Skip if we're only checking a specific wallet and this isn't it
      if (targetWalletId && walletId !== targetWalletId) {
        continue;
      }

      // Check for pending transactions
      const pendingTx = Array.isArray(session.metadata?.custom?.['pendingTransactions'])
        ? (session.metadata.custom['pendingTransactions'] as unknown[]).length
        : 0;

      if (pendingTx > 0) {
        totalPendingTransactions += pendingTx;
        walletsWithPending.push(walletId);
      }
    }

    if (totalPendingTransactions > 0) {
      const walletList = walletsWithPending.join(', ');
      const errorMessage = targetWalletId
        ? `Cannot disconnect ${targetWalletId}: ${totalPendingTransactions} pending transactions`
        : `Cannot disconnect all wallets: pending transactions in ${walletList}. Use force option to override`;

      return {
        isValid: false,
        error: errorMessage,
        pendingTransactions: totalPendingTransactions,
      };
    }

    return { isValid: true };
  }
}
