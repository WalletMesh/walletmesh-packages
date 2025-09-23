# Service Integration Documentation

This document provides detailed information about how the consolidated services in WalletMesh Modal Core interact with each other, their lifecycle, and integration patterns.

## Service Architecture Overview

WalletMesh Modal Core uses a consolidated service architecture with 6 core services managed by a central ServiceRegistry. These services are stateless and provide pure business logic that is used by all framework implementations.

```
┌─────────────────────────────────────────────────────────────────┐
│                        ServiceRegistry                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ Connection  │ │   Chain     │ │ Transaction │              │
│  │  Service    │ │  Service    │ │  Service    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │  Balance    │ │ DAppRpc     │ │WalletPref   │              │
│  │  Service    │ │  Service    │ │  Service    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Service Lifecycle

### 1. Service Initialization

Services are initialized when the ServiceRegistry is created:

```typescript
// Service initialization sequence
ServiceRegistry.create(dependencies)
  ├─> ConnectionService.new()
  ├─> ChainService.new()
  ├─> TransactionService.new()
  ├─> BalanceService.new()
  ├─> DAppRpcService.new()
  └─> WalletPreferenceService.new()
```

### 2. Service Dependencies

All services extend `AbstractService` and receive common dependencies:

```typescript
interface BaseServiceDependencies {
  logger: Logger;
  errorHandler: ErrorHandler;
  chainServiceRegistry: ChainServiceRegistry;
}
```

### 3. Service Cleanup

Services implement a dispose pattern for proper cleanup:

```typescript
ServiceRegistry.dispose()
  ├─> ConnectionService.dispose()
  ├─> ChainService.dispose()
  ├─> TransactionService.dispose()
  ├─> BalanceService.dispose()
  ├─> DAppRpcService.dispose()
  └─> WalletPreferenceService.dispose()
```

## Service Interaction Patterns

### Connection Flow

The connection flow demonstrates how services interact during wallet connection:

```
User Action: Connect Wallet
    │
    ▼
┌─────────────────────────┐
│   ConnectionService     │
│ - Validates connection  │
│ - Creates session       │
└─────────────────────────┘
    │                   │
    ▼                   ▼
┌─────────────┐    ┌─────────────┐
│ChainService │    │WalletPref   │
│- Validates  │    │- Records    │
│  chain      │    │  usage      │
└─────────────┘    └─────────────┘
    │
    ▼
┌─────────────────────────┐
│   BalanceService        │
│ - Fetches initial       │
│   balances              │
└─────────────────────────┘
```

### Transaction Flow

Transaction processing involves multiple services:

```
User Action: Send Transaction
    │
    ▼
┌─────────────────────────┐
│  TransactionService     │
│ - Validates params      │
│ - Estimates gas         │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│   ChainService          │
│ - Verifies chain        │
│ - Gets chain config     │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│   DAppRpcService        │
│ - Sends RPC request     │
│ - Handles response      │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  TransactionService     │
│ - Tracks status         │
│ - Updates history       │
└─────────────────────────┘
```

### Chain Switching Flow

Chain switching involves coordination between services:

```
User Action: Switch Chain
    │
    ▼
┌─────────────────────────┐
│   ChainService          │
│ - Validates target      │
│ - Checks compatibility  │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  ConnectionService      │
│ - Updates session       │
│ - Validates provider    │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│   DAppRpcService        │
│ - Sends switch request  │
│ - Handles confirmation  │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│   BalanceService        │
│ - Clears old balances   │
│ - Fetches new balances  │
└─────────────────────────┘
```

## Detailed Service Interactions

### ConnectionService Interactions

ConnectionService is the central service that coordinates wallet connections:

**Depends on:**
- ChainService: For chain validation and compatibility checks
- WalletPreferenceService: For recording connection history
- ChainServiceRegistry: For chain-specific operations

**Used by:**
- Modal Controller: For connection UI flows
- React Hooks: For connection state management
- TransactionService: For session validation

### ChainService Interactions

ChainService manages chain configuration and validation:

**Depends on:**
- ChainServiceRegistry: For chain-specific implementations
- No direct service dependencies

**Used by:**
- ConnectionService: For chain validation during connection
- TransactionService: For chain-specific transaction handling
- BalanceService: For chain-specific balance queries

### TransactionService Interactions

TransactionService handles all transaction operations:

**Depends on:**
- ChainService: For chain configuration
- DAppRpcService: For sending transactions
- ConnectionService: For session validation

**Used by:**
- Modal Controller: For transaction UI
- React Hooks: For transaction state

### BalanceService Interactions

BalanceService manages balance queries and caching:

**Depends on:**
- ChainService: For chain configuration
- DAppRpcService: For balance RPC calls
- ConnectionService: For account information

**Used by:**
- Modal Controller: For balance display
- React Hooks: For balance state

### DAppRpcService Interactions

DAppRpcService handles all RPC communication:

**Depends on:**
- No direct service dependencies
- Uses provider instances from connections

**Used by:**
- TransactionService: For sending transactions
- BalanceService: For balance queries
- ChainService: For chain operations

### WalletPreferenceService Interactions

WalletPreferenceService manages user preferences:

**Depends on:**
- No direct service dependencies

**Used by:**
- ConnectionService: For recording usage
- Modal Controller: For preference-based sorting

## Error Handling Across Services

Services use a consistent error handling pattern:

```typescript
try {
  // Service operation
} catch (error) {
  // All services use ErrorFactory
  throw ErrorFactory.serviceError(
    'Operation failed',
    'ServiceName',
    { originalError: error }
  );
}
```

Error propagation flow:

```
Service Error
    │
    ▼
