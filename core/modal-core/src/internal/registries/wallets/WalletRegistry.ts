import type { ChainType, DiscoveredWalletInfo, WalletInfo } from '../../../types.js';
import type { AvailableWallet } from '../../client/WalletMeshClient.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { modalLogger } from '../../core/logger/globalLogger.js';
import type {
  WalletAdapter,
  WalletAdapterConstructor,
  WalletFeature,
} from '../../wallets/base/WalletAdapter.js';

/**
 * Registry for managing wallet adapters
 *
 * Central registry that tracks all available wallet adapters.
 * Provides methods to register, unregister, and query adapters
 * based on various criteria like chain support and features.
 *
 * @example
 * ```typescript
 * const registry = new WalletRegistry();
 *
 * // Register adapters
 * registry.register(new MetaMaskAdapter());
 * registry.register(new PhantomAdapter());
 *
 * // Query adapters
 * const evmAdapters = registry.getAdaptersForChain(ChainType.Evm);
 * const adapter = registry.getAdapter('metamask');
 * ```
 *
 * @public
 */
export class WalletRegistry {
  private adapters = new Map<string, WalletAdapter>();
  private adapterClasses = new Map<
    string,
    { constructor: WalletAdapterConstructor; walletInfo: WalletInfo }
  >();
  private discoveredWallets = new Map<string, DiscoveredWalletInfo>();
  private discoveredWalletAliases = new Map<string, string>();
  private eventTarget = new EventTarget();

  /**
   * Register a wallet adapter
   *
   * Adds a wallet adapter to the registry. Each adapter must have
   * a unique ID. Attempting to register an adapter with a duplicate
   * ID will throw an error.
   *
   * @param adapter - The wallet adapter to register
   * @throws {Error} If an adapter with the same ID is already registered
   *
   * @example
   * ```typescript
   * const adapter = new MetaMaskAdapter();
   * registry.register(adapter);
   * ```
   */
  register(adapter: WalletAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw ErrorFactory.configurationError(`Wallet adapter with id '${adapter.id}' is already registered`);
    }

