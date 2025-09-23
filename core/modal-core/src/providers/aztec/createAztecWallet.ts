/**
 * Aztec wallet factory for creating typed wallet instances
 *
 * Creates an AztecDappWallet from a generic WalletMesh provider using
 * dynamic imports to avoid forcing dependencies.
 *
 * @module providers/aztec/createAztecWallet
 * @packageDocumentation
 */

import type { WalletProvider } from '../../api/types/providers.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { modalLogger } from '../../internal/core/logger/globalLogger.js';
import type { AztecDappWallet } from './types.js';

// Cache for the Aztec RPC wallet module
let aztecModuleCache: Promise<AztecModule> | null = null;

// Singleton cache for AztecDappWallet instances
// Uses WeakMap with provider as key to allow garbage collection
// Each provider (i.e., each wallet adapter) gets its own AztecDappWallet instance
const walletInstanceCache = new WeakMap<WalletProvider, AztecDappWallet>();

// Secondary cache by session ID for cases where provider object changes
// but session remains the same (e.g., React StrictMode)
const walletInstanceCacheBySession = new Map<string, AztecDappWallet>();

// Track pending wallet creations to prevent duplicate concurrent creations
const pendingCreations = new Map<string, Promise<AztecDappWallet | null>>();

// Define the expected module interface
interface AztecRouterProvider {
  sessionId?: string;
  connect(permissions: Record<string, string[]>): Promise<{ sessionId: string; permissions: unknown }>;
}

interface AztecModule {
  AztecRouterProvider: new (transport: unknown, context?: unknown, sessionId?: string) => AztecRouterProvider;
  createAztecWallet: (provider: AztecRouterProvider, chainId: string) => Promise<AztecDappWallet>;
}

/**
 * Get the Aztec RPC wallet module with caching
 * @internal
 */
async function getAztecModule(): Promise<AztecModule> {
  if (!aztecModuleCache) {
    try {
      aztecModuleCache = import('@walletmesh/aztec-rpc-wallet').then(
        (module) => module as unknown as AztecModule,
      );
    } catch (error) {
      throw ErrorFactory.configurationError(
        'Failed to load Aztec module. Ensure @walletmesh/aztec-rpc-wallet is installed.',
        { originalError: error },
      );
    }
  }
  return aztecModuleCache;
}

/**
 * Configuration options for creating an Aztec wallet
 *
 * @public
 */
export interface CreateAztecWalletOptions {
  /** The Aztec chain ID (e.g., 'aztec:sandbox', 'aztec:testnet') */
  chainId?: string;
  /** Custom chain ID options to request permissions for */
  permissions?: Record<string, string[]>;
}

/**
 * Create an Aztec wallet instance from a WalletMesh provider
 *
 * This factory function wraps a generic WalletMesh provider with the
 * AztecRouterProvider to provide typed Aztec functionality.
 *
 * @param provider - The WalletMesh provider to wrap
 * @param options - Configuration options
 * @returns Promise resolving to an AztecDappWallet instance
 * @throws If the provider is not available or Aztec module fails to load
 *
 * @example
 * ```typescript
 * import { createAztecWallet } from '@walletmesh/modal-core/providers/aztec';
 * import { useWalletProvider } from '@walletmesh/modal-react';
 *
 * const { provider } = useWalletProvider();
 * const aztecWallet = await createAztecWallet(provider, {
 *   chainId: 'aztec:sandbox'
 * });
 *
 * // Now you can use typed Aztec methods
 * const deployTx = await aztecWallet.deployContract(artifact, args);
 * ```
 *
 * @public
 */
