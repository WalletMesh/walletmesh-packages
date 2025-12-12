/**
 * Generic key/value storage backend interface.
 * Provides a unified API for persistent storage across different environments.
 */
export interface StorageBackend {
  /**
   * Retrieve a value by key.
   * @param key - The storage key
   * @returns Promise resolving to the value, or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value by key.
   * @param key - The storage key
   * @param value - The value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Delete a key from storage.
   * @param key - The storage key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a key exists in storage.
   * @param key - The storage key to check
   * @returns Promise resolving to true if key exists, false otherwise
   */
  has(key: string): Promise<boolean>;

  /**
   * Get all keys in storage, optionally filtered by prefix.
   * @param prefix - Optional prefix to filter keys
   * @returns Promise resolving to array of keys
   */
  keys(prefix?: string): Promise<string[]>;

  /**
   * Clear all data from storage.
   */
  clear(): Promise<void>;

  /**
   * Get all key/value pairs, optionally filtered by prefix.
   * @param prefix - Optional prefix to filter keys
   * @returns Promise resolving to Map of key/value pairs
   */
  getAll<T>(prefix?: string): Promise<Map<string, T>>;
}

/**
 * Type for Chrome extension storage API.
 */
type ChromeStorageLocal = {
  get(keys: string[] | null, callback: (result: Record<string, unknown>) => void): void;
  set(items: Record<string, unknown>, callback?: () => void): void;
  remove(key: string, callback?: () => void): void;
  clear(callback?: () => void): void;
};

/**
 * Type for Firefox extension storage API.
 */
