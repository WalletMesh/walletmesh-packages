/**
 * Headless Modal Core API - Semantic Data Only
 *
 * This module provides pure data interfaces for headless wallet connection management.
 * No UI components, styling, or DOM manipulation - only semantic information
 * that framework adapters can use to build their own UI components.
 *
 * @module headless
 * @public
 */

import type { SupportedChain } from '../../types.js';

/**
 * Semantic wallet information without styling hints
 */
export interface WalletDisplayData {
  wallet: {
    id: string;
    name: string;
    icon: string; // Just the URL/path, no styling
    homepage?: string;
  };
  status: {
    installed: boolean;
    available: boolean;
    recent: boolean;
    recommended: boolean;
  };
  capabilities: {
    chains: string[];
    features: string[];
  };
}

/**
 * Semantic connection state information
 */
export interface ConnectionDisplayData {
  state: 'idle' | 'selecting' | 'connecting' | 'connected' | 'error';
  progress?: {
    message: string;
    percentage?: number;
  };
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
    action?: 'retry' | 'select-different' | 'close';
  };
  // Connection details - available when state is 'connected'
  address?: string;
  chain?: SupportedChain;
  accounts?: string[];
}

/**
 * Semantic categorization for UI decisions
 */
export interface WalletUIMetadata {
  category: 'injected' | 'mobile' | 'hardware' | 'walletconnect';
  features: ('sign' | 'encrypt' | 'multi-account')[];
  popularity?: number; // For sorting
  lastUsed?: number; // Timestamp for recency
}

/**
 * Helper functions for common UI patterns
 */
export const displayHelpers = {
  /**
   * Sort wallets by priority (installed -> recent -> recommended -> alphabetical)
   */
  sortWallets(wallets: WalletDisplayData[]): WalletDisplayData[] {
    return wallets.sort((a, b) => {
      // Installed first
      if (a.status.installed && !b.status.installed) return -1;
      if (!a.status.installed && b.status.installed) return 1;

      // Recent second
      if (a.status.recent && !b.status.recent) return -1;
      if (!a.status.recent && b.status.recent) return 1;

      // Recommended third
      if (a.status.recommended && !b.status.recommended) return -1;
      if (!a.status.recommended && b.status.recommended) return 1;

      // Alphabetical
      return a.wallet.name.localeCompare(b.wallet.name);
    });
  },

  /**
   * Group wallets by installation status
   */
  groupWallets(wallets: WalletDisplayData[]): Map<string, WalletDisplayData[]> {
    const groups = new Map<string, WalletDisplayData[]>();

    for (const wallet of wallets) {
      if (wallet.status.installed) {
        const installed = groups.get('installed') || [];
        installed.push(wallet);
        groups.set('installed', installed);
      } else {
        const available = groups.get('available') || [];
        available.push(wallet);
        groups.set('available', available);
      }
    }

    return groups;
  },

  /**
   * Get appropriate status label for a wallet
   */
  getWalletStatusLabel(wallet: WalletDisplayData): string {
    if (wallet.status.installed) return 'Installed';
    if (wallet.status.recent) return 'Recently Used';
    if (wallet.status.recommended) return 'Recommended';
    return 'Available';
  },
};

/**
 * Headless modal state that provides semantic data only
 */
export interface HeadlessModalState {
  /**
   * Current connection state
   */
  connection: ConnectionDisplayData;

  /**
   * Available wallets with semantic information
   */
  wallets: WalletDisplayData[];

  /**
   * Currently selected wallet ID
   */
  selectedWalletId?: string | undefined;

  /**
   * Whether the modal is open/visible (for framework adapters to use)
   */
  isOpen: boolean;
}

/**
 * Actions that can be performed in headless mode
 */
export interface HeadlessModalActions {
  /**
   * Open the modal
   */
  openModal(): void;

  /**
   * Close the modal
   */
  closeModal(): void;

  /**
   * Select a wallet
   */
  selectWallet(walletId: string): Promise<void>;

  /**
   * Connect to the selected wallet
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the current wallet
   */
  disconnect(): Promise<void>;

  /**
   * Retry the last failed operation
   */
  retry(): Promise<void>;
}

/**
 * Headless modal interface - pure business logic without UI
 */
export interface HeadlessModal {
  /**
   * Get current state
   */
  getState(): HeadlessModalState;

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: HeadlessModalState) => void): () => void;

  /**
   * Get available actions
   */
  getActions(): HeadlessModalActions;

  /**
   * Destroy the modal and clean up resources
   */
  destroy(): void;
}
