# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

### Most Common Commands
```bash
# Development workflow
pnpm build          # Build all packages
pnpm test           # Run all tests  
pnpm lint           # Check lint issues
pnpm type-check     # Check TypeScript

# Package-specific
pnpm -F @walletmesh/jsonrpc test   # Test specific package
pnpm -F @walletmesh/jsonrpc build  # Build specific package

# Full validation before commit
pnpm format:fix && pnpm lint && pnpm type-check && pnpm test
```

### Key Directories
- `/core/` - Core packages (jsonrpc, router, discovery, modal-core, modal-react)
- `/aztec/` - Aztec blockchain integration packages
- Each package has: `src/`, `tests/`, `CLAUDE.md`

### Critical Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration
- `CLAUDE.md` files - Package-specific implementation details

## Repository Overview

WalletMesh is a modular framework for connecting web applications (dApps) to blockchain wallets. It provides a standardized interface for wallet discovery, connection, and interaction across multiple blockchain networks.

## Project Standards

### Package Management & Tools
- **Package Manager**: Use pnpm for all package management
- **Language**: Use TypeScript for all code with strict typing
- **Versioning**: Use `changeset` for versioning and changelogs
- **Linting & Formatting**: Use biome for linting and formatting
- **Testing**: Use vitest for all testing

### Development Environment
The project includes a devcontainer configuration for consistent development environments.

**Available Tools**:
- **ripgrep (rg)**: Fast file content search tool. Use `rg` instead of `grep` for better performance
- **fzf**: Fuzzy finder for interactive file and command searching
- **jq**: Command-line JSON processor for working with JSON data
- **curl**: HTTP client for API testing and debugging

**Environment Variables**:
- `DEVCONTAINER=true`: Indicates the code is running in a devcontainer environment

**Development Setup**:
- The devcontainer automatically sets up all required dependencies
- Node.js and pnpm are pre-installed and configured
- All project dependencies are installed on container creation

### Repository Structure
- **`core/`**: Core walletmesh packages
  - `core/jsonrpc/`: Base JSON-RPC 2.0 implementation. Published as `@walletmesh/jsonrpc`
  - `core/router/`: JSON-RPC Wallet Router for multi-chain connections. Published as `@walletmesh/router`
  - `core/discovery/`: Cross-origin wallet discovery protocol. Published as `@walletmesh/discovery`
- **`aztec/`**: Aztec-specific packages. Published as `@walletmesh/aztec-*`
  - `aztec/meta`: Meta package containing all WalletMesh Aztec packages. Published as `@walletmesh/aztec`
  - `aztec/rpc-wallet`: JSON-RPC backend & dApp provider for Aztec network. Published as `@walletmesh/aztec-rpc-wallet`
  - `aztec/helpers`: Helper utilities for Aztec integration. Published as `@walletmesh/aztec-helpers`

### Package Dependencies
Understanding the dependency relationships between packages is crucial for development:

**Core Package Hierarchy**:
```
@walletmesh/jsonrpc (base layer - no internal dependencies)
    ↑
@walletmesh/router (depends on jsonrpc)
    ↑
@walletmesh/discovery (depends on jsonrpc)
    ↑
@walletmesh/modal-core (depends on router, discovery)
    ↑
@walletmesh/modal-react (depends on modal-core)
```

**Aztec Package Hierarchy**:
```
@walletmesh/aztec-helpers (no internal dependencies)
    ↑
@walletmesh/aztec-rpc-wallet (depends on jsonrpc, router, aztec-helpers)
    ↑
@walletmesh/aztec (meta package - depends on all aztec packages)
```

**Key Dependency Rules**:
- Core packages should not depend on Aztec packages
- Lower-level packages (jsonrpc) should not depend on higher-level packages
- Test dependencies can be more flexible but should follow the same hierarchy
- All packages use workspace protocol for internal dependencies: `"workspace:*"`

**Updating Dependencies**:
- Use `pnpm update` to update external dependencies
- Run `pnpm -r update @walletmesh/*` to update internal workspace dependencies
- Always run tests after updating dependencies to ensure compatibility
- Check for breaking changes in changelog before major updates

## Build, Lint & Test Commands
- **Build**: `pnpm build` (all packages), `pnpm -F @walletmesh/package-name build` (single package)
- **Test**: `pnpm test` (all tests), `pnpm test -- src/path/to/file.test.ts` (single test)
- **Test with watch**: `pnpm test:watch -- src/path/to/file.test.ts`
- **Coverage**: `pnpm coverage`
- **Lint**: `pnpm lint`, `pnpm lint:fix` (auto-fix)
- **Format**: `pnpm format`, `pnpm format:fix` (auto-fix)
- **Type check**: `pnpm type-check`
- **Documentation**: `pnpm docs` (generates TypeDoc documentation)
- **Create new package**: `bash create-package.sh package-name`
- **Versioning**: `pnpm changeset` (create a changeset for version updates)
- **Before commit verification**: `pnpm lint && pnpm type-check && pnpm test`

