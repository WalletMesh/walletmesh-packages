# Modal Core - CLAUDE.md

This file provides detailed implementation information for the Modal Core package (@walletmesh/modal-core).

## Package Overview

Modal Core is a sophisticated wallet connection modal system that provides a framework-agnostic UI for connecting web applications to blockchain wallets. It features runtime validation, resource management, comprehensive error handling, and extensive framework adapter support.

## Key Implementation Details

### Modern Session-Based Architecture

The current implementation uses a session-based architecture that provides better abstraction and multi-wallet support:

**Key Concepts:**
- **Sessions**: Primary abstraction containing wallet, chain, and account information
- **SessionManager**: Handles session lifecycle, provider management, and state transitions
- **SimplifiedWalletMeshState**: Uses a simplified 3-slice architecture (ui, connections, transactions)
- **Zustand Subscriptions**: Direct state subscriptions replace the EventEmitter pattern

**State Structure:**
```typescript
interface SimplifiedWalletMeshState {
  // UI State (includes discovery functionality)
  ui: {
    isOpen: boolean;
    currentView: 'wallet-selection' | 'connecting' | 'connected' | 'error';
    isLoading: boolean;
    error?: ModalError;
    isScanning: boolean;
    lastScanTime: number | null;
    discoveryErrors: string[];
  };
  
  // Connection State (consolidates sessions and wallets)
  connections: {
    activeSessions: SessionInfo[];
    availableWallets: WalletInfo[];
    discoveredWallets: WalletInfo[];
    activeSessionId: string | null;
    connectionStatus: ConnectionStatus;
    selectedWallet?: WalletInfo;
  };
  
  // Transaction State
  transactions: {
    pending: TransactionInfo[];
    confirmed: TransactionInfo[];
    failed: TransactionInfo[];
    activeTransaction?: TransactionInfo;
  };
}
```

**State Subscriptions (replaces event system):**
```typescript
// Subscribe to connection changes
modal.subscribe((state) => {
  if (state.connections.connectionStatus === 'connected') {
    console.log('Connected!', state.connections.selectedWallet);
  }
});

// Selective subscriptions for performance
modal.subscribe(
  (state) => state.connections.connectionStatus,
  (status) => console.log('Status:', status)
);

// Subscribe to UI state changes
modal.subscribe(
  (state) => state.ui.currentView,
  (view) => console.log('Current view:', view)
);

// Direct store access for advanced use
import { useWalletMeshStore } from '@walletmesh/modal-core';
const store = useWalletMeshStore.getState();
```

### Architecture
The package follows a layered architecture with 7 distinct layers:
1. **Public API Layer** - Clean consumer interface
2. **Validation Layer** - Runtime type safety with Zod schemas
3. **Factory Layer** - Component creation and configuration
4. **Implementation Layer** - Core component implementations
5. **Resource Management Layer** - Lifecycle and cleanup coordination
6. **Core Infrastructure Layer** - Foundational services
7. **Integration Layer** - Cross-component coordination

### Adapter/Provider Architecture

Modal Core uses a **two-layer separation** between connection and API:

**Adapters (Connection Layer)**:
- Handle HOW to connect to specific wallet implementations
- Manage transport mechanisms (popup, extension, mobile)
- Deal with wallet-specific protocols and quirks
- Examples: `MetaMaskAdapter`, `PhantomAdapter`, `AztecExampleWalletAdapter`

**Providers (API Layer)**:
- Implement blockchain-specific standards (EIP-1193, Solana Wallet Standard)
- Provide the programming interface for blockchain operations
- Handle methods like `sendTransaction`, `signMessage`, `getBalance`
- Examples: `EvmProvider`, `SolanaProvider`, `AztecProvider`

**Why This Separation**:
- **Code Reuse**: Multiple wallets can use the same provider implementation
- **Standards Compliance**: Providers cleanly implement blockchain standards
- **Clear Responsibilities**: Each layer has a single, well-defined purpose
- **Flexibility**: New wallets only need new adapters, can reuse providers

See `/core/modal-core/ADAPTER_PROVIDER_ARCHITECTURE.md` for detailed explanation.

### Composition-Based Architecture

Modal Core uses **composition over inheritance** throughout:

**Key Components Using Composition:**
- **WalletConnector**: Composed of strategy, state manager, event emitter, and logger
- **FrameworkAdapter**: Composed of render strategy, container manager, logger, and error handler

**Benefits:**
- **Testability**: All dependencies injected, enabling easy mocking
- **Flexibility**: Strategies can be changed at runtime
- **Maintainability**: No protected member coupling between classes
- **Extensibility**: New features added via strategies, not inheritance
- **SOLID Compliance**: Better separation of concerns

**Implementation Pattern:**
```typescript
// Composition pattern used throughout
class Component {
  constructor(
    private strategy: Strategy,
    private stateManager: StateManager,
    private eventEmitter: EventEmitter,
    private logger: Logger
  ) {}
}
```

### Simplified Service Architecture (`src/services/`)

Modal Core has undergone comprehensive service consolidation to reduce complexity and improve maintainability.

#### **Architecture Overview**
- **ServiceRegistry**: Central registry managing 4 consolidated services (reduced from 15, then further to 4)
- **Stateless Design**: Services provide pure business logic without state management
- **Dependency Injection**: Clean separation of concerns with proper dependency management
- **Framework Agnostic**: Used by all framework implementations (React, Vue, Svelte, etc.)
- **ChainServiceRegistry**: Specialized registry for blockchain-specific services

#### **Core Consolidated Services**

##### **1. ConnectionService** (`src/services/connection/ConnectionService.ts`)
**Consolidated functionality from 7 services:**
- Former ConnectionService: Connection lifecycle and validation
- Former AccountService: Account management and display
- Former SessionManagementService: Session lifecycle and analytics  
- Former ConnectionRecoveryService: Error recovery and retry logic
- Former WalletHealthService: Health monitoring and diagnostics
- Former ConnectionUIService: UI state and button management
- Former WalletPreferenceService: User preferences and wallet history

**Key capabilities:**
- Connection establishment and validation
- Account management with address formatting
- Session lifecycle management with analytics
- Automated error recovery with multiple strategies
- Health monitoring with performance metrics
- Progress tracking and user feedback
- UI state management for connection buttons and displays
- Wallet preference persistence and auto-connect functionality
- Usage history tracking and analytics

##### **2. ChainService** (`src/services/chain/ChainService.ts`)
**Consolidated functionality from 4 services:**
- Former ChainService: Chain management orchestration
- Former ChainRegistry: Chain configuration and lookup
- Former ChainValidator: Chain validation and compatibility
- Former ChainSwitcher: Chain switching logic

**Key capabilities:**
- Chain configuration management and lookup
- Chain validation and compatibility checking
- Chain switching with user confirmation
- Multi-chain validation workflows
- Chain mismatch analysis and recommendations

