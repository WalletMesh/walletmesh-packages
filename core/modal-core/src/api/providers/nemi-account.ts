/**
 * Nemi SDK Account provider for WalletMesh
 *
 * Provides Account implementation compatible with @nemi-fi/wallet-sdk
 * allowing dApps to use nemi SDK's Contract patterns with WalletMesh
 * wallet connections.
 *
 * @module api/providers/nemi-account
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
 * // Use with nemi SDK patterns
 * class Token extends Contract.fromAztec(TokenContract) {}
 * const token = await Token.at(tokenAddress, account);
 * const balance = await token.methods.balance_of(account.address).view();
 * ```
 */

export { createWalletMeshAccount } from '../../internal/providers/nemi/AccountFactory.js';
export { WalletMeshAccount } from '../../internal/providers/nemi/WalletMeshAccount.js';
export type { NemiAccount } from '../../internal/providers/nemi/types.js';
