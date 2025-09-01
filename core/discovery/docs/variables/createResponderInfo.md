[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createResponderInfo

# Variable: createResponderInfo

> `const` **createResponderInfo**: `object`

Defined in: [responder/factory.ts:432](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/factory.ts#L432)

Helper functions to create common responder information for different blockchain ecosystems.

Provides pre-configured responder information templates for popular blockchain networks
with appropriate defaults for chains, features, and interfaces. Simplifies responder
setup while ensuring compatibility with the discovery protocol.

## Type declaration

## Blockchain

#### aztec()

> **aztec**(`options`): [`ResponderInfo`](../type-aliases/ResponderInfo.md)

Create responder information for Aztec-compatible responders.

Pre-configured for Aztec private smart contract interactions with
aztec-wallet-api-v1 interface and privacy-focused features including
zero-knowledge proofs and private transactions.

##### Parameters

###### options

Responder configuration options

###### chains?

`string`[]

###### description?

`string`

###### features?

`string`[]

###### icon

`string`

###### name

`string`

###### rdns

`string`

###### type

[`ResponderType`](../type-aliases/ResponderType.md)

###### uuid

`string`

##### Returns

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

Complete ResponderInfo for Aztec responders

##### Examples

```typescript
const responderInfo = createResponderInfo.aztec({
  uuid: crypto.randomUUID(),
  rdns: 'com.aztec.responder',
  name: 'My Aztec Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension'
});
// → Supports aztec:mainnet with private transactions
```

```typescript
const responderInfo = createResponderInfo.aztec({
  uuid: crypto.randomUUID(),
  rdns: 'com.aztec.responder',
  name: 'Aztec Testnet Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension',
  chains: ['aztec:mainnet', 'aztec:testnet']
});
```

##### Since

0.1.0

#### ethereum()

> **ethereum**(`options`): [`ResponderInfo`](../type-aliases/ResponderInfo.md)

Create responder information for Ethereum-compatible responders.

Pre-configured for EVM-based blockchain interactions with EIP-1193
provider interface and standard Ethereum responder features. Supports
mainnet and common testnets.

##### Parameters

###### options

Responder configuration options

###### chains?

`string`[]

###### description?

`string`

###### features?

`string`[]

###### icon

`string`

###### name

`string`

###### rdns

`string`

###### type

[`ResponderType`](../type-aliases/ResponderType.md)

###### uuid

`string`

##### Returns

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

Complete ResponderInfo for Ethereum responders

##### Examples

```typescript
const responderInfo = createResponderInfo.ethereum({
  uuid: crypto.randomUUID(),
  rdns: 'com.mycompany.responder',
  name: 'My Ethereum Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension'
});
// → Supports eip155:1 with EIP-1193
```

```typescript
const responderInfo = createResponderInfo.ethereum({
  uuid: crypto.randomUUID(),
  rdns: 'com.mycompany.responder',
  name: 'Multi-Network Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension',
  chains: ['eip155:1', 'eip155:137', 'eip155:42161'],
  features: ['account-management', 'transaction-signing', 'message-signing']
});
```

##### Since

0.1.0

#### multiChain()

> **multiChain**(`options`): [`ResponderInfo`](../type-aliases/ResponderInfo.md)

Create responder information for multi-chain responders.

Flexible factory for responders that support multiple blockchain networks.
Requires explicit chain capability configuration while providing sensible
defaults for cross-chain features and interfaces.

##### Parameters

###### options

Multi-chain responder configuration

###### chains?

`string`[]

###### description?

`string`

###### features?

`string`[]

###### icon

`string`

###### name

`string`

###### rdns

`string`

###### type

[`ResponderType`](../type-aliases/ResponderType.md)

###### uuid

`string`

##### Returns

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

Complete ResponderInfo for multi-chain responders

##### Example

```typescript
const responderInfo = createResponderInfo.multiChain({
  uuid: crypto.randomUUID(),
  rdns: 'com.mycompany.multiresponder',
  name: 'Universal Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension',
  chains: [
    {
      chainId: 'eip155:1',
      chainType: 'evm',
      network: { name: 'Ethereum', chainId: 'eip155:1', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, testnet: false },
      standards: ['eip-1193'],
      rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
      transactionTypes: [],
      signatureSchemes: ['ecdsa-secp256k1'],
      features: []
    },
    {
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      chainType: 'account',
      network: { name: 'Solana', chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 }, testnet: false },
      standards: ['solana-wallet-standard'],
      rpcMethods: ['getAccounts', 'signTransaction'],
      transactionTypes: [],
      signatureSchemes: ['ed25519'],
      features: []
    }
  ],
  features: ['account-management', 'transaction-signing', 'cross-chain-swaps']
});
```

##### Since

0.1.0

#### solana()

> **solana**(`options`): [`ResponderInfo`](../type-aliases/ResponderInfo.md)

Create wallet information for Solana-compatible wallets.

Pre-configured for Solana account-based interactions with solana-wallet-standard
interface and Solana-specific transaction features. Supports mainnet
and devnet environments.

##### Parameters

###### options

Responder configuration options

###### chains?

`string`[]

###### description?

`string`

###### features?

`string`[]

###### icon

`string`

###### name

`string`

###### rdns

`string`

###### type

[`ResponderType`](../type-aliases/ResponderType.md)

###### uuid

`string`

##### Returns

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

Complete ResponderInfo for Solana responders

##### Examples

```typescript
const responderInfo = createResponderInfo.solana({
  uuid: crypto.randomUUID(),
  rdns: 'com.solana.wallet',
  name: 'My Solana Wallet',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension'
});
// → Supports solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp with solana-wallet-standard
```

```typescript
const responderInfo = createResponderInfo.solana({
  uuid: crypto.randomUUID(),
  rdns: 'com.solana.wallet',
  name: 'Solana Dev Wallet',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension',
  chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1']
});
```

##### Since

0.1.0

## Examples

```typescript
const responderInfo = createResponderInfo.ethereum({
  uuid: crypto.randomUUID(),
  rdns: 'com.mycompany.responder',
  name: 'My Ethereum Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension'
});
// Includes: eip155:1, EIP-1193, account-management, transaction-signing
```

```typescript
const responderInfo = createResponderInfo.multiChain({
  uuid: crypto.randomUUID(),
  rdns: 'com.mycompany.responder',
  name: 'Multi-Chain Responder',
  icon: 'data:image/svg+xml;base64,...',
  type: 'extension',
  chains: [
    // Custom chain configurations
    { chainId: 'eip155:1', chainType: 'evm' }, // evm config
    { chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', chainType: 'account' } // solana config
  ]
});
```

## Since

0.1.0

## See

[ResponderInfo](../type-aliases/ResponderInfo.md) for the structure
