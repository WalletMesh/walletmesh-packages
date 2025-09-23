import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ChainSessionInfo,
  CreateSessionParams,
  SessionState,
  SessionStatus,
} from '../../api/types/sessionState.js';
import {
  createMockEvmProvider,
  createMockSolanaProvider,
  createTestEnvironment,
  installCustomMatchers,
} from '../../testing/index.js';
import { ChainType } from '../../types.js';
import { SessionManager } from './SessionManager.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock provider for testing - uses testing utilities
const createMockProvider = (chainType: ChainType = ChainType.Evm) => {
  if (chainType === ChainType.Evm) {
    return createMockEvmProvider({
      // biome-ignore lint/style/useNamingConvention: EIP-3326 RPC method name
      wallet_switchEthereumChain: null,
      // biome-ignore lint/style/useNamingConvention: EIP-1474 RPC method name
      eth_chainId: '0x1',
    });
  }
  if (chainType === ChainType.Solana) {
    return createMockSolanaProvider();
  }

  // Default to EVM provider
  return createMockEvmProvider();
};

const createMockChainSessionInfo = (
  chainId: string,
  chainType: ChainType = ChainType.Evm,
  name?: string,
): ChainSessionInfo => ({
  chainId,
  chainType,
  name:
    name ||
    (chainId === '0x1'
      ? 'Ethereum Mainnet'
      : chainId === '0x89'
        ? 'Polygon'
        : chainId === 'mainnet-beta'
          ? 'Solana Mainnet'
          : chainId === 'aztec-mainnet'
            ? 'Aztec'
            : 'Test Chain'),
  required: true,
  isNative: true,
});

