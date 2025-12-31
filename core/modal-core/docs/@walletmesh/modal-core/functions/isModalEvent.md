[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isModalEvent

# Function: isModalEvent()

> **isModalEvent**(`event`): `event is keyof ModalEventMap`

Type guard to check if an event is a valid modal event

Validates that a string is a recognized event name in the system.
Useful for runtime validation of event names from external sources.

## Parameters

### event

`string`

Event name to validate

## Returns

`event is keyof ModalEventMap`

True if event is a valid ModalEventMap key

## Example

```typescript
function subscribeToEvent(eventName: string, handler: Function) {
  if (!isModalEvent(eventName)) {
    throw new Error(`Unknown event: ${eventName}`);
  }

  // TypeScript now knows eventName is keyof ModalEventMap
  emitter.on(eventName, handler);
}

// Validate events from configuration
const eventsToTrack = ['connection:established', 'unknown:event'];
const validEvents = eventsToTrack.filter(isModalEvent);
```
