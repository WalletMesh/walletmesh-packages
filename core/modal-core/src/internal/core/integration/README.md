# Integration Tests for Modal Core

This directory contains integration tests for the various components of the modal core system. These tests verify that components properly interact with each other across boundaries.

## Component Integrations

### 1. Error Handler + Event Emitter (`error-event.integration.test.ts`)
Tests that the ErrorHandler properly emits events via ErrorEventEmitter when errors occur.

Key integrations:
- Error logging triggers error events
- Error context is preserved in events
- Error recovery events are properly emitted

### 2. Event Emitter + State Manager (`event-state.integration.test.ts`)
Tests that state changes in StateManager properly trigger events through EventEmitter.

Key integrations:
- State changes trigger events with proper payloads
- Complex state updates are properly communicated
- Batch state updates only trigger a single event
- State selectors only trigger events for actual changes

### 3. State Manager + Resource Manager (`state-resource.integration.test.ts`)
Tests how state is maintained during resource lifecycle operations.

Key integrations:
- Resource acquisition updates state properly
- Resource errors are reflected in state
- Resource dependencies coordinate state updates
- Cleanup releases all resources and updates state

### 4. Core Systems + Framework Adapter (`core-adapter.integration.test.ts`)
Tests the integration between core systems and framework adapters.

Key integrations:
- Rendering content through framework adapter
- Handling user actions through adapter
- Handling rendering errors
- Resource tracking in adapter
- Different target type support
- Adapter cleanup

### 5. Framework Adapter + Controllers (`adapter-controller-basic.integration.test.ts`)
Tests the integration between framework adapters and controllers.

Key integrations:
- Controller state changes propagate to adapter UI
- Adapter actions trigger controller behavior
- Error handling between controller and adapter
- Resource cleanup coordination

### 6. System Performance Metrics (`performance-metrics.integration.test.ts`)
Tests various performance aspects of the system components working together.

Key metrics tested:
- Event emission performance (events/second)
- State update performance (updates/second)
- Resource acquisition/release performance (resources/second)
- Concurrent operations performance (operations/second)
- Memory usage during intensive operations

### 7. Boundary Conditions and Edge Cases (`boundary-conditions.integration.test.ts`)
Tests system behavior under various edge cases and boundary conditions.

Key areas tested:
- Maximum load handling without failure
- Recovery from component failures
- Race conditions and concurrency issues 
- Handling of invalid/malformed inputs
- Graceful management of resource limits
- System stability after error situations

### 8. Component Health Validation (`component-health.integration.test.ts`)
Tests individual component health metrics and validations.

Key health aspects tested:
- Memory management and leak prevention
- Event subscription cleanup
- State consistency across update patterns
- Runtime type safety validation
- Error boundaries and isolation
- Multi-component health integration

## Common Flow Tests

### Modal Flows (`flow.integration.test.ts`)
Tests common user flows through the entire system.

Key flows tested:
1. **Modal Open/Close Flow**: Tests the modal opening and closing lifecycle, including events and state transitions.
2. **Wallet Connection Flow**: Tests connecting to wallets, state updates during connection, and view transitions.
3. **Chain Switching Flow**: Tests switching between different blockchain networks and verifying state updates.
4. **Error Recovery Flow**: Tests error handling during connection/operations and the recovery process.
5. **State Persistence Flow**: Tests saving and restoring modal state across sessions.
6. **Full User Flow**: Tests a complete user journey combining multiple operations.

## System Behaviors

The integration tests collectively cover these important system behaviors:

1. **Resource Cleanup**: Proper acquisition, tracking, and release of resources throughout the system.
2. **Event Propagation**: Correct emission and handling of events across components.
3. **State Consistency**: Maintaining consistent state during complex operations and transitions.
4. **Error Handling**: Proper error creation, enrichment, propagation, and recovery throughout the system.
5. **Performance Metrics**: Monitoring and ensuring acceptable performance characteristics of the system.
6. **Boundary Conditions**: Proper handling of edge cases, maximum load, error recovery, and resource limits.
7. **Component Health**: Verification of memory management, event cleanup, type safety, and error boundaries at the component level.

## Testing Strategy

Each integration test focuses on a specific boundary between components and verifies:

1. **Data Flow**: Information flows correctly between components
2. **Event Propagation**: Events are properly emitted and handled
3. **Error Handling**: Errors are properly propagated and don't break the integration
4. **Resource Management**: Resources are properly allocated and cleaned up
5. **State Consistency**: Components maintain consistent state during interactions

## Running Tests

Run all integration tests:
```
pnpm test -- src/internal/core/integration
```

Run a specific integration test:
```
pnpm test -- src/internal/core/integration/error-event.integration.test.ts
```