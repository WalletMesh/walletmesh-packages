[**@walletmesh/modal-core v0.0.3**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / EventEmitter

# Class: EventEmitter

Simple event emitter for internal use

A lightweight event emitter that provides the core pub/sub functionality
needed by modal components. Designed for internal use with a focus on
simplicity and reliability.

## Example

```typescript
const emitter = new EventEmitter();

// Subscribe to events
emitter.on('user:login', (user) => {
  console.log(`User ${user.name} logged in`);
});

// One-time listener
emitter.once('app:ready', () => {
  console.log('App initialized');
});

// Emit events
emitter.emit('user:login', { name: 'Alice', id: 123 });

// Check listeners
console.log(`Listeners for user:login: ${emitter.listenerCount('user:login')}`);

// Cleanup
emitter.removeAllListeners('user:login');
```

## Constructors

### Constructor

> **new EventEmitter**(): `EventEmitter`

#### Returns

`EventEmitter`

## Methods

### emit()

> **emit**\<`T`\>(`event`, `data`): `void`

Emit an event

Calls all registered listeners for the event with the provided data.
Listeners are called synchronously in the order they were registered.
Errors in listeners are caught and logged to prevent cascade failures.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### event

`string`

Event name to emit

##### data

`T`

Data to pass to listeners

#### Returns

`void`

#### Example

```typescript
// Emit with data
emitter.emit('user:updated', {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com'
});

// Emit without data
emitter.emit('cache:cleared', null);
```

***

### eventNames()

> **eventNames**(): `string`[]

Get all event names

Returns an array of all event names that have registered listeners.
Useful for debugging and introspection.

#### Returns

`string`[]

Array of event names with active listeners

#### Example

```typescript
const events = emitter.eventNames();
console.log('Active events:', events);
// Output: ['user:login', 'data:update', 'error:occurred']
```

***

### listenerCount()

> **listenerCount**(`event`): `number`

Get listener count for an event

#### Parameters

##### event

`string`

#### Returns

`number`

***

### off()

> **off**\<`T`\>(`event`, `listener`): `void`

Remove an event listener

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### event

`string`

##### listener

[`EventListener`](../type-aliases/EventListener.md)\<`T`\>

#### Returns

`void`

***

### on()

> **on**\<`T`\>(`event`, `listener`): `void`

Add an event listener

Registers a listener function for the specified event. Multiple listeners
can be registered for the same event and will be called in order.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### event

`string`

Event name to listen for

##### listener

[`EventListener`](../type-aliases/EventListener.md)\<`T`\>

Function to call when event is emitted

#### Returns

`void`

#### Example

```typescript
emitter.on('connection:ready', (data) => {
  console.log('Connection established:', data);
});
```

***

### once()

> **once**\<`T`\>(`event`, `listener`): `void`

Add a one-time event listener

Registers a listener that will be automatically removed after being
called once. Useful for initialization events or one-time notifications.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### event

`string`

Event name to listen for

##### listener

[`EventListener`](../type-aliases/EventListener.md)\<`T`\>

Function to call once when event is emitted

#### Returns

`void`

#### Example

```typescript
emitter.once('app:initialized', () => {
  console.log('App ready - this will only log once');
  startApplication();
});
```

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Remove all listeners for an event, or all listeners if no event specified

Clears listeners to prevent memory leaks and clean up resources.
Call without arguments to remove all listeners for all events.

#### Parameters

##### event?

`string`

Optional event name to clear listeners for

#### Returns

`void`

#### Example

```typescript
// Remove all listeners for specific event
emitter.removeAllListeners('user:logout');

// Remove all listeners for all events
emitter.removeAllListeners();
```
