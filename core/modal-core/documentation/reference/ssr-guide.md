# SSR Framework Integration Guide

This guide explains how to integrate modal-core's comprehensive SSR (Server-Side Rendering) system with different frontend frameworks. The SSR functionality is designed to be framework-agnostic and provides the foundation for all framework-specific adapters.

## Overview

Modal-core provides SSR-safe functionality that can be leveraged by framework adapters:

- **Environment Detection**: `isServer()` and browser detection utilities
- **SSR-Safe Client Creation**: `createWalletMeshClient()` works safely in server environments
- **Safe Browser API Access**: Utilities for accessing browser APIs only when available
- **Framework Integration**: Core utilities support React, Vue, Svelte, and Angular SSR

## Core SSR Functions

### Environment Detection

```typescript
import { isServer, isBrowser } from '@walletmesh/modal-core';

// Framework adapters can use these for conditional logic
if (isServer()) {
  // Server-side logic - avoid wallet operations
  console.log('Running on server');
} else {
  // Browser-side logic - full wallet functionality available
  console.log('Running in browser');
}
```

### Universal Client Creation

```typescript
import { createWalletMeshClient, isServer } from '@walletmesh/modal-core';

// SSR-safe client creation
const client = createWalletMeshClient({
  appName: 'My dApp',
  appDescription: 'My dApp description',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png'
});

// The client automatically handles SSR scenarios
// Wallet operations are only available in browser environments
```

### State Serialization

```typescript
// State management in SSR scenarios
if (isServer()) {
  // On server: provide default/empty state
  const initialState = {
    ui: { isOpen: false, currentView: 'wallet-selection', isLoading: false },
    connections: { activeSessions: [], connectionStatus: 'disconnected' },
    transactions: { pending: [], confirmed: [], failed: [] }
  };
} else {
  // On client: use actual client state
  const state = client.getState();
}
```

## Framework Integration Patterns

### React (Reference Implementation)

```typescript
// React-specific SSR provider (use @walletmesh/modal-react instead)
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider
      appName="My dApp"
      appDescription="My dApp description"
      appUrl="https://mydapp.com"
      appIcon="https://mydapp.com/icon.png"
    >
      {children}
    </WalletMeshProvider>
  );
}

// The provider automatically handles SSR scenarios
```

### Vue 3 Integration Example

```typescript
// Vue 3 composition API
import { ref, onMounted, provide } from 'vue';
import { createWalletMeshClient, isServer } from '@walletmesh/modal-core';

export function useWalletMeshSSR(config) {
  const client = createWalletMeshClient(config);
  const isSSR = ref(isServer());
  
  onMounted(() => {
    isSSR.value = false;
    // Client is ready for wallet operations in browser
  });

  return {
    client,
    isSSR: readonly(isSSR),
  };
}

// Vue plugin
export const WalletMeshPlugin = {
  install(app, options) {
    const { client, isSSR } = useWalletMeshSSR(options.config, options.initialState);
    
    app.provide('walletMesh', client);
    app.provide('walletMeshSSR', isSSR);
  }
};
```

### Svelte Integration Example

```typescript
// Svelte store with SSR support
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { createWalletMeshClient } from '@walletmesh/modal-core';

function createWalletMeshStore(config) {
  const client = createWalletMeshClient(config);
  const isSSR = writable(!browser);
  
  return {
    client,
    isSSR: derived(isSSR, $isSSR => $isSSR),
    subscribe: client.subscribe.bind(client),
    getState: () => client.getState(),
  };
}

// Svelte context
import { setContext, getContext } from 'svelte';

const WALLET_MESH_KEY = Symbol('walletMesh');

export function setWalletMeshContext(config, initialState?) {
  const store = createWalletMeshStore(config, initialState);
  setContext(WALLET_MESH_KEY, store);
  return store;
}

export function getWalletMeshContext() {
  return getContext(WALLET_MESH_KEY);
}
```

### Angular Integration Example

```typescript
// Angular service with SSR support
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { createWalletMeshClient } from '@walletmesh/modal-core';

@Injectable({
  providedIn: 'root'
})
export class WalletMeshService {
  private client: WalletMeshClient;
  public isSSR: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isSSR = isPlatformServer(this.platformId);
  }

  initialize(config: WalletMeshClientConfig) {
    this.client = createWalletMeshClient(config);
    return this.client;
  }

  getClient() {
    return this.client;
  }

  isReady(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

// Angular module
import { NgModule } from '@angular/core';

@NgModule({
  providers: [
    WalletMeshService,
    {
      provide: 'WALLET_MESH_CONFIG',
      useValue: walletMeshConfig
    }
  ]
})
export class WalletMeshModule {}
```

## SSR Best Practices for Framework Adapters

### 1. Environment Detection

Always use modal-core's environment detection rather than framework-specific methods:

