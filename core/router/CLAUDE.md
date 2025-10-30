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
     - `constructor()`: Initialize with transport, wallets map (chainId -> transport), permissions
     - `addWallet()`: Register a chain-specific wallet transport
     - `removeWallet()`: Unregister a wallet
     - `getProxyStats()`: Get statistics for all wallet proxies
     - `getWalletHealthStatus()`: Check health of all wallet connections
   - Internal Architecture:
     - Creates JSONRPCProxy instances for each wallet transport
     - Proxies provide transparent message forwarding without serialization overhead
   - Handles:
     - Request routing to appropriate wallet transports via proxies
     - Session management and validation
     - Permission enforcement
     - Event propagation

2. **WalletRouterProvider** (`src/provider.ts`)
   - Client-side API for applications to interact with wallets
   - Methods:
     - `connect()`: Establish connections with permissions
     - `reconnect()`: Restore an existing session after page refresh or browser restart
     - `call()`: Execute a single method
     - `bulkCall()`: Execute multiple methods in sequence
     - `chain()`: Create an operation builder for method chaining
     - `getPermissions()`: Get current permissions
     - `updatePermissions()`: Request additional permissions
     - `disconnect()`: End the session
   - Properties:
     - `sessionId`: Current active session ID
   - Events:
     - `connection:restored`: Emitted when a session is successfully restored via reconnect

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

5. **Operation Builder** (`src/operation.ts`)
   - Fluent interface for chaining multiple wallet calls
   - Type-safe method calls with proper parameter and result typing
   - Methods:
     - `call()`: Add method call to the chain
     - `execute()`: Execute all chained calls in sequence

6. **Method Serialization** (`src/provider.ts`)
   - Automatic parameter serialization before method calls
   - Purpose:
     - Ensures complex objects are properly serialized before transmission
     - Maintains compatibility with chain-specific data structures
     - Provides transparent serialization without manual intervention
   
   - **Registering Serializers**:
     ```typescript
     // Register a serializer for a specific method
     provider.registerMethodSerializer('aztec_sendTransaction', (params) => {
       // Transform parameters before sending
       return params.map(param => serializeTransaction(param));
     });
     
     // Register multiple serializers at once
     provider.registerMethodSerializer({
       'aztec_sendTransaction': transactionSerializer,
       'aztec_deploy': deploymentSerializer,
       'aztec_call': callSerializer
     });
     ```
   
   - **Aztec Example**:
     ```typescript
     import { aztecSerializers } from '@walletmesh/aztec/rpc-wallet';
     
     // Create provider with Aztec serializers
     const provider = new WalletRouterProvider(transport);
     
     // Register all Aztec-specific serializers
     provider.registerMethodSerializer(aztecSerializers);
     
     // Now calls are automatically serialized
     const result = await provider.call('aztec:mainnet', {
       method: 'aztec_sendTransaction',
       params: [complexAztecTransaction] // Automatically serialized
     });
     ```
   
   - **How It Works**:
     - Serializers are applied before the method call is wrapped in `wm_call`
     - The router receives already-serialized parameters
     - Return values are not affected (deserialization handled separately)
     - Serializers are method-specific and only applied when the method matches

7. **Error Handling** (`src/errors.ts`)
   - **RouterError**: Custom error class for router-specific errors
   - Standard error codes with descriptive messages
   - Detailed error data for debugging

8. **Middleware** (`src/middleware.ts`)
   - Session validation middleware
   - Permission checking middleware
   - Request transformation middleware

9. **Local Transport** (`src/localTransport.ts`)
   - Utility for creating in-process transport connections
   - **LocalTransport**: Direct connection between nodes without network overhead
   - **LocalTransportOptions**: Configuration interface with error handling options
     - `throwOnError?: boolean` - Whether to throw errors (true) or log warnings (false, default)
   - **createLocalTransportPair(options?)**: Creates bidirectionally connected transports
   - **createLocalTransport(node, options?)**: Connects to an existing JSONRPCNode
   - Useful for testing and embedded wallet implementations
   - Error handling modes:
     - Default mode: Errors are logged as warnings, transport continues operating
     - Strict mode (`throwOnError: true`): Errors are thrown, useful for testing

## Main Workflows

### Setting Up the Router

```typescript
// Create transports for your wallets
const [ethClientTransport, ethWalletTransport] = createLocalTransportPair();
const [polygonClientTransport, polygonWalletTransport] = createLocalTransportPair();

// Initialize wallets with the wallet-side transports
const ethWallet = createEthereumWallet(ethWalletTransport);
const polygonWallet = createPolygonWallet(polygonWalletTransport);

// Create the router with client-side transports
const router = new WalletRouter(
  routerTransport,
  new Map([
    ['eip155:1', ethClientTransport],     // Ethereum mainnet
    ['eip155:137', polygonClientTransport] // Polygon
  ]),
  permissionManager,
  { sessionStore: new LocalStorageSessionStore() }
);
```

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

