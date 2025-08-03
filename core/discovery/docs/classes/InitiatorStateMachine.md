[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / InitiatorStateMachine

# Class: InitiatorStateMachine

Defined in: [initiator/InitiatorStateMachine.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/initiator/InitiatorStateMachine.ts#L118)

Initiator-specific state machine that automatically sends discovery protocol
messages on state transitions.

This state machine extends the base ProtocolStateMachine to provide automatic
message dispatch when transitioning between states. It ensures that the discovery
protocol messages are always sent at the correct time and with the correct data.

## State Transitions and Messages

- **IDLE → DISCOVERING**: Automatically sends `discovery:wallet:request`
- **DISCOVERING → COMPLETED**: Automatically sends `discovery:wallet:complete`
- **DISCOVERING → ERROR**: Automatically sends `discovery:wallet:error`

## Single-Use Pattern

Each instance is valid for exactly one discovery session. Once the session
reaches a terminal state (COMPLETED or ERROR), a new instance must be created
for subsequent discovery sessions.

## Example

```typescript
const stateMachine = new InitiatorStateMachine({
  eventTarget: window,
  sessionId: crypto.randomUUID(),
  origin: window.location.origin,
  initiatorInfo: {
    name: 'My DApp',
    url: 'https://mydapp.com',
    icon: 'data:image/svg+xml;base64,...'
  },
  requirements: {
    chains: ['eip155:1'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  }
});

// Start discovery - request message sent automatically
stateMachine.transition('DISCOVERING');

// On timeout or completion - complete message sent automatically
stateMachine.transition('COMPLETED', { reason: 'timeout' });
```

## Since

0.2.0

## See

 - [ProtocolStateMachine](ProtocolStateMachine.md) for base state machine functionality
 - [DiscoveryInitiator](DiscoveryInitiator.md) for usage in discovery implementation

## Extends

- [`ProtocolStateMachine`](ProtocolStateMachine.md)

## Constructors

### Constructor

> **new InitiatorStateMachine**(`config`): `InitiatorStateMachine`

Defined in: [initiator/InitiatorStateMachine.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/initiator/InitiatorStateMachine.ts#L128)

Creates a new InitiatorStateMachine instance.

#### Parameters

##### config

[`InitiatorStateMachineConfig`](../interfaces/InitiatorStateMachineConfig.md)

Configuration for the state machine

#### Returns

`InitiatorStateMachine`

#### Overrides

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`constructor`](ProtocolStateMachine.md#constructor)

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

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`canTransition`](ProtocolStateMachine.md#cantransition)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`checkMemoryLeaks`](ProtocolStateMachine.md#checkmemoryleaks)

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

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`dispose`](ProtocolStateMachine.md#dispose)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`emit`](ProtocolStateMachine.md#emit)

***

### eventNames()

> **eventNames**(): (`string` \| `symbol`)[]

Defined in: [utils/EventEmitter.ts:140](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L140)

Get all event names.

#### Returns

(`string` \| `symbol`)[]

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`eventNames`](ProtocolStateMachine.md#eventnames)

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: [utils/EventEmitter.ts:155](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/utils/EventEmitter.ts#L155)

Get the maximum number of listeners.

#### Returns

`number`

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`getMaxListeners`](ProtocolStateMachine.md#getmaxlisteners)

***

### getSessionId()

> **getSessionId**(): `string`

Defined in: [initiator/InitiatorStateMachine.ts:275](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/initiator/InitiatorStateMachine.ts#L275)

Get the current session ID.

#### Returns

`string`

The session ID for this discovery session

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

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`getState`](ProtocolStateMachine.md#getstate)

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

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`getStateMetadata`](ProtocolStateMachine.md#getstatemetadata)

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

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`isInState`](ProtocolStateMachine.md#isinstate)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`listenerCount`](ProtocolStateMachine.md#listenercount)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`listeners`](ProtocolStateMachine.md#listeners)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`off`](ProtocolStateMachine.md#off)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`on`](ProtocolStateMachine.md#on)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`once`](ProtocolStateMachine.md#once)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`prependListener`](ProtocolStateMachine.md#prependlistener)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`prependOnceListener`](ProtocolStateMachine.md#prependoncelistener)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`removeAllListeners`](ProtocolStateMachine.md#removealllisteners)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`removeListener`](ProtocolStateMachine.md#removelistener)

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

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`setMaxListeners`](ProtocolStateMachine.md#setmaxlisteners)

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

[canTransition](ProtocolStateMachine.md#cantransition) to check validity before transitioning

#### Inherited from

[`ProtocolStateMachine`](ProtocolStateMachine.md).[`transition`](ProtocolStateMachine.md#transition)

***

### updateConfig()

> **updateConfig**(`updates`): `void`

Defined in: [initiator/InitiatorStateMachine.ts:285](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/initiator/InitiatorStateMachine.ts#L285)

Update the configuration for the state machine.
Note: This does not affect messages already sent.

#### Parameters

##### updates

`Partial`\<`Omit`\<[`InitiatorStateMachineConfig`](../interfaces/InitiatorStateMachineConfig.md), `"sessionId"`\>\>

Partial configuration updates

#### Returns

`void`
