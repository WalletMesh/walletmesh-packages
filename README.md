# WalletMesh Core

Core libraries implementing the WalletMesh Protocol - a protocol enabling secure communication between wallets and applications.

## Packages

### Core Packages

- [@walletmesh/discovery](core/discovery) - A protocol implementation for discovering web3 wallets in both browser extensions and web applications, enabling DApps to discover available wallets and wallets to announce their presence to DApps.
- [@walletmesh/jsonrpc](core/jsonrpc) - A comprehensive TypeScript implementation of the JSON-RPC 2.0 protocol, designed for building client-server applications with bi-directional communication capabilities, featuring full type safety, middleware support, and event handling.
- [@walletmesh/router](core/router) - A flexible routing system for managing multi-chain wallet connections with bi-directional communication support, providing granular permissions, session management, and unified interfaces across different chains.

### Aztec Integration Packages

- [@walletmesh/aztec/rpc-wallet](aztec/rpc-wallet) - Integration with Aztec network supporting chain-specific wallet operations.
- [@walletmesh/aztec/helpers](aztec/helpers) - Utility functions for working with Aztec contracts and functions.

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

# Type check
pnpm type-check

# Generate documentation
pnpm docs

# Format code
pnpm format:fix

# Lint code
pnpm lint:fix
```

### Development Workflow

1. Before making changes, ensure all tests pass: `pnpm test`
2. Make your changes following the code style guidelines
3. Run type checks: `pnpm type-check`
4. Ensure linting passes: `pnpm lint:fix`
5. Run tests to verify changes: `pnpm test`
6. Create a changeset to document your changes: `pnpm changeset`
7. Commit and push your changes

### Creating a New Package

```bash
pnpm create-package <package-name>
```

This will create a new package in `core/<package-name>` with the package name `@walletmesh/<package-name>`.

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
