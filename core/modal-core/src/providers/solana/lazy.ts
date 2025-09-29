/**
 * Lazy-loaded Solana provider utilities
 *
 * This module provides lazy loading for Solana-specific functionality
 * that may not be needed by all dApps. The @solana/web3.js library is
 * only loaded when first accessed, reducing initial bundle size for
 * applications that support multiple chains.
 *
 * @module @walletmesh/modal-core/providers/solana/lazy
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * // Import only when you need Solana utilities
 * import {
 *   solanaWeb3Module,
 *   createConnection,
 *   lamportsToSol,
 *   solToLamports
 * } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * // Lazy load the full module when needed
 * const web3 = await solanaWeb3Module.getModule();
 * const connection = new web3.Connection('https://api.mainnet-beta.solana.com');
 * ```
 */

import { createLazyModule } from '../../utils/lazy/createLazyModule.js';

/**
 * Lazy module loader for @solana/web3.js
 *
 * This provides access to the full Solana Web3.js library without
 * bundling it until first use. Useful for multi-chain applications
 * where Solana support may not be immediately needed.
 *
 * @example
 * ```typescript
 * import { solanaWeb3Module } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * // Load the module only when needed
 * const web3 = await solanaWeb3Module.getModule();
 * const connection = new web3.Connection(endpoint);
 * const balance = await connection.getBalance(publicKey);
 * ```
 *
 * @public
 */
export const solanaWeb3Module = createLazyModule('@solana/web3.js', {
	displayName: 'Solana Web3.js',
	errorMessage:
		'Solana utilities require @solana/web3.js to be installed. ' +
		'Run: npm install @solana/web3.js',
});

/**
 * Create a Solana connection to a cluster (lazy-loaded)
 *
 * @param endpoint - Solana cluster endpoint URL
 * @param commitment - Optional commitment level (defaults to 'confirmed')
 * @returns Promise resolving to Connection instance
 *
 * @example
 * ```typescript
 * import { createConnection } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * const connection = await createConnection('https://api.mainnet-beta.solana.com');
 * const slot = await connection.getSlot();
 * console.log('Current slot:', slot);
 * ```
 *
 * @public
 */
export async function createConnection(
	endpoint: string,
	commitment?: 'processed' | 'confirmed' | 'finalized',
): Promise<unknown> {
	const web3 = (await solanaWeb3Module.getModule()) as {
		Connection: new (endpoint: string, commitment?: string) => unknown;
	};
	return new web3.Connection(endpoint, commitment);
}

/**
 * Convert lamports to SOL (lazy-loaded)
 *
 * @param lamports - Amount in lamports
 * @returns Amount in SOL
 *
 * @example
 * ```typescript
 * import { lamportsToSol } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * const balance = await lamportsToSol(1000000000); // 1.0 SOL
 * ```
 *
 * @public
 */
export async function lamportsToSol(lamports: number | bigint): Promise<number> {
	const web3 = (await solanaWeb3Module.getModule()) as {
		LAMPORTS_PER_SOL: number;
	};
	const lamportsNum = typeof lamports === 'bigint' ? Number(lamports) : lamports;
	return lamportsNum / web3.LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports (lazy-loaded)
 *
 * @param sol - Amount in SOL
 * @returns Amount in lamports
 *
 * @example
 * ```typescript
 * import { solToLamports } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * const lamports = await solToLamports(1.5); // 1500000000 lamports
 * ```
 *
 * @public
 */
export async function solToLamports(sol: number): Promise<number> {
	const web3 = (await solanaWeb3Module.getModule()) as {
		LAMPORTS_PER_SOL: number;
	};
	return Math.floor(sol * web3.LAMPORTS_PER_SOL);
}

/**
 * Validate a Solana public key (lazy-loaded)
 *
 * @param address - Address string to validate
 * @returns Promise resolving to true if valid, false otherwise
 *
 * @example
 * ```typescript
 * import { isValidPublicKey } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * const valid = await isValidPublicKey('11111111111111111111111111111111');
 * console.log('Is valid:', valid); // true
 * ```
 *
 * @public
 */
export async function isValidPublicKey(address: string): Promise<boolean> {
	try {
		const web3 = (await solanaWeb3Module.getModule()) as {
			PublicKey: new (address: string) => unknown;
		};
		new web3.PublicKey(address);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get the system program ID (lazy-loaded)
 *
 * @returns Promise resolving to the system program PublicKey
 *
 * @example
 * ```typescript
 * import { getSystemProgramId } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * const programId = await getSystemProgramId();
 * console.log('System program:', programId.toString());
 * ```
 *
 * @public
 */
export async function getSystemProgramId(): Promise<unknown> {
	const web3 = (await solanaWeb3Module.getModule()) as {
		SystemProgram: { programId: unknown };
	};
	return web3.SystemProgram.programId;
}

// Re-export the LazyModule type for convenience
export type { LazyModule } from '../../utils/lazy/createLazyModule.js';