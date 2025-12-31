[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ProtocolStateMachine

# Class: ProtocolStateMachine

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L163)

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

- [`EventEmitter`](EventEmitter.md)

## Extended by

- [`InitiatorStateMachine`](InitiatorStateMachine.md)

## Constructors

### Constructor

> **new ProtocolStateMachine**(`timeouts`): `ProtocolStateMachine`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L187)

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

[`EventEmitter`](EventEmitter.md).[`constructor`](EventEmitter.md#constructor)

## Methods

### canTransition()

> **canTransition**(`toState`): `boolean`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:227](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L227)

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

Defined in: [core/discovery/src/utils/EventEmitter.ts:453](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L453)

Check for potential memory leaks by analyzing listener counts.

Analyzes all events and identifies those that have more listeners than
the configured maximum. Returns detailed information about potential
memory leaks for debugging and monitoring purposes.

#### Returns

`object`

Object containing leak detection results

##### hasLeaks

> **hasLeaks**: `boolean`

##### suspiciousEvents

> **suspiciousEvents**: `object`[]

#### Example

```typescript
emitter.setMaxListeners(3);

// Add many listeners
for (let i = 0; i < 5; i++) {
  emitter.on('data', () => {});
}

const leakCheck = emitter.checkMemoryLeaks();
if (leakCheck.hasLeaks) {
  console.log('Suspicious events:', leakCheck.suspiciousEvents);
  // Output: [{ event: 'data', count: 5, maxAllowed: 3 }]
}
```

#### See

[setMaxListeners](EventEmitter.md#setmaxlisteners) to configure leak detection threshold

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`checkMemoryLeaks`](EventEmitter.md#checkmemoryleaks)

***

### dispose()

> **dispose**(): `void`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:442](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L442)

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

Defined in: [core/discovery/src/utils/EventEmitter.ts:282](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L282)

Emit an event with the specified arguments.

Synchronously calls all listeners registered for the specified event,
passing the provided arguments to each listener. Errors in individual
listeners are caught and logged but don't affect other listeners.

#### Parameters

##### event

The event name to emit

`string` | `symbol`

##### args

...`unknown`[]

Arguments to pass to the listeners

#### Returns

`boolean`

`true` if there were listeners for the event, `false` otherwise

#### Examples

```typescript
// Emit with no arguments
const hasListeners = emitter.emit('ready');

// Emit with arguments
emitter.emit('data', { id: 1, message: 'Hello' });

// Emit with multiple arguments
emitter.emit('error', error, context, timestamp);
```

```typescript
emitter.on('test', () => {
  throw new Error('Listener error');
});

emitter.emit('test'); // Error is logged but doesn't throw
```

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`emit`](EventEmitter.md#emit)

***

### eventNames()

> **eventNames**(): (`string` \| `symbol`)[]

Defined in: [core/discovery/src/utils/EventEmitter.ts:373](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L373)

Get all event names.

Returns an array containing all event names (strings and symbols) that
currently have listeners attached. Useful for introspection and debugging.

#### Returns

(`string` \| `symbol`)[]

Array of event names that have listeners

#### Example

```typescript
emitter.on('connect', () => {});
emitter.on('disconnect', () => {});
emitter.on(Symbol('secret'), () => {});

const events = emitter.eventNames();
console.log(events); // ['connect', 'disconnect', Symbol(secret)]
```

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`eventNames`](EventEmitter.md#eventnames)

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: [core/discovery/src/utils/EventEmitter.ts:420](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L420)

Get the maximum number of listeners.

Returns the current maximum listener limit configured for this emitter.
This is the threshold above which memory leak warnings are issued.

#### Returns

`number`

Current maximum listener limit (0 means warnings disabled)

#### Example

```typescript
console.log(emitter.getMaxListeners()); // 10 (default)
emitter.setMaxListeners(20);
console.log(emitter.getMaxListeners()); // 20
```

#### See

[setMaxListeners](EventEmitter.md#setmaxlisteners) to change the limit

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`getMaxListeners`](EventEmitter.md#getmaxlisteners)

***

### getState()

> **getState**(): [`ProtocolState`](../type-aliases/ProtocolState.md)

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L203)

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

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:373](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L373)

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

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:397](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L397)

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

