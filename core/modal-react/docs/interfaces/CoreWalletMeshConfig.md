[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / CoreWalletMeshConfig

# Interface: CoreWalletMeshConfig

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:376

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

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:386

Optional description of your application.
Provides context to users when connecting wallets.

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:396

Icon URL for your application.
Should be a square image (recommended 256x256 or larger).

***

### appMetadata?

> `optional` **appMetadata**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:401

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

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:381

The name of your application.
This is displayed in wallet connection prompts.

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:391

URL of your application.
Used by wallets for verification and display.

***

### chains?

> `optional` **chains**: `object`[]

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:425

Supported blockchain networks.
Defines which chains your app supports using SupportedChain objects.

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### debug?

> `optional` **debug**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:436

Enable debug mode for additional logging.

#### Default

```ts
false
```

***

### handleRehydration?

> `optional` **handleRehydration**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:442

Whether the client should handle session rehydration automatically.
Set to false if your framework (e.g., React) handles this separately.

#### Default

```ts
true
```

***

### projectId?

> `optional` **projectId**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:420

WalletConnect project ID.
Required for WalletConnect integration.
Get one at https://cloud.walletconnect.com

***

### supportedInterfaces?

> `optional` **supportedInterfaces**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:447

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

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:431

Wallet preferences and filtering options.
Controls which wallets are displayed and in what order.
Can also be an array of WalletInfo objects for direct wallet specification.
