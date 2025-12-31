[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / PopupConfig

# Interface: PopupConfig

Interface for popup window transport configuration

## Remarks

Configuration options specific to popup window transports.
Extends the base transport configuration.
This transport type opens wallet connections in a separate browser window,
useful for web-based wallets that don't have browser extensions.

## Examples

```typescript
const popupConfig: PopupConfig = {
  url: 'https://wallet.example.com',
  width: 400,
  height: 600,
  target: '_blank',
  features: 'menubar=no,toolbar=no'
};
```

```typescript
// Centered popup configuration
const centeredPopup: PopupConfig = {
  url: 'https://wallet.example.com/connect',
  width: 450,
  height: 700,
  target: 'wallet-popup',
  features: 'resizable=yes,scrollbars=yes,status=no,location=no'
};
```

## Extends

- [`TransportConfig`](TransportConfig.md)

## Properties

### features?

> `optional` **features**: `string`

Window features string for window.open()

#### Remarks

Comma-separated list of window features. Common options:
- menubar=yes/no: Show menu bar
- toolbar=yes/no: Show toolbar
- location=yes/no: Show location bar
- status=yes/no: Show status bar
- resizable=yes/no: Allow resizing
- scrollbars=yes/no: Show scrollbars

#### Default Value

```ts
"menubar=no,toolbar=no,location=no"
```

#### Example

```ts
"menubar=no,toolbar=no,resizable=yes"
```

***

### height?

> `optional` **height**: `number`

Height of the popup window in pixels

#### Default Value

```ts
600
```

#### Remarks

Recommended range: 500-800 pixels to accommodate wallet UI

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

### target?

> `optional` **target**: `string`

Target name for the popup window

#### Default Value

```ts
"_blank"
```

#### Remarks

- "_blank": Opens in a new window
- Custom name: Reuses window with same name if already open

#### Examples

```ts
"_blank"
```

```ts
"wallet-connect-popup"
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

***

### width?

> `optional` **width**: `number`

Width of the popup window in pixels

#### Default Value

```ts
400
```

#### Remarks

Recommended range: 350-500 pixels for mobile-friendly layouts
