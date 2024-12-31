# WalletMesh Core

Core libraries implementing the WalletMesh Protocol - a protocol enabling secure communication between wallets and applications.

## Packages

- [@walletmesh/discovery](packages/discovery) - A protocol implementation for discovering web3 wallets in both browser extensions and web applications, enabling DApps to discover available wallets and wallets to announce their presence to DApps.
- [@walletmesh/jsonrpc](packages/jsonrpc) - A comprehensive TypeScript implementation of the JSON-RPC 2.0 protocol, designed for building robust client-server applications with bi-directional communication capabilities, featuring full type safety, middleware support, and event handling.
- [@walletmesh/router](packages/router) - A flexible routing system for managing multi-chain wallet connections with bi-directional communication support, providing granular permissions, session management, and unified interfaces across different chains.

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

# Format code
pnpm format:fix

# Lint code
pnpm lint:fix
```

### Creating a New Package

```bash
bash create-package.sh <name>
```

This will create a new package in `packages/<name>` with the package name `@walletmesh/<name>`.

## Release Process

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versions, create changelogs, and publish to npm.

### Making Changes

1. Create a new branch for your changes
2. Make your changes
3. Run `pnpm changeset` to create a changeset
4. Commit and push your changes
5. Create a pull request

### Publishing

The release process is automated through changesets and GitHub Actions:

1. **Automated Publishing**
   - Monitors the main branch for merged changesets
   - Automatically creates a "Version Packages" PR that:
     - Aggregates all pending changesets
     - Updates package versions
     - Generates changelogs
   - When the "Version Packages" PR is merged:
     - Creates git tags for the releases
     - Publishes packages to npm with provenance
     - Cleans up the changesets

This automated process eliminates the need for manual version bumping and ensures that all changes are properly tracked and documented.

## License

Apache-2.0
