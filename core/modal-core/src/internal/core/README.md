# Core Systems Implementation

This directory contains the core systems for the WalletMesh modal package. The systems include:

## Error Handler

The error handler system provides a robust approach to error creation, categorization, and recovery. It includes:

- Type-safe error creation with categories and codes
- Contextual error information
- Retry mechanisms with exponential backoff
- Error recovery patterns
- Standardized error handling approach

## Event Emitter

The event emitter system provides a type-safe pub/sub implementation with enhanced features:

- Strongly typed events and subscribers
- Explicit cleanup through modal lifecycle
- Error handling within event listeners
- Direct listener management for predictable behavior
- Batched event dispatch
- Delayed event emission
- Retryable event operations
- Comprehensive subscription management

These core systems serve as the foundation for the rest of the WalletMesh modal implementation.