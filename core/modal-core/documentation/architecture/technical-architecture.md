# Modal Core Architecture

## Overview

Modal Core provides a wallet connection modal system for web applications. The package uses a simplified, layered architecture with runtime validation, state management, and framework adapters.

## Architecture Layers

The modal-core architecture is organized into distinct layers that provide clear separation of concerns:

1. **Public API** (`api/`) - Exported functions and types for external consumers
2. **Services Layer** (`services/`) - Framework-agnostic business logic services  
3. **State Management** (`state/`) - Simplified 3-slice state management
4. **Discovery System** (`discovery/`) - Multi-chain wallet detection
5. **Provider System** (`providers/`) - Wallet provider abstractions
6. **Client Management** (`client/`) - Connection lifecycle and multi-wallet coordination
7. **Validation** (`schemas/`) - Runtime type validation with Zod schemas
8. **Infrastructure** (`internal/`) - Core services, events, and utilities

## Current State Management

Modal Core uses a simplified 3-slice architecture that consolidates related functionality for better performance and maintainability.

### Simplified WalletMesh State

The current implementation uses a clean 3-slice architecture:

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

### State Slice Responsibilities

#### UI Slice
- **Modal State**: Controls modal open/close state and current view
- **Loading States**: Manages loading indicators and operation progress
- **Error Handling**: Centralized error display and recovery
- **Discovery Integration**: Wallet discovery scanning and status
- **User Feedback**: Loading states, progress indicators, and error messages

#### Connections Slice  
- **Session Management**: Active wallet sessions and session lifecycle
- **Wallet Registry**: Available and discovered wallets
- **Connection Status**: Overall connection state and active wallet
- **Multi-wallet Support**: Managing multiple concurrent wallet connections
- **Wallet Selection**: User's selected wallet and connection preferences

#### Transactions Slice
- **Transaction Lifecycle**: Pending, confirmed, and failed transactions
- **Transaction History**: Complete record of user transactions
- **Active Operations**: Currently executing transaction operations
- **Status Tracking**: Real-time transaction status monitoring
- **Error Recovery**: Failed transaction handling and retry logic

## Services Layer Architecture

The modal-core package implements a consolidated services layer that provides business logic for wallet operations. The services layer is framework-agnostic and provides consistent APIs for all framework integrations.

### Service Consolidation Strategy

Modal Core has consolidated from 15+ services to 7 core services for better maintainability:

1. **ConnectionService** - Unified connection, account, session, recovery, and health management
2. **ChainService** - Consolidated chain management including validation, registry, and switching
3. **TransactionService** - Multi-chain transaction management with validation and confirmation tracking
4. **BalanceService** - Balance queries with caching, polling, and token support
5. **WalletPreferenceService** - User preference management and wallet history
6. **DAppRpcService** - dApp RPC communication and provider integration
7. **ConnectionUIService** - UI service combining connect button and connection display logic

### Service Registry Pattern

Services are managed through a centralized registry that handles dependency injection and lifecycle management:

```typescript
interface ServiceRegistry {
  connectionService: ConnectionService;
  chainService: ChainService;
  transactionService: TransactionService;
  balanceService: BalanceService;
  walletPreferenceService: WalletPreferenceService;
  dAppRpcService: DAppRpcService;
  connectionUIService: ConnectionUIService;
}
```

## Client Architecture

The WalletMeshClient provides the main interface for wallet operations, built on top of the services layer.

### WalletMeshClient Interface

```typescript
interface WalletMeshClient {
  // Connection management
  connect(walletId?: string): Promise<SessionInfo>;
  disconnect(): Promise<void>;
  
  // State access
  getState(): SimplifiedWalletMeshState;
  subscribe(callback: (state: SimplifiedWalletMeshState) => void): () => void;
  
  // Session management
  getActiveSession(): Promise<SessionInfo>;
  getAvailableWallets(): Promise<WalletInfo[]>;
  
  // Lifecycle
  destroy(): void;
}
```

### Client Implementation

