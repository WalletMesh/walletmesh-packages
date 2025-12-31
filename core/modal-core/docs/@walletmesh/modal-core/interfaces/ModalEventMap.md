[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ModalEventMap

# Interface: ModalEventMap

Consolidated modal event map with standardized event names

Event naming convention:
- View events: `view:*` - Modal view state changes
- Connection events: `connection:*` - Wallet connection lifecycle
- State events: `state:*` - General state updates
- Wallet events: `wallet:*` - Wallet discovery and availability
- Session events: `session:*` - Session lifecycle and management
- Provider events: `provider:*` - Provider lifecycle and operations
- Transport events: `transport:*` - Transport communication events
- Chain events: `chain:*` - Chain switching and management

## Example

```typescript
// Type-safe event handling
function handleEvent<K extends keyof ModalEventMap>(
  event: K,
  handler: (data: ModalEventMap[K]) => void
) {
  emitter.on(event, handler);
}

// Usage with full type safety
handleEvent('connection:established', (data) => {
  // TypeScript knows all properties of ConnectionEstablishedEvent
  console.log(data.walletId, data.chainId, data.accounts);
});
```

## Properties

### chain:added

> **chain:added**: [`ChainAddedEvent`](ChainAddedEvent.md)

***

### chain:switch-failed

> **chain:switch-failed**: [`ChainSwitchFailedEvent`](ChainSwitchFailedEvent.md)

***

### chain:switched

> **chain:switched**: [`ChainSwitchedEvent`](ChainSwitchedEvent.md)

***

### chain:switching

> **chain:switching**: [`ChainSwitchingEvent`](ChainSwitchingEvent.md)

***

### connection:established

> **connection:established**: [`ConnectionEstablishedEvent`](ConnectionEstablishedEvent.md)

***

### connection:establishing

> **connection:establishing**: [`ConnectionEstablishingEvent`](ConnectionEstablishingEvent.md)

***

### connection:failed

> **connection:failed**: [`ConnectionFailedEvent`](ConnectionFailedEvent.md)

***

### connection:initiated

> **connection:initiated**: [`ConnectionInitiatedEvent`](ConnectionInitiatedEvent.md)

***

### connection:lost

> **connection:lost**: [`ConnectionLostEvent`](ConnectionLostEvent.md)

***

### connection:restored

> **connection:restored**: [`ConnectionRestoredEvent`](ConnectionRestoredEvent.md)

***

### provider:connected

> **provider:connected**: [`ProviderConnectedEvent`](ProviderConnectedEvent.md)

***

### provider:disconnected

> **provider:disconnected**: [`ProviderDisconnectedEvent`](ProviderDisconnectedEvent.md)

***

### provider:error

> **provider:error**: [`ProviderErrorEvent`](ProviderErrorEvent.md)

***

### provider:registered

> **provider:registered**: [`ProviderRegisteredEvent`](ProviderRegisteredEvent.md)

***

### provider:status-changed

> **provider:status-changed**: [`ProviderStatusChangedEvent`](ProviderStatusChangedEvent.md)

***

### provider:unregistered

> **provider:unregistered**: [`ProviderUnregisteredEvent`](ProviderUnregisteredEvent.md)

***

### session:created

> **session:created**: [`SessionCreatedEvent`](SessionCreatedEvent.md)

***

### session:ended

> **session:ended**: [`SessionEndedEvent`](SessionEndedEvent.md)

***

### session:error

> **session:error**: [`SessionErrorEvent`](SessionErrorEvent.md)

***

### session:expired

> **session:expired**: [`SessionExpiredEvent`](SessionExpiredEvent.md)

***

### session:status-changed

> **session:status-changed**: [`SessionStatusChangedEvent`](SessionStatusChangedEvent.md)

***

### session:updated

> **session:updated**: [`SessionUpdatedEvent`](SessionUpdatedEvent.md)

***

### state:reset

> **state:reset**: [`StateResetEvent`](StateResetEvent.md)

***

### state:updated

> **state:updated**: [`StateUpdatedEvent`](StateUpdatedEvent.md)

***

### transport:connected

> **transport:connected**: [`ModalTransportConnectedEvent`](ModalTransportConnectedEvent.md)

***

### transport:disconnected

> **transport:disconnected**: [`ModalTransportDisconnectedEvent`](ModalTransportDisconnectedEvent.md)

***

### transport:error

> **transport:error**: [`ModalTransportErrorEvent`](ModalTransportErrorEvent.md)

***

### transport:message

> **transport:message**: [`ModalTransportMessageEvent`](ModalTransportMessageEvent.md)

***

### view:changed

> **view:changed**: [`ViewChangedEvent`](ViewChangedEvent.md)

***

### view:changing

> **view:changing**: [`ViewChangingEvent`](ViewChangingEvent.md)

***

### wallet:available

> **wallet:available**: [`WalletAvailableEvent`](WalletAvailableEvent.md)

***

### wallet:discovered

> **wallet:discovered**: [`WalletDiscoveredEvent`](WalletDiscoveredEvent.md)

***

### wallet:selected

> **wallet:selected**: [`WalletSelectedEvent`](WalletSelectedEvent.md)

***

### wallet:unavailable

> **wallet:unavailable**: [`WalletUnavailableEvent`](WalletUnavailableEvent.md)
