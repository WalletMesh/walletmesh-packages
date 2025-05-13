# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

The @walletmesh/router package is a flexible routing system for managing multi-chain wallet connections with bi-directional communication support, built on top of @walletmesh/jsonrpc.

## Build & Test Commands
- **Build**: `pnpm build`
- **Test**: `pnpm test` (all tests), `pnpm test -- src/path/to/file.test.ts` (single test)
- **Test with watch**: `pnpm test:watch -- src/path/to/file.test.ts`
- **Coverage**: `pnpm coverage`
- **Lint**: `pnpm lint`, `pnpm lint:fix` (auto-fix)
- **Format**: `pnpm format`, `pnpm format:fix` (auto-fix)
- **Type check**: `pnpm type-check` (all files), `pnpm type-check:build` (production files only)
- **Documentation**: `pnpm docs` (generates TypeDoc documentation)

## Architecture

### Multi-Chain Wallet Router

The router manages connections to multiple blockchain wallets using a uniform interface, enabling:

1. **Chain Abstraction**:
   - Standardized interface to interact with any blockchain
   - Chain identification using string IDs (e.g., `eip155:1` for Ethereum mainnet)
   - Extensible to support new chains with minimal changes

2. **Permission System**:
   - Granular method-level permissions per chain
   - Request/approval workflow for sensitive operations
   - Human-readable permission descriptions

3. **Session Management**:
   - Secure session handling with unique identifiers
   - Session persistence across page reloads
   - Automatic session restoration

4. **Communication Flow**:
   - JSON-RPC messages between applications and wallets
   - Event-based state synchronization
   - Bi-directional communication for real-time updates

### Core Components

1. **WalletRouter** (`src/router.ts`)
   - Central component connecting applications to wallets
   - Methods:
     - `constructor()`: Initialize with transport, wallets, permissions
     - `addWallet()`: Register a chain-specific wallet client
     - `removeWallet()`: Unregister a wallet client
   - Handles:
     - Request routing to appropriate wallet clients
     - Session management and validation
     - Permission enforcement
     - Event propagation

2. **WalletRouterProvider** (`src/provider.ts`)
   - Client-side API for applications to interact with wallets
   - Methods:
     - `connect()`: Establish connections with permissions
     - `call()`: Execute a single method
     - `bulkCall()`: Execute multiple methods in sequence
     - `chain()`: Create an operation builder for method chaining
     - `getPermissions()`: Get current permissions
     - `updatePermissions()`: Request additional permissions
     - `disconnect()`: End the session
   - Properties:
     - `sessionId`: Current active session ID

3. **Permission System** (`src/permissions/`)
   - **PermissionManager Interface** (`src/types.ts`):
     - `approvePermissions()`: Handle permission approval requests
     - `checkPermissions()`: Verify if a method call is permitted
     - `getPermissions()`: Get current permissions
     - `cleanup()`: Handle session termination

   - **AllowAskDenyManager** (`src/permissions/allowAskDeny.ts`):
     - Production-ready permission manager
     - Three permission states: ALLOW, ASK, DENY
     - Interactive permission prompts through callbacks
     - Stateful permission management

   - **PermissivePermissionsManager** (`src/permissions/permissive.ts`):
     - Development-friendly permission manager
     - Automatically approves all permission requests
     - Useful for testing and rapid development

4. **Session Management** (`src/session-store.ts`)
   - **SessionStore Interface**:
     - `set()`: Store session data
     - `get()`: Retrieve session data
     - `delete()`: Remove session
     - `validateAndRefresh()`: Ensure session validity
     - `cleanExpired()`: Remove expired sessions

   - **MemorySessionStore**:
     - In-memory session storage
     - Session data lost on page refresh
     - Configurable session lifetime

   - **LocalStorageSessionStore**:
     - Persistent browser storage
     - Sessions survive page reloads
     - Configurable session lifetime

5. **JSON-RPC Integration** (`src/jsonrpc-adapter.ts`)
   - Bridges between JSON-RPC protocol and wallet clients
   - Adapts generic wallet methods to JSON-RPC format
   - Handles serialization/deserialization

6. **Operation Builder** (`src/operation.ts`)
   - Fluent interface for chaining multiple wallet calls
   - Type-safe method calls with proper parameter and result typing
   - Methods:
     - `call()`: Add method call to the chain
     - `execute()`: Execute all chained calls in sequence

7. **Error Handling** (`src/errors.ts`)
   - **RouterError**: Custom error class for router-specific errors
   - Standard error codes with descriptive messages
   - Detailed error data for debugging

8. **Middleware** (`src/middleware.ts`)
   - Session validation middleware
   - Permission checking middleware
   - Request transformation middleware

## Main Workflows

### Connecting to Wallets

```typescript
// Initialize provider
const provider = new WalletRouterProvider({
  send: async (msg) => window.postMessage(msg, '*')
});

// Connect to multiple chains with specific permissions
const { sessionId, permissions } = await provider.connect({
  'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
  'eip155:137': ['eth_getBalance', 'eth_call']
});

// Permissions are in a human-readable format
console.log('Approved permissions:', permissions);
// Example output:
// {
//   "eip155:1": {
//     "eth_accounts": {
//       allowed: true,
//       shortDescription: "View Accounts",
//       longDescription: "Allow viewing your Ethereum addresses"
//     },
//     "eth_sendTransaction": {
//       allowed: true,
//       shortDescription: "Send Transactions",
//       longDescription: "Allow sending transactions from your account"
//     }
//   },
//   "eip155:137": { ... }
// }
```

### Making Wallet Calls

