[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / PublicProviderInfo

# Interface: PublicProviderInfo

Defined in: [core/modal-react/src/hooks/usePublicProvider.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/usePublicProvider.ts#L20)

Public provider information with type safety

## Properties

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/usePublicProvider.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/usePublicProvider.ts#L26)

Chain this provider is for

***

### isAvailable

> **isAvailable**: `boolean`

Defined in: [core/modal-react/src/hooks/usePublicProvider.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/usePublicProvider.ts#L24)

Whether provider is available

***

### provider

> **provider**: `null` \| [`PublicProvider`](PublicProvider.md)

Defined in: [core/modal-react/src/hooks/usePublicProvider.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/usePublicProvider.ts#L22)

The public provider instance
