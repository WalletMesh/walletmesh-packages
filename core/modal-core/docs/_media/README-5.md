# WalletMesh Modal Core Examples

This directory contains practical examples demonstrating how to use WalletMesh Modal Core in various scenarios.

## 📚 Available Examples

### Basic Examples
- [Quick Start](./quick-start.ts) - Minimal setup example
- [Multi-Wallet Connection](./multi-wallet.ts) - Managing multiple wallets
- [Custom Wallet Adapter](./custom-adapter.ts) - Creating a custom wallet adapter

### Framework Integration
- [React Integration](./frameworks/react-example.tsx) - Using with React
- [Vue Integration](./frameworks/vue-example.vue) - Using with Vue
- [Vanilla JS](./frameworks/vanilla-example.js) - No framework example

### Advanced Examples
- [Session Management](./advanced/session-management.ts) - Persistent sessions
- [Error Recovery](./advanced/error-recovery.ts) - Handling errors gracefully
- [Custom Provider](./advanced/custom-provider.ts) - Implementing a custom provider

## 🚀 Running Examples

Most examples can be run directly with Node.js or in a browser environment. Framework examples may require additional setup.

### Basic Setup

```typescript
// All examples start with this basic setup
import { createWalletMeshClient } from '@walletmesh/modal-core';

const client = createWalletMeshClient({
  appName: 'Example dApp',
  appDescription: 'WalletMesh example application',
  appUrl: 'https://example.com',
  appIcon: 'https://example.com/icon.png'
});
```

## 📖 Example Categories

### For dApp Developers
- Quick Start - Get up and running quickly
- Multi-Wallet Connection - Handle multiple wallet connections
- Error Recovery - Build resilient applications

### For Framework Developers
- Framework integration examples
- State management patterns
- Component lifecycle handling

### For Wallet Adapter Developers
- Custom adapter implementation
- Provider integration
- Discovery service setup

## 💡 Tips

- Examples use the latest API patterns
- Each example includes inline comments explaining key concepts
- Examples are tested with each release
- Check the [guides](../guides/README.md) for detailed explanations

## 🔗 Related Resources

- [API Documentation](../api/README.md) - Complete API reference
- [Developer Guides](../guides/README.md) - In-depth guides
- [TypeDoc Reference](../../docs/README.md) - Auto-generated docs