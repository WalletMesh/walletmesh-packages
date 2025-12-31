**@walletmesh/modal-core v0.0.2**

***

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

**For framework developers:** See our [documentation](_media/README.md).

## 📖 Documentation

All documentation is organized in the [`documentation/`](_media/README.md) directory:

- **[Getting Started](_media/README-1.md)** - Installation and basic setup
- **[Developer Guides](_media/README-2.md)** - Role-specific guides
  - [Framework Developers](_media/framework-developers.md)
  - [Wallet Adapter Developers](_media/wallet-adapter-developers.md)
  - [dApp Developers](_media/dapp-developers.md) (if using modal-core directly)
  - [Aztec Proving Flow](_media/aztec-proving-flow.md) - Zero-knowledge proof generation
- **[API Reference](_media/README-3.md)** - Complete API documentation
- **[Architecture](_media/README-4.md)** - System design and patterns
- **[Examples](_media/README-5.md)** - Code examples

### Service Documentation
- **[Service Integration Guide](_media/SERVICE_INTEGRATION.md)** - How services interact and integrate
- **[Service Sequence Diagrams](_media/SERVICE_SEQUENCE_DIAGRAMS.md)** - Visual service interaction flows
- **[Service API Reference](_media/SERVICE_API_REFERENCE.md)** - Quick reference for all service APIs

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

See our [Contributing Guide](_media/README-6.md) for development setup and guidelines.

## 📄 License

MIT License - see [LICENSE](_media/LICENSE) for details.

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@walletmesh/modal-core)
- [GitHub Repository](https://github.com/walletmesh/walletmesh-packages)
- [Documentation](_media/README.md)
- [Examples](_media/README-5.md)