- **WalletMeshClient** (`client/WalletMeshClient.ts`) - Main client interface
- **ConnectionManager** (`client/ConnectionManager.ts`) - Handles connection lifecycle
- **EventSystem** (`client/EventSystem.ts`) - Manages event subscriptions
- **TransportDiscoveryService** (`client/TransportDiscoveryService.ts`) - Discovery through transport protocols

## Discovery System

The discovery system provides multi-chain wallet detection and coordination.

### Discovery Architecture

- **DiscoveryCoordinator** (`discovery/DiscoveryCoordinator.ts`) - Orchestrates wallet discovery
- **BaseDiscoveryService** (`discovery/BaseDiscoveryService.ts`) - Abstract base for discovery implementations
- **Chain-specific services**: AztecDiscoveryService, EVMDiscoveryService, SolanaDiscoveryService

### Discovery Integration

Discovery is integrated into the UI slice of the state management system, providing:
- Real-time discovery status updates
- Error handling and recovery
- Caching and performance optimization

## Provider System

The provider system abstracts blockchain providers through a unified interface.

### Provider Abstractions

- **BaseProvider** (`providers/BaseProvider.ts`) - Abstract provider base class
- **EVMProvider** (`providers/EVMProvider.ts`) - EVM-specific provider implementation
- **SolanaProvider** (`providers/SolanaProvider.ts`) - Solana-specific provider implementation
- **AztecProvider** (`providers/AztecProvider.ts`) - Aztec-specific provider implementation

### Provider Integration

Providers are accessed through active sessions, providing:
- Type-safe provider interfaces
- Chain-specific functionality
- Error handling and recovery

## Security System

The security system provides protection against malicious wallets and unauthorized access.

### Security Components

- **Origin Validation** (`security/originValidation.ts`) - Cross-origin communication validation
- **Rate Limiting** (`security/rateLimiting.ts`) - API request rate limiting
- **Session Security** (`security/sessionSecurity.ts`) - Session timeout and security management

## Error Handling

Modal Core uses a centralized error handling system with the ErrorFactory pattern.

### Error Architecture

- **ErrorFactory** (`internal/core/errors/errorFactory.ts`) - Centralized error creation
- **ModalError Interface** - Standardized error structure with categories
- **Recovery Strategies** - Automatic error recovery and retry logic

### Error Categories

- **Configuration errors**: Invalid setup or configuration
- **Connection errors**: Wallet connection failures
- **Transport errors**: Communication layer issues
- **UI errors**: Interface rendering or interaction problems

## Performance Optimizations

### State Management Performance

The simplified 3-slice architecture provides several performance benefits:

1. **Reduced Subscriptions**: Fewer slices mean fewer subscription points
2. **Optimized Updates**: Related state changes happen in the same slice
3. **Array-based Collections**: Better performance for iteration and serialization
4. **Flat Structure**: Simpler state shape improves debugging
5. **Type Inference**: Better TypeScript performance

### Service Performance

1. **Service Consolidation**: Reduced service coordination overhead
2. **Dependency Injection**: Efficient service instantiation and management
3. **Centralized Registry**: Optimized service communication
4. **Stateless Design**: Services provide pure business logic without state overhead

## Framework Integration

Modal Core is designed to be framework-agnostic, providing a foundation for framework-specific packages.

### Framework Adapter Pattern

Framework packages build on modal-core by:
1. Creating framework-specific providers (React Context, Vue plugins, etc.)
2. Subscribing to modal-core state changes
3. Translating state to framework-specific patterns
4. Providing framework-native components and hooks

### Integration Examples

- **React**: `@walletmesh/modal-react` - Uses React Context and hooks
- **Vue**: `@walletmesh/modal-vue` - Uses Vue plugins and composables
- **Svelte**: `@walletmesh/modal-svelte` - Uses Svelte stores
- **Angular**: `@walletmesh/modal-angular` - Uses Angular services and observables

This architecture provides a clean separation of concerns while maintaining the flexibility needed for complex wallet operations across different frameworks and blockchain networks.