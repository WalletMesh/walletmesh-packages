/**
 * Lazy-loaded Aztec provider functionality
 *
 * This module provides lazy-loaded versions of all Aztec functions.
 * Functions are only imported when first called, reducing initial bundle size
 * for applications that may not use Aztec functionality.
 *
 * @module providers/aztec/lazy
 * @packageDocumentation
 */

import type { JSONRPCSerializer, JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { StoreApi } from 'zustand';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { aztecTransactionActions } from '../../state/actions/aztecTransactions.js';
import { useStore } from '../../state/store.js';
import { createLazyModule } from '../../utils/lazy/index.js';
import type { WalletMeshState } from '../../state/store.js';
import type { AztecProviderFunctions } from './types.js';
import { parseAztecTransactionStatusWithDiagnostics } from './types.js';

// Create lazy loader for the Aztec implementation
const aztecModule = createLazyModule<typeof import('./utils.js')>(() => import('./utils.js'), {
  displayName: 'Aztec',
  errorMessage:
    'Aztec functionality requires @walletmesh/aztec-rpc-wallet to be installed. ' +
    'Run: npm install @walletmesh/aztec-rpc-wallet',
});

/**
 * Deploy an Aztec contract using the wallet (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @param artifact - The contract artifact containing ABI and bytecode
 * @param args - Constructor arguments for the contract
 * @param constructorName - Optional constructor name if multiple exist
 * @returns A DeploySentTx object for tracking deployment
 *
 * @example
 * ```typescript
 * const deployTx = await deployContract(
 *   wallet,
 *   TokenContractArtifact,
 *   [ownerAddress, 'MyToken', 'MTK', 18]
 * );
 * const deployed = await deployTx.deployed();
 * console.log('Contract deployed at:', deployed.address);
 * ```
 *
 * @public
 */
export const deployContract = aztecModule.wrap<AztecProviderFunctions['deployContract']>('deployContract');

/**
 * Execute a transaction on the Aztec network (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @param interaction - The contract function interaction to execute
 * @returns A SentTx object for tracking the transaction
 *
 * @example
 * ```typescript
 * const contract = await Contract.at(address, artifact, wallet);
 * const tx = await executeTx(
 *   wallet,
 *   contract.methods.transfer(recipient, amount)
 * );
 * const receipt = await tx.wait();
 * ```
 *
 * @public
 */
export const executeTx = aztecModule.wrap<AztecProviderFunctions['executeTx']>('executeTx');

/**
 * Simulate a transaction without executing it (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @param interaction - The contract function interaction to simulate
 * @returns The simulation result
 *
 * @example
 * ```typescript
 * const contract = await Contract.at(address, artifact, wallet);
 * const result = await simulateTx(
 *   wallet,
 *   contract.methods.balanceOf(address)
 * );
 * ```
 *
 * @public
 */
export const simulateTx = aztecModule.wrap<AztecProviderFunctions['simulateTx']>('simulateTx');

/**
 * Wait for a transaction receipt with proper status checking (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @param txHash - The transaction hash to wait for
 * @returns The transaction receipt
 * @throws If the transaction fails
 *
 * @example
 * ```typescript
 * const receipt = await waitForTxReceipt(wallet, txHash);
 * if (receipt.status === TX_STATUS.SUCCESS) {
 *   console.log('Transaction succeeded');
 * }
 * ```
 *
 * @public
 */
export const waitForTxReceipt =
  aztecModule.wrap<AztecProviderFunctions['waitForTxReceipt']>('waitForTxReceipt');

/**
 * Get the current Aztec account address (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @returns The account address
 *
 * @example
 * ```typescript
 * const address = getAddress(wallet);
 * console.log('Current address:', address.toString());
 * ```
 *
 * @public
 */
export const getAddress = aztecModule.wrap<AztecProviderFunctions['getAddress']>('getAddress');

/**
 * Get the complete address including public keys (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @returns The complete address
 *
 * @example
 * ```typescript
 * const completeAddress = getCompleteAddress(wallet);
 * console.log('Public key:', completeAddress.publicKey);
 * ```
 *
 * @public
 */
export const getCompleteAddress =
  aztecModule.wrap<AztecProviderFunctions['getCompleteAddress']>('getCompleteAddress');

/**
 * Check if a wallet is available and ready to use (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @returns Whether the wallet is available
 *
 * @public
 */
export const isWalletAvailable =
  aztecModule.wrap<AztecProviderFunctions['isWalletAvailable']>('isWalletAvailable');

/**
 * Helper to handle common Aztec transaction patterns (lazy-loaded)
 *
 * @param wallet - The Aztec wallet instance
 * @param operation - The async operation to perform
 * @param errorMessage - Custom error message prefix
 * @returns The result of the operation
 *
 * @example
 * ```typescript
 * const result = await withAztecWallet(
 *   wallet,
 *   async (w) => {
 *     const contract = await Contract.at(address, artifact, w);
 *     const interaction = contract.methods.mint(amount);
 *     const txRequest = await interaction.request();
 *     const provenTx = await w.proveTx(txRequest);
 *     return await w.sendTx(provenTx);
 *   },
 *   'Minting failed'
 * );
 * ```
 *
 * @public
 */
export const withAztecWallet = aztecModule.wrap<AztecProviderFunctions['withAztecWallet']>('withAztecWallet');

// Re-export types (these don't trigger dynamic imports)
export * from './types.js';

// Lazy-loaded AztecRouterProvider
const aztecRouterModule = createLazyModule<typeof import('@walletmesh/aztec-rpc-wallet')>(
  () => import('@walletmesh/aztec-rpc-wallet'),
  {
    displayName: 'AztecRouterProvider',
    errorMessage:
      'AztecRouterProvider requires @walletmesh/aztec-rpc-wallet to be installed. ' +
      'Run: npm install @walletmesh/aztec-rpc-wallet',
  },
);

/**
 * Lazy-loaded AztecRouterProvider
 *
 * This is a wrapper that provides the same interface as AztecRouterProvider but
 * defers loading the actual implementation until first use. This helps reduce
 * initial bundle size for applications that may not immediately need Aztec support.
 *
 * @example
 * ```typescript
 * import { LazyAztecRouterProvider } from '@walletmesh/modal-core/providers/aztec';
 *
 * // The actual AztecRouterProvider is loaded on instantiation
 * const provider = new LazyAztecRouterProvider(transport);
 *
 * // Use it exactly like the regular AztecRouterProvider
 * await provider.connect({
 *   'aztec:testnet': ['aztec_getAddress', 'aztec_sendTx']
 * });
 * ```
 *
 * @public
 */
// Import types from router dynamically to avoid direct dependency
type ChainPermissions = Record<string, string[]>;
type HumanReadableChainPermissions = Record<
  string,
  Record<string, { allowed: boolean; shortDescription: string; longDescription?: string }>
>;
type MethodCall = { method: string; params?: unknown };
type MethodResults = unknown;

// Type for the AztecRouterProvider instance - using unknown to avoid circular dependency
type AztecRouterProviderInstance = {
  [key: string]: unknown;
} & {
  connect: (
    permissions: ChainPermissions,
    timeout?: number,
  ) => Promise<{ sessionId: string; permissions: HumanReadableChainPermissions }>;
  disconnect: (timeout?: number) => Promise<void>;
  getPermissions: (chainIds?: string[], timeout?: number) => Promise<HumanReadableChainPermissions>;
  updatePermissions: (
    permissions: ChainPermissions,
    timeout?: number,
  ) => Promise<HumanReadableChainPermissions>;
  call: (chainId: string, call: MethodCall, timeout?: number) => Promise<MethodResults>;
  bulkCall: (chainId: string, calls: MethodCall[], timeout?: number) => Promise<MethodResults[]>;
  getSupportedMethods: (chainIds?: string[], timeout?: number) => Promise<Record<string, string[]>>;
  reconnect?: (
    sessionId: string,
    timeout?: number,
  ) => Promise<{ sessionId: string; permissions: HumanReadableChainPermissions }>;
  createOperationBuilder: (chainId: string) => {
    chain: (chainId: string) => unknown;
    call: (...args: unknown[]) => Promise<unknown>;
    execute: () => Promise<unknown[]>;
  };
  registerMethodSerializer: (method: string, serializer: JSONRPCSerializer<unknown, unknown>) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => () => void;
  emit: (event: string, data: unknown) => void;
  sessionId?: string;
};

export class LazyAztecRouterProvider {
  private initPromise: Promise<void>;
  private realProvider: AztecRouterProviderInstance | null = null;
  private notificationCleanup: Array<() => void> = [];

  constructor(transport: JSONRPCTransport, context?: Record<string, unknown>) {
    // Initialize the real provider asynchronously
    this.initPromise = this.initialize(transport, context);
  }

  private cleanupNotificationHandlers(): void {
    const handlers = this.notificationCleanup.splice(0);
    for (const cleanup of handlers) {
      try {
        cleanup();
      } catch (error) {
        console.error('[LazyAztecRouterProvider] Failed to remove notification handler', error);
      }
    }
  }

  private async initialize(transport: JSONRPCTransport, context?: Record<string, unknown>): Promise<void> {
    console.log('[LazyAztecRouterProvider] Starting initialization...');
    const module = await aztecRouterModule.getModule();
    // Cast through unknown to avoid type checking issues with external module
    this.realProvider = new module.AztecRouterProvider(
      transport,
      context,
    ) as unknown as AztecRouterProviderInstance;

    // Listen for proving status notifications
    try {
      const store = useStore as unknown as StoreApi<WalletMeshState>;
      this.cleanupNotificationHandlers();

      if (
        typeof (this.realProvider as unknown as { onNotification?: unknown }).onNotification !== 'function'
      ) {
        throw ErrorFactory.configurationError(
          'AztecRouterProvider is missing onNotification support. Update to a compatible WalletMesh router version.',
        );
      }

      const providerWithNotifications = this.realProvider as AztecRouterProviderInstance & {
        onNotification: (method: string, handler: (params: unknown) => void) => () => void;
      };

      // Subscribe to transaction status for full lifecycle tracking
      const removeTxStatus = providerWithNotifications.onNotification('aztec_transactionStatus', (params) => {
        console.log('[LazyAztecRouterProvider] Received aztec_transactionStatus notification:', params);
        try {
          const parseResult = parseAztecTransactionStatusWithDiagnostics(params);

          if (parseResult.success && parseResult.data) {
            console.log(
              '[LazyAztecRouterProvider] Parsed transaction status notification:',
              parseResult.data,
            );

            // Update transaction status in store
            aztecTransactionActions.updateAztecTransactionStatus(
              store,
              parseResult.data.txStatusId, // ← Internal tracking ID
              parseResult.data.status, // Types now match - no cast needed
            );

            // Update transaction hash if provided (blockchain identifier)
            if (parseResult.data.txHash) {
              aztecTransactionActions.updateAztecTransaction(store, parseResult.data.txStatusId, {
                txHash: parseResult.data.txHash, // ← Blockchain hash
              });
            }

            // Update error if provided
            if (parseResult.data.error) {
              aztecTransactionActions.updateAztecTransaction(store, parseResult.data.txStatusId, {
                error: ErrorFactory.transactionFailed(parseResult.data.error),
              });
            }
          } else {
            // Log detailed validation errors for debugging
            console.warn(
              '[LazyAztecRouterProvider] Failed to parse transaction status notification. ' +
                `Validation errors: ${parseResult.error || 'Unknown error'}`,
            );
            console.warn('[LazyAztecRouterProvider] Raw notification params:', parseResult.rawParams);
          }
        } catch (error) {
          console.error(
            '[LazyAztecRouterProvider] Error handling aztec_transactionStatus notification',
            error,
          );
        }
      });
      this.notificationCleanup.push(removeTxStatus);

      console.log('[LazyAztecRouterProvider] Notification subscriptions ready');
    } finally {
      console.log('[LazyAztecRouterProvider] Initialization complete');
    }
  }

  private async ensureInitialized(): Promise<AztecRouterProviderInstance> {
    await this.initPromise;
    if (!this.realProvider) {
      throw ErrorFactory.configurationError('Failed to initialize AztecRouterProvider');
    }
    return this.realProvider;
  }

  /**
   * Check if provider is ready to use
   * Exposed for validation purposes
   *
   * @public
   */
  public async ensureReady(): Promise<void> {
    await this.initPromise;
  }

  /**
   * Check initialization status without waiting
   *
   * @public
   */
  public get isInitialized(): boolean {
    return this.realProvider !== null;
  }

  // Proxy all public methods to the real provider

  async connect(
    permissions: ChainPermissions,
    timeout?: number,
  ): Promise<{ sessionId: string; permissions: HumanReadableChainPermissions }> {
    const provider = await this.ensureInitialized();
    return provider.connect(permissions, timeout);
  }

  async disconnect(timeout?: number): Promise<void> {
    const provider = await this.ensureInitialized();
    return provider.disconnect(timeout);
  }

  async getPermissions(chainIds?: string[], timeout?: number): Promise<HumanReadableChainPermissions> {
    const provider = await this.ensureInitialized();
    return provider.getPermissions(chainIds, timeout);
  }

  async updatePermissions(
    permissions: ChainPermissions,
    timeout?: number,
  ): Promise<HumanReadableChainPermissions> {
    const provider = await this.ensureInitialized();
    return provider.updatePermissions(permissions, timeout);
  }

  async call(chainId: string, call: MethodCall, timeout?: number): Promise<MethodResults> {
    const provider = await this.ensureInitialized();
    return provider.call(chainId, call, timeout);
  }

  async bulkCall(chainId: string, calls: MethodCall[], timeout?: number): Promise<MethodResults[]> {
    const provider = await this.ensureInitialized();
    return provider.bulkCall(chainId, calls, timeout);
  }

  async getSupportedMethods(chainIds?: string[], timeout?: number): Promise<Record<string, string[]>> {
    const provider = await this.ensureInitialized();
    return provider.getSupportedMethods(chainIds, timeout);
  }

  async reconnect(
    sessionId: string,
    timeout?: number,
  ): Promise<{ sessionId: string; permissions: HumanReadableChainPermissions }> {
    const provider = await this.ensureInitialized();
    if (!provider.reconnect) {
      throw ErrorFactory.configurationError('Reconnect method not available');
    }
    return provider.reconnect(sessionId, timeout);
  }

  createOperationBuilder(chainId: string): {
    chain: (chainId: string) => unknown;
    call: (...args: unknown[]) => Promise<unknown>;
    execute: () => Promise<unknown[]>;
  } {
    // Return a proxy that loads the real implementation when used
    return {
      chain: (chainId: string) => this.createOperationBuilder(chainId),
      call: async (...args: unknown[]) => {
        const provider = await this.ensureInitialized();
        const builder = provider.createOperationBuilder(chainId);
        return builder.call(...args);
      },
      execute: async () => {
        const provider = await this.ensureInitialized();
        const builder = provider.createOperationBuilder(chainId);
        return builder.execute();
      },
    };
  }

  registerMethodSerializer(method: string, serializer: JSONRPCSerializer<unknown, unknown>): void {
    // Queue serializer registration until provider is initialized
    this.initPromise.then(() => {
      if (this.realProvider) {
        this.realProvider.registerMethodSerializer(method, serializer);
      }
    });
  }

  get sessionId(): string | undefined {
    return this.realProvider?.sessionId;
  }

  // Proxy event methods
  on(event: string, handler: (...args: unknown[]) => void): () => void {
    let cleanup: (() => void) | null = null;

    this.initPromise.then(() => {
      if (this.realProvider) {
        cleanup = this.realProvider.on(event, handler);
      }
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }

  emit(event: string, data: unknown): void {
    if (this.realProvider) {
      this.realProvider.emit(event, data);
    }
  }
}

/**
 * Lazy-loaded version of registerAztecSerializers
 *
 * Registers all Aztec-specific serializers on any WalletRouterProvider instance.
 * The serializers are loaded only when this function is called.
 *
 * @param provider - Any WalletRouterProvider instance
 *
 * @example
 * ```typescript
 * import { WalletRouterProvider } from '@walletmesh/router';
 * import { lazyRegisterAztecSerializers } from '@walletmesh/modal-core/providers/aztec';
 *
 * const provider = new WalletRouterProvider(transport);
 * await lazyRegisterAztecSerializers(provider);
 * ```
 *
 * @public
 */
// Type to match WalletRouterProvider interface without importing it
interface SerializableProvider {
  registerMethodSerializer(method: string, serializer: JSONRPCSerializer<unknown, unknown>): void;
}

export async function lazyRegisterAztecSerializers(provider: SerializableProvider): Promise<void> {
  const module = await aztecRouterModule.getModule();
  // Cast through unknown to avoid type checking issues with external module
  module.registerAztecSerializers(
    provider as unknown as Parameters<typeof module.registerAztecSerializers>[0],
  );
}

// Also export the factory functions (these need to be lazy too since they import aztec-rpc-wallet)
const factoryModule = createLazyModule<typeof import('./createAztecWallet.js')>(
  () => import('./createAztecWallet.js'),
  {
    displayName: 'Aztec Wallet Factory',
    errorMessage:
      'Aztec wallet creation requires @walletmesh/aztec-rpc-wallet to be installed. ' +
      'Run: npm install @walletmesh/aztec-rpc-wallet',
  },
);

/**
 * Create an Aztec wallet instance from a WalletMesh provider (lazy-loaded)
 *
 * @public
 */
export const createAztecWallet =
  factoryModule.wrap<typeof import('./createAztecWallet.js').createAztecWallet>('createAztecWallet');

/**
 * Create an Aztec wallet factory function for repeated use (lazy-loaded)
 *
 * @public
 */
export const createAztecWalletFactory =
  factoryModule.wrap<typeof import('./createAztecWallet.js').createAztecWalletFactory>(
    'createAztecWalletFactory',
  );

/**
 * Clear the cached AztecDappWallet instance for a specific provider (lazy-loaded)
 *
 * @public
 */
export const clearAztecWalletCache =
  factoryModule.wrap<typeof import('./createAztecWallet.js').clearAztecWalletCache>('clearAztecWalletCache');

// Contract interaction utilities
const contractModule = createLazyModule<typeof import('./contract.js')>(() => import('./contract.js'), {
  displayName: 'Aztec Contract Utilities',
  errorMessage:
    'Aztec contract utilities require @aztec/aztec.js to be installed. ' + 'Run: npm install @aztec/aztec.js',
});

/**
 * Get a contract instance at a specific address (lazy-loaded)
 *
 * @public
 */
export const getContractAt =
  contractModule.wrap<import('./types.js').AztecContractFunctions['getContractAt']>('getContractAt');

/**
 * Execute multiple contract interactions in a batch (lazy-loaded)
 *
 * @public
 */
export const executeBatch =
  contractModule.wrap<import('./types.js').AztecContractFunctions['executeBatch']>('executeBatch');

/**
 * Call a view function on a contract (lazy-loaded)
 *
 * @public
 */
export const callViewFunction =
  contractModule.wrap<import('./types.js').AztecContractFunctions['callViewFunction']>('callViewFunction');

/**
 * Get the transaction request from a contract interaction (lazy-loaded)
 *
 * @public
 */
export const getTxRequest =
  contractModule.wrap<import('./types.js').AztecContractFunctions['getTxRequest']>('getTxRequest');

// Account management utilities
const accountModule = createLazyModule<typeof import('./account.js')>(() => import('./account.js'), {
  displayName: 'Aztec Account Utilities',
  errorMessage:
    'Aztec account utilities require @walletmesh/aztec-rpc-wallet to be installed. ' +
    'Run: npm install @walletmesh/aztec-rpc-wallet',
});

/**
 * Get all registered accounts from the wallet (lazy-loaded)
 *
 * @public
 */
export const getRegisteredAccounts =
  accountModule.wrap<import('./types.js').AztecAccountFunctions['getRegisteredAccounts']>(
    'getRegisteredAccounts',
  );

/**
 * Switch the active account in the wallet (lazy-loaded)
 *
 * @public
 */
export const switchAccount =
  accountModule.wrap<import('./types.js').AztecAccountFunctions['switchAccount']>('switchAccount');

/**
 * Sign an arbitrary message with the wallet's private key (lazy-loaded)
 *
 * @public
 */
export const signMessage =
  accountModule.wrap<import('./types.js').AztecAccountFunctions['signMessage']>('signMessage');

/**
 * Get detailed information about a specific account (lazy-loaded)
 *
 * @public
 */
export const getAccountInfo =
  accountModule.wrap<import('./types.js').AztecAccountFunctions['getAccountInfo']>('getAccountInfo');

/**
 * Check if an address is a registered account in the wallet (lazy-loaded)
 *
 * @public
 */
export const isRegisteredAccount =
  accountModule.wrap<import('./types.js').AztecAccountFunctions['isRegisteredAccount']>(
    'isRegisteredAccount',
  );

// Event handling utilities
const eventModule = createLazyModule<typeof import('./events.js')>(() => import('./events.js'), {
  displayName: 'Aztec Event Utilities',
  errorMessage:
    'Aztec event utilities require @walletmesh/aztec-rpc-wallet to be installed. ' +
    'Run: npm install @walletmesh/aztec-rpc-wallet',
});

/**
 * Subscribe to contract events in real-time (lazy-loaded)
 *
 * @public
 */
export const subscribeToEvents =
  eventModule.wrap<import('./types.js').AztecEventFunctions['subscribeToEvents']>('subscribeToEvents');

/**
 * Query historical events from the blockchain (lazy-loaded)
 *
 * @public
 */
export const queryEvents =
  eventModule.wrap<import('./types.js').AztecEventFunctions['queryEvents']>('queryEvents');

/**
 * Query private (encrypted) events from the blockchain (lazy-loaded)
 *
 * @public
 */
export const queryPrivateEvents =
  eventModule.wrap<import('./types.js').AztecEventFunctions['queryPrivateEvents']>('queryPrivateEvents');

/**
 * Get a list of all events defined in a contract artifact (lazy-loaded)
 *
 * @public
 */
export const getContractEvents =
  eventModule.wrap<import('./types.js').AztecEventFunctions['getContractEvents']>('getContractEvents');

// Auth witness utilities
const authModule = createLazyModule<typeof import('./auth.js')>(() => import('./auth.js'), {
  displayName: 'Aztec Auth Witness Utilities',
  errorMessage:
    'Aztec auth witness utilities require @walletmesh/aztec-rpc-wallet to be installed. ' +
    'Run: npm install @walletmesh/aztec-rpc-wallet',
});

/**
 * Create an auth witness for a contract function interaction (lazy-loaded)
 *
 * @public
 */
export const createAuthWitForInteraction = authModule.wrap<
  import('./types.js').AztecAuthFunctions['createAuthWitForInteraction']
>('createAuthWitForInteraction');

/**
 * Create auth witnesses for multiple interactions in batch (lazy-loaded)
 *
 * @public
 */
export const createBatchAuthWit =
  authModule.wrap<import('./types.js').AztecAuthFunctions['createBatchAuthWit']>('createBatchAuthWit');

/**
 * Create an auth witness for a raw message (lazy-loaded)
 *
 * @public
 */
export const createAuthWitForMessage =
  authModule.wrap<import('./types.js').AztecAuthFunctions['createAuthWitForMessage']>(
    'createAuthWitForMessage',
  );

/**
 * Verify that an auth witness is valid (lazy-loaded)
 *
 * @public
 */
export const verifyAuthWit =
  authModule.wrap<import('./types.js').AztecAuthFunctions['verifyAuthWit']>('verifyAuthWit');

/**
 * Store auth witnesses for later use (lazy-loaded)
 *
 * @public
 */
export const storeAuthWitnesses =
  authModule.wrap<import('./types.js').AztecAuthFunctions['storeAuthWitnesses']>('storeAuthWitnesses');

/**
 * Retrieve stored auth witnesses (lazy-loaded)
 *
 * @public
 */
export const getStoredAuthWitnesses =
  authModule.wrap<import('./types.js').AztecAuthFunctions['getStoredAuthWitnesses']>(
    'getStoredAuthWitnesses',
  );

/**
 * Clear stored auth witnesses (lazy-loaded)
 *
 * @public
 */
export const clearStoredAuthWitnesses =
  authModule.wrap<import('./types.js').AztecAuthFunctions['clearStoredAuthWitnesses']>(
    'clearStoredAuthWitnesses',
  );

// Re-export error utilities (these don't need lazy loading as they don't import heavy deps)
export {
  AztecError,
  AztecContractError,
  AztecAccountError,
  AztecEventError,
  AztecAuthError,
  AZTEC_ERROR_CODE,
  isRecoverableError,
  getErrorRecoveryHint,
  extractErrorDetails,
} from './errors.js';

// Re-export types from sub-modules
export type { AccountInfo } from './account.js';
export type { EventSubscription, EventQueryOptions } from './events.js';
export type { AuthWitnessWithMetadata } from './auth.js';
