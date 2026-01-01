[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChromeExtensionConfig

# Interface: ChromeExtensionConfig

Defined in: core/modal-core/dist/types.d.ts:686

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

Defined in: core/modal-core/dist/types.d.ts:696

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

Defined in: core/modal-core/dist/types.d.ts:577

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

Defined in: core/modal-core/dist/types.d.ts:583

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

Defined in: core/modal-core/dist/types.d.ts:704

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

Defined in: core/modal-core/dist/types.d.ts:712

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

Defined in: core/modal-core/dist/types.d.ts:571

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

Defined in: core/modal-core/dist/types.d.ts:565

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
