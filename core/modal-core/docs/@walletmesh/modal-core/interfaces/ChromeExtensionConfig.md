[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChromeExtensionConfig

# Interface: ChromeExtensionConfig

Interface for Chrome extension transport configuration

## Remarks

Configuration options specific to Chrome extension transports.
Extends the base transport configuration.
This transport type communicates with browser extension wallets
using the Chrome Extension API for secure cross-origin messaging.

## Examples

```typescript
const extensionConfig: ChromeExtensionConfig = {
  extensionId: 'abcdefghijklmnopqrstuvwxyz',
  retries: 3,
  retryDelay: 1000
};
```

```typescript
// MetaMask extension configuration
const metamaskConfig: ChromeExtensionConfig = {
  extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  timeout: 60000,
  retries: 5,
  retryDelay: 2000
};
```

## Extends

- [`TransportConfig`](TransportConfig.md)

## Properties

### extensionId

> **extensionId**: `string`

ID of the target Chrome extension

#### Remarks

The 32-character extension ID from the Chrome Web Store.
Can be found in chrome://extensions/ when developer mode is enabled.
Each wallet extension has a unique ID.

#### Examples

```ts
"nkbihfbeogaeaoehlefnkodbefgpgknn" // MetaMask
```

```ts
"hnfanknocfeofbddgcijnmhnfnkdnaad" // Coinbase Wallet
```

***

### reconnect?

> `optional` **reconnect**: `boolean`

Whether to automatically reconnect on disconnection
When true, the transport will attempt to reconnect after unexpected disconnections

#### Default Value

```ts
true
```

#### Inherited from

[`TransportConfig`](TransportConfig.md).[`reconnect`](TransportConfig.md#reconnect)

***

### reconnectInterval?

> `optional` **reconnectInterval**: `number`

Interval between reconnection attempts in milliseconds
Used when reconnect is true to space out reconnection attempts

#### Default Value

```ts
5000 (5 seconds)
```

#### Inherited from

[`TransportConfig`](TransportConfig.md).[`reconnectInterval`](TransportConfig.md#reconnectinterval)

***

### retries?

> `optional` **retries**: `number`

Maximum number of connection retry attempts

#### Default Value

```ts
3
```

#### Remarks

Number of times to retry connecting if the extension is not immediately available.
Useful when the extension is still loading or temporarily unresponsive.

***

### retryDelay?

> `optional` **retryDelay**: `number`

Delay between retry attempts in milliseconds

#### Default Value

```ts
1000 (1 second)
```

#### Remarks

Time to wait between connection retry attempts.
Increase for slower systems or extensions that take longer to initialize.

***

### timeout?

> `optional` **timeout**: `number`

Connection timeout in milliseconds
After this duration, connection attempts will fail with a timeout error

#### Default Value

```ts
30000 (30 seconds)
```

#### Inherited from

[`TransportConfig`](TransportConfig.md).[`timeout`](TransportConfig.md#timeout)

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

#### Inherited from

[`TransportConfig`](TransportConfig.md).[`url`](TransportConfig.md#url)
