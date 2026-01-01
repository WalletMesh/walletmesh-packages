[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / InternalModalEventType

# Enumeration: InternalModalEventType

All possible modal event types

Defines the complete set of events that can occur during modal interactions.
Events are organized by lifecycle phase and user interactions.

## Example

```typescript
// Type-safe event handling
switch (event.type) {
  case ModalEventType.Opening:
    showLoadingState();
    break;
  case ModalEventType.Error:
    displayError(event.error);
    break;
}
```

## Enumeration Members

### Closed

> **Closed**: `"closed"`

Modal closed

***

### Closing

> **Closing**: `"closing"`

Modal is about to close

***

### Error

> **Error**: `"error"`

Error in modal

***

### Opened

> **Opened**: `"opened"`

Modal opened successfully

***

### Opening

> **Opening**: `"opening"`

Modal is about to open

***

### ViewChanged

> **ViewChanged**: `"viewChanged"`

View changed

***

### ViewChanging

> **ViewChanging**: `"viewChanging"`

View is changing
