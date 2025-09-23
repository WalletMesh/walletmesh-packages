[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshConfig

# Interface: WalletMeshConfig

Configuration options for initializing a WalletMesh client.

## Example

```typescript
const config: WalletMeshConfig = {
  appName: 'My DApp',
  appDescription: 'A decentralized application',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png',
  projectId: 'your-walletconnect-project-id',
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' }
  ],
  wallets: {
    order: ['metamask', 'walletconnect'],
    exclude: ['phantom']
  }
};
```

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Optional description of your application.
Provides context to users when connecting wallets.

***

### appIcon?

> `optional` **appIcon**: `string`

Icon URL for your application.
Should be a square image (recommended 256x256 or larger).

***

### appMetadata?

> `optional` **appMetadata**: `object`

Extended dApp metadata for identification and display.
Provides comprehensive identity information that flows through the entire system.

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

The name of your application.
This is displayed in wallet connection prompts.

***

### appUrl?

> `optional` **appUrl**: `string`

URL of your application.
Used by wallets for verification and display.

***

### chains?

> `optional` **chains**: `object`[]

Supported blockchain networks.
Defines which chains your app supports using SupportedChain objects.

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

***

### debug?

> `optional` **debug**: `boolean`

Enable debug mode for additional logging.

#### Default

```ts
false
```

***

### handleRehydration?

> `optional` **handleRehydration**: `boolean`

Whether the client should handle session rehydration automatically.
Set to false if your framework (e.g., React) handles this separately.

#### Default

```ts
true
```

***

### projectId?

> `optional` **projectId**: `string`

WalletConnect project ID.
Required for WalletConnect integration.
Get one at https://cloud.walletconnect.com

***

### supportedInterfaces?

> `optional` **supportedInterfaces**: `object`

Supported interfaces per technology for discovery.
Allows specifying which provider interfaces to use for each blockchain technology.

#### aztec?

> `optional` **aztec**: `string`[]

Aztec interfaces (e.g., ['aztec-wallet-api-v1', 'aztec-connect-v2'])

#### evm?

> `optional` **evm**: `string`[]

EVM interfaces (e.g., ['eip-1193', 'eip-6963'])

#### solana?

> `optional` **solana**: `string`[]

Solana interfaces (e.g., ['solana-standard-wallet'])

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[] \| [`WalletConfig`](WalletConfig.md)

Wallet preferences and filtering options.
Controls which wallets are displayed and in what order.
Can also be an array of WalletInfo objects for direct wallet specification.