type BrowserStorageLocal = {
  get(keys: string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
};

/**
 * Helper function to check for Chrome extension storage errors.
 */
function getChromeRuntimeError(): Error | null {
  const globalObj = globalThis as typeof globalThis & {
    chrome?: { runtime?: { lastError?: { message: string } } };
  };
  if (globalObj.chrome?.runtime?.lastError) {
    return new Error(globalObj.chrome.runtime.lastError.message);
  }
  return null;
}

/**
 * Browser storage backend implementation.
 * Automatically detects and uses the best available storage:
 * - Extension context: chrome.storage.local or browser.storage.local
 * - Regular browser: localStorage (wrapped in async API)
 */
export class BrowserStorageBackend implements StorageBackend {
  private readonly useExtensionStorage: boolean;
  private readonly isChromeStorage: boolean;
  private readonly chromeStorage: ChromeStorageLocal | null;
  private readonly browserStorage: BrowserStorageLocal | null;

  constructor() {
    // Check for WebExtensions Storage API (Chrome or Firefox)
    const globalObj = globalThis as typeof globalThis & {
      chrome?: { storage?: { local?: ChromeStorageLocal; runtime?: { lastError?: { message: string } } } };
      browser?: { storage?: { local?: BrowserStorageLocal } };
    };

    if (globalObj.chrome?.storage?.local) {
      this.useExtensionStorage = true;
      this.isChromeStorage = true;
      this.chromeStorage = globalObj.chrome.storage.local;
      this.browserStorage = null;
    } else if (globalObj.browser?.storage?.local) {
      this.useExtensionStorage = true;
      this.isChromeStorage = false;
      this.chromeStorage = null;
      this.browserStorage = globalObj.browser.storage.local;
    } else {
      this.useExtensionStorage = false;
      this.isChromeStorage = false;
      this.chromeStorage = null;
      this.browserStorage = null;
    }

    // Validate localStorage availability if not using extension storage
    if (!this.useExtensionStorage) {
      if (typeof localStorage === 'undefined') {
        throw new Error('LocalStorage is not available in this environment');
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        // Chrome callback-based API
        return new Promise((resolve, reject) => {
          this.chromeStorage?.get([key], (result: Record<string, unknown>) => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage get failed: ${error.message}`));
              return;
            }
            const value = result[key];
            resolve(value !== undefined ? (value as T) : null);
          });
        });
      } else if (this.browserStorage) {
        // Firefox Promise-based API
        const result = await this.browserStorage.get([key]);
        const value = result[key];
        return value !== undefined ? (value as T) : null;
      }
    }

    // Use localStorage
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      throw new Error(
        `Failed to get value from localStorage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        return new Promise((resolve, reject) => {
          this.chromeStorage?.set({ [key]: value }, () => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage set failed: ${error.message}`));
              return;
            }
            resolve();
          });
        });
      } else if (this.browserStorage) {
        await this.browserStorage.set({ [key]: value });
        return;
      }
    }

    // Use localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please free up space and try again.');
      }
      throw new Error(
        `Failed to set value in localStorage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async delete(key: string): Promise<void> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        return new Promise((resolve, reject) => {
          this.chromeStorage?.remove(key, () => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage delete failed: ${error.message}`));
              return;
            }
            resolve();
          });
        });
      } else if (this.browserStorage) {
        await this.browserStorage.remove(key);
        return;
      }
    }

    // Use localStorage
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(
        `Failed to delete value from localStorage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async has(key: string): Promise<boolean> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        return new Promise((resolve, reject) => {
          this.chromeStorage?.get([key], (result: Record<string, unknown>) => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage has failed: ${error.message}`));
              return;
            }
            resolve(result[key] !== undefined);
          });
        });
      } else if (this.browserStorage) {
        const result = await this.browserStorage.get([key]);
        return result[key] !== undefined;
      }
    }

    // Use localStorage
    return localStorage.getItem(key) !== null;
  }

  async keys(prefix?: string): Promise<string[]> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        return new Promise((resolve, reject) => {
          this.chromeStorage?.get(null, (result: Record<string, unknown>) => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage keys failed: ${error.message}`));
              return;
            }
            const allKeys = Object.keys(result);
            if (prefix) {
              resolve(allKeys.filter((key) => key.startsWith(prefix)));
            } else {
              resolve(allKeys);
            }
          });
        });
      } else if (this.browserStorage) {
        const result = await this.browserStorage.get(null);
        const allKeys = Object.keys(result);
        if (prefix) {
          return allKeys.filter((key) => key.startsWith(prefix));
        }
        return allKeys;
      }
    }

    // Use localStorage
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        if (prefix) {
          if (key.startsWith(prefix)) {
            allKeys.push(key);
          }
        } else {
          allKeys.push(key);
        }
      }
    }
    return allKeys;
  }

  async clear(): Promise<void> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        return new Promise((resolve, reject) => {
          this.chromeStorage?.clear(() => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage clear failed: ${error.message}`));
              return;
            }
            resolve();
          });
        });
      } else if (this.browserStorage) {
        await this.browserStorage.clear();
        return;
      }
    }

    // Use localStorage
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(
        `Failed to clear localStorage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getAll<T>(prefix?: string): Promise<Map<string, T>> {
    if (this.useExtensionStorage) {
      if (this.isChromeStorage && this.chromeStorage) {
        return new Promise((resolve, reject) => {
          this.chromeStorage?.get(null, (result: Record<string, unknown>) => {
            const error = getChromeRuntimeError();
            if (error) {
              reject(new Error(`Storage getAll failed: ${error.message}`));
              return;
            }
            const map = new Map<string, T>();
            for (const [key, value] of Object.entries(result)) {
              if (prefix) {
                if (key.startsWith(prefix)) {
                  map.set(key, value as T);
                }
              } else {
                map.set(key, value as T);
              }
            }
            resolve(map);
          });
        });
      } else if (this.browserStorage) {
        const result = await this.browserStorage.get(null);
        const map = new Map<string, T>();
        for (const [key, value] of Object.entries(result)) {
          if (prefix) {
            if (key.startsWith(prefix)) {
              map.set(key, value as T);
            }
          } else {
            map.set(key, value as T);
          }
        }
        return map;
      }
    }

    // Use localStorage
    const map = new Map<string, T>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        if (prefix) {
          if (key.startsWith(prefix)) {
            const item = localStorage.getItem(key);
            if (item !== null) {
              try {
                map.set(key, JSON.parse(item) as T);
              } catch {
                // Skip invalid JSON entries
              }
            }
          }
        } else {
          const item = localStorage.getItem(key);
          if (item !== null) {
            try {
              map.set(key, JSON.parse(item) as T);
            } catch {
              // Skip invalid JSON entries
            }
          }
        }
      }
    }
    return map;
  }
}

/**
 * File system storage backend implementation for Node.js environments.
 * Stores data in a single JSON file with atomic writes.
 */
export class FileSystemStorageBackend implements StorageBackend {
  private readonly filePath: string;
  private data: Map<string, unknown> = new Map();
  private initialized: boolean = false;

  constructor(filePath: string = './walletmesh-storage.json') {
    this.filePath = filePath;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Check if we're in Node.js environment
    if (typeof process === 'undefined' || !process.versions?.node) {
      throw new Error('FileSystemStorageBackend requires Node.js environment');
    }

    const fs = await import('node:fs/promises');
    const pathModule = await import('node:path');

    // Create directory if it doesn't exist
    const dir = pathModule.dirname(this.filePath);
    if (dir !== '.') {
      await fs.mkdir(dir, { recursive: true });
    }

    // Load existing data if file exists
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(content);
      this.data = new Map(Object.entries(parsed));
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      if ((error as { code?: string }).code !== 'ENOENT') {
        throw new Error(
          `Failed to read storage file: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      this.data = new Map();
    }

    this.initialized = true;
  }

  private async save(): Promise<void> {
    const fs = await import('node:fs/promises');

    // Atomic write: write to temp file, then rename
    const tempPath = `${this.filePath}.tmp`;
    const dataObj = Object.fromEntries(this.data);
    const content = JSON.stringify(dataObj, null, 2);

    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    const value = this.data.get(key);
    return value !== undefined ? (value as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureInitialized();
    this.data.set(key, value);
    await this.save();
  }

  async delete(key: string): Promise<void> {
    await this.ensureInitialized();
    this.data.delete(key);
    await this.save();
  }

  async has(key: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.data.has(key);
  }

  async keys(prefix?: string): Promise<string[]> {
    await this.ensureInitialized();
    const allKeys = Array.from(this.data.keys());
    if (prefix) {
      return allKeys.filter((key) => key.startsWith(prefix));
    }
    return allKeys;
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    this.data.clear();
    await this.save();
  }

  async getAll<T>(prefix?: string): Promise<Map<string, T>> {
    await this.ensureInitialized();
    const map = new Map<string, T>();
    for (const [key, value] of this.data.entries()) {
      if (prefix) {
        if (key.startsWith(prefix)) {
          map.set(key, value as T);
        }
      } else {
        map.set(key, value as T);
      }
    }
    return map;
  }
}
