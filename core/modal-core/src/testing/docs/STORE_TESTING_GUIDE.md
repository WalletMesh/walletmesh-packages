# Store Testing Guide

This guide explains when and how to use different store creation patterns in tests.

## Available Store Creation Methods

### 1. `createTestStore(config?)` - Real Zustand Store
**When to use:**
- Integration tests that need real store behavior
- Testing actual state mutations and subscriptions
- Testing persistence or devtools integration
- When you need the exact same behavior as production

**Example:**
```typescript
import { createTestStore } from '@walletmesh/modal-core/testing';

const store = createTestStore({
  enableDevtools: false,
  persistOptions: { enabled: false }
});

// Use like a real store
const state = store.getState();
store.setState({ ui: { isOpen: true } });
```

### 2. `createAutoMockedStore(initialState?)` - Simple Mock Store
**When to use:**
- Unit tests that need to control store behavior
- When you want to verify store method calls
- When testing components in isolation
- When you need predictable, controlled state

**Example:**
```typescript
import { createAutoMockedStore } from '@walletmesh/modal-core/testing';

const mockStore = createAutoMockedStore({
  ui: { isOpen: true }
});

// All methods are vi.fn() mocks
expect(mockStore.getState).toHaveBeenCalled();
mockStore.setState({ ui: { isOpen: false } });
```

### 3. Custom Mock Store (NOT RECOMMENDED)
**When to avoid:**
- Don't create custom mock stores in individual tests
- This leads to inconsistency and maintenance issues
- Use `createAutoMockedStore` instead

## Guidelines

### For Unit Tests
Use `createAutoMockedStore` when:
- Testing individual functions or components
- You need to verify specific store interactions
- You want isolated, predictable behavior

### For Integration Tests
Use `createTestStore` when:
- Testing multiple components together
- Testing real state management flows
- Verifying subscription behavior
- Testing middleware (persistence, devtools)

### Best Practices

1. **Always clean up stores after tests:**
```typescript
afterEach(() => {
  store.destroy?.();
  vi.clearAllMocks();
});
```

2. **Use consistent patterns within a test file:**
Don't mix real and mock stores in the same test suite unless necessary.

3. **Prefer testing utilities over custom mocks:**
The testing utilities handle edge cases and provide consistent behavior.

4. **Document special cases:**
If you need custom store behavior, document why the standard utilities don't work.

## Migration Guide

If you have tests using custom mock stores:

```typescript
// ❌ OLD - Custom mock
const mockStore = {
  getState: vi.fn().mockReturnValue(mockState),
  setState: vi.fn(),
  subscribe: vi.fn()
};

// ✅ NEW - Use testing utility
const mockStore = createAutoMockedStore(mockState);
```

## Common Patterns

### Testing Subscriptions
```typescript
const store = createAutoMockedStore();
const callback = vi.fn();

const unsubscribe = store.subscribe(callback);

// Trigger state change
store.setState({ ui: { isOpen: true } });

// Verify callback was called
expect(callback).toHaveBeenCalledWith(expect.objectContaining({
  ui: { isOpen: true }
}));
```

### Testing Selectors
```typescript
const store = createTestStore();
store.setState({
  connections: {
    activeSessions: [{ id: '1', address: '0x123' }]
  }
});

const session = getActiveSession(store.getState());
expect(session).toEqual({ id: '1', address: '0x123' });
```

### Testing Actions
```typescript
import { uiActions } from '@walletmesh/modal-core';

const store = createTestStore();
uiActions.openModal(store);

expect(store.getState().ui.isOpen).toBe(true);
```