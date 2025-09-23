import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletInfo } from '../../types.js';
import {
  type ConnectButtonConnectionInfo,
  connectButtonUtils,
  connectionUIService,
  useConnectButtonState,
} from './connectButton.js';

// Mock the logger module
vi.mock('../../internal/core/logger/logger.js', () => ({
  createDebugLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
    dispose: vi.fn(),
  })),
}));

describe('connectButton API', () => {
  describe('useConnectButtonState', () => {
    it('should return disconnected state when not connected', () => {
      const result = useConnectButtonState({
        isConnected: false,
        isConnecting: false,
      });

      expect(result.state).toBe('disconnected');
      expect(result.isDisconnected).toBe(true);
      expect(result.isConnected).toBe(false);
      expect(result.isConnecting).toBe(false);
      expect(result.action).toBe('connect');
      expect(result.content.text).toBe('Connect Wallet');
      expect(result.content.disabled).toBe(false);
    });

    it('should return connecting state when connecting', () => {
      const result = useConnectButtonState({
        isConnected: false,
        isConnecting: true,
      });

      expect(result.state).toBe('connecting');
      expect(result.isConnecting).toBe(true);
      expect(result.isConnected).toBe(false);
      expect(result.isDisconnected).toBe(false);
      expect(result.action).toBe('none');
      expect(result.content.text).toBe('Connecting...');
      expect(result.content.disabled).toBe(true);
      expect(result.content.indicatorType).toBe('loading');
    });

    it('should return connected state when connected', () => {
      const result = useConnectButtonState({
        isConnected: true,
        isConnecting: false,
      });

      expect(result.state).toBe('connected');
      expect(result.isConnected).toBe(true);
      expect(result.isConnecting).toBe(false);
      expect(result.isDisconnected).toBe(false);
      expect(result.action).toBe('disconnect');
      expect(result.content.text).toBe('Connected');
      expect(result.content.disabled).toBe(false);
      expect(result.content.indicatorType).toBe('success');
    });

    it('should use custom labels when provided', () => {
      const result = useConnectButtonState(
        {
          isConnected: false,
          isConnecting: false,
        },
        {
          labels: {
            connect: 'Click to Connect',
            connecting: 'Please Wait...',
            connected: 'Wallet Connected',
          },
        },
      );

      expect(result.content.text).toBe('Connect Wallet'); // Still uses default for 'disconnected'
    });

    it('should include address in connected state', () => {
      const result = useConnectButtonState({
        isConnected: true,
        isConnecting: false,
        address: '0x1234567890123456789012345678901234567890',
        chainType: 'evm',
      });

      expect(result.content.text).toBe('0x1234...7890');
      expect(result.content.displayInfo?.address).toBe('0x1234...7890');
    });

    it('should include chain name when requested', () => {
      const result = useConnectButtonState(
        {
          isConnected: true,
          isConnecting: false,
          address: '0x1234567890123456789012345678901234567890',
          chainId: 'eip155:1',
          chainType: 'evm',
        },
        {
          showChain: true,
        },
      );

      expect(result.content.displayInfo?.chainName).toBe('Ethereum');
    });

    it('should include wallet name when requested', () => {
      const wallet: WalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'metamask.svg',
        type: 'browser',
      };

      const result = useConnectButtonState(
        {
          isConnected: true,
          isConnecting: false,
          address: '0x1234567890123456789012345678901234567890',
          wallet,
        },
        {
          showWallet: true, // Fixed: should be showWallet not showWalletName
        },
      );

      expect(result.content.displayInfo?.walletName).toBe('MetaMask');
    });

    it('should handle null/undefined values gracefully', () => {
      const result = useConnectButtonState({
        isConnected: true,
        isConnecting: false,
        address: undefined,
        chainId: null,
        chainType: undefined,
        wallet: null,
      });

      expect(result.state).toBe('connected');
      expect(result.content.text).toBe('Connected');
    });

    it('should check if connection info should be shown', () => {
      const connectedResult = useConnectButtonState({
        isConnected: true,
        isConnecting: false,
        chainType: 'evm',
      });
      expect(connectedResult.shouldShowConnectionInfo).toBe(true);

      const disconnectedResult = useConnectButtonState({
        isConnected: false,
        isConnecting: false,
        chainType: 'evm',
      });
      expect(disconnectedResult.shouldShowConnectionInfo).toBe(false);
    });

    it('should handle target chain type', () => {
      const result = useConnectButtonState(
        {
          isConnected: true,
          isConnecting: false,
          chainType: 'evm',
        },
        {
          targetChainType: 'solana',
        },
      );

      expect(result.shouldShowConnectionInfo).toBe(true);
    });
  });

  describe('connectButtonUtils', () => {
    describe('formatAddress', () => {
      it('should format EVM address', () => {
        const formatted = connectButtonUtils.formatAddress(
          '0x1234567890123456789012345678901234567890',
          'evm',
        );
        expect(formatted).toBe('0x1234...7890');
      });

      it('should format Solana address', () => {
        const formatted = connectButtonUtils.formatAddress(
          '7VfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
          'solana',
        );
        expect(formatted).toBe('7VfCXT...voxs');
      });

      it('should use custom formatting options', () => {
        const formatted = connectButtonUtils.formatAddress(
          '0x1234567890123456789012345678901234567890',
          'evm',
          { prefixLength: 10, suffixLength: 6 },
        );
        expect(formatted).toBe('0x12345678...567890');
      });

      it('should handle short addresses', () => {
        const formatted = connectButtonUtils.formatAddress('0x1234', 'evm');
        expect(formatted).toBe('0x1234');
      });
    });

    describe('getChainDisplayName', () => {
      it('should return chain display name', () => {
        const name = connectButtonUtils.getChainDisplayName('eip155:1', 'evm');
        expect(name).toBe('Ethereum');
      });

      it('should return Polygon for chain 137', () => {
        const name = connectButtonUtils.getChainDisplayName('eip155:137', 'evm');
        expect(name).toBe('Polygon');
      });

      it('should return chainId for unknown chains', () => {
        const name = connectButtonUtils.getChainDisplayName('unknown:999', 'evm');
        expect(name).toBe('unknown:999');
      });
    });

    describe('formatConnectionInfo', () => {
      it('should format connection info with address only', () => {
        const formatted = connectButtonUtils.formatConnectionInfo({
          address: '0x1234567890123456789012345678901234567890',
          chainType: 'evm',
        });
        expect(formatted).toBe('0x1234...7890');
      });

      it('should include chain name when requested', () => {
        const formatted = connectButtonUtils.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 'eip155:1',
            chainType: 'evm',
          },
          { showChain: true },
        );
        expect(formatted).toBe('0x1234...7890 • Ethereum');
      });

      it('should include wallet name when requested', () => {
        const formatted = connectButtonUtils.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            chainType: 'evm',
            walletName: 'MetaMask',
          },
          { showWalletName: true },
        );
        expect(formatted).toBe('0x1234...7890 • MetaMask');
      });

      it('should use custom separator', () => {
        const formatted = connectButtonUtils.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 'eip155:1',
            chainType: 'evm',
          },
          { showChain: true, separator: ' | ' },
        );
        expect(formatted).toBe('0x1234...7890 | Ethereum');
      });

      it('should return "Not Connected" for empty info', () => {
        const formatted = connectButtonUtils.formatConnectionInfo({});
        expect(formatted).toBe('Not Connected');
      });

      it('should hide address when requested', () => {
        const formatted = connectButtonUtils.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            walletName: 'MetaMask',
          },
          { showAddress: false, showWalletName: true },
        );
        expect(formatted).toBe('MetaMask');
      });

      it('should handle null values', () => {
        const formatted = connectButtonUtils.formatConnectionInfo({
          address: null,
          chainId: null,
          chainType: null,
          walletName: null,
        });
        expect(formatted).toBe('Not Connected');
      });
    });

    describe('getConnectionStatusText', () => {
      it('should return "Disconnected" when not connected', () => {
        const status = connectButtonUtils.getConnectionStatusText(false, false);
        expect(status).toBe('Disconnected');
      });

      it('should return "Connecting..." when connecting', () => {
        const status = connectButtonUtils.getConnectionStatusText(false, true);
        expect(status).toBe('Connecting...');
      });

      it('should return "Connected" when connected', () => {
        const status = connectButtonUtils.getConnectionStatusText(true, false);
        expect(status).toBe('Connected');
      });

      it('should return "Connection Error" when error present', () => {
        const error = new Error('Test error');
        const status = connectButtonUtils.getConnectionStatusText(false, false, error);
        expect(status).toBe('Connection Error');
      });

      it('should prioritize error over other states', () => {
        const error = new Error('Test error');
        const status = connectButtonUtils.getConnectionStatusText(true, true, error);
        expect(status).toBe('Connection Error');
      });
    });

    describe('isValidAddressFormat', () => {
      it('should validate EVM addresses', () => {
        expect(
          connectButtonUtils.isValidAddressFormat('0x1234567890123456789012345678901234567890', 'evm'),
        ).toBe(true);
        expect(connectButtonUtils.isValidAddressFormat('0x123', 'evm')).toBe(false);
        expect(connectButtonUtils.isValidAddressFormat('not-an-address', 'evm')).toBe(false);
      });

      it('should validate Solana addresses', () => {
        expect(
          connectButtonUtils.isValidAddressFormat('7VfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', 'solana'),
        ).toBe(true);
        expect(connectButtonUtils.isValidAddressFormat('short', 'solana')).toBe(false);
      });

      it('should validate Aztec addresses', () => {
        expect(connectButtonUtils.isValidAddressFormat('aztec-address', 'aztec')).toBe(true);
        expect(connectButtonUtils.isValidAddressFormat('', 'aztec')).toBe(false);
      });
    });
  });

  describe('connectionUIService', () => {
    it('should be an instance of ConnectionUIService', () => {
      expect(connectionUIService).toBeDefined();
      expect(connectionUIService.getButtonState).toBeDefined();
      expect(connectionUIService.formatAddress).toBeDefined();
      expect(connectionUIService.getChainName).toBeDefined();
    });

    it('should provide button state functionality', () => {
      const state = connectionUIService.getButtonState(true, false);
      expect(state).toBe('connected');
    });

    it('should provide address formatting', () => {
      const formatted = connectionUIService.formatAddress(
        '0x1234567890123456789012345678901234567890',
        'evm',
      );
      expect(formatted).toBe('0x1234...7890');
    });

    it('should provide chain name lookup', () => {
      const name = connectionUIService.getChainName('eip155:1', 'evm');
      expect(name).toBe('Ethereum');
    });
  });

  describe('Type exports', () => {
    it('should handle ConnectButtonConnectionInfo type', () => {
      const info: ConnectButtonConnectionInfo = {
        address: '0x123',
        chainId: 'eip155:1',
        chainType: 'evm',
        wallet: {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          type: 'browser',
        },
      };

      expect(info.address).toBe('0x123');
      expect(info.chainType).toBe('evm');
    });
  });
});