ErrorFactory
    │
    ▼
ErrorHandler (in dependencies)
    │
    ▼
Global Error Handling
    │
    ▼
User Notification
```

## State Management Integration

Services are stateless but interact with the Zustand store:

```
┌─────────────────────────────────────────┐
│           Zustand Store                 │
│  ┌─────────────────────────────────┐   │
│  │  connections slice              │   │
│  │  - activeSessions               │   │
│  │  - wallets                      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  transactions slice             │   │
│  │  - history                      │   │
│  │  - current                      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  ui slice                       │   │
│  │  - modal state                  │   │
│  │  - errors                       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ▲            ▲
           │            │
    ┌──────┴───┐    ┌───┴──────┐
    │ Actions  │    │ Services │
    └──────────┘    └──────────┘
```

## Testing Service Interactions

When testing service interactions:

1. **Use Mock Factories**: Always use the testing module's mock factories
2. **Test Integration Points**: Focus on service boundaries
3. **Mock External Dependencies**: Mock providers, not services
4. **Test Error Propagation**: Ensure errors flow correctly

Example test pattern:

```typescript
import { 
  createMockServiceDependencies,
  createMockEvmProvider 
} from '@walletmesh/modal-core/testing';

describe('Service Integration', () => {
  let services: ServiceRegistry;
  let mockProvider: any;

  beforeEach(() => {
    mockProvider = createMockEvmProvider();
    const deps = createMockServiceDependencies();
    services = new ServiceRegistry(deps);
  });

  it('should coordinate connection flow', async () => {
    // Test service interactions
    const result = await services.connectionService.connect({
      walletId: 'test',
      provider: mockProvider
    });

    // Verify chain validation was called
    expect(services.chainService.validateChain).toHaveBeenCalled();
  });
});
```

## Performance Considerations

### Service Call Optimization

- Services are designed to minimize inter-service calls
- Use caching where appropriate (e.g., BalanceService)
- Batch operations when possible

### Memory Management

- Services implement proper cleanup in dispose()
- No circular references between services
- Event listeners are properly removed

### Async Operation Handling

- All async operations use proper error handling
- Timeouts are configured per operation type
- Retry logic is built into critical operations

## Best Practices

### 1. Service Usage

- Access services through ServiceRegistry
- Don't create service instances directly
- Use dependency injection for testing

### 2. Error Handling

- Always use ErrorFactory for errors
- Provide context in error data
- Let errors propagate to error handlers

### 3. State Updates

- Services don't directly update state
- Use action functions for state mutations
- Services return data, actions update state

### 4. Testing

- Test service contracts, not implementations
- Mock external dependencies, not services
- Focus on integration points

## Future Considerations

### Planned Improvements

1. **Service Metrics**: Add performance monitoring
2. **Service Plugins**: Allow extending services
3. **Service Middleware**: Add request/response interceptors
4. **Service Events**: Standardized event system

### Extensibility

The service architecture is designed for extensibility:

- New services can be added to ServiceRegistry
- Services can be decorated with additional functionality
- Chain-specific services can be registered dynamically

## Conclusion

The consolidated service architecture in WalletMesh Modal Core provides:

- Clear separation of concerns
- Predictable interaction patterns
- Easy testing and mocking
- Framework-agnostic business logic
- Extensible architecture

By following these patterns and understanding service interactions, developers can effectively work with and extend the WalletMesh Modal Core services.