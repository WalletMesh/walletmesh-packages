[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / Disposable

# Interface: Disposable

Defined in: core/modal-core/dist/types.d.ts:1350

Interface for objects that require cleanup

## Remarks

Implemented by services and resources that need to perform cleanup
when they are no longer needed to prevent memory leaks.
This is a fundamental pattern in the modal-core system for managing
resources like event listeners, timers, subscriptions, and DOM elements.

## Examples

```typescript
class MyService implements Disposable {
  private timer: NodeJS.Timeout;

  constructor() {
    this.timer = setInterval(() => {}, 1000);
  }

  dispose(): void {
    clearInterval(this.timer);
  }
}

const service = new MyService();
// Use service...
service.dispose(); // Clean up resources
```

```typescript
// Async cleanup example
class WebSocketService implements Disposable {
  private ws: WebSocket;

  constructor(url: string) {
    this.ws = new WebSocket(url);
  }

  async dispose(): Promise<void> {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      await new Promise(resolve => {
        this.ws.addEventListener('close', resolve, { once: true });
      });
    }
  }
}
```

```typescript
// Composite disposable pattern
class CompositeService implements Disposable {
  private disposables: Disposable[] = [];

  addDisposable(disposable: Disposable) {
    this.disposables.push(disposable);
  }

  async dispose(): Promise<void> {
    await Promise.all(
      this.disposables.map(d => d.dispose())
    );
    this.disposables = [];
  }
}
```

## Methods

### dispose()

> **dispose**(): `void` \| `Promise`\<`void`\>

Defined in: core/modal-core/dist/types.d.ts:1384

Cleanup method called when the object is no longer needed

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup is complete, or void for synchronous cleanup

#### Remarks

This method should clean up all resources held by the object:
- Remove event listeners
- Clear timers and intervals
- Close connections (WebSocket, etc.)
- Unsubscribe from observables
- Remove DOM elements
- Clear cached data

The method can be synchronous (returning void) or asynchronous
(returning Promise<void>) depending on the cleanup requirements.

#### Examples

```typescript
// Synchronous cleanup
dispose(): void {
  this.eventEmitter.removeAllListeners();
  clearInterval(this.timer);
}
```

```typescript
// Asynchronous cleanup
async dispose(): Promise<void> {
  await this.connection.close();
  this.cache.clear();
}
```
