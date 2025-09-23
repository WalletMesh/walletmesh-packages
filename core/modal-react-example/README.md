# @walletmesh/modal-react-example

A comprehensive React example application demonstrating all features and hooks provided by `@walletmesh/modal-react`. This application serves as both a development testbed and an interactive reference implementation for developers integrating WalletMesh into their React applications.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to http://localhost:1234
```

## 📋 Available Commands

```bash
# Development
pnpm dev                # Start development server with hot reload
pnpm dev:clean          # Clean build dependencies and start fresh

# Building
pnpm build              # Build for production
pnpm preview           # Preview production build

# Code Quality
pnpm type-check        # TypeScript type checking
pnpm lint              # Code linting with Biome
pnpm lint:fix          # Auto-fix linting issues
pnpm format:fix        # Auto-format code

# Testing
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm coverage          # Generate test coverage report

# Documentation
pnpm docs              # Generate TypeDoc documentation
```

## 🎯 What This Example Demonstrates

This example showcases **comprehensive multi-chain wallet integration** focusing on **EVM and Solana** blockchains:

- **Dual-Chain Support** - Simultaneous EVM and Solana wallet connections
- **Chain-Specific Features** - Tailored UI and functionality for each blockchain
- **Provider Management** - Public vs Wallet provider comparison and usage
- **Advanced Event Handling** - Real-time event monitoring across chains
- **Transaction Management** - Chain-specific transaction forms and handling
- **Balance Display** - Multi-chain balance queries with token support
- **Wallet Discovery** - Enhanced filtering and search across chains
- **Connection Management** - Multiple wallet sessions and switching
- **Developer Tools** - DevMode features and session debugging

## 🧪 Interactive Demonstrations

The application features **10+ comprehensive demo components** showcasing EVM and Solana integration:

### 🔄 Multi-Chain Connection

#### **DualWalletDemo**
Demonstrates simultaneous EVM and Solana wallet connections.

**Featured Hooks:**
- `useEvmWallet` - EVM wallet management
- `useSolanaWallet` - Solana wallet management
- `useAccount` - Unified account information

**Key Features:**
- Simultaneous dual-chain connections
- Independent session management
- Chain-specific wallet status
- Session switching capabilities
- Real-time connection status for both chains

#### **ConnectionManagementDemo**
Advanced connection patterns with multiple wallets.

**Featured Hooks:**
- `useConnect` - Connection management with wallet selection
- `useAccount` - Account state and wallet info
- `useWalletEvents` - Connection event monitoring

**Key Features:**
- Multiple wallet support
- Connection progress tracking
- Auto-reconnection handling
- Error recovery patterns
- Session persistence options

### 🔌 Provider Management

#### **ProviderComparisonDemo**
Compare and understand usePublicProvider vs useWalletProvider.

**Featured Hooks:**
- `usePublicProvider` - dApp's RPC infrastructure access
- `useWalletProvider` - Wallet's RPC connection
- `useEvmWallet` & `useSolanaWallet` - Chain-specific providers

**Key Features:**
- Side-by-side provider comparison
- Chain-specific provider testing (EVM & Solana)
- Real-time capability detection
- Performance comparison
- Use case demonstrations

#### **ChainSwitchingDemo**
Chain switching and validation for EVM and Solana.

**Featured Hooks:**
- `useSwitchChain` - Chain switching with validation
- `useAccount` - Current chain information
- `useSupportedChains` - Available chains list

**Key Features:**
- EVM network switching (Ethereum, Polygon, etc.)
- Solana cluster switching (Mainnet, Devnet, Testnet)
- Chain validation and compatibility
- Error handling for unsupported chains
- Visual chain indicators

### 📡 Event & Transaction Management

#### **EventHandlingDemo**
Advanced multi-chain event monitoring and handling.

**Featured Hooks:**
- `useWalletEvents` - Unified event subscription
- `useEvmWallet` & `useSolanaWallet` - Chain-specific events
- `useAccount` - Connection state events

**Key Features:**
- Real-time event monitoring for EVM and Solana
- Event filtering by chain type
- Event statistics and analytics
- Test event triggers for debugging
- Event log export functionality
- Chain-specific event visualization

#### **TransactionDemo**
Multi-chain transaction handling with chain-specific forms.

**Featured Hooks:**
- `useTransaction` - Unified transaction sending
- `useEvmWallet` & `useSolanaWallet` - Chain-specific transaction handling
- `useAccount` - Current chain context

**Key Features:**
- EVM transaction forms (ETH send, contract interaction)
- Solana transaction forms (SOL send, program interaction)
- Chain-specific unit conversion (wei/lamports)
- Transaction history tracking
- Status monitoring and error handling

### 💰 Balance & Wallet Discovery

#### **BalanceDisplayDemo**
Multi-chain balance display with token support.

**Featured Hooks:**
- `useBalance` - Balance queries with caching
- `useEvmWallet` & `useSolanaWallet` - Chain-specific balance context
- `useAccount` - Current wallet information

**Key Features:**
- Native token balances (ETH/SOL)
- ERC-20 and SPL token support
- Auto-refresh with configurable intervals
- Balance history tracking
- Chain-specific token lists
- Multi-chain balance aggregation

#### **WalletDiscoveryDemo**
Enhanced wallet discovery with advanced filtering.

**Featured Hooks:**
- `useConnect` - Wallet discovery and connection
- `useEvmWallet` & `useSolanaWallet` - Connection status
- `useAccount` - Current connection state

**Key Features:**
- Chain-specific wallet filtering (EVM/Solana/Multi-chain)
- Search by wallet name or ID
- Sort by name, chain count, or connection status
- Popular wallet examples with install links
- Connection status indicators
- Real-time discovery statistics

### 🖥️ SSR & Client Utilities

#### **SSRDemo**
Server-side rendering safe patterns and client-only operations.

**Featured Hook:**
- `useSSR` - Comprehensive SSR detection with server/client/mount/hydration states

**Key Features:**
- Environment detection (server vs client)
- Mount and hydration state tracking
- Safe browser API usage patterns
- Progressive enhancement demonstrations
- Deferred rendering for performance
- SSR-safe value handling

#### **BrowserUtilitiesDemo**
Browser-specific utilities and responsive design patterns.

**Featured Hooks:**
- `useSSR` - For safe browser API access
- `useErrorBoundary` - Error capture and recovery

**Key Features:**
- Manual storage management demonstrations
- Responsive design with native media query API
- Device and environment detection
- Error boundary testing and recovery
- Browser capability detection

### 🗄️ Store & State Management

#### **StoreAccessDemo**
Advanced state management and store access patterns.

**Featured Hooks:**
- `useWalletMeshContext` - Access to WalletMesh client and context
- `useAccount` - Account state management
- `useModal` - Modal state control
- `useConfig` - Configuration access

**Key Features:**
- Store state snapshots and inspection
- Client service access and debugging
- Configuration introspection
- State observation patterns
- Modal state manipulation

### ⚡ Performance Monitoring

#### **PerformanceMonitoringDemo**
Comprehensive performance monitoring and optimization patterns.

**Featured Hooks:**
- `useWalletEvents` - Event performance monitoring
- `useWalletMeshContext` - Client performance access
- `useAccount` - State change performance tracking

**Key Features:**
- Real-time render performance monitoring
- Memory usage tracking and optimization
- Event processing latency measurement
- Connection latency analysis
- Performance recommendations and ratings
- Automated performance testing
- Optimization tools and garbage collection
- Performance logging with categorization

## 🏗️ Architecture & Patterns

### Component Organization

```
src/
├── components/
│   ├── demos/                    # New comprehensive hook demos
│   │   ├── ConnectionProgressDemo.tsx
│   │   ├── DisconnectOptionsDemo.tsx
│   │   ├── ProviderUtilitiesDemo.tsx
│   │   ├── ChainValidationDemo.tsx
│   │   ├── EventSubscriptionDemo.tsx
│   │   ├── SSRDemo.tsx
│   │   ├── BrowserUtilitiesDemo.tsx
│   │   ├── StoreAccessDemo.tsx
│   │   ├── PerformanceMonitoringDemo.tsx
│   │   └── __tests__/           # Comprehensive unit tests
│   └── [existing components]    # Original demo components
├── styles/
│   ├── DemoCard.module.css      # Professional demo styling
│   └── App.module.css           # Enhanced app styling with tabs
└── test-utils/
    └── testHelpers.tsx          # Testing utilities