```typescript
// Single method call
const accounts = await provider.call('eip155:1', {
  method: 'eth_accounts'
});

// Multiple method calls in sequence
const [balance, code] = await provider.bulkCall('eip155:1', [
  { method: 'eth_getBalance', params: ['0x123...'] },
  { method: 'eth_getCode', params: ['0x456...'] }
]);

// Using the operation builder for better type safety
const [balance, allowance] = await provider
  .chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .call('eth_allowance', ['0x123...', '0x456...'])
  .execute();
```

### Permission Management

```typescript
// Get current permissions
const currentPermissions = await provider.getPermissions();

// Request additional permissions
const updatedPermissions = await provider.updatePermissions({
  'eip155:1': ['eth_sign', 'personal_sign'] // new methods to request
});

// The permissions are handled through the permission manager
// For AllowAskDenyManager, this may trigger user prompts
```

### Session Management

```typescript
// Sessions are automatically created during connect()
const { sessionId } = await provider.connect(...);

// Sessions can be reconnected to
const reconnectResult = await provider.reconnect(sessionId);

// Sessions can be explicitly terminated
await provider.disconnect();

// The router automatically handles session validation
// and will throw InvalidSession errors for expired sessions
```

### Event Handling

```typescript
// Listen for wallet state changes
const cleanup = provider.on('wm_walletStateChanged', ({ chainId, changes }) => {
  console.log(`Wallet state changed for ${chainId}:`, changes);

  if (changes.accounts) {
    console.log('New accounts:', changes.accounts);
  }

  if (changes.networkId) {
    console.log('Network changed to:', changes.networkId);
  }
});

// Listen for permission changes
provider.on('wm_permissionsChanged', ({ sessionId, permissions }) => {
  console.log('Permissions updated:', permissions);
});

// Listen for session termination
provider.on('wm_sessionTerminated', ({ sessionId, reason }) => {
  console.log(`Session ${sessionId} terminated: ${reason}`);
});

// Clean up event listeners
cleanup();
```

## Router Methods (JSON-RPC Interface)

The router exposes these core methods through the JSON-RPC interface:

1. `wm_connect`: Create a new session with specific permissions
2. `wm_reconnect`: Attempt to reconnect to an existing session
3. `wm_disconnect`: End an existing session
4. `wm_getPermissions`: Get current session permissions
5. `wm_updatePermissions`: Update session permissions
6. `wm_call`: Invoke a method on a specific chain
7. `wm_bulkCall`: Execute multiple method calls in sequence
8. `wm_getSupportedMethods`: Get available methods for specified chains

## Router Events

1. `wm_walletStateChanged`: Emitted when a wallet's state changes
   ```typescript
   {
     chainId: 'eip155:1',
     changes: {
       accounts: ['0x123...', '0x456...'], // New account list
       networkId: '1', // New network ID
       // Other chain-specific state changes
     }
   }
   ```

2. `wm_permissionsChanged`: Emitted when permissions are updated
   ```typescript
   {
     sessionId: 'session123',
     permissions: {
       'eip155:1': ['eth_accounts', 'eth_sendTransaction']
     }
   }
   ```

3. `wm_sessionTerminated`: Emitted when a session ends
   ```typescript
   {
     sessionId: 'session123',
     reason: 'user_request' // or 'timeout', etc.
   }
   ```

4. `wm_walletAvailabilityChanged`: Emitted when wallet availability changes
   ```typescript
   {
     chainId: 'eip155:1',
     available: true // or false
   }
   ```

## Error Codes

Standard router error codes:
- `unknownChain` (-32000): Unknown chain ID
- `invalidSession` (-32001): Invalid or expired session
- `insufficientPermissions` (-32002): Insufficient permissions for method
- `methodNotSupported` (-32003): Method not supported by chain
- `walletNotAvailable` (-32004): Wallet service not available
- `partialFailure` (-32005): Partial failure in bulk operations
- `invalidRequest` (-32006): Invalid request parameters
- `unknownError` (-32603): Internal error

## Implementing a Wallet Client

To add support for a new blockchain:

```typescript
// Create a wallet client implementing the WalletClient interface
const myChainWallet: WalletClient = {
  // Required: Method to call blockchain RPC methods
  async call<T>(method: string, params?: unknown): Promise<T> {
    // Implement chain-specific logic
    return myChainAdapter.request({ method, params });
  },

  // Optional: Event handling
  on(event: string, handler: (data: unknown) => void): void {
    myChainAdapter.on(event, handler);
  },

  off(event: string, handler: (data: unknown) => void): void {
    myChainAdapter.off(event, handler);
  },

  // Optional: Method discovery
  async getSupportedMethods(): Promise<string[]> {
    return ['method1', 'method2', ...];
  }
};

// Register the wallet with the router
router.addWallet('mychain:mainnet', myChainWallet);
```

## Testing

When testing router components:

1. **Router Testing**:
   - Test adding/removing wallet clients
   - Verify correct routing of requests to wallets
   - Test event propagation

2. **Provider Testing**:
   - Test connection establishment
   - Verify method call routing
   - Test permission handling

3. **Permission Testing**:
   - Test permission approval workflows
   - Verify permission enforcement
   - Test permission updates

4. **Session Testing**:
   - Test session creation and validation
   - Verify session persistence
   - Test session expiration and cleanup

5. **Error Testing**:
   - Test each error condition
   - Verify error propagation
   - Test recovery strategies

6. **Integration Testing**:
   - Test complete workflows from connection to method execution
   - Verify multi-chain operations
   - Test with real wallet implementations