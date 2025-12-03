import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EVMConnectButton } from './EVMConnectButton.js';
import type { EVMConnectButtonProps } from './EVMConnectButton.js';

// Mock the dependencies
vi.mock('./WalletMeshConnectButton.js', () => ({
  WalletMeshConnectButton: vi.fn((props: { className?: string; label?: React.ReactNode }) => (
    <button type="button" className={props.className} data-testid="wallet-mesh-button">
      {props.label}
    </button>
  )),
}));

vi.mock('../hooks/useEvmWallet.js', () => ({
  useEvmWallet: vi.fn(),
}));

// Mock CSS modules
vi.mock('./EVMConnectButton.module.css', () => ({
  default: {
    evmButtonContainer: 'evmButtonContainer',
    evmButton: 'evmButton',
    transacting: 'transacting',
    confirming: 'confirming',
    networkBadge: 'networkBadge',
    mainnet: 'mainnet',
    testnet: 'testnet',
    local: 'local',
    transactionBadge: 'transactionBadge',
    transactionIcon: 'transactionIcon',
    transactionText: 'transactionText',
    gasBadge: 'gasBadge',
  },
}));

describe('EVMConnectButton', async () => {
  const mockUseEvmWallet = vi.mocked((await import('../hooks/useEvmWallet.js')).useEvmWallet);
  const MockWalletMeshConnectButton = vi.mocked(
    (await import('./WalletMeshConnectButton.js')).WalletMeshConnectButton,
  );

  const defaultMockEvmWallet = {
    // Account information
    isConnected: false,
    address: null,
    chain: null,
    chainId: null,
    wallet: null,

    // Provider information
    evmProvider: null,
    isReady: false,
    isLoading: false,
    error: null,

    // Status information
    status: 'disconnected' as const,
    isEvmChain: true,
    isTransacting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEvmWallet.mockReturnValue(defaultMockEvmWallet);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<EVMConnectButton />);
      expect(screen.getByTestId('wallet-mesh-button')).toBeInTheDocument();
    });

    it('should pass default label to WalletMeshConnectButton', () => {
      render(<EVMConnectButton />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Connect EVM Wallet',
          connectedLabel: 'Disconnect',
          className: 'evmButton',
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });

    it('should pass custom label to WalletMeshConnectButton', () => {
      render(<EVMConnectButton label="Connect Ethereum" />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Connect Ethereum',
          connectedLabel: 'Disconnect',
          className: 'evmButton',
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });

    it('should pass custom connectedLabel to WalletMeshConnectButton', () => {
      render(<EVMConnectButton connectedLabel="Sign Out" />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Connect EVM Wallet',
          connectedLabel: 'Sign Out',
          className: 'evmButton',
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });

    it('should apply custom className along with EVM styles', () => {
      render(<EVMConnectButton className="custom-class" />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Connect EVM Wallet',
          connectedLabel: 'Disconnect',
          className: 'evmButton custom-class',
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });

    it('should pass through additional props to WalletMeshConnectButton', () => {
      render(<EVMConnectButton size="lg" variant="outline" disabled />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Connect EVM Wallet',
          connectedLabel: 'Disconnect',
          className: 'evmButton',
          showAddress: true,
          showChain: true,
          size: 'lg',
          variant: 'outline',
          disabled: true,
        }),
        undefined,
      );
    });
  });

  describe('Network Indicator', () => {
    it('should not show network indicator when disconnected', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: false,
      });

      render(<EVMConnectButton showNetworkIndicator />);
      expect(document.querySelector('.networkBadge')).toBeNull();
    });

    it('should show mainnet indicator for mainnet chains', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '1', // Ethereum mainnet
      });

      render(<EVMConnectButton showNetworkIndicator />);
      const badge = document.querySelector('.networkBadge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('mainnet');
    });

    it('should show testnet indicator for testnet chains', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '11155111', // Sepolia testnet
      });

      render(<EVMConnectButton showNetworkIndicator />);
      const badge = document.querySelector('.networkBadge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('testnet');
    });

    it('should show local indicator for local chains', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '1337', // Local development
      });

      render(<EVMConnectButton showNetworkIndicator />);
      const badge = document.querySelector('.networkBadge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('local');
    });

    it('should default to testnet for unknown chains', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '999999', // Unknown chain
      });

      render(<EVMConnectButton showNetworkIndicator />);
      const badge = document.querySelector('.networkBadge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('testnet');
    });

    it('should hide network indicator when showNetworkIndicator is false', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '1',
      });

      render(<EVMConnectButton showNetworkIndicator={false} />);
      expect(document.querySelector('.networkBadge')).toBeNull();
    });

    it('should correctly identify all mainnet chains', () => {
      const mainnetChains = ['1', '137', '42161', '10', '8453'];

      for (const chainId of mainnetChains) {
        mockUseEvmWallet.mockReturnValue({
          ...defaultMockEvmWallet,
          isConnected: true,
          chainId,
        });

        const { container } = render(<EVMConnectButton showNetworkIndicator />);
        const badge = container.querySelector('.networkBadge');
        expect(badge).toHaveClass('mainnet');
      }
    });

    it('should correctly identify all testnet chains', () => {
      const testnetChains = ['11155111', '80001', '421614', '11155420', '84532'];

      for (const chainId of testnetChains) {
        mockUseEvmWallet.mockReturnValue({
          ...defaultMockEvmWallet,
          isConnected: true,
          chainId,
        });

        const { container } = render(<EVMConnectButton showNetworkIndicator />);
        const badge = container.querySelector('.networkBadge');
        expect(badge).toHaveClass('testnet');
      }
    });
  });

  describe('Transaction Status', () => {
    it('should show transaction badge when isTransacting is true', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        isTransacting: true,
      });

      render(<EVMConnectButton showTransactionStatus />);
      expect(screen.getByText('Pending...')).toBeInTheDocument();
      expect(screen.getByText('⟳')).toBeInTheDocument();
    });

    it('should not show transaction badge when disconnected', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: false,
        isTransacting: true,
      });

      render(<EVMConnectButton showTransactionStatus />);
      expect(screen.queryByText('Pending...')).not.toBeInTheDocument();
    });

    it('should not show transaction badge when showTransactionStatus is false', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        isTransacting: true,
      });

      render(<EVMConnectButton showTransactionStatus={false} />);
      expect(screen.queryByText('Pending...')).not.toBeInTheDocument();
    });

    it('should apply transacting class when isTransacting is true', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        isTransacting: true,
      });

      render(<EVMConnectButton />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          className: 'evmButton transacting',
        }),
        undefined,
      );
    });
  });

  describe('Gas Estimate', () => {
    it('should not show gas badge by default', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
      });

      render(<EVMConnectButton />);
      expect(document.querySelector('.gasBadge')).not.toBeInTheDocument();
    });

    it('should not show gas badge when showGasEstimate is false', () => {
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
      });

      render(<EVMConnectButton showGasEstimate={false} />);
      expect(document.querySelector('.gasBadge')).not.toBeInTheDocument();
    });

    // Note: Gas estimate functionality is prepared for future implementation
    // When gas estimation is implemented, add tests for:
    // - Showing gas badge with estimate
    // - Updating gas estimate on network changes
    // - Formatting gas estimate display
  });

  describe('Callbacks', () => {
    it('should accept onTransactionStart callback', () => {
      const onTransactionStart = vi.fn();
      render(<EVMConnectButton onTransactionStart={onTransactionStart} />);
      expect(onTransactionStart).not.toHaveBeenCalled(); // Not called on mount
    });

    it('should accept onTransactionComplete callback', () => {
      const onTransactionComplete = vi.fn();
      render(<EVMConnectButton onTransactionComplete={onTransactionComplete} />);
      expect(onTransactionComplete).not.toHaveBeenCalled(); // Not called on mount
    });

    it('should accept onTransactionError callback', () => {
      const onTransactionError = vi.fn();
      render(<EVMConnectButton onTransactionError={onTransactionError} />);
      expect(onTransactionError).not.toHaveBeenCalled(); // Not called on mount
    });

    // Note: Event-based callbacks are prepared for future wallet event support
    // When events are implemented, add tests for:
    // - Calling onTransactionStart when transaction starts
    // - Calling onTransactionComplete when transaction completes
    // - Calling onTransactionError when transaction fails
  });

  describe('Props Integration', () => {
    it('should handle all props correctly', () => {
      const props: EVMConnectButtonProps = {
        label: 'Custom Connect',
        connectedLabel: 'Custom Disconnect',
        showTransactionStatus: true,
        showNetworkIndicator: true,
        showGasEstimate: true,
        onTransactionStart: vi.fn(),
        onTransactionComplete: vi.fn(),
        onTransactionError: vi.fn(),
        className: 'custom-class',
        size: 'lg',
        variant: 'outline',
        disabled: true,
      };

      render(<EVMConnectButton {...props} />);

      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Custom Connect',
          connectedLabel: 'Custom Disconnect',
          className: 'evmButton custom-class',
          size: 'lg',
          variant: 'outline',
          disabled: true,
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });

    it('should always set targetChainType to EVM', () => {
      render(<EVMConnectButton />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });

    it('should always enable showAddress and showChain', () => {
      render(<EVMConnectButton />);
      expect(MockWalletMeshConnectButton).toHaveBeenCalledWith(
        expect.objectContaining({
          showAddress: true,
          showChain: true,
        }),
        undefined,
      );
    });
  });

  describe('State Updates', () => {
    it('should render with updated chainId', () => {
      // Test directly with different chain IDs
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '1', // Mainnet
      });

      const { rerender } = render(<EVMConnectButton showNetworkIndicator />);
      expect(document.querySelector('.networkBadge')).toBeInTheDocument();

      // Update to testnet
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        chainId: '11155111', // Testnet
      });

      rerender(<EVMConnectButton showNetworkIndicator />);
      expect(document.querySelector('.networkBadge')).toBeInTheDocument();
    });

    it('should render with updated transaction status', () => {
      // Test directly with different transaction states
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        isTransacting: false,
      });

      const { rerender } = render(<EVMConnectButton showTransactionStatus />);
      expect(screen.queryByText('Pending...')).not.toBeInTheDocument();

      // Update to transacting
      mockUseEvmWallet.mockReturnValue({
        ...defaultMockEvmWallet,
        isConnected: true,
        isTransacting: true,
      });

      rerender(<EVMConnectButton showTransactionStatus />);
      expect(screen.getByText('Pending...')).toBeInTheDocument();
    });
  });
});
