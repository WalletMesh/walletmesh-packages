[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DAppMetadata

# Interface: DAppMetadata

Defined in: [core/modal-react/src/types.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L162)

dApp metadata for identification and display
Provides identity information that flows through the entire system

## Indexable

\[`key`: `string`\]: `unknown`

Additional metadata fields for future extensions

## Properties

### description?

> `optional` **description**: `string`

Defined in: [core/modal-react/src/types.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L168)

dApp description (can override appDescription)

***

### icon?

> `optional` **icon**: `string`

Defined in: [core/modal-react/src/types.ts:170](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L170)

dApp icon URL for wallet display

***

### name?

> `optional` **name**: `string`

Defined in: [core/modal-react/src/types.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L166)

dApp name (can override appName)

***

### origin?

> `optional` **origin**: `string`

Defined in: [core/modal-react/src/types.ts:164](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L164)

Explicit origin URL (auto-detected from window.location.origin if not provided)

***

### url?

> `optional` **url**: `string`

Defined in: [core/modal-react/src/types.ts:172](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L172)

dApp homepage URL