```

### Design System

The example uses a **consistent design system** with:

- **CSS Modules** for scoped styling
- **Responsive design** with mobile, tablet, and desktop breakpoints
- **Professional color scheme** with semantic color usage
- **Interactive elements** with hover states and transitions
- **Status indicators** using color-coded badges and icons
- **Code examples** with syntax highlighting

### Testing Strategy

**Comprehensive test coverage** includes:

- **Unit tests** for all demo components
- **Hook integration testing** with mock providers
- **User interaction testing** with fireEvent and waitFor
- **Error scenario testing** for robust error handling
- **State management testing** with mock stores

## 🎨 UI/UX Features

### Tab Navigation System
- **Core Hook Demos** - Interactive demonstrations of all hooks
- **Existing Features** - Original components and functionality
- Clean, professional tab interface with hover effects

### Interactive Elements
- **Real-time status displays** with color-coded indicators
- **Progress bars** for connection and loading states
- **Event logging** with timestamps and categorization
- **Code examples** showing proper hook usage
- **Error displays** with recovery suggestions

### Responsive Design
- **Mobile-first** responsive layout
- **Tablet and desktop** optimized views
- **Media query demonstrations** showing responsive behavior
- **Touch-friendly** interactive elements

## 🔧 Development Guidelines

### Adding New Demos

1. **Create component** in `src/components/demos/`
2. **Add tests** in `src/components/demos/__tests__/`
3. **Import in App.tsx** and add to appropriate tab
4. **Update this README** with demo description

### Testing New Features

```bash
# Run specific demo tests
pnpm test -- ConnectionProgressDemo.test.tsx