const createMockSessionParams = (overrides: Partial<CreateSessionParams> = {}): CreateSessionParams => {
  const chainType = overrides.chain?.chainType || ChainType.Evm;
  return {
    walletId: 'test-wallet',
    accounts: [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'Account 1',
        balance: {
          value: '1000000000000000000',
          formatted: '1.0',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    ],
    chain: {
      chainId: '0x1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
      required: true,
      interfaces: ['eip1193'],
      isNative: true,
    },
    provider: createMockProvider(chainType),
    providerMetadata: {
      type: 'injected',
      version: '1.0.0',
      multiChainCapable: true,
      supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
    },
    permissions: {
      methods: ['eth_accounts', 'eth_sendTransaction'],
      events: ['accountsChanged', 'chainChanged'],
    },
    metadata: {
      appName: 'Test App',
      connectedAt: Date.now(),
    },
    ...overrides,
  };
};

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
    sessionManager = new SessionManager();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Session Creation', () => {
    it('should create a new session', async () => {
      const params = createMockSessionParams();

      const session = await sessionManager.createSession(params);

      expect(session).toBeDefined();
      expect(session.walletId).toBe('test-wallet');
      expect(session.accounts.map((acc) => acc.address)).toEqual([
        '0x1234567890123456789012345678901234567890',
      ]);
      expect(session.status).toBe('connected');
      expect(session.chain.chainType).toBe(ChainType.Evm);
      expect(session.sessionId).toMatch(
        /^session_test-wallet_0x1_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should set first session as active', async () => {
      const params = createMockSessionParams();

      const session = await sessionManager.createSession(params);
      const activeSession = sessionManager.getActiveSession();

      expect(activeSession).toBe(session);
    });

    it('should track sessions by wallet', async () => {
      const params = createMockSessionParams();

      await sessionManager.createSession(params);
      const walletSessions = sessionManager.getWalletSessions('test-wallet');

      expect(walletSessions).toHaveLength(1);
      expect(walletSessions[0]?.walletId).toBe('test-wallet');
    });

    it('should create session with proper lifecycle metadata', async () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      const params = createMockSessionParams();
      const session = await sessionManager.createSession(params);

      expect(session.lifecycle.createdAt).toBe(startTime);
      expect(session.lifecycle.lastActiveAt).toBe(startTime);
      expect(session.lifecycle.lastAccessedAt).toBe(startTime);
      expect(session.lifecycle.operationCount).toBe(0);
    });
  });

  describe('Session Retrieval', () => {
    let testSession: SessionState;

    beforeEach(async () => {
      const params = createMockSessionParams();
      testSession = await sessionManager.createSession(params);
    });

    it('should get session by ID', () => {
      const retrieved = sessionManager.getSession(testSession.sessionId);

      expect(retrieved).toBe(testSession);
    });

    it('should update last accessed time when getting session', () => {
      const initialTime = testSession.lifecycle.lastAccessedAt;

      vi.advanceTimersByTime(1000);
      sessionManager.getSession(testSession.sessionId);

      expect(testSession.lifecycle.lastAccessedAt).toBeGreaterThan(initialTime);
    });

    it('should return null for non-existent session', () => {
      const retrieved = sessionManager.getSession('non-existent');

      expect(retrieved).toBeNull();
    });

    it('should get active session', () => {
      const activeSession = sessionManager.getActiveSession();

      expect(activeSession).toBe(testSession);
    });

    it('should return null when no active session', async () => {
      await sessionManager.endSession(testSession.sessionId);
      const activeSession = sessionManager.getActiveSession();

      expect(activeSession).toBeNull();
    });
  });

  describe('Session Status Management', () => {
    let testSession: SessionState;

    beforeEach(async () => {
      const params = createMockSessionParams();
      testSession = await sessionManager.createSession(params);
    });

    it('should update session status', () => {
      sessionManager.updateSessionStatus(testSession.sessionId, 'connecting');

      expect(testSession.status).toBe('connecting');
      expect(testSession.lifecycle.lastActiveAt).toBeGreaterThan(0);
    });

    it('should throw error for non-existent session', () => {
      expect(() => {
        sessionManager.updateSessionStatus('non-existent', 'connecting');
      }).toThrow();
    });

    it('should clear active session when status becomes inactive', () => {
      sessionManager.updateSessionStatus(testSession.sessionId, 'disconnected');

      expect(sessionManager.getActiveSession()).toBeNull();
    });

    it('should switch to another session when current becomes inactive', async () => {
      // Create second session for same wallet
      const params2 = createMockSessionParams({
        chain: createMockChainSessionInfo('0x89', ChainType.Evm, 'Polygon'),
      });
      const session2 = await sessionManager.createSession(params2);

      // Make first session active
      sessionManager.updateSessionStatus(testSession.sessionId, 'connected');

      // End the active session
      sessionManager.updateSessionStatus(testSession.sessionId, 'disconnected');

      // Should switch to the other connected session
      expect(sessionManager.getActiveSession()).toBe(session2);
    });
  });

  describe('Chain Switching', () => {
    let testSession: SessionState;
    let mockProvider: ReturnType<typeof createMockProvider>;

    beforeEach(async () => {
      mockProvider = createMockProvider();
      const params = createMockSessionParams({ provider: mockProvider });
      testSession = await sessionManager.createSession(params);
    });

    it('should switch chain for EVM provider', async () => {
      const newChainId = '0x89'; // Polygon
      const newChain = { chainId: newChainId, chainType: ChainType.Evm, name: 'Polygon', required: false };

      const updatedSession = await sessionManager.switchChain(testSession.sessionId, newChain);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: newChainId }],
      });
      expect(updatedSession.chain.chainId).toBe(newChainId);
      expect(updatedSession.metadata.chainSwitches).toHaveLength(1);
    });

    it('should record chain switch in metadata', async () => {
      const newChainId = '0x89';
      const newChain = { chainId: newChainId, chainType: ChainType.Evm, name: 'Polygon', required: false };

      const updatedSession = await sessionManager.switchChain(testSession.sessionId, newChain);

      const switchRecord = updatedSession.metadata.chainSwitches?.[0];
      expect(switchRecord).toBeDefined();
      expect(switchRecord?.fromChain.chainId).toBe('0x1');
      expect(switchRecord?.toChain.chainId).toBe(newChainId);
      expect(switchRecord?.successful).toBe(true);
      expect(switchRecord?.reason).toBe('user_request');
    });

    it('should reuse existing session for same chain', async () => {
      // Create session for different chain
      const params = createMockSessionParams({
        chain: createMockChainSessionInfo('0x89', ChainType.Evm, 'Polygon'),
      });
      const polygonSession = await sessionManager.createSession(params);

      // Switch back to original chain
      const switchedSession = await sessionManager.switchChain(polygonSession.sessionId, {
        chainId: '0x1',
        chainType: ChainType.Evm,
        name: 'Ethereum',
      });

      expect(switchedSession.sessionId).toBe(testSession.sessionId); // Reused existing session
    });

    it('should handle chain switch failure', async () => {
      mockProvider.request.mockRejectedValueOnce(new Error('Chain switch failed'));

      await expect(
        sessionManager.switchChain(testSession.sessionId, {
          chainId: '0x89',
          chainType: ChainType.Evm,
          name: 'Polygon',
        }),
      ).rejects.toThrow('Failed to switch to chain 0x89');
    });

    it('should create new session for unsupported provider chain switch', async () => {
      // Mock provider that doesn't support chain switching
      const nonSwitchableProvider = { connect: vi.fn(), disconnect: vi.fn() };
      const params = createMockSessionParams({
        provider: nonSwitchableProvider,
        providerMetadata: { ...createMockSessionParams().providerMetadata, multiChainCapable: false },
      });
      const session = await sessionManager.createSession(params);

      const newSession = await sessionManager.switchChain(session.sessionId, {
        chainId: '0x89',
        chainType: ChainType.Evm,
        name: 'Polygon',
      });

      expect(newSession.sessionId).not.toBe(session.sessionId);
      expect(newSession.chain.chainId).toBe('0x89');
    });

    it('should handle non-EVM chain switching', async () => {
      const solanaParams = createMockSessionParams({
        chain: createMockChainSessionInfo('mainnet-beta', ChainType.Solana, 'Solana Mainnet'),
        provider: createMockProvider(ChainType.Solana),
      });
      const solanaSession = await sessionManager.createSession(solanaParams);

      const newSession = await sessionManager.switchChain(solanaSession.sessionId, {
        chainId: 'devnet',
        chainType: ChainType.Solana,
        name: 'Solana Devnet',
      });

      expect(newSession.chain.chainId).toBe('devnet');
      expect(newSession.chain.chainType).toBe(ChainType.Solana);
    });
  });

  describe('Session Termination', () => {
    let testSession: SessionState;

    beforeEach(async () => {
      const params = createMockSessionParams();
      testSession = await sessionManager.createSession(params);
    });

    it('should end session', async () => {
      await sessionManager.endSession(testSession.sessionId);

      expect(sessionManager.getSession(testSession.sessionId)).toBeNull();
      expect(sessionManager.getActiveSession()).toBeNull();
    });

    it('should handle ending non-existent session gracefully', async () => {
      await expect(sessionManager.endSession('non-existent')).resolves.not.toThrow();
    });

    it('should remove session from wallet index', async () => {
      await sessionManager.endSession(testSession.sessionId);

      const walletSessions = sessionManager.getWalletSessions('test-wallet');
      expect(walletSessions).toHaveLength(0);
    });

    it('should disconnect provider if it supports disconnection', async () => {
      const mockProvider = createMockEvmProvider();
      mockProvider.disconnect = vi.fn().mockResolvedValue(undefined);
      const params = createMockSessionParams({ provider: mockProvider });
      const session = await sessionManager.createSession(params);

      await sessionManager.endSession(session.sessionId);

      expect(mockProvider.disconnect).toHaveBeenCalled();
    });

    it('should handle provider disconnection errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockProvider = createMockEvmProvider();
      mockProvider.disconnect = vi.fn().mockRejectedValue(new Error('Disconnect failed'));
      const params = createMockSessionParams({ provider: mockProvider });
      const session = await sessionManager.createSession(params);

      await sessionManager.endSession(session.sessionId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ModalCore]',
        'Error disconnecting provider during session cleanup',
        expect.objectContaining({
          message: 'Disconnect failed',
          name: 'Error',
        }),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Session Comparison', () => {
    let session1: SessionState;
    let session2: SessionState;

    beforeEach(async () => {
      const params1 = createMockSessionParams();
      const params2 = createMockSessionParams({
        chain: createMockChainSessionInfo('0x89', ChainType.Evm, 'Polygon'),
      });

      session1 = await sessionManager.createSession(params1);
      session2 = await sessionManager.createSession(params2);
    });

    it('should compare sessions correctly', () => {
      const comparison = sessionManager.compareSessions(session1.sessionId, session2.sessionId);

      expect(comparison).toBeDefined();
      expect(comparison?.sameWallet).toBe(true);
      expect(comparison?.sameChain).toBe(false);
      expect(comparison?.sameAddresses).toBe(true);
      expect(comparison?.compatibilityScore).toBeGreaterThan(0);
    });

    it('should return null for non-existent sessions', () => {
      const comparison = sessionManager.compareSessions('non-existent', session1.sessionId);

      expect(comparison).toBeNull();
    });
  });

  describe('Session Cleanup', () => {
    it('should clean up expired sessions', async () => {
      const expiryTime = Date.now() + 1000;
      const params = createMockSessionParams({ expiresAt: expiryTime });
      const session = await sessionManager.createSession(params);

      // Advance time past expiry
      vi.advanceTimersByTime(2000);

      await sessionManager.cleanupExpiredSessions();

      expect(sessionManager.getSession(session.sessionId)).toBeNull();
    });

    it('should not clean up non-expired sessions', async () => {
      const expiryTime = Date.now() + 10000; // 10 seconds from now
      const params = createMockSessionParams({ expiresAt: expiryTime });
      const session = await sessionManager.createSession(params);

      await sessionManager.cleanupExpiredSessions();

      expect(sessionManager.getSession(session.sessionId)).toBe(session);
    });
  });

  describe('Account Management', () => {
    let testSession: SessionState;

    beforeEach(async () => {
      const params = createMockSessionParams({
        accounts: [
          {
            address: '0x123',
            name: 'Account 1',
            index: 0,
            isDefault: true,
            metadata: {
              discoveredAt: Date.now(),
              lastUsedAt: Date.now(),
              transactionCount: 0,
              accountType: 'standard',
            },
          },
          {
            address: '0x456',
            name: 'Account 2',
            index: 1,
            isDefault: false,
            metadata: {
              discoveredAt: Date.now(),
              lastUsedAt: Date.now(),
              transactionCount: 0,
              accountType: 'standard',
            },
          },
          {
            address: '0x789',
            name: 'Account 3',
            index: 2,
            isDefault: false,
            metadata: {
              discoveredAt: Date.now(),
              lastUsedAt: Date.now(),
              transactionCount: 0,
              accountType: 'hardware',
            },
          },
        ],
      });
      testSession = await sessionManager.createSession(params);
    });

    describe('switchAccount', () => {
      it('should switch active account', async () => {
        const initialTime = testSession.lifecycle.lastActiveAt;

        // Advance time to ensure timestamp changes
        vi.advanceTimersByTime(1000);

        const updatedSession = await sessionManager.switchAccount(testSession.sessionId, '0x456');

        expect(updatedSession.activeAccount.address).toBe('0x456');
        expect(updatedSession.activeAccount.address).toBe('0x456');
        expect(updatedSession.lifecycle.lastActiveAt).toBeGreaterThan(initialTime);
      });

      it('should record account switch in selection history', async () => {
        const updatedSession = await sessionManager.switchAccount(testSession.sessionId, '0x456');

        expect(updatedSession.accountContext?.selectionHistory).toHaveLength(1);
        const selectionRecord = updatedSession.accountContext?.selectionHistory[0];
        expect(selectionRecord?.fromAccount?.address).toBe('0x123');
        expect(selectionRecord?.toAccount.address).toBe('0x456');
        expect(selectionRecord?.reason).toBe('user_request');
        expect(selectionRecord?.successful).toBe(true);
      });

      it('should throw error for non-existent session', async () => {
        await expect(sessionManager.switchAccount('non-existent', '0x456')).rejects.toThrow(
          'Session not found: non-existent',
        );
      });

      it('should throw error for non-existent account', async () => {
        await expect(sessionManager.switchAccount(testSession.sessionId, '0xNONE')).rejects.toThrow(
          'Account 0xNONE not found in session',
        );
      });

      it('should update active account index', async () => {
        const updatedSession = await sessionManager.switchAccount(testSession.sessionId, '0x789');

        expect(updatedSession.accountContext?.activeAccountIndex).toBe(2);
      });
    });

    describe('discoverAccounts', () => {
      it('should discover new accounts with default options', async () => {
        const discovered = await sessionManager.discoverAccounts(testSession.sessionId);

        expect(discovered).toHaveLength(5); // Default limit
        expect(discovered[0].index).toBe(3); // Starts after existing accounts
        expect(discovered[0].address).toMatch(/^0x/);
        expect(discovered[0].metadata?.discoveredAt).toBeDefined();
      });

      it('should discover accounts with custom options', async () => {
        const discovered = await sessionManager.discoverAccounts(testSession.sessionId, {
          limit: 2,
          startIndex: 10,
          includeBalances: true,
          derivationPathTemplate: "m/44'/60'/0'/0/{index}",
        });

        expect(discovered).toHaveLength(2);
        expect(discovered[0].index).toBe(10);
        expect(discovered[0].balance).toBeDefined();
        expect(discovered[0].derivationPath).toBe("m/44'/60'/0'/0/10");
      });

      it('should throw error for non-existent session', async () => {
        await expect(sessionManager.discoverAccounts('non-existent')).rejects.toThrow(
          'Session not found: non-existent',
        );
      });
    });

    describe('addAccount', () => {
      it('should add new account to session', async () => {
        const newAccount = {
          address: '0xNEW',
          name: 'New Account',
          index: 3,
          isDefault: false,
          metadata: {
            discoveredAt: Date.now(),
            lastUsedAt: Date.now(),
            transactionCount: 0,
            accountType: 'standard' as const,
          },
        };

        const updatedSession = await sessionManager.addAccount(testSession.sessionId, newAccount);

        expect(updatedSession.accounts).toHaveLength(4);
        expect(updatedSession.accounts.map((acc) => acc.address)).toContain('0xNEW');
        expect(updatedSession.accountContext?.totalAccounts).toBe(4);
      });

      it('should throw error for duplicate account', async () => {
        const duplicateAccount = {
          address: '0x123',
          name: 'Duplicate',
          index: 3,
          isDefault: false,
          metadata: {
            discoveredAt: Date.now(),
            lastUsedAt: Date.now(),
            transactionCount: 0,
            accountType: 'standard' as const,
          },
        };

        await expect(sessionManager.addAccount(testSession.sessionId, duplicateAccount)).rejects.toThrow(
          'Account 0x123 already exists in session',
        );
      });

      it('should throw error for non-existent session', async () => {
        await expect(sessionManager.addAccount('non-existent', {} as unknown)).rejects.toThrow(
          'Session not found: non-existent',
        );
      });
    });

    describe('removeAccount', () => {
      it('should remove account from session', async () => {
        const updatedSession = await sessionManager.removeAccount(testSession.sessionId, '0x789');

        expect(updatedSession.accounts).toHaveLength(2);
        expect(updatedSession.accounts.map((acc) => acc.address)).not.toContain('0x789');
        expect(updatedSession.accountContext?.totalAccounts).toBe(2);
      });

      it('should switch active account when removing active', async () => {
        const updatedSession = await sessionManager.removeAccount(testSession.sessionId, '0x123');

        expect(updatedSession.activeAccount.address).toBe('0x456');
        expect(updatedSession.activeAccount.address).toBe('0x456');
      });

      it('should throw error when removing last account', async () => {
        // Remove all but one account
        await sessionManager.removeAccount(testSession.sessionId, '0x456');
        await sessionManager.removeAccount(testSession.sessionId, '0x789');

        // Try to remove the last one
        await expect(sessionManager.removeAccount(testSession.sessionId, '0x123')).rejects.toThrow(
          'Cannot remove the last account from a session',
        );
      });

      it('should throw error for non-existent account', async () => {
        await expect(sessionManager.removeAccount(testSession.sessionId, '0xNONE')).rejects.toThrow(
          'Account 0xNONE not found in session',
        );
      });

      it('should adjust active account index when removing account before it', async () => {
        // Switch to account at index 2
        await sessionManager.switchAccount(testSession.sessionId, '0x789');

        // Remove account at index 1
        const updatedSession = await sessionManager.removeAccount(testSession.sessionId, '0x456');

        // Active account index should now be 1 (was 2, decreased by 1)
        expect(updatedSession.accountContext?.activeAccountIndex).toBe(1);
      });
    });

    describe('getSessionAccounts', () => {
      it('should return all accounts for session', () => {
        const accounts = sessionManager.getSessionAccounts(testSession.sessionId);

        expect(accounts).toHaveLength(3);
        expect(accounts[0].address).toBe('0x123');
        expect(accounts[2].metadata?.accountType).toBe('hardware');
      });

      it('should return empty array for non-existent session', () => {
        const accounts = sessionManager.getSessionAccounts('non-existent');

        expect(accounts).toEqual([]);
      });
    });

    describe('getActiveAccount', () => {
      it('should return active account', () => {
        const activeAccount = sessionManager.getActiveAccount(testSession.sessionId);

        expect(activeAccount?.address).toBe('0x123');
        expect(activeAccount?.name).toBe('Account 1');
      });

      it('should return null for non-existent session', () => {
        const activeAccount = sessionManager.getActiveAccount('non-existent');

        expect(activeAccount).toBeNull();
      });

      it('should return updated active account after switch', async () => {
        await sessionManager.switchAccount(testSession.sessionId, '0x456');
        const activeAccount = sessionManager.getActiveAccount(testSession.sessionId);

        expect(activeAccount?.address).toBe('0x456');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle session creation with no active account address', async () => {
      const params = createMockSessionParams({
        accounts: [
          { address: '0x123', name: 'Account 1' },
          { address: '0x456', name: 'Account 2' },
        ],
        activeAccountIndex: undefined,
      });

      const session = await sessionManager.createSession(params);

      expect(session.activeAccount.address).toBe('0x123'); // Defaults to first address
    });

    it('should throw error when no accounts provided', async () => {
      const params = createMockSessionParams({
        accounts: [],
      });

      await expect(sessionManager.createSession(params)).rejects.toThrow(
        'No valid account found for session',
      );
    });

    it('should handle session creation with wallet session context', async () => {
      const params = createMockSessionParams({
        walletSessionContext: {
          walletName: 'Test Wallet',
          walletIcon: 'https://example.com/icon.png',
          walletType: 'browser',
          walletCapabilities: {
            supportsSignTypedData: true,
            supportsBatchTransactions: false,
            supportsSimulation: true,
          },
        },
      });

      const session = await sessionManager.createSession(params);

      expect(session.walletSession).toBeDefined();
      expect(session.walletSession?.walletName).toBe('Test Wallet');
      expect(session.walletSession?.walletMetadata.totalSessions).toBe(1);
    });

    it('should handle session creation with account context', async () => {
      const params = createMockSessionParams({
        accountContext: {
          discoverySettings: {
            maxAccounts: 20,
            autoDiscover: false,
            gapLimit: 10,
          },
          accountPermissions: {
            canSwitchAccounts: false,
            canAddAccounts: false,
          },
        },
      });

      const session = await sessionManager.createSession(params);

      expect(session.accountContext?.discoverySettings.maxAccounts).toBe(20);
      expect(session.accountContext?.accountPermissions.canSwitchAccounts).toBe(false);
    });

    it('should detect chain type from various formats', async () => {
      const params = createMockSessionParams();
      const session = await sessionManager.createSession(params);

      // Test hex format (EVM)
      let newSession = await sessionManager.switchChain(session.sessionId, {
        chainId: '0x38',
        chainType: ChainType.Evm,
        name: 'BNB Chain',
      });
      expect(newSession.chain.chainType).toBe(ChainType.Evm);

      // Test numeric format (EVM) - convert to proper format
      newSession = await sessionManager.switchChain(session.sessionId, {
        chainId: '137',
        chainType: ChainType.Evm,
        name: 'Polygon',
      });
      expect(newSession.chain.chainType).toBe(ChainType.Evm);

      // Test Solana format
      const solanaParams = createMockSessionParams({
        chain: createMockChainSessionInfo('mainnet-beta', ChainType.Solana, 'Solana'),
      });
      const solanaSession = await sessionManager.createSession(solanaParams);
      newSession = await sessionManager.switchChain(solanaSession.sessionId, {
        chainId: 'testnet',
        chainType: ChainType.Solana,
        name: 'Solana Testnet',
      });
      expect(newSession.chain.chainType).toBe(ChainType.Solana);

      // Test Aztec format
      const aztecParams = createMockSessionParams({
        chain: createMockChainSessionInfo('aztec-mainnet', ChainType.Aztec, 'Aztec'),
      });
      const aztecSession = await sessionManager.createSession(aztecParams);
      expect(aztecSession.chain.chainType).toBe(ChainType.Aztec);
    });

    it('should handle chain names for known and unknown chains', async () => {
      const params = createMockSessionParams();
      const session = await sessionManager.createSession(params);

      // Known chains
      let newSession = await sessionManager.switchChain(session.sessionId, {
        chainId: '0x89',
        chainType: ChainType.Evm,
        name: 'Polygon',
      });
      expect(newSession.chain.name).toBe('Polygon');

      newSession = await sessionManager.switchChain(session.sessionId, {
        chainId: '42161',
        chainType: ChainType.Evm,
        name: 'Arbitrum One',
      });
      expect(newSession.chain.name).toBe('Arbitrum One');

      // Unknown chain
      newSession = await sessionManager.switchChain(session.sessionId, {
        chainId: '0x999999',
        chainType: ChainType.Evm,
        name: 'Unknown Chain',
      });
      expect(newSession.chain.name).toBe('Unknown Chain');
    });

    it('should handle account removal edge cases', async () => {
      const params = createMockSessionParams({
        accounts: [
          {
            address: '0x123',
            name: 'Account 1',
            index: 0,
            isDefault: true,
            metadata: {
              discoveredAt: Date.now(),
              lastUsedAt: Date.now(),
              transactionCount: 0,
              accountType: 'standard',
            },
          },
          {
            address: '0x456',
            name: 'Account 2',
            index: 1,
            isDefault: false,
            metadata: {
              discoveredAt: Date.now(),
              lastUsedAt: Date.now(),
              transactionCount: 0,
              accountType: 'standard',
            },
          },
        ],
      });
      const session = await sessionManager.createSession(params);

      // Remove active account
      const updatedSession = await sessionManager.removeAccount(session.sessionId, '0x123');

      // Should have properly updated the session
      expect(updatedSession.accounts).toHaveLength(1);
      expect(updatedSession.activeAccount.address).toBe('0x456');
      expect(updatedSession.accountContext?.activeAccountIndex).toBe(0); // Index adjusted
    });

    it('should properly update session state when marking old session as disconnected', async () => {
      const params = createMockSessionParams();
      const session1 = await sessionManager.createSession(params);

      // Create new session for different chain
      const newSession = await sessionManager.switchChain(session1.sessionId, 'mainnet-beta');

      // Get the original session - it should be disconnected
      const originalSession = sessionManager.getSession(session1.sessionId);
      expect(originalSession?.status).toBe('disconnected');
    });
  });
});
