# WalletMesh Wallet Adapter Developer Guide

This guide will walk you through creating a wallet adapter for WalletMesh. We'll cover both the simple approach using the base class and the advanced approach implementing the interface directly.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Basic Wallet Adapter (Using Base Class)](#basic-wallet-adapter-using-base-class)
4. [Advanced Wallet Adapter (Using Interface)](#advanced-wallet-adapter-using-interface)
5. [Testing Your Wallet Adapter](#testing-your-wallet-adapter)
6. [Publishing Your Wallet Adapter](#publishing-your-wallet-adapter)
7. [Integration Guide for dApp Developers](#integration-guide-for-dapp-developers)

## Overview

WalletMesh uses a wallet adapter architecture where each wallet is a self-contained adapter. To add support for your wallet, you need to:

1. Create a `WalletAdapter` class that describes your wallet
2. Create a `WalletConnector` that handles the connection logic
3. Package and publish your wallet adapter

You have two options for creating the connector:
- **Extend the base class** (recommended) - Get state management, event handling, and helpers for free
- **Implement the interface** - Full control over implementation

## Prerequisites

```bash
# Install dependencies
npm install @walletmesh/modal-core
```

## API Design and Client Architecture

### Client Instantiation Pattern

WalletMesh uses a factory function pattern for creating client instances:

```typescript
import { createWalletMesh } from '@walletmesh/modal-core';

// Each call creates a new, independent client instance
const walletMesh = createWalletMesh({
  projectId: 'your-project-id'
});
```

**Key Design Decisions:**
- **Non-Singleton Clients**: Each `createWalletMesh()` call creates a new client instance
- **Client-First API**: The returned object is a client with the modal as a sub-component
- **Progressive Disclosure**: Simple by default, powerful when needed

### Modal Singleton Behavior

While clients are not singletons, the modal UI implements singleton-like behavior:

```typescript
// Only one modal can be open at a time across all clients
const client1 = createWalletMesh({ projectId: 'app-1' });
const client2 = createWalletMesh({ projectId: 'app-2' });

await client1.modal.open(); // Opens modal
await client2.modal.open(); // Closes client1's modal, opens client2's modal
```

This prevents UI conflicts and ensures a good user experience.

### Theme Management

The theme system also uses singleton-like behavior to ensure consistent styling:

```typescript
// Themes are managed globally to prevent style conflicts
const client1 = createWalletMesh({ 
  projectId: 'app-1',
  theme: 'dark' 
});

// Later theme specifications override earlier ones
const client2 = createWalletMesh({ 
  projectId: 'app-2',
  theme: 'light' // This becomes the active theme
});

// Modal styling is consistent regardless of which client opens it
```

**Important for Wallet Adapter Developers:**
- Your wallet will be displayed with the currently active theme
- Provide both light and dark versions of your wallet icon
- Use CSS variables for any custom styling to respect theme changes
- Don't inject global styles that might conflict with the theme system

## Basic Wallet Adapter (Using Base Class)

This approach is recommended for most wallets. You get state management, event handling, and error normalization for free.

### Step 1: Create the Wallet Adapter Class

```typescript
// src/walletAdapter.ts
import { 
  WalletAdapter,
  WalletMetadata,
  WalletCapabilities,
  WalletFeature,
  WalletAdapterContext,
  ConnectorConfig,
  WalletConnectorInterface,
  DetectionResult,
  ChainDefinition
} from '@walletmesh/modal-core';

export class SimpleWalletAdapter implements WalletAdapter {
  // Unique identifier for your wallet
  id = 'simple-wallet';
  
  // Display information
  metadata: WalletMetadata = {
    name: 'Simple Wallet',
    icon: 'data:image/svg+xml;base64,...', // Base64 encoded SVG logo
    description: 'A simple EVM wallet',
    homepage: 'https://simplewallet.io'
  };
  
  // Declare what your wallet supports
  capabilities: WalletCapabilities = {
    chains: [
      { type: 'evm', chainIds: ['1', '137', '10'] } // Ethereum, Polygon, Optimism
    ],
    features: new Set<WalletFeature>([
      'sign_message',      // Can sign messages
      'sign_typed_data',   // Can sign typed data (EIP-712)
      'multi_account'      // Supports multiple accounts
    ])
  };
  
  // Optional: Initialize resources when wallet adapter is loaded
  async install(context: WalletAdapterContext): Promise<void> {
    context.logger.debug('Simple Wallet adapter installed');
  }
  
  // Optional: Cleanup when wallet adapter is unloaded
  async uninstall(): Promise<void> {
    // Cleanup if needed
  }
  
  // Factory method to create connector instances
  createConnector(config: ConnectorConfig): WalletConnectorInterface {
    return new SimpleWalletConnector(config, this);
  }
  
  // Detect if your wallet is available
  async detect(): Promise<DetectionResult> {
    // Check if your wallet's extension is installed
    const isInstalled = typeof (window as any).simpleWallet !== 'undefined';
    
    return {
      available: isInstalled,
      version: isInstalled ? (window as any).simpleWallet.version : undefined
    };
  }
}
```

### Step 2: Create the Connector (Base Class Approach)

```typescript
// src/connector.ts
import {
  WalletConnector,
  Connection,
  ConnectOptions,
  EvmProvider,
  ChainType,
  ProviderForChain,
  WalletError,
  WalletNotFoundError,
  UserRejectedError
} from '@walletmesh/modal-core';

export class SimpleWalletConnector extends WalletConnector {
  private provider: EvmProvider | null = null;
  
  // Implement the connect method
  async connect(options?: ConnectOptions): Promise<Connection> {
    // Use inherited helper to update state
    this.updateState({ status: 'connecting' });
    
    try {
      // Get your wallet's injected object
      const simpleWallet = (window as any).simpleWallet;
      
      if (!simpleWallet) {
        throw new WalletNotFoundError('Simple Wallet extension not found');
      }
      
      // Create a provider wrapper
      this.provider = new SimpleWalletProvider(simpleWallet);
      
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length === 0) {
        throw new UserRejectedError('User rejected connection request');
      }
      
      // Get chain ID
      const chainId = await this.provider.getChainId();
      
      // Create connection object
      const connection: Connection = {
        address: accounts[0],
        accounts,
        chainId,
        chainType: 'evm',
        provider: this.provider,
        walletId: this.adapter.id,
        walletInfo: {
          ...this.adapter.metadata,
          id: this.adapter.id
        }
      };
      
      // Update state to connected
      this.updateState({ 
        status: 'connected', 
        connection 
      });
      
      // Setup event listeners
      this.setupEventListeners();
      
      return connection;
    } catch (error) {
      // Use inherited error normalization
      const walletError = this.normalizeError(error);
      this.updateState({ 
        status: 'error', 
        error: walletError 
      });
      throw walletError;
    }
  }
  
  // Implement the disconnect method
  async disconnect(): Promise<void> {
    if (this.provider) {
      // Remove event listeners
      this.removeEventListeners();
      
      // Disconnect provider
      await this.provider.disconnect();
      this.provider = null;
    }
    
    // Update state
    this.updateState({ 
      status: 'disconnected', 
      connection: null 
    });
  }
  
  // Optional: Override if you need custom provider logic
  getProvider<T extends ChainType>(chainType: T): ProviderForChain<T> {
    if (chainType !== 'evm') {
      throw new Error(`Simple Wallet does not support ${chainType}`);
    }
    
    if (!this.provider) {
      throw new Error('Not connected');
    }
    
    return this.provider as ProviderForChain<T>;
  }
  
  // Setup wallet event listeners
  private setupEventListeners(): void {
    if (!this.provider) return;
    
    // Listen for account changes
    this.provider.on('accountsChanged', (accounts: string[]) => {
      // Use inherited emit method
      this.emit('accounts:changed', { 
        accounts, 
        chainType: 'evm' 
      });
      
      // Update connection if needed
      if (accounts.length === 0) {
        this.disconnect();
      } else if (this.connection) {
        this.updateState({
          connection: {
            ...this.connection,
            address: accounts[0],
            accounts
          }
        });
      }
    });
    
    // Listen for chain changes
    this.provider.on('chainChanged', (chainId: string) => {
      this.emit('chain:changed', { 
        chainId, 
        chainType: 'evm' 
      });
      
      // Update connection
      if (this.connection) {
        this.updateState({
          connection: {
            ...this.connection,
            chainId
          }
        });
      }
    });
    
    // Listen for disconnect
    this.provider.on('disconnect', () => {
      this.emit('connection:lost', { 
        reason: 'Wallet disconnected' 
      });
      this.disconnect();
    });
  }
  
  private removeEventListeners(): void {
    if (!this.provider) return;
    
    // Remove all listeners
    this.provider.removeAllListeners();
  }
}
```

### Step 3: Create the Provider Wrapper

```typescript
// src/provider.ts
import { EvmProvider, ProviderRpcError } from '@walletmesh/modal-core';

export class SimpleWalletProvider implements EvmProvider {
  readonly chainType = 'evm' as const;
  
  constructor(private wallet: any) {}
  
  get chainId(): string {
    return this.wallet.chainId;
  }
  
  // Implement EIP-1193 request method
  async request(args: { method: string; params?: unknown[] }): Promise<unknown> {
    return this.wallet.request(args);
  }
  
  // Implement convenience methods
  async getAccounts(): Promise<string[]> {
    return this.request({ method: 'eth_accounts' });
  }
  
  async getChainId(): Promise<string> {
    const chainId = await this.request({ method: 'eth_chainId' });
    return chainId as string;
  }
  
  async getBalance(address: string, blockTag?: string): Promise<string> {
    return this.request({
      method: 'eth_getBalance',
      params: [address, blockTag || 'latest']
    }) as Promise<string>;
  }
  
  async sendTransaction(tx: any): Promise<string> {
    return this.request({
      method: 'eth_sendTransaction',
      params: [tx]
    }) as Promise<string>;
  }
  
  async signMessage(message: string): Promise<string> {
    const accounts = await this.getAccounts();
    return this.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    }) as Promise<string>;
  }
  
  async signTypedData(typedData: any): Promise<string> {
    const accounts = await this.getAccounts();
    return this.request({
      method: 'eth_signTypedData_v4',
      params: [accounts[0], JSON.stringify(typedData)]
    }) as Promise<string>;
  }
  
  // Connection management
  isConnected(): boolean {
    return this.wallet.isConnected?.() ?? true;
  }
  
  async disconnect(): Promise<void> {
    if (this.wallet.disconnect) {
      await this.wallet.disconnect();
    }
  }
  
  // Event handling
  on(event: string, handler: Function): void {
    this.wallet.on(event, handler);
  }
  
  removeAllListeners(): void {
    if (this.wallet.removeAllListeners) {
      this.wallet.removeAllListeners();
    }
  }
}
```

## Advanced Wallet Adapter (Using Interface)

This approach gives you full control over state management and event handling. Use this when you need custom implementations or are integrating with existing systems.

### Step 1: Create the Wallet Adapter Class

The wallet adapter class remains similar:

```typescript
// src/advanced-walletAdapter.ts
export class AdvancedWalletAdapter implements WalletAdapter {
  id = 'advanced-wallet';
  
  metadata: WalletMetadata = {
    name: 'Advanced Wallet',
    icon: 'data:image/svg+xml;base64,...',
    description: 'Advanced wallet with custom state management',
    homepage: 'https://advancedwallet.io'
  };
  
  capabilities: WalletCapabilities = {
    chains: [
      { type: 'evm', chainIds: '*' },        // All EVM chains
      { type: 'solana', chainIds: ['mainnet-beta'] }  // Also supports Solana
    ],
    features: new Set<WalletFeature>([
      'sign_message',
      'sign_typed_data',
      'multi_account',
      'hardware_wallet'
    ])
  };
  
  createConnector(config: ConnectorConfig): WalletConnectorInterface {
    return new AdvancedWalletConnector(config, this);
  }
  
  async detect(): Promise<DetectionResult> {
    // Check multiple connection methods
    const hasExtension = !!(window as any).advancedWallet;
    const hasMobileApp = /iPhone|Android/.test(navigator.userAgent);
    
    return {
      available: hasExtension || hasMobileApp,
      version: hasExtension ? (window as any).advancedWallet.version : undefined,
      customData: {
        connectionMethods: {
          extension: hasExtension,
          mobile: hasMobileApp,
          walletConnect: true  // Always available
        }
      }
    };
  }
}
```

### Step 2: Implement the Interface Directly

```typescript
// src/advanced-connector.ts
import { 
  WalletConnectorInterface,
  ConnectionState,
  Connection,
  ConnectOptions,
  ChainType,
  ProviderForChain,
  MultiChainProvider,
  ConnectorEvent,
  EventHandler,
  Unsubscribe,
  BaseProvider
} from '@walletmesh/modal-core';
import { observable, makeAutoObservable, runInAction } from 'mobx';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class AdvancedWalletConnector implements WalletConnectorInterface {
  // Custom state management using MobX
  @observable private _state = {
    status: 'disconnected' as const,
    connection: null as Connection | null,
    error: null as any
  };
  
  // Custom event system using RxJS
  private events$ = new Subject<{ type: string; data: any }>();
  
  // Store providers for multi-chain support
  private providers = new Map<ChainType, BaseProvider>();
  
  constructor(
    private config: ConnectorConfig,
    private adapter: WalletAdapter
  ) {
    makeAutoObservable(this);
  }
  
  // Implement state getter
  get state(): ConnectionState {
    return {
      status: this._state.status,
      connection: this._state.connection,
      error: this._state.error,
      // Computed properties
      get isConnected() { 
        return this.status === 'connected'; 
      },
      get isConnecting() { 
        return this.status === 'connecting'; 
      },
      get address() { 
        return this.connection?.address ?? null; 
      },
      get chainId() { 
        return this.connection?.chainId ?? null; 
      },
      get chainType() { 
        return this.connection?.chainType ?? null; 
      }
    };
  }
  
  get connection(): Connection | null {
    return this._state.connection;
  }
  
  // Implement connect with custom logic
  async connect(options?: ConnectOptions): Promise<Connection> {
    runInAction(() => {
      this._state.status = 'connecting';
      this._state.error = null;
    });
    
    try {
      // Determine best connection method
      const method = await this.determineConnectionMethod();
      
      let connection: Connection;
      
      switch (method) {
        case 'extension':
          connection = await this.connectViaExtension(options);
          break;
        
        case 'mobile':
          connection = await this.connectViaMobile(options);
          break;
          
        case 'walletconnect':
          connection = await this.connectViaWalletConnect(options);
          break;
          
        default:
          throw new Error('No connection method available');
      }
      
      runInAction(() => {
        this._state.status = 'connected';
        this._state.connection = connection;
      });
      
      // Emit connection event
      this.events$.next({
        type: 'connection:established',
        data: { connection }
      });
      
      return connection;
    } catch (error) {
      runInAction(() => {
        this._state.status = 'error';
        this._state.error = error;
      });
      
      this.events$.next({
        type: 'error',
        data: { error, operation: 'connect' }
      });
      
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    // Disconnect all providers
    for (const provider of this.providers.values()) {
      await provider.disconnect();
    }
    
    this.providers.clear();
    
    runInAction(() => {
      this._state.status = 'disconnected';
      this._state.connection = null;
      this._state.error = null;
    });
    
    this.events$.next({
      type: 'connection:lost',
      data: { reason: 'User disconnected' }
    });
  }
  
  // Provider access
  getProvider<T extends ChainType>(chainType: T): ProviderForChain<T> {
    const provider = this.providers.get(chainType);
    
    if (!provider) {
      throw new Error(`No provider for ${chainType}`);
    }
    
    return provider as ProviderForChain<T>;
  }
  
  hasProvider(chainType: ChainType): boolean {
    return this.providers.has(chainType);
  }
  
  getMultiChainProvider(): MultiChainProvider {
    return new CustomMultiChainProvider(this.providers);
  }
  
  // Custom event implementation using RxJS
  on<E extends ConnectorEvent>(
    event: E,
    handler: EventHandler<E>
  ): Unsubscribe {
    const subscription = this.events$
      .pipe(
        filter(e => e.type === event),
        map(e => e.data)
      )
      .subscribe(handler);
    
    return () => subscription.unsubscribe();
  }
  
  once<E extends ConnectorEvent>(
    event: E,
    handler: EventHandler<E>
  ): Unsubscribe {
    const subscription = this.events$
      .pipe(
        filter(e => e.type === event),
        map(e => e.data),
        take(1)
      )
      .subscribe(handler);
    
    return () => subscription.unsubscribe();
  }
  
  off<E extends ConnectorEvent>(
    event: E,
    handler: EventHandler<E>
  ): void {
    // With RxJS, unsubscribe is handled via the returned function
  }
  
  // Private connection methods
  private async determineConnectionMethod(): Promise<string> {
    if ((window as any).advancedWallet) {
      return 'extension';
    }
    
    if (this.isMobile()) {
      return 'mobile';
    }
    
    return 'walletconnect';
  }
  
  private async connectViaExtension(options?: ConnectOptions): Promise<Connection> {
    const wallet = (window as any).advancedWallet;
    
    // Connect to EVM
    const evmAccounts = await wallet.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    const evmProvider = new CustomEvmProvider(wallet.ethereum);
    this.providers.set('evm', evmProvider);
    
    // Connect to Solana if available
    if (wallet.solana) {
      const { publicKey } = await wallet.solana.connect();
      const solanaProvider = new CustomSolanaProvider(wallet.solana);
      this.providers.set('solana', solanaProvider);
    }
    
    // Setup event forwarding
    this.setupProviderEvents();
    
    return {
      address: evmAccounts[0],
      accounts: evmAccounts,
      chainType: 'evm',
      chainId: await evmProvider.getChainId(),
      provider: evmProvider,
      walletId: this.adapter.id,
      walletInfo: {
        ...this.adapter.metadata,
        id: this.adapter.id
      }
    };
  }
  
  private async connectViaMobile(options?: ConnectOptions): Promise<Connection> {
    // Custom mobile deep linking implementation
    const sessionId = crypto.randomUUID();
    
    // Store pending connection
    const pendingConnection = this.createPendingConnection(sessionId);
    
    // Open wallet app
    window.location.href = `advancedwallet://connect?` +
      `sessionId=${sessionId}&` +
      `callback=${encodeURIComponent(window.location.href)}`;
    
    // Wait for response
    return pendingConnection;
  }
  
  private async connectViaWalletConnect(options?: ConnectOptions): Promise<Connection> {
    // Custom WalletConnect implementation
    const wc = new WalletConnectClient({
      projectId: this.config.walletConnectProjectId
    });
    
    const uri = await wc.connect();
    
    // Show QR code or handle deep link
    if (this.isMobile()) {
      window.location.href = `advancedwallet://wc?uri=${encodeURIComponent(uri)}`;
    } else {
      await this.showQRCode(uri);
    }
    
    const session = await wc.approval();
    
    // Create provider and connection
    // ... implementation
  }
  
  private setupProviderEvents(): void {
    // Forward provider events to our event system
    for (const [chainType, provider] of this.providers) {
      if (chainType === 'evm') {
        const evmProvider = provider as EvmProvider;
        
        evmProvider.on('accountsChanged', (accounts: string[]) => {
          this.events$.next({
            type: 'accounts:changed',
            data: { accounts, chainType: 'evm' }
          });
        });
        
        evmProvider.on('chainChanged', (chainId: string) => {
          this.events$.next({
            type: 'chain:changed',
            data: { chainId, chainType: 'evm' }
          });
        });
      }
    }
  }
  
  private isMobile(): boolean {
    return /iPhone|iPad|Android/i.test(navigator.userAgent);
  }
}
```

## Testing Your Wallet Adapter

Create comprehensive tests for your wallet adapter:

```typescript
// src/__tests__/walletAdapter.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimpleWalletAdapter } from '../walletAdapter';
import { SimpleWalletConnector } from '../connector';

describe('SimpleWalletAdapter', () => {
  let adapter: SimpleWalletAdapter;
  
  beforeEach(() => {
    adapter = new SimpleWalletAdapter();
    
    // Mock wallet object
    (window as any).simpleWallet = {
      version: '1.0.0',
      request: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn()
    };
  });
  
  describe('detect', () => {
    it('should detect when wallet is installed', async () => {
      const result = await adapter.detect();
      
      expect(result.available).toBe(true);
      expect(result.version).toBe('1.0.0');
    });
    
    it('should not detect when wallet is not installed', async () => {
      delete (window as any).simpleWallet;
      
      const result = await adapter.detect();
      
      expect(result.available).toBe(false);
    });
  });
  
  describe('connector', () => {
    it('should connect successfully', async () => {
      const mockWallet = (window as any).simpleWallet;
      mockWallet.request.mockImplementation(({ method }) => {
        if (method === 'eth_requestAccounts') {
          return Promise.resolve(['0x123...']);
        }
        if (method === 'eth_chainId') {
          return Promise.resolve('0x1');
        }
      });
      
      const connector = adapter.createConnector({});
      const connection = await connector.connect();
      
      expect(connection.address).toBe('0x123...');
      expect(connection.chainType).toBe('evm');
      expect(connector.state.isConnected).toBe(true);
    });
    
    it('should handle user rejection', async () => {
      const mockWallet = (window as any).simpleWallet;
      mockWallet.request.mockRejectedValue(
        new Error('User rejected request')
      );
      
      const connector = adapter.createConnector({});
      
      await expect(connector.connect()).rejects.toThrow('User rejected');
      expect(connector.state.status).toBe('error');
    });
  });
});
```

## Publishing Your Wallet Adapter

### Package Structure

```
my-wallet-adapter/
├── src/
│   ├── index.ts         # Main exports
│   ├── walletAdapter.ts # WalletAdapter implementation
│   ├── connector.ts     # WalletConnector implementation
│   └── provider.ts      # Provider wrapper
├── tests/
│   └── walletAdapter.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Package.json

```json
{
  "name": "@mywallet/walletmesh-adapter",
  "version": "1.0.0",
  "description": "WalletMesh wallet adapter for MyWallet",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "@walletmesh/modal-core": "^1.0.0"
  },
  "devDependencies": {
    "@walletmesh/modal-core": "^1.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "keywords": [
    "walletmesh",
    "wallet",
    "web3",
    "ethereum"
  ],
  "license": "MIT"
}
```

### Publishing

```bash
# Build your wallet adapter
npm run build

# Test your wallet adapter
npm test

# Publish to npm
npm publish --access public
```

## Integration Guide for dApp Developers

Once your wallet adapter is published, dApp developers can use it:

### Installation

```bash
npm install @mywallet/walletmesh-adapter
```

### Basic Usage

```typescript
import { createWalletMesh } from '@walletmesh/modal-core';
import { SimpleWalletAdapter } from '@mywallet/walletmesh-adapter';

// Create client using the factory function
const walletMesh = createWalletMesh({
  projectId: 'your-project-id'
});

// Register your wallet adapter
const simpleWallet = new SimpleWalletAdapter();
walletMesh.registry.register(simpleWallet);

// Your wallet now appears in the modal!
```

### React Integration

```typescript
import { WalletMeshProvider } from '@walletmesh/modal-react';
import { SimpleWalletAdapter } from '@mywallet/walletmesh-adapter';

function App() {
  return (
    <WalletMeshProvider
      config={{
        projectId: 'your-project-id',
        walletAdapters: [new SimpleWalletAdapter()]
      }}
    >
      {/* Your app */}
    </WalletMeshProvider>
  );
}
```

### Advanced Configuration

```typescript
// Customize wallet order
const walletMesh = createWalletMesh({
  projectId: 'your-project-id',
  wallets: {
    // Your wallet appears first
    order: ['simple-wallet', 'metamask', 'phantom'],
    
    // Or filter wallets
    filter: (adapter) => {
      // Only show EVM wallets
      return adapter.capabilities.chains.some(c => c.type === 'evm');
    }
  }
});

// Register multiple custom wallets
walletMesh.registry.register(new SimpleWalletAdapter());
walletMesh.registry.register(new AnotherWalletAdapter());

// Access modal for advanced UI control (rare use case)
const modal = walletMesh.modal;
await modal.open({ theme: 'dark' });
```

## Best Practices

1. **Error Handling**: Always provide clear error messages
2. **Event Management**: Clean up event listeners on disconnect
3. **State Updates**: Keep connection state synchronized with wallet state
4. **Multi-Chain**: Consider supporting multiple chains if your wallet does
5. **Testing**: Write comprehensive tests for all scenarios
6. **Documentation**: Provide clear documentation for dApp developers
7. **Icons**: Use high-quality SVG icons that work in light/dark modes
8. **Client Usage**: Remember that dApp developers will primarily interact with the client, not the modal directly
9. **Resource Cleanup**: Advise developers to call `walletMesh.destroy()` when done to prevent memory leaks

## Support

For questions or issues:
- Check the [WalletMesh documentation](https://docs.walletmesh.com)
- Open an issue on [GitHub](https://github.com/walletmesh/walletmesh)
- Join our [Discord community](https://discord.gg/walletmesh)