/**
 * Multi-chain configuration presets and role-based wallet management
 *
 * This module defines configuration presets for different types of dApps
 * that require multi-chain and multi-wallet support, as outlined in
 * the Multi-Chain UX Design document.
 */

import type { ChainType, SupportedChain } from '../../core/types.js';
import type { ModalView } from '../../schemas/connection.js';

/**
 * Wallet role definition for specialized dApp workflows
 */
export interface WalletRole {
  /** Role identifier */
  role: 'source' | 'destination' | 'trading' | 'payment' | 'storage' | string;

  /** Display label for the role */
  label: string;

  /** Supported chains for this role */
  chains: SupportedChain[];

  /** Whether this role is required for the dApp to function */
  required: boolean;

  /** Descriptive text explaining the role's purpose */
  description?: string;

  /** Order priority for sequential connection flows */
  order?: number;

  /** Chain type restrictions */
  chainTypes?: ChainType[];
}

/**
 * Enhanced connection state with role awareness
 */
export interface RoleAwareConnectionState {
  /** Base connection properties */
  status: 'disconnected' | 'connecting' | 'connected';
  walletId: string | null;
  accounts: string[];
  chain: SupportedChain | null;
  chainType: ChainType | null;
  address: string | null;

  /** Role-specific properties */
  role?: string;
  roleMetadata?: {
    assignedAt: number;
    capabilities: string[];
    priority: number;
  };
}

/**
 * Modal mode configurations for different dApp types
 */
export interface ModalModeConfig {
  /** Maximum number of simultaneous wallet connections */
  maxConnections: number;

  /** Whether the modal should remain open after connections */
  persistentModal: boolean;

  /** Whether to show wallet switcher UI */
  showWalletSwitcher: boolean;

  /** Whether to auto-inject single wallet connections */
  autoInjectModal?: boolean;

  /** Required wallet roles for this mode */
  roles?: WalletRole[];

  /** Whether to show bridge-specific UI */
  showBridgeUI?: boolean;

  /** Whether connections are asset-centric */
  assetCentric?: boolean;

  /** Description of this mode */
  description: string;

  /** Initial view to show when modal opens */
  initialView?: ModalView;

  /** UI configuration */
  ui?: {
    showProgress?: boolean;
    allowSkipOptional?: boolean;
    showWalletComparison?: boolean;
    theme?: 'compact' | 'detailed' | 'dashboard';
  };

  /** Validation settings */
  validation?: {
    checkChainCompatibility?: boolean;
    validateAddressFormats?: boolean;
    requirePermissionCheck?: boolean;
  };

  /** Event callbacks */
  callbacks?: {
    onRoleAssigned?: (walletId: string, role: string) => void;
    onAllRequiredConnected?: (connections: RoleAwareConnectionState[]) => void;
    onChainTypeConflict?: (conflict: ChainTypeConflict) => void;
  };
}

/**
 * Chain type compatibility conflict information
 */
export interface ChainTypeConflict {
  /** Source chain type */
  fromChainType: ChainType;

  /** Target chain type */
  toChainType: ChainType;

  /** Conflicting address format */
  address: string;

  /** Suggested resolution */
  resolution: 'convert' | 'reject' | 'warn';

  /** Error message */
  message: string;
}

/**
 * Pre-defined wallet mode configurations
 */
export const WALLET_MODES = {
  /**
   * Single wallet, single chain - traditional dApp mode
   */
  SIMPLE: {
    maxConnections: 1,
    autoInjectModal: true,
    showWalletSwitcher: false,
    persistentModal: false,
    description: 'Single wallet, single chain',
    initialView: 'walletSelection' as ModalView,
    ui: {
      theme: 'compact' as const,
      showProgress: false,
    },
    validation: {
      checkChainCompatibility: true,
    },
  } satisfies ModalModeConfig,

  /**
   * Multiple independent wallets without specific roles
   */
  MULTI_WALLET: {
    maxConnections: 5,
    persistentModal: true,
    showWalletSwitcher: true,
    description: 'Multiple independent wallets',
    initialView: 'multiWalletDashboard' as ModalView,
    ui: {
      theme: 'dashboard' as const,
      showProgress: true,
      showWalletComparison: true,
    },
    validation: {
      checkChainCompatibility: true,
      validateAddressFormats: true,
    },
  } satisfies ModalModeConfig,

  /**
   * Bridge dApp - source and destination wallets
   */
  BRIDGE: {
    maxConnections: 2,
    persistentModal: true,
    showWalletSwitcher: true,
    showBridgeUI: true,
    description: 'Source and destination wallets for bridging',
    initialView: 'bridgeSetup' as ModalView,
    roles: [
      {
        role: 'source',
        label: 'Source Wallet',
        chains: [], // Will be populated based on supported chains
        required: true,
        order: 1,
        description: 'Wallet containing assets to bridge from',
      },
      {
        role: 'destination',
        label: 'Destination Wallet',
        chains: [], // Will be populated based on supported chains
        required: true,
        order: 2,
        description: 'Wallet to receive bridged assets',
      },
    ],
    ui: {
      theme: 'detailed' as const,
      showProgress: true,
      allowSkipOptional: false,
    },
    validation: {
      checkChainCompatibility: true,
      validateAddressFormats: true,
      requirePermissionCheck: true,
    },
  } satisfies ModalModeConfig,

  /**
   * Marketplace dApp - role-based wallets for different operations
   */
  MARKETPLACE: {
    maxConnections: 3,
    assetCentric: true,
    persistentModal: true,
    showWalletSwitcher: true,
    description: 'Role-based wallets for marketplace operations',
    initialView: 'marketplaceAssets' as ModalView,
    roles: [
      {
        role: 'trading',
        label: 'Trading Wallet',
        chains: [], // Will be populated based on supported chains
        required: true,
        description: 'Wallet for buying and selling NFTs',
      },
      {
        role: 'payment',
        label: 'Payment Wallet',
        chains: [], // Will be populated based on supported chains
        required: false,
        description: 'Wallet for payment processing',
      },
      {
        role: 'storage',
        label: 'Storage Wallet',
        chains: [], // Will be populated based on supported chains
        required: false,
        description: 'Cold storage wallet for valuable assets',
      },
    ],
    ui: {
      theme: 'detailed' as const,
      showProgress: true,
      allowSkipOptional: true,
      showWalletComparison: true,
    },
    validation: {
      checkChainCompatibility: true,
      validateAddressFormats: true,
    },
  } satisfies ModalModeConfig,
} as const;

