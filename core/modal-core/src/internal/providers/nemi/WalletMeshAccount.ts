/**
 * WalletMesh implementation of nemi SDK's Account interface
 *
 * Implements the Account interface from @nemi-fi/wallet-sdk/eip1193
 * allowing WalletMesh to be used with nemi SDK's Contract classes.
 *
 * @module internal/providers/nemi/WalletMeshAccount
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createWalletMeshClient } from '@walletmesh/modal-core';
 * import { createWalletMeshAccount } from '@walletmesh/modal-core/providers/nemi-account';
 * import { Contract } from '@nemi-fi/wallet-sdk/eip1193';
 * import { TokenContract } from './contracts';
 *
 * // Connect with WalletMesh
 * const client = createWalletMeshClient({ appName: 'My dApp' });
 * await client.initialize();
 * await client.connect();
 *
 * // Create nemi-compatible Account
 * const account = await createWalletMeshAccount(client);
 *
 * // Use with nemi SDK's Contract pattern
 * class Token extends Contract.fromAztec(TokenContract) {}
 * const token = await Token.at(tokenAddress, account);
 * const balance = await token.methods.balance_of(account.address).view();
 * ```
 */

import type {
	AuthWitness,
	AztecAddress,
	CompleteAddress,
	Fr,
} from '@aztec/aztec.js';
import type { AztecWalletProvider } from '../../../api/types/providers.js';
import type { WalletMeshClient } from '../../client/WalletMeshClient.js';
import type { NemiAccount } from './types.js';

/**
 * WalletMesh implementation of nemi Account interface
 *
 * This class implements the Account interface from @nemi-fi/wallet-sdk/eip1193,
 * allowing dApps using nemi SDK to connect wallets through WalletMesh.
 *
 * Features:
 * - Implements complete nemi Account interface
 * - Caches expensive operations (CompleteAddress, ChainId, Version)
 * - Automatic cache invalidation on account/chain changes
 * - Works with any WalletMesh wallet adapter
 *
 * @public
 */
export class WalletMeshAccount implements NemiAccount {
	/**
	 * Aztec address of the account
	 * @readonly
	 */
	public readonly address: AztecAddress;

	// Cache for expensive operations
	private completeAddressCache?: CompleteAddress;
	private chainIdCache?: Fr;
	private versionCache?: Fr;
	private unsubscribe?: () => void;

	/**
	 * Private constructor - use create() factory method instead
	 *
	 * @param address - Aztec address of the account
	 * @param provider - Aztec wallet provider
	 * @param client - WalletMesh client instance (for subscriptions)
	 */
	private constructor(
		address: AztecAddress,
		private provider: AztecWalletProvider,
		client: WalletMeshClient,
	) {
		this.address = address;

		// Set up state subscription for cache invalidation
		// Track initial state for comparison
		const initialState = client.getState();
		const initialAddress = initialState.connection.address;
		const initialChainId = initialState.connection.chain?.chainId;

		this.unsubscribe = client.subscribe((newState) => {
			// Invalidate cache if account or chain changed
			if (
				newState.connection.address !== initialAddress ||
				newState.connection.chain?.chainId !== initialChainId
			) {
				this.invalidateCache();
			}
		});
	}

	/**
	 * Create WalletMeshAccount from WalletMesh client
	 *
	 * This is the preferred way to create an account instance.
	 * Sets up event listeners for automatic cache invalidation.
	 *
	 * @param client - WalletMesh client instance
	 * @param chainId - Chain ID to get provider for
	 * @returns Promise resolving to WalletMeshAccount instance
	 *
	 * @internal
	 */
	static async create(
		client: WalletMeshClient,
		chainId: string,
	): Promise<WalletMeshAccount> {
		// Get the Aztec wallet provider for this chain
		const provider = client.getWalletProvider(chainId) as AztecWalletProvider | null;

		if (!provider) {
			throw new Error(`No wallet provider found for chain ${chainId}`);
		}

		// Get address through provider
		const addressString = await provider.getAddress();
		const address = addressString as unknown as AztecAddress;

		const account = new WalletMeshAccount(address, provider, client);

		return account;
	}

	/**
	 * Get complete address with public keys
	 *
	 * This operation is cached to avoid redundant requests.
	 * Cache is invalidated on account or chain changes.
	 *
	 * @returns Promise resolving to CompleteAddress
	 */
	async getCompleteAddress(): Promise<CompleteAddress> {
		if (!this.completeAddressCache) {
			this.completeAddressCache = (await this.provider.call(
				'aztec_getCompleteAddress',
			)) as CompleteAddress;
		}
		return this.completeAddressCache;
	}

	/**
	 * Sign a message with the account's private key
	 *
	 * @param message - Message to sign
	 * @returns Promise resolving to signature
	 */
	async signMessage(message: Buffer): Promise<Buffer> {
		return (await this.provider.call('aztec_signMessage', [
			message,
		])) as Buffer;
	}

	/**
	 * Create authorization witness for a message hash
	 *
	 * Used for delegating actions to other accounts.
	 *
	 * @param messageHash - Hash to authorize
	 * @returns Promise resolving to AuthWitness
	 */
	async createAuthWit(messageHash: Fr | Buffer): Promise<AuthWitness> {
		return (await this.provider.call('aztec_createAuthWit', [
			messageHash,
		])) as AuthWitness;
	}

	/**
	 * Get the chain ID of the connected network
	 *
	 * This operation is cached to avoid redundant requests.
	 * Cache is invalidated on chain changes.
	 *
	 * @returns Promise resolving to chain ID
	 */
	async getChainId(): Promise<Fr> {
		if (!this.chainIdCache) {
			this.chainIdCache = (await this.provider.call(
				'aztec_getChainId',
			)) as Fr;
		}
		return this.chainIdCache;
	}

	/**
	 * Get the version of the Aztec protocol
	 *
	 * This operation is cached to avoid redundant requests.
	 * Cache is invalidated on chain changes.
	 *
	 * @returns Promise resolving to version
	 */
	async getVersion(): Promise<Fr> {
		if (!this.versionCache) {
			this.versionCache = (await this.provider.call(
				'aztec_getVersion',
			)) as Fr;
		}
		return this.versionCache;
	}

	/**
	 * Dispose of the account and clean up resources
	 *
	 * Should be called when the account is no longer needed.
	 *
	 * @public
	 */
	dispose(): void {
		if (this.unsubscribe) {
			this.unsubscribe();
			delete this.unsubscribe;
		}
		this.invalidateCache();
	}

	/**
	 * Invalidate all caches
	 *
	 * Called automatically on account or chain change events.
	 *
	 * @internal
	 */
	private invalidateCache(): void {
		delete this.completeAddressCache;
		delete this.chainIdCache;
		delete this.versionCache;
	}
}