## Common Issues and Solutions

### TypeScript Errors
- **"Cannot find module"** - Check `.js` extension in imports
- **Type inference issues** - Add explicit return types
- **Strict null checks** - Use optional chaining (`?.`) and nullish coalescing (`??`)
- **exactOptionalPropertyTypes** - Use conditional spreads: `...(value && { key: value })`
- **Implicit any types** - Add explicit types and use `unknown` for untyped data

### Test Issues
- **Timeout errors** - Always use fake timers (see Testing Best Practices)
- **Import errors** - Ensure `.js` extension in test imports
- **Flaky tests** - Check for missing `await` statements
- **Slow tests** - Look for real timers, `{ timeout: 10000 }` indicates real timer usage

### Build Issues
- **"Module not found"** - Run `pnpm build` in dependency packages first
- **Type errors in dist** - Clean build: `rm -rf dist && pnpm build`
- **Biome errors** - Run `pnpm lint:fix` first, check for naming convention issues
- **Missing dependencies** - Run `pnpm install` in the root directory

## Dependency Management Guidelines

### Monorepo Structure
This project follows pnpm monorepo best practices with shared development dependencies hoisted to the root level:

**Root Dependencies (Hoisted)**:
- `typescript` - TypeScript compiler used by all packages
- `typedoc` - Documentation generation for all packages
- `@biomejs/biome` - Linting and formatting across the monorepo
- `vitest` - Testing framework (except modal-core which pins v2.1.8)
- `@vitest/coverage-v8` - Test coverage tools
- `rimraf` - File cleanup utility used by all packages
- `@types/node` - Node.js type definitions

**Package-Specific Dependencies**:
- **Runtime dependencies**: React, specific libraries each package uses
- **Unique dev tools**: Package-specific build scripts or configurations
- **Version-specific needs**: modal-core pins vitest@2.1.8 for compatibility

### Adding New Dependencies

**For Shared Tools** (used by 3+ packages):
1. Add to root `package.json` devDependencies
2. Remove from individual packages
3. Run `pnpm install` to update lockfile

**For Package-Specific Dependencies**:
1. Add to the specific package's dependencies/devDependencies
2. Keep runtime dependencies local to packages that use them

### Exception: modal-core Vitest Pinning
The `@walletmesh/modal-core` package pins vitest to version 2.1.8 for compatibility reasons:
- `vitest: 2.1.8` (pinned)
- `@vitest/coverage-v8: 2.1.8` (pinned)

This is intentional and should be preserved when updating other dependencies.

### Benefits of This Structure
- ✅ Reduced bundle size and installation time
- ✅ Version consistency across packages
- ✅ Simplified dependency management
- ✅ Better caching with pnpm workspace protocol

## Code Style Guidelines
- **Formatting**: Use Biome with 2-space indentation, single quotes for strings
- **Imports**: Use ES modules with .js extension in import paths
- **Types**: Use strict TypeScript. Explicit return types on functions, no implicit any. Avoid using `any` type; prefer `unknown` when type is uncertain
- **Naming**: PascalCase for classes/interfaces/types, camelCase for variables/functions/methods
- **Tests**: Create comprehensive tests with at least 80% coverage. Test both happy and error paths
- **File Organization**: Related functionality should be grouped together in the same directory
- **Documentation**: Use TSDoc standards for all code documentation. JSDoc comments for public APIs and typedoc for generating documentation
- **Docs Directory**: The `docs/` directory in each package contains only autogenerated documentation

### Lint Rule Policy
- **Fix Issues First**: Fix underlying issues rather than disabling lint rules
- **No Unauthorized Disabling**: Never disable lint rules without explicit user approval
- **Document Exceptions**: Document any approved lint rule disabling with a comment explaining the reason

## Testing Best Practices

### Use Fake Timers in Tests
- **Always use fake timers** (`vi.useFakeTimers()`) to prevent slow test execution
- Real timers can make tests run for their actual duration (seconds or minutes)
- Fake timers allow instant time advancement using `vi.advanceTimersByTimeAsync()`

```javascript
// Setup
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// In tests
it('should retry after delay', async () => {
  const promise = someAsyncOperation();
  
  // Advance fake timers instead of waiting
  await vi.advanceTimersByTimeAsync(1000);
  
  await expect(promise).resolves.toBe(expectedValue);
});
```

