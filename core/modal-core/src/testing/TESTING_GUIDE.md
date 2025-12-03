# WalletMesh Testing Guide

This guide documents all testing utilities available in the WalletMesh packages and provides examples of when and how to use them.

## Table of Contents

- [Core Mock Utilities](#core-mock-utilities)
- [React-Specific Utilities](#react-specific-utilities)
- [Testing Patterns](#testing-patterns)
- [Best Practices](#best-practices)

## Core Mock Utilities

These utilities are available from `@walletmesh/modal-core/testing` and can be used in any test file.

### Basic Mocks

#### `createMockClient()`
Creates a minimal mock of the WalletMesh client with common methods.

**When to use:** Testing components that need a client instance but don't require full functionality.

```typescript
import { createMockClient } from '@walletmesh/modal-core/testing';

const mockClient = createMockClient();
// Returns an object with connect, disconnect, getWallet, isConnected, subscribe, getServices
```

#### `createMockLogger()`
Creates a mock logger with all standard logging methods.

**When to use:** Testing components that require a logger for debugging or error tracking.

```typescript
const mockLogger = createMockLogger();
// Has debug, info, warn, error, dispose methods as vi.fn()
```

#### `createMockErrorHandler()`
Creates a mock error handler for testing error scenarios.

**When to use:** Testing error handling logic and recovery strategies.

```typescript
const mockErrorHandler = createMockErrorHandler();
// Returns handleError, isFatal, getUserMessage, logError, dispose
```

### Framework & UI Mocks

#### `createMockFrameworkAdapter()`
Creates a mock framework adapter for UI rendering.

**When to use:** Testing modal controller or components that render UI.

```typescript
const mockAdapter = createMockFrameworkAdapter();
// Has render, destroy, getContainer methods
```

#### `createMockModal()`
Creates a mock modal controller.

**When to use:** Testing components that interact with the modal UI.

```typescript
const mockModal = createMockModal();
// Has open, close, getState, subscribe, on, once, off, cleanup
```

#### `createMockModalController()`
Creates an enhanced mock modal controller with actions.

**When to use:** Testing advanced modal interactions and state management.

```typescript
const mockController = createMockModalController();
// Includes getActions() which returns openModal, closeModal, setView, setLoading, setError
```

### Wallet & Provider Mocks

#### `createMockWalletAdapter()`
Creates a mock wallet adapter with configurable options.

**When to use:** Testing wallet connection flows and adapter behavior.

```typescript
const mockWallet = createMockWalletAdapter('metamask', {
  name: 'MetaMask',
  chains: [{ type: ChainType.Evm, chainIds: '*' }],
  features: ['sign_message', 'sign_transaction'],
});
```

#### `createMockEvmProvider()`
Creates a mock EVM provider with customizable responses.

**When to use:** Testing EVM-specific functionality like transactions and contract calls.

```typescript
const mockProvider = createMockEvmProvider({
  eth_accounts: ['0x123...'],
  eth_chainId: '0x1',
  eth_sendTransaction: '0xhash...',
  // Can also use functions for dynamic responses
  eth_getBalance: (params) => '0x1000',
  // Or errors
  wallet_switchEthereumChain: new Error('User rejected'),
});
```

#### `createMockSolanaProvider()`
Creates a mock Solana provider.

**When to use:** Testing Solana-specific functionality.

```typescript
const mockProvider = createMockSolanaProvider(1000000000); // Balance in lamports
```

#### `createMockAztecProvider()`
Creates a mock Aztec provider with all Aztec-specific methods.

**When to use:** Testing Aztec blockchain integrations.

```typescript
const mockProvider = createMockAztecProvider();
// Has all Aztec methods: sendTransaction, deployContract, viewFunction, etc.
```

### State & Session Mocks

#### `createMockSessionState()`
Creates a mock session state object.

**When to use:** Testing components that depend on wallet session state.

```typescript
const mockSession = createMockSessionState({
  walletId: 'metamask',
  primaryAddress: '0x123...',
  chain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum' },
  status: 'connected',
});
```

#### `createMockStateManager()`
Creates a mock state manager for testing state operations.

**When to use:** Testing components that manage state directly.

```typescript
const mockStateManager = createMockStateManager();
// Has getState, setState, subscribe, reset methods
```

#### `createAutoMockedStore()`
Creates a complete mock of the unified store.

**When to use:** Testing components that interact with the global state store.

```typescript
const mockStore = createAutoMockedStore({
  // Optional initial state
  ui: { isOpen: true, currentView: 'walletSelection' },
});
```

### Infrastructure Mocks

#### `createMockResourceManager()`
Creates a mock resource manager for lifecycle testing.

**When to use:** Testing resource cleanup and lifecycle management.

```typescript
const mockResourceManager = createMockResourceManager();
// Has register, unregister, cleanup, dispose, getResource, hasResource
```

#### `createMockTransport()`
Creates a mock transport for communication testing.

**When to use:** Testing transport layer communication.

```typescript
const mockTransport = createMockTransport();
// Has connect, disconnect, send, isConnected, on, off, destroy
```

#### `createMockEventEmitter()`
Creates a functional mock event emitter.

**When to use:** Testing event-based communication where events actually need to fire.

```typescript
const mockEmitter = createMockEventEmitter();
// Fully functional event emitter that tracks listeners and fires events
```

### Composite Utilities

#### `createMockConnectionScenario()`
Creates a complete mock scenario for wallet connections.

**When to use:** Integration testing of full connection flows.

```typescript
const scenario = createMockConnectionScenario({
  walletId: 'metamask',
  chainType: ChainType.Evm,
  connectionDelay: 100, // Simulate async connection
  shouldFail: false,
});

// Returns { wallet, provider, session } all configured to work together
```

#### `mockValidation`
Provides common test assertions for mock objects.

**When to use:** Verifying mock behavior in tests.

```typescript
import { mockValidation } from '@walletmesh/modal-core/testing';

// Verify wallet was connected
mockValidation.expectWalletConnected(mockWallet);

// Verify provider method was called
mockValidation.expectProviderMethod(mockProvider, 'eth_sendTransaction', ['0x...']);

// Verify error was handled
mockValidation.expectErrorHandled(mockErrorHandler, 'connection');

// Verify session was created
mockValidation.expectSessionCreated(mockSession, 'metamask');

// Verify modal interactions
mockValidation.expectModalOpened(mockModal);
mockValidation.expectModalClosed(mockModal);
```

#### `createTypedMock<T>()`
Creates a type-safe mock with automatic vi.fn() generation.

**When to use:** Creating mocks for custom interfaces with full type safety.

```typescript
interface MyService {
  getData(): Promise<string>;
  setData(value: string): void;
  count: number;
}

const mockService = createTypedMock<MyService>({
  count: 5, // Non-function properties
});

// mockService.getData and mockService.setData are automatically vi.fn()
// mockService.count is 5
```

## React-Specific Utilities

These utilities are available from `@walletmesh/modal-react/test-utils` and are designed specifically for React component and hook testing.

### Hook Return Value Mocks

#### `createMockUseAccountReturn()`
Creates a mock return value for the useAccount hook.

**When to use:** Testing components that consume useAccount data without needing the actual hook.

```typescript
const mockAccount = createMockUseAccountReturn({
  isConnected: true,
  address: '0x123...',
  chainId: '0x1',
  wallet: { id: 'metamask', name: 'MetaMask', icon: '...', chains: [ChainType.Evm] },
});
```

#### `createMockUseConnectReturn()`
Creates a mock return value for the useConnect hook.

**When to use:** Testing components that use connection functionality.

```typescript
const mockConnect = createMockUseConnectReturn({
  isConnecting: false,
  wallets: [{ id: 'metamask', name: 'MetaMask', icon: '...', chains: [] }],
  error: null,
});
```

### Testing Helpers

#### `createMockHookContext()`
Creates a complete testing context with store and render helpers.

**When to use:** Setting up comprehensive hook tests with consistent context.

```typescript
const { store, client, renderHookWithContext } = createMockHookContext();

const { result } = renderHookWithContext(() => useMyHook());
```

#### `simulateWalletConnection()`
Simulates a complete wallet connection flow.

**When to use:** Integration testing of connection flows in React components.

```typescript
const result = await simulateWalletConnection(wrapper, 'metamask', {
  chainId: '0x1',
  address: '0x123...',
});
```

#### `simulateChainSwitch()`
Simulates a chain switching operation.

**When to use:** Testing chain switching functionality in React components.

```typescript
const result = await simulateChainSwitch(wrapper, '0x89'); // Switch to Polygon
```

#### `assertHookState()`
Provides clean assertions for hook return values.

**When to use:** Asserting multiple properties of a hook's return value.

```typescript
assertHookState(result.current, {
  isConnected: true,
  isConnecting: false,
  address: '0x123...',
  // Only assert on properties you care about
});
```

#### `waitForHookUpdate()`
Waits for a hook to update to match a condition.

**When to use:** Testing async hook updates.

```typescript
await waitForHookUpdate(
  result,
  (state) => state.isConnected === true,
  { timeout: 5000 }
);
```

### State Management

#### `TestStateManager`
A class for managing multiple test stores across complex test scenarios.

**When to use:** Integration tests that need to coordinate multiple stores or complex state scenarios.

```typescript
const stateManager = new TestStateManager();

// Create stores for different test scenarios
const storeA = await stateManager.createStore('scenario-a', { /* initial state */ });
const storeB = await stateManager.createStore('scenario-b', { /* initial state */ });

// Update stores during tests
stateManager.updateStore('scenario-a', (state) => {
  state.ui.isOpen = true;
});

// Clean up after tests
stateManager.resetAll();
```

### Mock Data Generators

#### `createMockWalletList()`
Generates a list of mock wallets.

**When to use:** Testing wallet selection UI or wallet list functionality.

```typescript
const wallets = createMockWalletList(5); // Creates 5 mock wallets
```

#### `createMockWalletHealth()`
Creates mock wallet health data.

**When to use:** Testing health monitoring features.

```typescript
const health = createMockWalletHealth({
  status: 'degraded',
  issues: ['High latency detected'],
  lastCheck: Date.now(),
});
```

#### `createMockRecoveryState()`
Creates mock recovery state data.

**When to use:** Testing error recovery features.

```typescript
const recovery = createMockRecoveryState({
  isRecovering: true,
  attemptCount: 2,
  strategy: 'exponential_backoff',
});
```

#### `createMockSessionAnalytics()`
Creates mock session analytics data.

**When to use:** Testing analytics and session tracking features.

```typescript
const analytics = createMockSessionAnalytics();
// Returns sessionCount, totalTransactions, totalGasUsed, favoriteChains, lastActivity
```

### User Interaction Helpers

#### `userInteractions`
Provides helpers for simulating user interactions in tests.

**When to use:** Testing user flows and UI interactions.

```typescript
import { userInteractions } from '@walletmesh/modal-react/test-utils';

// Simulate clicking connect button
await userInteractions.clickConnect(container);

// Simulate selecting a wallet
await userInteractions.selectWallet(container, 'metamask');

// Simulate closing modal
await userInteractions.closeModal(container);
```

## Testing Patterns

### Basic Component Test

```typescript
import { createTestWrapper, createMockUseAccountReturn } from '@walletmesh/modal-react/test-utils';

describe('MyComponent', () => {
  const { wrapper } = createTestWrapper();
  
  it('should render when connected', () => {
    const mockAccount = createMockUseAccountReturn({
      isConnected: true,
      address: '0x123...',
    });
    
    // Test your component with mock data
  });
});
```

### Integration Test

```typescript
import { createMockConnectionScenario, mockValidation } from '@walletmesh/modal-core/testing';

describe('Connection Flow', () => {
  it('should complete connection', async () => {
    const { wallet, provider, session } = createMockConnectionScenario({
      walletId: 'metamask',
      chainType: ChainType.Evm,
    });
    
    // Perform connection
    await wallet.connect();
    
    // Validate results
    mockValidation.expectWalletConnected(wallet);
    mockValidation.expectSessionCreated(session, 'metamask');
  });
});
```

### Hook Test with State

```typescript
import { createMockHookContext, waitForHookUpdate } from '@walletmesh/modal-react/test-utils';

describe('useMyHook', () => {
  it('should update on state change', async () => {
    const { store, renderHookWithContext } = createMockHookContext();
    const { result } = renderHookWithContext(() => useMyHook());
    
    // Update store
    store.setState((state) => {
      state.ui.isOpen = true;
    });
    
    // Wait for hook to reflect change
    await waitForHookUpdate(result, (state) => state.isModalOpen === true);
  });
});
```

## Best Practices

1. **Use the Right Mock for the Job**
   - Use simple mocks for unit tests
   - Use composite mocks for integration tests
   - Use typed mocks for custom interfaces

2. **Keep Tests Focused**
   - Mock only what you need
   - Use `assertHookState` to test only relevant properties
   - Use mock validation helpers for common assertions

3. **Leverage Helpers**
   - Use `simulateWalletConnection` instead of manual connection setup
   - Use `createMockConnectionScenario` for full connection testing
   - Use `TestStateManager` for complex state scenarios

4. **Type Safety**
   - Use `createTypedMock<T>()` for custom interfaces
   - Let TypeScript infer types from mock factories
   - Use proper types for mock return values

5. **Clean Up**
   - Always clean up stores and resources after tests
   - Use `afterEach` hooks to reset mocks
   - Call `destroy()` or `cleanup()` on resources that need it

6. **Performance**
   - Use `vi.useFakeTimers()` for time-based tests
   - Reuse mock instances where possible
   - Keep mock data minimal but realistic