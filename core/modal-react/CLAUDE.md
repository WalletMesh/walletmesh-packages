# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

`@walletmesh/modal-react` is the React adapter for the WalletMesh modal system. It provides React-specific components, hooks, and utilities for integrating wallet connection modals into React applications. The package has been significantly simplified with a consolidated hook architecture for better developer experience.

### Recent Architecture Changes

**Hook Consolidation** (v2.0+): The library has been streamlined from 20+ hooks to 10 core hooks by merging related functionality:

- **useConnect** now includes disconnect functionality (merged from `useDisconnect`)
- **useAccount** now includes wallet selection and all account-related data (merged from `useSelectedWallet`, `useAddress`, `useChain`, `useIsConnected`, `useWallet`, `useWalletSessions`)
- **useSwitchChain** now includes chain validation (merged from `useEnsureChain`)
- **useConfig** now includes modal control and wallet discovery (merged from `useModal`, `useWallets`)
- **useWalletEvents** provides unified event handling (replaced `useMultipleWalletEvents`, `useWalletEventOnce`, `useConnectionStateEvents`, `useProviderChangeEvents`)
- **useSSR** is the only public SSR hook (internal utilities removed from public API)
- Removed enterprise-specific hooks (`useWalletHealth`, `useConnectionRecovery`) to focus on core functionality

**State Management Simplification**: The underlying Zustand store has been reduced from 5 slices to 3 core slices (Connection, Discovery, UI) for improved performance and easier debugging.

### Key Features
- **10 Core React Hooks** - Simplified from 20+ hooks for easier usage
- **wagmi-Inspired API** - Familiar patterns for Web3 developers
- **Consolidated Functionality** - Merged related hooks (useDisconnect → useConnect, useSelectedWallet → useAccount)
- **Server-Side Rendering (SSR) Support** - Safe browser-only operations with hydration
- **TypeScript First** - Full type safety with comprehensive type exports
- **CSS Modules** - Scoped styling with design system integration
- **Automatic Modal Injection** - Via React Portal with customization options

## Architecture

### Core Components

**WalletMeshProvider** (`src/WalletMeshProvider.tsx`)
- Main provider component that wraps the React application
- Manages WalletMeshClient instance and modal state
- Handles SSR with conditional browser-only initialization
- Provides context for all child components
- Integrates with new Zustand-based state management

**WalletMeshModal** (`src/components/WalletMeshModal.tsx`)
- Main modal UI component with multiple views:
  - Wallet selection with availability detection
  - Connecting state with progress indication
  - Connected state with session info
  - Error state with recovery options
- Uses CSS modules for styling
- Automatically injected via React Portal
- Accessible with ARIA attributes

**WalletMeshErrorBoundary** (`src/components/WalletMeshErrorBoundary.tsx`)
- Error boundary with recovery capabilities
- Integration with `useConnectionRecovery` hook
- Customizable fallback UI
- Error reporting callbacks

**Transaction Status Overlays** (Auto-injected by default)
- **AztecTransactionStatusOverlay** (`src/components/AztecTransactionStatusOverlay.tsx`)
  - Full-screen blocking overlay for sync transactions (executeSync)
  - Shows complete transaction lifecycle: idle → simulating → proving → sending → pending → confirming → confirmed/failed
  - Auto-dismisses 2.5 seconds after showing success/failure state
  - Includes navigation guard to prevent accidental tab closure
  - **Focus trapping** for keyboard accessibility (can be disabled)
  - **ESC key support** to close when transaction completes
  - **Theming support** with customizable design tokens
  - Automatically injected by provider (no manual rendering required)

- **BackgroundTransactionIndicator** (`src/components/BackgroundTransactionIndicator.tsx`)
  - Floating badge for async (background) transactions (execute)
  - Non-blocking UI that allows users to continue working
  - Expandable drawer showing transaction details
  - Automatically tracks and displays active transactions
  - Automatically injected by provider (no manual rendering required)

### Simplified Hook System (10 Core Hooks)

