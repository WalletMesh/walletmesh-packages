# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

This is a React example application demonstrating the integration of `@walletmesh/modal-react`. It serves as both a development testbed and a reference implementation for developers using the WalletMesh modal system.

## Development Commands

### Essential Commands
- **Start development**: `pnpm dev` - Builds dependencies and starts Vite dev server on http://localhost:1234
- **Clean development**: `pnpm dev:clean` - Clean builds dependencies before starting
- **Build**: `pnpm build` - Full TypeScript and Vite production build
- **Preview build**: `pnpm preview` - Preview production build locally
- **Type check**: `pnpm type-check` - Verify TypeScript types
- **Lint**: `pnpm lint` - Check code with biome
- **Format**: `pnpm format:fix` - Auto-format code with biome
- **Test**: `pnpm test` - Run tests with Vitest (no tests currently configured)

### Development Workflow
1. This package depends on workspace packages `@walletmesh/jsonrpc`, `@walletmesh/discovery`, `@walletmesh/modal-core` and `@walletmesh/modal-react`
2. The `dev` command automatically builds these dependencies in the correct order:
   - `@walletmesh/jsonrpc` (base dependency)
   - `@walletmesh/discovery` (depends on jsonrpc)
   - `@walletmesh/modal-core` (depends on jsonrpc and discovery)
   - `@walletmesh/modal-react` (depends on modal-core)
3. Use `dev:clean` if you encounter stale build artifacts

## Architecture and Key Components

### Application Structure
- **`src/main.tsx`**: Entry point that configures WalletmeshProvider with wallet configurations
- **`src/App.tsx`**: Main component demonstrating all available hooks and features
- **`vite.config.ts`**: Vite configuration with React plugin, runs on port 1234

### Key Integration Points

**WalletmeshProvider Configuration** (in main.tsx):
- Wraps the entire app with provider using new headless architecture
- Configures app metadata (appName, appDescription, appUrl)
- Sets supported chains and wallets by name
- Enables auto-injection of modal component

**Available Hooks** (demonstrated in App.tsx):
- `useAccount()`: **CONSOLIDATED** - Account state, wallet selection, connection info, chain info
- `useConnect()`: **CONSOLIDATED** - Connection and disconnection management (includes `disconnect()`)
- `useConfig()`: Modal control and configuration access (includes modal open/close)
- `useWalletEvents()`: Unified event subscription interface
- `usePublicProvider()`: dApp RPC provider for read operations
- `useWalletProvider()`: Wallet RPC provider for write operations
- `useSwitchChain()`: **CONSOLIDATED** - Chain switching with validation (includes chain ensurance)
- `useBalance()`: Token balance queries with caching
- `useTransaction()`: Multi-chain transaction support
- `useTheme()`: Theme management with persistence

### Configuration Pattern
The new headless configuration:
```typescript
{
  appName: string,
  appDescription?: string,
  appUrl?: string,
  chains?: ChainType[],
  wallets?: string[],  // Wallet names like 'evm-wallet-1', 'evm-wallet-2', 'solana-wallet-1'
  autoInjectModal?: boolean,
}
```

### Important Implementation Details
- Uses React 19.1.1 with strict mode (updated for compatibility with modal-react v0.1.0)
- TypeScript with strict configuration
- Vite for development and building with optimized bundle splitting
- CSS modules are configured but currently uses inline styles
- No router - single page demonstration app
- Lazy-loaded Aztec components for improved bundle size
- Manual chunk splitting for better performance

## Testing Considerations
- Test infrastructure is configured but no tests are currently implemented
- When adding tests, use Vitest and follow patterns from other packages
- Test file pattern: `*.test.ts` or `*.test.tsx`
- Tests were removed during the simplification project as they were testing obsolete components

## Common Development Tasks

### Adding New Wallet Support
1. Import wallet configuration from `@walletmesh/modal-core`
2. Add to wallets array in `main.tsx`
3. Ensure wallet icon is a valid data URI or URL

### Testing Hook Integration
1. Modify `App.tsx` to use specific hooks
2. The app displays comprehensive state for debugging
3. Use browser DevTools to inspect state changes

### Debugging Connection Issues
- Check console for detailed logs
- Use the state display section in the UI
- Verify wallet configurations in `main.tsx`
- Ensure dependent packages are built (`pnpm dev` handles this)

## Hook Consolidation Pattern (v0.1.0+)

The example demonstrates the new consolidated hook architecture:

### Old vs New Pattern
```typescript
// OLD: Multiple separate hooks
const address = useAddress();
const { chainId } = useChain();
const isConnected = useIsConnected();
const wallet = useWallet();
const { disconnect } = useDisconnect();
const { open } = useModal();

// NEW: Consolidated hooks
const { address, chainId, isConnected, wallet } = useAccount();
const { disconnect } = useConnect(); // disconnect is now in useConnect
const { open } = useConfig(); // modal control is now in useConfig
```

### Migration Benefits
- **Reduced Complexity**: 10 hooks instead of 20+ reduces cognitive load
- **Better Performance**: Fewer hook calls and optimized re-renders
- **Familiar Patterns**: Follows wagmi-style API conventions
- **Single Source of Truth**: Related functionality grouped together

## Bundle Optimization

### Performance Features
- **Lazy Loading**: Aztec components are lazy-loaded with Suspense
- **Manual Chunks**: Vite configured for optimal bundle splitting:
  - `react-vendor`: React core libraries
  - `walletmesh-core`: Core WalletMesh packages
  - `walletmesh-react`: React-specific packages
  - `aztec-barretenberg`: Large Aztec dependencies
  - `solana-web3`: Solana dependencies

### Bundle Size Management
- Large Aztec dependencies (barretenberg) are split into separate chunks
- Dynamic imports reduce initial bundle size
- Suspense provides loading states for async components

## Port Configuration
The development server runs on port 1234 (configured in vite.config.ts). This differs from the default Vite port to avoid conflicts with other packages in the monorepo.