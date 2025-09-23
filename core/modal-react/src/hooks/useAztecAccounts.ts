/**
 * Aztec accounts hook for multi-account management
 *
 * Provides a React hook for managing multiple Aztec accounts,
 * including switching between accounts and signing messages.
 *
 * @module hooks/useAztecAccounts
 */

import { ErrorFactory } from '@walletmesh/modal-core';
import {
  type AccountInfo,
  getAccountInfo,
  getRegisteredAccounts,
  signMessage as signMessageUtil,
  switchAccount as switchAccountUtil,
} from '@walletmesh/modal-core/providers/aztec/lazy';
import { useCallback, useEffect, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

// Re-export AccountInfo type
export type { AccountInfo };

/**
 * Account management hook return type
 *
 * @public
 */
export interface UseAztecAccountsReturn {
  /** List of all registered accounts */
  accounts: AccountInfo[];
  /** The currently active account */
  activeAccount: AccountInfo | null;
  /** Switch to a different account */
  switchAccount: (address: unknown) => Promise<void>;
  /** Sign a message with the current account */
  signMessage: (message: string) => Promise<string>;
  /** Whether accounts are loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Refresh the account list */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing multiple Aztec accounts
 *
 * This hook provides functionality for working with multiple accounts
 * in an Aztec wallet, including switching between accounts and signing
 * messages. Note that some functionality may not be fully implemented
 * in all wallet providers yet.
 *
 * @returns Account management functions and state
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook provides:
 * - List of all registered accounts
 * - Current active account information
 * - Account switching functionality
 * - Message signing capability
 * - Loading and error states
 *
 * Note: Multi-account support depends on the wallet implementation.
 * Currently, most wallets only support a single account.
 *
 * @example
 * ```tsx
 * import { useAztecAccounts } from '@walletmesh/modal-react';
 *
 * function AccountManager() {
 *   const {
 *     accounts,
 *     activeAccount,
 *     switchAccount,
 *     signMessage,
 *     isLoading
 *   } = useAztecAccounts();
 *
 *   if (isLoading) return <div>Loading accounts...</div>;
 *
 *   return (
 *     <div>
 *       <h3>Active Account</h3>
 *       <p>{activeAccount?.address}</p>
 *
 *       <h3>All Accounts</h3>
 *       {accounts.map((account) => (
 *         <div key={account.address.toString()}>
 *           <span>{account.label || 'Account'}</span>
 *           <button
 *             onClick={() => switchAccount(account.address)}
 *             disabled={account.isActive}
 *           >
 *             {account.isActive ? 'Active' : 'Switch'}
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Message signing
 * function MessageSigner() {
 *   const { signMessage, activeAccount } = useAztecAccounts();
 *   const [signature, setSignature] = useState('');
 *
 *   const handleSign = async () => {
 *     try {
 *       const sig = await signMessage('Hello Aztec!');
 *       setSignature(sig);
 *     } catch (error) {
 *       console.error('Failed to sign:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>Signing as: {activeAccount?.address}</p>
 *       <button onClick={handleSign}>Sign Message</button>
 *       {signature && <p>Signature: {signature}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecAccounts(): UseAztecAccountsReturn {
  const { aztecWallet, isAvailable } = useAztecWallet();
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [activeAccount, setActiveAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch accounts from the wallet
  const fetchAccounts = useCallback(async () => {
    if (!aztecWallet || !isAvailable) {
      setAccounts([]);
      setActiveAccount(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get registered accounts
      const registeredAccounts = await getRegisteredAccounts(aztecWallet);

      // Get detailed info for each account
      const accountInfos: AccountInfo[] = [];
      for (const account of registeredAccounts) {
        try {
          const info = await getAccountInfo(aztecWallet, account);
          accountInfos.push(info);
        } catch (err) {
          // If we can't get info for an account, create basic info
          accountInfos.push({
            address: account,
            completeAddress: account,
            isActive: false,
            label: 'Account',
          });
        }
      }

      // If no accounts have detailed info, at least get current account
      if (accountInfos.length === 0) {
        const currentInfo = await getAccountInfo(aztecWallet);
        accountInfos.push(currentInfo);
      }

      setAccounts(accountInfos);

      // Set active account
      const active = accountInfos.find((a) => a.isActive) || accountInfos[0];
      setActiveAccount(active || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch accounts');
      setError(errorMessage);
      console.error('Failed to fetch accounts:', err);

      // Try to at least get current account
      try {
        const currentInfo = await getAccountInfo(aztecWallet);
        setAccounts([currentInfo]);
        setActiveAccount(currentInfo);
      } catch {
        // Ignore secondary error
      }
    } finally {
      setIsLoading(false);
    }
  }, [aztecWallet, isAvailable]);

  // Initial fetch
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Switch account function
  const switchAccount = useCallback(
    async (address: unknown) => {
      if (!aztecWallet) {
        throw ErrorFactory.connectionFailed('No wallet connected');
      }

      setError(null);

      try {
        await switchAccountUtil(aztecWallet, address);
        // Refresh accounts after switching
        await fetchAccounts();
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to switch account');
        setError(errorMessage);
        throw errorMessage;
      }
    },
    [aztecWallet, fetchAccounts],
  );

  // Sign message function
  const signMessage = useCallback(
    async (message: string) => {
      if (!aztecWallet) {
        throw ErrorFactory.connectionFailed('No wallet connected');
      }

      setError(null);

      try {
        return await signMessageUtil(aztecWallet, message);
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to sign message');
        setError(errorMessage);
        throw errorMessage;
      }
    },
    [aztecWallet],
  );

  return {
    accounts,
    activeAccount,
    switchAccount,
    signMessage,
    isLoading,
    error,
    refresh: fetchAccounts,
  };
}
