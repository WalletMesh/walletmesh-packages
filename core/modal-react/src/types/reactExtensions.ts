/**
 * Simplified types for @walletmesh/modal-react
 *
 * This provides React-specific types that extend the core simplified types
 * without duplicating everything from modal-core.
 *
 * @module types/reactExtensions
 */

// ============================================================================
// IMPORT CORE TYPES (Don't duplicate)
// ============================================================================

import type {
  ChainType,
  // Core types from modal-core (don't re-export unless React-specific behavior)
  ConnectionState,
  ModalState,
  SessionState as Session,
  SupportedChain,
  WalletInfo as Wallet,
  ModalError as WalletMeshError,
} from '@walletmesh/modal-core';

// ============================================================================
// REACT-SPECIFIC EXTENSIONS
// ============================================================================

/**
 * React-specific modal state
 * Only includes React-specific properties
 */
export interface ReactModalState extends ModalState {
  /** Whether React component has mounted */
  hasMounted: boolean;
  /** Whether store is initializing */
  isInitializing: boolean;
  /** SSR hydration state */
  isHydrated: boolean;
}

/**
 * React-specific error with action hints
 */
export interface ReactWalletMeshError extends WalletMeshError {
  /** React-specific recovery actions */
  reactActions?: ('retry' | 'refresh' | 'reload' | 'close')[];
  /** Component that can handle this error */
  componentHandler?: string;
}

/**
 * React context value for WalletMesh
 * Simplified from complex context hierarchies
 */
export interface WalletMeshContextValue {
  /** Current modal state */
  modal: ReactModalState;
  /** Current connection state */
  connection: ConnectionState;
  /** Active session (if any) */
  session: Session | null;
  /** Available wallets */
  wallets: Wallet[];
  /** Control functions */
  controls: {
    openModal: (targetChain?: ChainType) => void;
    closeModal: () => void;
    connect: (walletId?: string) => Promise<void>;
    disconnect: () => Promise<void>;
  };
  /** React-specific utilities */
  utils: {
    isSSR: boolean;
    isMounted: boolean;
    isReady: boolean;
  };
}

// ============================================================================
// HOOK RETURN TYPES (React-specific)
// ============================================================================

/**
 * Enhanced connection hook for React
 */
export interface UseConnectReturn {
  /** Connection function */
  connect: (walletId?: string) => Promise<void>;
  /** Disconnect function */
  disconnect: () => Promise<void>;
  /** Connection state */
  isConnecting: boolean;
  isConnected: boolean;
  error: WalletMeshError | null;
  /** React-specific loading states */
  isInitializing: boolean;
  isReconnecting: boolean;
  /** React-specific error handling */
  errorBoundary: {
    hasError: boolean;
    retry: () => void;
    reset: () => void;
  };
  /** Connection progress for UI */
  progress: {
    percentage: number;
    step: string;
    details?: string;
  };
}

/**
 * Enhanced account hook return
 */
export interface UseAccountReturn {
  /** Account state */
  address: string | null;
  addresses: string[];
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  /** Account management */
  switchAccount: (address: string) => Promise<void>;
  addAccount: () => Promise<void>;
  /** React-specific utilities */
  formatted: {
    address: string;
    shortAddress: string;
    ensName?: string;
  };
}

/**
 * Chain switching hook return
 */
export interface UseSwitchChainReturn {
  /** Current chain */
  chain: SupportedChain | null;
  chainType: ChainType | null;
  /** Chain switching */
  switchChain: (chain: SupportedChain) => Promise<void>;
  ensureChain: (chain: SupportedChain) => Promise<void>;
  /** Chain validation */
  isChainSupported: (chain: SupportedChain) => boolean;
  isCorrectChain: (requiredChain: SupportedChain) => boolean;
  /** UI state */
  isSwitching: boolean;
  error: ReactWalletMeshError | null;
}

/**
 * Modal control hook return
 */
export interface UseModalReturn {
  /** Modal state */
  isOpen: boolean;
  currentView: string;
  /** Modal controls */
  open: (targetChain?: ChainType) => void;
  close: () => void;
  /** React-specific modal state */
  modal: ReactModalState;
  /** SSR-safe controls */
  safeOpen: (targetChain?: ChainType) => void;
  safeClose: () => void;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for WalletMeshProvider
 */
export interface WalletMeshProviderProps {
  /** Provider configuration */
  config?: {
    /** App name */
    appName?: string;
    /** Target chains */
    chains?: SupportedChain[];
    /** Debug mode */
    debug?: boolean;
    /** SSR mode */
    ssr?: boolean;
  };
  /** Children */
  children: React.ReactNode;
  /** Error boundary fallback */
  errorFallback?: React.ComponentType<{ error: ReactWalletMeshError; retry: () => void }>;
}

/**
 * Props for connect button component
 */
export interface ConnectButtonProps {
  /** Button text */
  label?: string;
  /** Loading text */
  loadingLabel?: string;
  /** Target chain type */
  chainType?: ChainType;
  /** Custom styling */
  className?: string;
  style?: React.CSSProperties;
  /** Event handlers */
  onConnect?: (session: Session) => void;
  onError?: (error: ReactWalletMeshError) => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for wallet modal component
 */
export interface WalletModalProps {
  /** Whether modal is controlled externally */
  controlled?: boolean;
  /** Custom modal styling */
  className?: string;
  style?: React.CSSProperties;
  /** Event handlers */
  onConnect?: (session: Session) => void;
  onClose?: () => void;
  onError?: (error: ReactWalletMeshError) => void;
  /** Wallet filtering */
  filterWallets?: (wallet: Wallet) => boolean;
  /** Custom wallet renderer */
  renderWallet?: (wallet: Wallet) => React.ReactNode;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * SSR utilities type
 */
export interface SSRUtilities {
  /** Whether we're in SSR */
  isSSR: boolean;
  /** Whether client has hydrated */
  isHydrated: boolean;
  /** Whether component has mounted */
  isMounted: boolean;
  /** Safe value getter (returns null during SSR) */
  getClientValue: <T>(getValue: () => T) => T | null;
}

/**
 * React hook dependencies
 */
export type HookDependencies = {
  /** Store instance */
  store: unknown;
  /** Actions */
  actions: {
    ui: unknown;
    connections: unknown;
    transactions: unknown;
  };
  /** SSR utilities */
  ssr: SSRUtilities;
};

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: ReactWalletMeshError | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: ReactWalletMeshError;
    retry: () => void;
    reset: () => void;
  }>;
  onError?: (error: ReactWalletMeshError, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// React-specific types are already exported above as part of their definitions

// Re-export core types for convenience (but don't duplicate)
export type {
  ConnectionState,
  SessionState,
  WalletInfo,
  ModalState,
  ModalError,
  ChainType,
  SupportedChain,
} from '@walletmesh/modal-core';

// Export alias for convenience
export type { WalletInfo as Wallet } from '@walletmesh/modal-core';

// ============================================================================
// CONSTANTS
// ============================================================================

export const REACT_PACKAGE_VERSION = '2.0.0-simplified';

/**
 * React-specific hook names (for debugging)
 */
export const HOOK_NAMES = [
  'useConnect',
  'useAccount',
  'useSwitchChain',
  'useModal',
  'useProvider',
  'useBalance',
  'useTransaction',
  'useSSR',
  'useWalletEvents',
  'useService',
] as const;

export type HookName = (typeof HOOK_NAMES)[number];
