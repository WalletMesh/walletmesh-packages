# WalletMesh Modal Core API Documentation

## Framework Developer Guide

> **⚠️ Important**: This documentation is for **framework developers** building UI libraries on top of modal-core. If you're building a dApp, use a UI framework package like [`@walletmesh/modal-react`](https://www.npmjs.com/package/@walletmesh/modal-react) instead.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Client Integration](#client-integration)
3. [State Management](#state-management)
4. [Transport Layer](#transport-layer)
5. [Provider System](#provider-system)
6. [Event System](#event-system)
7. [SSR Support](#ssr-support)
8. [Building Framework Adapters](#building-framework-adapters)

## Core Architecture

Modal-core provides a headless wallet connection system that framework packages can build upon. The main entry point is `createWalletMeshClient`, which returns a client for managing wallet connections.

### Key Components

```typescript
import { createWalletMeshClient, type WalletMeshClient } from '@walletmesh/modal-core';

// Create the core client
const client: WalletMeshClient = createWalletMeshClient({
  appName: 'My Framework Package',
  appDescription: 'Framework package built on WalletMesh',
  appUrl: 'https://example.com',
  appIcon: 'data:image/svg+xml;base64,...',
  supportedChains: ['ethereum', 'polygon', 'solana']
});
```

## Client Integration

### WalletMeshClient Interface

The client provides methods for framework packages to integrate wallet functionality:

```typescript
interface WalletMeshClient {
  // Connection management
  connect(walletId?: string): Promise<SessionInfo>;
  disconnect(): Promise<void>;
  
  // State access
  getState(): SimplifiedWalletMeshState;
  subscribe(callback: (state: SimplifiedWalletMeshState) => void): () => void;
  
  // Session management
  getActiveSession(): Promise<SessionInfo>;
  getAvailableWallets(): Promise<WalletInfo[]>;
  
  // Lifecycle
  destroy(): void;
}
```

### Connection Flow for Framework Integration

```typescript
// 1. Framework package initializes client
const client = createWalletMeshClient(config);

// 2. Framework subscribes to state changes
const unsubscribe = client.subscribe((state) => {
  // Update framework-specific UI state
  updateFrameworkState(state);
});

// 3. Framework triggers connection
async function connectWallet(walletId: string) {
  try {
    const session = await client.connect(walletId);
    return {
      address: session.address,
      chainId: session.chain.id,
      provider: session.provider
    };
  } catch (error) {
    handleConnectionError(error);
  }
}

// 4. Framework handles disconnection
async function disconnect() {
  await client.disconnect();
}

// 5. Cleanup on framework unmount
function cleanup() {
  unsubscribe();
  client.destroy();
}
```

## State Management

Modal-core uses Zustand for internal state management. Framework packages should subscribe to state changes and translate them to their own state systems.

### Core State Structure

```typescript
interface SimplifiedWalletMeshState {
  // UI State (includes discovery functionality)
  ui: {
    isOpen: boolean;
    currentView: 'wallet-selection' | 'connecting' | 'connected' | 'error';
    isLoading: boolean;
    error?: ModalError;
    isScanning: boolean;
    lastScanTime: number | null;
    discoveryErrors: string[];
  };
  
  // Connection State (consolidates sessions and wallets)
  connections: {
    activeSessions: SessionInfo[];
    availableWallets: WalletInfo[];
    discoveredWallets: WalletInfo[];
    activeSessionId: string | null;
    connectionStatus: ConnectionStatus;
    selectedWallet?: WalletInfo;
  };
  
  // Transaction State
  transactions: {
    pending: TransactionInfo[];
    confirmed: TransactionInfo[];
    failed: TransactionInfo[];
    activeTransaction?: TransactionInfo;
  };
}
```

### State Subscription Patterns

```typescript
// Subscribe to specific state slices
client.subscribe((state) => {
  // React example
  if (state.connections.connectionStatus === 'connected') {
    setConnected(true);
    const activeSession = state.connections.activeSessions[0];
    if (activeSession) {
      setAddress(activeSession.address);
      setProvider(activeSession.provider);
    }
  }
});

// Vue example
client.subscribe((state) => {
  const isConnected = state.connections.connectionStatus === 'connected';
  const activeSession = state.connections.activeSessions[0];
  connectionStore.update({
    isConnected,
    address: activeSession?.address,
    chainId: activeSession?.chain.id
  });
});

// Svelte example
client.subscribe((state) => {
  const isConnected = state.connections.connectionStatus === 'connected';
  const activeSession = state.connections.activeSessions[0];
  $connectionStore = {
    isConnected,
    address: activeSession?.address,
    chainId: activeSession?.chain.id
  };
});
```

## Transport Layer

Modal-core includes transport systems for cross-origin wallet communication. Framework packages can leverage these for wallet discovery and connection.

### Transport Types

```typescript
// Available transport implementations
import {
  PopupWindowTransport,
  IFrameTransport,
  PostMessageTransport
} from '@walletmesh/modal-core/transports';

// Framework packages can use transports for custom wallet integrations
const transport = new PopupWindowTransport({
  targetOrigin: 'https://wallet.example.com',
  timeout: 30000
});
```

## Provider System

Modal-core abstracts blockchain providers through a unified interface. Framework packages get typed provider access.

### Provider Access Patterns

```typescript
// Get provider from active session
async function getTypedProvider<T>(client: WalletMeshClient): Promise<T | null> {
  try {
    const session = await client.getActiveSession();
    return session.provider as T;
  } catch {
    return null;
  }
}

// EVM provider example
const evmProvider = await getTypedProvider<EIP1193Provider>(client);
if (evmProvider) {
  const balance = await evmProvider.request({
    method: 'eth_getBalance',
    params: [address, 'latest']
  });
}

// Solana provider example
const solanaProvider = await getTypedProvider<SolanaProvider>(client);
if (solanaProvider) {
  const signature = await solanaProvider.signTransaction(transaction);
}
```

## Event System

Framework packages can listen to wallet connection events for reactive UI updates.

### Event Types

```typescript
interface WalletMeshEvents {
  'connection:initiated': { walletId: string };
  'connection:established': ConnectionResult;
  'connection:failed': { error: ModalError; walletId: string };
  'connection:lost': { walletId: string };
  'wallet:available': { wallet: WalletInfo };
  'wallet:unavailable': { walletId: string };
  'state:updated': WalletMeshState;
}
```

### Event Handling for Frameworks

```typescript
// React hook example
function useWalletEvents(client: WalletMeshClient) {
  useEffect(() => {
    const handlers = {
      'connection:established': (data) => {
        toast.success(`Connected to ${data.walletInfo.name}`);
      },
      'connection:failed': (data) => {
        toast.error(`Failed to connect: ${data.error.message}`);
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      client.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        client.off(event, handler);
      });
    };
  }, [client]);
}
```

## SSR Support

Modal-core provides SSR-safe utilities for framework packages that need server-side rendering support.

### SSR Utilities

```typescript
import { 
  createSSRController, 
  isServer,
  type ModalControllerOrSSR 
} from '@walletmesh/modal-core/ssr';

// Create SSR-safe client
function createSSRSafeClient(config: WalletMeshConfig): ModalControllerOrSSR {
  if (isServer()) {
    return createSSRController();
  }
  return createWalletMesh(config);
}

// Framework integration with SSR
function useWalletMesh(config: WalletMeshConfig) {
  const [client] = useState(() => createSSRSafeClient(config));
  
  // Safe to call in SSR
  const state = client.getState();
  
  // Only call client methods on client-side
  const connect = useCallback(async (walletId: string) => {
    if (!client.isSSR) {
      return await client.connect(walletId);
    }
    throw new Error('Cannot connect during SSR');
  }, [client]);
  
  return { state, connect, isSSR: client.isSSR };
}
```

## Building Framework Adapters

Framework packages should provide their own UI components and state management while using modal-core for wallet functionality.

### React Framework Integration

```typescript
// React provider component
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createWalletMeshClient } from '@walletmesh/modal-core';

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ config, children }: WalletProviderProps) {
  const [client] = useState(() => createWalletMeshClient(config));
  const [state, setState] = useState(client.getState());

  useEffect(() => {
    return client.subscribe(setState);
  }, [client]);

  const connect = useCallback(async (walletId?: string) => {
    return await client.connect(walletId);
  }, [client]);

  const disconnect = useCallback(async () => {
    await client.disconnect();
  }, [client]);

  const value = {
    ...state,
    connect,
    disconnect,
    client
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
```

### Vue Framework Integration

```typescript
// Vue composition API
import { ref, reactive, onUnmounted } from 'vue';
import { createWalletMeshClient } from '@walletmesh/modal-core';

export function useWalletMesh(config: WalletMeshClientConfig) {
  const client = createWalletMeshClient(config);
  const state = reactive(client.getState());

  const unsubscribe = client.subscribe((newState) => {
    Object.assign(state, newState);
  });

  const connect = async (walletId?: string) => {
    return await client.connect(walletId);
  };

  const disconnect = async () => {
    await client.disconnect();
  };

  onUnmounted(() => {
    unsubscribe();
    client.destroy();
  });

  return {
    state,
    connect,
    disconnect,
    client
  };
}
```

### Svelte Framework Integration

```typescript
// Svelte store integration
import { writable } from 'svelte/store';
import { createWalletMeshClient } from '@walletmesh/modal-core';

export function createWalletStore(config: WalletMeshClientConfig) {
  const client = createWalletMeshClient(config);
  const { subscribe, set } = writable(client.getState());

  const unsubscribe = client.subscribe(set);

  return {
    subscribe,
    connect: (walletId?: string) => client.connect(walletId),
    disconnect: () => client.disconnect(),
    destroy: () => {
      unsubscribe();
      client.destroy();
    }
  };
}
```

## TypeScript Integration

Modal-core provides comprehensive TypeScript support for framework packages.

### Key Types for Framework Development

```typescript
// Import types for framework development
import type {
  WalletMeshClient,
  WalletMeshClientConfig,
  SimplifiedWalletMeshState,
  SessionInfo,
  WalletInfo,
  ChainType,
  ModalError,
  ConnectionStatus,
  TransactionInfo
} from '@walletmesh/modal-core';

// Provider types
import type {
  EIP1193Provider,
  SolanaProvider,
  AztecProvider
} from '@walletmesh/modal-core/providers';

// Transport types
import type {
  Transport,
  TransportConfig,
  TransportMessage
} from '@walletmesh/modal-core/transports';
```

## Best Practices for Framework Packages

### 1. State Management
- Subscribe to modal-core state changes
- Translate to framework-specific state patterns
- Provide reactive updates to UI components

### 2. Error Handling
- Catch and handle modal-core errors
- Provide user-friendly error messages
- Implement retry mechanisms where appropriate

### 3. Lifecycle Management
- Properly initialize and cleanup modal-core client
- Handle SSR scenarios appropriately
- Manage subscriptions and event listeners

### 4. Type Safety
- Use TypeScript for full type safety
- Export typed hooks and components
- Provide proper generic types for providers

### 5. Performance
- Minimize re-renders with selective subscriptions
- Implement proper memoization
- Clean up resources on unmount

This documentation provides the foundation for building framework packages on top of modal-core. For more specific integration patterns, refer to the source code of existing framework packages like `@walletmesh/modal-react`.