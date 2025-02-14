[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / Adapter

# Interface: Adapter

Defined in: [core/modal/src/lib/adapters/types.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L45)

Interface for blockchain-specific wallet adapters.

Adapters serve as intermediaries between the dApp and blockchain wallets,
providing a standardized interface for:
- Establishing wallet connections
- Managing wallet state
- Handling protocol-specific messaging
- Providing chain-specific providers

Each adapter implementation handles the complexities of a specific
blockchain protocol or wallet type, abstracting them behind this
common interface.

## Remarks

Adapters are responsible for:
- Protocol-specific message handling
- State synchronization
- Connection lifecycle management
- Provider instantiation and management

## Example

```typescript
class MyWalletAdapter implements Adapter {
  async connect(walletInfo: WalletInfo, existingState?: WalletState): Promise<ConnectedWallet> {
    // Implementation
  }

  async disconnect(): Promise<void> {
    // Implementation
  }

  async getProvider(): Promise<unknown> {
    // Implementation
  }

  handleMessage(data: unknown): void {
    // Implementation
  }
}
```

## Methods

### connect()

> **connect**(`walletInfo`): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/adapters/types.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L71)

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
1. Initializing the protocol-specific connection
2. Requesting user approval
3. Setting up message handlers
4. Establishing the initial wallet state

#### Example

```typescript
const wallet = await adapter.connect({
  id: 'my-wallet',
  name: 'My Wallet',
  icon: 'wallet-icon.png',
  transport: { type: 'postMessage' },
  adapter: { type: AdapterType.WalletMeshAztec }
});
```

***

### resume()

> **resume**(`walletInfo`, `savedState`): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/adapters/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L100)

Resumes an existing wallet connection using saved state.

#### Parameters

##### walletInfo

[`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

Configuration for the wallet to reconnect

##### savedState

[`WalletState`](../../../../index/interfaces/WalletState.md)

Previously saved session state to restore

#### Returns

`Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Promise resolving to the reconnected wallet details

#### Throws

If session restoration fails

#### Remarks

Session restoration involves:
1. Validating the saved state
2. Reestablishing the connection
3. Verifying the wallet state matches
4. Reinitializing message handlers

#### Example

```typescript
const wallet = await adapter.resume(
  walletInfo,
  {
    chain: 'aztec:testnet',
    address: '0x...',
    sessionId: 'abc123'
  }
);
```

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/adapters/types.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L115)

Terminates the wallet connection and cleans up resources.

#### Returns

`Promise`\<`void`\>

Promise that resolves when disconnection is complete

#### Throws

If disconnection fails

#### Remarks

Cleanup tasks typically include:
- Closing protocol-specific connections
- Removing message handlers
- Clearing cached state
- Releasing system resources

***

### getProvider()

> **getProvider**(): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/adapters/types.ts:122](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L122)

Retrieves the chain-specific provider instance

#### Returns

`Promise`\<`unknown`\>

Chain-specific provider (e.g., Web3Provider)

#### Throws

If provider is unavailable

***

### handleMessage()

> **handleMessage**(`data`): `void`

Defined in: [core/modal/src/lib/adapters/types.ts:147](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L147)

Processes incoming messages from the transport layer.

#### Parameters

##### data

`unknown`

Message payload from the transport

#### Returns

`void`

#### Remarks

Message handling includes:
- Validating message format and content
- Updating internal state based on messages
- Triggering appropriate callbacks/events
- Error handling for malformed messages

#### Example

```typescript
adapter.handleMessage({
  type: 'STATE_UPDATE',
  payload: {
    chainId: 'aztec:testnet',
    address: '0x...'
  }
});
```
