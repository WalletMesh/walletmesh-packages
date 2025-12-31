[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportConfig

# Interface: TransportConfig

Interface for base transport configuration

## Remarks

Common configuration options for all transport types.
Specific transport types extend this with their own options.
The transport layer handles communication between the modal and wallet implementations.

## Example

```typescript
const config: TransportConfig = {
  url: 'wss://example.com/wallet',
  timeout: 30000,
  reconnect: true,
  reconnectInterval: 5000
};
```

## Extended by

- [`PopupConfig`](PopupConfig.md)
- [`ChromeExtensionConfig`](ChromeExtensionConfig.md)

## Properties

### reconnect?

> `optional` **reconnect**: `boolean`

Whether to automatically reconnect on disconnection
When true, the transport will attempt to reconnect after unexpected disconnections

#### Default Value

```ts
true
```

***

### reconnectInterval?

> `optional` **reconnectInterval**: `number`

Interval between reconnection attempts in milliseconds
Used when reconnect is true to space out reconnection attempts

#### Default Value

```ts
5000 (5 seconds)
```

***

### timeout?

> `optional` **timeout**: `number`

Connection timeout in milliseconds
After this duration, connection attempts will fail with a timeout error

#### Default Value

```ts
30000 (30 seconds)
```

***

### url?

> `optional` **url**: `string`

URL to connect to (format depends on transport type)
- WebSocket: wss:// or ws:// URLs
- HTTP: https:// or http:// URLs
- Chrome Extension: chrome-extension:// URLs

#### Default Value

```ts
undefined (transport-specific defaults apply)
```
