import { AztecAddress } from '@aztec/aztec.js/addresses';
import type { Fq, Fr } from '@aztec/aztec.js/fields';
import type { Aliased } from '@aztec/aztec.js/wallet';
import type { StorageBackend } from './storage-backend.js';
import { BrowserStorageBackend, FileSystemStorageBackend } from './storage-backend.js';
import { deserializeAccountData, serializeAccountData } from './wallet-db-serialization.js';

/**
 * Account type identifier. Can be any string to support custom account types.
 */
export type AccountType = string;

/**
 * Account data stored in the wallet database.
 */
export interface AccountData {
  type: AccountType;
  secretKey: Fr;
  salt: Fr;
  signingKey: Fq;
  alias?: string;
}

/**
 * Interface for wallet database operations.
 * Provides storage and retrieval of account information.
 */
export interface WalletDB {
  /**
   * Lists all accounts stored in the database with their aliases.
   * @returns Promise resolving to array of aliased addresses
   */
  listAccounts(): Promise<Aliased<AztecAddress>[]>;

  /**
   * Retrieves account data for a given address.
   * @param address - The account address to retrieve
   * @returns Promise resolving to account data including type, secretKey, salt, signingKey, and optional alias
   * @throws Error if account not found
   */
  retrieveAccount(address: AztecAddress): Promise<AccountData>;

  /**
   * Stores account data in the database.
   * @param address - The account address
   * @param data - Account data to store
   */
  storeAccount(address: AztecAddress, data: AccountData): Promise<void>;

  /**
   * Checks if an account exists in the database.
   * @param address - The account address to check
   * @returns Promise resolving to true if account exists, false otherwise
   */
  hasAccount(address: AztecAddress): Promise<boolean>;

  /**
   * Deletes an account from the database.
   * @param address - The account address to delete
   */
  deleteAccount(address: AztecAddress): Promise<void>;
}

/**
 * In-memory implementation of WalletDB.
 * Stores account data in a Map structure.
 */
export class InMemoryWalletDB implements WalletDB {
  private accounts: Map<string, AccountData> = new Map();
  private aliases: Map<string, AztecAddress> = new Map();

  async listAccounts(): Promise<Aliased<AztecAddress>[]> {
    const result: Aliased<AztecAddress>[] = [];
    for (const [alias, address] of this.aliases.entries()) {
      result.push({ alias, item: address });
    }
    // Also include accounts without aliases
    for (const [addressStr, data] of this.accounts.entries()) {
      const address = AztecAddress.fromString(addressStr);
      // Only add if not already in result (i.e., doesn't have an alias)
      if (!this.aliases.has(data.alias || '')) {
        result.push({ alias: data.alias || '', item: address });
      }
    }
    return result;
  }

  async retrieveAccount(address: AztecAddress): Promise<AccountData> {
    const addressStr = address.toString();
    const data = this.accounts.get(addressStr);
    if (!data) {
      throw new Error(`Account "${addressStr}" does not exist in wallet database.`);
    }
    return { ...data };
  }

  async storeAccount(address: AztecAddress, data: AccountData): Promise<void> {
    const addressStr = address.toString();
    this.accounts.set(addressStr, { ...data });
    if (data.alias) {
      this.aliases.set(data.alias, address);
    }
  }

  async hasAccount(address: AztecAddress): Promise<boolean> {
    return this.accounts.has(address.toString());
  }

  async deleteAccount(address: AztecAddress): Promise<void> {
    const addressStr = address.toString();
    const data = this.accounts.get(addressStr);
    if (data?.alias) {
      this.aliases.delete(data.alias);
    }
    this.accounts.delete(addressStr);
  }
}

/**
 * Persistent WalletDB implementation using a StorageBackend.
 * Provides domain-specific methods for account management while using
 * a generic key/value storage backend that can be used for other data types.
 */
export class StorageBackendWalletDB implements WalletDB {
  private readonly storage: StorageBackend;

  /**
   * Creates a new StorageBackendWalletDB instance.
   * @param storage - The storage backend to use for persistence
   */
  constructor(storage: StorageBackend) {
    this.storage = storage;
  }

