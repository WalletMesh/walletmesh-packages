# Mock Factories Guide

This guide documents all available mock factories in the modal-core testing module and how to use them effectively.

## Quick Start

```typescript
import { 
  createMockClient,
  createMockEvmProvider,
  mockFactoryRegistry,
  createMockEnvironment 
} from '@walletmesh/modal-core/testing';

// Simple usage
const mockClient = createMockClient();
const mockProvider = createMockEvmProvider();

// Using the registry
const mockChainService = mockFactoryRegistry.services.chain();

// Create complete environment
const env = createMockEnvironment({ 
  chainType: 'evm',
  includeServices: true 
});
```

## Mock Factory Categories

### Core Infrastructure Mocks

#### `createMockClient()`
Creates a mock WalletMesh client with connection methods.
```typescript
const mockClient = createMockClient();
// Has connect, disconnect, getWallet, subscribe methods
```

#### `createMockLogger()`
Creates a mock logger for testing logging behavior.
```typescript
const mockLogger = createMockLogger();
expect(mockLogger.debug).toHaveBeenCalledWith('Debug message');
```

#### `createMockErrorHandler()`
Creates a mock error handler for testing error handling.
```typescript
const mockErrorHandler = createMockErrorHandler();
expect(mockErrorHandler.handleError).toHaveBeenCalled();
```

#### `createMockModal()` / `createMockModalController()`
Creates mock modal UI controllers.
```typescript
const mockModal = createMockModal();
mockModal.open();
expect(mockModal.open).toHaveBeenCalled();
```

#### `createMockFrameworkAdapter()`
Creates a mock framework adapter for UI rendering.
```typescript
const mockAdapter = createMockFrameworkAdapter();
// Has render, destroy, update, getContainer methods
```

### Service Mocks

#### Auto-Mocked Services (Recommended)
These use real service interfaces with Vitest auto-mocking:
- `createAutoMockedTransactionService()`
- `createAutoMockedBalanceService()`
- `createAutoMockedChainService()`
- `createAutoMockedConnectionService()`
- `createAutoMockedDiscoveryService()`
- `createAutoMockedConnectionUIService()`
- `createAutoMockedEventMappingService()`

```typescript
const mockTxService = createAutoMockedTransactionService();
mockTxService.sendTransaction.mockResolvedValue({
  hash: '0x123...',
  status: 'pending'
});
```

#### Additional Service Mocks
- `createMockWalletPreferenceService()` - User preferences
- `createMockDAppRpcService()` - dApp RPC communication
- `createMockSessionManager()` - Session lifecycle
- `createMockConnectionManager()` - Connection state

### Registry Mocks

#### `createMockServiceRegistry()`
Mock registry for managing services.
```typescript
const registry = createMockServiceRegistry();
const services = registry.getServices();
```

#### `createMockWalletRegistry()`
Mock registry for wallet management.
```typescript
const registry = createMockWalletRegistry();
registry.register('metamask', mockWallet);
```

#### Other Registries
- `createMockProviderRegistry()`
- `createMockChainServiceRegistry()`

### Provider Mocks

#### `createMockEvmProvider(responses?)`
Creates a mock EVM provider with configurable responses.
```typescript
const mockProvider = createMockEvmProvider({
  eth_accounts: ['0x123...'],
  eth_chainId: '0x1',
  eth_sendTransaction: new Error('User rejected')
});
```

#### `createMockSolanaProvider(balance?)`
Creates a mock Solana provider.
```typescript
const mockProvider = createMockSolanaProvider(2000000000); // 2 SOL
```

#### `createMockAztecProvider()`
Creates a mock Aztec provider.
```typescript
const mockProvider = createMockAztecProvider();
```

### Chain Service Mocks

#### `createMockBaseChainService(chainType)`
Base chain service mock.
```typescript
const chainService = createMockBaseChainService(ChainType.Evm);
```

#### Chain-Specific Services
- `createMockEVMChainService()` - EVM-specific methods
- `createMockSolanaChainService()` - Solana-specific methods
- `createMockAztecChainService()` - Aztec-specific methods

### Adapter Mocks

#### `createMockWalletAdapter(id, options)`
Creates a basic wallet adapter mock.
```typescript
const adapter = createMockWalletAdapter('metamask', {
  chains: [{ type: ChainType.Evm, chainIds: '*' }],
  features: ['sign_message']
});
```

