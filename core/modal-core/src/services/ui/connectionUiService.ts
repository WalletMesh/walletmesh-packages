/**
 * Connection UI service for WalletMesh
 *
 * Provides unified UI utilities for connection display and button management.
 * This service combines the functionality of ConnectButtonService and ConnectionDisplayService
 * to provide a single interface for all connection-related UI logic.
 *
 * @module services/ui/ConnectionUIService
 * @category Services
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletInfo } from '../../types.js';
import type { ChainType } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import type { ChainService } from '../chain/ChainService.js';

/**
 * Button state types for connect button
 */
export type ConnectButtonState = 'disconnected' | 'connecting' | 'connected';

/**
 * Content returned by the connect button service
 */
export interface ConnectButtonContent {
  /** Main text to display on the button */
  text: string;
  /** Whether to show a status indicator (green dot, spinner, etc.) */
  showIndicator: boolean;
  /** Type of indicator to show */
  indicatorType: 'success' | 'loading' | 'none';
  /** Whether the button should be disabled */
  disabled: boolean;
  /** Additional display information (address, chain, etc.) */
  displayInfo?: {
    address?: string;
    chainName?: string;
    walletName?: string;
  };
}

/**
 * Options for button content generation
 */
export interface ConnectButtonOptions {
  /** Chain type to generate content for */
  chainType?: ChainType;
  /** Custom labels for different states */
  labels?: {
    disconnected?: string;
    connecting?: string;
    connected?: string;
  };
  /** Whether to show chain information */
  showChain?: boolean;
  /** Whether to show wallet information */
  showWallet?: boolean;
}

/**
 * UI-specific connection information structure
 */
export interface UIConnectionInfo {
  address?: string | null;
  chainId?: string | null;
  chainType?: ChainType | null;
  wallet?: WalletInfo | null;
}

/**
 * Options for connection display
 */
export interface ConnectionDisplayOptions {
  /** Chain type to format address for */
  chainType?: ChainType;
  /** Maximum length for address display */
  maxLength?: number;
  /** Number of characters to show at start and end */
  prefixLength?: number;
  suffixLength?: number;
  /** Whether to show chain name */
  showChain?: boolean;
  /** Whether to show wallet name */
  showWallet?: boolean;
}

/**
 * Dependencies required by ConnectionUIService
 */
export interface ConnectionUIServiceDependencies extends BaseServiceDependencies {
  /** Chain service for chain information lookup (optional - falls back to hardcoded names) */
  chainService?: ChainService;
}

/**
 * Unified connection UI service that combines button and display functionality
 *
 * @internal
 */
export class ConnectionUIService {
  private logger: Logger;
  private chainService?: ChainService;
  // Connection Information Management
  private connectionInfo: UIConnectionInfo = {
    address: null,
    chainId: null,
    chainType: null,
    wallet: null,
  };

  constructor(dependencies: ConnectionUIServiceDependencies) {
    this.logger = dependencies.logger;
    if (dependencies.chainService) {
      this.chainService = dependencies.chainService;
    }
  }

  // ======================================
  // Button State Management
  // ======================================

  /**
   * Get the current button state based on connection status
   */
  public getButtonState(isConnected: boolean, isConnecting: boolean): ConnectButtonState {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  }

  /**
   * Generate button content based on current state
   */
  public getButtonContent(state: ConnectButtonState, options?: ConnectButtonOptions): ConnectButtonContent {
    const labels = options?.labels || {};

    switch (state) {
      case 'disconnected':
        return {
          text: labels.disconnected || 'Connect Wallet',
          showIndicator: false,
          indicatorType: 'none',
          disabled: false,
        };

      case 'connecting':
        return {
          text: labels.connecting || 'Connecting...',
          showIndicator: true,
          indicatorType: 'loading',
          disabled: true,
        };

      case 'connected': {
        const displayInfo: ConnectButtonContent['displayInfo'] = {};

        if (this.connectionInfo.address) {
          displayInfo.address = this.formatAddress(
            this.connectionInfo.address,
            options?.chainType || this.connectionInfo.chainType || undefined,
          );
        }

        if (options?.showChain && this.connectionInfo.chainId) {
          displayInfo.chainName = this.getChainName(
            this.connectionInfo.chainId,
            options.chainType || this.connectionInfo.chainType || undefined,
          );
        }

        if (options?.showWallet && this.connectionInfo.wallet) {
          displayInfo.walletName = this.connectionInfo.wallet.name;
        }

        return {
          text: labels.connected || displayInfo.address || 'Connected',
          showIndicator: true,
          indicatorType: 'success',
          disabled: false,
          displayInfo,
        };
      }
    }
  }

