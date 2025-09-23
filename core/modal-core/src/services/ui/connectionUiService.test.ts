import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockLogger } from '../../testing/index.js';
import type { WalletInfo } from '../../types.js';
import type { ChainService } from '../chain/ChainService.js';
import {
  type ConnectButtonState,
  ConnectionUIService,
  type ConnectionUIServiceDependencies,
} from './connectionUiService.js';

describe('ConnectionUIService', () => {
  let service: ConnectionUIService;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockChainService: Partial<ChainService>;
  let dependencies: ConnectionUIServiceDependencies;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockChainService = {
      getChain: vi.fn().mockReturnValue(null),
    };

    dependencies = {
      logger: mockLogger,
      chainService: mockChainService as ChainService,
    };

    service = new ConnectionUIService(dependencies);
  });

  describe('Button State Management', () => {
    describe('getButtonState', () => {
      it('should return disconnected when not connected and not connecting', () => {
        const state = service.getButtonState(false, false);
        expect(state).toBe('disconnected');
      });

      it('should return connecting when connecting', () => {
        const state = service.getButtonState(false, true);
        expect(state).toBe('connecting');
      });

      it('should return connected when connected', () => {
        const state = service.getButtonState(true, false);
        expect(state).toBe('connected');
      });

      it('should prioritize connecting state over connected', () => {
        const state = service.getButtonState(true, true);
        expect(state).toBe('connecting');
      });
    });

    describe('getButtonContent', () => {
      it('should return correct content for disconnected state', () => {
        const content = service.getButtonContent('disconnected');
        expect(content).toEqual({
          text: 'Connect Wallet',
          showIndicator: false,
          indicatorType: 'none',
          disabled: false,
        });
      });

      it('should return correct content for connecting state', () => {
        const content = service.getButtonContent('connecting');
        expect(content).toEqual({
          text: 'Connecting...',
          showIndicator: true,
          indicatorType: 'loading',
          disabled: true,
        });
      });

      it('should return correct content for connected state without address', () => {
        const content = service.getButtonContent('connected');
        expect(content).toEqual({
          text: 'Connected',
          showIndicator: true,
          indicatorType: 'success',
          disabled: false,
          displayInfo: {},
        });
      });

      it('should use custom labels when provided', () => {
        const content = service.getButtonContent('disconnected', {
          labels: { disconnected: 'Click to Connect' },
        });
        expect(content.text).toBe('Click to Connect');
      });

      it('should include address in connected state when available', () => {
        service.updateConnectionInfo({
          address: '0x1234567890123456789012345678901234567890',
          chainType: 'evm',
        });

        const content = service.getButtonContent('connected');
        expect(content.text).toBe('0x1234...7890');
        expect(content.displayInfo?.address).toBe('0x1234...7890');
      });

      it('should include chain name when requested and available', () => {
        service.updateConnectionInfo({
          address: '0x1234567890123456789012345678901234567890',
          chainId: 'eip155:1',
          chainType: 'evm',
        });

        const content = service.getButtonContent('connected', {
          showChain: true,
        });
        expect(content.displayInfo?.chainName).toBe('Ethereum');
      });

      it('should include wallet name when requested and available', () => {
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          type: 'browser',
        };

        service.updateConnectionInfo({
          address: '0x1234567890123456789012345678901234567890',
          wallet: walletInfo,
        });

        const content = service.getButtonContent('connected', {
          showWallet: true,
        });
        expect(content.displayInfo?.walletName).toBe('MetaMask');
      });
    });

    describe('getButtonAction', () => {
      it('should return connect for disconnected state', () => {
        expect(service.getButtonAction('disconnected')).toBe('connect');
      });

      it('should return disconnect for connected state', () => {
        expect(service.getButtonAction('connected')).toBe('disconnect');
      });

      it('should return none for connecting state', () => {
        expect(service.getButtonAction('connecting')).toBe('none');
      });
    });
  });

  describe('Connection Information Management', () => {
    it('should update connection info', () => {
      const info = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 'eip155:1',
        chainType: 'evm' as const,
      };

      service.updateConnectionInfo(info);
      const retrieved = service.getConnectionInfo();

      expect(retrieved.address).toBe(info.address);
      expect(retrieved.chainId).toBe(info.chainId);
      expect(retrieved.chainType).toBe(info.chainType);
      expect(mockLogger.debug).toHaveBeenCalledWith('Connection info updated', expect.any(Object));
    });

    it('should merge partial updates', () => {
      service.updateConnectionInfo({ address: '0x123' });
      service.updateConnectionInfo({ chainId: 'eip155:1' });

      const info = service.getConnectionInfo();
      expect(info.address).toBe('0x123');
      expect(info.chainId).toBe('eip155:1');
    });

    it('should clear connection info', () => {
      service.updateConnectionInfo({
        address: '0x123',
        chainId: 'eip155:1',
      });

      service.clearConnectionInfo();
      const info = service.getConnectionInfo();

      expect(info.address).toBeNull();
      expect(info.chainId).toBeNull();
      expect(info.chainType).toBeNull();
      expect(info.wallet).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith('Connection info cleared');
    });

    it('should return a copy of connection info', () => {
      const original = { address: '0x123' };
      service.updateConnectionInfo(original);

      const retrieved = service.getConnectionInfo();
      retrieved.address = '0x456';

      const current = service.getConnectionInfo();
      expect(current.address).toBe('0x123');
    });
  });

  describe('Address Display Formatting', () => {
    describe('formatAddress', () => {
      it('should return empty string for empty address', () => {
        expect(service.formatAddress('')).toBe('');
      });

      it('should return short addresses as-is', () => {
        const shortAddress = '0x12345';
        expect(service.formatAddress(shortAddress)).toBe(shortAddress);
      });

      it('should format EVM addresses correctly', () => {
        const evmAddress = '0x1234567890123456789012345678901234567890';
        expect(service.formatAddress(evmAddress, 'evm')).toBe('0x1234...7890');
      });

      it('should format Solana addresses with more characters', () => {
        const solanaAddress = '7VfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs';
        expect(service.formatAddress(solanaAddress, 'solana')).toBe('7VfCXT...voxs');
      });

      it('should format Aztec addresses', () => {
        const aztecAddress = '0xaztec1234567890123456789012345678901234567890';
        expect(service.formatAddress(aztecAddress, 'aztec')).toBe('0xazte...7890');
      });

      it('should use custom formatting options', () => {
        const address = '0x1234567890123456789012345678901234567890';
        const formatted = service.formatAddress(address, 'evm', {
          prefixLength: 10,
          suffixLength: 6,
        });
        expect(formatted).toBe('0x12345678...567890');
      });

      it('should respect maxLength option', () => {
        const address = '0x123456789012';
        const formatted = service.formatAddress(address, 'evm', {
          maxLength: 15,
        });
        expect(formatted).toBe(address);
      });

      it('should handle unknown chain types', () => {
        const address = 'unknown1234567890123456789012345678901234567890';
        expect(service.formatAddress(address)).toBe('unknow...7890');
      });
    });

    describe('getConnectionDisplay', () => {
      it('should return "Not Connected" for null address', () => {
        const display = service.getConnectionDisplay(null);
        expect(display.address).toBe('Not Connected');
      });

      it('should format address when provided', () => {
        const display = service.getConnectionDisplay('0x1234567890123456789012345678901234567890', 'evm');
        expect(display.address).toBe('0x1234...7890');
      });

      it('should include chain name when requested', () => {
        service.updateConnectionInfo({
          chainId: 'eip155:137',
        });

        const display = service.getConnectionDisplay('0x1234567890123456789012345678901234567890', 'evm', {
          showChain: true,
        });
        expect(display.chainName).toBe('Polygon');
      });

      it('should include wallet name when requested', () => {
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          type: 'browser',
        };

        service.updateConnectionInfo({ wallet: walletInfo });

        const display = service.getConnectionDisplay('0x1234567890123456789012345678901234567890', 'evm', {
          showWallet: true,
        });
        expect(display.walletName).toBe('MetaMask');
      });

      it('should use custom formatting options', () => {
        const display = service.getConnectionDisplay('0x1234567890123456789012345678901234567890', 'evm', {
          prefixLength: 8,
          suffixLength: 6,
        });
        expect(display.address).toBe('0x123456...567890');
      });
    });
  });

  describe('Chain Information', () => {
    describe('getChainName', () => {
      it('should get chain name from chain service when available', () => {
        mockChainService.getChain = vi.fn().mockReturnValue({
          name: 'Custom Chain',
          icon: 'custom.svg',
        });

        const name = service.getChainName('custom:123');
        expect(name).toBe('Custom Chain');
        expect(mockChainService.getChain).toHaveBeenCalledWith('custom:123');
      });

      it('should return Ethereum for eip155:1', () => {
        expect(service.getChainName('eip155:1')).toBe('Ethereum');
      });

      it('should return Polygon for eip155:137', () => {
        expect(service.getChainName('eip155:137')).toBe('Polygon');
      });

      it('should return BSC for eip155:56', () => {
        expect(service.getChainName('eip155:56')).toBe('BSC');
      });

      it('should return Solana for mainnet', () => {
        expect(service.getChainName('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('Solana');
      });

      it('should return Aztec Sandbox for aztec:31337', () => {
        expect(service.getChainName('aztec:31337')).toBe('Aztec Sandbox');
      });

      it('should return chainId for unknown chains', () => {
        expect(service.getChainName('unknown:999')).toBe('unknown:999');
      });

      it('should handle chain service errors gracefully', () => {
        mockChainService.getChain = vi.fn().mockImplementation(() => {
          throw new Error('Chain service error');
        });

        const name = service.getChainName('eip155:1');
        expect(name).toBe('Ethereum');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Failed to get chain info from service, falling back to hardcoded names',
          expect.any(Object),
        );
      });
    });

    describe('getChainIcon', () => {
      it('should get chain icon from chain service when available', () => {
        mockChainService.getChain = vi.fn().mockReturnValue({
          name: 'Custom Chain',
          icon: 'https://example.com/icon.svg',
        });

        const icon = service.getChainIcon('custom:123');
        expect(icon).toBe('https://example.com/icon.svg');
      });

      it('should return null when chain service has no icon', () => {
        mockChainService.getChain = vi.fn().mockReturnValue({
          name: 'Custom Chain',
        });

        const icon = service.getChainIcon('custom:123');
        expect(icon).toBeNull();
      });

      it('should return null for unknown chains', () => {
        const icon = service.getChainIcon('unknown:999');
        expect(icon).toBeNull();
      });

      it('should handle chain service errors gracefully', () => {
        mockChainService.getChain = vi.fn().mockImplementation(() => {
          throw new Error('Chain service error');
        });

        const icon = service.getChainIcon('eip155:1');
        expect(icon).toBeNull();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Failed to get chain icon from service, falling back to null',
          expect.any(Object),
        );
      });
    });

    describe('getChainDisplayName', () => {
      it('should be an alias for getChainName', () => {
        const name1 = service.getChainName('eip155:1', 'evm');
        const name2 = service.getChainDisplayName('eip155:1', 'evm');
        expect(name1).toBe(name2);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('isValidAddress', () => {
      it('should return false for empty address', () => {
        expect(service.isValidAddress('', 'evm')).toBe(false);
      });

      it('should validate EVM addresses correctly', () => {
        expect(service.isValidAddress('0x1234567890123456789012345678901234567890', 'evm')).toBe(true);
        expect(service.isValidAddress('0x123', 'evm')).toBe(false);
        expect(service.isValidAddress('not-an-address', 'evm')).toBe(false);
        expect(service.isValidAddress('0xGGGG567890123456789012345678901234567890', 'evm')).toBe(false);
      });

      it('should validate Solana addresses correctly', () => {
        expect(service.isValidAddress('7VfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', 'solana')).toBe(true);
        expect(service.isValidAddress('So11111111111111111111111111111111111111112', 'solana')).toBe(true);
        expect(service.isValidAddress('short', 'solana')).toBe(false);
        expect(service.isValidAddress('0x1234567890123456789012345678901234567890', 'solana')).toBe(false);
      });

      it('should validate Aztec addresses with basic check', () => {
        expect(service.isValidAddress('aztec-address-here', 'aztec')).toBe(true);
        expect(service.isValidAddress('', 'aztec')).toBe(false);
        const longAddress = 'a'.repeat(201);
        expect(service.isValidAddress(longAddress, 'aztec')).toBe(false);
      });

      it('should return false for unknown chain types', () => {
        expect(service.isValidAddress('any-address', undefined)).toBe(false);
      });
    });

    describe('isValidAddressFormat', () => {
      it('should be an alias for isValidAddress', () => {
        const result1 = service.isValidAddress('0x1234567890123456789012345678901234567890', 'evm');
        const result2 = service.isValidAddressFormat('0x1234567890123456789012345678901234567890', 'evm');
        expect(result1).toBe(result2);
      });
    });

    describe('shouldShowConnectionInfo', () => {
      it('should return true when connected', () => {
        expect(service.shouldShowConnectionInfo(true, 'evm', 'evm')).toBe(true);
      });

      it('should return false when not connected', () => {
        expect(service.shouldShowConnectionInfo(false, 'evm', 'evm')).toBe(false);
      });

      it('should ignore chain type parameters', () => {
        expect(service.shouldShowConnectionInfo(true, null)).toBe(true);
        expect(service.shouldShowConnectionInfo(true, 'evm', 'solana')).toBe(true);
      });
    });

    describe('formatConnectionInfo', () => {
      it('should return "Not Connected" for empty info', () => {
        const result = service.formatConnectionInfo({});
        expect(result).toBe('Not Connected');
      });

      it('should format address when available', () => {
        const result = service.formatConnectionInfo({
          address: '0x1234567890123456789012345678901234567890',
          chainType: 'evm',
        });
        expect(result).toBe('0x1234...7890');
      });

      it('should include chain name when requested', () => {
        const result = service.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 'eip155:1',
            chainType: 'evm',
          },
          { showChain: true },
        );
        expect(result).toBe('0x1234...7890 • Ethereum');
      });

      it('should include wallet name when requested', () => {
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          type: 'browser',
        };

        const result = service.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            chainType: 'evm',
            wallet: walletInfo,
          },
          { showWalletName: true },
        );
        expect(result).toBe('0x1234...7890 • MetaMask');
      });

      it('should use custom separator', () => {
        const result = service.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 'eip155:1',
            chainType: 'evm',
          },
          { showChain: true, separator: ' | ' },
        );
        expect(result).toBe('0x1234...7890 | Ethereum');
      });

      it('should hide address when requested', () => {
        const walletInfo: WalletInfo = {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          type: 'browser',
        };

        const result = service.formatConnectionInfo(
          {
            address: '0x1234567890123456789012345678901234567890',
            wallet: walletInfo,
          },
          { showAddress: false, showWalletName: true },
        );
        expect(result).toBe('MetaMask');
      });
    });

    describe('getConnectionStatusText', () => {
      it('should return "Connection Error" when error is present', () => {
        const error = new Error('Test error');
        expect(service.getConnectionStatusText(false, false, error)).toBe('Connection Error');
      });

      it('should return "Connecting..." when connecting', () => {
        expect(service.getConnectionStatusText(false, true)).toBe('Connecting...');
      });

      it('should return "Connected" when connected', () => {
        expect(service.getConnectionStatusText(true, false)).toBe('Connected');
      });

      it('should return "Disconnected" when disconnected', () => {
        expect(service.getConnectionStatusText(false, false)).toBe('Disconnected');
      });

      it('should prioritize error over other states', () => {
        const error = new Error('Test error');
        expect(service.getConnectionStatusText(true, true, error)).toBe('Connection Error');
      });
    });
  });

  describe('Factory Function', () => {
    it('should create service without chain service', () => {
      const minimalDeps = {
        logger: mockLogger,
      };

      const minimalService = new ConnectionUIService(minimalDeps);
      expect(minimalService).toBeInstanceOf(ConnectionUIService);

      // Should still work without chain service
      const chainName = minimalService.getChainName('eip155:1');
      expect(chainName).toBe('Ethereum');
    });
  });
});
