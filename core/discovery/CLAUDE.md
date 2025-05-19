# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

The @walletmesh/discovery package implements a cross-origin wallet discovery protocol for WalletMesh. It enables:
- Web-based wallets to announce their availability to dApps
- Browser extension wallets to announce their availability to dApps
- dApps to discover and connect to available wallets

## Build & Test Commands
- **Build**: `pnpm build`
- **Test**: `pnpm test` (all tests), `pnpm test -- src/path/to/file.test.ts` (single test)
- **Test with watch**: `pnpm test:watch -- src/path/to/file.test.ts`
- **Coverage**: `pnpm coverage`
- **Lint**: `pnpm lint`, `pnpm lint:fix` (auto-fix)
- **Format**: `pnpm format`, `pnpm format:fix` (auto-fix)
- **Type check**: `pnpm type-check` (all files), `pnpm type-check:build` (production files only)
- **Documentation**: `pnpm docs` (generates TypeDoc documentation)

## Memory Management

### Key Files to Remember
- `src/client.ts`: Contains `DiscoveryAnnouncer` implementation
- `src/server.ts`: Contains `DiscoveryListener` implementation
- `src/constants.ts`: Contains event type definitions and protocol constants
- `src/types.ts`: Contains wallet information type definitions
- `src/guards.ts`: Contains type guards for runtime validation

### Search Patterns
- Find event types with pattern `wm:discovery:`
- Find wallet type definitions with `interface *WalletInfo`
- Find factory methods with `create*`

### Important Relationships
- DiscoveryAnnouncer sends events, DiscoveryListener receives them
- Events flow in a specific sequence: ready → request → response → ack
- Web wallets and extension wallets have different announcement mechanisms

## Architecture

### Discovery Protocol Flow

1. **Wallet Announces Readiness**:
   - Wallet sends `wm:discovery:ready` event
   - Indicates the wallet is ready to respond to discovery requests

2. **dApp Sends Discovery Request**:
   - dApp sends `wm:discovery:request` event with supported technologies
   - Includes a unique discovery ID to prevent replay attacks

3. **Wallet Responds to Request**:
   - Wallet validates origin and sends `wm:discovery:response`
   - Includes wallet information (name, icon, supported technologies)

4. **dApp Acknowledges Discovery**:
   - dApp sends `wm:discovery:ack` event
   - Confirms receipt of wallet information

### Key Components

1. **DiscoveryAnnouncer** (`src/client.ts`)
   - Used by wallets to announce their presence to dApps
   - Factory methods:
     - `createWebWalletAnnouncer`: For web-based wallets
     - `createExtensionWalletAnnouncer`: For browser extensions
   - Main methods:
     - `start()`: Begin announcing wallet availability
     - `stop()`: Stop announcing wallet availability
   - Handles:
     - Origin validation through callbacks
     - Response to discovery requests
     - Protocol version compatibility

2. **DiscoveryListener** (`src/server.ts`)
   - Used by dApps to discover available wallets
   - Factory method: `createDiscoveryListener`
   - Main methods:
     - `start()`: Begin listening for wallet announcements
     - `stop()`: Stop listening for wallet announcements
     - `wallets`: Get all discovered wallets
   - Handles:
     - Sending discovery requests
     - Processing wallet responses
     - Acknowledging discovered wallets
     - Filtering by supported technologies

3. **Event System** (`src/constants.ts`)
   - Standard events for cross-origin communication:
     - `wm:discovery:ready`: Announced by wallet when ready
     - `wm:discovery:request`: Sent by dApp to discover wallets
     - `wm:discovery:response`: Sent by wallet in response to request
     - `wm:discovery:ack`: Sent by dApp to acknowledge wallet
   - Protocol version information:
     - Used to ensure compatibility between implementations
     - Prevents issues with mismatched protocol versions

4. **Wallet Types** (`src/types.ts`)
   - `WebWalletInfo`: Web-based wallets with URL endpoints
     - Properties: name, icon, url, id, supportedTechnologies
     - Can filter requests by origin
   - `ExtensionWalletInfo`: Browser extension wallets
     - Properties: name, icon, id, supportedTechnologies, extensionId
     - Optional verification code for secure communication
   - `BaseWalletInfo`: Shared base interface
     - Common properties used by both wallet types
     - Type discriminator to differentiate wallet types

5. **Type Guards** (`src/guards.ts`)
   - Functions to validate event types and data structures
   - Example functions:
     - `isDiscoveryRequestEvent`: Validates request event structure
     - `isDiscoveryResponseEvent`: Validates response event structure
     - `isWalletInfo`: Validates wallet information objects
   - Ensures type safety at runtime

## Best Practices

### Working with the Discovery Package
- Use factory methods instead of direct class instantiation
- Always validate incoming event data using type guards
- Implement proper error handling for network failures
- Cleanup resources with `.stop()` when components are no longer needed
- Use TypeScript's discriminated unions for wallet type checking

### Debugging Tips
- Debug event flow issues by logging event sequence
- Check for origin validation issues when discovery fails
- Verify protocol version compatibility
- Inspect event payload structure for malformed data

## Common Development Workflows

### Announcing Wallet Availability (Wallet-side)

```typescript
// For web-based wallets
const webWalletAnnouncer = createWebWalletAnnouncer(
  'My Web Wallet',
  'https://my-wallet.com/icon.png',
  'com.my-wallet.web',
  'https://my-wallet.com',
  ['ethereum', 'evm'],
  (origin) => allowedOrigins.includes(origin)
);

webWalletAnnouncer.start();

// For extension-based wallets
const extensionWalletAnnouncer = createExtensionWalletAnnouncer(
  'My Extension Wallet',
  'chrome://extension/icon.png',
  'com.my-wallet.extension',
  ['ethereum', 'evm'],
  'my-extension-id',
  'optional-code'
);

extensionWalletAnnouncer.start();
```

### Discovering Wallets (dApp-side)

```typescript
const listener = createDiscoveryListener(['ethereum', 'evm'], (wallet) => {
  console.log('Discovered wallet:', wallet);

  // Connect to the wallet based on type
  if (wallet.type === 'web') {
    // Connect to web wallet using URL
    connectToWebWallet(wallet.url);
  } else if (wallet.type === 'extension') {
    // Connect to extension wallet
    connectToExtensionWallet(wallet.extensionId);
  }
});

listener.start();

// Get all discovered wallets
const wallets = listener.wallets;
```

## Security Considerations

- **Origin Validation**: Always validate origins in cross-origin communication
  - Web wallets should implement the origin validation callback
  - Only respond to requests from trusted origins

- **Data Validation**: Use the provided type guards to verify event structures
  - Validate all incoming messages before processing
  - Reject malformed or unexpected message formats

- **Unique Discovery IDs**: Each discovery request has a unique ID
  - Prevents replay attacks
  - Wallets should track recently seen IDs

- **Protocol Version**: Ensure compatibility between implementations
  - Check protocol version in messages
  - Reject incompatible versions

- **Extension Communication**: For extension wallets, use verification codes
  - Helps authenticate extension identity
  - Prevents spoofing attempts

## Testing

The package has comprehensive tests covering:
- Event-based communication
- Origin validation
- Discovery protocol flow
- Error handling

When adding new features, ensure that you test:
- Happy paths (successful discovery)
- Error paths (invalid messages, unknown wallets)
- Edge cases (network interruptions, concurrent requests)
- Cross-origin scenarios