##### **3. TransactionService** (`src/services/transaction/TransactionService.ts`)
- Multi-chain transaction management
- Transaction validation and gas estimation
- Confirmation tracking and status monitoring
- Transaction history and filtering

##### **4. BalanceService** (`src/services/balance/BalanceService.ts`)
- Balance queries with caching and polling
- Token metadata fetching and formatting
- Multi-chain balance aggregation
- Native currency symbol resolution

##### **4. DAppRpcService** (`src/services/dapp-rpc/dAppRpcService.ts`)
- dApp RPC communication and integration
- JSON-RPC message handling and routing
- Cross-origin communication management
- Provider interface abstraction

### Core Components

#### **Modal Controller** (`src/internal/modal/controller.ts`)
- Central orchestrator for wallet connection flow
- Manages modal lifecycle, view transitions, and state coordination
- Integrates with error handling and recovery systems
- Entry point: `createModal()` factory function

#### **Runtime Validation System** (`src/schemas/`)
- Zod-based validation for all API boundaries
- Comprehensive coverage: wallets, configs, events, errors
- Critical files: `wallet.ts`, `connection.ts`, `configs.ts`
- Prevents invalid configurations before they cause issues

#### **Resource Management** (`src/internal/core/resources/`)
- Prevents memory leaks in long-running applications
- Key files: `resourceManager.ts`, `resourceRegistry.ts`, `baseResource.ts`
- Manages connections, subscriptions, timers, DOM elements
- Automatic cleanup with dependency tracking

#### **State Management** (`src/internal/state/`)
- Unified state store using Zustand directly
- Files: `store.ts`, `selectors.ts`, `subscriptions.ts`
- Session-based architecture with `SimplifiedWalletMeshState`
- No wrapper classes - direct Zustand usage
- Combines client and modal state in a single store

#### **Consolidated Business Logic Services** (`src/services/`)
- Framework-agnostic services that encapsulate business logic
- Used by all framework implementations (React, Vue, Svelte, etc.)
- **SIMPLIFIED ARCHITECTURE**: Reduced from 15 services to 4 core services (-73%)
- Key consolidated services:
  - **ConnectionService**: Unified connection management including account management, session management, recovery, health monitoring, UI state management, and user preferences
  - **ChainService**: Consolidated chain management including validation, registry, and switching functionality
  - **TransactionService**: Multi-chain transaction management with validation, gas estimation, and confirmation tracking
  - **BalanceService**: Balance queries with caching, polling, and token support
- All services extend AbstractService for consistent lifecycle management
- Services are stateless and provide pure business logic
- State coordination is handled by the ServiceRegistry and WalletMeshClient

#### **Enhanced Error System** (`src/internal/core/errors/`)
- **CRITICAL**: Always use `ErrorFactory` convenience methods instead of generic `Error` objects
- **ErrorFactory** (`errorFactory.ts`): Centralized error creation with 9 convenience methods
- Recovery strategies, retry logic, error sanitization
- Key files: `errorHandler.ts`, `recoveryManager.ts`, `retryManager.ts`, `errorFactory.ts`
- Global error coordination with context enrichment
- Categorized errors: connection, provider, wallet, general
- Fatal vs recoverable error classification for proper handling

#### **Framework Adapters** (`src/internal/adapters/`)
- Composition-based adapter architecture (no inheritance)
- Files: `FrameworkAdapter.ts`, `strategies/`, `core/`
- Key components:
  - `FrameworkAdapter.ts` - Main composed adapter class
  - `RenderStrategy` interface - Defines framework-specific rendering
  - `ReactRenderStrategy.ts` - React rendering implementation
  - `domRenderStrategy.ts` - Direct DOM rendering
  - `ContainerManager.ts` - DOM container lifecycle management
- Theme integration through strategies
- Framework-specific event handling
- Dependency injection for testability

#### **Transport System** (`src/internal/transports/`)
- Modular communication layer
- Specialized implementations: Chrome extension, popup window
- Base transport with connection resilience
- Message queuing and retry mechanisms

#### **View Navigation** (`src/internal/modal/views/`)
- Simple view navigation in `navigation.ts`
- Direct state updates without complex state machine
- `useViewNavigation` hook for component integration
- No ViewSystem class - simplified to direct navigation functions
- Supports transitions between walletSelection, connecting, connected, and error views

#### **Security System** (`src/security/`)
- Origin validation for cross-origin communication
- Rate limiting for API requests
- Session security management with proper timeouts
- Key files: `originValidation.ts`, `rateLimiting.ts`, `sessionSecurity.ts`
- Protects against malicious wallet connections and unauthorized access

#### **Discovery Services** (`src/discovery/`)
- **DiscoveryCoordinator**: Orchestrates wallet discovery across multiple protocols
- **BaseDiscoveryService**: Abstract base for discovery implementations
- **Chain-specific discovery services**: AztecDiscoveryService, EVMDiscoveryService, SolanaDiscoveryService
- Cross-origin wallet announcement and listening
- Wallet capability detection and validation

#### **Client Architecture** (`src/client/`)
- **WalletMeshClient**: Main client interface for wallet management
- **ConnectionManager**: Handles connection lifecycle and state transitions
- **EventSystem**: Manages event subscriptions and notifications
- **TransportDiscoveryService**: Discovery through transport protocols
- Race condition handling and memory leak prevention

### Important Files and Locations

#### **Public API** (`src/api/`)
- `modal.ts` - Main modal API exports
- `adapters.ts` - Framework adapter API
- `connectors.ts` - Wallet connector API
- `errors.ts` - Error handling API
- `factories/` - Factory function exports

#### **Entry Points**
- `src/index.ts` - Main package entry point
- `src/api/modal.ts` - Modal-specific API
- `src/types.ts` - Core type definitions

#### **Configuration**
- `src/schemas/configs.ts` - Transport and adapter configuration schemas
- `src/internal/core/di/` - Dependency injection configuration
- `src/internal/theme/` - Theming system

#### **Testing**
- Test files follow pattern: `ComponentName.{type}.test.ts`
- Types: `.test.ts`, `.core.test.ts`, `.edge.test.ts`, `.integration.test.ts`
- Integration tests: `src/internal/core/integration/`
- Test utilities: `src/internal/testing/`

## Provider Entry Points

Modal Core separates provider implementations into dedicated entry points to avoid unnecessary dependencies:

### **Main Export** (`@walletmesh/modal-core`)
- Core functionality without chain-specific providers
- No Aztec, EVM, or Solana-specific dependencies required
- Includes base classes, interfaces, and chain-agnostic utilities

### **Provider-Specific Exports**
- **`@walletmesh/modal-core/providers/aztec`**
  - `AztecProvider` class and Aztec-specific types
  - Requires `@aztec/*` packages as peer dependencies
  - Only needed for Aztec blockchain support

- **`@walletmesh/modal-core/providers/evm`**
  - `EvmProvider` class and EVM wallet adapters
  - Includes: MetaMaskAdapter, CoinbaseAdapter, ObsidionAdapter
  - Generic EVM adapter utilities

