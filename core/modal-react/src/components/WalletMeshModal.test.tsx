import { fireEvent, render, screen } from '@testing-library/react';
import {
  ChainType,
  type ConnectionStatus,
  type WalletInfo,
  type WalletMeshState,
} from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStore } from '../hooks/internal/useStore.js';
import { useAccount } from '../hooks/useAccount.js';
import { useConfig } from '../hooks/useConfig.js';
import { useConnect } from '../hooks/useConnect.js';

// Mock the hooks
vi.mock('../hooks/useConfig.js');
vi.mock('../hooks/useAccount.js');
vi.mock('../hooks/useConnect.js');
vi.mock('../hooks/internal/useStore.js');

// Create a simplified version of WalletMeshModal for testing
const TestWalletMeshModal = () => {
  const { isOpen, close } = useConfig();
  const { isConnected, isConnecting, wallet } = useAccount();
  const { connect, wallets, error, reset } = useConnect();
  const targetChainType = useStore(
    (state: { ui?: { targetChainType?: string } }) => state?.ui?.targetChainType,
  );

  if (!isOpen) return null;

  if (error) {
    return (
      <dialog aria-labelledby="wallet-modal-title" open>
        <div>
          <h3>Connection Failed</h3>
          <p>{(error as { message?: string })?.message || String(error)}</p>
          {(error as { code?: string })?.code === 'USER_REJECTED' && (
            <button type="button" onClick={reset}>
              Try Again
            </button>
          )}
          <button type="button" onClick={close}>
            Close
          </button>
        </div>
      </dialog>
    );
  }

  if (isConnecting) {
    return (
      <dialog aria-labelledby="wallet-modal-title" open>
        <div>
          <h3>Connecting</h3>
          <p>Please confirm the connection in your wallet...</p>
        </div>
      </dialog>
    );
  }

  if (isConnected) {
    return (
      <dialog aria-labelledby="wallet-modal-title" open>
        <div>
          <h3>Connected!</h3>
          {wallet && <div>Wallet: {wallet.name}</div>}
          <button type="button" onClick={() => close()}>
            Disconnect
          </button>
        </div>
      </dialog>
    );
  }

  // Wallet selection view
  const filteredWallets = targetChainType
    ? wallets.filter((wallet: { chains?: string[] }) => wallet.chains?.includes(targetChainType))
    : wallets;

  return (
    <dialog aria-labelledby="wallet-modal-title" open>
      <div>
        <h2 id="wallet-modal-title">Connect a wallet</h2>
        <div>
          {filteredWallets.map((wallet: { id: string; name: string; icon?: string }) => (
            <button key={wallet.id} type="button" onClick={() => connect(wallet.id, { showModal: false })}>
              {wallet.icon && <img src={wallet.icon} alt={wallet.name} />}
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={close}>
          Close
        </button>
      </div>
    </dialog>
  );
};

describe('WalletMeshModal (Simplified)', () => {
  const mockUseConfig = vi.mocked(useConfig);
  const mockUseAccount = vi.mocked(useAccount);
  const mockUseConnect = vi.mocked(useConnect);
  const mockUseStore = vi.mocked(useStore);

  const defaultMockConfig = {
    // Client
    client: null,

    // Modal control
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),

    // Configuration
    appName: 'Test App',
    appDescription: 'Test Description',
    appUrl: 'https://example.com',
    appIcon: 'https://example.com/icon.png',
    chains: [],

    // Discovery state
    wallets: [],
    isDiscovering: false,
    refreshWallets: vi.fn(),

    // Theme
    theme: 'light' as const,
    setTheme: vi.fn(),

    // Wallet filtering
    walletFilter: null,
    setWalletFilter: vi.fn(),
    clearWalletFilter: vi.fn(),
    filteredWallets: [],
    debug: false,
  };

  const defaultMockAccount = {
    // Core account state
    address: null,
    addresses: [],
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    isDisconnected: true,
    status: 'disconnected' as ConnectionStatus,

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

  const defaultMockConnect = {
    // Connection methods
    connect: vi.fn(),
    disconnect: vi.fn(),
    disconnectAll: vi.fn(),
    retry: vi.fn(),

    // State
    wallets: [
      { id: 'metamask', name: 'MetaMask', icon: 'metamask.svg', chains: ['evm' as ChainType] },
      { id: 'phantom', name: 'Phantom', icon: 'phantom.svg', chains: ['solana' as ChainType] },
    ] as WalletInfo[],
    connectedWallets: [],
    status: 'disconnected' as ConnectionStatus,
    isConnecting: false,
    isDisconnecting: false,
    isPending: false,
    error: null,
    reset: vi.fn(),

    // Progress tracking
    variables: undefined,
    progress: 0,
    progressInfo: null,

    // Utility flags
    canDisconnect: false,
  };

  const defaultMockStore: Partial<WalletMeshState> = {
    ui: {
      modalOpen: false,
      currentView: 'walletSelection',
      viewHistory: [],
      loading: {
        discovery: false,
        connection: false,
        transaction: false,
      },
      errors: {},
    },
    entities: {
      wallets: {},
      sessions: {},
      transactions: {},
    },
    active: {
      walletId: null,
      sessionId: null,
      transactionId: null,
      selectedWalletId: null,
    },
    meta: {
      lastDiscoveryTime: null,
      connectionTimestamps: {},
      availableWalletIds: [],
      discoveryErrors: [],
      transactionStatus: 'idle',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfig.mockReturnValue(defaultMockConfig);
    mockUseAccount.mockReturnValue(defaultMockAccount);
    mockUseConnect.mockReturnValue(defaultMockConnect);
    // Default mock - returns null targetChainType
    mockUseStore.mockImplementation((selector: (state: WalletMeshState) => unknown) =>
      selector(defaultMockStore as WalletMeshState),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<TestWalletMeshModal />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });

      render(<TestWalletMeshModal />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display wallet selection by default', () => {
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });

      render(<TestWalletMeshModal />);
      expect(screen.getByText('Connect a wallet')).toBeInTheDocument();
      expect(screen.getByText('MetaMask')).toBeInTheDocument();
      expect(screen.getByText('Phantom')).toBeInTheDocument();
    });
  });

  describe('Wallet Selection', () => {
    it('should call connect when selecting a wallet', () => {
      const mockConnect = vi.fn();
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });
      mockUseConnect.mockReturnValue({
        ...defaultMockConnect,
        connect: mockConnect,
      });

      render(<TestWalletMeshModal />);
      const metamaskButton = screen.getByText('MetaMask').closest('button');
      if (metamaskButton) {
        fireEvent.click(metamaskButton);
      }

      expect(mockConnect).toHaveBeenCalledWith('metamask', { showModal: false });
    });

    it('should filter wallets by targetChainType', () => {
      // Clear all previous mocks to ensure clean state
      vi.clearAllMocks();

      // Set up mocks with specific values for this test
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });

      mockUseAccount.mockReturnValue(defaultMockAccount);
      mockUseConnect.mockReturnValue(defaultMockConnect);

      // Mock useStore to return 'evm' for the targetChainType selector
      mockUseStore.mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState: WalletMeshState = {
          ...defaultMockStore,
          ui: {
            ...(defaultMockStore.ui || {}),
            targetChainType: 'evm' as ChainType,
          },
        } as WalletMeshState;
        return selector(mockState);
      });

      render(<TestWalletMeshModal />);

      // MetaMask has chains: ['evm'] so should be included
      expect(screen.getByText('MetaMask')).toBeInTheDocument();
      // Phantom has chains: ['solana'] so should be filtered out when targetChainType is 'evm'
      expect(screen.queryByText('Phantom')).not.toBeInTheDocument();
    });
  });

  describe('Connection States', () => {
    it('should show connecting view', () => {
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        isConnecting: true,
      });

      render(<TestWalletMeshModal />);
      expect(screen.getByText('Connecting')).toBeInTheDocument();
      expect(screen.getByText('Please confirm the connection in your wallet...')).toBeInTheDocument();
    });

    it('should show connected view', () => {
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });
      mockUseAccount.mockReturnValue({
        ...defaultMockAccount,
        isConnected: true,
        wallet: { id: 'metamask', name: 'MetaMask', icon: 'metamask.svg', chains: [ChainType.Evm] },
      });

      render(<TestWalletMeshModal />);
      expect(screen.getByText('Connected!')).toBeInTheDocument();
      expect(screen.getByText('Wallet: MetaMask')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error when connection fails', () => {
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });
      mockUseConnect.mockReturnValue({
        ...defaultMockConnect,
        error: new Error('Connection failed'),
      });

      render(<TestWalletMeshModal />);
      expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should show Try Again button for recoverable errors', () => {
      mockUseConfig.mockReturnValue({
        ...defaultMockConfig,
        isOpen: true,
      });
      mockUseConnect.mockReturnValue({
        ...defaultMockConnect,
        error: { code: 'USER_REJECTED', message: 'User rejected connection' },
      });

      render(<TestWalletMeshModal />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});
