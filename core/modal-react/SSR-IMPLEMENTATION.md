# SSR Implementation for Modal-React

This document explains the Server-Side Rendering (SSR) support implementation in `@walletmesh/modal-react`.

## Why Use an SSR Controller?

The modal-react package creates a specialized SSR controller for server environments instead of the real controller for several important reasons:

### 1. **Browser API Dependencies**
The real modal-core controller depends on browser-only APIs that don't exist in Node.js/server environments:
- `window` object for global state
- `EventTarget` API for event handling
- `localStorage` for persistence
- DOM manipulation for rendering
- PostMessage API for wallet communication

### 2. **Preventing Server Crashes**
Without the mock controller, attempting to use browser APIs on the server would cause:
- `ReferenceError: window is not defined`
- `ReferenceError: document is not defined`
- `ReferenceError: localStorage is not defined`

### 3. **Consistent Server Output**
The SSR controller ensures:
- Predictable initial state during SSR
- No side effects during server rendering
- Consistent HTML output for hydration
- No memory leaks from event listeners

### 4. **Performance Benefits**
- Avoids loading heavy modal-core dependencies on server
- Reduces server-side bundle size
- Faster server-side rendering
- No unnecessary resource allocation

## How It Works

### Server Detection
```typescript
export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
```

### Controller Selection
```typescript
const coreController = useMemo(() => {
  // Return SSR controller for server-side rendering
  if (!isBrowser) {
    return createSSRController();
  }
  
  // Create real controller in browser
  return createModal(modalConfig);
}, [wallets, mergedConfig, frameworkAdapter]);
```

### SSR Controller Implementation
The SSR controller (`ssrController.ts`) provides:
- Same interface as real controller
- Safe default state
- No-op methods that won't throw errors
- Minimal memory footprint

## SSR-Safe Components

### WalletmeshModalV2
- Delegates all rendering to modal-core
- Returns `null` during SSR
- Modal-core handles actual rendering after hydration

### Safe Storage Access
```typescript
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  // ... other methods
};
```

## Usage in SSR Frameworks

### Next.js
```tsx
// pages/wallet.tsx
import { WalletmeshProvider, WalletmeshModalV2 } from '@walletmesh/modal-react';

export default function WalletPage() {
  return (
    <WalletmeshProvider config={{}} wallets={wallets}>
      {/* Your app */}
      <WalletmeshModalV2 />
    </WalletmeshProvider>
  );
}
```

### Remix
```tsx
// app/routes/wallet.tsx
import { WalletmeshProvider } from '@walletmesh/modal-react';

export default function WalletRoute() {
  return (
    <WalletmeshProvider config={{}} wallets={wallets}>
      {/* Your app */}
    </WalletmeshProvider>
  );
}
```

## Key Benefits

1. **Zero Configuration**: SSR support works out of the box
2. **No Hydration Errors**: Consistent state between server and client
3. **Framework Agnostic**: Works with any SSR framework
4. **Type Safe**: Full TypeScript support maintained
5. **Progressive Enhancement**: Full functionality after hydration

## Testing SSR

```typescript
// In a test environment
process.env.NODE_ENV = 'test';
delete (global as any).window;

// Component will use SSR controller automatically
const { container } = render(
  <WalletmeshProvider config={{}} wallets={[]}>
    <App />
  </WalletmeshProvider>
);

// No errors thrown, renders safely
```

## Migration Guide

If upgrading from a non-SSR version:

1. Replace `WalletmeshModal` with `WalletmeshModalV2` for better SSR support
2. No other changes needed - SSR detection is automatic
3. Remove any manual `typeof window` checks - they're handled internally

## Architecture Decision

The decision to use a separate SSR controller instead of trying to make the real controller SSR-compatible was made because:

1. **Separation of Concerns**: Server rendering should only produce HTML, not manage wallet connections
2. **Security**: Wallet operations should only happen on the client
3. **Simplicity**: Easier to maintain than making all of modal-core SSR-compatible
4. **Performance**: Smaller server bundle without wallet logic
5. **Reliability**: Eliminates entire classes of SSR-related bugs

This approach follows the pattern used by other wallet libraries like RainbowKit and ConnectKit, ensuring familiar behavior for developers.