- **`@walletmesh/modal-core/providers/solana`**
  - `SolanaProvider` class and Solana wallet adapters
  - Includes: PhantomAdapter
  - Generic Solana adapter utilities

### **Usage Examples**
```typescript
// Basic usage (no chain-specific deps)
import { createWalletMeshClient, ChainType } from '@walletmesh/modal-core';

// When you need specific providers
import { AztecProvider } from '@walletmesh/modal-core/providers/aztec';
import { EvmProvider, MetaMaskAdapter } from '@walletmesh/modal-core/providers/evm';
import { SolanaProvider, PhantomAdapter } from '@walletmesh/modal-core/providers/solana';
```

## Package-Specific Guidelines

### **Code Organization**
- Public APIs in `src/api/` with re-exports from `src/internal/`
- Implementation details in `src/internal/`
- Schemas for validation in `src/schemas/`
- Examples in `src/examples/`

### **Naming Conventions**

Modal Core follows strict naming conventions enforced by the Biome linter:

#### **Core Naming Rules**

**Directory Structure**:
- Directories: `kebab-case` (e.g., `chrome-extension/`, `popup-window/`)
- Single-word directories remain lowercase (e.g., `adapters/`, `utils/`)
- `__mocks__` directories are **not allowed** - mocks must be co-located with implementations

**File Naming**:
- Class files: `PascalCase.ts` matching the exported class name
- Utility/function files: `camelCase.ts`
- Test files: `ComponentName.{type}.test.ts` (e.g., `.test.ts`, `.core.test.ts`)
- Mock files: `ComponentName.mock.ts` co-located with the component being mocked
  - Example: `DomAdapter.ts` and `domAdapter.mock.ts` in the same directory
  - NOT: `mockDomAdapter.ts` or files in `__mocks__/` directories