#### Chain-Specific Adapters
- `createMockEvmAdapter(id)` - EVM wallet adapter
- `createMockSolanaAdapter(id)` - Solana wallet adapter
- `createMockAztecAdapter(id)` - Aztec wallet adapter
- `createMockDiscoveryWalletAdapter()` - Discovery adapter

### Transport Mocks

#### `createMockTransport()`
Basic transport mock.
```typescript
const transport = createMockTransport();
// Has connect, disconnect, send, on, off methods
```

#### Specialized Transports
- `createMockJSONRPCTransport()` - JSON-RPC transport
- `createMockChromeExtensionTransport()` - Chrome extension
- `createMockPopupWindowTransport()` - Popup window
- `createMockTransportDiscoveryService()` - Discovery service

### State and Session Mocks

#### `createMockSessionState(overrides?)`
Creates a mock session state.
```typescript
const session = createMockSessionState({
  walletId: 'metamask',
  chainId: '0x89' // Polygon
});
```

#### `createMockWalletInfo(id, options)`
Creates mock wallet metadata.
```typescript
const walletInfo = createMockWalletInfo('metamask', {
  name: 'MetaMask',
  chains: [ChainType.Evm]
});
```

## Using the Mock Factory Registry

The `mockFactoryRegistry` provides organized access to all mock factories:

```typescript
import { mockFactoryRegistry } from '@walletmesh/modal-core/testing';

// Access by category
const mockLogger = mockFactoryRegistry.core.logger();
const mockChainService = mockFactoryRegistry.services.chain();
const mockEvmProvider = mockFactoryRegistry.providers.evm();

// Type-safe creation
import { createMock } from '@walletmesh/modal-core/testing';
const mockAdapter = createMock('adapters', 'evm');
```

## Creating Complete Test Environments

Use `createMockEnvironment()` for comprehensive test setups:

```typescript
const env = createMockEnvironment({
  chainType: 'solana',
  includeServices: true,
  includeRegistries: true
});

// Access mocks
env.client.connect();
env.provider.getBalance();
env.services.transaction.sendTransaction();
```

## Composite Scenarios

#### `createMockConnectionScenario(options)`
Creates a complete wallet connection scenario.
```typescript
const scenario = createMockConnectionScenario({
  walletId: 'phantom',
  chainType: ChainType.Solana,
  connectionDelay: 1000,
  shouldFail: false
});

// Access components
const { wallet, provider, session } = scenario;
```

## Best Practices

1. **Use Auto-Mocked Services**: Prefer `createAutoMocked*` functions for services as they stay in sync with real interfaces.

2. **Configure Provider Responses**: Pass custom responses to provider mocks for specific test scenarios.

3. **Use the Registry**: The `mockFactoryRegistry` provides better organization and discovery of mocks.

4. **Create Environments**: Use `createMockEnvironment()` for integration tests that need multiple mocks.

5. **Type Safety**: Use TypeScript types to ensure mocks match expected interfaces.

## Examples

### Testing a Connection Flow
```typescript
it('should connect to wallet', async () => {
  const mockClient = createMockClient();
  const mockProvider = createMockEvmProvider({
    eth_accounts: ['0x123...']
  });
  
  mockClient.connect.mockResolvedValue({
    address: '0x123...',
    provider: mockProvider
  });
  
  const result = await connectWallet(mockClient);
  expect(result.address).toBe('0x123...');
});
```

### Testing Service Integration
```typescript
it('should fetch balance', async () => {
  const env = createMockEnvironment({ 
    chainType: 'evm',
    includeServices: true 
  });
  
  env.services.balance.getBalance.mockResolvedValue({
    value: '1000000000000000000',
    formatted: '1.0 ETH'
  });
  
  const balance = await getWalletBalance(env.services.balance);
  expect(balance.formatted).toBe('1.0 ETH');
});
```

### Testing Error Scenarios
```typescript
it('should handle connection errors', async () => {
  const mockProvider = createMockEvmProvider({
    eth_requestAccounts: new Error('User rejected')
  });
  
  await expect(connectWithProvider(mockProvider))
    .rejects.toThrow('User rejected');
});
```