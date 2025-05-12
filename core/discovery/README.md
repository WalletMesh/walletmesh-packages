# @walletmesh/discovery

Cross-origin wallet discovery protocol implementation for WalletMesh.

## Installation

```bash
npm install @walletmesh/discovery
# or
pnpm add @walletmesh/discovery
# or 
yarn add @walletmesh/discovery
```

## Usage

### For Wallets (Announcing)

```typescript
import { createWebWalletAnnouncer, createExtensionWalletAnnouncer } from '@walletmesh/discovery';

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

### For dApps (Discovery)

```typescript
import { createDiscoveryListener } from '@walletmesh/discovery';

const listener = createDiscoveryListener(['ethereum', 'evm'], (wallet) => {
  console.log('Discovered wallet:', wallet);
});

listener.start();

// Get all discovered wallets
const wallets = listener.wallets;
```

## API Documentation

### DiscoveryAnnouncer

Class for announcing wallet availability to dApps.

- `start()`: Begin announcing wallet availability
- `stop()`: Stop announcing wallet availability

### DiscoveryListener

Class for discovering available wallets.

- `start()`: Begin listening for wallet announcements
- `stop()`: Stop listening for wallet announcements
- `wallets`: Get array of discovered wallets

## Events

The discovery protocol uses custom events for communication:

- `wm:discovery:ready`: Announced by wallet when ready
- `wm:discovery:request`: Sent by dApp to discover wallets
- `wm:discovery:response`: Sent by wallet in response to request
- `wm:discovery:ack`: Sent by dApp to acknowledge wallet

## Security

- Cross-origin communication is handled securely
- Wallet announcer can filter origins
- Events are validated before processing
- Discovery IDs prevent replay attacks

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Generate docs
pnpm docs
```

## License

Apache-2.0
