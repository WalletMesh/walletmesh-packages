[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / EventEmitter

# Class: EventEmitter

Defined in: [core/discovery/src/utils/EventEmitter.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L65)

Browser-compatible EventEmitter implementation.

Provides a subset of Node.js EventEmitter functionality for browser environments
with built-in memory leak detection and error handling. Used as the base class
for protocol state machines and other event-driven components in the discovery package.

## Features
- **Browser-compatible**: Works in all modern browsers without Node.js dependencies
- **Memory leak detection**: Automatic warnings when listener count exceeds limits
- **Error isolation**: Listener errors don't affect other listeners
- **Duplicate prevention**: Automatically prevents duplicate listener registration
- **Flexible event types**: Supports both string and symbol event names
- **Node.js API compatibility**: Familiar API for Node.js developers

## Common Usage Patterns
State machines, protocol handlers, and other event-driven components extend
this class to provide structured event communication.

## Examples

```typescript
const emitter = new EventEmitter();

// Add listener
emitter.on('data', (payload) => {
  console.log('Received:', payload);
});

// Emit event
emitter.emit('data', { message: 'Hello' });
```

```typescript
emitter.once('connect', () => {
  console.log('Connected - this will only fire once');
});

emitter.emit('connect'); // Logs message
emitter.emit('connect'); // No output - listener was removed
```

```typescript
emitter.setMaxListeners(5);

// Add many listeners...
for (let i = 0; i < 10; i++) {
  emitter.on('event', () => {});
}
// Warning logged when exceeding 5 listeners

const leakCheck = emitter.checkMemoryLeaks();
if (leakCheck.hasLeaks) {
  console.log('Potential memory leaks detected');
}
```

## Since

0.2.0

## See

[ProtocolStateMachine](ProtocolStateMachine.md) for usage in state machines

## Extended by

- [`ProtocolStateMachine`](ProtocolStateMachine.md)

## Constructors

### Constructor

> **new EventEmitter**(): `EventEmitter`

#### Returns

`EventEmitter`

## Methods

### checkMemoryLeaks()

> **checkMemoryLeaks**(): `object`

Defined in: [core/discovery/src/utils/EventEmitter.ts:453](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L453)

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

[setMaxListeners](#setmaxlisteners) to configure leak detection threshold

***

### emit()

> **emit**(`event`, ...`args`): `boolean`

Defined in: [core/discovery/src/utils/EventEmitter.ts:282](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L282)

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

***

### eventNames()

> **eventNames**(): (`string` \| `symbol`)[]

Defined in: [core/discovery/src/utils/EventEmitter.ts:373](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L373)

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

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: [core/discovery/src/utils/EventEmitter.ts:420](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L420)

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

[setMaxListeners](#setmaxlisteners) to change the limit

***

### listenerCount()

> **listenerCount**(`event`): `number`

Defined in: [core/discovery/src/utils/EventEmitter.ts:323](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L323)

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

[listeners](#listeners) to get the actual listener functions

***

### listeners()

> **listeners**(`event`): (...`args`) => `void`[]

Defined in: [core/discovery/src/utils/EventEmitter.ts:351](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L351)

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

[listenerCount](#listenercount) to just get the count

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L215)

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

[removeListener](#removelistener) for full documentation

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L95)

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

 - [once](#once) for one-time listeners
 - [removeListener](#removelistener) to remove listeners

***

### once()

> **once**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L142)

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

[on](#on) for persistent listeners

***

### prependListener()

> **prependListener**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:500](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L500)

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

 - [on](#on) for normal listener addition
 - [prependOnceListener](#prependoncelistener) for one-time prepended listeners

***

### prependOnceListener()

> **prependOnceListener**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:550](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L550)

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

 - [prependListener](#prependlistener) for persistent prepended listeners
 - [once](#once) for one-time listeners at the end

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:240](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L240)

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

[removeListener](#removelistener) to remove specific listeners

***

### removeListener()

> **removeListener**(`event`, `listener`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L174)

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

 - [off](#off) for alias
 - [removeAllListeners](#removealllisteners) to remove all listeners

***

### setMaxListeners()

> **setMaxListeners**(`n`): `this`

Defined in: [core/discovery/src/utils/EventEmitter.ts:398](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/utils/EventEmitter.ts#L398)

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

 - [getMaxListeners](#getmaxlisteners) to get current limit
 - [checkMemoryLeaks](#checkmemoryleaks) for leak detection
