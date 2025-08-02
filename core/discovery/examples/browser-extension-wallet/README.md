# Browser Extension Wallet Example

This example demonstrates how to implement a browser extension wallet using the WalletMesh discovery protocol. The extension uses:
- Content script as a minimal message relay
- Background script for wallet functionality and permission management
- JSON-RPC for communication with dApps
- Secure origin validation and session management

**Updated:** This example now properly imports and uses the `@walletmesh/discovery` and `@walletmesh/jsonrpc` packages instead of reimplementing the protocol. It demonstrates how to create a custom Chrome extension transport adapter for the discovery announcer.

## Architecture

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│     dApp Page    │         │  Content Script  │         │ Background Script│
│                  │         │   (relay only)   │         │  (wallet logic)  │
│ DiscoveryInitiator│◄────────┤                  ├─────────┤                  │
│    JSON-RPC      │         │  Message Bridge  │         │DiscoveryResponder│
│                  │────────►│                  │◄────────┤    JSON-RPC      │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

## Files

- **manifest.json** - Chrome extension manifest v3
- **content.ts** - Minimal content script that relays messages
- **background-simple.ts** - Wallet implementation using @walletmesh packages:
  - Uses `DiscoveryResponder` from `@walletmesh/discovery`
  - Uses `JSONRPCNode` from `@walletmesh/jsonrpc`
  - Custom `ChromeExtensionTransport` adapter for browser messaging
  - Built-in security policies and chain matching
  - Permission management
  - Session tracking
- **popup.html/ts** - Extension popup for permission management
- **types.ts** - Extension-specific type definitions (imports core types from @walletmesh/discovery)
- **tsconfig.json** - TypeScript configuration
- **vite.config.ts** - Vite configuration for bundling
- **package.json** - Package configuration with dependencies on @walletmesh packages

## Key Features

1. **Secure Message Relay**: Content script only forwards messages, no wallet logic
2. **Protocol Compliance**: Uses actual @walletmesh/discovery package for proper protocol implementation
3. **Custom Transport**: Demonstrates how to create a Chrome extension transport adapter
4. **Built-in Security**: Leverages discovery package's security policies and validators
5. **Origin Validation**: Background script validates all message origins
6. **Permission Management**: User approval required for sensitive operations
7. **Session Management**: Tracks active connections and permissions
8. **Multi-Chain Support**: Example supports Ethereum, Polygon, and BSC

## Security

- All wallet logic runs in the privileged background context
- Origin validation using `sender.tab.url`
- Session tracking prevents replay attacks
- Rate limiting per origin
- Permission scoping by origin and method

## Installation

### Development
1. Run `pnpm install` to install dependencies
2. Run `pnpm dev` to build in watch mode
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `dist` directory
6. The extension will appear in your browser

### Production Build
1. Run `pnpm install` to install dependencies
2. Run `pnpm build` to create optimized build
3. Load the `dist` directory as an unpacked extension

## Testing

Open the included test dApp (in a separate examples directory) to test the wallet connection and permission flows.

## Development

To modify the wallet:
1. Edit the files as needed
2. Vite will automatically rebuild (if using `pnpm dev`)
3. Click "Reload" in Chrome extensions page
4. Refresh any open dApp pages

## Implementation Details

### Chrome Extension Transport

The example demonstrates how to create a custom transport adapter for Chrome extensions:

```typescript
class ChromeExtensionTransport extends EventTarget {
  // Listens for discovery requests from content scripts
  // Converts Chrome runtime messages to discovery protocol events
  // Routes announcements back to the correct tab
}
```

### Using Discovery Package

Instead of reimplementing the protocol, the extension:
1. Imports `DiscoveryResponder` from `@walletmesh/discovery`
2. Creates wallet info using the package's helper functions
3. Uses built-in security policies and chain matching
4. Handles protocol events with proper type safety

### Benefits of Using the Package

1. **Protocol Compliance**: Guaranteed compatibility with the standard
2. **Type Safety**: Full TypeScript support with imported types
3. **Security**: Built-in origin validation, rate limiting, and session tracking
4. **Maintenance**: Automatic updates when the protocol evolves
5. **Less Code**: Focus on extension-specific logic, not protocol implementation

## Integration with Modal

The discovery announcement includes the extension ID, allowing modal packages to:
1. Detect the wallet through discovery
2. Connect directly using Chrome runtime messaging
3. Establish secure JSON-RPC communication