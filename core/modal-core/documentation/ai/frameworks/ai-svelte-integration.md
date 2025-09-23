# WalletMesh Svelte Integration Guide for AI Agents

This guide provides AI-specific instructions for integrating WalletMesh with Svelte applications.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [Stores](#stores)
3. [Component Patterns](#component-patterns)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)

## Basic Integration

### Installation Setup

```typescript
// 1. Install dependencies
// npm install @walletmesh/modal-core @walletmesh/modal-svelte

// 2. Import components
import { 
  WalletProvider,
  createWalletStore,
  walletState
} from '@walletmesh/modal-svelte';
```

### Store Setup

```typescript
// src/lib/wallet.ts
import { createWalletStore } from '@walletmesh/modal-svelte';

const config = {
  chains: [1, 137], // Ethereum, Polygon
  theme: 'light',
  defaultProvider: 'eip1193'
};

export const wallet = createWalletStore(config);
```

## Stores

### Wallet Store Usage

```svelte
<script lang="ts">
  import { wallet } from '$lib/wallet';

  // Destructure actions
  const { connect, disconnect, switchChain } = wallet;

  async function handleConnect() {
    try {
      await connect();
    } catch (error) {
      // Handle error
    }
  }
</script>

<button on:click={handleConnect}>
  Connect Wallet
</button>
```

### Wallet State Store

```svelte
<script lang="ts">
  import { walletState } from '@walletmesh/modal-svelte';
  import { derived } from 'svelte/store';

  // Derive computed states
  const isConnected = derived(walletState, 
    $state => $state.status === 'connected'
  );
  
  const hasError = derived(walletState,
    $state => Boolean($state.error)
  );
</script>

<div>
  <div>Status: {$walletState.status}</div>
  {#if $isConnected}
    <div>Account: {$walletState.account}</div>
  {/if}
  {#if $hasError}
    <div>Error: {$walletState.error.message}</div>
  {/if}
</div>
```

## Component Patterns

### Connection Button

```svelte
<script lang="ts">
  import { wallet, walletState } from '@walletmesh/modal-svelte';
  import { derived } from 'svelte/store';

  const { connect, disconnect } = wallet;

  // Derived state
  const buttonText = derived(walletState, $state => {
    switch ($state.status) {
      case 'connected':
        return 'Disconnect';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Connect Wallet';
      default:
        return 'Connect';
    }
  });

  const isDisabled = derived(walletState,
    $state => $state.status === 'connecting'
  );

  async function handleClick() {
    if ($walletState.status === 'connected') {
      await disconnect();
    } else {
      await connect();
    }
  }
</script>

<button
  on:click={handleClick}
  disabled={$isDisabled}
>
  {$buttonText}
</button>
```

### Chain Selector

```svelte
<script lang="ts">
  import { wallet, walletState } from '@walletmesh/modal-svelte';

  const chains = [
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' }
  ];

  async function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newChainId = Number(select.value);
    await wallet.switchChain(newChainId);
  }
</script>

<select
  value={$walletState.chainId}
  on:change={handleChange}
>
  {#each chains as chain}
    <option value={chain.id}>
      {chain.name}
    </option>
  {/each}
</select>
```

## Error Handling

### Error Handler Store

```typescript
// src/lib/errorHandler.ts
import { derived } from 'svelte/store';
import { walletState, wallet } from '@walletmesh/modal-svelte';

export const errorHandler = derived(walletState, ($state, set) => {
  if ($state.error) {
    handleError($state.error);
  }
  return $state.error;
});

async function handleError(error: Error) {
  // Log error
  console.error('Wallet error:', error);

  // Implement recovery strategy
  if (error.code === 'NETWORK_ERROR') {
    await retryConnection();
  }
}

async function retryConnection() {
  setTimeout(async () => {
    try {
      await wallet.reset();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }, 5000);
}
```

### Error Boundary Component

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { errorHandler } from '$lib/errorHandler';

  let error: Error | null = null;

  const unsubscribe = errorHandler.subscribe(currentError => {
    error = currentError;
  });

  onDestroy(unsubscribe);
</script>

{#if error}
  <div class="error-boundary">
    <h3>Something went wrong</h3>
    <p>{error.message}</p>
    <button on:click={() => error = null}>
      Try Again
    </button>
  </div>
{:else}
  <slot></slot>
{/if}
```

## Performance Optimization

### Store Optimization

```typescript
// 1. Selective Subscription
import { derived } from 'svelte/store';
import { walletState } from '@walletmesh/modal-svelte';

// Only subscribe to needed state
const accountStore = derived(walletState, 
  $state => $state.account
);

const chainStore = derived(walletState, 
  $state => $state.chainId
);

// 2. Debounced Store
function createDebouncedStore(store, delay = 1000) {
  let timeoutId: NodeJS.Timeout;
  
  return derived(store, ($value, set) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => set($value), delay);
    
    return () => clearTimeout(timeoutId);
  });
}

// 3. Memoized Store
function createMemoizedStore(store, isEqual = (a, b) => a === b) {
  let lastValue: any;
  
  return derived(store, ($value, set) => {
    if (!isEqual(lastValue, $value)) {
      lastValue = $value;
      set($value);
    }
  });
}
```

### Component Optimization

```svelte
<script lang="ts">
  import { wallet, walletState } from '@walletmesh/modal-svelte';
  import { tick } from 'svelte';

  // 1. Use local state for frequent updates
  let localStatus = $walletState.status;
  let updateQueued = false;

  // 2. Batch updates
  $: {
    if (!updateQueued) {
      updateQueued = true;
      tick().then(() => {
        localStatus = $walletState.status;
        updateQueued = false;
      });
    }
  }

  // 3. Memoize expensive computations
  const memoizedValue = (() => {
    let cache: any;
    let lastInput: any;

    return (input: any) => {
      if (input !== lastInput) {
        lastInput = input;
        cache = expensiveComputation(input);
      }
      return cache;
    };
  })();
</script>

<!-- 4. Use keyed each blocks -->
{#each items as item (item.id)}
  <WalletItem {item} />
{/each}
```

## Testing Patterns

### Component Testing

```typescript
// 1. Mock Store
const mockWalletStore = {
  status: writable('disconnected'),
  account: writable(null),
  chainId: writable(1),
  error: writable(null)
};

// 2. Component Testing
describe('WalletButton', () => {
  it('handles connection', async () => {
    const { getByText } = render(WalletButton, {
      props: {
        wallet: mockWalletStore
      }
    });

    const button = getByText('Connect');
    await fireEvent.click(button);

    expect(mockWalletStore.connect).toHaveBeenCalled();
  });
});

// 3. Store Testing
describe('walletStore', () => {
  it('updates state correctly', () => {
    const store = createWalletStore();
    const values: any[] = [];

    const unsubscribe = store.subscribe(value => {
      values.push(value);
    });

    store.set({ status: 'connected' });
    expect(values).toContain({ status: 'connected' });

    unsubscribe();
  });
});
```

## Common Issues & Solutions

### 1. Store Subscription Management

```typescript
// Problem: Memory leaks from unmanaged subscriptions
const brokenPattern = () => {
  walletState.subscribe(state => {
    // Subscription never cleaned up
  });
};

// Solution: Proper cleanup with onDestroy
import { onDestroy } from 'svelte';

const correctPattern = () => {
  const unsubscribe = walletState.subscribe(state => {
    // Handle state changes
  });

  onDestroy(unsubscribe);
};
```

### 2. State Updates after Component Destruction

```typescript
// Problem: Updates after unmount
let mounted = true;
onDestroy(() => {
  mounted = false;
});

// Unsafe update
const unsafeUpdate = async () => {
  await someAsyncOperation();
  updateState(); // Might run after destruction
};

// Solution: Check mounted state
const safeUpdate = async () => {
  await someAsyncOperation();
  if (mounted) {
    updateState();
  }
};
```

### 3. Store Derivation Chain

```typescript
// Problem: Complex derivation chains
const state1 = derived(walletState, ...);
const state2 = derived(state1, ...);
const state3 = derived(state2, ...);

// Solution: Flatten derivations
const combinedState = derived(
  walletState,
  $state => ({
    value1: compute1($state),
    value2: compute2($state),
    value3: compute3($state)
  })
);
```

## Quick Reference

### Common Patterns

```typescript
// 1. Store Creation
const wallet = createWalletStore({
  chains: [1, 137],
  theme: 'light'
});

// 2. State Subscription
const unsubscribe = walletState.subscribe(state => {
  console.log('Wallet state:', state);
});

// Remember to unsubscribe
onDestroy(unsubscribe);

// 3. Derived States
const walletStatus = derived(walletState, 
  $state => ({
    isConnected: $state.status === 'connected',
    shortAddress: $state.account?.slice(0, 8)
  })
);
