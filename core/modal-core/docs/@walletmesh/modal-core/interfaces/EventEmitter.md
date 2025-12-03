[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EventEmitter

# Interface: EventEmitter

Event emitter interface for all modal events

Provides a type-safe interface for event emission and subscription
across the entire modal system. Implementations handle event dispatch,
subscription management, and category-based filtering.

## Implementation Requirements

- Must maintain subscription order for predictable event flow
- Should handle errors in listeners without affecting other listeners
- Must support synchronous event emission for state consistency
- Should provide memory-efficient subscription management

## Example

```typescript
class MyEventEmitter implements EventEmitter {
  private listeners = new Map<string, Set<Function>>();

  emit<K extends keyof ModalEventMap>(
    event: K,
    payload: ModalEventMap[K]
  ): void {
    const handlers = this.listeners.get(event);
    handlers?.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  on<K extends keyof ModalEventMap>(
    event: K,
    listener: (payload: ModalEventMap[K]) => void
  ): () => void {
    // Implementation
    return () => this.off(event, listener);
  }
}
```

## Methods

### emit()

> **emit**\<`K`\>(`event`, `payload`): `void`

Emit an event

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### payload

[`ModalEventMap`](ModalEventMap.md)\[`K`\]

#### Returns

`void`

***

### getRegisteredEvents()

> **getRegisteredEvents**(): keyof [`ModalEventMap`](ModalEventMap.md)[]

Get all registered events

#### Returns

keyof [`ModalEventMap`](ModalEventMap.md)[]

***

### listenerCount()

> **listenerCount**(`event`): `number`

Get listener count for an event

#### Parameters

##### event

keyof [`ModalEventMap`](ModalEventMap.md)

#### Returns

`number`

***

### off()

> **off**\<`K`\>(`event`, `listener`): `void`

Unsubscribe from an event

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### listener

(`payload`) => `void`

#### Returns

`void`

***

### on()

> **on**\<`K`\>(`event`, `listener`): () => `void`

Subscribe to an event

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### listener

(`payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### onCategory()

> **onCategory**(`category`, `listener`): () => `void`

Subscribe to multiple events in a category

#### Parameters

##### category

`"wallet"` | `"provider"` | `"chain"` | `"connection"` | `"view"` | `"state"` | `"session"` | `"transport"`

##### listener

(`event`, `payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### once()

> **once**\<`K`\>(`event`, `listener`): () => `void`

Subscribe to an event once

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### listener

(`payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Remove all listeners

#### Parameters

##### event?

keyof ModalEventMap

#### Returns

`void`
