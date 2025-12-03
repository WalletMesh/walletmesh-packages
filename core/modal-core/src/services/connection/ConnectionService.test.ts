/**
 * ConnectionService Tests
 *
 * Demonstrates service testing with lifecycle-based organization:
 * - Connection Lifecycle Management (validation, establishment, progress)
 * - Disconnection Management (safety validation, forced disconnection)
 * - Error Handling & Recovery (retry logic, error conditions)
 * - Utility Functions (variable extraction, reason generation)
 *
 * @group unit
 * @group services
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectionStatus } from '../../api/types/connectionStatus.js';
import { createMockLogger, createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import type { HealthService } from '../health/HealthService.js';
import type { WalletPreferenceService } from '../preferences/WalletPreferenceService.js';
import type { SessionInfo, SessionMetadata } from '../session/SessionService.js';
import type { SessionService } from '../session/SessionService.js';
import type { UIService } from '../ui/UiService.js';
import type { ConnectionServiceDependencies } from './ConnectionService.js';
import { ConnectionService } from './ConnectionService.js';
import type { ConnectOptions } from './ConnectionService.js';

// Install domain-specific matchers
installCustomMatchers();

// Create mock dependencies for ConnectionService
const mockDependencies: ConnectionServiceDependencies = {
  logger: createMockLogger(),
  sessionService: {
    createSession: vi.fn().mockResolvedValue(null),
    getActiveSession: vi.fn().mockReturnValue(null),
    getSession: vi.fn().mockReturnValue(null),
    updateSession: vi.fn().mockReturnValue(false),
    deleteSession: vi.fn(),
    validateSession: vi.fn().mockReturnValue({ valid: true }),
  } satisfies Partial<SessionService>,
  healthService: {
    checkHealth: vi.fn().mockResolvedValue({}),
    analyzeError: vi.fn().mockReturnValue({ recoverable: false, suggestedStrategy: 'retry' }),
    startRecovery: vi.fn(),
    stopRecovery: vi.fn(),
    recordRecoveryAttempt: vi.fn(),
    resetMetrics: vi.fn(),
  } satisfies Partial<HealthService>,
  uiService: {
    setLoading: vi.fn(),
    navigateToView: vi.fn(),
    setSelectedWallet: vi.fn(),
    setError: vi.fn(),
    setConnectionProgress: vi.fn(),
  } satisfies Partial<UIService>,
  preferenceService: {
    getPreferredWallet: vi.fn().mockReturnValue(null),
    addToHistory: vi.fn(),
  } satisfies Partial<WalletPreferenceService>,
};

// Helper function to create test SessionInfo objects
function createTestSessionInfo(overrides: {
  sessionId: string;
  walletId: string;
  address?: string;
  chainId?: string;
  metadata?: SessionMetadata;
}): SessionInfo {
  const address = overrides.address || '0x1234567890123456789012345678901234567890';
  return {
    id: overrides.sessionId,
    walletId: overrides.walletId,
    status: ConnectionStatus.Connected,
    account: address,
    chainId: overrides.chainId || '1',
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    metadata: overrides.metadata,
  };
}

describe('ConnectionService', () => {
  let service: ConnectionService;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
    service = new ConnectionService(mockDependencies);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Connection Lifecycle Management', () => {
    describe('Connection parameter validation', () => {
      it('should allow connection with wallet ID', () => {
        const result = service.validateConnectionParams('evm-wallet-1');

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow connection without wallet ID when modal not disabled', () => {
        const result = service.validateConnectionParams(undefined, { showModal: true });

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow connection without options (modal enabled by default)', () => {
        const result = service.validateConnectionParams();

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject connection without wallet ID when modal disabled', () => {
        const result = service.validateConnectionParams(undefined, { showModal: false });

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('No wallet specified and modal disabled');
      });

      it('should accept additional connection options', () => {
        const options: ConnectOptions = {
          chainId: 'eip155:1',
          showModal: true,
          onProgress: () => {},
        };

        const result = service.validateConnectionParams('metamask', options);

        expect(result.isValid).toBe(true);
      });
    });

    describe('Connection establishment validation', () => {
      it('should validate successful connection result', () => {
        const result = {
          walletId: 'metamask',
          address: '0x123...',
          chainId: 'eip155:1',
        };

        const validation = service.validateConnectionEstablished(result);

        expect(validation.isValid).toBe(true);
        expect(validation.error).toBeUndefined();
      });

      it('should validate connection result with expected wallet', () => {
        const result = {
          walletId: 'metamask',
          address: '0x123...',
          chainId: 'eip155:1',
        };

        const validation = service.validateConnectionEstablished(result, 'metamask');

        expect(validation.isValid).toBe(true);
      });

      it('should reject null result', () => {
        const validation = service.validateConnectionEstablished(null);

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Invalid connection result');
      });

      it('should reject non-object result', () => {
        const validation = service.validateConnectionEstablished('invalid');

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Invalid connection result');
      });

      it('should reject result missing walletId', () => {
        const result = {
          address: '0x123...',
          chainId: 'eip155:1',
        };

        const validation = service.validateConnectionEstablished(result);

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Connection result missing required fields');
      });

      it('should reject result missing address', () => {
        const result = {
          walletId: 'metamask',
          chainId: 'eip155:1',
        };

        const validation = service.validateConnectionEstablished(result);

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Connection result missing required fields');
      });

      it('should reject unexpected wallet ID', () => {
        const result = {
          walletId: 'coinbase',
          address: '0x123...',
          chainId: 'eip155:1',
        };

        const validation = service.validateConnectionEstablished(result, 'metamask');

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe('Expected connection to metamask, but connected to coinbase');
      });
    });

    describe('Connection progress tracking', () => {
      it('should generate initializing progress', () => {
        const progress = service.generateConnectionProgress('initializing');

        expect(progress).toEqual({
          progress: 0,
          step: 'Initializing',
        });
      });

      it('should generate connecting progress with wallet ID', () => {
        const progress = service.generateConnectionProgress('connecting', 'metamask');

        expect(progress).toEqual({
          progress: 25,
          step: 'Connecting to wallet',
          details: 'metamask',
        });
      });

      it('should generate connected progress', () => {
        const progress = service.generateConnectionProgress('connected');

        expect(progress).toEqual({
          progress: 100,
          step: 'Connected',
        });
      });

      it('should generate failed progress with details', () => {
        const progress = service.generateConnectionProgress('failed', undefined, 'Network error');

        expect(progress).toEqual({
          progress: 0,
          step: 'Failed',
          details: 'Network error',
        });
      });

      it('should include details when provided', () => {
        const progress = service.generateConnectionProgress('initializing', undefined, 'Custom details');

        expect(progress).toEqual({
          progress: 0,
          step: 'Initializing',
          details: 'Custom details',
        });
      });
    });

    describe('Wallet availability validation', () => {
      it('should validate available wallet', () => {
        const wallets = new Map([
          ['metamask', { id: 'metamask', name: 'MetaMask' }],
          ['coinbase', { id: 'coinbase', name: 'Coinbase' }],
        ]);

        const result = service.validateWalletAvailability('metamask', wallets);

        expect(result.isValid).toBe(true);
      });

      it('should reject unavailable wallet', () => {
        const wallets = new Map([
          ['metamask', { id: 'metamask', name: 'MetaMask' }],
          ['coinbase', { id: 'coinbase', name: 'Coinbase' }],
        ]);

        const result = service.validateWalletAvailability('phantom', wallets);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Wallet 'phantom' is not available");
        expect(result.error).toContain('Available wallets: metamask, coinbase');
      });

      it('should handle empty wallet list', () => {
        const wallets = new Map();

        const result = service.validateWalletAvailability('metamask', wallets);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Available wallets: ');
      });
    });
  });

  describe('Disconnection Management', () => {
    describe('Disconnection safety validation', () => {
      it('should allow disconnection when no sessions exist', () => {
        const sessions = new Map<string, SessionInfo>();

        const result = service.validateDisconnectionSafety(sessions);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should allow disconnection when no pending transactions', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            {
              id: 'session1',
              walletId: 'wallet1',
              status: ConnectionStatus.Connected,
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [] } },
            },
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions);

        expect(result.isValid).toBe(true);
      });

      it('should block disconnection when pending transactions exist', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            createTestSessionInfo({
              sessionId: 'session1',
              walletId: 'wallet1',
              address: '0x123',
              metadata: { custom: { pendingTransactions: [{ id: 'tx1' }, { id: 'tx2' }] } },
            }),
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Cannot disconnect all wallets: pending transactions in wallet1');
        expect(result.error).toContain('Use force option to override');
        expect(result.pendingTransactions).toBe(2);
      });

      it('should block specific wallet disconnection when it has pending transactions', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            {
              id: 'session1',
              walletId: 'wallet1',
              status: ConnectionStatus.Connected,
              account: '0x123',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [{ id: 'tx1' }] } },
            },
          ],
          [
            'wallet2',
            {
              id: 'session2',
              walletId: 'wallet2',
              status: ConnectionStatus.Connected,
              account: '0x456',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [] } },
            },
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions, 'wallet1');

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Cannot disconnect wallet1: 1 pending transactions');
        expect(result.pendingTransactions).toBe(1);
      });

      it('should allow specific wallet disconnection when other wallets have pending transactions', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            {
              id: 'session1',
              walletId: 'wallet1',
              status: ConnectionStatus.Connected,
              account: '0x123',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [{ id: 'tx1' }] } },
            },
          ],
          [
            'wallet2',
            {
              id: 'session2',
              walletId: 'wallet2',
              status: ConnectionStatus.Connected,
              account: '0x456',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [] } },
            },
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions, 'wallet2');

        expect(result.isValid).toBe(true);
      });

      it('should handle multiple wallets with pending transactions', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            {
              id: 'session1',
              walletId: 'wallet1',
              status: ConnectionStatus.Connected,
              account: '0x123',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [{ id: 'tx1' }] } },
            },
          ],
          [
            'wallet2',
            {
              id: 'session2',
              walletId: 'wallet2',
              status: ConnectionStatus.Connected,
              account: '0x456',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [{ id: 'tx2' }, { id: 'tx3' }] } },
            },
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('wallet1, wallet2');
        expect(result.pendingTransactions).toBe(3);
      });
    });

    describe('Forced disconnection handling', () => {
      it('should allow disconnection when force option is true', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            {
              id: 'session1',
              walletId: 'wallet1',
              status: ConnectionStatus.Connected,
              account: '0x123',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              metadata: { custom: { pendingTransactions: [{ id: 'tx1' }, { id: 'tx2' }] } },
            },
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions, undefined, { force: true });

        expect(result.isValid).toBe(true);
      });
    });

    describe('Edge cases in disconnection', () => {
      it('should handle sessions without metadata', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            {
              id: 'session1',
              walletId: 'wallet1',
              status: ConnectionStatus.Connected,
              account: '0x123',
              chainId: 'eip155:1',
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              // No metadata property
            },
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions);

        expect(result.isValid).toBe(true);
      });

      it('should handle sessions with non-array pending transactions', () => {
        const sessions = new Map<string, SessionInfo>([
          [
            'wallet1',
            createTestSessionInfo({
              sessionId: 'session1',
              walletId: 'wallet1',
              address: '0x123',
              metadata: { custom: { pendingTransactions: 'invalid-tx' as unknown } },
            }),
          ],
        ]);

        const result = service.validateDisconnectionSafety(sessions);

        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Error Handling & Recovery', () => {
    describe('Retry delay calculation', () => {
      it('should calculate exponential backoff delay', () => {
        expect(service.calculateRetryDelay(0)).toBeGreaterThanOrEqual(1000);
        expect(service.calculateRetryDelay(0)).toBeLessThan(1200); // With jitter

        expect(service.calculateRetryDelay(1)).toBeGreaterThanOrEqual(2000);
        expect(service.calculateRetryDelay(1)).toBeLessThan(2400);

        expect(service.calculateRetryDelay(2)).toBeGreaterThanOrEqual(4000);
        expect(service.calculateRetryDelay(2)).toBeLessThan(4800);
      });

      it('should respect maximum delay', () => {
        const delay = service.calculateRetryDelay(10, 1000, 5000);
        expect(delay).toBeLessThan(5500); // Max + jitter
      });

      it('should use custom base delay', () => {
        const delay = service.calculateRetryDelay(0, 500);
        expect(delay).toBeGreaterThanOrEqual(500);
        expect(delay).toBeLessThan(600);
      });
    });

    describe('Retry condition validation', () => {
      it('should allow retry for network errors', () => {
        const error = new Error('Network timeout');
        const result = service.validateRetryConditions(error, 1);

        expect(result.isValid).toBe(true);
      });

      it('should allow retry for generic errors under max attempts', () => {
        const error = new Error('Something went wrong');
        const result = service.validateRetryConditions(error, 2, 3);

        expect(result.isValid).toBe(true);
      });

      it('should block retry when max attempts exceeded', () => {
        const error = new Error('Network error');
        const result = service.validateRetryConditions(error, 3, 3);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Max retry attempts (3) exceeded');
      });

      it('should use default max attempts', () => {
        const error = new Error('Network error');
        const result = service.validateRetryConditions(error, 3);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Max retry attempts (3) exceeded');
      });
    });

    describe('Non-retryable error conditions', () => {
      it('should block retry for user rejection errors', () => {
        const rejectionErrors = [
          new Error('User rejected the request'),
          new Error('User denied permission'),
          new Error('Transaction was rejected'),
        ];

        for (const error of rejectionErrors) {
          const result = service.validateRetryConditions(error, 1);
          expect(result.isValid).toBe(false);
          expect(result.error).toBe('User rejected connection - not retrying');
        }
      });

      it('should block retry for wallet unavailable errors', () => {
        const unavailableErrors = [
          new Error('Wallet not available'),
          new Error('MetaMask not installed'),
          new Error('Wallet not found'),
        ];

        for (const error of unavailableErrors) {
          const result = service.validateRetryConditions(error, 1);
          expect(result.isValid).toBe(false);
          expect(result.error).toBe('Wallet not available - not retrying');
        }
      });
    });
  });

  describe('Utility Functions', () => {
    describe('Connection variable extraction', () => {
      it('should return undefined when not connecting', () => {
        const variables = service.extractConnectionVariables(false, 'metamask', 'eip155:1');
        expect(variables).toBeUndefined();
      });

      it('should return undefined when no active wallet', () => {
        const variables = service.extractConnectionVariables(true, null, 'eip155:1');
        expect(variables).toBeUndefined();
      });

      it('should extract variables when connecting', () => {
        const variables = service.extractConnectionVariables(true, 'metamask', 'eip155:1');

        expect(variables).toEqual({
          walletId: 'metamask',
          chain: 'eip155:1',
        });
      });

      it('should extract variables without chain ID', () => {
        const variables = service.extractConnectionVariables(true, 'metamask');

        expect(variables).toEqual({
          walletId: 'metamask',
        });
      });
    });

    describe('Disconnection reason generation', () => {
      it('should generate user disconnection reason', () => {
        const reason = service.generateDisconnectionReason('user');
        expect(reason).toBe('User initiated disconnection');
      });

      it('should generate error disconnection reason', () => {
        const reason = service.generateDisconnectionReason('error');
        expect(reason).toBe('Disconnected due to error');
      });

      it('should generate timeout disconnection reason', () => {
        const reason = service.generateDisconnectionReason('timeout');
        expect(reason).toBe('Disconnected due to timeout');
      });

      it('should generate forced disconnection reason', () => {
        const reason = service.generateDisconnectionReason('forced');
        expect(reason).toBe('Forced disconnection');
      });

      it('should include details when provided', () => {
        const reason = service.generateDisconnectionReason('error', 'Network connection lost');
        expect(reason).toBe('Disconnected due to error: Network connection lost');
      });

      it('should handle all disconnection types with details', () => {
        const types = ['user', 'error', 'timeout', 'forced'] as const;

        for (const type of types) {
          const reason = service.generateDisconnectionReason(type, 'Custom details');
          expect(reason).toContain('Custom details');
        }
      });
    });
  });
});