  // ======================================
  // Connection Information Management
  // ======================================

  /**
   * Update the stored connection information
   */
  public updateConnectionInfo(info: Partial<UIConnectionInfo>): void {
    this.connectionInfo = {
      ...this.connectionInfo,
      ...info,
    };
    this.logger.debug('Connection info updated', this.connectionInfo);
  }

  /**
   * Get the current connection information
   */
  public getConnectionInfo(): UIConnectionInfo {
    return { ...this.connectionInfo };
  }

  /**
   * Clear the connection information
   */
  public clearConnectionInfo(): void {
    this.connectionInfo = {
      address: null,
      chainId: null,
      chainType: null,
      wallet: null,
    };
    this.logger.debug('Connection info cleared');
  }

  // ======================================
  // Address Display Formatting
  // ======================================

  /**
   * Format an address for display based on chain type
   */
  public formatAddress(
    address: string,
    chainType?: ChainType,
    options?: {
      maxLength?: number;
      prefixLength?: number;
      suffixLength?: number;
    },
  ): string {
    if (!address) return '';

    const maxLength = options?.maxLength || 20;
    const prefixLength = options?.prefixLength || 6;
    const suffixLength = options?.suffixLength || 4;

    // If address is short enough, return as-is
    if (address.length <= maxLength) {
      return address;
    }

    // Chain-specific formatting
    switch (chainType) {
      case 'evm':
        // EVM addresses: 0x1234...5678
        return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;

      case 'solana': {
        // Solana addresses are base58, show more characters
        const solPrefix = Math.max(prefixLength, 4);
        const solSuffix = Math.max(suffixLength, 4);
        return `${address.slice(0, solPrefix)}...${address.slice(-solSuffix)}`;
      }

      case 'aztec':
        // Aztec addresses might have different formatting needs
        return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;

      default:
        // Default formatting
        return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
    }
  }

  /**
   * Get display information for a connection
   */
  public getConnectionDisplay(
    address: string | null,
    chainType?: ChainType,
    options?: ConnectionDisplayOptions,
  ): {
    address: string;
    chainName?: string;
    walletName?: string;
  } {
    const result: {
      address: string;
      chainName?: string;
      walletName?: string;
    } = {
      address: 'Not Connected',
    };

    if (!address) {
      return result;
    }

    // Format the address
    result.address = this.formatAddress(address, chainType, {
      ...(options?.maxLength !== undefined && { maxLength: options.maxLength }),
      ...(options?.prefixLength !== undefined && { prefixLength: options.prefixLength }),
      ...(options?.suffixLength !== undefined && { suffixLength: options.suffixLength }),
    });

    // Add chain information if requested
    if (options?.showChain && this.connectionInfo.chainId) {
      result.chainName = this.getChainName(
        this.connectionInfo.chainId,
        chainType || this.connectionInfo.chainType || undefined,
      );
    }

    // Add wallet information if requested
    if (options?.showWallet && this.connectionInfo.wallet) {
      result.walletName = this.connectionInfo.wallet.name;
    }

    return result;
  }

  // ======================================
  // Chain Information
  // ======================================

