/**
 * Type definitions for nemi SDK Account compatibility
 *
 * These types define the Account interface from @nemi-fi/wallet-sdk/eip1193
 * that WalletMeshAccount implements.
 *
 * @module internal/providers/nemi/types
 * @packageDocumentation
 */

import type { AuthWitness, AztecAddress, CompleteAddress, Fr } from '@aztec/aztec.js';

/**
 * Account interface compatible with @nemi-fi/wallet-sdk/eip1193
 *
 * This interface matches the Account type from nemi SDK, allowing
 * WalletMesh accounts to be used with nemi's Contract.fromAztec() pattern.
 *
 * @public
 */
export interface NemiAccount {
  /**
   * Aztec address of the account
   * @readonly
   */
  readonly address: AztecAddress;

  /**
   * Get complete address with public keys
   * @returns Promise resolving to CompleteAddress
   */
  getCompleteAddress(): Promise<CompleteAddress>;

  /**
   * Sign a message with the account's private key
   * @param message - Message to sign
   * @returns Promise resolving to signature
   */
  signMessage(message: Buffer): Promise<Buffer>;

  /**
   * Create authorization witness for a message hash
   * Used for delegating actions to other accounts
   *
   * @param messageHash - Hash to authorize
   * @returns Promise resolving to AuthWitness
   */
  createAuthWit(messageHash: Fr | Buffer): Promise<AuthWitness>;

  /**
   * Get the chain ID of the connected network
   * @returns Promise resolving to chain ID
   */
  getChainId(): Promise<Fr>;

  /**
   * Get the version of the Aztec protocol
   * @returns Promise resolving to version
   */
  getVersion(): Promise<Fr>;
}
