# WalletMesh Vue Integration Guide for AI Agents

This guide provides AI-specific instructions for integrating WalletMesh with Vue applications.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [Composables](#composables)
3. [Component Patterns](#component-patterns)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)

## Basic Integration

### Installation Setup

```typescript
// 1. Install dependencies
// npm install @walletmesh/modal-core @walletmesh/modal-vue

// 2. Import components
import { 
  WalletPlugin,
  useWallet,
  useWalletState
} from '@walletmesh/modal-vue';
```

### Plugin Setup

```typescript
// main.ts
import { createApp } from 'vue';
import { WalletPlugin } from '@walletmesh/modal-vue';

const app = createApp(App);

app.use(WalletPlugin, {
  chains: [ChainType.ETHEREUM],
  theme: 'light',
  defaultProvider: ProviderInterface.EIP1193
});
```

## Composables

### useWallet Composable

```typescript
// Component using useWallet
<script setup lang="ts">
import { useWallet } from '@walletmesh/modal-vue';

const {
  connect,
  disconnect,
  switchChain
} = useWallet();

// Reactive method wrappers
const handleConnect = async () => {
  try {
    await connect();
  } catch (error) {
    // Handle error
  }
};
</script>

<template>
  <button @click="handleConnect">
    Connect Wallet
  </button>
</template>
```

### useWalletState Composable

```typescript
<script setup lang="ts">
import { computed } from 'vue';
import { useWalletState } from '@walletmesh/modal-vue';

const {
  status,
  account,
  chainId,
  error
} = useWalletState();

// Computed properties
const isConnected = computed(() => status.value === 'connected');
const hasError = computed(() => Boolean(error.value));
</script>

<template>
  <div>
    <div>Status: {{ status }}</div>
    <div v-if="isConnected">Account: {{ account }}</div>
    <div v-if="hasError">Error: {{ error.message }}</div>
  </div>
</template>
```

## Component Patterns

### Connection Button

```typescript
<script setup lang="ts">
import { computed } from 'vue';
import { useWallet, useWalletState } from '@walletmesh/modal-vue';

const { connect, disconnect } = useWallet();
const { status, error } = useWalletState();

// Computed button properties
const buttonText = computed(() => {
  switch (status.value) {
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

const isDisabled = computed(() => 
  status.value === 'connecting'
);

// Methods
const handleClick = async () => {
  if (status.value === 'connected') {
    await disconnect();
  } else {
    await connect();
  }
};
</script>

<template>
  <button
    @click="handleClick"
    :disabled="isDisabled"
  >
    {{ buttonText }}
  </button>
</template>
```

### Chain Selector

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWallet, useWalletState } from '@walletmesh/modal-vue';

const { switchChain } = useWallet();
const { chainId } = useWalletState();

// Chain options
const chains = ref([
  { id: ChainType.ETHEREUM, name: 'Ethereum' },
  { id: ChainType.POLYGON, name: 'Polygon' }
]);

// Methods
const handleChange = async (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const newChainId = Number(select.value);
  await switchChain(newChainId);
};
</script>

<template>
  <select
    :value="chainId"
    @change="handleChange"
  >
    <option
      v-for="chain in chains"
      :key="chain.id"
      :value="chain.id"
    >
      {{ chain.name }}
    </option>
  </select>
</template>
```

## Error Handling

### Error Handler Component

```typescript
<script setup lang="ts">
import { watch } from 'vue';
import { useWalletState } from '@walletmesh/modal-vue';

const { error } = useWalletState();

// Error watcher
watch(error, (newError) => {
  if (newError) {
    handleError(newError);
  }
});

// Error handler
const handleError = (error: Error) => {
  switch (error.code) {
    case 'WALLET_NOT_AVAILABLE':
      promptWalletInstallation();
      break;
    case 'USER_REJECTED':
      showRejectionMessage();
      break;
    default:
      showGenericError(error);
  }
};
</script>

<template>
  <div v-if="error" class="error-container">
    <div class="error-message">
      {{ error.message }}
    </div>
    <button @click="handleRetry">
      Retry
    </button>
  </div>
</template>
```

### Error Recovery Pattern

```typescript
<script setup lang="ts">
import { watch, ref } from 'vue';
import { useWallet, useWalletState } from '@walletmesh/modal-vue';

const { reset } = useWallet();
const { error } = useWalletState();
const retryCount = ref(0);
const maxRetries = 3;

// Recovery watcher
watch(error, async (newError) => {
  if (newError && retryCount.value < maxRetries) {
    await attemptRecovery(newError);
  }
});

// Recovery implementation
const attemptRecovery = async (error: Error) => {
  try {
    retryCount.value++;
    await new Promise(resolve => 
      setTimeout(resolve, 1000 * retryCount.value)
    );
    await reset();
  } catch (recoveryError) {
    handleRecoveryFailure(recoveryError);
  }
};
</script>
```

## Performance Optimization

### Reactive Optimization

```typescript
<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { useWalletState } from '@walletmesh/modal-vue';

// 1. Use shallowRef for large objects
const walletData = shallowRef({});

// 2. Computed property with dependency tracking
const walletStatus = computed(() => {
  const { status, account } = useWalletState();
  return {
    isConnected: status.value === 'connected',
    shortAddress: account.value?.slice(0, 8)
  };
});

// 3. Method caching
const cachedMethods = {
  connect: null as (() => Promise<void>) | null
};

const getConnectMethod = () => {
  if (!cachedMethods.connect) {
    const { connect } = useWallet();
    cachedMethods.connect = connect;
  }
  return cachedMethods.connect;
};
</script>
```

### Component Optimization

```typescript
<script setup lang="ts">
import { defineComponent, markRaw } from 'vue';

// 1. Define raw components
const RawComponent = markRaw(defineComponent({
  // Component definition
}));

// 2. Use v-once for static content
const StaticContent = defineComponent({
  template: `
    <div v-once>
      <h1>Wallet Connection</h1>
      <p>Connect your wallet to continue</p>
    </div>
  `
});

// 3. Props optimization
const props = defineProps<{
  address: string;
  chainId: number;
}>();

// 4. Computed memoization
const memoizedValue = computed(() => {
  return expensiveOperation(props.address);
});
</script>

<template>
  <!-- Use v-show instead of v-if when toggling frequently -->
  <div v-show="isVisible">
    <component :is="RawComponent" />
  </div>
</template>
```

## Testing Patterns

### Component Testing

```typescript
// 1. Mock Plugin
const mockWalletPlugin = {
  install(app: App) {
    app.provide('wallet', {
      connect: vi.fn(),
      disconnect: vi.fn()
    });
  }
};

// 2. Test Setup
describe('WalletComponent', () => {
  const mountComponent = () => {
    const app = createApp(WalletComponent);
    app.use(mockWalletPlugin);
    return mount(app);
  };

  it('should handle connection', async () => {
    const wrapper = mountComponent();
    await wrapper.find('button').trigger('click');
    expect(mockWalletPlugin.connect).toHaveBeenCalled();
  });
});

// 3. Composable Testing
describe('useWallet', () => {
  it('should manage wallet state', () => {
    const { result } = renderComposable(() => useWallet());
    expect(result.status.value).toBe('disconnected');
  });
});
```

## Common Issues & Solutions

### 1. Reactivity Loss

```typescript
// Problem: Reactivity lost in async operations
const brokenPattern = async () => {
  const { status } = useWalletState();
  await someOperation();
  return status.value; // Reactivity lost
};

// Solution: Maintain reactivity reference
const correctPattern = async () => {
  const state = useWalletState();
  await someOperation();
  return state.status.value; // Reactivity maintained
};
```

### 2. Provider Initialization

```typescript
// Problem: Provider not ready when needed
const brokenInit = () => {
  const provider = window.ethereum;
  if (!provider) throw new Error('No provider');
};

// Solution: Async initialization with retry
const correctInit = async () => {
  for (let i = 0; i < 3; i++) {
    const provider = window.ethereum;
    if (provider) return provider;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Provider not available');
};
```

### 3. Event Cleanup

```typescript
// Problem: Memory leaks from event listeners
const brokenEvents = () => {
  const { on } = useWallet();
  on('connected', handleConnection);
};

// Solution: Proper cleanup in onUnmounted
const correctEvents = () => {
  const { on, off } = useWallet();
  
  onMounted(() => {
    on('connected', handleConnection);
  });
  
  onUnmounted(() => {
    off('connected', handleConnection);
  });
};
```

## Quick Reference

### Common Patterns

```typescript
// 1. State Management
const useWalletManager = () => {
  const state = useWalletState();
  const actions = useWallet();
  
  return {
    isConnected: computed(() => state.status.value === 'connected'),
    connect: actions.connect,
    disconnect: actions.disconnect
  };
};

// 2. Error Handling
const useErrorHandler = () => {
  const { error } = useWalletState();
  
  watch(error, (newError) => {
    if (newError) {
      handleError(newError);
    }
  });
};

// 3. Event Management
const useEventManager = () => {
  const { on, off } = useWallet();
  
  const registerEvents = () => {
    on('connected', handleConnected);
    on('disconnected', handleDisconnected);
  };
  
  const cleanup = () => {
    off('connected', handleConnected);
    off('disconnected', handleDisconnected);
  };
  
  onMounted(registerEvents);
  onUnmounted(cleanup);
};
