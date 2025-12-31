[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportConfig

# Interface: TransportConfig

Defined in: core/modal-core/dist/types.d.ts:557

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

Defined in: core/modal-core/dist/types.d.ts:577

Whether to automatically reconnect on disconnection
When true, the transport will attempt to reconnect after unexpected disconnections

#### Default Value

```ts
true
```

***

### reconnectInterval?

> `optional` **reconnectInterval**: `number`

Defined in: core/modal-core/dist/types.d.ts:583

Interval between reconnection attempts in milliseconds
Used when reconnect is true to space out reconnection attempts

#### Default Value

```ts
5000 (5 seconds)
```

***

### timeout?

> `optional` **timeout**: `number`

Defined in: core/modal-core/dist/types.d.ts:571

Connection timeout in milliseconds
After this duration, connection attempts will fail with a timeout error

#### Default Value

```ts
30000 (30 seconds)
```

***

### url?

> `optional` **url**: `string`

Defined in: core/modal-core/dist/types.d.ts:565

URL to connect to (format depends on transport type)
- WebSocket: wss:// or ws:// URLs
- HTTP: https:// or http:// URLs
- Chrome Extension: chrome-extension:// URLs

#### Default Value

```ts
undefined (transport-specific defaults apply)
```
