[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecProviderConfig

# Interface: AztecProviderConfig

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:21](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L21)

Configuration options specific to Aztec dApps

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:25](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L25)

Optional application description

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:29](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L29)

Application icon URL

***

### appMetadata?

> `optional` **appMetadata**: `object`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:31](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L31)

Extended dApp metadata for identification and display

#### Index Signature

\[`key`: `string`\]: `unknown`

Additional metadata fields for future extensions

#### description?

> `optional` **description**: `string`

dApp description (can override appDescription)

#### icon?

> `optional` **icon**: `string`

dApp icon URL for wallet display

#### name?

> `optional` **name**: `string`

dApp name (can override appName)

#### origin?

> `optional` **origin**: `string`

Explicit origin URL (auto-detected from window.location.origin if not provided)

#### url?

> `optional` **url**: `string`

dApp homepage URL

***

### appName

> **appName**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:23](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L23)

Application name displayed to users

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:27](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L27)

Application URL (defaults to current origin)

***

### chains?

> `optional` **chains**: `object`[]

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:74](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L74)

Aztec chains to support (defaults to aztecSandbox for development)

Configure which Aztec networks your dApp can connect to. The user will be
prompted to switch chains if they're on an unsupported network.

#### chainId

> **chainId**: `string`

Aztec chain identifier (e.g., 'aztec:1' for mainnet, 'aztec:31337' for sandbox)

#### label?

> `optional` **label**: `string`

Human-readable name for this chain

#### required?

> `optional` **required**: `boolean`

Whether this chain is required for the dApp to function

#### Default

```ts
[{ chainId: 'aztec:31337', label: 'Aztec Sandbox' }]
```

#### Example

```ts
// Development setup (single sandbox)
chains: [
  { chainId: 'aztec:31337', label: 'Aztec Sandbox' }
]

// Production setup (mainnet required, testnet optional)
chains: [
  { chainId: 'aztec:1', required: true, label: 'Aztec Mainnet' },
  { chainId: 'aztec:17000', required: false, label: 'Aztec Testnet' }
]

// Multi-environment setup
chains: [
  { chainId: 'aztec:1', label: 'Aztec Mainnet' },
  { chainId: 'aztec:17000', label: 'Aztec Testnet' },
  { chainId: 'aztec:31337', label: 'Local Sandbox' }
]
```

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:83](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L83)

Whether to enable debug mode (defaults to true in development)

***

### discovery?

> `optional` **discovery**: `object`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:131](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L131)

Optional overrides for wallet discovery behaviour.

Use this to disable automatic discovery or tweak retry timing.
When omitted, sensible Aztec defaults are applied.

#### capabilities?

> `optional` **capabilities**: `object`

Capability requirements for wallet matching

##### capabilities.features?

> `optional` **features**: `string`[]

##### capabilities.technologies?

> `optional` **technologies**: `object`[]

#### dappInfo?

> `optional` **dappInfo**: `object`

dApp information for wallet discovery

##### dappInfo.description?

> `optional` **description**: `string`

##### dappInfo.icon?

> `optional` **icon**: `string`

##### dappInfo.name

> **name**: `string`

##### dappInfo.url?

> `optional` **url**: `string`

#### enabled?

> `optional` **enabled**: `boolean`

Whether discovery is enabled

#### maxAttempts?

> `optional` **maxAttempts**: `number`

Maximum number of discovery attempts

#### retryInterval?

> `optional` **retryInterval**: `number`

Retry interval for periodic discovery

#### technologies?

> `optional` **technologies**: `object`[]

Technology requirements for discovery

#### timeout?

> `optional` **timeout**: `number`

Discovery timeout in milliseconds

***

### discoveryTimeout?

> `optional` **discoveryTimeout**: `number`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:85](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L85)

Discovery timeout in milliseconds (defaults to 5000)

***

### permissions?

> `optional` **permissions**: `string`[]

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:123](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L123)

Required permissions for the dApp

List of Aztec methods your dApp needs to call. Common permissions include:
- 'aztec_getAddress' - Get user's address
- 'aztec_getCompleteAddress' - Get complete address with public keys
- 'aztec_sendTx' - Send transactions
- 'aztec_simulateTx' - Simulate transactions
- 'aztec_getChainId' - Get chain information
- 'aztec_deployContract' - Deploy contracts

#### Example

```ts
// Basic permissions for most dApps
permissions: [
  'aztec_getAddress',
  'aztec_sendTx',
  'aztec_simulateTx',
  'aztec_getChainId'
]

// Extended permissions for contract deployment
permissions: [
  'aztec_getAddress',
  'aztec_getCompleteAddress',
  'aztec_sendTx',
  'aztec_simulateTx',
  'aztec_deployContract',
  'aztec_registerContract',
  'aztec_getContracts'
]
```

***

### walletFilter()?

> `optional` **walletFilter**: (`wallet`) => `boolean`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:89](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L89)

Custom wallet filter function

#### Parameters

##### wallet

[`WalletInfo`](WalletInfo.md)

#### Returns

`boolean`

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:87](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L87)

Custom wallets to include (e.g., test wallets)