  /**
   * Get the underlying storage backend for advanced use cases.
   * @returns The storage backend instance
   */
  getStorageBackend(): StorageBackend {
    return this.storage;
  }

  async listAccounts(): Promise<Aliased<AztecAddress>[]> {
    const result: Aliased<AztecAddress>[] = [];

    // Get all alias mappings
    const aliasKeys = await this.storage.keys('alias:');
    for (const aliasKey of aliasKeys) {
      const addressStr = await this.storage.get<string>(aliasKey);
      if (addressStr) {
        const alias = aliasKey.slice('alias:'.length);
        const address = AztecAddress.fromString(addressStr);
        result.push({ alias, item: address });
      }
    }

    // Get all accounts and include those without aliases
    const accountKeys = await this.storage.keys('account:');
    for (const accountKey of accountKeys) {
      const serialized = await this.storage.get<ReturnType<typeof serializeAccountData>>(accountKey);
      if (serialized) {
        const addressStr = accountKey.slice('account:'.length);
        const address = AztecAddress.fromString(addressStr);
        const alias = serialized.alias;

        // Only add if not already in result (i.e., doesn't have an alias mapping)
        if (!alias || !(await this.storage.has(`alias:${alias}`))) {
          result.push({ alias: alias || '', item: address });
        }
      }
    }

    return result;
  }

  async retrieveAccount(address: AztecAddress): Promise<AccountData> {
    const addressStr = address.toString();
    const accountKey = `account:${addressStr}`;
    const serialized = await this.storage.get<ReturnType<typeof serializeAccountData>>(accountKey);

    if (!serialized) {
      throw new Error(`Account "${addressStr}" does not exist in wallet database.`);
    }

    return deserializeAccountData(serialized);
  }

  async storeAccount(address: AztecAddress, data: AccountData): Promise<void> {
    const addressStr = address.toString();
    const accountKey = `account:${addressStr}`;
    const serialized = serializeAccountData(data);

    await this.storage.set(accountKey, serialized);

    // Store alias mapping if provided
    if (data.alias) {
      const aliasKey = `alias:${data.alias}`;
      await this.storage.set(aliasKey, addressStr);
    }
  }

  async hasAccount(address: AztecAddress): Promise<boolean> {
    const addressStr = address.toString();
    const accountKey = `account:${addressStr}`;
    return this.storage.has(accountKey);
  }

  async deleteAccount(address: AztecAddress): Promise<void> {
    const addressStr = address.toString();
    const accountKey = `account:${addressStr}`;

    // Get account data to check for alias
    const serialized = await this.storage.get<ReturnType<typeof serializeAccountData>>(accountKey);
    if (serialized?.alias) {
      const aliasKey = `alias:${serialized.alias}`;
      await this.storage.delete(aliasKey);
    }

    await this.storage.delete(accountKey);
  }
}

/**
 * Create a WalletDB instance using a browser storage backend.
 * Automatically detects and uses the best available storage:
 * - Extension context: chrome.storage.local or browser.storage.local
 * - Regular browser: localStorage
 * @param storageBackend - Optional custom storage backend (defaults to BrowserStorageBackend)
 * @returns WalletDB instance
 */
export function createBrowserWalletDB(storageBackend?: StorageBackend): WalletDB {
  const storage = storageBackend ?? new BrowserStorageBackend();
  return new StorageBackendWalletDB(storage);
}

/**
 * Create a WalletDB instance using a file system storage backend.
 * @param filePath - Optional file path (defaults to ./walletmesh-storage.json)
 * @param storageBackend - Optional custom storage backend (defaults to FileSystemStorageBackend)
 * @returns WalletDB instance
 */
export function createFileSystemWalletDB(filePath?: string, storageBackend?: StorageBackend): WalletDB {
  const storage = storageBackend ?? new FileSystemStorageBackend(filePath);
  return new StorageBackendWalletDB(storage);
}

/**
 * Create a WalletDB instance using a custom storage backend.
 * @param storageBackend - The storage backend to use
 * @returns WalletDB instance
 */
export function createWalletDB(storageBackend: StorageBackend): WalletDB {
  return new StorageBackendWalletDB(storageBackend);
}