**Code-Level Conventions**:
- **Classes/Interfaces/Types**: `PascalCase`
- **Variables/Functions/Methods**: `camelCase`
- **Private Members**: NO underscore prefix (use TypeScript's `private` keyword)
- **Constants**: 
  - Primitives: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES = 3`)
  - Objects: `camelCase` (e.g., `defaultConfig = {}`)
  - Frozen objects: Context-dependent
- **Primitive Types**: Always lowercase (`string`, `number`, `boolean`)
- **Event Handlers**: Prefix with `handle` or `on` (e.g., `handleClick`, `onConnection`)

#### **Common Naming Convention Issues**

**File Naming Violations**:
- **Issue**: Files using incorrect casing (e.g., `kebab-case` for class files)
- **Solution**: Rename files manually and update imports
- **Prevention**: Name files according to their primary export

**Constant Naming**:
- **Issue**: Primitive constants not using `UPPER_SNAKE_CASE`
- **Solution**: Update constants to use uppercase
- **Prevention**: Use uppercase for primitives, camelCase for objects

**Primitive Type Issues**:
- **Issue**: Using `String`, `Number`, `Boolean` instead of lowercase
- **Solution**: Replace with lowercase primitive types
- **Prevention**: Always use lowercase primitive types

**Private Member Naming**:
- **Issue**: Using underscore prefix for private members
- **Solution**: Remove underscore, use TypeScript's `private` keyword
- **Prevention**: Configure IDE to not add underscore prefixes

### **Error Handling Patterns - MANDATORY**

**CRITICAL**: Never use generic `new Error()` - always use ErrorFactory convenience methods

#### **Required ErrorFactory Usage**
```typescript
// ✅ CORRECT - Use ErrorFactory convenience methods
import { ErrorFactory } from '../core/errors/errorFactory.js';

// Configuration errors (fatal)
throw ErrorFactory.configurationError('Invalid wallet config', { missingField: 'apiKey' });
throw ErrorFactory.invalidAdapter('Adapter requires browser environment', 'ReactAdapter');
throw ErrorFactory.invalidTransport('Unsupported transport type', 'WebRTC');

// Runtime errors (recoverable)
throw ErrorFactory.connectionFailed('Wallet connection failed', { attempt: 3 });
throw ErrorFactory.renderFailed('Component failed to render', 'WalletModal');
throw ErrorFactory.transportError('Connection lost', 'timeout');

// Network/communication errors
throw ErrorFactory.messageFailed('Failed to send request', { data });
throw ErrorFactory.transportDisconnected('Connection closed unexpectedly');

// UI/lifecycle errors
throw ErrorFactory.mountFailed('Failed to mount to DOM', '#wallet-container');
throw ErrorFactory.cleanupFailed('Resource cleanup failed', 'removeEventListeners');
```

#### **Error Categories and Guidelines**
- **Configuration errors**: Use `configurationError()`, `invalidAdapter()`, `invalidTransport()` (fatal)
- **Connection errors**: Use `connectionFailed()`, `transportError()`, `transportDisconnected()`
- **Network errors**: Use `messageFailed()`, `transportError()`
- **UI errors**: Use `renderFailed()`, `mountFailed()`, `cleanupFailed()`

#### **IMPORTANT: Connector Error Handling**
**Connectors should use ErrorFactory.connectorError() methods** for standardized, client-friendly error handling while maintaining maximum flexibility.

**Why Connectors Use ErrorFactory Connector Methods:**
- **Client Compatibility**: Standardized error structure with `component: 'connector'` for reliable client detection
- **Automatic Recovery Hints**: Smart pattern detection provides actionable guidance to users
- **Maximum Flexibility**: Support for custom codes, data, and wallet-specific information
- **Performance**: Simple object creation with no overhead while maintaining consistency
- **Context Preservation**: Operation context and original error preservation for debugging

**Connector Error Patterns:**
```typescript
// ✅ PREFERRED - ErrorFactory connector methods for standard errors
import { ErrorFactory } from '../core/errors/errorFactory.js';

// Simple connector error
throw ErrorFactory.connectorError('metamask', 'Failed to connect to MetaMask');

// With recovery hint and context
throw ErrorFactory.connectorError(
  'walletconnect',
  'Cannot switch to chain',
  'UNSUPPORTED_CHAIN',
  { recoveryHint: 'switch_chain', operation: 'switchChain' }
);

// Automatic pattern detection from wallet errors
try {
  await window.ethereum.request({method: 'eth_requestAccounts'});
} catch (error) {
  throw ErrorFactory.fromConnectorError('metamask', error, 'connect');
  // Automatically detects: user rejection, wallet locked, not installed, etc.
}

// ✅ ALTERNATIVE - Direct ModalError creation for highly specific cases
const modalError: ModalError = {
  code: 'wallet_specific_error_code',
  message: 'Wallet-specific error message',
  category: 'wallet',
  fatal: false,
  data: { 
    component: 'connector', // Include for client compatibility
    walletId: 'custom-wallet',
    walletSpecificData: true 
  }
};
```

#### **Benefits of ErrorFactory**
- ✅ Consistent error categorization and structure
- ✅ Automatic fatal/recoverable classification
- ✅ Integration with global error handling system
- ✅ Better debugging with component context
- ✅ Type-safe error creation with IDE support

#### **Legacy Error Migration**
When updating existing code:
1. Replace all `new Error()` with appropriate ErrorFactory methods
2. **Connectors**: Migrate to `ErrorFactory.connectorError()` or `ErrorFactory.fromConnectorError()` for standardized error handling
3. Update tests to expect ModalError objects instead of generic Error
4. Add component context as second parameter where applicable
5. Use error categorization to guide fatal vs recoverable decisions
6. **For connectors**: Use `fromConnectorError()` for external wallet errors, `connectorError()` for internal logic errors

### **State Management Patterns**
- Use centralized state manager for modal state
- Implement selectors for efficient subscriptions
- Batch state updates when possible
- Clean up subscriptions in component unmount

### **Resource Management Patterns**
- Always use resource manager for cleanup-required operations
- Register resources with appropriate lifecycle
- Use RAII pattern for automatic cleanup
- Track resource dependencies

### **Schema Validation**
- Validate all factory function inputs
- Use existing schemas from `src/schemas/`
- Add custom validation for new components
- Provide clear error messages for validation failures

#### **Key Features**
- Runtime validation for all public APIs using Zod
- Custom validators for icons, chain types
- Performance optimized (<100ms typical)

#### **Creating New Schemas**
```typescript
// Define schema
export const configSchema = z.object({
  enabled: z.boolean(),
  apiKey: z.string().min(1),
  retries: z.number().int().min(0).max(10)
});

// Infer TypeScript type
export type Config = z.infer<typeof configSchema>;

// Use in factory
export function createFeature(config: unknown) {
  const validConfig = configSchema.parse(config);
  return new Feature(validConfig);
}
```

### **Logging System**

Modal Core provides a comprehensive logging system that replaces direct console output with configurable, structured logging.

#### **Logger Architecture**
- **Global Logger**: `modalLogger` - available throughout modal-core
- **Component Loggers**: Created with `createDebugLogger()` for specific components
- **Configuration**: Logger behavior configurable via WalletMesh client config

#### **Available Loggers**
```typescript
// Global modal-core logger
import { modalLogger, configureModalLogger } from '@walletmesh/modal-core';

// Create component-specific loggers
import { createDebugLogger } from '@walletmesh/modal-core';
const componentLogger = createDebugLogger('MyComponent', true);

// React-specific logger
import { getReactLogger, createComponentLogger } from '@walletmesh/modal-react';
const reactLogger = getReactLogger();
const componentLogger = createComponentLogger('MyComponent');
```

#### **Client Configuration**
```typescript
// Configure logging through WalletMesh client
const client = createWalletMeshClient({
  appName: 'My DApp',
  logger: {
    debug: true,                    // Enable debug logging
    level: 'debug',                 // Set log level: debug, info, warn, error, silent
    prefix: 'MyApp'                 // Custom prefix for log messages
  }
});

// Or configure global logger directly
import { modalLogger } from '@walletmesh/modal-core';
modalLogger.setLevel(LogLevel.Debug);
```

#### **Usage Patterns**
```typescript
// In modal-core components
import { modalLogger } from '../core/logger/globalLogger.js';

class MyComponent {
  constructor() {
    modalLogger.info('Component initialized');
  }

  async processData(data: unknown) {
    modalLogger.debug('Processing data', data);
    try {
      // ... processing logic
      modalLogger.info('Data processed successfully');
    } catch (error) {
      modalLogger.error('Processing failed', error);
      throw error;
    }
  }
}

// In React components
import { getReactLogger } from '@walletmesh/modal-react';

function MyReactComponent() {
  const logger = getReactLogger();
  
  useEffect(() => {
    logger.debug('Component mounted');
    return () => logger.debug('Component unmounting');
  }, []);
}
```

#### **Log Levels**
- **Debug**: Verbose logging for development (disabled by default)
- **Info**: General information messages
- **Warn**: Warning conditions that don't stop execution
- **Error**: Error conditions that may impact functionality
- **Silent**: No logging output

#### **Features**
- **Automatic Data Sanitization**: Handles circular references, functions, and sensitive data
- **Environment Detection**: Auto-enables debug mode in development
- **SSR-Safe**: Works correctly in server-side rendering environments
- **Performance**: Minimal overhead when debug logging is disabled
- **Type-Safe**: Full TypeScript support with proper type inference

#### **Migration from Console**
When updating existing code, replace console usage:
```typescript
// OLD - Direct console usage
console.log('[ComponentName] Processing data', data);
console.warn('Warning condition detected');
console.error('Error occurred:', error);

// NEW - Structured logging
import { modalLogger } from '../core/logger/globalLogger.js';
modalLogger.debug('Processing data', data);
modalLogger.warn('Warning condition detected');
modalLogger.error('Error occurred', error);
```

## Working with Consolidated Services

### **Service Access Patterns**
```typescript
// Get services from registry
const services = serviceRegistry.getServices();

// Use ConnectionService (includes account, session, recovery, health)
const connectionResult = await services.connectionService.connect({ walletId: 'metamask' });
const healthStatus = services.connectionService.checkHealth(provider);
const recovery = services.connectionService.analyzeError(error);

// Use ChainService (includes validation, registry, switching)
const chainInfo = services.chainService.getChainInfo('1');
const validation = services.chainService.validateChain('1', provider);
const switchResult = await services.chainService.switchChain(provider, '137');

// Use DAppRpcService for communication
const rpcResult = await services.dAppRpcService.sendRequest(request);
```

### **Integration with Other Packages**
```typescript
// Modal-React integration
import { useWalletMeshServices } from '@walletmesh/modal-react';

function MyComponent() {
  const services = useWalletMeshServices();
  
  // Access consolidated services
  const handleConnect = () => services.connectionService.connect({ walletId: 'metamask' });
  const handleChainSwitch = () => services.chainService.switchChain(provider, '137');
}
```

### **Service Benefits from Consolidation**
- **Reduced API Surface**: Fewer service imports and interfaces to learn
- **Consistent Interfaces**: All services follow AbstractService patterns  
- **Better Type Safety**: Consolidated types eliminate interface conflicts
- **Improved Performance**: Reduced service coordination overhead
- **Easier Testing**: Fewer mocks and service dependencies required

## Common Development Tasks

### **Adding a New Framework Adapter**
1. Extend `BaseFrameworkAdapter` in `src/internal/adapters/`
2. Implement framework-specific lifecycle methods
3. **CRITICAL**: Use ErrorFactory for all error handling (never `new Error()`)
4. Add schema validation in `src/schemas/adapters.ts`
5. Export through `src/api/adapters.ts`
6. Add tests following naming convention and expect ModalError objects

### **Adding a New Transport**
1. Extend `AbstractTransport` in `src/internal/transports/`
2. Implement connection and messaging methods
3. **CRITICAL**: Use ErrorFactory for all error handling (never `new Error()`)
4. Add configuration schema in `src/schemas/configs.ts`
5. Handle connection resilience and retry logic
6. Export through `src/api/transports.ts`

### **Adding a New Connector**
1. Create a new strategy implementing `WalletStrategy` in `src/internal/connectors/strategies/`
   ```typescript
   export class MyWalletStrategy implements WalletStrategy {
     async connect(chainType?: ChainType): Promise<ConnectionResult> {
       // Wallet-specific connection logic
     }
     async disconnect(): Promise<void> {
       // Cleanup logic
     }
     async switchChain(chainId: string | number): Promise<void> {
       // Chain switching logic
     }
     getProviderType(): ProviderInterface {
       return 'eip1193'; // or appropriate type
     }
   }
   ```
2. Register the strategy in the connector factory (`src/internal/factories/connector.ts`)
3. **CRITICAL**: Use `ErrorFactory.connectorError()` or `ErrorFactory.fromConnectorError()` for standardized error handling
4. Add error handling with recovery strategies and proper recovery hints
5. The factory will automatically:
   - Create a `WalletConnector` instance with your strategy
   - Inject `ConnectorStateManager` for state management
   - Inject `ModalEventEmitter` for event handling
   - Inject `Logger` for debugging

### **Provider Classes**

Modal Core includes abstract provider classes for different blockchain types:

#### **EVM Provider** (`EvmProvider`)
- Base class for Ethereum Virtual Machine compatible chains
- Implements EIP-1193 provider interface
- Supports account management, transaction signing, chain switching
- Used by MetaMask, Coinbase, and other EVM wallet adapters

#### **Solana Provider** (`SolanaProvider`)
- Base class for Solana blockchain wallets
- Implements Solana wallet standard
- Supports transaction signing, message signing, and Solana-specific features
- Used by Phantom and other Solana wallet adapters

#### **Aztec Provider** (`AztecProvider`) - Enhanced in Phase 1-7
- **Complete abstract provider for Aztec privacy-preserving blockchain**
- **Location**: `src/internal/adapters/wallet/providers/AztecProvider.ts`
- **Key Features**:
  - Full Aztec.js wallet interface with 30+ abstract methods
  - Type imports from `@aztec/aztec.js` via `@walletmesh/aztec-rpc-wallet`
  - No direct Aztec dependencies (uses type imports pattern)
  - Comprehensive error handling with ErrorFactory integration
  - Support for private transactions and encrypted events
  - Authentication witness creation and management
  - Contract deployment and interaction
  - Sync status monitoring
- **Usage**: Extend this class to create Aztec wallet adapters
- **Documentation**: See `/core/modal-core/docs/AZTEC_PROVIDER_GUIDE.md` for implementation guide
- **Tests**: Full test coverage in `AztecProvider.test.ts` and `AztecProvider.integration.test.ts`

### **Testing Guidelines**
- **CRITICAL**: Always use `@walletmesh/modal-core/testing` utilities instead of creating inline mocks (see [Testing Strategy](#testing-strategy-modal-core-testing-module))
- Use integration tests for cross-component scenarios
- Mock external dependencies (wallets, DOM, etc.) with testing utilities
- Test error conditions and recovery scenarios
- **CRITICAL**: When testing errors, expect ModalError objects from ErrorFactory, not generic Error
- **For connectors**: Test that errors have `component: 'connector'` and appropriate recovery hints
- Ensure resource cleanup in tests
- Use fake timers for async operations

**Mock Creation Priority:**
1. **First choice**: Use `createMock*()` utilities from testing module
2. **Second choice**: Create inline mocks only if no utility exists
3. **Last resort**: Complex custom mocks for unique scenarios

**Examples:**
```typescript
// ✅ PREFERRED - Use testing utilities
import { createMockLogger, createMockEvmProvider } from '@walletmesh/modal-core/testing';

const mockLogger = createMockLogger();
const mockProvider = createMockEvmProvider({ eth_accounts: ['0x123'] });

// ❌ AVOID - Inline mocks when utilities exist
const mockLogger = { debug: vi.fn(), info: vi.fn(), ... };
```

### **Performance Improvements from Consolidation**
- **Service Count Reduction**: 15 → 7 services (-53% reduction)
- **Memory Efficiency**: Reduced service instances and dependencies
- **Bundle Size**: Elimination of duplicate functionality reduces bundle size
- **Initialization Speed**: Fewer services to initialize and coordinate
- **Runtime Performance**: Consolidated interfaces reduce method call overhead

### **Performance Considerations**
- Minimize re-renders in framework adapters
- Use selector patterns for state subscriptions
- Batch DOM updates when possible
- Lazy load heavy components
- Monitor resource usage in long-running apps
- **Service Coordination**: ServiceRegistry optimizes service communication

## Dependencies and Integration

### **External Dependencies**
- `zod` - Runtime validation schemas
- `zustand` - State management (in modal state)
- Framework-specific dependencies loaded conditionally

### **Internal Dependencies**
- **ServiceRegistry**: Central service management with dependency injection
- **AbstractService**: Base class providing consistent lifecycle management
- **ChainServiceRegistry**: Specialized registry for chain-specific services
- EventTarget-based event system for loose coupling
- Resource management for cleanup
- Error system for resilience

### **Service Integration Patterns**
- **Stateless Services**: All business logic services are stateless
- **Dependency Injection**: Services receive dependencies through constructor
- **Registry Pattern**: Central ServiceRegistry manages service lifecycle
- **Chain Abstraction**: ChainServiceRegistry provides multi-chain support

### **Integration Points**
- **Framework Integration**: Modal-React uses services through ServiceRegistry
- **Service Communication**: Services communicate through well-defined interfaces
- **State Coordination**: ServiceRegistry coordinates with WalletMeshClient
- **Error Handling**: All services use centralized ErrorFactory
- **Transport Integration**: Services integrate with wallet communication protocols
- **Chain Support**: Services work across EVM, Solana, and Aztec chains

## Testing

### **Test Structure**
- Unit tests: Component-specific functionality
- Integration tests: Cross-component interactions
- Edge tests: Error conditions and edge cases
- Performance tests: Resource usage and memory leaks

### **Test Commands**
- `pnpm test` - Run all tests
- `pnpm test -- src/path/to/file.test.ts` - Run specific test
- `pnpm test:watch` - Watch mode
- `pnpm coverage` - Coverage report

### **Test Configuration**
- `vitest.config.ts` - Test configuration
- `vitest.setup.ts` - Global test setup
- Excludes problematic integration tests temporarily
- 5-second timeout for async operations

### **Testing Strategy: Modal-Core Testing Module**

**CRITICAL**: Always use `@walletmesh/modal-core/testing` utilities instead of creating inline mocks. This ensures consistency, reduces duplication, and provides battle-tested mock implementations.

#### **✅ PREFERRED - Use Testing Module Utilities**
```typescript
import {
  createMockClient,
  createMockFrameworkAdapter,
  createMockLogger,
  createMockRegistry,
  createMockModal,
  createMockErrorHandler,
  createMockWalletAdapter,
  createMockEvmProvider,
  createMockSolanaProvider,
  createMockJSONRPCTransport,
  createMockJSONRPCNode,
  createMockServiceDependencies,
  createMockWalletInfo,
} from '@walletmesh/modal-core/testing';

// Example: Replace inline mocks with utilities
describe('MyComponent', () => {
  let mockLogger: Logger;
  let mockErrorHandler: ErrorHandler;
  
  beforeEach(() => {
    // ✅ Use testing utilities
    mockLogger = createMockLogger();
    mockErrorHandler = createMockErrorHandler();
    
    // ✅ Use for complex scenarios
    const mockProvider = createMockEvmProvider({
      eth_accounts: ['0x123...'],
      eth_chainId: '0x1',
      wallet_switchEthereumChain: new Error('Chain not supported'),
    });
  });
});
```

#### **❌ AVOID - Inline Mock Creation**
```typescript
// ❌ Don't create inline mocks when utilities exist
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  setLevel: vi.fn(),
  dispose: vi.fn(),
};