  /**
   * Get chain name from chain ID
   */
  public getChainName(chainId: string, _chainType?: ChainType): string {
    try {
      // Use chain service to get chain information if available
      if (this.chainService) {
        const chainInfo = this.chainService.getChain(chainId);
        if (chainInfo) {
          return chainInfo.name;
        }
      }
    } catch (error) {
      this.logger.debug('Failed to get chain info from service, falling back to hardcoded names', {
        chainId,
        error,
      });
    }

    // Fallback to hardcoded chain names if chain service doesn't have the info
    const chainIdStr = chainId;

    // Fallback chain names for CAIP-2 format
    switch (chainIdStr) {
      // EVM chains (eip155 namespace)
      case 'eip155:1':
        return 'Ethereum';
      case 'eip155:137':
        return 'Polygon';
      case 'eip155:56':
        return 'BSC';
      case 'eip155:42161':
        return 'Arbitrum';
      case 'eip155:10':
        return 'Optimism';
      // Solana chains (solana namespace)
      case 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp':
        return 'Solana';
      case 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z':
        return 'Solana Testnet';
      case 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1':
        return 'Solana Devnet';
      // Aztec chains (aztec namespace)
      case 'aztec:31337':
        return 'Aztec Sandbox';
      case 'aztec:testnet':
        return 'Aztec Testnet';
      case 'aztec:mainnet':
        return 'Aztec Mainnet';
      default:
        return chainIdStr;
    }
  }

  /**
   * Get chain icon URL
   */
  public getChainIcon(chainId: string, _chainType?: ChainType): string | null {
    try {
      // Use chain service to get chain information if available
      if (this.chainService) {
        const chainInfo = this.chainService.getChain(chainId);
        if (chainInfo?.icon) {
          return chainInfo.icon;
        }
      }
    } catch (error) {
      this.logger.debug('Failed to get chain icon from service, falling back to null', {
        chainId,
        error,
      });
    }

    // Fallback: return null and let the UI handle it
    // In a real implementation, this could have hardcoded icon URLs for common chains
    return null;
  }

  // ======================================
  // Utility Methods
  // ======================================

  /**
   * Validate if an address is valid for a given chain type
   */
  public isValidAddress(address: string, chainType?: ChainType): boolean {
    if (!address) return false;

    switch (chainType) {
      case 'evm':
        // EVM addresses are 42 characters long and start with 0x
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'solana':
        // Solana addresses are base58 encoded, typically 32-44 characters
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      case 'aztec':
        // Aztec addresses - format may vary, basic validation
        return address.length > 0 && address.length < 200;
      default:
        return false;
    }
  }

  /**
   * Get the action type for a button state
   */
  public getButtonAction(state: ConnectButtonState): 'connect' | 'disconnect' | 'none' {
    switch (state) {
      case 'disconnected':
        return 'connect';
      case 'connected':
        return 'disconnect';
      case 'connecting':
        return 'none';
    }
  }

  /**
   * Check if connection info should be shown
   */
  public shouldShowConnectionInfo(
    isConnected: boolean,
    _currentChainType: ChainType | null,
    _targetChainType?: ChainType,
  ): boolean {
    return isConnected;
  }

  /**
   * Get chain display name (alias for getChainName)
   */
  public getChainDisplayName(chainId: string, chainType: ChainType): string {
    return this.getChainName(chainId, chainType);
  }

  /**
   * Format connection information for display
   */
  public formatConnectionInfo(
    info: UIConnectionInfo,
    options?: {
      showAddress?: boolean;
      showChain?: boolean;
      showWalletName?: boolean;
      separator?: string;
    },
  ): string {
    const parts: string[] = [];
    const separator = options?.separator || ' • ';

    if (options?.showAddress !== false && info.address) {
      parts.push(this.formatAddress(info.address, info.chainType || undefined));
    }

    if (options?.showChain && info.chainId && info.chainType) {
      parts.push(this.getChainName(info.chainId, info.chainType));
    }

    if (options?.showWalletName && info.wallet) {
      parts.push(info.wallet.name);
    }

    return parts.join(separator) || 'Not Connected';
  }

  /**
   * Get connection status text
   */
  public getConnectionStatusText(isConnected: boolean, isConnecting: boolean, error?: Error | null): string {
    if (error) {
      return 'Connection Error';
    }
    if (isConnecting) {
      return 'Connecting...';
    }
    if (isConnected) {
      return 'Connected';
    }
    return 'Disconnected';
  }

  /**
   * Validate address format (alias for isValidAddress)
   */
  public isValidAddressFormat(address: string, chainType: ChainType): boolean {
    return this.isValidAddress(address, chainType);
  }
}

/**
 * Factory function to create ConnectionUIService
 */
export function createConnectionUIService(
  dependencies: ConnectionUIServiceDependencies,
): ConnectionUIService {
  return new ConnectionUIService(dependencies);
}
