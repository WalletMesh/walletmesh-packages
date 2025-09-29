/**
 * Factory for creating nemi-compatible Account from WalletMesh
 *
 * @module internal/providers/nemi/AccountFactory
 * @packageDocumentation
 */

import { WalletMeshAccount } from './WalletMeshAccount.js';
import type { WalletMeshClient } from '../../client/WalletMeshClient.js';
import type { NemiAccount } from './types.js';

/**
 * Create nemi SDK compatible Account from WalletMesh connection
 *
 * This factory function creates an Account instance that implements
 * the @nemi-fi/wallet-sdk/eip1193 Account interface, allowing dApps
 * to use nemi SDK's Contract patterns with WalletMesh wallet connections.
 *
 * @param client - WalletMesh client instance
 * @param chainId - Optional chain ID (uses active chain if omitted)
 * @returns Promise resolving to nemi-compatible Account
 *
 * @throws {Error} If not connected or no chain ID available
 *
 * @example
 * ```typescript
 * import { createWalletMeshClient } from '@walletmesh/modal-core';
 * import { createWalletMeshAccount } from '@walletmesh/modal-core/providers/nemi-account';
 *
 * const client = createWalletMeshClient({ appName: 'My dApp' });
 * await client.initialize();
 * await client.connect(); // Shows WalletMesh modal
 *
 * // Create account from active connection
 * const account = await createWalletMeshAccount(client);
 * ```
 *
 * @example
 * ```typescript
 * // Specify a particular chain
 * const account = await createWalletMeshAccount(client, '31337');
 * ```
 *
 * @public
 */
export async function createWalletMeshAccount(
	client: WalletMeshClient,
	chainId?: string,
): Promise<NemiAccount> {
	// Get current state
	const state = client.getState();

	// Determine which chainId to use
	const targetChainId = chainId || state.connection.chain?.chainId;

	if (!targetChainId) {
		throw new Error(
			'No chain ID available. Call client.connect() first to connect to a wallet, or provide a chainId parameter.',
		);
	}

	// Check if connected
	if (state.connection.state !== 'connected') {
		throw new Error(
			'Not connected to a wallet. Call client.connect() first.',
		);
	}

	return WalletMeshAccount.create(client, targetChainId);
}