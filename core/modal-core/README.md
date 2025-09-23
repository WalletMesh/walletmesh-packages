# WalletMesh Modal Core

> **⚠️ IMPORTANT: This package is for FRAMEWORK DEVELOPERS ONLY**
> 
> **If you're building a dApp, use one of our framework packages instead:**
> - React: [`@walletmesh/modal-react`](https://www.npmjs.com/package/@walletmesh/modal-react)
> - Vue: [`@walletmesh/modal-vue`](https://www.npmjs.com/package/@walletmesh/modal-vue) (coming soon)
> - Svelte: [`@walletmesh/modal-svelte`](https://www.npmjs.com/package/@walletmesh/modal-svelte) (coming soon)
> - Angular: [`@walletmesh/modal-angular`](https://www.npmjs.com/package/@walletmesh/modal-angular) (coming soon)
> - Lit: [`@walletmesh/modal-lit`](https://www.npmjs.com/package/@walletmesh/modal-lit) (coming soon)

Framework-agnostic wallet connection modal system with standardized events, type-safe APIs, and multi-chain support.

## 📦 Installation

```bash
npm install @walletmesh/modal-core
```

## 🚀 Quick Start

**For dApp developers:** Please use a framework package (see above).

**For framework developers:** See our [documentation](./documentation/README.md).

## 📖 Documentation

All documentation is organized in the [`documentation/`](./documentation/README.md) directory:

- **[Getting Started](./documentation/getting-started/README.md)** - Installation and basic setup
- **[Developer Guides](./documentation/guides/README.md)** - Role-specific guides
  - [Framework Developers](./documentation/guides/framework-developers.md)
  - [Wallet Adapter Developers](./documentation/guides/wallet-adapter-developers.md)
  - [dApp Developers](./documentation/guides/dapp-developers.md) (if using modal-core directly)
  - [Aztec Proving Flow](./documentation/guides/aztec-proving-flow.md) - Zero-knowledge proof generation
- **[API Reference](./documentation/api/README.md)** - Complete API documentation
- **[Architecture](./documentation/architecture/README.md)** - System design and patterns
- **[Examples](./documentation/examples/README.md)** - Code examples

### Service Documentation
- **[Service Integration Guide](./documentation/architecture/SERVICE_INTEGRATION.md)** - How services interact and integrate
- **[Service Sequence Diagrams](./documentation/architecture/SERVICE_SEQUENCE_DIAGRAMS.md)** - Visual service interaction flows
- **[Service API Reference](./documentation/architecture/SERVICE_API_REFERENCE.md)** - Quick reference for all service APIs

## 🛠️ Core Features

- **Framework Agnostic** - Works with any UI framework or vanilla JavaScript
- **Type-Safe** - Full TypeScript support with runtime validation
- **Multi-Chain** - Support for EVM, Solana, Aztec, and more
- **Provider Access** - Direct access to wallet providers
- **Event System** - Standardized wallet events
- **SSR Compatible** - Server-side rendering support
- **Resource Management** - Automatic cleanup
- **Aztec Proving Support** - Dedicated UI state for zero-knowledge proof generation

## 🏗️ Basic Usage

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';

// Create client instance
const client = createWalletMeshClient({
  appName: 'My dApp',
  appDescription: 'My decentralized application',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png'
});

// Connect to a wallet
const session = await client.connect();
console.log('Connected:', session.address);

// Use the provider
const provider = session.provider;
const balance = await provider.getBalance(session.address);
```

## 🤝 Contributing

See our [Contributing Guide](./documentation/contributing/README.md) for development setup and guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@walletmesh/modal-core)
- [GitHub Repository](https://github.com/walletmesh/walletmesh-packages)
- [Documentation](./documentation/README.md)
- [Examples](./documentation/examples/README.md)