**Connection & Account Management**
- `useConnect` - **CONSOLIDATED**: Connection, disconnection, and progress tracking (merged useDisconnect)
- `useAccount` - **CONSOLIDATED**: Account state, wallet selection, and connection info (merged useSelectedWallet, useAddress, useChain, useIsConnected, useWallet)
- `usePublicProvider` - dApp RPC provider for read operations (uses your own RPC infrastructure)
- `useWalletProvider` - Wallet RPC provider for write operations (uses wallet's RPC)

**Chain & Transaction Management**
- `useSwitchChain` - **CONSOLIDATED**: Chain switching with validation and ensurance (merged useEnsureChain)
- `useBalance` - Token balance queries with caching
- `useTransaction` - Multi-chain transaction support

**UI & Configuration**
- `useConfig` - Modal control and configuration access
- `useTheme` - Theme management with persistence
- `useWalletEvents` - Event subscriptions with unified interface
- `useSSR` - SSR utilities and hydration helpers

**Removed Hooks** (Functionality merged into core hooks):
- ❌ `useDisconnect` → merged into `useConnect`
- ❌ `useEnsureChain` → merged into `useSwitchChain`
- ❌ `useSelectedWallet` → merged into `useAccount`
- ❌ `useAddress` → merged into `useAccount`
- ❌ `useChain` → merged into `useAccount`
- ❌ `useWalletSessions` → merged into `useAccount`
- ❌ `useIsConnected`, `useWallet` → merged into `useAccount`
- ❌ `useModal` → merged into `useConfig`
- ❌ `useWallets` → merged into `useConfig`
- ❌ `useWalletHealth`, `useConnectionRecovery` → removed (enterprise features simplified)
- ❌ `useMultipleWalletEvents` → removed (use `useWalletEvents`)
- ❌ `useWalletEventOnce` → removed (use `useWalletEvents` with `{ once: true }`)
- ❌ `useConnectionStateEvents`, `useProviderChangeEvents` → removed (use `useWalletEvents`)
- ❌ SSR utility hooks → kept only `useSSR` as public API

### State Management

The package uses a simplified Zustand-based store from modal-core:
- 3 core state slices (reduced from 5): Connection, Discovery, UI
- Direct subscriptions without wrapper classes
- Session-based state architecture
- Optimized re-renders with selectors
- Full TypeScript type inference

### Testing Infrastructure

**Test Utilities** (`src/test/utils.tsx`)
- `createWrapper` - Creates WalletMeshProvider wrapper for tests
- `renderWithProvider` - Render helper with provider
- Mock configurations for consistent testing

**Test Patterns**
- All hooks tested with `@testing-library/react-hooks`
- Components tested with `@testing-library/react`
- Fake timers for async operations
- localStorage mocking for persistence tests

## Development Commands

```bash
# Build
pnpm build              # Full build with TypeScript and CSS
pnpm clean              # Clean dist directory
pnpm type-check         # Type checking only

# Testing
pnpm test               # Run all tests
pnpm test:watch         # Run tests in watch mode
pnpm test -- useAccount.test.tsx  # Run specific test (updated hook names)
pnpm coverage           # Generate coverage report

# Code Quality
pnpm lint               # Run biome linter
pnpm lint:fix           # Auto-fix linting issues
pnpm format             # Check formatting
pnpm format:fix         # Auto-fix formatting

# Documentation
pnpm docs               # Generate TypeDoc documentation (outputs to docs/)

# Development
pnpm dev                # Start development with hot reload
```

## Simplified Hook Architecture

### Core Hook Usage Examples

**useConnect** - Consolidated connection management:
```typescript
import { useConnect } from '@walletmesh/modal-react';

function ConnectButton() {
  const { 
    connect, 
    disconnect,  // NEW: merged from useDisconnect
    isConnecting, 
    error 
  } = useConnect();

  return (
    <button onClick={() => connect()}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

**useAccount** - Consolidated account and wallet selection:
```typescript
import { useAccount } from '@walletmesh/modal-react';

function AccountInfo() {
  const { 
    isConnected, 
    address,      // NEW: merged from useAddress
    chainId,      // NEW: merged from useChain  
    wallet,       // NEW: merged from useWallet
    isReconnecting,
    selectedWallet, // NEW: merged from useSelectedWallet
    status 
  } = useAccount();

  if (!isConnected) return null;

  return (
    <div>
      <p>Connected to {wallet?.name}</p>
      <p>Address: {address}</p>
      <p>Chain: {chainId}</p>
    </div>
  );
}
```

**useSwitchChain** - Consolidated chain management:
```typescript
import { useSwitchChain } from '@walletmesh/modal-react';

function ChainSwitcher() {
  const { 
    switchChain, 
    ensureChain,    // NEW: merged from useEnsureChain
    currentChain, 
    supportedChains,
    isCompatible 
  } = useSwitchChain();

  return (
    <select onChange={(e) => switchChain(e.target.value)}>
      {supportedChains.map(chain => (
        <option key={chain.id} value={chain.id}>
          {chain.name}
        </option>
      ))}
    </select>
  );
}
```

### Migration from Old API

The modal-react package has been simplified from 20+ hooks to 10 core hooks by consolidating related functionality:

**Connection Management**:
- `useConnect` now includes `disconnect` functionality (no separate `useDisconnect`)
- Single hook for all connection operations

**Account Information**:
- `useAccount` consolidates all account-related data:
  - `address` (replaces `useAddress()`)
  - `chainId` and `chainType` (replaces `useChain()`)
  - `isConnected` (replaces `useIsConnected()`)
  - `wallet` (replaces `useWallet()`)
  - `selectedWallet` and wallet selection (replaces `useSelectedWallet()`)

**Chain Management**:
- `useSwitchChain` now includes chain validation functionality
- No separate `useEnsureChain` hook needed

**UI Controls**:
- `useConfig` provides modal controls and wallet discovery
- No separate `useModal()` or `useWallets()` hooks

**Event Handling**:
- `useWalletEvents` is the single unified event hook
- Removed deprecated hooks: `useMultipleWalletEvents`, `useWalletEventOnce`, etc.

**Example Migration**:
```typescript
// Old way (multiple hooks)
const address = useAddress();
const { chainId } = useChain();
const isConnected = useIsConnected();
const wallet = useWallet();
const { open } = useModal();

// New way (consolidated hooks)
const { address, chainId, isConnected, wallet } = useAccount();
const { open } = useConfig();
```

## Currently Deprecated Features (v3.0.0 Removal)

### **Legacy Wallet Configuration Format**
The legacy string array format for wallet configuration is deprecated:

```typescript
// ❌ DEPRECATED - Legacy string array format (will be removed in v3.0.0)
<WalletMeshProvider config={{
  appName: 'My App',
  chains: [...],
  wallets: ['metamask', 'phantom'] // This format is deprecated
}}>

// ✅ RECOMMENDED - New WalletConfig object format
<WalletMeshProvider config={{
  appName: 'My App', 
  chains: [...],
  wallets: { include: ['metamask', 'phantom'] } // Use this format
}}>
```

The legacy format currently logs warnings in development mode and is automatically transformed to the new format. Update your code to use the new format before the next major version.

### **Removed Legacy Test Utilities**
- **`mockWalletMesh.ts`** - Removed in v3.0.0, use `centralizedMocks.ts` for all tests
- Legacy backward compatibility utilities have been cleaned up

### **Recently Implemented (v3.0.0)**
#### **Direct Transaction Sending in useTransaction**
The `useTransaction` hook now supports direct transaction sending through the transaction service instead of requiring the legacy provider approach.

**Implementation:**
- Uses `useWalletProvider()` to get blockchain provider
- Constructs proper `SendTransactionParams` for the transaction service
- Provides proper error handling and validation
- Integrates with TanStack Query for state management

**Usage:**
```typescript
function MyComponent() {
  const { sendTransaction, status } = useTransaction();
  
  const handleSend = async () => {
    try {
      const result = await sendTransaction({
        to: '0x...',
        value: '1000000000000000000', // 1 ETH
      });
      console.log('Transaction sent:', result.hash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };
}
```

## CSS Architecture

### Design System Integration
- CSS custom properties for theming
- Consistent spacing and typography
- Responsive design patterns
- Animation utilities

### File Organization
```
src/styles/
  globals.css              # Global styles and CSS variables
src/components/
  Component.module.css     # Component-specific styles
```

### CSS Module Pattern
```typescript
import styles from './Component.module.css';

<div className={styles.container}>
  <button className={styles.buttonPrimary}>
    Connect
  </button>
</div>
```

## Testing Best Practices

### Test Structure
```typescript
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../test/utils.js';

describe('useHookName', () => {
  it('should handle specific case', async () => {
    const { result } = renderHook(() => useHookName(), {
      wrapper: createWrapper(),
    });
    
    await act(async () => {
      await result.current.someAction();
    });
    
    expect(result.current.someValue).toBe(expected);
  });
});
```

### Mock Patterns
- Mock dependencies at module level
- Use `vi.mocked()` for type-safe mocks
- Clean up mocks in `afterEach`
- Use fake timers for async testing

## Common Development Tasks

### Adding a New Hook
1. Create hook file in `src/hooks/hookName.ts`
2. Define TypeScript interfaces for options and return types
3. Implement hook with proper error handling
4. Export from `src/hooks/index.ts` and `src/index.ts`
5. Create comprehensive tests in `src/hooks/hookName.test.tsx`
6. Add TypeScript examples to documentation

### Using Consolidated Event Handling
```typescript
import { useWalletEvents } from '@walletmesh/modal-react';

function EventSubscriber() {
  const { subscribe, unsubscribe } = useWalletEvents();
  
  useEffect(() => {
    // Unified event subscription interface
    const unsubscribers = [
      subscribe('connection:established', (wallet) => {
        console.log('Connected to:', wallet.name);
      }),
      subscribe('chain:switched', (chainId) => {
        console.log('Switched to chain:', chainId);
      }),
      subscribe('connection:failed', (error) => {
        console.error('Connection failed:', error);
      })
    ];

    return () => unsubscribers.forEach(unsub => unsub());
  }, [subscribe]);
}
```

### Transaction Management
```typescript
import { useTransaction, useBalance } from '@walletmesh/modal-react';

function TransactionExample() {
  const { sendTransaction, status } = useTransaction();
  const { balance, refetch } = useBalance();
  
  const handleSend = async () => {
    try {
      await sendTransaction({
        to: '0x...',
        value: '0.1',
      });
      // Refetch balance after transaction
      await refetch();
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <p>Balance: {balance}</p>
      <button onClick={handleSend} disabled={status === 'pending'}>
        {status === 'pending' ? 'Sending...' : 'Send Transaction'}
      </button>
    </div>
  );
}
```

## Integration Patterns

### With Next.js (SSR)
```typescript
import { useSSR, useClientValue } from '@walletmesh/modal-react';

function WalletButton() {
  const { isClient } = useSSR();
  const address = useClientValue(() => window.ethereum?.selectedAddress);
  
  if (!isClient) {
    return <button>Connect Wallet</button>;
  }
  
  return <button>{address || 'Connect'}</button>;
}
```

### With Redux/Zustand
```typescript
// Direct store access for advanced use cases
import { useWalletMeshStore } from '@walletmesh/modal-react';

const store = useWalletMeshStore();
const { sessions, ui } = store.getState();
```

### With React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { useAccount, usePublicProvider } from '@walletmesh/modal-react';

function useTokenBalance(tokenAddress: string) {
  const { address } = useAccount();
  const { provider } = usePublicProvider();
  
  return useQuery({
    queryKey: ['balance', address, tokenAddress],
    queryFn: async () => {
      if (!provider || !address) return null;
      // Use public provider for read operations
      return provider.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf(address)
        }, 'latest']
      });
    },
    enabled: !!provider && !!address,
  });
}
```

## Transaction Overlay Configuration

### Focus Trapping & Keyboard Navigation

The transaction status overlay includes built-in focus trapping and keyboard navigation for improved accessibility:

```typescript
<WalletMeshProvider config={{
  appName: 'My DApp',
  chains: [...],
  transactionOverlay: {
    // ESC key closes overlay when transaction completes
    allowEscapeKeyClose: true, // default

    // Disable focus trapping if implementing custom focus management
    disableFocusTrap: false, // default
  }
}}>
  <App />
</WalletMeshProvider>
```

**Features:**
- **Focus trap**: Keyboard navigation stays within the overlay
- **ESC key support**: Close overlay when transaction reaches terminal state (confirmed/failed)
- **ARIA attributes**: Proper accessibility labels for screen readers
- **Focus restoration**: Returns focus to previously focused element when overlay closes

### Theming the Transaction Overlay

Customize the transaction overlay appearance using design tokens:

```typescript
<WalletMeshProvider config={{
  appName: 'My DApp',
  chains: [...],
  theme: {
    mode: 'dark',
    customization: {
      colors: {
        // Overlay background and card styling
        overlayBg: 'rgba(0, 0, 0, 0.85)',
        overlayCardBg: 'rgba(30, 30, 30, 0.95)',
        overlayCardBorder: 'rgba(100, 100, 100, 0.3)',

        // Text colors
        overlayTextPrimary: '#ffffff',
        overlayTextSecondary: 'rgba(255, 255, 255, 0.7)',

        // Interactive elements
        overlaySpinnerPrimary: '#00ff88',
        overlayStageActive: 'rgba(0, 255, 136, 0.25)',
        overlayStageCompleted: 'rgba(0, 200, 100, 0.2)',
        overlayStageIcon: 'rgba(100, 100, 100, 0.2)',
      }
    }
  }
}}>
  <App />
</WalletMeshProvider>
```

**Available Design Tokens:**

| Token | Purpose | Default (Dark) | Default (Light) |
|-------|---------|----------------|-----------------|
| `overlayBg` | Full overlay background | `rgba(15, 23, 42, 0.72)` | `rgba(15, 23, 42, 0.72)` |
| `overlayCardBg` | Content card background | `rgba(9, 14, 26, 0.92)` | `rgba(255, 255, 255, 0.95)` |
| `overlayCardBorder` | Content card border | `rgba(148, 163, 184, 0.15)` | `rgba(226, 232, 240, 0.5)` |
| `overlayTextPrimary` | Primary text color | `#f8fafc` | `#1f2937` |
| `overlayTextSecondary` | Secondary/muted text | `rgba(226, 232, 240, 0.92)` | `#6b7280` |
| `overlaySpinnerPrimary` | Spinner color | `#38bdf8` | `#4f46e5` |
| `overlayStageActive` | Active stage highlight | `rgba(56, 189, 248, 0.25)` | `rgba(79, 70, 229, 0.25)` |
| `overlayStageCompleted` | Completed stage color | `rgba(34, 197, 94, 0.2)` | `rgba(34, 197, 94, 0.2)` |
| `overlayStageIcon` | Stage icon background | `rgba(148, 163, 184, 0.15)` | `rgba(148, 163, 184, 0.15)` |

### Complete Transaction Overlay Example

```typescript
<WalletMeshProvider config={{
  appName: 'Advanced DApp',
  chains: [aztecSandbox],

  // Transaction overlay configuration
  transactionOverlay: {
    enabled: true, // Enable overlay

    // Custom text
    headline: 'Processing Your Transaction',
    description: 'Please wait while we process your request',

    // Navigation and accessibility
    disableNavigationGuard: false, // Warn before closing tab
    allowEscapeKeyClose: true, // ESC closes when done
    disableFocusTrap: false, // Enable keyboard accessibility

    // Display options
    showBackgroundTransactions: false, // Only show active transaction
  },

  // Theme customization
  theme: {
    mode: 'dark',
    persist: true,
    customization: {
      colors: {
        // Custom overlay colors
        overlayBg: 'rgba(0, 0, 0, 0.9)',
        overlayCardBg: '#1a1a1a',
        overlaySpinnerPrimary: '#00ff88',
        overlayStageActive: 'rgba(0, 255, 136, 0.3)',
      }
    }
  }
}}>
  <App />
</WalletMeshProvider>
```

## Production Considerations

### Performance Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Use selectors for specific state subscriptions
- Batch state updates when possible

### Error Boundaries
```typescript
<WalletMeshErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error service
    Sentry.captureException(error);
  }}
  fallback={(error) => <ErrorRecoveryUI error={error} />}
>
  <App />
</WalletMeshErrorBoundary>
```

### Security Best Practices
- Never expose private keys or mnemonics
- Validate all wallet responses
- Use proper CSP headers
- Implement request origin validation
- Add transaction confirmation UI

## Documentation

### User-Facing Docs
- `README.md` - Package overview and quick start
- `TYPESCRIPT_EXAMPLES.md` - Comprehensive TypeScript usage
- `ERROR_RECOVERY_PATTERNS.md` - Production error handling
- `NEW_FUNCTIONALITY.md` - Advanced features overview

### Generated Docs
- `docs/` - Auto-generated API documentation (TypeDoc)
- Do not edit files in `docs/` - they are regenerated on build

## Debugging Tips

### Common Issues

1. **useWalletMeshContext Error**
   - Ensure component is wrapped in WalletMeshProvider
   - Check that provider is at the app root

2. **Hydration Mismatches**
   - Use `useSSR` or `useClientValue` hooks
   - Wrap browser-only code properly

3. **Type Errors with Hooks**
   - Import types from `@walletmesh/modal-react`
   - Use proper generic constraints

4. **Event Subscriptions Not Working**
   - Check event names match ModalEventMap
   - Ensure cleanup in useEffect return

### Debug Mode
```typescript
<WalletMeshProvider config={{ 
  debug: true,
  logger: { level: 'debug' }
}}>
```

## Key Implementation Files

### Consolidated Hook Implementations
- `src/hooks/useAccount.ts` - **CONSOLIDATED**: Account state, wallet selection, connection info
- `src/hooks/useConnect.ts` - **CONSOLIDATED**: Connection and disconnection management
- `src/hooks/useSwitchChain.ts` - **CONSOLIDATED**: Chain switching with validation and ensurance
- `src/hooks/useBalance.ts` - Token balance queries with caching
- `src/hooks/useTransaction.ts` - Multi-chain transaction support
- `src/hooks/usePublicProvider.ts` - dApp RPC provider for read operations
- `src/hooks/useWalletProvider.ts` - Wallet RPC provider for write operations
- `src/hooks/useConfig.ts` - Modal control and configuration access
- `src/hooks/useTheme.ts` - Theme management with persistence
- `src/hooks/useWalletEvents.ts` - Unified event subscriptions
- `src/hooks/useSSR.ts` - SSR utilities and hydration helpers

### Provider & Context
- `src/WalletMeshProvider.tsx` - Main provider setup
- `src/WalletMeshContext.tsx` - React context definition
- `src/hooks/internal/useStore.ts` - Simplified Zustand store integration

### Components
- `src/components/WalletMeshModal.tsx` - Modal UI
- `src/components/ConnectButton.tsx` - Pre-built connect button
- `src/components/WalletMeshErrorBoundary.tsx` - Error boundary

## Migration Guide

### Hook Consolidation Migration

**useConnect + useDisconnect → useConnect**
```typescript
// Old (separate hooks)
const { connect } = useConnect();
const { disconnect } = useDisconnect();

// New (consolidated)
const { connect, disconnect } = useConnect();
```

**Multiple account hooks → useAccount**
```typescript
// Old (multiple hooks)
const address = useAddress();
const chainId = useChain();
const isConnected = useIsConnected();
const wallet = useWallet();
const selectedWallet = useSelectedWallet();

// New (single hook)
const { 
  address, 
  chainId, 
  isConnected, 
  wallet, 
  selectedWallet 
} = useAccount();
```

**useSwitchChain + useEnsureChain → useSwitchChain**
```typescript
// Old (separate hooks)
const { switchChain } = useSwitchChain();
const { ensureChain } = useEnsureChain();

// New (consolidated)
const { switchChain, ensureChain } = useSwitchChain();
```

### Event Handling Simplification
```typescript
// Old (complex event management)
useWalletEvent('accountsChanged', handler);
const { pause, resume } = useMultipleWalletEvents({
  'connection:established': handler,
  'chain:switched': handler,
});

// New (unified interface)
const { subscribe, unsubscribe } = useWalletEvents();
useEffect(() => {
  const unsubs = [
    subscribe('connection:established', handler),
    subscribe('chain:switched', handler),
  ];
  return () => unsubs.forEach(u => u());
}, []);
```

## Simplified Architecture Benefits

### Developer Experience Improvements
- **Reduced Complexity**: 10 hooks instead of 20+ reduces cognitive load
- **Familiar Patterns**: Consolidated hooks follow wagmi-style patterns developers expect
- **Fewer Imports**: Single imports provide multiple related functions
- **Better Discoverability**: Related functionality grouped together logically
- **Simpler State Management**: 3 state slices instead of 5 for easier debugging

### Performance Benefits
- **Fewer Hook Calls**: Reduced React overhead from fewer hook invocations
- **Optimized Re-renders**: Consolidated state reduces unnecessary component updates
- **Smaller Bundle**: Removed enterprise-specific features reduce package size
- **Better Tree Shaking**: Cleaner exports enable better dead code elimination

### Maintenance Benefits
- **Single Source of Truth**: Related functionality in one place reduces bugs
- **Easier Testing**: Fewer hooks to mock and test in isolation
- **Clearer Documentation**: Consolidated APIs are easier to document and understand
- **Reduced Duplication**: Merged hooks eliminate duplicate logic and interfaces

## Future Enhancements

### Planned Features
- [ ] React Server Components support
- [ ] Improved bundle size optimization  
- [ ] Built-in transaction queue management
- [ ] Enhanced multi-chain balance aggregation
- [ ] Wallet connect v2 integration

### Performance Improvements
- [ ] Virtual scrolling for large wallet lists
- [ ] Lazy loading of wallet icons
- [ ] Web worker for heavy computations
- [ ] Optimistic UI updates

## Interface Consolidation Guidelines

### Overview
Modal React has been systematically audited to eliminate duplicate interface definitions and establish single sources of truth for shared types. When working with interfaces, follow these guidelines to prevent future duplication.

### Interface Naming and Organization

#### **Established Single Sources of Truth**
- **WalletMeshContextValue**: Use `types.ts` - public React context interface with comprehensive features
- **InternalContextValue**: Use `WalletMeshContext.tsx` - internal context with basic client access
- **ModalError**: Use `@walletmesh/modal-core` - core error interface (imported)
- **ReactModalError**: Use `types.ts` - React-specific error with recovery action hints
- **ConnectionResult**: Use `@walletmesh/modal-core` - core connection result (imported)
- **ReactConnectionResult**: Use `hooks/useConnect.ts` - React-specific connection result

#### **Interface Location Guidelines**
1. **Public React API interfaces**: Place in `src/types.ts`
2. **Hook-specific interfaces**: Place in corresponding hook file (e.g., `hooks/useConnect.ts`)
3. **Internal component interfaces**: Use component-specific naming (e.g., `InternalContextValue`)
4. **Core re-exports**: Import from `@walletmesh/modal-core` and re-export in `src/index.ts`

### Preventing Duplication

#### **Before Creating New Interfaces**
1. **Search first**: Use `rg "interface.*<InterfaceName>" --type ts` to find existing definitions
2. **Check core imports**: Look for existing interfaces in `@walletmesh/modal-core`
3. **Review exports**: Check `src/index.ts` for existing type exports
4. **Consider extensions**: Determine if you can extend core interfaces instead of creating new ones

#### **When You Find Duplicates**
1. **Identify the canonical version**: Choose the most comprehensive or widely-used definition
2. **Rename specialized versions**: Use descriptive prefixes to indicate their React-specific purpose
3. **Update imports**: Ensure all files import from the canonical source
4. **Maintain re-exports**: Keep clean re-exports in `src/index.ts`
5. **Test thoroughly**: Run full test suite to ensure no breaking changes

#### **Naming Conventions for Specialized Interfaces**
- **React-specific**: `React<InterfaceName>` (e.g., `ReactModalError`, `ReactConnectionResult`)
- **Hook-specific**: `Use<HookName><Suffix>` (e.g., `UseConnectReturn`, `UseAccountReturn`)
- **Internal component**: `Internal<InterfaceName>` (e.g., `InternalContextValue`)
- **Context-specific**: `<Context><InterfaceName>` (e.g., `WalletMeshContextValue`)

### Common Patterns

#### **Core Interface Extensions**
When extending modal-core interfaces for React-specific features:
```typescript
// Import core interface
import type { ModalError } from '@walletmesh/modal-core';

// Extend with React-specific properties
export interface ReactModalError extends Omit<ModalError, 'data'> {
  data?: {
    action?: 'retry' | 'select-different' | 'close';
    [key: string]: unknown;
  };
}
```

#### **Proper Re-exports**
```typescript
// Good - Clear separation of core vs React-specific types
export type {
  // Core types (re-exported for convenience)
  WalletInfo,
  ChainType,
  ChainId,
  ModalError,
  ConnectionResult,
} from '@walletmesh/modal-core';

// React-specific types
export type {
  ReactModalError,
  ReactConnectionResult,
  WalletMeshContextValue,
  UseConnectReturn,
} from './local/types.js';
```

### Hook Interface Patterns

#### **Hook Return Types**
All hooks should have well-defined return type interfaces:
```typescript
export interface UseConnectReturn {
  connect: (walletId?: string, options?: ConnectOptions) => Promise<void>;
  wallets: WalletInfo[];
  status: ConnectionState;
  isConnecting: boolean;
  error: Error | null;
  // ... other properties
}

export function useConnect(): UseConnectReturn {
  // Implementation
}
```

#### **Hook Options Types**
Define clear option interfaces for configurable hooks:
```typescript
export interface ConnectOptions {
  chainId?: ChainId;
  showModal?: boolean;
  onProgress?: (progress: number) => void;
}
```

### Context Interface Patterns

#### **Public vs Internal Context Interfaces**
- **Public**: `WalletMeshContextValue` - Rich interface for consumers
- **Internal**: `InternalContextValue` - Minimal interface for provider implementation

#### **Context Value Consistency**
Ensure context interfaces align with actual context values:
```typescript
// Provider implementation should match interface exactly
export const WalletMeshContext = React.createContext<InternalContextValue | null>(null);
```

### Maintenance

#### **Regular Audits**
- Search for duplicate interface names: `rg "^export interface.*<CommonName>" --type ts`
- Check for naming conflicts in exports
- Review new interfaces during code reviews
- Ensure core interface imports are up to date

#### **Code Review Guidelines**
- Verify new interfaces don't duplicate existing ones
- Ensure proper naming conventions (React prefixes for React-specific interfaces)
- Check that core interfaces are imported rather than redefined
- Validate that hook return types are properly defined
- Ensure context interfaces match implementation

#### **Testing Interface Changes**
- Run full test suite: `pnpm test`
- Verify TypeScript compilation: `pnpm type-check`
- Check that all exports work correctly
- Test both internal and public interface usage

### Core vs React Interface Guidelines

#### **When to Import from Core**
- Basic types: `WalletInfo`, `ChainType`, `ChainId`
- Error interfaces: `ModalError` (extend to `ReactModalError` if needed)
- Connection types: `ConnectionResult` (extend to `ReactConnectionResult` if needed)
- Configuration types: `WalletMeshConfig`

#### **When to Define React-Specific Interfaces**
- Hook return types and options
- React context values
- Component prop interfaces
- React-specific extensions of core interfaces

#### **Interface Documentation**
- All public interfaces should have TSDoc comments
- Document React-specific extensions and their purposes
- Provide usage examples for complex interfaces
- Keep core interface documentation in modal-core

Remember: This package is actively maintained. Always check for the latest patterns and best practices in the documentation.