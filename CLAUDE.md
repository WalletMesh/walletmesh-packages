# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint & Test Commands
- **Build**: `pnpm build` (all packages), `pnpm -F @walletmesh/package-name build` (single package)
- **Test**: `pnpm test` (all tests), `pnpm test -- src/path/to/file.test.ts` (single test)
- **Test with watch**: `pnpm test:watch -- src/path/to/file.test.ts`
- **Coverage**: `pnpm coverage`
- **Lint**: `pnpm lint`, `pnpm lint:fix` (auto-fix)
- **Format**: `pnpm format`, `pnpm format:fix` (auto-fix)
- **Type check**: `pnpm type-check` (all files), `pnpm type-check:build` (production files only, skips test files)
- **Documentation**: `pnpm docs` (generates TypeDoc documentation)
- **Create new package**: `bash create-package.sh package-name`
- **Versioning**: `pnpm changeset` (create a changeset for version updates)
- **Before commit verification**: `pnpm lint && pnpm type-check:build && pnpm test`

## Memory Management

### CLAUDE.md Structure
- **Root CLAUDE.md** (this file): Contains project-wide information and architecture overview
- **Package-specific CLAUDE.md files**: Located in each package directory, contain detailed implementation information:
  - `/core/jsonrpc/CLAUDE.md`: Details about JSON-RPC implementation
  - `/core/router/CLAUDE.md`: Details about router implementation
  - `/core/discovery/CLAUDE.md`: Details about discovery protocol
  - Additional package directories may have their own CLAUDE.md files
- **Usage**: All AI assistants (including cline) should refer to these files first when working with packages
- **Maintenance**: When making significant changes to a package, update its CLAUDE.md file

### Key Files to Remember
- **Package Structures**: Each package follows a similar structure with src/, tests/, and docs/ directories
- **Core Implementation Files**:
  - `src/index.ts`: Main entry point and public API
  - `src/types.ts`: Type definitions and interfaces
  - `src/*.test.ts`: Unit tests for corresponding implementation files

### Search Patterns
- Use the Glob tool with patterns like `**/*.ts` to find TypeScript files
- Search for class definitions with `class ClassName`
- Search for interface definitions with `interface InterfaceName`
- Search for methods with `methodName(`
- Search for imports with `import { ComponentName }`

### Important Implementation Details
- JSONRPCNode (jsonrpc package) is the core communication class
- WalletRouter (router package) manages multi-chain connections
- DiscoveryAnnouncer/DiscoveryListener (discovery package) handle wallet discovery

## Code Style Guidelines
- **Formatting**: Use Biome with 2-space indentation, single quotes for strings
- **Imports**: Use ES modules with .js extension in import paths
- **Types**: Use strict TypeScript. Explicit return types on functions, no implicit any
- **Naming**: PascalCase for classes/interfaces/types, camelCase for variables/functions/methods
- **Tests**: Create comprehensive tests with at least 80% coverage. Test both happy and error paths
- **File Organization**: Related functionality should be grouped together in the same directory
- **Documentation**: Use JSDoc comments for public APIs and typedoc for generating documentation

## Best Practices

### Code Modification
- **Read First**: Always read the existing code thoroughly before making changes
- **Test Coverage**: Write tests for all new code and changes
- **Documentation**: Update documentation when changing public APIs
- **Consistent Style**: Follow existing code style and patterns
- **Error Handling**: Provide proper error handling with descriptive messages

### Debugging Guidelines
- Use console.log statements with descriptive tags
- Add comments explaining complex logic or algorithms
- Check for TypeScript errors with `pnpm type-check`
- Run unit tests frequently with `pnpm test`

### TypeScript Best Practices
- Use interfaces for object shapes that may be implemented
- Use type aliases for unions, intersections, and complex types
- Leverage TypeScript's utility types (Partial, Required, Pick, etc.)
- Use generics to maintain type safety across operations
- Avoid type assertions (as) unless absolutely necessary

## Architecture Overview

WalletMesh is a modular framework for connecting web applications to blockchain wallets. The repository is organized into several packages:

### Core Packages

#### @walletmesh/discovery
Handles wallet discovery and announcement mechanisms.

**Key Components**:
- `DiscoveryAnnouncer`: Announces wallet availability to applications
  - Located in `src/client.ts`
  - Factory methods: `createWebWalletAnnouncer` and `createExtensionWalletAnnouncer`
  - Used by wallets to announce their presence across origins

- `DiscoveryListener`: Listens for wallet announcements from applications
  - Located in `src/server.ts`
  - Factory method: `createDiscoveryListener`
  - Used by dApps to discover available wallets

- Event-based communication system
  - Protocol events defined in `src/constants.ts`
  - Standard events: ready, request, response, acknowledgment
  - Secure cross-origin communication

#### @walletmesh/jsonrpc
A type-safe implementation of the JSON-RPC 2.0 protocol.

**Key Components**:
- `JSONRPCNode`: Core class for bi-directional JSON-RPC communication
  - Manages methods, events, middleware, and message handling
  - Provides type-safe request/response handling
  - Supports serialization of complex objects

- Supporting Managers:
  - `MethodManager`: Handles method registration and invocation
  - `EventManager`: Manages event subscription and publishing
  - `MiddlewareManager`: Controls middleware execution chain
  - `RequestHandler`: Processes incoming JSON-RPC requests

- Error Handling:
  - `JSONRPCError`: Standard-compliant error class with error codes
  - Proper error serialization and propagation

#### @walletmesh/router
Router system for managing multi-chain wallet connections.

**Key Components**:
- `WalletRouter`: Core routing system connecting applications to wallets
  - Manages sessions, permissions, and client connections
  - Routes requests to appropriate wallet implementations
  - Supports batch operations across multiple chains

- Permission System:
  - Granular per-method and per-chain permissions
  - `PermissionManager` interface for custom permission strategies
  - Built-in managers like `AllowAskDenyManager`

- Session Management:
  - Secure session handling with unique identifiers
  - Origin validation and permissions enforcement
  - Persistent sessions via configurable storage backends

#### @walletmesh/modal
Library for dApps to display a wallet connection modal.

**Key Components**:
- `WalletMeshClient`: Main client interface for dApps
- `WalletProvider`: React context provider for wallet state
- `ConnectButton`: UI component for initiating wallet connections

### Aztec Packages

#### @walletmesh/aztec/rpc-wallet
Integration with Aztec network wallets.

**Key Components**:
- `AztecChainProvider`: Chain-specific provider implementation
- `AztecChainWallet`: Wallet implementation for Aztec network
- Specialized serializers for Aztec objects and transactions

#### @walletmesh/aztec/helpers
Helper utilities for Aztec integration.

**Key Components**:
- Functions for working with contract artifacts
- Functions for extracting function parameter information

#### @walletmesh/aztec/meta
Meta package that exports all Aztec-related packages.

### Development Workflow

1. Changes should follow the monorepo structure:
   - Make changes within the appropriate package
   - Add tests alongside implementation
   - Generate documentation for public APIs

2. Use changesets for versioning:
   - Run `pnpm changeset` after making changes
   - Document the nature of changes (major/minor/patch)
   - Changesets are used for automated versioning and changelog generation

3. Test across package boundaries:
   - Changes in core packages may affect dependent packages
   - Run the full test suite to catch integration issues