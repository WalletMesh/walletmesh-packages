[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshConfig

# Interface: WalletMeshConfig

Defined in: [core/modal-react/src/types.ts:181](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L181)

Headless WalletMesh configuration
Pure business logic configuration without UI concerns

## Extends

- `Omit`\<[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md), `"chains"` \| `"wallets"`\>

## Extended by

- [`WalletMeshReactConfig`](WalletMeshReactConfig.md)

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:386

Optional description of your application.
Provides context to users when connecting wallets.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appDescription`](CoreWalletMeshConfig.md#appdescription)

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:396

Icon URL for your application.
Should be a square image (recommended 256x256 or larger).

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appIcon`](CoreWalletMeshConfig.md#appicon)

***

### appMetadata?

> `optional` **appMetadata**: [`DAppMetadata`](DAppMetadata.md)

Defined in: [core/modal-react/src/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L192)

dApp metadata for identification (auto-populated from appName/appDescription if not provided)

#### Overrides

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appMetadata`](CoreWalletMeshConfig.md#appmetadata)

***

### appName

> **appName**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:381

The name of your application.
This is displayed in wallet connection prompts.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appName`](CoreWalletMeshConfig.md#appname)

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:391

URL of your application.
Used by wallets for verification and display.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appUrl`](CoreWalletMeshConfig.md#appurl)

***

### chains

> **chains**: `object`[]

Defined in: [core/modal-react/src/types.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L183)

Explicitly supported chains (required - no automatic chain selection)

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

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`debug`](CoreWalletMeshConfig.md#debug)

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

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`handleRehydration`](CoreWalletMeshConfig.md#handlerehydration)

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: [core/modal-react/src/types.ts:189](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L189)

Maximum number of simultaneous wallet connections

***

### projectId?

> `optional` **projectId**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:420

WalletConnect project ID.
Required for WalletConnect integration.
Get one at https://cloud.walletconnect.com

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`projectId`](CoreWalletMeshConfig.md#projectid)

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

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`supportedInterfaces`](CoreWalletMeshConfig.md#supportedinterfaces)

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:186](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L186)

Wallet configurations - array of WalletInfo objects