### isTerminalState()

> **isTerminalState**(): `boolean`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:417](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L417)

Check if the current state is a terminal state.

Terminal states (COMPLETED and ERROR) cannot transition to any other state.
A new state machine instance must be created for subsequent discovery sessions.

#### Returns

`boolean`

`true` if the current state is terminal, `false` otherwise

#### Example

```typescript
if (stateMachine.isTerminalState()) {
  // Create new instance for next discovery
  stateMachine = createProtocolStateMachine();
}
```

***

### listenerCount()

> **listenerCount**(`event`): `number`

Defined in: [core/discovery/src/utils/EventEmitter.ts:323](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L323)

Get the listener count for the specified event.

Returns the number of listeners currently registered for the specified event.
Useful for debugging and monitoring event usage patterns.

#### Parameters

##### event

The event name to count listeners for

`string` | `symbol`

#### Returns

`number`

The number of listeners for the event (0 if none)

#### Example

```typescript
emitter.on('data', handler1);
emitter.on('data', handler2);

console.log(emitter.listenerCount('data')); // 2
console.log(emitter.listenerCount('unknown')); // 0
```

#### See

[listeners](EventEmitter.md#listeners) to get the actual listener functions

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`listenerCount`](EventEmitter.md#listenercount)

***

### listeners()

> **listeners**(`event`): (...`args`) => `void`[]

Defined in: [core/discovery/src/utils/EventEmitter.ts:351](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L351)

Get all listeners for the specified event.

Returns a copy of the array of listeners for the specified event.
The returned array is a defensive copy and can be safely modified
without affecting the original listeners.

#### Parameters

##### event

The event name to get listeners for

`string` | `symbol`

#### Returns

(...`args`) => `void`[]

Array of listener functions (empty array if none)

#### Example

```typescript
const handler1 = () => console.log('Handler 1');
const handler2 = () => console.log('Handler 2');

emitter.on('test', handler1);
emitter.on('test', handler2);

const listeners = emitter.listeners('test');
console.log(listeners.length); // 2
```

#### See

[listenerCount](EventEmitter.md#listenercount) to just get the count

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`listeners`](EventEmitter.md#listeners)

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L215)

Alias for removeListener.

Convenience method that provides the same functionality as removeListener
with a shorter name, following Node.js EventEmitter convention.

#### Parameters

##### event

The event name to remove the listener from

`string` | `symbol`

##### listener

(...`args`) => `void`

The exact function reference to remove

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
const handler = () => {};
emitter.on('event', handler);
emitter.off('event', handler); // Same as removeListener
```

#### See

[removeListener](EventEmitter.md#removelistener) for full documentation

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`off`](EventEmitter.md#off)

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L95)

Add a listener for the specified event.

Registers a function to be called whenever the specified event is emitted.
Automatically prevents duplicate listeners and provides memory leak warnings
when the listener count exceeds the configured maximum.

#### Parameters

##### event

The event name to listen for (string or symbol)

`string` | `symbol`

##### listener

(...`args`) => `void`

The function to call when the event is emitted

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
emitter.on('stateChange', (newState) => {
  console.log('State changed to:', newState);
});

// Method chaining
emitter
  .on('connect', handleConnect)
  .on('disconnect', handleDisconnect);
```

#### See

 - [once](EventEmitter.md#once) for one-time listeners
 - [removeListener](EventEmitter.md#removelistener) to remove listeners

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`on`](EventEmitter.md#on)

***

### once()

> **once**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L142)

Add a one-time listener for the specified event.

Registers a function to be called only the first time the specified event
is emitted. The listener is automatically removed after being called once.

#### Parameters

##### event

The event name to listen for (string or symbol)

`string` | `symbol`

##### listener

(...`args`) => `void`

The function to call when the event is emitted

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
emitter.once('ready', () => {
  console.log('System is ready');
});

emitter.emit('ready'); // Logs message
emitter.emit('ready'); // No output - listener was removed
```

#### See

[on](EventEmitter.md#on) for persistent listeners

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`once`](EventEmitter.md#once)

***

### prependListener()

> **prependListener**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:500](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L500)

Prepend a listener to the beginning of the listeners array.

Adds a listener that will be called before any existing listeners for
the specified event. This is useful when you need to ensure a listener
runs first, such as for logging or validation.

#### Parameters

##### event

The event name to listen for

`string` | `symbol`

##### listener

(...`args`) => `void`

The function to call when the event is emitted

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
emitter.on('data', () => console.log('Second'));
emitter.prependListener('data', () => console.log('First'));

emitter.emit('data');
// Output:
// First
// Second
```

#### See

 - [on](EventEmitter.md#on) for normal listener addition
 - [prependOnceListener](EventEmitter.md#prependoncelistener) for one-time prepended listeners

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`prependListener`](EventEmitter.md#prependlistener)

***

### prependOnceListener()

> **prependOnceListener**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:550](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L550)

Prepend a one-time listener to the beginning of the listeners array.

Adds a listener that will be called before any existing listeners and
automatically removed after being called once. Combines the behavior
of prependListener and once.

#### Parameters

##### event

The event name to listen for

`string` | `symbol`

##### listener

(...`args`) => `void`

The function to call when the event is emitted

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
emitter.on('startup', () => console.log('Normal startup'));
emitter.prependOnceListener('startup', () => console.log('Pre-startup'));

emitter.emit('startup');
// Output:
// Pre-startup
// Normal startup

emitter.emit('startup');
// Output:
// Normal startup (prepended listener was removed)
```

#### See

 - [prependListener](EventEmitter.md#prependlistener) for persistent prepended listeners
 - [once](EventEmitter.md#once) for one-time listeners at the end

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`prependOnceListener`](EventEmitter.md#prependoncelistener)

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:240](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L240)

Remove all listeners for the specified event, or all events if no event is specified.

Efficiently removes all listeners for a specific event or clears all listeners
for all events. Useful for cleanup operations and preventing memory leaks.

#### Parameters

##### event?

Optional event name. If not provided, removes all listeners for all events

`string` | `symbol`

#### Returns

`this`

This EventEmitter instance for method chaining

#### Examples

```typescript
emitter.removeAllListeners('data');
```

```typescript
emitter.removeAllListeners(); // Clears everything
```

#### See

[removeListener](EventEmitter.md#removelistener) to remove specific listeners

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`removeAllListeners`](EventEmitter.md#removealllisteners)

***

### removeListener()

> **removeListener**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L174)

Remove a listener from the specified event.

Removes the first occurrence of the specified listener from the event.
If the listener was added multiple times, only one instance is removed.
Automatically cleans up the event entry if no listeners remain.

#### Parameters

##### event

The event name to remove the listener from

`string` | `symbol`

##### listener

(...`args`) => `void`

The exact function reference to remove

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
const handler = (data) => console.log(data);
emitter.on('data', handler);

// Remove the specific listener
emitter.removeListener('data', handler);
```

#### See

 - [off](EventEmitter.md#off) for alias
 - [removeAllListeners](EventEmitter.md#removealllisteners) to remove all listeners

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`removeListener`](EventEmitter.md#removelistener)

***

### setMaxListeners()

> **setMaxListeners**(`n`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:398](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/utils/EventEmitter.ts#L398)

Set the maximum number of listeners.

Configures the maximum number of listeners that can be added to any single
event before a memory leak warning is issued. Set to 0 to disable warnings.

#### Parameters

##### n

`number`

Maximum number of listeners (0 to disable warnings)

#### Returns

`this`

This EventEmitter instance for method chaining

#### Example

```typescript
// Set higher limit for events that legitimately need many listeners
emitter.setMaxListeners(50);

// Disable memory leak warnings
emitter.setMaxListeners(0);
```

#### See

 - [getMaxListeners](EventEmitter.md#getmaxlisteners) to get current limit
 - [checkMemoryLeaks](EventEmitter.md#checkmemoryleaks) for leak detection

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`setMaxListeners`](EventEmitter.md#setmaxlisteners)

***

### transition()

> **transition**(`toState`, `metadata?`): `void`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:280](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/ProtocolStateMachine.ts#L280)

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
