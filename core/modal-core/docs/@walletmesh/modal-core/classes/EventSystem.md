[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EventSystem

# Class: EventSystem

Comprehensive Event System for WalletMeshClient

The EventSystem provides a robust event-driven architecture for wallet interactions.
It supports advanced features like event replay, priority handling, and filtering.

## Key Features

- **Type Safety**: Full TypeScript support with WalletEventMap
- **Event History**: Optional persistence for debugging and replay
- **Priority Handling**: Process critical events first
- **Smart Filtering**: Reduce noise with wallet/chain filters
- **Error Resilience**: Isolated handler errors don't break the system
- **Performance**: Efficient subscription management and dispatch

## Usage Patterns

### Basic Event Subscription
```typescript
const eventSystem = new EventSystem(logger);

// Subscribe to all connection events
eventSystem.on('connection:established', (event) => {
  updateUI(event.walletId, event.accounts);
});
```

### Filtered Subscriptions
```typescript
// Only receive MetaMask events on Ethereum mainnet
eventSystem.on('chain:switched', handleChainSwitch, {
  walletId: 'metamask',
  chainId: '0x1'
});
```

### Event Replay for New Components
```typescript
// Replay recent events when component mounts
eventSystem.replayEvents('connection:established', (event) => {
  restoreConnectionState(event);
}, { since: Date.now() - 60000 }); // Last minute
```

### Priority Event Handling
```typescript
// Critical error handler runs first
eventSystem.on('error:global', handleCriticalError, {
  priority: 100
});

// Normal error logging runs after
eventSystem.on('error:global', logError, {
  priority: 10
});
```

### Event History and Debugging
```typescript
const eventSystem = new EventSystem(logger, {
  maxHistorySize: 1000,
  enablePersistence: true,
  enableReplay: true
});

// Get recent events for debugging
const recentErrors = eventSystem.getEventHistory('error:wallet', 10);
console.log('Last 10 wallet errors:', recentErrors);
```

## Constructors

### Constructor

> **new EventSystem**(`logger`, `config`): `EventSystem`

#### Parameters

##### logger

[`Logger`](Logger.md)

##### config

[`EventSystemConfig`](../interfaces/EventSystemConfig.md) = `{}`

#### Returns

`EventSystem`

## Methods

### clearHistory()

> **clearHistory**(`event?`): `void`

Clear event history

#### Parameters

##### event?

`string`

Specific event to clear (optional, clears all if not specified)

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Clean up event system resources

#### Returns

`void`

***

### emit()

> **emit**\<`K`\>(`event`, `data`): `void`

Emit an event to all subscribers

Dispatches an event to all matching subscribers in priority order.
Automatically adds timestamp if not provided. Handles async handlers
gracefully and isolates errors to prevent cascade failures.

#### Type Parameters

##### K

`K` *extends* keyof [`WalletEventMap`](../interfaces/WalletEventMap.md)

#### Parameters

##### event

`K`

Event name from WalletEventMap

##### data

[`WalletEventMap`](../interfaces/WalletEventMap.md)\[`K`\]

Event data matching the event type

#### Returns

`void`

#### Example

```typescript
// Emit connection established
eventSystem.emit('connection:established', {
  walletId: 'metamask',
  connection: walletConnection,
  timestamp: Date.now()
});

// Emit error event
eventSystem.emit('error:wallet', {
  walletId: 'metamask',
  error: new Error('Connection failed'),
  timestamp: Date.now()
});

// Emit chain switch
eventSystem.emit('chain:switched', {
  sessionId: 'abc123',
  walletId: 'metamask',
  fromChain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
  toChain: { chainId: '0x89', chainType: ChainType.Evm, name: 'Polygon', required: false },
  isNewChain: true,
  timestamp: Date.now()
});
```

***

### getEventHistory()

> **getEventHistory**(`event?`, `limit?`): [`EventHistoryEntry`](../interfaces/EventHistoryEntry.md)[]

Get event history for a specific event type

Retrieves historical events for debugging, analytics, or replay.
Useful for understanding event sequences and debugging issues.

#### Parameters

##### event?

`string`

Event name (optional, returns all if not specified)

##### limit?

`number`

Maximum number of events to return (most recent)

#### Returns

[`EventHistoryEntry`](../interfaces/EventHistoryEntry.md)[]

Array of event history entries with timestamps and IDs

#### Example

```typescript
// Get all connection events
const connections = eventSystem.getEventHistory('connection:established');
console.log(`Total connections: ${connections.length}`);

// Get last 5 errors for debugging
const recentErrors = eventSystem.getEventHistory('error:wallet', 5);
recentErrors.forEach(entry => {
  console.log(`[${entry.timestamp}] ${entry.data.error.message}`);
});

// Get all events for analysis
const allEvents = eventSystem.getEventHistory();
const eventsByType = allEvents.reduce((acc, entry) => {
  acc[entry.event] = (acc[entry.event] || 0) + 1;
  return acc;
}, {});
```

***

### getStats()

> **getStats**(): `object`

Get subscription statistics

Provides insights into event system usage for monitoring and optimization.
Useful for debugging subscription leaks and understanding event flow.

#### Returns

`object`

Subscription statistics including counts and breakdown

##### eventTypes

> **eventTypes**: `number`

##### historySize

> **historySize**: `number`

##### subscriptionsByEvent

> **subscriptionsByEvent**: `Record`\<`string`, `number`\>

##### totalSubscriptions

> **totalSubscriptions**: `number`

##### walletSubscriptions

> **walletSubscriptions**: `number`

#### Example

```typescript
const stats = eventSystem.getStats();
console.log(`Total subscriptions: ${stats.totalSubscriptions}`);
console.log(`Event types: ${stats.eventTypes}`);
console.log(`History size: ${stats.historySize}`);

// Check for subscription leaks
if (stats.totalSubscriptions > 1000) {
  console.warn('High subscription count - check for leaks');
}

// Monitor specific events
Object.entries(stats.subscriptionsByEvent).forEach(([event, count]) => {
  if (count > 10) {
    console.log(`${event}: ${count} subscribers`);
  }
});
```

***

### on()

> **on**\<`K`\>(`event`, `handler`, `options`): () => `void`

Subscribe to an event

Creates a subscription to a specific event type with optional filtering
and transformation. Returns an unsubscribe function for cleanup.

#### Type Parameters

##### K

`K` *extends* keyof [`WalletEventMap`](../interfaces/WalletEventMap.md)

#### Parameters

##### event

`K`

Event name to subscribe to

##### handler

[`EventHandler`](../type-aliases/EventHandler.md)\<[`WalletEventMap`](../interfaces/WalletEventMap.md)\[`K`\]\>

Event handler function

##### options

[`EventSubscriptionOptions`](../interfaces/EventSubscriptionOptions.md) = `{}`

Subscription options for filtering and priority

#### Returns

Unsubscribe function - Call this to remove the subscription

> (): `void`

##### Returns

`void`

#### Example

```typescript
// Basic subscription
const unsubscribe = eventSystem.on('connection:established', (event) => {
  console.log(`Connected: ${event.walletId}`);
});

// Filtered subscription
const unsubMetaMask = eventSystem.on('accounts:changed',
  (event) => updateAccounts(event.accounts),
  { walletId: 'metamask' }
);

// Cleanup when done
unsubscribe();
unsubMetaMask();
```

***

### once()

> **once**\<`K`\>(`event`, `handler`, `options`): () => `void`

Subscribe to an event once

#### Type Parameters

##### K

`K` *extends* keyof [`WalletEventMap`](../interfaces/WalletEventMap.md)

#### Parameters

##### event

`K`

Event name to subscribe to

##### handler

[`EventHandler`](../type-aliases/EventHandler.md)\<[`WalletEventMap`](../interfaces/WalletEventMap.md)\[`K`\]\>

Event handler function

##### options

[`EventSubscriptionOptions`](../interfaces/EventSubscriptionOptions.md) = `{}`

Subscription options

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### onError()

> **onError**(`handler`): () => `void`

Add global error handler

#### Parameters

##### handler

(`error`, `context`) => `void`

Error handler function

#### Returns

Remove handler function

> (): `void`

##### Returns

`void`

***

### replayEvents()

> **replayEvents**\<`K`\>(`event`, `handler`, `options`): `void`

Replay events to new subscribers

Replays historical events to restore state or catch up new components.
Particularly useful for components that mount after events have occurred.

#### Type Parameters

##### K

`K` *extends* keyof [`WalletEventMap`](../interfaces/WalletEventMap.md)

#### Parameters

##### event

`K`

Event name to replay

##### handler

[`EventHandler`](../type-aliases/EventHandler.md)\<[`WalletEventMap`](../interfaces/WalletEventMap.md)\[`K`\]\>

Handler to receive replayed events

##### options

Replay options (since timestamp, limit)

###### limit?

`number`

###### since?

`number`

#### Returns

`void`

#### Example

```typescript
// Component mounting - replay recent connections
componentDidMount() {
  // Replay connections from last 5 minutes
  eventSystem.replayEvents('connection:established',
    (event) => this.handleConnection(event),
    { since: Date.now() - 300000 }
  );
}

// Restore all wallet states on page reload
eventSystem.replayEvents('connection:established', (event) => {
  restoreWalletState(event.walletId, event.connection);
});

// Get last 3 chain switches for UI
eventSystem.replayEvents('chain:switched',
  (event) => addToChainHistory(event),
  { limit: 3 }
);
```

***

### unsubscribe()

> **unsubscribe**(`subscriptionId`): `void`

Unsubscribe from an event by subscription ID

#### Parameters

##### subscriptionId

`string`

ID of the subscription to remove

#### Returns

`void`

***

### unsubscribeWallet()

> **unsubscribeWallet**(`walletId`): `void`

Remove all subscriptions for a specific wallet

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`void`