    this.adapters.set(adapter.id, adapter);
    this.emit('adapter:registered', adapter);
  }

  /**
   * Register a wallet adapter class for lazy instantiation
   *
   * Stores a wallet adapter class without instantiating it. The adapter
   * will be instantiated only when needed (when user selects it).
   *
   * @param adapterClass - The wallet adapter class constructor
   * @param walletInfo - Pre-extracted wallet information
   *
   * @example
   * ```typescript
   * const walletInfo = AztecExampleWalletAdapter.getWalletInfo();
   * registry.registerClass(AztecExampleWalletAdapter, walletInfo);
   * ```
   */
  registerClass(adapterClass: WalletAdapterConstructor, walletInfo: WalletInfo): void {
    if (this.adapterClasses.has(walletInfo.id) || this.adapters.has(walletInfo.id)) {
      throw ErrorFactory.configurationError(
        `Wallet adapter with id '${walletInfo.id}' is already registered`,
      );
    }

    this.adapterClasses.set(walletInfo.id, { constructor: adapterClass, walletInfo });
    // Note: We don't emit 'adapter:registered' here since it's not instantiated yet
    // The adapter will be registered when it's instantiated on demand
  }

  /**
   * Unregister a wallet adapter
   *
   * Removes a wallet adapter from the registry by its ID.
   * If the adapter is not found, this method does nothing.
   *
   * @param adapterId - The ID of the adapter to remove
   *
   * @example
   * ```typescript
   * registry.unregister('metamask');
   * ```
   */
  unregister(adapterId: string): void {
    const adapter = this.adapters.get(adapterId);
    const adapterClass = this.adapterClasses.get(adapterId);

    if (!adapter && !adapterClass) {
      return;
    }

    this.adapters.delete(adapterId);
    this.adapterClasses.delete(adapterId);
    this.emit('adapter:unregistered', adapterId);
  }

  /**
   * Get a specific adapter by ID
   *
   * Retrieves a wallet adapter by its unique identifier.
   * If the adapter was registered as a class, it will be instantiated on first access.
   *
   * @param id - The adapter ID to look up
   * @returns The wallet adapter if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const adapter = registry.getAdapter('metamask');
   * if (adapter) {
   *   const connector = adapter.createConnector(config);
   * }
   * ```
   */
  getAdapter(id: string): WalletAdapter | undefined {
    // Check if already instantiated
    const existingAdapter = this.adapters.get(id);
    if (existingAdapter) {
      return existingAdapter;
    }

    // Check if we have a class to instantiate
    const adapterClass = this.adapterClasses.get(id);
    if (adapterClass) {
      modalLogger.debug('Lazily instantiating wallet adapter', { id });
      const adapter = new adapterClass.constructor();
      // Move from classes to adapters map
      this.adapters.set(id, adapter);
      this.adapterClasses.delete(id);
      return adapter;
    }

    return undefined;
  }

  /**
   * Get all registered adapters
   *
   * Returns an array of all wallet adapters currently registered.
   * Note: This will NOT instantiate adapter classes.
   *
   * @returns Array of all registered wallet adapters
   *
   * @example
   * ```typescript
   * const allAdapters = registry.getAllAdapters();
   * console.log(`${allAdapters.length} wallets available`);
   * ```
   */
  getAllAdapters(): WalletAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get wallet info for all registered wallets
   *
   * Returns wallet information for all registered wallets, including
   * those registered as classes (without instantiating them).
   *
   * @returns Array of wallet information
   *
   * @example
   * ```typescript
   * const allWallets = registry.getAllWalletInfo();
   * console.log(`${allWallets.length} wallets available`);
   * ```
   */
  getAllWalletInfo(): WalletInfo[] {
    const walletInfos: WalletInfo[] = [];

    // Add info from instantiated adapters
    for (const adapter of this.adapters.values()) {
      const walletInfo: WalletInfo = {
        id: adapter.id,
        name: adapter.metadata.name,
        chains: adapter.capabilities.chains.map((c) => c.type),
      };

      // Add optional properties only if they exist
      if (adapter.metadata.icon) {
        walletInfo.icon = adapter.metadata.icon;
      }
      if (adapter.metadata.description) {
        walletInfo.description = adapter.metadata.description;
      }
      if (adapter.capabilities.features && adapter.capabilities.features.size > 0) {
        walletInfo.features = Array.from(adapter.capabilities.features);
      }

      walletInfos.push(walletInfo);
    }

    // Add info from non-instantiated classes
    for (const { walletInfo } of this.adapterClasses.values()) {
      walletInfos.push(walletInfo);
    }

    return walletInfos;
  }

  /**
   * Get adapters that support a specific chain type
   *
   * Filters the registered adapters to find those that support
   * the specified blockchain type (EVM, Solana, etc).
   *
   * @param chainType - The blockchain type to filter by
   * @returns Array of adapters that support the chain type
   *
   * @example
   * ```typescript
   * const evmAdapters = registry.getAdaptersForChain(ChainType.Evm);
   * const solanaAdapters = registry.getAdaptersForChain(ChainType.Solana);
   * ```
   */
  getAdaptersForChain(chainType: ChainType): WalletAdapter[] {
    return this.getAllAdapters().filter((adapter) =>
      adapter.capabilities.chains.some((chain) => chain.type === chainType),
    );
  }

  /**
   * Get adapters that support a specific feature
   *
   * Filters adapters based on their supported features such as
   * message signing, encryption, multi-account support, etc.
   *
   * @param feature - The wallet feature to filter by
   * @returns Array of adapters that support the feature
   *
   * @example
   * ```typescript
   * const signingAdapters = registry.getAdaptersByFeature('sign_message');
   * const multiAccountAdapters = registry.getAdaptersByFeature('multi_account');
   * ```
   */
  getAdaptersByFeature(feature: WalletFeature): WalletAdapter[] {
    return this.getAllAdapters().filter((adapter) => adapter.capabilities.features.has(feature));
  }

  /**
   * Detect which adapters are available in the current environment
   *
   * Checks each registered adapter to see if its wallet is installed
   * and available in the current browser/environment. This is useful
   * for showing only available wallets in the connection UI.
   *
   * @returns Promise resolving to array of detection results
   *
   * @example
   * ```typescript
   * const detected = await registry.detectAvailableAdapters();
   * const available = detected.filter(d => d.available);
   * console.log(`Found ${available.length} wallets installed`);
   * ```
   */
  async detectAvailableAdapters(): Promise<AvailableWallet[]> {
    const adapters = this.getAllAdapters();
    const detectionPromises = adapters.map(async (adapter) => {
      try {
        const result = await adapter.detect();
        const availableWallet: AvailableWallet = {
          adapter,
          available: result.isInstalled,
        };
        if (result.version !== undefined) {
          availableWallet.version = result.version;
        }
        if (result.metadata !== undefined) {
          availableWallet.customData = result.metadata;
        }
        return availableWallet;
      } catch (error) {
        // If detection fails, treat as unavailable
        return {
          adapter,
          available: false,
          customData: { detectionError: error },
        };
      }
    });

    return Promise.all(detectionPromises);
  }

  /**
   * Load multiple adapters at once
   *
   * Convenience method to register multiple adapters in a single call.
   *
   * @param adapters - Array of wallet adapters to register
   *
   * @example
   * ```typescript
   * await registry.loadAdapters([
   *   new MetaMaskAdapter(),
   *   new PhantomAdapter(),
   *   new CoinbaseAdapter()
   * ]);
   * ```
   */
  async loadAdapters(adapters: WalletAdapter[]): Promise<void> {
    for (const adapter of adapters) {
      this.register(adapter);
    }
  }

  /**
   * Load adapters from a directory (for Node.js environments) or registry
   *
   * Dynamically loads wallet adapters from various sources:
   * - Built-in adapters (predefined list)
   * - File system directory (Node.js only)
   * - Module registry (npm packages)
   * - Remote URLs (with security considerations)
   *
   * @param source - Directory path, builtin registry key, or module identifier
   * @param options - Loading options
   * @throws {Error} If loading fails or source is invalid
   * @internal
   */
  async loadAdaptersFromDirectory(
    source: string,
    options: {
      /** Loading strategy: 'builtin', 'filesystem', 'module', or 'auto' */
      strategy?: 'builtin' | 'filesystem' | 'module' | 'auto';
      /** Filter adapters by pattern */
      filter?: RegExp | string;
      /** Maximum number of adapters to load */
      maxAdapters?: number;
      /** Whether to continue loading if one adapter fails */
      continueOnError?: boolean;
      /** Adapter loading timeout in milliseconds */
      timeout?: number;
    } = {},
  ): Promise<void> {
    const { strategy = 'auto', filter, maxAdapters = 50, continueOnError = true, timeout = 10000 } = options;

    const startTime = Date.now();
    let loadedCount = 0;
    const errors: Error[] = [];

    // Determine loading strategy
    const actualStrategy = strategy === 'auto' ? this.detectLoadingStrategy(source) : strategy;

    try {
      switch (actualStrategy) {
        case 'builtin':
          loadedCount = await this.loadBuiltinAdaptersImpl(source, filter, maxAdapters);
          break;

        case 'filesystem':
          if (typeof require === 'undefined' && typeof import.meta?.resolve === 'undefined') {
            throw ErrorFactory.configurationError(
              'Filesystem loading not supported in this environment (no require or import.meta)',
            );
          }
          loadedCount = await this.loadFromFilesystem(source, filter, maxAdapters, continueOnError, timeout);
          break;

        case 'module':
          loadedCount = await this.loadFromModule(source, filter, maxAdapters, continueOnError, timeout);
          break;

        default:
          throw ErrorFactory.configurationError(`Unknown loading strategy: ${actualStrategy}`);
      }

      const duration = Date.now() - startTime;
      console.debug(`[WalletRegistry] Loaded ${loadedCount} adapters in ${duration}ms`);

      if (errors.length > 0 && !continueOnError) {
        throw ErrorFactory.configurationError(
          `Failed to load adapters: ${errors.map((e) => e.message).join(', ')}`,
        );
      }
    } catch (error) {
      throw ErrorFactory.configurationError(
        `Dynamic adapter loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { source, strategy: actualStrategy, errors },
      );
    }
  }

  /**
   * Detect the appropriate loading strategy based on the source
   * @private
   */
  private detectLoadingStrategy(source: string): 'builtin' | 'filesystem' | 'module' {
    // Check if it's a builtin registry key
    if (source === 'builtin' || source === 'all' || source === 'default') {
      return 'builtin';
    }

    // Check if it looks like a filesystem path
    if (
      source.startsWith('/') ||
      source.startsWith('./') ||
      source.startsWith('../') ||
      source.includes('\\')
    ) {
      return 'filesystem';
    }

    // Check if it looks like a module name
    if (source.startsWith('@') || !source.includes('/') || source.startsWith('npm:')) {
      return 'module';
    }

    // Default to filesystem for local paths
    return 'filesystem';
  }

  /**
   * Load built-in adapters (private implementation)
   * @private
   */
  private async loadBuiltinAdaptersImpl(
    _registry: string,
    filter?: RegExp | string,
    maxAdapters = 50,
  ): Promise<number> {
    const builtinAdapters = await this.getBuiltinAdapterList();
    const filterRegex = typeof filter === 'string' ? new RegExp(filter, 'i') : filter;
    let count = 0;

    for (const adapterInfo of builtinAdapters) {
      if (count >= maxAdapters) {
        break;
      }

      if (filterRegex && !filterRegex.test(adapterInfo.id)) {
        continue;
      }

      try {
        const adapter = await this.loadBuiltinAdapter(adapterInfo.id);
        if (adapter) {
          this.register(adapter);
          count++;
        }
      } catch (error) {
        modalLogger.warn(`Failed to load builtin adapter ${adapterInfo.id}`, error);
      }
    }

    return count;
  }

  /**
   * Get list of available builtin adapters
   * @private
   */
  private async getBuiltinAdapterList(): Promise<Array<{ id: string; name: string; module: string }>> {
    return [
      { id: 'evm-wallet', name: 'EVM Wallet', module: '../../wallets/evm/EvmAdapter.js' },
      { id: 'debug-wallet', name: 'Debug Wallet', module: '../../wallets/debug/DebugWallet.js' },
      {
        id: 'aztec-example-wallet',
        name: 'Aztec Example Wallet',
        module: '../../wallets/aztec-example/AztecExampleWalletAdapter.js',
      },
      // Add more builtin adapters here as they are implemented
    ];
  }

  /**
   * Load a specific builtin adapter
   * @private
   */
  private async loadBuiltinAdapter(adapterId: string): Promise<WalletAdapter | null> {
    try {
      switch (adapterId) {
        case 'evm-wallet': {
          const { EvmAdapter } = await import(/* @vite-ignore */ '../../wallets/evm/EvmAdapter.js');
          return new EvmAdapter();
        }
        case 'debug-wallet': {
          const { DebugWallet } = await import(/* @vite-ignore */ '../../wallets/debug/DebugWallet.js');
          return new DebugWallet();
        }
        case 'aztec-example-wallet': {
          const { AztecExampleWalletAdapter } = await import(
            /* @vite-ignore */ '../../wallets/aztec-example/AztecExampleWalletAdapter.js'
          );
          return new AztecExampleWalletAdapter();
        }
        default:
          modalLogger.warn(`Unknown builtin adapter: ${adapterId}`);
          return null;
      }
    } catch (error) {
      console.error(`[WalletRegistry] Failed to import builtin adapter ${adapterId}:`, error);
      return null;
    }
  }

  /**
   * Load adapters from filesystem directory
   * @private
   */
  private async loadFromFilesystem(
    dir: string,
    filter?: RegExp | string,
    maxAdapters = 50,
    continueOnError = true,
    timeout = 10000,
  ): Promise<number> {
    // This implementation is for Node.js environments only
    if (typeof require === 'undefined') {
      throw ErrorFactory.configurationError('Filesystem loading requires Node.js environment');
    }

    const fs = await import(/* @vite-ignore */ 'node:fs');
    const path = await import(/* @vite-ignore */ 'node:path');

    // Check if directory exists
    if (!fs.existsSync(dir)) {
      throw ErrorFactory.configurationError(`Adapter directory does not exist: ${dir}`);
    }

    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
      throw ErrorFactory.configurationError(`Path is not a directory: ${dir}`);
    }

    // Read directory contents
    const files = fs.readdirSync(dir);
    const adapterFiles = files.filter((file) => {
      // Look for TypeScript or JavaScript files that look like adapters
      const isAdapterFile = file.endsWith('.ts') || file.endsWith('.js');
      const hasAdapterName = file.includes('Adapter') || file.includes('adapter');
      return isAdapterFile && hasAdapterName;
    });

    const filterRegex = typeof filter === 'string' ? new RegExp(filter, 'i') : filter;
    let loadedCount = 0;

    for (const file of adapterFiles) {
      if (loadedCount >= maxAdapters) {
        break;
      }

      if (filterRegex && !filterRegex.test(file)) {
        continue;
      }

      try {
        const filePath = path.join(dir, file);
        const adapter = await this.loadAdapterFromFile(filePath, timeout);
        if (adapter) {
          this.register(adapter);
          loadedCount++;
        }
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        modalLogger.warn(`Failed to load adapter from ${file}`, error);
      }
    }

    return loadedCount;
  }

  /**
   * Load adapters from npm modules
   * @private
   */
  private async loadFromModule(
    moduleName: string,
    filter?: RegExp | string,
    maxAdapters = 50,
    continueOnError = true,
    timeout = 10000,
  ): Promise<number> {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              ErrorFactory.configurationError(`Module loading timeout: ${moduleName}`, {
                moduleName,
                timeout,
              }),
            ),
          timeout,
        ),
      );

      // Clean module name (remove npm: prefix if present)
      const cleanModuleName = moduleName.startsWith('npm:') ? moduleName.slice(4) : moduleName;

      // Dynamic import with timeout
      const modulePromise = import(/* @vite-ignore */ cleanModuleName);
      const module = await Promise.race([modulePromise, timeoutPromise]);

      // Look for exported adapter classes or factory functions
      const adapterExports = this.extractAdaptersFromModule(module as Record<string, unknown>);
      const filterRegex = typeof filter === 'string' ? new RegExp(filter, 'i') : filter;

      let loadedCount = 0;
      for (const adapterExport of adapterExports) {
        if (loadedCount >= maxAdapters) {
          break;
        }

        if (filterRegex && !filterRegex.test(adapterExport.name)) {
          continue;
        }

        try {
          const adapter = await this.instantiateAdapter(adapterExport);
          if (adapter) {
            this.register(adapter);
            loadedCount++;
          }
        } catch (error) {
          if (!continueOnError) {
            throw error;
          }
          modalLogger.warn(`Failed to instantiate adapter ${adapterExport.name}`, error);
        }
      }

      return loadedCount;
    } catch (error) {
      throw ErrorFactory.configurationError(
        `Failed to load module ${moduleName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Load adapter from a specific file path
   * @private
   */
  private async loadAdapterFromFile(filePath: string, timeout: number): Promise<WalletAdapter | null> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(ErrorFactory.configurationError(`File loading timeout: ${filePath}`, { filePath, timeout })),
        timeout,
      ),
    );

    try {
      // For file system loading, we need to convert to file:// URL for ES modules
      const fileUrl = `file://${filePath}`;
      const modulePromise = import(/* @vite-ignore */ fileUrl);
      const module = await Promise.race([modulePromise, timeoutPromise]);

      const adapterExports = this.extractAdaptersFromModule(module as Record<string, unknown>);
      if (adapterExports.length === 0) {
        return null;
      }

      // Use the first adapter found in the file
      const firstAdapter = adapterExports[0];
      if (firstAdapter) {
        return await this.instantiateAdapter(firstAdapter);
      }
      return null;
    } catch (error) {
      modalLogger.warn(`Failed to load adapter from file ${filePath}`, error);
      return null;
    }
  }

  /**
   * Extract adapter classes/functions from a module
   * @private
   */
  private extractAdaptersFromModule(
    module: Record<string, unknown>,
  ): Array<{ name: string; export: unknown }> {
    const adapterExports: Array<{ name: string; export: unknown }> = [];

    for (const [name, exportValue] of Object.entries(module)) {
      // Check if it looks like an adapter class or factory
      if (this.isAdapterExport(exportValue, name)) {
        adapterExports.push({ name, export: exportValue });
      }
    }

    return adapterExports;
  }

  /**
   * Check if an export looks like a wallet adapter
   * @private
   */
  private isAdapterExport(exportValue: unknown, name: string): boolean {
    // Check if it's a constructor function
    if (typeof exportValue === 'function') {
      // Check if the name suggests it's an adapter
      const nameMatches = /adapter/i.test(name) || name.endsWith('Adapter');

      // Check if it has adapter-like properties when instantiated (basic heuristic)
      try {
        const prototype = (exportValue as { prototype?: Record<string, unknown> }).prototype;
        if (prototype) {
          const hasAdapterMethods =
            'connect' in prototype && 'disconnect' in prototype && 'detect' in prototype;
          return nameMatches || hasAdapterMethods;
        }
      } catch {
        // Ignore errors during prototype inspection
      }

      return nameMatches;
    }

    // Check if it's an object that might be an adapter instance
    if (typeof exportValue === 'object' && exportValue !== null) {
      const obj = exportValue as Record<string, unknown>;
      const hasAdapterInterface =
        'id' in obj && 'metadata' in obj && 'capabilities' in obj && typeof obj['connect'] === 'function';
      return hasAdapterInterface;
    }

    return false;
  }

  /**
   * Instantiate an adapter from an export
   * @private
   */
  private async instantiateAdapter(adapterExport: {
    name: string;
    export: unknown;
  }): Promise<WalletAdapter | null> {
    try {
      const { export: exportValue } = adapterExport;

      // If it's already an adapter instance
      if (typeof exportValue === 'object' && exportValue !== null) {
        const obj = exportValue as Record<string, unknown>;
        const hasAdapterInterface =
          'id' in obj && 'metadata' in obj && 'capabilities' in obj && typeof obj['connect'] === 'function';

        if (hasAdapterInterface) {
          // Additional validation to ensure it's really a WalletAdapter
          if (
            typeof obj['disconnect'] === 'function' &&
            typeof obj['id'] === 'string' &&
            typeof obj['metadata'] === 'object' &&
            typeof obj['capabilities'] === 'object'
          ) {
            // Cast to unknown first to avoid direct conversion error
            const adapter: unknown = obj;
            return adapter as WalletAdapter;
          }
        }
      }

      // If it's a constructor function, instantiate it
      if (typeof exportValue === 'function') {
        try {
          const instance = new (exportValue as new () => WalletAdapter)();
          // Validate that it implements the WalletAdapter interface
          if (
            typeof instance === 'object' &&
            instance !== null &&
            'id' in instance &&
            typeof instance.connect === 'function'
          ) {
            return instance;
          }
        } catch (error) {
          modalLogger.warn(`Failed to instantiate adapter ${adapterExport.name}`, error);
          return null;
        }
      }

      return null;
    } catch (error) {
      modalLogger.warn(`Failed to process adapter export ${adapterExport.name}`, error);
      return null;
    }
  }

  /**
   * Subscribe to registry events
   *
   * Listen for adapter registration and unregistration events.
   *
   * @param event - Event name ('adapter:registered' or 'adapter:unregistered')
   * @param handler - Event handler function
   *
   * @example
   * ```typescript
   * registry.on('adapter:registered', (adapter) => {
   *   console.log(`New wallet registered: ${adapter.metadata.name}`);
   * });
   * ```
   */
  on(event: string, handler: (data: WalletAdapter | string) => void): void {
    this.eventTarget.addEventListener(event, (e: Event) => {
      handler((e as CustomEvent).detail);
    });
  }

  /**
   * Emit adapter registered event
   * @private
   */
  private emit(event: 'adapter:registered', data: WalletAdapter): void;
  /**
   * Emit adapter unregistered event
   * @private
   */
  private emit(event: 'adapter:unregistered', data: string): void;
  /**
   * Emit wallet discovered event
   * @private
   */
  private emit(event: 'wallet:discovered', data: DiscoveredWalletInfo): void;
  /**
   * Emit wallet removed event
   * @private
   */
  private emit(event: 'wallet:removed', data: string): void;
  /**
   * Generic event emitter
   * @private
   */
  private emit(event: string, data: unknown): void {
    this.eventTarget.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  /**
   * Register discovered wallet information
   *
   * Stores information about a discovered wallet that can be used
   * to create an adapter on-demand when the user selects it.
   *
   * @param walletInfo - Information about the discovered wallet
   *
   * @example
   * ```typescript
   * registry.registerDiscoveredWallet({
   *   id: 'io.metamask',
   *   name: 'MetaMask',
   *   icon: 'data:...',
   *   adapterType: 'evm',
   *   adapterConfig: { provider: discoveredProvider }
   * });
   * ```
   */
  registerDiscoveredWallet(walletInfo: DiscoveredWalletInfo): void {
    this.discoveredWallets.set(walletInfo.id, walletInfo);

    if (walletInfo.responderId && walletInfo.responderId !== walletInfo.id) {
      this.discoveredWalletAliases.set(walletInfo.responderId, walletInfo.id);
    }

    this.emit('wallet:discovered', walletInfo);
  }

  /**
   * Get discovered wallet information
   *
   * @param walletId - The ID of the discovered wallet
   * @returns Wallet information if found
   */
  getDiscoveredWallet(walletId: string): DiscoveredWalletInfo | undefined {
    const direct = this.discoveredWallets.get(walletId);
    if (direct) {
      return direct;
    }

    const canonicalId = this.discoveredWalletAliases.get(walletId);
    if (canonicalId) {
      return this.discoveredWallets.get(canonicalId);
    }

    return undefined;
  }

  /**
   * Get all discovered wallets
   *
   * @returns Array of all discovered wallet information
   */
  getAllDiscoveredWallets(): DiscoveredWalletInfo[] {
    return Array.from(this.discoveredWallets.values());
  }

  /**
   * Check if a wallet has been discovered
   *
   * @param walletId - The ID of the wallet
   * @returns True if the wallet has been discovered
   */
  hasDiscoveredWallet(walletId: string): boolean {
    return (
      this.discoveredWallets.has(walletId) ||
      this.discoveredWalletAliases.has(walletId)
    );
  }

  /**
   * Remove discovered wallet information
   *
   * @param walletId - The ID of the wallet to remove
   */
  removeDiscoveredWallet(walletId: string): void {
    const removed = this.discoveredWallets.delete(walletId);

    for (const [alias, target] of this.discoveredWalletAliases.entries()) {
      if (target === walletId || alias === walletId) {
        this.discoveredWalletAliases.delete(alias);
      }
    }

    if (removed) {
      this.emit('wallet:removed', walletId);
    }
  }

  /**
   * Clear all discovered wallets
   */
  clearDiscoveredWallets(): void {
    this.discoveredWallets.clear();
    this.discoveredWalletAliases.clear();
  }

  /**
   * Clear all adapters
   *
   * Removes all registered adapters from the registry.
   * Use with caution as this will make all wallets unavailable.
   *
   * @example
   * ```typescript
   * registry.clear(); // All adapters removed
   * ```
   */
  clear(): void {
    this.adapters.clear();
    this.discoveredWallets.clear();
    this.discoveredWalletAliases.clear();
  }

  /**
   * Load all built-in adapters
   *
   * Convenience method to load all available built-in wallet adapters.
   * This is the most common use case for dynamic adapter loading.
   *
   * @param filter - Optional filter to only load specific adapters
   * @returns Promise that resolves when all adapters are loaded
   *
   * @example
   * ```typescript
   * // Load all built-in adapters
   * await registry.loadBuiltinAdapters();
   *
   * // Load only MetaMask-related adapters
   * await registry.loadBuiltinAdapters(/metamask/i);
   *
   * // Load adapters matching a string pattern
   * await registry.loadBuiltinAdapters('meta');
   * ```
   */
  async loadBuiltinAdapters(filter?: RegExp | string): Promise<void> {
    const options = filter ? { filter } : {};
    await this.loadAdaptersFromDirectory('builtin', options);
  }

  /**
   * Load adapters from an npm package
   *
   * Convenience method to load wallet adapters from an npm package.
   *
   * @param packageName - Name of the npm package to load adapters from
   * @param options - Loading options
   * @returns Promise that resolves when adapters are loaded
   *
   * @example
   * ```typescript
   * // Load from a third-party wallet adapter package
   * await registry.loadFromPackage('@mycompany/wallet-adapters');
   *
   * // Load with filtering
   * await registry.loadFromPackage('@walletconnect/adapters', {
   *   filter: /ethereum/i,
   *   maxAdapters: 5
   * });
   * ```
   */
  async loadFromPackage(
    packageName: string,
    options: {
      filter?: RegExp | string;
      maxAdapters?: number;
      continueOnError?: boolean;
      timeout?: number;
    } = {},
  ): Promise<void> {
    await this.loadAdaptersFromDirectory(packageName, {
      strategy: 'module',
      ...options,
    });
  }
}
