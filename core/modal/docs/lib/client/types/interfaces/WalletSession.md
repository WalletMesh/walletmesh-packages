[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletSession

# Interface: WalletSession

Defined in: [core/modal/src/lib/client/types.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L86)

Represents an active wallet session with its associated state and configuration.

A session is the core data structure that maintains the state of a wallet
connection, including:
- Connection status and history
- Protocol-specific connector instance
- Wallet state and metadata
- Error tracking

Maintains the connection state, protocol connector, and wallet information
required to manage an active wallet connection.

## Example

```typescript
const session: WalletSession = {
  connector: new WalletConnector(),
  wallet: connectedWallet,
  status: ConnectionStatus.Connected,
  connectorConfig: { type: 'standard' }
};
```

## Properties

### id

> **id**: `string`

Defined in: [core/modal/src/lib/client/types.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L87)

***

### timestamp

> **timestamp**: `number`

Defined in: [core/modal/src/lib/client/types.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L88)

***

### connector?

> `optional` **connector**: [`Connector`](../../../connectors/types/interfaces/Connector.md)

Defined in: [core/modal/src/lib/client/types.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L89)

Optional connector instance for protocol handling

***

### wallet

> **wallet**: [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L90)

The connected wallet instance

***

### status

> **status**: [`ConnectionStatus`](../../../../index/enumerations/ConnectionStatus.md)

Defined in: [core/modal/src/lib/client/types.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L91)

Current connection status

***

### lastError?

> `optional` **lastError**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/client/types.ts#L92)

Last error encountered, if any
