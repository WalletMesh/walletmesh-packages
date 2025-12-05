import { createLogger } from '@aztec/foundation/log';
import type { AztecChainId } from '../types.js';
import { AZTEC_WALLET_METHODS, type AztecWalletMethodMap } from '../types.js';
import type { AztecWalletRouterProvider } from './aztec-router-provider.js';
import { AztecWalletProvider } from './wallet.js';

const logger = createLogger('aztec-rpc-wallet:helpers');

/**
 * Establishes a connection to an Aztec wallet service and creates an initialized {@link AztecWalletProvider} instance.
 * This function requests permissions for the specified methods on the given Aztec chain,
 * then instantiates and initializes the wallet.
 * Initialization includes fetching and caching essential data like the wallet address and chain ID.
 *
 * By default, it requests permissions for all methods defined in {@link ALL_AZTEC_METHODS}.
 *
 * @param provider - The {@link AztecWalletRouterProvider} instance to use for the connection.
 *                   This provider must be configured with appropriate transport and Aztec serializers.
 * @param chainId - The {@link AztecChainId} to connect to (e.g., 'aztec:mainnet', 'aztec:31337', 'aztec:testnet').
 * @param methods - An array of method names for which permissions are requested.
 *                  Defaults to {@link AZTEC_WALLET_METHODS}.
 * @returns A promise that resolves to an object containing the `sessionId` for the connection
 *          and a fully initialized {@link AztecWalletProvider} instance.
 * @throws If the connection or wallet initialization fails.
 *
 * @example
 * ```typescript
 * const provider = new AztecRouterProvider(myTransport);
 * const { sessionId, wallet } = await connectAztec(provider, 'aztec:testnet');
 * const address = wallet.getAddress(); // Wallet is ready to use
 * console.log('Connected with session ID:', sessionId, 'Wallet address:', address.toString());
 * ```
 */
export async function connectAztec(
  routerProvider: AztecWalletRouterProvider,
  chainId: AztecChainId,
  methods: readonly (keyof AztecWalletMethodMap)[] = AZTEC_WALLET_METHODS,
): Promise<{ sessionId: string; wallet: AztecWalletProvider }> {
  // Establish connection
  const { sessionId } = await routerProvider.connect({
    [chainId]: [...methods] as string[],
  });

  // Create and initialize wallet (this pre-caches all synchronous values)
  const wallet = new AztecWalletProvider(routerProvider, chainId);
  logger.debug(`Connected to Aztec wallet: ${sessionId}`);

  return { sessionId, wallet };
}
