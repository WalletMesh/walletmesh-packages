import { describe, expect, it } from 'vitest';
import {
  deriveConnectionFlags,
  filterSessionsByStatus,
  getActiveSession,
  getConnectedWalletIds,
  getCurrentChain,
  getPrimaryAddress,
  getSessionsByChainType,
  hasConnectedSession,
  isConnectedToChain,
  type ChainInfo,
  type WalletSession,
} from './stateDerivation.js';

describe('stateDerivation utils', () => {
  const mockChainEvm: ChainInfo = {
    chainId: '1',
    chainType: 'evm',
    name: 'Ethereum',
  };

  const mockChainSolana: ChainInfo = {
    chainId: 'mainnet-beta',
    chainType: 'solana',
    name: 'Solana',
  };

  const mockSessionsConnected: WalletSession[] = [
    {
      walletId: 'metamask',
      status: 'connected',
      chain: mockChainEvm,
      address: '0x1234567890123456789012345678901234567890',
    },
    {
      walletId: 'phantom',
      status: 'connected',
      chain: mockChainSolana,
      address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    },
  ];

  const mockSessionsMixed: WalletSession[] = [
    {
      walletId: 'metamask',
      status: 'connected',
      chain: mockChainEvm,
      address: '0x1234567890123456789012345678901234567890',
    },
    {
      walletId: 'coinbase',
      status: 'connecting',
      chain: mockChainEvm,
    },
    {
      walletId: 'rainbow',
      status: 'disconnected',
    },
  ];

  describe('deriveConnectionFlags', () => {
    it('should derive flags for connected state', () => {
      const flags = deriveConnectionFlags('connected', 'connected', false);

      expect(flags).toEqual({
        status: 'connected',
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        isDisconnected: false,
      });
    });

    it('should derive flags for connecting state', () => {
      const flags = deriveConnectionFlags('connecting', 'connecting', false);

      expect(flags).toEqual({
        status: 'connecting',
        isConnected: false,
        isConnecting: true,
        isReconnecting: false,
        isDisconnected: false,
      });
    });

    it('should derive flags for disconnected state', () => {
      const flags = deriveConnectionFlags('disconnected', 'idle', false);

      expect(flags).toEqual({
        status: 'disconnected',
        isConnected: false,
        isConnecting: false,
        isReconnecting: false,
        isDisconnected: true,
      });
    });

    it('should derive flags for reconnecting state', () => {
      const flags = deriveConnectionFlags('connecting', 'connecting', true);

      expect(flags).toEqual({
        status: 'reconnecting',
        isConnected: false,
        isConnecting: false,
        isReconnecting: true,
        isDisconnected: false,
      });
    });

    it('should handle undefined session status', () => {
      const flags = deriveConnectionFlags(undefined, 'idle', false);

      expect(flags).toEqual({
        status: 'disconnected',
        isConnected: false,
        isConnecting: false,
        isReconnecting: false,
        isDisconnected: true,
      });
    });

    it('should handle undefined UI view', () => {
      const flags = deriveConnectionFlags('connected', undefined, false);

      expect(flags).toEqual({
        status: 'connected',
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        isDisconnected: false,
      });
    });
  });

  describe('filterSessionsByStatus', () => {
    it('should filter connected sessions', () => {
      const filtered = filterSessionsByStatus(mockSessionsMixed, 'connected');

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.walletId).toBe('metamask');
    });

    it('should filter connecting sessions', () => {
      const filtered = filterSessionsByStatus(mockSessionsMixed, 'connecting');

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.walletId).toBe('coinbase');
    });

    it('should filter disconnected sessions', () => {
      const filtered = filterSessionsByStatus(mockSessionsMixed, 'disconnected');

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.walletId).toBe('rainbow');
    });

    it('should default to filtering connected sessions', () => {
      const filtered = filterSessionsByStatus(mockSessionsMixed);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.walletId).toBe('metamask');
    });

    it('should return empty array when no sessions match', () => {
      const disconnectedOnly: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const filtered = filterSessionsByStatus(disconnectedOnly, 'connected');

      expect(filtered).toHaveLength(0);
    });
  });

  describe('getConnectedWalletIds', () => {
    it('should return connected wallet IDs', () => {
      const walletIds = getConnectedWalletIds(mockSessionsConnected);

      expect(walletIds).toEqual(['metamask', 'phantom']);
    });

    it('should return only connected wallet IDs from mixed sessions', () => {
      const walletIds = getConnectedWalletIds(mockSessionsMixed);

      expect(walletIds).toEqual(['metamask']);
    });

    it('should return empty array when no connected sessions', () => {
      const disconnectedSessions: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const walletIds = getConnectedWalletIds(disconnectedSessions);

      expect(walletIds).toEqual([]);
    });

    it('should filter out undefined wallet IDs', () => {
      const sessionsWithUndefined: WalletSession[] = [
        { walletId: '', status: 'connected' },
        { walletId: 'metamask', status: 'connected' },
      ];
      const walletIds = getConnectedWalletIds(sessionsWithUndefined);

      expect(walletIds).toEqual(['metamask']);
    });
  });

  describe('getActiveSession', () => {
    it('should return first connected session', () => {
      const active = getActiveSession(mockSessionsConnected);

      expect(active).toBeDefined();
      expect(active?.walletId).toBe('metamask');
    });

    it('should return first connected session from mixed sessions', () => {
      const active = getActiveSession(mockSessionsMixed);

      expect(active).toBeDefined();
      expect(active?.walletId).toBe('metamask');
    });

    it('should return undefined when no connected sessions', () => {
      const disconnectedSessions: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const active = getActiveSession(disconnectedSessions);

      expect(active).toBeUndefined();
    });

    it('should return undefined for empty sessions array', () => {
      const active = getActiveSession([]);

      expect(active).toBeUndefined();
    });
  });

  describe('hasConnectedSession', () => {
    it('should return true when sessions have connected wallet', () => {
      const hasConnected = hasConnectedSession(mockSessionsConnected);

      expect(hasConnected).toBe(true);
    });

    it('should return true when mixed sessions have at least one connected', () => {
      const hasConnected = hasConnectedSession(mockSessionsMixed);

      expect(hasConnected).toBe(true);
    });

    it('should return false when no connected sessions', () => {
      const disconnectedSessions: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const hasConnected = hasConnectedSession(disconnectedSessions);

      expect(hasConnected).toBe(false);
    });

    it('should return false for empty sessions array', () => {
      const hasConnected = hasConnectedSession([]);

      expect(hasConnected).toBe(false);
    });
  });

  describe('getPrimaryAddress', () => {
    it('should return address from active session', () => {
      const address = getPrimaryAddress(mockSessionsConnected);

      expect(address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should return address from first connected session', () => {
      const address = getPrimaryAddress(mockSessionsMixed);

      expect(address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should return undefined when no connected sessions', () => {
      const disconnectedSessions: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const address = getPrimaryAddress(disconnectedSessions);

      expect(address).toBeUndefined();
    });

    it('should return undefined when active session has no address', () => {
      const sessionWithoutAddress: WalletSession[] = [
        { walletId: 'test', status: 'connected', chain: mockChainEvm },
      ];
      const address = getPrimaryAddress(sessionWithoutAddress);

      expect(address).toBeUndefined();
    });
  });

  describe('getCurrentChain', () => {
    it('should return chain from active session', () => {
      const chain = getCurrentChain(mockSessionsConnected);

      expect(chain).toEqual(mockChainEvm);
    });

    it('should return chain from first connected session', () => {
      const chain = getCurrentChain(mockSessionsMixed);

      expect(chain).toEqual(mockChainEvm);
    });

    it('should return undefined when no connected sessions', () => {
      const disconnectedSessions: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const chain = getCurrentChain(disconnectedSessions);

      expect(chain).toBeUndefined();
    });

    it('should return undefined when active session has no chain', () => {
      const sessionWithoutChain: WalletSession[] = [
        {
          walletId: 'test',
          status: 'connected',
          address: '0x123',
        },
      ];
      const chain = getCurrentChain(sessionWithoutChain);

      expect(chain).toBeUndefined();
    });
  });

  describe('isConnectedToChain', () => {
    it('should return true when connected to specified chain', () => {
      const isConnected = isConnectedToChain(mockSessionsConnected, '1');

      expect(isConnected).toBe(true);
    });

    it('should return false when connected to different chain', () => {
      const isConnected = isConnectedToChain(mockSessionsConnected, '137');

      expect(isConnected).toBe(false);
    });

    it('should return false when no connected sessions', () => {
      const disconnectedSessions: WalletSession[] = [
        { walletId: 'test', status: 'disconnected' },
      ];
      const isConnected = isConnectedToChain(disconnectedSessions, '1');

      expect(isConnected).toBe(false);
    });

    it('should return false when active session has no chain', () => {
      const sessionWithoutChain: WalletSession[] = [
        {
          walletId: 'test',
          status: 'connected',
          address: '0x123',
        },
      ];
      const isConnected = isConnectedToChain(sessionWithoutChain, '1');

      expect(isConnected).toBe(false);
    });
  });

  describe('getSessionsByChainType', () => {
    it('should return sessions for specified chain type', () => {
      const evmSessions = getSessionsByChainType(mockSessionsConnected, 'evm');

      expect(evmSessions).toHaveLength(1);
      expect(evmSessions[0]?.walletId).toBe('metamask');
    });

    it('should return all sessions of specified type', () => {
      const solanaSessions = getSessionsByChainType(mockSessionsConnected, 'solana');

      expect(solanaSessions).toHaveLength(1);
      expect(solanaSessions[0]?.walletId).toBe('phantom');
    });

    it('should return empty array when no sessions match chain type', () => {
      const aztecSessions = getSessionsByChainType(mockSessionsConnected, 'aztec');

      expect(aztecSessions).toHaveLength(0);
    });

    it('should filter by chain type regardless of session status', () => {
      const evmSessions = getSessionsByChainType(mockSessionsMixed, 'evm');

      expect(evmSessions).toHaveLength(2);
      expect(evmSessions.map((s) => s.walletId)).toEqual(['metamask', 'coinbase']);
    });

    it('should return empty array when sessions have no chain', () => {
      const sessionWithoutChain: WalletSession[] = [
        {
          walletId: 'test',
          status: 'connected',
          address: '0x123',
        },
      ];
      const evmSessions = getSessionsByChainType(sessionWithoutChain, 'evm');

      expect(evmSessions).toHaveLength(0);
    });
  });
});