// ❌ Don't create manual provider mocks
const mockProvider = {
  request: vi.fn().mockImplementation(({ method }) => {
    switch (method) {
      case 'eth_accounts':
        return Promise.resolve(['0x123...']);
      // ... 30+ lines of method implementations
    }
  }),
};
```

#### **Available Testing Utilities**

**Core Infrastructure Mocks:**
- `createMockLogger()` - Logger with all methods mocked
- `createMockErrorHandler()` - Error handler with proper error categorization
- `createMockServiceDependencies()` - Service dependency injection setup
- `createMockFrameworkAdapter()` - UI framework adapter mocking

**Modal & Client Mocks:**
- `createMockClient()` - Complete WalletMesh client with realistic behavior
- `createMockModal()` - Modal controller with state management
- `createMockRegistry()` - Wallet registry with adapter management

**Wallet & Adapter Mocks:**
- `createMockWalletAdapter()` - Wallet adapter with chain/feature support
- `createMockWalletInfo()` - Wallet metadata for compatibility testing

**Provider Mocks:**
- `createMockEvmProvider(responses?)` - EVM provider with configurable method responses
- `createMockSolanaProvider(balance?)` - Solana provider with connection simulation

**Transport & Communication Mocks:**
- `createMockJSONRPCTransport()` - JSON-RPC transport layer
- `createMockJSONRPCNode()` - JSON-RPC node with method/event handling

#### **Enhanced Provider Mock Configuration**
```typescript
// ✅ Configure provider behavior with custom responses
const mockEvmProvider = createMockEvmProvider({
  // Success responses
  eth_accounts: ['0x1234567890123456789012345678901234567890'],
  eth_chainId: '0x1',
  eth_getBalance: '0xde0b6b3a7640000', // 1 ETH
  
  // Error responses
  wallet_switchEthereumChain: new Error('Chain not supported'),
  eth_sendTransaction: new Error('User rejected'),
});

