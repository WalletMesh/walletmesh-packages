[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / TransportContext

# Interface: TransportContext

Defined in: [core/jsonrpc/src/types.ts:456](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/types.ts#L456)

Context information provided by transports that have access to trusted metadata.
Some transports (like postMessage-based transports) can provide browser-validated
origin information, while others may not have access to such trusted data.

## Example

```typescript
// Browser-validated origin from postMessage
const context: TransportContext = {
  origin: 'https://app.example.com',
  trustedSource: true,
  transportType: 'popup'
};

// Origin forwarded through local transport
const context: TransportContext = {
  origin: 'https://app.example.com',
  trustedSource: false,
  transportType: 'local'
};
```

## Properties

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/types.ts:480](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/types.ts#L480)

Additional transport-specific metadata.

***

### origin?

> `optional` **origin**: `string`

Defined in: [core/jsonrpc/src/types.ts:462](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/types.ts#L462)

The origin of the message sender.
For browser transports, this is typically from MessageEvent.origin.
For forwarded messages, this may come from upstream context.

***

### transportType

> **transportType**: `string`

Defined in: [core/jsonrpc/src/types.ts:475](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/types.ts#L475)

The type of transport providing this context.
Examples: 'popup', 'iframe', 'extension', 'local', 'websocket'

***

### trustedSource

> **trustedSource**: `boolean`

Defined in: [core/jsonrpc/src/types.ts:469](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/types.ts#L469)

Whether the origin is browser-validated (trusted).
- `true`: Origin comes from browser API (e.g., MessageEvent.origin)
- `false`: Origin is forwarded or self-reported (not browser-validated)
