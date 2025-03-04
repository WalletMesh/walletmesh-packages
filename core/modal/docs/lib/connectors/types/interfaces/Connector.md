[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/connectors/types](../README.md) / Connector

# Interface: Connector

Defined in: [core/modal/src/lib/connectors/types.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/connectors/types.ts#L17)

Interface for blockchain-specific wallet connectors.

Connectors serve as intermediaries between the dApp and blockchain wallets,
providing a standardized interface for:
- Establishing wallet connections
- Managing wallet state and communication
- Handling protocol-specific messaging
- Providing chain-specific providers

Each connector implementation handles the complexities of a specific
blockchain protocol or wallet type, abstracting them behind this
common interface.

## Methods

### connect()

> **connect**(`walletInfo`): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/connectors/types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/connectors/types.ts#L33)

Establishes a new connection with the wallet.

#### Parameters

##### walletInfo

[`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

Configuration and metadata for the wallet to connect

#### Returns

`Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Promise resolving to the connected wallet details

#### Throws

If connection fails or is rejected

#### Remarks

The connection process typically involves:
1. Creating and initializing transport
2. Initializing the protocol-specific connection
3. Requesting user approval
4. Setting up message handlers
5. Establishing the initial wallet state

***

### resume()

> **resume**(`walletInfo`, `savedState`): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/connectors/types.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/connectors/types.ts#L50)

Resumes an existing wallet connection.

#### Parameters

##### walletInfo

[`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

Configuration for the wallet to reconnect

##### savedState

[`WalletState`](../../../../index/interfaces/WalletState.md)

Previous session state to restore

#### Returns

`Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Promise resolving to the reconnected wallet details

#### Throws

If session restoration fails

#### Remarks

Session restoration involves:
1. Recreating transport layer
2. Validating the saved state
3. Reestablishing the connection
4. Verifying the wallet state matches

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/connectors/types.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/connectors/types.ts#L64)

Terminates the wallet connection and cleans up resources.

#### Returns

`Promise`\<`void`\>

#### Throws

If disconnection fails

#### Remarks

Cleanup tasks typically include:
- Closing transport connections
- Closing protocol-specific connections
- Removing message handlers
- Clearing cached state
- Releasing system resources

***

### handleMessage()

> **handleMessage**(`data`): `void`

Defined in: [core/modal/src/lib/connectors/types.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/connectors/types.ts#L70)

Processes incoming messages from the transport layer.

#### Parameters

##### data

`unknown`

Message payload from the transport

#### Returns

`void`

***

### getProvider()

> **getProvider**(): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/connectors/types.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/connectors/types.ts#L77)

Gets chain-specific provider instance.

#### Returns

`Promise`\<`unknown`\>

Chain-specific provider (e.g., Web3Provider)

#### Throws

If provider is unavailable