// ✅ Solana provider with custom balance
const mockSolanaProvider = createMockSolanaProvider(2000000000); // 2 SOL
```

#### **Mock Composition Patterns**
```typescript
// ✅ Combine utilities for complex scenarios
describe('Integration Tests', () => {
  let testSetup: {
    client: ReturnType<typeof createMockClient>;
    modal: ReturnType<typeof createMockModal>;
    logger: ReturnType<typeof createMockLogger>;
  };

  beforeEach(() => {
    testSetup = {
      client: createMockClient(),
      modal: createMockModal(),
      logger: createMockLogger(),
    };
  });
});
```

#### **Migration Strategy**

**When you encounter inline mocks:**
1. **Check if utility exists** - Consult the list above
2. **Replace with utility** - Import and use the appropriate `createMock*()` function
3. **Configure if needed** - Use parameters/options to customize behavior
4. **Test thoroughly** - Ensure behavior matches the previous inline mock

**Lines of code typically saved:**
- Basic logger/error handler mocks: 10-15 lines
- Provider mocks: 30-50 lines  
- Complex adapter mocks: 50-80 lines
- Integration test setups: 100+ lines

**Benefits:**
- ✅ **Consistency** - All tests use the same mock behaviors
- ✅ **Maintainability** - Updates to mock utilities benefit all tests
- ✅ **Reliability** - Battle-tested implementations reduce test flakiness
- ✅ **Readability** - Tests focus on logic, not mock setup
- ✅ **Reusability** - Other packages can use the same utilities

## Build and Development

### **Build Commands**
- `pnpm build` - Build package
- `pnpm type-check` - TypeScript checking
- `pnpm lint` / `pnpm lint:fix` - Linting
- `pnpm format` / `pnpm format:fix` - Formatting

### **Development Workflow**
1. Read existing code and CLAUDE.md files
2. Write tests for new functionality
3. **CRITICAL**: Implement with proper error handling using ErrorFactory (never `new Error()`)
4. Add schema validation for new APIs
5. Update documentation for significant changes
6. Run verification: `pnpm lint && pnpm type-check:build && pnpm test`

### **API Design Patterns**

#### **Factory Function Guidelines**
Modal Core has been refactored to reduce factory function proliferation. Follow these guidelines:

**✅ PREFERRED - Use Direct APIs:**
```typescript
// Error creation - Use ErrorFactory directly
import { ErrorFactory } from '@walletmesh/modal-core';
const error = ErrorFactory.connectionFailed('Connection failed');

// Logger creation - Use createDebugLogger directly  
import { createDebugLogger } from '@walletmesh/modal-core';
const logger = createDebugLogger('MyComponent', true);

// Adapter creation - Use main adapter API
import { createFrameworkAdapter } from '@walletmesh/modal-core';
const adapter = createFrameworkAdapter({ target: '#modal' });