### Patterns to Avoid
- `await new Promise(resolve => setTimeout(resolve, delay))` in tests
- Tests with `{ timeout: 10000 }` configurations (indicates real timer usage)
- `vi.useRealTimers()` unless absolutely necessary for integration tests

## Development Workflows

### Adding a New Feature
1. Define TypeScript interfaces and types
2. Implement with tests (TDD preferred)
3. Update package CLAUDE.md if architectural changes
4. Run full validation: `pnpm lint && pnpm type-check && pnpm test`

### Debugging a Problem
1. Check package-specific CLAUDE.md first
2. Use `pnpm test -- --watch` for rapid iteration
3. Add console.log with descriptive prefixes
4. Check for similar patterns in codebase
5. Verify with integration tests

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
- **JSONRPCNode** (jsonrpc package): Core communication class for bi-directional JSON-RPC
- **WalletRouter** (router package): Manages multi-chain connections and routing
- **DiscoveryAnnouncer/DiscoveryListener** (discovery package): Handle wallet discovery protocol

## Best Practices

### Code Modification
- **Read First**: Always read the existing code thoroughly before making changes
- **Test Coverage**: Write tests for all new code and changes
- **Documentation**: Update documentation when changing public APIs
- **Consistent Style**: Follow existing code style and patterns
- **Error Handling**: Provide proper error handling with descriptive messages

### Documentation Maintenance
When implementing changes, documentation must be kept in sync with the code:

**Required Documentation Updates**:
1. **API Changes**: Update JSDoc comments for modified functions, classes, and interfaces
2. **Public Exports**: Update README.md if public API exports change
3. **Examples**: Update or add examples if functionality changes significantly
4. **CLAUDE.md**: Update package-specific CLAUDE.md files for major architectural changes
5. **Error Messages**: Ensure error messages in documentation match actual implementation

**Documentation Locations**:
- **README.md**: User-facing documentation with installation, usage, and API overview
- **CLAUDE.md**: Implementation details and architectural information for AI assistants
- **JSDoc Comments**: Inline documentation for all public APIs
- **Examples Directory**: Working code examples demonstrating usage
- **TypeDoc**: Auto-generated API documentation from JSDoc comments

**Documentation Checklist**:
- [ ] Are all new public APIs documented with JSDoc?
- [ ] Do examples still work with the changes?
- [ ] Are error codes and messages in docs accurate?
- [ ] Is README.md still accurate (imports, usage, etc.)?
- [ ] Does CLAUDE.md need updates for architectural changes?
- [ ] Run `pnpm docs` to verify TypeDoc generation succeeds

**Common Documentation Issues**:
- Outdated code examples that no longer compile
- References to removed or renamed APIs
- Incorrect import statements in examples
- Missing documentation for new error codes
- Architectural diagrams that don't reflect current structure

### Task Completion Checklist
Before considering any task complete, ensure ALL of the following pass without errors:

1. **Tests Pass**: Run `pnpm test` - all tests must pass
2. **Type Check**: Run `pnpm type-check` - no TypeScript errors
3. **Lint Check**: Run `pnpm lint` - no linting errors
4. **Format Code**: Run `pnpm format:fix` - ensure consistent formatting
5. **Documentation**: Verify documentation is updated and accurate
   - Run `pnpm docs` to ensure TypeDoc generates without errors
   - Check that examples still work with any API changes
   - Verify README.md reflects current implementation

**Quick verification command**:
```bash
pnpm format:fix && pnpm lint && pnpm type-check:build && pnpm test && pnpm docs
```

If any of these checks fail, the task is not complete. Fix all issues before proceeding.

### Debugging Guidelines
- Use console.log statements with descriptive tags: `console.log('[PackageName:Function]', data)`
- Add comments explaining complex logic or algorithms
- Check for TypeScript errors with `pnpm type-check`
- Run unit tests frequently with `pnpm test`
- Use `test.only()` to focus on specific tests during development
- Add `--reporter=verbose` for detailed test output

### Security Guidelines
Security is critical when building wallet infrastructure. Follow these guidelines:

**Sensitive Data Handling**:
- Never commit secrets, private keys, or API keys to the repository
- Use environment variables for sensitive configuration
- Sanitize all user inputs before processing
- Never log sensitive information like private keys or passwords

**Cross-Origin Communication**:
- Always validate message origins in the discovery protocol
- Use the built-in origin validation in WalletRouter
- Implement proper CORS headers for web wallets
- Verify sender identity before processing messages

