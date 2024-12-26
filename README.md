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

## Release Process

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versions, create changelogs, and publish to npm.

### Making Changes

1. Create a new branch for your changes
2. Make your changes
3. Run `pnpm changeset` to create a changeset
4. Commit and push your changes
5. Create a pull request

The changeset bot will automatically check if you've included a changeset when modifying packages.

### Publishing

The release process is fully automated through changesets and GitHub Actions:

1. **Change Management** (.github/workflows/changeset-bot.yml)
   - Runs on pull requests
   - Checks if package changes include a changeset
   - Ensures version management consistency
   - Changesets capture the type of change (major/minor/patch)

2. **Automated Publishing** (.github/workflows/publish.yml)
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
