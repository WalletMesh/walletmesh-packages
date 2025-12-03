/**
 * WalletMesh React Context
 *
 * Provides access to the WalletMeshClient instance and configuration
 * throughout the React component tree. Uses React Context API for
 * dependency injection following React best practices.
 *
 * @module WalletMeshContext
 */

import type {
  BalanceService,
  ChainService,
  ConnectionService,
  TransactionService,
} from '@walletmesh/modal-core';
import { ErrorFactory } from '@walletmesh/modal-core';
import React from 'react';
import type { WalletMeshConfig } from './types.js';

// Import the client type that createWalletMesh returns (unwrapped from Promise)
type WalletMeshClient = Awaited<ReturnType<typeof import('@walletmesh/modal-core').createWalletMesh>>;
import { createComponentLogger } from './utils/logger.js';

/**
 * Internal context value interface providing basic WalletMesh client access
 * This is the low-level context used internally by the React provider
 */
export interface InternalContextValue {
  /** The WalletMeshClient instance (null during SSR or initialization) */
  client: WalletMeshClient | null;
  /** Configuration used to create the client */
  config: WalletMeshConfig;
  /** Whether the client is currently being initialized */
  isInitializing?: boolean;
  /** Error that occurred during client initialization */
  initializationError?: Error | null;
}

/**
 * React Context for WalletMesh
 * @internal
 */
export const WalletMeshContext = React.createContext<InternalContextValue | null>(null);

/**
 * Hook to access the WalletMesh context value
 *
 * @returns The WalletMesh context value
 * @throws If used outside of WalletMeshProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, config } = useWalletMeshContext();
 *   // Use client and config
 * }
 * ```
 *
 * @public
 */
export function useWalletMeshContext(): InternalContextValue {
  const context = React.useContext(WalletMeshContext);

  if (!context) {
    throw ErrorFactory.configurationError(
      'useWalletMeshContext must be used within a WalletMeshProvider. ' +
        'Wrap your application with <WalletMeshProvider> to use WalletMesh hooks.',
    );
  }

  return context;
}

/**
 * Hook to check if running inside WalletMeshProvider
 *
 * @returns True if inside provider, false otherwise
 *
 * @example
 * ```tsx
 * function OptionalWalletComponent() {
 *   const hasWallet = useHasWalletMeshProvider();
 *
 *   if (!hasWallet) {
 *     return <div>Wallet not available</div>;
 *   }
 *
 *   return <ConnectedComponent />;
 * }
 * ```
 *
 * @public
 */
export function useHasWalletMeshProvider(): boolean {
  const context = React.useContext(WalletMeshContext);
  return context !== null;
}

/**
 * Hook to access WalletMesh business logic services
 *
 * Provides convenient access to all stateless business logic services
 * through the WalletMeshClient. Services provide pure business logic
 * without state management - state updates are coordinated by the client.
 *
 * @returns Object containing all business logic services
 * @throws If used outside of WalletMeshProvider or client not initialized
 *
 * @example
 * ```tsx
 * function ValidationComponent() {
 *   const services = useWalletMeshServices();
 *
 *   const handleConnect = (walletId: string) => {
 *     const validation = services.connection.validateConnectionParams(walletId);
 *     if (validation.isValid) {
 *       // Proceed with connection
 *     } else {
 *       // Handle validation error
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ChainSwitcher() {
 *   const services = useWalletMeshServices();
 *   const { client } = useWalletMeshContext();
 *
 *   const handleSwitchChain = async (targetChainId: string) => {
 *     const result = await services.chain.switchChain(
 *       provider,
 *       targetChainId,
 *       currentChainId
 *     );
 *
 *     // Client handles state updates based on result
 *     if (result.success) {
 *       // Update UI state through client
 *     }
 *   };
 * }
 * ```
 *
 * @public
 */
// Create logger for error handling
const servicesLogger = createComponentLogger('useWalletMeshServices');

export function useWalletMeshServices(): {
  transaction: TransactionService;
  balance: BalanceService;
  chain: ChainService;
  connection: ConnectionService;
} | null {
  const { client } = useWalletMeshContext();

  // Since createWalletMesh now doesn't resolve until services are ready,
  // we can directly return the services without polling or initialization checks
  return React.useMemo(() => {
    if (!client) {
      servicesLogger.debug('Client is null, returning null services');
      return null;
    }

    // Debug logging to understand what's happening
    servicesLogger.debug('Client available:', {
      hasClient: !!client,
      clientType: typeof client,
      clientConstructor: client?.constructor?.name,
      hasGetServices: 'getServices' in client,
      getServicesType: typeof (client as WalletMeshClient).getServices,
    });

    // Check if client has getServices method
    if (typeof client.getServices === 'function') {
      try {
        const services = client.getServices();
        servicesLogger.debug('Services retrieved successfully:', {
          servicesAvailable: !!services,
          serviceNames: services ? Object.keys(services) : [],
        });
        return services as {
          transaction: TransactionService;
          balance: BalanceService;
          chain: ChainService;
          connection: ConnectionService;
        };
      } catch (error) {
        servicesLogger.error('Error getting services from client:', error);
        return null;
      }
    } else {
      servicesLogger.warn('Client does not have getServices method');
    }

    return null;
  }, [client]);
}
