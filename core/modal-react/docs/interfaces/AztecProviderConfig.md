[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecProviderConfig

# Interface: AztecProviderConfig

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:21](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L21)

Configuration options specific to Aztec dApps

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:25](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L25)

Optional application description

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:29](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L29)

Application icon URL

***

### appMetadata?

> `optional` **appMetadata**: `object`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:31](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L31)

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

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:23](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L23)

Application name displayed to users

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:27](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L27)

Application URL (defaults to current origin)

***

### chains?

> `optional` **chains**: `object`[]

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:46](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L46)

Aztec chains to support (defaults to aztecSandbox for development)

#### chainId

> **chainId**: `string`

#### label?

> `optional` **label**: `string`

#### required?

> `optional` **required**: `boolean`

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:48](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L48)

Whether to enable debug mode (defaults to true in development)

***

### discoveryTimeout?

> `optional` **discoveryTimeout**: `number`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:50](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L50)

Discovery timeout in milliseconds (defaults to 5000)

***

### permissions?

> `optional` **permissions**: `string`[]

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:56](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L56)

Required permissions for the dApp

***

### walletFilter()?

> `optional` **walletFilter**: (`wallet`) => `boolean`

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:54](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L54)

Custom wallet filter function

#### Parameters

##### wallet

[`WalletInfo`](WalletInfo.md)

#### Returns

`boolean`

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:52](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L52)

Custom wallets to include (e.g., test wallets)
