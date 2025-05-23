import type { AztecChainId } from '../types.js';
import type { AztecDappWallet } from './aztec-dapp-wallet.js';
import { createAztecWallet } from './aztec-dapp-wallet.js';
import type { AztecRouterProvider } from './aztec-router-provider.js';
import { createLogger } from '@aztec/foundation/log';

const logger = createLogger('aztec-rpc-wallet:helpers');

/**
 * A comprehensive list of all JSON-RPC methods supported by the Aztec RPC wallet.
 * This array includes standard Aztec wallet methods as well as WalletMesh-specific extensions (prefixed with `wm_`).
 * It can be used when establishing a connection to request permissions for all available functionalities.
 *
 * @see {@link AztecWalletMethodMap} for detailed type information on each method.
 * @see {@link connectAztec} and {@link connectAztecWithWallet} which use this list by default.
 */
export const ALL_AZTEC_METHODS = [
  'aztec_getAddress',
  'aztec_getCompleteAddress',
  'aztec_getChainId',
  'aztec_getVersion',
  'aztec_sendTx',
  'aztec_getTxReceipt',
  'aztec_simulateTx',
  'aztec_getNodeInfo',
  'aztec_getBlockNumber',
  'aztec_getCurrentBaseFees',
  'aztec_registerSender',
  'aztec_getSenders',
  'aztec_removeSender',
  'aztec_registerContract',
  'aztec_registerContractClass',
  'aztec_getContractMetadata',
  'aztec_getContractClassMetadata',
  'aztec_proveTx',
  'aztec_profileTx',
  'aztec_simulateUtility',
  'aztec_getPrivateEvents',
  'aztec_getPublicEvents',
  'aztec_getPXEInfo',
  'aztec_getBlock',
  'aztec_createAuthWit',
  'aztec_wmDeployContract',
  'aztec_wmExecuteTx',
  'aztec_wmSimulateTx',
] as const;

/**
 * Establishes a connection to an Aztec wallet service and creates an initialized {@link AztecDappWallet} instance.
 * This function requests permissions for the specified methods on the given Aztec chain,
 * then instantiates and initializes the wallet.
 * Initialization includes fetching and caching essential data like the wallet address and chain ID.
 *
 * By default, it requests permissions for all methods defined in {@link ALL_AZTEC_METHODS}
 * on the 'aztec:mainnet' chain.
 *
 * @param provider - The {@link AztecRouterProvider} instance to use for the connection.
 *                   This provider must be configured with appropriate transport and Aztec serializers.
 * @param chainId - The {@link AztecChainId} to connect to (e.g., 'aztec:mainnet', 'aztec:31337').
 *                  Defaults to 'aztec:mainnet'.
 * @param methods - An array of method names for which permissions are requested.
 *                  Defaults to {@link ALL_AZTEC_METHODS}.
 * @returns A promise that resolves to an object containing the `sessionId` for the connection
 *          and a fully initialized {@link AztecDappWallet} instance.
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
  provider: AztecRouterProvider,
  chainId: AztecChainId = 'aztec:mainnet',
  methods: readonly (keyof import('../types.js').AztecWalletMethodMap | string)[] = ALL_AZTEC_METHODS,
): Promise<{ sessionId: string; wallet: AztecDappWallet }> {
  // Establish connection
  const { sessionId } = await provider.connect({
    [chainId]: [...methods] as string[],
  });

  // Create and initialize wallet (this pre-caches all synchronous values)
  const wallet = await createAztecWallet(provider, chainId);
  logger.debug(`Connected to Aztec wallet: ${sessionId}`);

  return { sessionId, wallet };
}

