import { createDebugLogger } from '../../internal/core/logger/logger.js';
import { ConnectionUIService } from '../../services/ui/connectionUiService.js';
import type { ChainType, WalletInfo } from '../../types.js';

// Re-export the service classes for TypeDoc
export { ConnectionUIService } from '../../services/ui/connectionUiService.js';

// Re-export types for convenience
export type {
  ConnectButtonState,
  ConnectButtonContent,
  ConnectButtonOptions,
  UIConnectionInfo,
  ConnectionDisplayOptions,
} from '../../services/ui/connectionUiService.js';

/**
 * Connection information interface for connect button
 */
export interface ConnectButtonConnectionInfo {
  address?: string | null;
  chainId?: string | null;
  chainType?: ChainType | null;
  wallet?: WalletInfo | null;
}

/**
 * Hook-like function for getting connect button state and content
 *
 * This function provides the business logic for connect buttons without
 * being tied to React. It can be used by any UI framework.
 */
export function useConnectButtonState(
  connectionInfo: {
    isConnected: boolean;
    isConnecting: boolean;
    address?: string | null | undefined;
    chainId?: string | null | undefined;
    chainType?: ChainType | null | undefined;
    wallet?: WalletInfo | null | undefined;
  },
  options: {
    chainType?: ChainType;
    labels?: {
      connect?: string;
      connecting?: string;
      connected?: string;
    };
    showAddress?: boolean;
    showChain?: boolean;
    showWalletName?: boolean;
    targetChainType?: ChainType;
  } = {},
) {
  const service = new ConnectionUIService({ logger: createDebugLogger('connectButton') });

  const { isConnected, isConnecting, address, chainId, chainType, wallet } = connectionInfo;

  const { targetChainType } = options;

  // Get the current button state
  const state = service.getButtonState(isConnected, isConnecting);

  // Update connection info in the service
  service.updateConnectionInfo({
    address: address ?? null,
    chainId: chainId ?? null,
    chainType: chainType ?? null,
    wallet: wallet ?? null,
  });

  // Get the button content
  const content = service.getButtonContent(state, options);

  // Get the button action
  const action = service.getButtonAction(state);

  // Check if should show connection info
  const shouldShowConnectionInfo = service.shouldShowConnectionInfo(
    isConnected,
    chainType ?? null,
    targetChainType,
  );

  return {
    state,
    content,
    action,
    shouldShowConnectionInfo,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isDisconnected: state === 'disconnected',
  };
}

/**
 * Utility functions for connection display
 */
export const connectButtonUtils = {
  /**
   * Format an address for display
   */
  formatAddress: (
    address: string,
    chainType?: ChainType,
    options?: { maxLength?: number; prefixLength?: number; suffixLength?: number },
  ) => {
    const service = new ConnectionUIService({ logger: createDebugLogger('connectButton') });
    return service.formatAddress(address, chainType, options);
  },

  /**
   * Get chain display name
   */
  getChainDisplayName: (chainId: string, chainType: ChainType) => {
    const service = new ConnectionUIService({ logger: createDebugLogger('connectButton') });
    return service.getChainDisplayName(chainId, chainType);
  },

  /**
   * Format connection information
   */
  formatConnectionInfo: (
    options: {
      address?: string | null;
      chainId?: string | null;
      chainType?: ChainType | null;
      walletName?: string | null;
    },
    displayOptions?: {
      showAddress?: boolean;
      showChain?: boolean;
      showWalletName?: boolean;
      separator?: string;
    },
  ) => {
    const service = new ConnectionUIService({ logger: createDebugLogger('connectButton') });
    return service.formatConnectionInfo(
      {
        address: options.address ?? null,
        chainId: options.chainId ?? null,
        chainType: options.chainType ?? null,
        wallet: options.walletName ? { id: 'unknown', name: options.walletName, chains: [] } : null,
      },
      displayOptions,
    );
  },

  /**
   * Get connection status text
   */
  getConnectionStatusText: (isConnected: boolean, isConnecting: boolean, error?: Error | null) => {
    const service = new ConnectionUIService({ logger: createDebugLogger('connectButton') });
    return service.getConnectionStatusText(isConnected, isConnecting, error);
  },

  /**
   * Validate address format
   */
  isValidAddressFormat: (address: string, chainType: ChainType) => {
    const service = new ConnectionUIService({ logger: createDebugLogger('connectButton') });
    return service.isValidAddressFormat(address, chainType);
  },
};

/**
 * Default instance of the connection UI service.
 * Provides unified methods for managing connect button states, content generation,
 * and connection display utilities.
 */
export const connectionUIService = new ConnectionUIService({ logger: createDebugLogger('connectionUI') });
