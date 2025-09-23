# Testing Module Migration Guide

## Overview

The modal-core testing module has been simplified from 1000+ lines to ~200 lines by removing unused abstractions and focusing on what tests actually use.

## What Changed

### Removed (Not Used in Any Tests)
- `createMockedServiceRegistry`
- `createCustomServiceMocks`
- `createAutoMockedSessionManagementService`
- `serviceMockFactories`
- `createIntegratedMockClient`
- `createSpiedWalletMeshClient`
- `clientPresets`
- `clientMockFactories`
- `createCompleteMockState`
- `createCompletelyMockedWalletMeshClient`
- `createCompleteModalCoreMock`
- All provider-specific mocks (`createAutoMockedEvmProvider`, etc.)
- `providerPresets`
- `providerMockFactories`
- `createTypeSafeMock`
- `autoMockFactories`
- All module-level setup functions
- Backward compatibility exports

### Kept & Simplified
- `createMockSessionState` - Simplified to ~50 lines
- `createAutoMockedStore` - Simplified to ~80 lines
- Basic type exports

### New Additions
- `createConnectedTestSetup()` - Common connected wallet scenario
- `createDisconnectedTestSetup()` - Common disconnected scenario
- `createMockClient()` - Simple client mock for basic needs

## Migration Examples

### Before (Complex Auto-Mocking)
```typescript
import { 
  createAutoMockedWalletMeshClient,
  createAutoMockedStore,
  autoMockFactories,
  clientPresets
} from '@walletmesh/modal-core/testing';

const mockClient = createAutoMockedWalletMeshClient();
const mockStore = autoMockFactories.store();
const presetClient = clientPresets.connected();
```

### After (Simple Direct Mocks)
```typescript
import { 
  createMockClient,
  createConnectedTestSetup 
} from '@walletmesh/modal-core/testing';

// For connected wallet tests
const { mockStore, mockSession } = createConnectedTestSetup();

// For basic client mocking
const mockClient = createMockClient();
```

### Common Test Patterns

#### Testing Connected State
```typescript
it('should handle connected wallet', () => {
  const { mockStore, address } = createConnectedTestSetup();
  
  // Your test logic
  expect(mockStore.getState().sessions.activeSessionId).toBe('test-session');
});
```

#### Testing Disconnected State
```typescript
it('should handle no wallet', () => {
  const { mockStore } = createDisconnectedTestSetup();
  
  expect(mockStore.getState().sessions.activeSessionId).toBeNull();
});
```

#### Custom State Setup
```typescript
it('should handle custom state', () => {
  const mockStore = createAutoMockedStore({
    ui: { isOpen: true, currentView: 'connecting' }
  });
  
  expect(mockStore.getState().ui.isOpen).toBe(true);
});
```

## Why This Change?

1. **Reduced Complexity**: 80% less code to maintain
2. **Better Performance**: No deep auto-mocking overhead
3. **Clearer Tests**: Direct, simple mocks are easier to understand
4. **Less Coupling**: Tests don't depend on complex mock infrastructure

## For Modal-React

Modal-React should:
1. Import only `createAutoMockedStore` and `createMockSessionState`
2. Use its own React-specific wrappers
3. Keep React-specific utilities like `renderHook` helpers