```typescript
// ✅ Good - Framework agnostic
import { isServer } from '@walletmesh/modal-core';

// ❌ Avoid - Framework specific
import { browser } from '$app/environment'; // Svelte specific
```

### 2. Client Creation

Let modal-core handle environment detection automatically:

```typescript
// ✅ Good - Works in both SSR and browser environments
const client = createWalletMeshClient(config);

// Wallet operations are automatically disabled in SSR environments
```

### 3. State Hydration

Use modal-core's serialization utilities for consistency:

```typescript
// Server side - provide minimal state
const serverState = {
  connections: { connectionStatus: 'disconnected', activeSessions: [] },
  ui: { isOpen: false, currentView: 'wallet-selection' }
};

// Client side - use actual client state
const clientState = client.getState();
```

### 4. Safe Browser API Access

Use modal-core's environment utilities for browser API access:

```typescript
import { isBrowser, getWindow, getDocument } from '@walletmesh/modal-core';

// Safe access to browser APIs
const currentUrl = isBrowser() ? getWindow()?.location.href : 'http://localhost';
```

## Framework-Specific Considerations

### React
- Uses `useEffect` for post-mount hydration
- Leverages `useMemo` for stable client instances
- Implements error boundaries for SSR errors

### Vue
- Uses `onMounted` for client-side initialization
- Leverages Vue's reactivity system for state management
- Provides composables for easy integration

### Svelte
- Uses `browser` environment variable combined with modal-core detection
- Leverages Svelte stores for state management
- Integrates with SvelteKit's SSR system

### Angular
- Uses `PLATFORM_ID` injection for environment detection
- Leverages Angular's DI system for client management
- Integrates with Angular Universal for SSR

## Testing SSR Integration

### Framework Adapter Testing

Each framework adapter should test:

```typescript
describe('SSR Integration', () => {
  it('should create client in server environment', () => {
    // Mock server environment
    vi.mock('@walletmesh/modal-core', () => ({
      createWalletMeshClient: vi.fn(() => mockClient),
      isServer: () => true,
    }));

    const client = createFrameworkClient(config);
    expect(client).toBeDefined();
    expect(isServer()).toBe(true);
  });

  it('should create client in browser environment', () => {
    // Mock browser environment
    vi.mock('@walletmesh/modal-core', () => ({
      createWalletMeshClient: vi.fn(() => mockClient),
      isServer: () => false,
    }));

    const client = createFrameworkClient(config);
    expect(client).toBeDefined();
    expect(isServer()).toBe(false);
  });

  it('should handle SSR gracefully', () => {
    const client = createFrameworkClient(config);
    const state = client.getState();
    expect(state).toBeDefined();
    expect(state.connections.connectionStatus).toBe('disconnected');
  });
});
```

## Migration Guide

### For Existing Framework Adapters

1. **Replace Custom SSR Detection**:
   ```typescript
   // Before
   const isSSR = typeof window === 'undefined';
   
   // After
   import { isServer } from '@walletmesh/modal-core';
   const isSSR = isServer();
   ```

2. **Use SSR-Safe Client Creation**:
   ```typescript
   // Before
   const client = isSSR ? createCustomSSRClient() : createBrowserClient();
   
   // After
   const client = createWalletMeshClient(config); // Works in both environments
   ```

3. **Handle SSR State Appropriately**:
   ```typescript
   // Server-side: provide default state
   const serverState = {
     connections: { connectionStatus: 'disconnected' },
     ui: { isOpen: false }
   };
   
   // Client-side: use actual state
   const clientState = client.getState();
   ```

## Advanced Patterns

### Custom SSR Controller

For specialized server environments:

```typescript
import { createWalletMeshClient, isServer } from '@walletmesh/modal-core';

// Create SSR-safe client
const client = createWalletMeshClient(config);

// Add framework-specific SSR handling
const frameworkClient = {
  ...client,
  frameworkSpecificMethod() {
    if (isServer()) {
      // Server-side logic
      return null;
    }
    // Browser-side logic
    return client.connect();
  }
};
```

### Multi-Framework SSR Utils

For packages supporting multiple frameworks:

```typescript
import { isServer, createWalletMeshClient } from '@walletmesh/modal-core';

export function createUniversalWalletMesh(config, framework) {
  const client = createWalletMeshClient(config);
  
  // Framework-agnostic client creation
  if (!isServer()) {
    switch (framework) {
      case 'react':
        return createReactWrapper(client);
      case 'vue':
        return createVueWrapper(client);
      case 'svelte':
        return createSvelteWrapper(client);
      case 'angular':
        return createAngularWrapper(client);
      default:
        return client;
    }
  }
  
  return client;
}
```

This framework-agnostic approach ensures that modal-core works safely in SSR environments while providing full wallet functionality in browser environments. Each framework can implement its own specific patterns while leveraging the core SSR-safe functionality.