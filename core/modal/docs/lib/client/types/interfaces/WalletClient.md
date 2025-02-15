[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletClient

# Interface: WalletClient

Defined in: [core/modal/src/lib/client/types.ts:147](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L147)

Core interface for wallet interactions in the WalletMesh system.

This interface defines the contract that all wallet client implementations
must fulfill. It provides a complete API for:

Connection Management:
- Establishing new wallet connections
- Managing connection lifecycle
- Handling disconnections

State Management:
- Reading connection state
- Querying connected wallets
- Accessing blockchain providers

Error Handling:
- Standardized error processing
- Connection recovery

## Remarks

The WalletClient interface is the primary integration point for dApps.
It abstracts away the complexities of:
- Protocol-specific communication
- Session persistence
- Connection recovery
- State synchronization

Implementations of this interface provide methods for:
- Wallet connection and disconnection
- Session management
- State queries
- Error handling

## Example

```typescript
class MyWalletClient implements WalletClient {
  async initialize() {
    // Restore previous session if available
    return this.attemptRestore();
  }

  async connectWallet(walletInfo, transport, connector) {
    // Establish new wallet connection
    return this.connect(walletInfo);
  }

  // ... other method implementations
}
```

## Methods

### getDappInfo()

> **getDappInfo**(): `Readonly`\<[`DappInfo`](../../../../index/interfaces/DappInfo.md)\>

Defined in: [core/modal/src/lib/client/types.ts:151](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L151)

Gets the immutable dApp information associated with this client.

#### Returns

`Readonly`\<[`DappInfo`](../../../../index/interfaces/DappInfo.md)\>

***

### initialize()

> **initialize**(): `Promise`\<`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/types.ts:164](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L164)

Initializes the client and attempts to restore any saved sessions.

#### Returns

`Promise`\<`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Promise resolving to restored wallet if available

#### Throws

If initialization fails

#### Remarks

- Should be called when dApp loads
- Attempts to restore the most recent session
- Returns null if no session to restore

***

### connectWallet()

> **connectWallet**(`walletInfo`, `connector`, `options`?): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/types.ts:180](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L180)

Establishes a new wallet connection.

#### Parameters

##### walletInfo

[`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

Information about the wallet to connect

##### connector

[`Connector`](../../../connectors/types/interfaces/Connector.md)

Protocol-specific connector instance

##### options?

Optional connection configuration

###### persist

`boolean`

#### Returns

`Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Promise resolving to connected wallet instance

#### Throws

If connection fails

#### Remarks

- Validates wallet information
- Manages connector lifecycle
- Handles session persistence

***

### disconnectWallet()

> **disconnectWallet**(`walletId`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/types.ts:197](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L197)

Disconnects a specific wallet.

#### Parameters

##### walletId

`string`

ID of wallet to disconnect

#### Returns

`Promise`\<`void`\>

#### Throws

If disconnection fails

#### Remarks

- Cleans up connection resources
- Removes session data if not preserving
- Handles failed disconnections

***

### getProvider()

> **getProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/types.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L206)

Gets the blockchain-specific provider for a wallet.

#### Parameters

##### walletId

`string`

ID of wallet to get provider for

#### Returns

`Promise`\<`unknown`\>

Promise resolving to provider instance

#### Throws

If provider unavailable

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/types.ts:216](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L216)

Gets all currently connected wallets.

#### Returns

[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)[]

Array of connected wallet instances

#### Remarks

Returns only wallets in Connected state

***

### getConnectedWallet()

> **getConnectedWallet**(): `null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:223](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L223)

Gets the primary connected wallet.

#### Returns

`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Connected wallet or null if none connected

***

### handleError()

> **handleError**(`error`): `void`

Defined in: [core/modal/src/lib/client/types.ts:237](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L237)

Processes a wallet-related error.

#### Parameters

##### error

[`WalletError`](../classes/WalletError.md)

Error to handle

#### Returns

`void`

#### Remarks

Implementations should:
- Log error details
- Update connection state
- Trigger UI updates
- Attempt recovery if possible
