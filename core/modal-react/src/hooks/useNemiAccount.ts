/**
 * React hook for nemi SDK Account integration
 *
 * Provides a React hook that creates and manages a nemi SDK-compatible
 * Account instance from the current WalletMesh connection.
 *
 * @module hooks/useNemiAccount
 * @packageDocumentation
 */

import { useCallback, useEffect, useState } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { useAccount } from './useAccount.js';

// Type imports from nemi SDK (loaded at runtime)
type NemiAccount = unknown;

/**
 * Return type for useNemiAccount hook
 *
 * @public
 */
export interface UseNemiAccountReturn {
	/**
	 * The nemi SDK-compatible Account instance
	 * null if not connected or still loading
	 */
	account: NemiAccount | null;

	/**
	 * Whether the account is currently being created
	 */
	isLoading: boolean;

	/**
	 * Error that occurred during account creation
	 */
	error: Error | null;

	/**
	 * Whether an account is available and ready to use
	 */
	isReady: boolean;

	/**
	 * Whether connected to a wallet
	 */
	isConnected: boolean;

	/**
	 * Manually refresh the account (e.g., after chain switch)
	 */
	refresh: () => Promise<void>;
}

/**
 * Hook for creating nemi SDK-compatible Account from WalletMesh connection
 *
 * This hook automatically creates a nemi Account instance when connected to
 * an Aztec wallet through WalletMesh. The Account can be used with nemi SDK's
 * Contract classes and patterns.
 *
 * @param chainId - Optional specific chain ID to create account for
 * @returns Account instance, loading state, and error state
 *
 * @example
 * ```tsx
 * import { useNemiAccount } from '@walletmesh/modal-react';
 * import { Contract } from '@nemi-fi/wallet-sdk/eip1193';
 * import { TokenContract } from './contracts';
 *
 * function MyComponent() {
 *   const { account, isLoading, error, isReady } = useNemiAccount();
 *
 *   if (isLoading) return <div>Loading account...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!isReady) return <div>Please connect an Aztec wallet</div>;
 *
 *   const handleDeployToken = async () => {
 *     class Token extends Contract.fromAztec(TokenContract) {}
 *     const deployment = await Token.deploy(
 *       account,
 *       ownerAddress,
 *       'MyToken',
 *       'MTK',
 *       18
 *     );
 *     const contract = await deployment.deployed();
 *     console.log('Contract deployed:', contract.address);
 *   };
 *
 *   return (
 *     <button onClick={handleDeployToken}>
 *       Deploy Token Contract
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Specify a particular chain
 * function MultiChainComponent() {
 *   const mainnetAccount = useNemiAccount('31337');
 *   const testnetAccount = useNemiAccount('31338');
 *
 *   return (
 *     <div>
 *       <p>Mainnet ready: {mainnetAccount.isReady ? 'Yes' : 'No'}</p>
 *       <p>Testnet ready: {testnetAccount.isReady ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useNemiAccount(chainId?: string): UseNemiAccountReturn {
	const { client } = useWalletMeshContext();
	const { isConnected, chain } = useAccount();

	const [account, setAccount] = useState<NemiAccount | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Determine which chain to use
	const targetChainId = chainId || chain?.chainId;

	// Check if on Aztec chain
	const isAztecChain = chain?.chainType === 'aztec';

	// Create account when connected
	const createAccount = useCallback(async () => {
		if (!isConnected || !isAztecChain || !targetChainId || !client) {
			setAccount(null);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Dynamically import the factory function
			const { createWalletMeshAccount } = await import(
				'@walletmesh/modal-core/providers/nemi-account'
			);

			const newAccount = await createWalletMeshAccount(client, targetChainId);
			setAccount(newAccount);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err : new Error('Failed to create nemi account');
			setError(errorMessage);
			setAccount(null);
		} finally {
			setIsLoading(false);
		}
	}, [isConnected, isAztecChain, targetChainId, client]);

	// Create account on mount and when connection changes
	useEffect(() => {
		createAccount();

		// Cleanup: dispose account if it has a dispose method
		return () => {
			if (account && typeof (account as { dispose?: () => void }).dispose === 'function') {
				(account as { dispose: () => void }).dispose();
			}
		};
	}, [createAccount, account]);

	return {
		account,
		isLoading,
		error,
		isReady: Boolean(account && isConnected && isAztecChain),
		isConnected,
		refresh: createAccount,
	};
}

/**
 * Hook that throws an error if nemi account is not ready
 *
 * Convenience hook for components that require a nemi Account to function.
 * Will throw an error with helpful message if account is not connected or ready.
 *
 * @param chainId - Optional specific chain ID to create account for
 * @returns Account instance (guaranteed to be non-null)
 * @throws Error if account is not ready
 *
 * @example
 * ```tsx
 * function RequiresAccount() {
 *   const { account } = useNemiAccountRequired();
 *
 *   // account is guaranteed to be non-null here
 *   const handleDeployContract = async () => {
 *     class Token extends Contract.fromAztec(TokenContract) {}
 *     const deployment = await Token.deploy(account, ...args);
 *     return deployment.deployed();
 *   };
 *
 *   return <button onClick={handleDeployContract}>Deploy</button>;
 * }
 * ```
 *
 * @public
 */
export function useNemiAccountRequired(
	chainId?: string,
): Required<Pick<UseNemiAccountReturn, 'account'>> & UseNemiAccountReturn {
	const result = useNemiAccount(chainId);

	if (!result.isReady || !result.account) {
		const message = !result.isConnected
			? 'Nemi account requires wallet connection. Call connect() first.'
			: result.error
				? `Failed to create nemi account: ${result.error.message}`
				: result.isLoading
					? 'Nemi account is still being created'
					: 'No Aztec chain connected';

		throw new Error(message);
	}

	return {
		...result,
		account: result.account,
	};
}