// Transport creation - Use internal factory directly
import { createDirectTransport } from '@walletmesh/modal-core';
const transport = createDirectTransport(TransportType.POPUP, config);
```

**❌ DEPRECATED - Avoid Wrapper Factories:**
```typescript
// These are deprecated thin wrappers
import { 
  createConnectionError,  // Use ErrorFactory.connectionFailed()
  createWalletError,      // Use ErrorFactory.walletNotFound()
  createLogger,           // Use createDebugLogger()
  createAdapter,          // Use createFrameworkAdapter()
  createTransport         // Use createDirectTransport()
} from '@walletmesh/modal-core';
```

**✅ JUSTIFIED - Keep Complex Factories:**
Complex factories that provide real value should continue to be used:
- `createWalletMeshClient()` - Complex orchestration and SSR handling
- `createModal()` - Complex validation and service injection
- `createTestModal()` - Complex mock setup for testing
- Lazy utilities (`createLazy`, `createLazyAsync`) - Essential for SSR
- Chain builders (`createMainnetConfig`, `createTestnetConfig`) - Complex configuration

#### **When to Create Factory Functions**
Only create factory functions when they provide genuine value:
- **Complex dependency injection** (3+ dependencies)
- **Extensive validation** (multiple schemas, complex logic)
- **Environment detection** (SSR vs browser, feature detection)
- **Complex configuration transformation**
- **Resource lifecycle management**

**Don't create factories for:**
- Simple object creation
- Thin wrappers around other functions
- Single-parameter functions
- Direct class instantiation

### **ErrorFactory Reference Quick Guide**

**Available Convenience Methods:**
```typescript
// Configuration errors (fatal)
ErrorFactory.configurationError(message, details?)
ErrorFactory.invalidAdapter(message, adapterName)
ErrorFactory.invalidTransport(message, transportType)

// Connection errors (recoverable)
ErrorFactory.connectionFailed(message, details?)
ErrorFactory.walletNotFound(walletId?)

// Transport errors (recoverable)
ErrorFactory.transportError(message, details?)
ErrorFactory.messageFailed(message, details?)
ErrorFactory.transportDisconnected(message, reason?)

// UI/Render errors (recoverable)
ErrorFactory.renderFailed(message, component?)
ErrorFactory.mountFailed(message, target?)
ErrorFactory.cleanupFailed(message, operation?)

// Connector errors (flexible fatal/recoverable)
ErrorFactory.connectorError(walletId, message, code?, options?)
ErrorFactory.fromConnectorError(walletId, error, operation?)
```

**Error Import Pattern:**
```typescript
import { ErrorFactory } from '../core/errors/errorFactory.js';
// Adjust path based on your file location relative to src/internal/core/errors/
```

### **Error Handling Architecture Summary**

**Use ErrorFactory for:**
- ✅ Framework Adapters (ReactAdapter, DOMAdapter, etc.)
- ✅ Transport Layer (AbstractTransport, PopupWindow, ChromeExtension)
- ✅ Modal Controller and UI Components
- ✅ Factory Functions and Configuration Validation
- ✅ Internal Infrastructure Components
- ✅ **Wallet Connectors** (WalletStrategy implementations) - **NEW: Use connector methods**

**Use ErrorFactory Connector Methods for:**
- ✅ `ErrorFactory.connectorError()` - Custom connector errors with recovery hints
- ✅ `ErrorFactory.fromConnectorError()` - Transform external wallet errors automatically
- ✅ Standard wallet operations (connect, disconnect, sign, switch chain)
- ✅ Client-compatible error structure with `component: 'connector'`

**Use Direct ModalError Creation for:**
- ✅ Highly wallet-specific error cases that need custom structure
- ✅ Performance-critical error paths (rare)
- ✅ Legacy connector code (during migration period)

**Never Use:**
- ❌ Generic `new Error()` anywhere in the codebase

## Recent Cleanup (July 2025)

### **Recently Removed (v3.0.0)**
The following deprecated features have been removed:

#### **Removed BalanceService Methods**
- **`configure(config)`** - Configuration is now handled automatically by QueryManager
- **`clearCache(cacheKey)`** - Cache is now managed automatically by QueryManager
- **`BalanceServiceConfig` interface** - No longer needed as configuration is automatic

**Migration:**
```typescript
// ❌ REMOVED - These methods no longer exist
// balanceService.configure({ cacheTimeout: 30000 });
// balanceService.clearCache('balance-key');

// ✅ CURRENT - No action needed, QueryManager handles this automatically
// Configuration and caching are now automatic
```

#### **Cleaned Up Legacy Code**
- Removed legacy logger comments in `api/system/logger.ts`
- Removed legacy generic registry from testing utilities
- All imports and exports updated accordingly

### **Previous Deprecated Code Removal**
A comprehensive cleanup was performed to remove deprecated, legacy, and backwards-compatible code:

#### **Services Consolidation**
- **Removed deprecated service directories**: `/services/health/`, `/services/recovery/`, `/services/session/`, `/services/account/`
- **Cleaned up commented service exports**: Removed all commented-out exports from `services/index.ts` and `ServiceRegistry.ts`
- **Result**: Reduced from 15 services to 6 core services (-60%)

#### **Type System Cleanup**
- **Removed deprecated type aliases**: `SessionState` and `ModalError` aliases removed from `coreTypes.ts`
- **Removed typeCheck workaround**: Eliminated unused type checking code and `@ts-ignore` comments
- **Renamed consolidated configs**: `ConsolidatedConnectionConfig` → `ConnectionConfig`, `ConsolidatedChainConfig` → `ChainConfig`

#### **Backwards Compatibility Removal**
- **Array-to-Map conversions**: Removed compatibility code in `subscriptions.ts` that converted arrays to Maps
- **Legacy store exports**: Removed deprecated `createStore` and `Store` exports from `store.ts`
- **Store migration**: Removed version 1 migration logic from `storeMigration.ts`

#### **Code Quality Improvements**
- **Fixed TypeScript errors**: Resolved all compilation errors with `exactOptionalPropertyTypes`
- **Updated action calls**: Fixed all UI action calls to pass store as first parameter
- **Import cleanup**: Removed unused imports and fixed type re-exports
- **Removed deprecated 'fatal' property**: Updated error schema and all references to use 'isRecoverable' instead
- **Addressed TODO comments**: Resolved all actionable TODO/FIXME comments throughout the codebase
- **Updated legacy terminology**: Cleaned up "factory function" references in logger documentation

## Service Consolidation Migration Guide

### **For Existing Code**
If you're working with older code that references removed services, use this migration guide:

#### **Removed Services → New Service Mapping**
```typescript
// OLD - Multiple service imports (NO LONGER AVAILABLE)
// import { AccountService } from './services/account/AccountService.js';
// import { SessionManagementService } from './services/session/SessionManagementService.js';
// import { ConnectionRecoveryService } from './services/recovery/ConnectionRecoveryService.js';
// import { WalletHealthService } from './services/health/WalletHealthService.js';
// import { ChainRegistry } from './services/chain/ChainRegistry.js';
// import { ChainValidator } from './services/chain/ChainValidator.js';
// import { ChainSwitcher } from './services/chain/ChainSwitcher.js';

// NEW - Consolidated service imports
import { ConnectionService } from './services/connection/ConnectionService.js';
import { ChainService } from './services/chain/ChainService.js';

// Access through ServiceRegistry
const services = serviceRegistry.getServices();
const connectionService = services.connectionService; // Includes account, session, recovery, health
const chainService = services.chainService; // Includes registry, validator, switcher
```

#### **API Migration Examples**
```typescript
// OLD - Separate service calls
// const account = await accountService.getAccount();
// const health = await healthService.checkHealth();
// const recovery = await recoveryService.recoverConnection();

