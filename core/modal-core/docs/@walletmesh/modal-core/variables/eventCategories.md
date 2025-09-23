[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / eventCategories

# Variable: eventCategories

> `const` **eventCategories**: `object`

Event category groupings for filtering and subscriptions

Groups related events together for bulk subscriptions and filtering.
Use with `onCategory` method or for implementing custom event routers.

## Type Declaration

### chain

> `readonly` **chain**: readonly \[`"chain:switching"`, `"chain:switched"`, `"chain:switch-failed"`, `"chain:added"`\]

### connection

> `readonly` **connection**: readonly \[`"connection:initiated"`, `"connection:establishing"`, `"connection:established"`, `"connection:failed"`, `"connection:lost"`, `"connection:restored"`\]

### provider

> `readonly` **provider**: readonly \[`"provider:registered"`, `"provider:unregistered"`, `"provider:status-changed"`, `"provider:connected"`, `"provider:disconnected"`, `"provider:error"`\]

### session

> `readonly` **session**: readonly \[`"session:created"`, `"session:updated"`, `"session:status-changed"`, `"session:ended"`, `"session:expired"`, `"session:error"`\]

### state

> `readonly` **state**: readonly \[`"state:updated"`, `"state:reset"`\]

### transport

> `readonly` **transport**: readonly \[`"transport:connected"`, `"transport:disconnected"`, `"transport:message"`, `"transport:error"`\]

### view

> `readonly` **view**: readonly \[`"view:changing"`, `"view:changed"`\]

### wallet

> `readonly` **wallet**: readonly \[`"wallet:discovered"`, `"wallet:available"`, `"wallet:unavailable"`, `"wallet:selected"`\]

## Example

```typescript
// Subscribe to all connection-related events
eventCategories.connection.forEach(eventName => {
  emitter.on(eventName, (data) => {
    logConnectionEvent(eventName, data);
  });
});

// Filter events by category
function isConnectionEvent(eventName: string): boolean {
  return eventCategories.connection.includes(eventName as any);
}

// Create category-specific event bus
class ConnectionEventBus {
  constructor(private emitter: EventEmitter) {
    this.subscribeToCategory();
  }

  private subscribeToCategory() {
    this.emitter.onCategory('connection', this.handleEvent);
  }
}
```
