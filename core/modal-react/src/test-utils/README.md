# Simplified Testing Utilities for Modal-React

## Philosophy

Keep it simple. Most tests need:
1. A wrapper with WalletMeshProvider
2. A mock store with basic state
3. Optional: connected wallet state

## Basic Usage

### Simple Test Setup
```typescript
import { createTestWrapper } from '../test-utils/testHelpers.minimal.js';
import { renderHook } from '@testing-library/react';

it('should work', () => {
  const { wrapper } = createTestWrapper();
  const { result } = renderHook(() => useMyHook(), { wrapper });
  
  expect(result.current.something).toBe(expected);
});
```

### Connected Wallet Test
```typescript
import { createConnectedWrapper } from '../test-utils/testHelpers.minimal.js';

it('should handle connected wallet', () => {
  const { wrapper, mockStore } = createConnectedWrapper();
  const { result } = renderHook(() => useAccount(), { wrapper });
  
  expect(result.current.isConnected).toBe(true);
  expect(result.current.address).toBe('0x1234567890123456789012345678901234567890');
});
```

### Custom State Test
```typescript
import { createTestWrapper } from '../test-utils/testHelpers.minimal.js';

it('should handle custom state', () => {
  const { wrapper } = createTestWrapper({
    initialState: {
      ui: { isOpen: true, currentView: 'connecting' }
    }
  });
  
  const { result } = renderHook(() => useModal(), { wrapper });
  expect(result.current.isOpen).toBe(true);
});
```

## What's Included

### `testHelpers.minimal.ts`
- `createTestWrapper()` - Basic wrapper with provider
- `createConnectedWrapper()` - Pre-configured connected state
- `setMockStore()` - For legacy test compatibility

### `mockWalletMesh.minimal.ts`
- Minimal module mock for @walletmesh/modal-core
- Just enough to make tests pass

## What's NOT Included

We removed:
- Complex auto-mocking systems
- Performance caching
- Batch mock operations
- Mock factories and presets
- Developer experience utilities

## Why Simpler?

1. **Less to maintain** - 200 lines instead of 2000
2. **Easier to understand** - Direct mocks, no abstractions
3. **Faster tests** - No complex object creation
4. **Better debugging** - See exactly what's mocked

## Common Patterns

### Mock a specific wallet
```typescript
const { wrapper } = createConnectedWrapper('phantom', 'SolanaAddress123...');
```

### Test error states
```typescript
const { wrapper } = createTestWrapper({
  initialState: {
    ui: { error: { message: 'Connection failed' } }
  }
});
```

### Test loading states
```typescript
const { wrapper } = createTestWrapper({
  initialState: {
    ui: { isLoading: true, currentView: 'connecting' }
  }
});
```

That's it. Keep your tests simple and focused.