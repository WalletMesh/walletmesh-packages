[**@walletmesh/modal-core v0.0.3**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ViewChangingEvent

# Interface: ViewChangingEvent

Event fired when the modal view is about to change

This event allows for view transition validation and cancellation.
Use the cancelable flag to determine if preventDefault is supported.

## Example

```typescript
emitter.on(ModalEventType.ViewChanging, (event) => {
  // Validate navigation
  if (event.fromView === 'connecting' && event.toView === 'walletSelection') {
    if (event.cancelable && isConnectionInProgress()) {
      event.preventDefault(); // Prevent going back during connection
    }
  }

  // Prepare transition animation
  prepareViewTransition(event.fromView, event.toView);
});
```

 ViewChangingEvent

## Extends

- `BaseEvent`

## Properties

### cancelable

> **cancelable**: `boolean`

Whether the view change can be prevented

***

### fromView

> **fromView**: `string`

Current view being navigated from

***

### toView

> **toView**: `string`

New view being navigated to

***

### type

> **type**: [`ViewChanging`](../enumerations/InternalModalEventType.md#viewchanging)

Event type identifier

#### Overrides

`BaseEvent.type`