/**
 * Type for wallet mode keys
 */
export type WalletModeKey = keyof typeof WALLET_MODES;

/**
 * Persistent modal configuration for multi-step flows
 */
export interface PersistentModalConfig {
  /** Modal behavior mode */
  mode: 'single' | 'multi' | 'sequential' | 'role-based';

  /** Required wallet connections */
  requiredConnections: Array<{
    role: string;
    chains: SupportedChain[];
    label: string;
    required: boolean;
    order?: number;
  }>;

  /** UI configuration */
  ui: {
    showProgress: boolean;
    allowSkipOptional: boolean;
    showWalletComparison: boolean;
    theme: 'compact' | 'detailed' | 'dashboard';
  };

  /** Validation configuration */
  validation: {
    checkChainCompatibility: boolean;
    validateAddressFormats: boolean;
    requirePermissionCheck: boolean;
  };

  /** Event callbacks */
  callbacks: {
    onRoleAssigned?: (walletId: string, role: string) => void;
    onAllRequiredConnected?: (connections: RoleAwareConnectionState[]) => void;
    onChainTypeConflict?: (conflict: ChainTypeConflict) => void;
  };
}

/**
 * Connection requirement for role-based flows
 */
export interface ConnectionRequirement {
  /** Role identifier */
  role: string;

  /** Supported chain IDs */
  chains: SupportedChain[];

  /** Display label */
  label: string;

  /** Whether this connection is required */
  required: boolean;

  /** Connection order for sequential flows */
  order?: number;

  /** Chain type restrictions */
  chainTypes?: ChainType[];

  /** Validation rules */
  validation?: {
    addressFormat?: RegExp;
    requiredMethods?: string[];
    minBalance?: string;
  };
}

/**
 * Bridge configuration specifically for bridge dApps
 */
export interface BridgeConfiguration {
  /** Source chain configuration */
  sourceChains: SupportedChain[];

  /** Destination chain configuration */
  destinationChains: SupportedChain[];

  /** Supported bridge routes */
  supportedRoutes: Array<{
    from: SupportedChain;
    to: SupportedChain;
    supported: boolean;
    estimatedTime?: number;
    fees?: string;
  }>;

  /** Whether to allow chain swapping */
  allowDirectionSwap: boolean;

  /** Bridge-specific validation */
  validation: {
    validateRoutes: boolean;
    checkLiquidity: boolean;
    enforceMinimums: boolean;
  };
}

/**
 * Asset-centric connection flow for marketplace dApps
 */
export interface AssetConnectionFlow {
  /** Asset information */
  asset: {
    chain: SupportedChain;
    tokenId: string;
    name: string;
    type: 'NFT' | 'token' | 'native';
  };

  /** Required operations for this asset */
  requiredOperations: Array<'view' | 'transfer' | 'approve' | 'sign'>;

  /** Compatible wallets for this asset */
  compatibleWallets: string[];

  /** Preferred wallet (if any) */
  preferredWallet?: string;

  /** Auto-connection rules */
  autoConnect?: {
    enabled: boolean;
    conditions: string[];
  };
}

/**
 * Multi-wallet dashboard configuration
 */
export interface MultiWalletDashboardConfig {
  /** Maximum displayed connections */
  maxDisplayedConnections: number;

  /** Grouping strategy */
  groupBy: 'chain' | 'wallet' | 'role' | 'none';

  /** Sorting strategy */
  sortBy: 'recent' | 'balance' | 'alphabetical' | 'role';

  /** Show/hide elements */
  ui: {
    showBalances: boolean;
    showChainIcons: boolean;
    showRoleLabels: boolean;
    showLastActive: boolean;
    compactMode: boolean;
  };

  /** Actions available per connection */
  actions: {
    allowDisconnect: boolean;
    allowChainSwitch: boolean;
    allowRoleChange: boolean;
    showDetails: boolean;
  };
}
