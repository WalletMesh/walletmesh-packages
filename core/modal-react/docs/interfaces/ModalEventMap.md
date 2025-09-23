[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ModalEventMap

# Interface: ModalEventMap

Defined in: core/modal-core/dist/api/types/events.d.ts:113

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

> **chain:added**: `ChainAddedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:147

***

### chain:switch-failed

> **chain:switch-failed**: `ChainSwitchFailedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:146

***

### chain:switched

> **chain:switched**: [`ChainSwitchedEvent`](ChainSwitchedEvent.md)

Defined in: core/modal-core/dist/api/types/events.d.ts:145

***

### chain:switching

> **chain:switching**: `ChainSwitchingEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:144

***

### connection:established

> **connection:established**: [`ConnectionEstablishedEvent`](ConnectionEstablishedEvent.md)

Defined in: core/modal-core/dist/api/types/events.d.ts:118

***

### connection:establishing

> **connection:establishing**: `ConnectionEstablishingEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:117

***

### connection:failed

> **connection:failed**: `ConnectionFailedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:119

***

### connection:initiated

> **connection:initiated**: `ConnectionInitiatedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:116

***

### connection:lost

> **connection:lost**: `ConnectionLostEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:120

***

### connection:restored

> **connection:restored**: `ConnectionRestoredEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:121

***

### provider:connected

> **provider:connected**: `ProviderConnectedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:137

***

### provider:disconnected

> **provider:disconnected**: `ProviderDisconnectedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:138

***

### provider:error

> **provider:error**: `ProviderErrorEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:139

***

### provider:registered

> **provider:registered**: `ProviderRegisteredEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:134

***

### provider:status-changed

> **provider:status-changed**: `ProviderStatusChangedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:136

***

### provider:unregistered

> **provider:unregistered**: `ProviderUnregisteredEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:135

***

### session:created

> **session:created**: `SessionCreatedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:128

***

### session:ended

> **session:ended**: `SessionEndedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:131

***

### session:error

> **session:error**: `SessionErrorEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:133

***

### session:expired

> **session:expired**: `SessionExpiredEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:132

***

### session:status-changed

> **session:status-changed**: `SessionStatusChangedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:130

***

### session:updated

> **session:updated**: `SessionUpdatedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:129

***

### state:reset

> **state:reset**: `StateResetEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:123

***

### state:updated

> **state:updated**: [`StateUpdatedEvent`](StateUpdatedEvent.md)

Defined in: core/modal-core/dist/api/types/events.d.ts:122

***

### transport:connected

> **transport:connected**: `TransportConnectedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:140

***

### transport:disconnected

> **transport:disconnected**: `TransportDisconnectedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:141

***

### transport:error

> **transport:error**: `TransportErrorEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:143

***

### transport:message

> **transport:message**: `TransportMessageEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:142

***

### view:changed

> **view:changed**: `ViewChangedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:115

***

### view:changing

> **view:changing**: `ViewChangingEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:114

***

### wallet:available

> **wallet:available**: `WalletAvailableEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:125

***

### wallet:discovered

> **wallet:discovered**: `WalletDiscoveredEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:124

***

### wallet:selected

> **wallet:selected**: `WalletSelectedEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:127

***

### wallet:unavailable

> **wallet:unavailable**: `WalletUnavailableEvent`

Defined in: core/modal-core/dist/api/types/events.d.ts:126