export async function createAztecWallet(
  provider: WalletProvider | null,
  options: CreateAztecWalletOptions = {},
): Promise<AztecDappWallet | null> {
  if (!provider) {
    modalLogger.debug('No provider available for Aztec wallet creation');
    return null;
  }

  // Check if we already have a cached instance for this provider
  const cachedWallet = walletInstanceCache.get(provider);
  if (cachedWallet) {
    modalLogger.info('✅ Using cached AztecDappWallet instance for provider', {
      providerType: provider.constructor.name,
      chainId: options.chainId,
      providerId: 'id' in provider && typeof provider.id === 'string' ? provider.id : 'no-id',
    });
    return cachedWallet;
  }

  // Check session-based cache as fallback (for React StrictMode)
  const sessionId =
    'sessionId' in provider && typeof provider.sessionId === 'string' ? provider.sessionId : undefined;
  if (sessionId && walletInstanceCacheBySession.has(sessionId)) {
    const sessionCachedWallet = walletInstanceCacheBySession.get(sessionId);
    if (sessionCachedWallet) {
      modalLogger.info('✅ Using session-cached AztecDappWallet instance', {
        providerType: provider.constructor.name,
        chainId: options.chainId,
        sessionId,
      });
      // Also cache by provider for consistency
      walletInstanceCache.set(provider, sessionCachedWallet);
      return sessionCachedWallet;
    }
  }

  // Create a unique key for deduplication based on chain ID and provider type
  // This prevents concurrent creation of the same wallet
  const dedupeKey = `${provider.constructor.name}-${options.chainId || 'default'}`;

  // Check if there's already a pending creation for this key
  if (pendingCreations.has(dedupeKey)) {
    modalLogger.info('⏳ Waiting for pending wallet creation', {
      dedupeKey,
      providerType: provider.constructor.name,
      chainId: options.chainId,
    });
    const pendingPromise = pendingCreations.get(dedupeKey);
    if (pendingPromise) {
      const pendingWallet = await pendingPromise;

      // Cache the result if successful
      if (pendingWallet) {
        walletInstanceCache.set(provider, pendingWallet);
        if (sessionId) {
          walletInstanceCacheBySession.set(sessionId, pendingWallet);
        }
      }

      return pendingWallet;
    }
  }

  // Add debug logging to understand why cache isn't working
  modalLogger.info('🔍 Cache miss for provider', {
    providerType: provider.constructor.name,
    hasInCache: walletInstanceCache.has(provider),
    providerId: 'id' in provider && typeof provider.id === 'string' ? provider.id : 'no-id',
    sessionId: sessionId || 'no-session',
    sessionCacheSize: walletInstanceCacheBySession.size,
    dedupeKey,
  });

  // Create the wallet creation promise and track it
  const creationPromise = (async (): Promise<AztecDappWallet | null> => {
    try {
      modalLogger.info('🏗️ Creating Aztec wallet from WalletProvider', {
        providerType: provider.constructor.name,
        chainId: options.chainId,
        dedupeKey,
      });

      // Load the Aztec RPC wallet module dynamically
      const aztecModule = await getAztecModule();
      const { createAztecWallet: createWallet } = aztecModule;

      // Determine chain ID
      const chainId = options.chainId || 'aztec:31337';

      // Check if this provider has the required call method
      if ('call' in provider && typeof provider.call === 'function') {
        modalLogger.info('✅ Provider has call method, wrapping as AztecDappWallet', {
          providerType: provider.constructor.name,
          hasSessionId: 'sessionId' in provider,
          chainId,
        });

        // The provider already has a working transport and session
        // We just need to wrap it with the AztecDappWallet interface
        // The aztec-rpc-wallet's createAztecWallet expects an object with a call method
        const aztecWallet = await createWallet(provider as unknown as AztecRouterProvider, chainId);

        if (aztecWallet) {
          // Cache the instance for this provider
          walletInstanceCache.set(provider, aztecWallet);

          // Also cache by session if available
          if (sessionId) {
            walletInstanceCacheBySession.set(sessionId, aztecWallet);
          }

          modalLogger.info('✅ Successfully created and cached Aztec wallet using existing provider', {
            hasWallet: !!aztecWallet,
            walletType: aztecWallet ? typeof aztecWallet : 'null',
            providerId: 'id' in provider && typeof provider.id === 'string' ? provider.id : 'no-id',
            sessionId: sessionId || 'no-session',
            sessionCacheSize: walletInstanceCacheBySession.size,
            dedupeKey,
          });
          return aztecWallet;
        }
        modalLogger.error('❌ createAztecWallet returned null');
        return null;
      }

      // If the provider doesn't have router capabilities, we have an architecture problem
      modalLogger.error('❌ Provider does not support router operations - architecture issue', {
        providerType: provider.constructor.name,
        hasCallMethod: 'call' in provider,
        hasSessionId: 'sessionId' in provider,
        availableMethods: Object.getOwnPropertyNames(provider)
          .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(provider)))
          .filter((name) => typeof (provider as unknown as Record<string, unknown>)[name] === 'function'),
      });

      throw ErrorFactory.configurationError(
        'WalletProvider does not support router operations. Expected a router-capable provider.',
        {
          providerType: provider.constructor.name,
          expectedMethods: ['call', 'connect', 'sessionId'],
          actualMethods: Object.getOwnPropertyNames(provider),
        },
      );
    } catch (error) {
      modalLogger.error('Failed to create Aztec wallet', error);
      throw ErrorFactory.connectionFailed(
        `Failed to create Aztec wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error },
      );
    } finally {
      // Clean up the pending creation tracker
      pendingCreations.delete(dedupeKey);
    }
  })();

  // Track this creation to prevent duplicates
  pendingCreations.set(dedupeKey, creationPromise);

  try {
    return await creationPromise;
  } catch (error) {
    // Clean up on error
    pendingCreations.delete(dedupeKey);
    throw error;
  }
}

/**
 * Clear the cached AztecDappWallet instance for a specific provider
 *
 * This is useful when disconnecting from a wallet to ensure a fresh
 * instance is created on the next connection.
 *
 * @param provider - The provider whose cached wallet should be cleared
 * @public
 */
export function clearAztecWalletCache(provider: WalletProvider): void {
  if (walletInstanceCache.has(provider)) {
    modalLogger.info('Clearing cached AztecDappWallet for provider', {
      providerType: provider.constructor.name,
    });
    walletInstanceCache.delete(provider);
  }

  // Also clear session cache if applicable
  const sessionId =
    'sessionId' in provider && typeof provider.sessionId === 'string' ? provider.sessionId : undefined;
  if (sessionId && walletInstanceCacheBySession.has(sessionId)) {
    modalLogger.info('Clearing session-cached AztecDappWallet', {
      sessionId,
    });
    walletInstanceCacheBySession.delete(sessionId);
  }
}

/**
 * Create an Aztec wallet factory function for repeated use
 *
 * @param options - Default configuration options
 * @returns A factory function that creates Aztec wallets
 *
 * @example
 * ```typescript
 * const aztecFactory = createAztecWalletFactory({
 *   chainId: 'aztec:sandbox'
 * });
 *
 * // Later, when you have a provider
 * const wallet = await aztecFactory(provider);
 * ```
 *
 * @public
 */
export function createAztecWalletFactory(
  defaultOptions: CreateAztecWalletOptions = {},
): (provider: WalletProvider | null, options?: CreateAztecWalletOptions) => Promise<AztecDappWallet | null> {
  return async (provider, options = {}) => {
    return createAztecWallet(provider, { ...defaultOptions, ...options });
  };
}
