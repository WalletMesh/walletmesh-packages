[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMethodMap

# Interface: WalletMethodMap

Method map defining wallet JSON-RPC methods for type-safe communication

## Indexable

\[`method`: `string`\]: `object`

## Properties

### aztec\_addAuthWitness

> **aztec\_addAuthWitness**: `object`

#### params

> **params**: \[[`AuthWitness`](AuthWitness.md)\]

#### result

> **result**: `undefined`

***

### aztec\_getAddress

> **aztec\_getAddress**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`

***

### aztec\_getChainId

> **aztec\_getChainId**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`

***

### aztec\_getNodeInfo

> **aztec\_getNodeInfo**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: [`NodeInfo`](NodeInfo.md)

***

### aztec\_sendTransaction

> **aztec\_sendTransaction**: `object`

#### params

> **params**: \[[`AztecTransaction`](AztecTransaction.md)\]

#### result

> **result**: `string`

***

### aztec\_signMessage

> **aztec\_signMessage**: `object`

#### params

> **params**: \[`string`\]

#### result

> **result**: `string`

***

### eth\_accounts

> **eth\_accounts**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`[]

***

### eth\_chainId

> **eth\_chainId**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`

***

### eth\_getBalance

> **eth\_getBalance**: `object`

#### params

> **params**: \[`string`, `string`\]

#### result

> **result**: `string`

***

### eth\_requestAccounts

> **eth\_requestAccounts**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`[]

***

### eth\_sendTransaction

> **eth\_sendTransaction**: `object`

#### params

> **params**: \[[`EvmTransaction`](EvmTransaction.md)\]

#### result

> **result**: `string`

***

### eth\_signMessage

> **eth\_signMessage**: `object`

#### params

> **params**: \[`string`, `string`\]

#### result

> **result**: `string`

***

### solana\_connect

> **solana\_connect**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `object`

##### result.publicKey

> **publicKey**: `string`

***

### solana\_disconnect

> **solana\_disconnect**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `undefined`

***

### solana\_getAccounts

> **solana\_getAccounts**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`[]

***

### solana\_signMessage

> **solana\_signMessage**: `object`

#### params

> **params**: \[`string`\]

#### result

> **result**: `string`

***

### solana\_signTransaction

> **solana\_signTransaction**: `object`

#### params

> **params**: \[[`SolanaTransaction`](SolanaTransaction.md)\]

#### result

> **result**: `string`

***

### wallet\_getAccounts

> **wallet\_getAccounts**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: `string`[]

***

### wallet\_getChainInfo

> **wallet\_getChainInfo**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: [`BasicChainInfo`](BasicChainInfo.md)

***

### wallet\_getState

> **wallet\_getState**: `object`

#### params

> **params**: `undefined`

#### result

> **result**: [`WalletProviderState`](WalletProviderState.md)

***

### wallet\_switchChain

> **wallet\_switchChain**: `object`

#### params

> **params**: \[\{ `chainId`: `string`; \}\]

#### result

> **result**: `null`

***

### wallet\_switchEthereumChain

> **wallet\_switchEthereumChain**: `object`

#### params

> **params**: \[\{ `chainId`: `string`; \}\]

#### result

> **result**: `null`
