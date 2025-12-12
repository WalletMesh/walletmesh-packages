import { type Account, SignerlessAccount } from '@aztec/aztec.js/account';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import type { Fq, Fr } from '@aztec/aztec.js/fields';
import type { AztecNode } from '@aztec/aztec.js/node';
import { AccountManager, type Aliased } from '@aztec/aztec.js/wallet';
import type { PXE } from '@aztec/pxe/server';
import { BaseWallet } from '@aztec/wallet-sdk/base-wallet';
import type { AccountContractRegistry } from './account-contract-factory.js';
import type { WalletDB } from './wallet-db.js';

/**
 * Aztec server wallet implementation following the demo-wallet InternalWallet pattern.
 * Manages accounts using a WalletDB and creates AccountManagers on-demand from stored account data.
 */
export class AztecServerWallet extends BaseWallet {
  protected db: WalletDB;
  protected accountContractRegistry: AccountContractRegistry;
  protected accountManagerCache: Map<string, AccountManager> = new Map();

  constructor(pxe: PXE, node: AztecNode, db: WalletDB, accountContractRegistry: AccountContractRegistry) {
    super(pxe, node);
    this.db = db;
    this.accountContractRegistry = accountContractRegistry;
  }

  async createAccount({
    alias,
    type,
    secret,
    salt,
    signingKey,
  }: {
    alias?: string;
    type: string;
    secret: Fr;
    salt: Fr;
    signingKey: Fq;
  }): Promise<AccountManager> {
    const contract = this.accountContractRegistry.createContract(type, signingKey);
    const accountManager = await AccountManager.create(this, secret, contract, salt);
    await this.db.storeAccount(accountManager.address, {
      type,
      alias: alias ?? '',
      secretKey: secret,
      salt,
      signingKey: signingKey,
    });
    return accountManager;
  }

  /**
   * Creates an AccountManager from stored account data.
   * @param type - Account type identifier
   * @param secret - Account secret key
   * @param salt - Deployment salt
   * @param signingKey - Signing key
   * @returns AccountManager instance
   */
  protected async getAccountManager(
    type: string,
    secret: Fr,
    salt: Fr,
    signingKey: Fq,
  ): Promise<AccountManager> {
    // Create account contract using the registry
    const contract = this.accountContractRegistry.createContract(type, signingKey);

    // Create AccountManager
    const accountManager = await AccountManager.create(this, secret, contract, salt);

    // Get the instance and artifact for registration
    const instance = await accountManager.getInstance();
    const artifact = await accountManager.getAccountContract().getContractArtifact();

    // Register contract with PXE
    await this.registerContract(instance, artifact, secret);

    return accountManager;
  }

  /**
   * Retrieves an account from an address.
   * For ZERO address, returns a SignerlessAccount.
   * For other addresses, retrieves account data from DB and creates AccountManager on-demand.
   */
  protected async getAccountFromAddress(address: AztecAddress): Promise<Account> {
    if (address.equals(AztecAddress.ZERO)) {
      const chainInfo = await this.getChainInfo();
      return new SignerlessAccount(chainInfo);
    }

    // Check cache first
    const addressStr = address.toString();
    const cached = this.accountManagerCache.get(addressStr);
    if (cached) {
      return cached.getAccount();
    }

    // Retrieve account data from DB
    const accountData = await this.db.retrieveAccount(address);

    // Create AccountManager from stored data
    const accountManager = await this.getAccountManager(
      accountData.type,
      accountData.secretKey,
      accountData.salt,
      accountData.signingKey,
    );

    // Cache the AccountManager
    this.accountManagerCache.set(addressStr, accountManager);

    return accountManager.getAccount();
  }

  /**
   * Lists all accounts stored in the wallet database.
   * @returns Array of aliased addresses
   */
  async getAccounts(): Promise<Aliased<AztecAddress>[]> {
    return this.db.listAccounts();
  }

  /**
   * Stores a new account in the wallet database.
   * @param address - Account address
   * @param data - Account data including type, secretKey, salt, signingKey, and optional alias
   */
  async storeAccount(
    address: AztecAddress,
    data: {
      type: string;
      secretKey: Fr;
      salt: Fr;
      signingKey: Fq;
      alias?: string;
    },
  ): Promise<void> {
    await this.db.storeAccount(address, data);
  }
}
