# WalletMesh Modal Core Internal Implementation

This directory contains the internal implementation details of the WalletMesh Modal Core package.

## Architecture

The internal implementation is organized into several key modules:

1. **Core** - Core utilities and services used throughout the implementation
   - `di/` - Dependency injection system
   - `events/` - Event emitters and event definitions
   - `errors/` - Error handling and error types
   - `logger/` - Logging utilities

2. **Client** - Client-side implementation for wallet connections
   - Core client functionality
   - State management for connections

3. **Modal** - Implementation of the modal controller
   - `state/` - Modal state management
   - `views/` - View system for rendering content

4. **Connectors** - Wallet connector implementations
   - `WalletConnector.ts` - Composed connector using strategy pattern
   - `core/` - Core connector components (state management)
   - `strategies/` - Wallet-specific strategy implementations
   - `obsidion/` - Obsidion-specific types and configuration

5. **Transports** - Communication transport implementations
   - `AbstractTransport.ts` - Abstract transport class
   - `websocket/` - WebSocket implementation
   - `popup-window/` - Popup window implementation
   - `chrome-extension/` - Chrome extension implementation

6. **Adapters** - Framework adapters for UI rendering
   - `domAdapter.ts` - DOM-based adapter
   - `frameworkAdapter.ts` - Base framework adapter interface

7. **Utils** - Utility functions and helpers
   - `async/` - Async utilities
   - `dom/` - DOM manipulation helpers

## Implementation Notes

- All internal classes use dependency injection for better testability and modularity
- The event system is used throughout for loose coupling between components
- Error handling follows a consistent pattern with typed error codes
- Transports are designed with a common interface for interchangeability
- Adapters allow for framework-agnostic rendering while supporting specific frameworks

## Development Guidelines

When modifying internal implementation:

1. Maintain clear separation between public API and implementation details
2. Follow established patterns for error handling, events, and dependency injection
3. Add comprehensive tests for new functionality
4. Update the corresponding public API documentation if the behavior changes
5. Mark all internal classes and functions with `@internal` JSDoc tags