**Wallet Security**:
- Implement secure session management with proper timeouts
- Use the permission system to restrict access to sensitive methods
- Validate all transaction parameters before signing
- Never expose raw private keys through the API

**Dependency Security**:
- Regularly update dependencies to patch vulnerabilities
- Review dependency licenses for compatibility
- Minimize external dependencies where possible
- Use `pnpm audit` to check for known vulnerabilities

### TypeScript Best Practices
- Use interfaces for object shapes that may be implemented
- Use type aliases for unions, intersections, and complex types
- Leverage TypeScript's utility types (Partial, Required, Pick, etc.)
- Use generics to maintain type safety across operations
- Avoid type assertions (as) unless absolutely necessary
- Use `.js` extension in import paths (ES modules)
- Explicit return types on public functions
- No implicit `any` - use `unknown` for untyped data

### Performance Considerations
- **Bundle Size**: Modal packages should stay under 50KB
- **Runtime Validation**: Use TypeScript type guards for validation
- **State Updates**: Use efficient state management patterns
- **Async Operations**: Always implement proper cleanup
- **Memory Leaks**: Use ResourceManager for cleanup tracking

## Git Workflow

### Branch Management
- Create feature branches from `main`
- Use descriptive branch names that reflect the feature or fix
- Keep branches focused on a single feature or fix

### Before Creating a PR
Run the verification command to ensure code quality:
```bash
pnpm format:fix && pnpm lint && pnpm type-check && pnpm test
```

### Git Commit Guidelines
Use Conventional Commits format for all git commits. This standardized format enables automated changelog generation and helps maintain a clear project history. Use descriptive commit messages that clearly explain the change.

**Format**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, or tooling
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes
- `build`: Build system or external dependency changes

**Examples**:
- `feat(router): add support for batch operations`
- `fix(jsonrpc): handle timeout errors correctly`
- `docs(discovery): update API documentation`
- `test(aztec): add integration tests for wallet connection`
- `chore(deps): update aztec dependencies to v1.2.0`

**Scope**: Use package names without the @walletmesh prefix (e.g., `router`, `jsonrpc`, `discovery`, `aztec-rpc-wallet`)

**Breaking Changes**: Add `BREAKING CHANGE:` in the commit body or use `!` after the type/scope (e.g., `feat(router)!: change API signature`)

**File Operations**: Always use `git mv` instead of `mv` when moving or renaming files to preserve git history

### Changesets and Versioning
After making changes:
```bash
pnpm changeset
# Follow prompts to describe changes
# Select packages affected
# Choose version bump type (major/minor/patch)
```

## Architecture Overview

WalletMesh is a modular framework for connecting web applications to blockchain wallets. The repository is organized into several packages:

### Core Packages

#### @walletmesh/discovery
Handles wallet discovery and announcement mechanisms.

**Purpose**: Wallet discovery and announcement across origins
**Modify for**: Adding new wallet discovery methods, changing announcement protocol
**Key files**: `src/client.ts` (announcer), `src/server.ts` (listener)

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

**Purpose**: Type-safe JSON-RPC 2.0 implementation
**Modify for**: Changing RPC protocol, adding middleware
**Key class**: `JSONRPCNode` - handles bidirectional communication

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

**Purpose**: Multi-chain wallet connection management
**Modify for**: Adding chain support, changing permission model
**Key class**: `WalletRouter` - routes requests to wallets

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

### Aztec Packages

**Status**: Experimental, API may change

#### @walletmesh/aztec/rpc-wallet
Integration with Aztec network wallets.

**Key Components**:
- `AztecDappWallet`: Implements Aztec's Wallet interface for dApps
- `AztecWalletRpcServer`: RPC server that handles wallet requests
- `AztecRouterProvider`: Multi-chain provider with router support
- `AztecDirectProvider`: Simple direct provider without routing
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

## Library Documentation (Context7 MCP)

For external library documentation, use the Context7 MCP tool:

### How to Use Context7
1. **Resolve library ID**: `mcp__context7__resolve-library-id` with library name
2. **Get documentation**: `mcp__context7__get-library-docs` with the resolved ID

### Common Libraries Used
- **Vitest** - Testing framework (`describe`, `it`, `expect`, `vi`)
- **TypeScript** - Type system and utilities
- **React** - UI library for modal-react package

### Example Usage
```typescript
// When you need Vitest documentation:
// 1. Call: mcp__context7__resolve-library-id("vitest")
// 2. Call: mcp__context7__get-library-docs("/vitest-dev/vitest")

// When you need React hooks documentation:
// 1. Call: mcp__context7__resolve-library-id("react") 
// 2. Call: mcp__context7__get-library-docs("/facebook/react", { topic: "hooks" })
```
