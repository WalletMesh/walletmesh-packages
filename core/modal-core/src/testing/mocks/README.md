# Improved Vitest Mocking System

This directory contains improved mock implementations that leverage Vitest's auto-mocking capabilities instead of manual mock implementations. These files demonstrate how to reduce code duplication, improve type safety, and ensure automatic interface synchronization.

## Files Overview

### 1. `autoMockHelpers.ts`
Enhanced auto-mocking utilities that demonstrate proper Vitest usage patterns.

**Key Features:**
- Auto-mock real implementations using `vi.mocked()`
- Type-safe mock creation with automatic interface synchronization
- Batch module mocking for better performance
- Spy mode for integration testing

### 2. `mockSession.ts`
**Replaces:** 467 lines of manual session mocks  
**With:** ~50 lines using Vitest auto-mocking

**Key Improvements:**
- Uses real `SessionState` interface instead of duplicate `MockSession`
- Auto-mocked `SessionManager` using real implementation
- Automatic interface synchronization when SessionManager changes
- Smart session factories with realistic test data

### 3. `mockServices.ts`
**Replaces:** 405 lines of manual service implementations  
**With:** ~100 lines leveraging Vitest auto-mocking

**Key Improvements:**
- Auto-mocked real service classes (TransactionService, BalanceService, etc.)
- Preserves full interfaces while allowing test customization
- Service registry with complete ecosystem for testing
- Custom overrides for per-test configuration

### 4. `mockClient.ts`
**Replaces:** 237 lines of manual client implementation  
**With:** ~70 lines leveraging Vitest auto-mocking

**Key Improvements:**
- Auto-mocked `WalletMeshClient` using real implementation
- Integrated mock client with all services mocked
- Client presets for common test scenarios
- Module-level mocking for automatic usage

### 5. `mockStore.ts`
**Replaces:** 200+ lines of manual store implementation  
**With:** ~80 lines leveraging Vitest auto-mocking

**Key Improvements:**
- Auto-mocked unified store using real implementation
- Uses real `WalletMeshState` interface
- Store presets for different test scenarios
- Spy mode for integration testing

### 6. `mockProviders.ts`
**Replaces:** 300+ lines of manual provider implementations  
**With:** ~120 lines leveraging Vitest auto-mocking

**Key Improvements:**
- Auto-mocked real provider classes (EvmProvider, SolanaProvider, AztecProvider)
- Generic provider factory based on chain type
- Provider registry with complete ecosystem
- Provider presets for common scenarios

## Usage Examples

### Basic Auto-Mocking
```typescript
import { createAutoMockedWalletMeshClient } from './mockClient.js';
import { createAutoMockedStore } from './mockStore.js';
import { createMockedServiceRegistry } from './mockServices.js';

// Create auto-mocked client that stays in sync with real interface
const client = createAutoMockedWalletMeshClient();

// Create auto-mocked store with realistic default state
const store = createAutoMockedStore();

// Create complete service ecosystem
const services = createMockedServiceRegistry();
```

### Preset Configurations
```typescript
import { clientPresets } from './mockClient.js';
import { storePresets } from './mockStore.js';
import { providerPresets } from './mockProviders.js';

// Use presets for common test scenarios
const disconnectedClient = clientPresets.disconnected();
const connectedStore = storePresets.connected();
const errorProneProviders = providerPresets.errorProne();
```

### Module-Level Mocking
```typescript
import { 
  setupClientModuleMocks,
  setupServiceModuleMocks, 
  setupStoreModuleMocks,
  setupProviderModuleMocks
} from './index.js';

// Set up all module mocks at once
beforeEach(() => {
  setupClientModuleMocks();
  setupServiceModuleMocks();
  setupStoreModuleMocks();
  setupProviderModuleMocks();
});
```

### Spy Mode for Integration Tests
```typescript
import { createSpiedWalletMeshClient } from './mockClient.js';
import { createSpiedStore } from './mockStore.js';

// Keep real functionality but add spy capabilities
const spiedClient = createSpiedWalletMeshClient();
const spiedStore = createSpiedStore();

// Now you can assert on method calls while maintaining real behavior
expect(spiedClient.connect).toHaveBeenCalledWith(expectedOptions);
```

## Key Benefits

### 1. **Automatic Interface Synchronization**
- Mocks stay in sync when real implementations change
- No more outdated mock interfaces causing test failures
- TypeScript compiler catches interface mismatches

### 2. **Reduced Code Duplication**
- **1,609 lines of manual mocks** → **~420 lines of auto-mocked implementations**
- **74% reduction in mock code**
- Eliminates duplicate interface definitions

### 3. **Improved Type Safety**
- Uses real TypeScript interfaces instead of duplicates
- Full type checking on mock method calls
- Better IDE support with auto-completion

### 4. **Better Test Reliability**
- Real implementations ensure mocks behave like actual code
- Automatic detection of interface changes during refactoring
- Consistent mock behavior across test suites

### 5. **Enhanced Developer Experience**
- Preset configurations for common scenarios
- Helper methods for test setup
- Clear separation between mock types (auto, spied, preset)

## Migration Strategy

### Phase 1: Gradual Adoption
- Start using improved mocks in new tests
- Keep existing manual mocks for backward compatibility
- Export backward-compatible aliases

### Phase 2: Test Updates
- Update existing tests to use improved mocks
- Remove duplicate interface definitions
- Simplify test setup code

### Phase 3: Cleanup
- Remove old manual mock implementations
- Remove backward-compatibility exports
- Update documentation and examples

## Backward Compatibility

All improved mock files include backward-compatibility exports:

```typescript
// Backward compatibility exports (for existing tests)
export { createAutoMockedWalletMeshClient as createMockWalletMeshClient };
export { createAutoMockedStore as createMockStore };
export { createMockedServiceRegistry as createMockServices };
```

This allows existing tests to continue working while new tests can use the improved APIs.

## Performance Impact

### Build Time
- **No impact**: Auto-mocking uses same Vitest primitives
- **Faster compilation**: Fewer duplicate type definitions

### Test Runtime
- **Slightly faster**: Less object creation overhead
- **Better memory usage**: Shared mock implementations
- **Faster CI/CD**: Fewer lines to parse and execute

### Development Experience
- **Better IDE performance**: Fewer duplicate definitions
- **Faster type checking**: Real interfaces only
- **Better auto-completion**: Uses actual implementation signatures

## Conclusion

The improved Vitest mocking system provides:
- **74% reduction in mock code** (1,609 → 420 lines)
- **Automatic interface synchronization**
- **Better type safety and IDE support**
- **Backward compatibility during migration**
- **Enhanced developer experience**

This approach demonstrates how to properly leverage Vitest's auto-mocking capabilities to create maintainable, type-safe, and reliable test infrastructure.