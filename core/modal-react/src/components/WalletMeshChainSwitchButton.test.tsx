import { fireEvent, render, screen } from '@testing-library/react';
import type { SupportedChain } from '@walletmesh/modal-core';
import { ChainType, ConnectionStatus } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UseSwitchChainOptions } from '../hooks/useSwitchChain.js';
import { WalletMeshChainSwitchButton } from './WalletMeshChainSwitchButton.js';

// Mock the hooks
vi.mock('../hooks/useSwitchChain.js', () => ({
  useSwitchChain: vi.fn(),
}));

vi.mock('../hooks/useAccount.js', () => ({
  useAccount: vi.fn(),
}));

// Mock CSS modules
vi.mock('./WalletMeshChainSwitchButton.module.css', () => ({
  default: {
    chainSwitchButton: 'chainSwitchButton',
    current: 'current',
    switching: 'switching',
    chainIcon: 'chainIcon',
    chainName: 'chainName',
    currentIndicator: 'currentIndicator',
    switchingSpinner: 'switchingSpinner',
  },
}));

describe('WalletMeshChainSwitchButton', async () => {
  const mockUseSwitchChain = vi.mocked((await import('../hooks/useSwitchChain.js')).useSwitchChain);
  const mockUseAccount = vi.mocked((await import('../hooks/useAccount.js')).useAccount);

  const defaultTargetChain: SupportedChain = {
    chainId: '0x1',
    chainType: ChainType.Evm,
    name: 'Ethereum Mainnet',
    required: false,
    label: 'Ethereum Mainnet',
    interfaces: [],
    group: 'mainnet',
  };

  const polygonChain: SupportedChain = {
    chainId: '0x89',
    chainType: ChainType.Evm,
    name: 'Polygon',
    required: false,
    label: 'Polygon',
    interfaces: [],
    group: 'mainnet',
  };

  const defaultMockAccount = {
    // Core account state
    address: null,
    addresses: [],
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    isDisconnected: true,
    status: ConnectionStatus.Disconnected,

    // Chain information
    chain: null,
    chainType: null,

    // Wallet information
    wallet: null,
    walletId: null,
    provider: null,
    error: null,

    // Wallet selection (from useSelectedWallet)
    availableWallets: [],
    preferredWallet: null,
    isSelecting: false,

    // Wallet selection methods
    selectWallet: vi.fn(),
    setPreferredWallet: vi.fn(),
    getWalletsByChain: vi.fn(),
    getRecommendedWallet: vi.fn(),
    isWalletAvailable: vi.fn(),
    getInstallUrl: vi.fn(),
    clearSelection: vi.fn(),
    refreshAvailability: vi.fn(),
  };

  const defaultMockSwitchChain = {
    // Core methods
    switchChain: vi.fn(),
    switchChainAsync: vi.fn(),
    ensureChain: vi.fn(),

    // Validation methods
    validateChain: vi.fn(),
    isChainSupported: vi.fn(),
    isCorrectChain: vi.fn(),
    getChainMismatchMessage: vi.fn(),

    // State
    chain: null,
    chainType: null,
    chains: [],
    isSwitching: false,
    isPending: false,
    error: null,
    lastError: null,
    reset: vi.fn(),
    clearError: vi.fn(),

    // Variables and progress
    variables: undefined,

    // Chain utilities
    availableChains: [],
    canSwitch: false,
    isChainConfigured: vi.fn(),
    getChainDisplayName: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccount.mockReturnValue(defaultMockAccount);
    mockUseSwitchChain.mockReturnValue(defaultMockSwitchChain);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Ethereum Mainnet')).toBeInTheDocument();
    });

    it('should render with chain icon when provided', () => {
      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          chainIcon="/images/ethereum.svg"
        />,
      );
      const icon = screen.getByAltText('Ethereum Mainnet icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/images/ethereum.svg');
    });

    it('should apply custom className', () => {
      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          className="custom-button"
        />,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('chainSwitchButton', 'custom-button');
    });

    it('should have proper aria-label', () => {
      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to Ethereum Mainnet');
    });
  });

  describe('Current Chain State', () => {
    it('should show current indicator when on target chain', () => {
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: defaultTargetChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      expect(screen.getByText('✓')).toBeInTheDocument();
      // Verify button indicates current chain via aria-pressed
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should apply current class when on target chain', () => {
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: defaultTargetChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('current');
    });

    it('should set aria-pressed when on target chain', () => {
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: defaultTargetChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not show current indicator when on different chain', () => {
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });
  });

  describe('Switching State', () => {
    it('should show switching spinner when switching', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      // Verify button indicates switching via aria-busy and visual spinner
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button.querySelector('[class*="switchingSpinner"]')).toBeInTheDocument();
    });

    it('should apply switching class when switching', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('switching');
    });

    it('should set aria-busy when switching', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should disable button when switching', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not show switching state when already on target chain', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: defaultTargetChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      expect(screen.queryByLabelText('Switching chain')).not.toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('switching');
    });
  });

  describe('Button Interactions', () => {
    it('should call switchChain when clicked', async () => {
      const mockSwitchChain = vi.fn();
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        switchChain: mockSwitchChain,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSwitchChain).toHaveBeenCalledWith(defaultTargetChain);
    });

    it('should not call switchChain when already on target chain', () => {
      const mockSwitchChain = vi.fn();
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        switchChain: mockSwitchChain,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: defaultTargetChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSwitchChain).not.toHaveBeenCalled();
    });

    it('should not call switchChain when disabled', () => {
      const mockSwitchChain = vi.fn();
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        switchChain: mockSwitchChain,
      });

      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          disabled
        />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSwitchChain).not.toHaveBeenCalled();
    });

    it('should not call switchChain when already switching', () => {
      const mockSwitchChain = vi.fn();
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        switchChain: mockSwitchChain,
        isSwitching: true,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSwitchChain).not.toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    it('should call onChainSwitch when initiating switch', async () => {
      const onChainSwitch = vi.fn();
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          onChainSwitch={onChainSwitch}
        />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onChainSwitch).toHaveBeenCalledWith(defaultTargetChain);
    });

    it('should call onSuccess through useSwitchChain callback', () => {
      const onSuccess = vi.fn();
      let capturedOnSuccess:
        | ((data: { fromChain: SupportedChain; toChain: SupportedChain; walletId: string }) => void)
        | undefined;

      mockUseSwitchChain.mockImplementation((options?: UseSwitchChainOptions) => {
        capturedOnSuccess = options?.onSuccess;
        return defaultMockSwitchChain;
      });

      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          onSuccess={onSuccess}
        />,
      );

      // Simulate success callback
      if (capturedOnSuccess) {
        capturedOnSuccess({
          fromChain: polygonChain,
          toChain: defaultTargetChain,
          walletId: 'test-wallet',
        });
      }

      expect(onSuccess).toHaveBeenCalledWith(defaultTargetChain);
    });

    it('should call onError through useSwitchChain callback', () => {
      const onError = vi.fn();
      const error = new Error('Switch failed');
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseSwitchChain.mockImplementation((options?: UseSwitchChainOptions) => {
        capturedOnError = options?.onError;
        return defaultMockSwitchChain;
      });

      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          onError={onError}
        />,
      );

      // Simulate error callback
      if (capturedOnError) {
        capturedOnError(error);
      }

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should handle switchChain rejection without throwing', async () => {
      const error = new Error('User rejected');
      const mockSwitchChain = vi.fn().mockRejectedValue(error);

      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        switchChain: mockSwitchChain,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: polygonChain,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');

      // This should not throw even if switchChain rejects
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();

      // Verify switchChain was called
      expect(mockSwitchChain).toHaveBeenCalledWith(defaultTargetChain);
    });
  });

  describe('Disabled State', () => {
    it('should disable button when disabled prop is true', () => {
      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          disabled
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when switching', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });

      render(<WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable when both disabled prop and switching are true', () => {
      mockUseSwitchChain.mockReturnValue({
        ...defaultMockSwitchChain,
        isSwitching: true,
      });

      render(
        <WalletMeshChainSwitchButton
          targetChain={defaultTargetChain}
          chainName="Ethereum Mainnet"
          disabled
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Multiple Chains', () => {
    it('should correctly identify current chain by chainId', () => {
      const arbitrumChain: SupportedChain = {
        chainId: '0xa4b1',
        chainType: ChainType.Evm,
        name: 'Arbitrum',
        required: false,
        label: 'Arbitrum',
        interfaces: [],
        group: 'layer2',
      };

      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        chain: arbitrumChain,
      });

      const { rerender } = render(
        <WalletMeshChainSwitchButton targetChain={defaultTargetChain} chainName="Ethereum Mainnet" />,
      );

      expect(screen.queryByText('✓')).not.toBeInTheDocument();

      rerender(<WalletMeshChainSwitchButton targetChain={arbitrumChain} chainName="Arbitrum" />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });
});
