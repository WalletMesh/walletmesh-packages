# WalletMesh AI Troubleshooting Guide

This guide helps AI agents diagnose and resolve common issues when working with WalletMesh integrations.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Provider Issues](#provider-issues)
3. [State Management Issues](#state-management-issues)
4. [Event Handling Issues](#event-handling-issues)
5. [Framework-Specific Issues](#framework-specific-issues)

## Connection Issues

### Provider Not Found

```typescript
Problem:
ConnectionError: WALLET_NOT_AVAILABLE

Diagnosis:
```typescript
// Check provider availability
const providerExists = Boolean(window.ethereum);
const hasProvider = await controller.detectProvider();
```

Solutions:
1. Prompt user to install wallet
2. Check provider injection timing
3. Verify browser compatibility

Recovery Pattern:
```typescript
async function handleProviderNotFound() {
  try {
    // 1. Check if provider is temporarily unavailable
    const provider = await withRetry(
      detectProvider,
      { attempts: 3, delay: 1000 }
    );
    
    if (provider) return provider;

    // 2. Prompt for wallet installation
    const installed = await promptWalletInstallation();
    
    // 3. Retry after installation
    if (installed) {
      return await detectProvider();
    }
  } catch (error) {
    // Fall back to alternative connection method
    return initializeBackupProvider();
  }
}
```

### Connection Timeout

```typescript
Problem:
ConnectionError: CONNECTION_TIMEOUT

Diagnosis:
```typescript
// Check connection timing
const start = performance.now();
try {
  await controller.connect();
} catch (error) {
  const duration = performance.now() - start;
  console.log(`Connection failed after ${duration}ms`);
}
```

Solutions:
1. Increase timeout duration
2. Implement retry with backoff
3. Check network conditions

Recovery Pattern:
```typescript
async function handleConnectionTimeout(
  operation: () => Promise<void>,
  maxAttempts = 3
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTimeoutError(error)) throw error;
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Provider Issues

### Method Not Supported

```typescript
Problem:
ProviderError: METHOD_NOT_SUPPORTED

Diagnosis:
```typescript
// Check provider capabilities
function checkProviderCapabilities(provider: any) {
  const required = [
    'eth_requestAccounts',
    'eth_accounts',
    'eth_chainId'
  ];
  
  return required.every(method => 
    typeof provider[method] === 'function'
  );
}
```

Solutions:
1. Verify provider interface compatibility
2. Fall back to alternative method
3. Update provider requirements

Recovery Pattern:
```typescript
async function handleUnsupportedMethod(
  primary: () => Promise<void>,
  fallback: () => Promise<void>
) {
  try {
    await primary();
  } catch (error) {
    if (error.code === 'METHOD_NOT_SUPPORTED') {
      return await fallback();
    }
    throw error;
  }
}
```

## State Management Issues

### State Synchronization

```typescript
Problem:
State updates not reflecting in UI

Diagnosis:
```typescript
// Check state update propagation
function validateStateSync(store: any) {
  const states: any[] = [];
  const unsubscribe = store.subscribe(state => {
    states.push({ ...state, timestamp: Date.now() });
  });
  
  // Analyze state changes
  return {
    transitions: states,
    duration: states[states.length - 1].timestamp - states[0].timestamp,
    consistent: validateStateConsistency(states)
  };
}
```

Solutions:
1. Verify subscription setup
2. Check update batching
3. Validate state immutability

Recovery Pattern:
```typescript
function createSyncedState() {
  let currentState: any = null;
  const listeners = new Set<(state: any) => void>();

  return {
    setState(newState: any) {
      currentState = { ...newState };
      listeners.forEach(listener => listener(currentState));
    },
    
    subscribe(listener: (state: any) => void) {
      listeners.add(listener);
      listener(currentState);
      return () => listeners.delete(listener);
    }
  };
}
```

## Event Handling Issues

### Event Order Inconsistency

```typescript
Problem:
Events firing in unexpected order

Diagnosis:
```typescript
// Track event order
const eventLog: { type: string; timestamp: number }[] = [];

function logEvent(type: string) {
  eventLog.push({ type, timestamp: Date.now() });
}

// Analyze event sequence
function validateEventSequence() {
  const requiredOrder = [
    'connecting',
    'chainChanged',
    'accountsChanged',
    'connected'
  ];
  
  return requiredOrder.every((event, index) => 
    eventLog[index]?.type === event
  );
}
```

Solutions:
1. Implement event queuing
2. Add event dependencies
3. Validate event order

Recovery Pattern:
```typescript
class EventQueue {
  private queue: { type: string; data: any }[] = [];
  private processing = false;

  async addEvent(type: string, data: any) {
    this.queue.push({ type, data });
    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    this.processing = true;
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      await this.handleEvent(event!);
    }
    this.processing = false;
  }
}
```

## Framework-Specific Issues

### React Integration

```typescript
Problem:
Component re-rendering excessively

Diagnosis:
```typescript
// Track render cycles
function trackRenders(Component: React.ComponentType) {
  return React.memo(({ ...props }) => {
    const renderCount = React.useRef(0);
    renderCount.current++;
    
    React.useEffect(() => {
      console.log(`Rendered ${renderCount.current} times`);
    });
    
    return <Component {...props} />;
  });
}
```

Solutions:
1. Implement proper memoization
2. Use stable references
3. Optimize state updates

Recovery Pattern:
```typescript
function useStableWallet() {
  const [state, setState] = React.useState(initialState);
  
  const stableCallbacks = React.useMemo(() => ({
    connect: async () => {
      // Implementation
    },
    disconnect: async () => {
      // Implementation
    }
  }), []); // Empty deps for stable references
  
  return { state, ...stableCallbacks };
}
```

## Quick Validation Scripts

### Connection Validation

```typescript
async function validateConnection() {
  const checks = [
    checkProviderAvailability(),
    checkNetworkConnectivity(),
    checkWalletPermissions(),
    checkStateConsistency()
  ];
  
  const results = await Promise.all(checks);
  return results.every(result => result.success);
}
```

### State Validation

```typescript
function validateWalletState(state: any) {
  const required = ['status', 'account', 'chainId'];
  const validations = [
    validateStateStructure(state),
    validateStateTransitions(state),
    validateStateConstraints(state)
  ];
  
  return validations.every(valid => valid);
}
```

### Event Validation

```typescript
function validateEventSystem() {
  const eventTypes = [
    'connected',
    'disconnected',
    'chainChanged'
  ];
  
  return eventTypes.map(type => ({
    type,
    hasHandler: validateEventHandler(type),
    propagates: validateEventPropagation(type)
  }));
}
```

## Common Error Patterns

```typescript
const errorPatterns = {
  // Provider errors
  'No provider found': {
    causes: [
      'Wallet not installed',
      'Provider injection timing',
      'Browser compatibility'
    ],
    solutions: [
      'Prompt wallet installation',
      'Implement provider detection retry',
      'Use fallback provider'
    ]
  },
  
  // Connection errors
  'Connection failed': {
    causes: [
      'Network issues',
      'Wallet locked',
      'User rejected'
    ],
    solutions: [
      'Implement retry with backoff',
      'Prompt user action',
      'Provide clear error feedback'
    ]
  },
  
  // State errors
  'Invalid state': {
    causes: [
      'Race condition',
      'Missing properties',
      'Type mismatch'
    ],
    solutions: [
      'Implement state validation',
      'Use type guards',
      'Add state recovery'
    ]
  }
};
```

## Diagnostic Tools

```typescript
const diagnostics = {
  // Connection diagnostics
  async checkConnection() {
    return {
      provider: await detectProvider(),
      network: await checkNetwork(),
      permissions: await checkPermissions()
    };
  },

  // State diagnostics
  checkState(state: any) {
    return {
      valid: validateState(state),
      missing: findMissingProperties(state),
      invalid: findInvalidValues(state)
    };
  },

  // Event diagnostics
  checkEvents() {
    return {
      registered: getRegisteredEvents(),
      handling: validateEventHandling(),
      propagation: checkEventPropagation()
    };
  }
};
