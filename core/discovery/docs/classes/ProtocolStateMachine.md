[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ProtocolStateMachine

# Class: ProtocolStateMachine

Defined in: [core/ProtocolStateMachine.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L163)

Formal protocol state machine implementation.

Implements the 4-state machine as defined in the WalletMesh discovery protocol specification
with single-use session semantics. This state machine ensures proper protocol flow and prevents
invalid state transitions, providing a robust foundation for the discovery lifecycle with
comprehensive error handling.

## Single-Use Session Pattern
Each state machine instance is valid for exactly one discovery session. Once the session
reaches a terminal state (COMPLETED or ERROR), it cannot be reused. Applications must
create new instances for subsequent discovery sessions.

## States
- **IDLE**: Initial state, waiting for discovery to begin
- **DISCOVERING**: Active discovery session, responders being collected
- **COMPLETED**: Discovery finished, responders collected (TERMINAL)
- **ERROR**: Discovery failed due to security violations or protocol errors (TERMINAL)

## Features
- **Single-use sessions**: Each instance handles exactly one discovery cycle
- **State transition validation**: Prevents invalid state transitions according to protocol rules
- **Timeout management**: Configurable timeouts per state with automatic cleanup
- **Event emission**: Rich event system for state changes, timeouts, and errors
- **Transition guards**: Enforces valid state transitions only
- **State metadata**: Stores contextual data for each state
- **Resource cleanup**: Proper disposal and cleanup mechanisms
- **Error handling**: Transitions to ERROR state for security violations and protocol errors

## State Transitions (Single-Use Pattern)
```
IDLE ─────────► DISCOVERING ─────────► COMPLETED (TERMINAL)
                     │
                     ▼
                  ERROR (TERMINAL)
```

## Examples

```typescript
// Create state machine for first discovery
const stateMachine = new ProtocolStateMachine();

// Listen for state changes
stateMachine.on('stateChange', (event) => {
  console.log(`State: ${event.fromState} → ${event.toState}`);
});

// Listen for timeouts
stateMachine.on('timeout', (state) => {
  console.log(`State ${state} timed out`);
});

// Start discovery
stateMachine.transition('DISCOVERING');

// Discovery completes (terminal state)
stateMachine.transition('COMPLETED');

// For new discovery, create a new instance
const newStateMachine = new ProtocolStateMachine();
newStateMachine.transition('DISCOVERING');
```

```typescript
const stateMachine = new ProtocolStateMachine({
  DISCOVERING: 5000,  // 5 seconds
});
```

```typescript
try {
  // Invalid transition
  stateMachine.transition('COMPLETED');
} catch (error) {
  console.error('Invalid transition:', error.message);
}
```

## Since

0.2.0

## See

 - [StateTransitionEvent](../interfaces/StateTransitionEvent.md) for event payloads
 - [StateTimeouts](../interfaces/StateTimeouts.md) for timeout configuration

## Extends

- `EventEmitter`

## Extended by

- [`InitiatorStateMachine`](InitiatorStateMachine.md)

## Constructors

### Constructor

> **new ProtocolStateMachine**(`timeouts`): `ProtocolStateMachine`

Defined in: [core/ProtocolStateMachine.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L187)

Creates a new protocol state machine instance.

#### Parameters

##### timeouts

`Partial`\<[`StateTimeouts`](../interfaces/StateTimeouts.md)\> = `{}`

Custom timeout configuration for each state

#### Returns

`ProtocolStateMachine`

#### Examples

```typescript
const stateMachine = new ProtocolStateMachine();
```

```typescript
const stateMachine = new ProtocolStateMachine({
  DISCOVERING: 10000, // 10 seconds
});
```

#### Overrides

`EventEmitter.constructor`

## Methods

### canTransition()

> **canTransition**(`toState`): `boolean`

Defined in: [core/ProtocolStateMachine.ts:227](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L227)

Check if a transition to the target state is valid from the current state.

This method validates transitions according to the protocol state transition rules
without actually performing the transition.

#### Parameters

##### toState

[`ProtocolState`](../type-aliases/ProtocolState.md)

The target state to check

#### Returns

`boolean`

`true` if the transition is valid, `false` otherwise

#### Example

```typescript
if (stateMachine.canTransition('DISCOVERING')) {
  stateMachine.transition('DISCOVERING');
} else {
  console.log('Cannot start discovery from current state');
}
```

#### See

Valid transitions: IDLE→DISCOVERING, DISCOVERING→COMPLETED/ERROR

***

### checkMemoryLeaks()

> **checkMemoryLeaks**(): `object`

Defined in: [utils/EventEmitter.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L163)

Check for potential memory leaks by analyzing listener counts.
Returns information about events that may have memory leaks.

#### Returns

`object`

##### hasLeaks

> **hasLeaks**: `boolean`

##### suspiciousEvents

> **suspiciousEvents**: `object`[]

#### Inherited from

`EventEmitter.checkMemoryLeaks`

***

### dispose()

> **dispose**(): `void`

Defined in: [core/ProtocolStateMachine.ts:415](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L415)

Dispose of the state machine and cleanup all resources.

Clears all timeouts, removes all event listeners, and clears state metadata.
Should be called when the state machine is no longer needed to prevent
memory leaks and ensure proper cleanup.

#### Returns

`void`

#### Example

```typescript
// In component cleanup
componentWillUnmount() {
  this.stateMachine.dispose();
}

// Or in async cleanup
async function cleanup() {
  stateMachine.dispose();
  await otherCleanup();
}
```

***

### emit()

> **emit**(`event`, ...`args`): `boolean`

Defined in: [utils/EventEmitter.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L102)

Emit an event with the specified arguments.

#### Parameters

##### event

`string` | `symbol`

##### args

...`unknown`[]

#### Returns

`boolean`

#### Inherited from

`EventEmitter.emit`

***

### eventNames()

> **eventNames**(): (`string` \| `symbol`)[]

Defined in: [utils/EventEmitter.ts:140](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L140)

Get all event names.

#### Returns

(`string` \| `symbol`)[]

#### Inherited from

`EventEmitter.eventNames`

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: [utils/EventEmitter.ts:155](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L155)

Get the maximum number of listeners.

#### Returns

`number`

#### Inherited from

`EventEmitter.getMaxListeners`

***

### getState()

> **getState**(): [`ProtocolState`](../type-aliases/ProtocolState.md)

Defined in: [core/ProtocolStateMachine.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L203)

Get the current state of the state machine.

#### Returns

[`ProtocolState`](../type-aliases/ProtocolState.md)

The current protocol state

#### Example

```typescript
const currentState = stateMachine.getState();
console.log(`Current state: ${currentState}`);
```

***

### getStateMetadata()

> **getStateMetadata**(): `undefined` \| `Record`\<`string`, `unknown`\>

Defined in: [core/ProtocolStateMachine.ts:366](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L366)

Get metadata associated with the current state.

Retrieves any metadata that was provided during the transition to the current state.
Useful for accessing context-specific information like responder IDs or connection details.

#### Returns

`undefined` \| `Record`\<`string`, `unknown`\>

The metadata object for the current state, or `undefined` if no metadata exists

#### Example

```typescript
// After transitioning with metadata
stateMachine.transition('CONNECTING', { responderId: 'wallet-123' });

// Later, retrieve the metadata
const metadata = stateMachine.getStateMetadata();
console.log('Connecting to:', metadata?.responderId);
```

***

### isInState()

> **isInState**(`state`): `boolean`

Defined in: [core/ProtocolStateMachine.ts:390](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L390)

Check if the state machine is currently in a specific state.

Convenience method for checking the current state without needing to
call `getState()` and compare manually.

#### Parameters

##### state

[`ProtocolState`](../type-aliases/ProtocolState.md)

The state to check against

#### Returns

`boolean`

`true` if currently in the specified state, `false` otherwise

#### Example

```typescript
if (stateMachine.isInState('DISCOVERING')) {
  console.log('Discovery in progress...');
}

// Check multiple states
const isActive = stateMachine.isInState('DISCOVERING') ||
                 stateMachine.isInState('CONNECTING');
```

***

### listenerCount()

> **listenerCount**(`event`): `number`

Defined in: [utils/EventEmitter.ts:126](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L126)

Get the listener count for the specified event.

#### Parameters

##### event

`string` | `symbol`

#### Returns

`number`

#### Inherited from

`EventEmitter.listenerCount`

***

### listeners()

> **listeners**(`event`): (...`args`) => `void`[]

Defined in: [utils/EventEmitter.ts:133](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L133)

Get all listeners for the specified event.

#### Parameters

##### event

`string` | `symbol`

#### Returns

(...`args`) => `void`[]

#### Inherited from

`EventEmitter.listeners`

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [utils/EventEmitter.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L82)

Alias for removeListener.

#### Parameters

##### event

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

`EventEmitter.off`

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [utils/EventEmitter.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L17)

Add a listener for the specified event.

#### Parameters

##### event

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

`EventEmitter.on`

***

### once()

> **once**(`event`, `listener`): `this`

Defined in: [utils/EventEmitter.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L45)

Add a one-time listener for the specified event.

#### Parameters

##### event

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

`EventEmitter.once`

***

### prependListener()

> **prependListener**(`event`, `listener`): `this`

Defined in: [utils/EventEmitter.ts:188](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L188)

Prepend a listener to the beginning of the listeners array.

#### Parameters

##### event

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

`EventEmitter.prependListener`

***

### prependOnceListener()

> **prependOnceListener**(`event`, `listener`): `this`

Defined in: [utils/EventEmitter.ts:212](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L212)

Prepend a one-time listener to the beginning of the listeners array.

#### Parameters

##### event

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

`EventEmitter.prependOnceListener`

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `this`

Defined in: [utils/EventEmitter.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L89)

Remove all listeners for the specified event, or all events if no event is specified.

#### Parameters

##### event?

`string` | `symbol`

#### Returns

`this`

#### Inherited from

`EventEmitter.removeAllListeners`

***

### removeListener()

> **removeListener**(`event`, `listener`): `this`

Defined in: [utils/EventEmitter.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L57)

Remove a listener from the specified event.

#### Parameters

##### event

`string` | `symbol`

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

`EventEmitter.removeListener`

***

### setMaxListeners()

> **setMaxListeners**(`n`): `this`

Defined in: [utils/EventEmitter.ts:147](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L147)

Set the maximum number of listeners.

#### Parameters

##### n

`number`

#### Returns

`this`

#### Inherited from

`EventEmitter.setMaxListeners`

***

### transition()

> **transition**(`toState`, `metadata?`): `void`

Defined in: [core/ProtocolStateMachine.ts:280](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/ProtocolStateMachine.ts#L280)

Transition to a new state with optional metadata.

Performs a state transition if valid, updating the current state, setting up
timeouts, and emitting a state change event. Invalid transitions throw an error.

#### Parameters

##### toState

[`ProtocolState`](../type-aliases/ProtocolState.md)

The target state to transition to

##### metadata?

`Record`\<`string`, `unknown`\>

Optional metadata to associate with the new state

#### Returns

`void`

#### Throws

If the transition is not valid from the current state

#### Examples

```typescript
// Start discovery
stateMachine.transition('DISCOVERING');
```

```typescript
// Transition to connecting with responder info
stateMachine.transition('CONNECTING', {
  responderId: 'wallet-123',
  walletName: 'Example Wallet',
  timestamp: Date.now()
});
```

```typescript
try {
  stateMachine.transition('CONNECTED');
} catch (error) {
  console.error('Invalid transition:', error.message);
  // Handle invalid transition
}
```

Emits 'stateChange' event when the transition completes successfully

#### See

[canTransition](#cantransition) to check validity before transitioning
