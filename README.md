# WalletMesh Core

Core libraries implementing the WalletMesh Protocol - a protocol enabling secure communication between wallets and applications.

## Packages

- [@walletmesh/discovery](packages/discovery) - Service discovery and client-server communication
- [@walletmesh/jsonrpc](packages/jsonrpc) - JSON-RPC implementation
- [@walletmesh/router](packages/router) - Request routing and permissions management

See individual package READMEs for detailed documentation.

## Development

This is a monorepo managed with [pnpm](https://pnpm.io/). [Biome](https://biomejs.dev) is used for formatting and linting.

### Prerequisites

- [Node.js](https://nodejs.org/) (see package.json for version)
- [pnpm](https://pnpm.io/)

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm coverage
```

### Creating a New Package

```bash
pnpm create-package <name>
```

This will create a new package in `packages/<name>` with the package name `@walletmesh/<name>`.

## License

Apache-2.0