// NEW - Unified service calls
const account = await services.connectionService.getAccount();
const health = services.connectionService.checkHealth();
const recovery = await services.connectionService.recoverConnection();

// OLD - Chain operations
// const chainInfo = chainRegistry.getChain('1');
// const validation = chainValidator.validate('1');
// await chainSwitcher.switchChain('137');

// NEW - Unified chain operations  
const chainInfo = services.chainService.getChainInfo('1');
const validation = services.chainService.validateChain('1');
await services.chainService.switchChain('137');
```

### **Benefits of Migration**
- **Reduced Imports**: Single service imports instead of multiple
- **Consistent APIs**: All services follow AbstractService patterns
- **Better Performance**: Reduced service coordination overhead
- **Easier Testing**: Fewer service dependencies to mock
- **Type Safety**: Consolidated types eliminate conflicts

### **Backward Compatibility**
- **Deprecated exports** are marked in service index files
- **Legacy APIs** continue to work during transition period
- **No breaking changes** introduced in current version
- **Future removal** planned for next major version

## Interface Consolidation Guidelines

### Overview
Modal Core has been systematically audited to eliminate duplicate interface definitions and establish single sources of truth for shared types. When working with interfaces, follow these guidelines to prevent future duplication.

### Interface Naming and Organization

#### **Established Single Sources of Truth**
- **SessionInfo**: Use `services/session/types.ts` - comprehensive session information
- **SessionMetadata**: Use `services/session/types.ts` - simple user-defined metadata (name, tags, custom data)
- **SessionStateMetadata**: Use `api/types/sessionState.ts` - comprehensive session state metadata with wallet/dApp context
- **ImmutableSessionMetadata**: Use `api/types/session.ts` - metadata for immutable session types
- **ConnectionSessionInfo**: Use `services/connection/ConnectionService.ts` - minimal interface for connection validation
- **ConnectionSessionMetadata**: Use `services/connection/ConnectionService.ts` - minimal metadata for connection service
- **ConnectionResult**: Use `types.ts` - public API connection result
- **ConnectionServiceResult**: Use `services/connection/ConnectionService.ts` - internal service result

#### **Interface Location Guidelines**
1. **Public API interfaces**: Place in `src/types.ts` or `src/api/types/`
2. **Service-specific interfaces**: Place in corresponding service types file (e.g., `services/session/types.ts`)
3. **Internal validation interfaces**: Use service-specific naming (e.g., `ConnectionSessionInfo`)
4. **State management interfaces**: Place in `src/api/types/sessionState.ts` or `src/state/types.ts`

### Preventing Duplication

#### **Before Creating New Interfaces**
1. **Search first**: Use `rg "interface.*<InterfaceName>" --type ts` to find existing definitions
2. **Check exports**: Look in relevant `index.ts` and service files for existing exports
3. **Review purpose**: Determine if you need a new interface or can extend/reuse existing ones
4. **Consider naming**: If you need a specialized version, use descriptive prefixes (e.g., `ConnectionSessionInfo`)

#### **When You Find Duplicates**
1. **Identify the canonical version**: Choose the most comprehensive or widely-used definition
2. **Rename specialized versions**: Use descriptive prefixes to indicate their specific purpose
3. **Update imports**: Ensure all files import from the canonical source
4. **Update exports**: Maintain proper re-exports with clear aliases if needed
5. **Test thoroughly**: Run full test suite to ensure no breaking changes

#### **Naming Conventions for Specialized Interfaces**
- **Service-specific**: `<ServiceName><InterfaceName>` (e.g., `ConnectionSessionInfo`)
- **State-specific**: `<StateType><InterfaceName>` (e.g., `SessionStateMetadata`)
- **API-specific**: `<Context><InterfaceName>` (e.g., `ImmutableSessionMetadata`)
- **Internal validation**: `<Purpose><InterfaceName>` (e.g., `ValidationSessionInfo`)

### Common Patterns

#### **Multiple Interface Versions by Purpose**
When you legitimately need multiple versions of similar interfaces:
- **Public API**: Comprehensive interface in `types.ts` or `api/types/`
- **Internal Service**: Minimal interface with service-specific naming
- **State Management**: Rich interface with nested context information
- **Validation**: Simplified interface with optional fields

#### **Proper Re-exports**
```typescript
// Good - Clear aliases prevent confusion
export type {
  SessionInfo,                          // From services/session/types.ts
  SessionMetadata,                      // From services/session/types.ts  
  SessionMetadata as SessionStateMetadata, // From api/types/sessionState.ts
  ImmutableSessionMetadata,             // From api/types/session.ts
  ConnectionSessionInfo,                // From services/connection/ConnectionService.ts
} from './path/to/interfaces.js';
```

### Maintenance

#### **Regular Audits**
- Search for duplicate interface names: `rg "^export interface.*<CommonName>" --type ts`
- Check for naming conflicts in exports
- Review new interfaces during code reviews
- Update this documentation when patterns change

#### **Code Review Guidelines**
- Verify new interfaces don't duplicate existing ones
- Ensure proper naming conventions
- Check that imports come from canonical sources
- Validate that exports use appropriate aliases

## Architecture Documentation

For comprehensive architectural information, see:
- `/core/modal-core/ARCHITECTURE.md` - Detailed architecture documentation
- `/core/modal-core/ADAPTER_PROVIDER_ARCHITECTURE.md` - **Adapter vs Provider architecture explanation**
- `/core/modal-core/CONNECTOR_ERROR_USAGE_EXAMPLES.md` - Complete ErrorFactory connector usage examples
- `/core/modal-core/docs/_media/NAMING_CONVENTIONS.md` - Naming conventions
- Root `/CLAUDE.md` - Project-wide information and standards

## Key Files and Locations

### Main Entry Points
- `src/api/core/createWalletClient.ts` - Main factory function for creating client
- `src/internal/modal/controller.ts` - Modal orchestration and UI control
- `src/internal/client/WalletMeshClientImpl.ts` - Core client implementation with wallet management

### Service Architecture Files
- `src/internal/registries/ServiceRegistry.ts` - Central service registry managing 4 services
- `src/services/connection/ConnectionService.ts` - Consolidated connection management
- `src/services/chain/ChainService.ts` - Consolidated chain management
- `src/services/base/AbstractService.ts` - Base class for all services
- `src/services/index.ts` - Service exports and type definitions

### Important Implementation Files
- **ServiceRegistry**: Central registry for managing 4 consolidated services
- **ConnectionService**: Unified connection, account, session, recovery, health, UI, and preferences management
- **ChainService**: Unified chain validation, registry, and switching functionality
- **TransactionService**: Multi-chain transaction management and monitoring
- **BalanceService**: Balance queries with caching and chain service integration
- **ModalController**: Orchestrates modal UI, handles wallet connections and state
- **WalletMeshClient**: Main client interface for managing wallets and connections
- **ErrorFactory**: Centralized error creation with categorized error types