# Run all demo tests
pnpm test -- __tests__

# Generate coverage
pnpm coverage
```

### Styling Guidelines

- Use **CSS Modules** for component styles
- Follow **BEM-like** naming conventions
- Ensure **responsive design** compatibility
- Use **semantic colors** from the design system

## 📚 Educational Value

This example serves as:

- **Reference Implementation** - Best practices for React + WalletMesh
- **Interactive Documentation** - Live examples of every hook
- **Development Tool** - Testing and debugging wallet integration
- **Learning Resource** - Comprehensive patterns and use cases

Each demo includes:
- ✅ **Live interactive controls** for testing hook behavior
- ✅ **Real-time status displays** showing hook return values  
- ✅ **Comprehensive logging** for understanding event flows
- ✅ **Code examples** demonstrating proper usage patterns
- ✅ **Error handling demonstrations** showing robust patterns
- ✅ **Professional styling** for polished developer experience

## 🚦 Getting Started with Multi-Chain Integration

After exploring the demos, developers can:

1. **Choose your chains** - Start with EVM, Solana, or both
2. **Copy integration patterns** - Use demo code as templates
3. **Test wallet connections** - Try different wallet providers
4. **Implement chain-specific features** - Leverage unique capabilities
5. **Monitor events** - Use the event demo for debugging
6. **Handle transactions** - Follow chain-specific patterns
7. **Manage balances** - Query and display multi-chain balances

### Quick Integration Examples

**EVM Integration:**
```typescript
import { useEvmWallet, EVMConnectButton } from '@walletmesh/modal-react';

function EvmApp() {
  const { isConnected, address, chain } = useEvmWallet();
  return <EVMConnectButton showAddress showChain />;
}
```

**Solana Integration:**
```typescript
import { useSolanaWallet, SolanaConnectButton } from '@walletmesh/modal-react';

function SolanaApp() {
  const { isConnected, address, chain } = useSolanaWallet();
  return <SolanaConnectButton showAddress showCluster />;
}
```

**Dual-Chain Support:**
```typescript
function MultiChainApp() {
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  
  return (
    <>
      <EVMConnectButton />
      <SolanaConnectButton />
    </>
  );
}

## 📖 Related Documentation

- **[@walletmesh/modal-react](../modal-react/README.md)** - Core React package documentation
- **[@walletmesh/modal-core](../modal-core/README.md)** - Core WalletMesh functionality
- **[TypeScript Examples](../modal-react/docs/)** - Generated API documentation

## 🤝 Contributing

When contributing to this example:

1. **Add tests** for new demo components
2. **Update README** with new feature descriptions
3. **Follow coding standards** (lint, format, type-check)
4. **Ensure responsive design** compatibility
5. **Include proper error handling** in demos

## 📄 License

This example is part of the WalletMesh packages and follows the same license as the main project.