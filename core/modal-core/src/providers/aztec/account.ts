/**
 * Aztec account management utilities
 *
 * Provides utilities for managing Aztec accounts, including multi-account
 * support, account switching, and message signing capabilities.
 *
 * @module providers/aztec/account
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { AztecDappWallet } from './types.js';

/**
 * Account information returned by account queries
 *
 * @public
 */
export interface AccountInfo {
  /** The account address */
  address: unknown;
  /** The complete address including public keys */
  completeAddress: unknown;
  /** Whether this is the currently active account */
  isActive: boolean;
  /** Optional account label/name */
  label?: string;
}

/**
 * Get all registered accounts from the wallet
 *
 * This retrieves all accounts that are registered with the remote wallet,
 * not just the currently active one. This is useful for multi-account
 * management interfaces.
 *
 * @param wallet - The Aztec wallet instance
 * @returns Array of complete addresses for all registered accounts
 *
 * @example
 * ```typescript
 * const accounts = await getRegisteredAccounts(wallet);
 * console.log(`Found ${accounts.length} accounts`);
 *
 * accounts.forEach((account, index) => {
 *   console.log(`Account ${index}: ${account.address}`);
 * });
 * ```
 *
 * @public
 */
export async function getRegisteredAccounts(wallet: AztecDappWallet | null): Promise<unknown[]> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Note: This would require adding a new RPC method to aztec-rpc-wallet
    // For now, we'll return just the current account
    // TODO: Add aztec_getRegisteredAccounts to the RPC interface
    const completeAddress = wallet.getCompleteAddress();
    return [completeAddress];
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to get registered accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Switch the active account in the wallet
 *
 * This allows switching between different registered accounts in a
 * multi-account wallet setup. The wallet will use the new account
 * for subsequent operations.
 *
 * @param wallet - The Aztec wallet instance
 * @param address - The address to switch to
 * @returns Promise that resolves when the switch is complete
 *
 * @example
 * ```typescript
 * const accounts = await getRegisteredAccounts(wallet);
 * const secondAccount = accounts[1];
 *
 * await switchAccount(wallet, secondAccount.address);
 * console.log('Switched to account:', secondAccount.address);
 * ```
 *
 * @public
 */
export async function switchAccount(wallet: AztecDappWallet | null, _address: unknown): Promise<void> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Note: This would require adding a new RPC method to aztec-rpc-wallet
    // TODO: Add aztec_switchAccount to the RPC interface
    throw ErrorFactory.configurationError('Account switching not yet implemented in remote wallet');
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to switch account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Sign an arbitrary message with the wallet's private key
 *
 * This allows signing messages for authentication or other purposes
 * outside of transaction signing. The signature can be verified to
 * prove ownership of the account.
 *
 * @param wallet - The Aztec wallet instance
 * @param message - The message to sign
 * @returns The signature as a hex string
 *
 * @example
 * ```typescript
 * const message = 'Sign this message to authenticate';
 * const signature = await signMessage(wallet, message);
 *
 * // Send signature to backend for verification
 * await authenticateWithBackend(signature);
 * ```
 *
 * @public
 */
export async function signMessage(wallet: AztecDappWallet | null, message: string): Promise<string> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // Create auth witness for the message
    // This uses the existing auth witness functionality
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    const authWitness = await wallet.createAuthWit(messageBuffer);

    // Convert auth witness to hex string signature
    // The auth witness contains the signature data
    return (authWitness as unknown as { toString: () => string }).toString();
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get detailed information about a specific account
 *
 * This retrieves comprehensive information about an account, including
 * its address, public keys, and metadata.
 *
 * @param wallet - The Aztec wallet instance
 * @param address - Optional address to get info for (defaults to current account)
 * @returns Detailed account information
 *
 * @example
 * ```typescript
 * const accountInfo = await getAccountInfo(wallet);
 * console.log('Current account:', accountInfo.address);
 * console.log('Public key:', accountInfo.completeAddress.publicKey);
 * ```
 *
 * @public
 */
export async function getAccountInfo(
  wallet: AztecDappWallet | null,
  address?: unknown,
): Promise<AccountInfo> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    // If no address provided, get current account info
    if (!address) {
      const completeAddress = wallet.getCompleteAddress();
      const currentAddress = wallet.getAddress();

      return {
        address: currentAddress,
        completeAddress,
        isActive: true,
        label: 'Current Account',
      };
    }

    // For other addresses, we would need additional RPC methods
    // TODO: Add support for querying other account info
    throw ErrorFactory.configurationError('Querying other accounts not yet implemented');
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Check if an address is a registered account in the wallet
 *
 * This utility helps verify whether a given address corresponds to
 * an account managed by the connected wallet.
 *
 * @param wallet - The Aztec wallet instance
 * @param address - The address to check
 * @returns True if the address is a registered account
 *
 * @example
 * ```typescript
 * const isOurAccount = await isRegisteredAccount(wallet, someAddress);
 * if (isOurAccount) {
 *   console.log('This is one of our accounts');
 * }
 * ```
 *
 * @public
 */
export async function isRegisteredAccount(
  wallet: AztecDappWallet | null,
  address: unknown,
): Promise<boolean> {
  if (!wallet) {
    throw ErrorFactory.connectionFailed('No Aztec wallet available');
  }

  try {
    const currentAddress = wallet.getAddress();

    // For now, we can only check against the current account
    // TODO: Extend this when multi-account support is added
    return (address as unknown as { equals: (addr: unknown) => boolean }).equals(currentAddress);
  } catch (error) {
    throw ErrorFactory.transportError(
      `Failed to check registered account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
