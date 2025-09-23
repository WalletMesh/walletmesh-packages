# WalletMesh Modal Core Public API

This directory contains the public API interfaces and type definitions for the WalletMesh Modal Core package.

## Architecture

The WalletMesh Modal Core package follows a clean architecture with a clear separation between:

1. **Public API** - The entry points, interfaces, and factory functions that are exported to consumers
2. **Internal Implementation** - The actual implementation details that should not be directly accessed

### Directory Structure

- `/src/api/` - Public API modules with interfaces, types, and factory functions
- `/src/internal/` - Internal implementation details (not directly accessible)
- `/src/types.ts` - Core type definitions for the public API
- `/src/index.ts` - Main entry point with carefully curated exports

### API Modules

The public API is organized into well-documented modules:

- **errors.ts** - Error classes and utilities for error handling
- **events.ts** - Event types and enums for the EventTarget-based system
- **logger.ts** - Logging utilities for debugging and monitoring
- **transports.ts** - Transport implementations for wallet communication
- **connectors.ts** - Wallet connector implementations and utilities
- **views.ts** - View system for modal UI components
- **adapters.ts** - Framework adapters for different UI libraries

### Key Components

The public API is built around several key abstractions:

- **Modal Controller** - Central interface for managing wallet connection modals
- **Wallet Connector** - Interface for connecting to specific wallet types
- **Transport** - Communication channel between the application and wallet
- **Framework Adapter** - Adapter for rendering the UI in different frameworks

### Using the Public API

All interaction with the package should go through the exported factory functions:

- `createModal()` - Create a modal controller with built-in EventTarget
- `createConnector()` - Create a wallet connector
- `createTransport()` - Create a transport instance
- `createAdapter()` - Create a framework adapter
- `createLogger()` - Create a logger instance

Each module includes comprehensive documentation and examples for usage.