// Save session ID for later reconnection (e.g., after page refresh)
localStorage.setItem('wallet_session_id', sessionId);

// Reconnect to an existing session (e.g., on page load)
const savedSessionId = localStorage.getItem('wallet_session_id');
if (savedSessionId) {
  try {
    const result = await provider.reconnect(savedSessionId);
    if (result.status) {
      console.log('Reconnected with permissions:', result.permissions);
    }
  } catch (error) {
    console.error('Reconnection failed:', error);
    localStorage.removeItem('wallet_session_id');
  }
}

// Listen for successful reconnection
provider.on('connection:restored', ({ sessionId, permissions }) => {
  console.log(`Session ${sessionId} restored with permissions:`, permissions);
});

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

5. `connection:restored`: Emitted when a session is successfully restored via reconnect
   ```typescript
   {
     sessionId: 'session123',
     permissions: {
       'eip155:1': {
         eth_accounts: {
           allowed: true,
           shortDescription: 'View Accounts',
           longDescription: 'Allow viewing your Ethereum addresses'
         }
       }
     }
   }
   ```

## Session Persistence Best Practices

### For Wallet Developers

Use `LocalStorageSessionStore` to persist dApp connections across wallet app refreshes:

```typescript
import { LocalStorageSessionStore, WalletRouter } from '@walletmesh/router';

// Create persistent session store (survives browser restarts)
const sessionStore = new LocalStorageSessionStore({
  lifetime: 24 * 60 * 60 * 1000,  // 24 hours
  refreshOnAccess: true,           // Extend lifetime on each access
});

// Use in WalletRouter
const router = new WalletRouter(
  transport,
  walletsMap,
  permissionManager,
  { sessionStore }
);
```

**Benefits:**
- ✅ Sessions persist across wallet app page refreshes
- ✅ Sessions persist across browser restarts
- ✅ 24-hour automatic expiry with configurable lifetime
- ✅ Session lifetime refreshes on wallet activity
- ✅ Automatic cleanup of expired sessions

### For dApp Developers

Sessions automatically persist via modal-core's Zustand store:

```typescript
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{ appName: 'My dApp' }}>
      <YourApp />
    </WalletMeshProvider>
  );
}

// Sessions survive page refreshes automatically!
// No additional configuration needed
```

**Manual reconnection** (optional):

```typescript
import { WalletRouterProvider } from '@walletmesh/router';

// Save session ID for custom reconnection logic
const { sessionId } = await provider.connect({...});
localStorage.setItem('custom_session_key', sessionId);

// Later, reconnect manually
const savedSessionId = localStorage.getItem('custom_session_key');
if (savedSessionId) {
  try {
    const result = await provider.reconnect(savedSessionId);
    if (result.status) {
      console.log('Reconnected!');
    }
  } catch (error) {
    console.error('Reconnection failed:', error);
    localStorage.removeItem('custom_session_key');
  }
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

## Implementing a Wallet

To add support for a new blockchain, you need to provide a transport that connects to your wallet implementation:

```typescript
import { JSONRPCNode } from '@walletmesh/jsonrpc';
import type { JSONRPCTransport, WalletMethodMap } from '@walletmesh/router';
import { createLocalTransportPair } from '@walletmesh/router';

// Option 1: Create a local transport pair for in-process wallet
const [clientTransport, walletTransport] = createLocalTransportPair();

// Option 1a: Create with strict error handling (useful for tests)
const [strictClient, strictWallet] = createLocalTransportPair({ throwOnError: true });

// Create a wallet node with your implementation
const walletNode = new JSONRPCNode<WalletMethodMap>(walletTransport);

// Register wallet methods
walletNode.registerMethod('method1', async (context, params) => {
  // Implement method logic
  return myChainAdapter.doSomething(params);
});

walletNode.registerMethod('method2', async (context, params) => {
  // Implement another method
  return myChainAdapter.doSomethingElse(params);
});

// Register method discovery (optional but recommended)
walletNode.registerMethod('wm_getSupportedMethods', async () => {
  return ['method1', 'method2'];
});

// Pass the client transport to the router
router.addWallet('mychain:mainnet', clientTransport);

// Option 2: Create a custom transport for remote wallet
const remoteTransport: JSONRPCTransport = {
  send: async (message) => {
    // Send message to remote wallet (e.g., via WebSocket, HTTP, etc.)
    await websocket.send(JSON.stringify(message));
  },
  onMessage: (handler) => {
    // Setup handler for incoming messages from remote wallet
    websocket.on('message', (data) => {
      handler(JSON.parse(data));
    });
  }
};

// Register the remote transport with the router
router.addWallet('mychain:mainnet', remoteTransport);
```

### Transport Requirements

The transport must implement the `JSONRPCTransport` interface:
- `send(message: unknown): Promise<void>` - Send messages to the wallet
- `onMessage(handler: (message: unknown) => void): void` - Register handler for incoming messages

The router will automatically create a JSONRPCProxy to handle:
- Request/response correlation
- Timeout management

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
