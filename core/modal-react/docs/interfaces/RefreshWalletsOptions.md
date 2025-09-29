[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / RefreshWalletsOptions

# Interface: RefreshWalletsOptions

Defined in: [core/modal-react/src/hooks/useConfig.ts:112](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L112)

Hook return type for configuration and modal control

## Properties

### capabilities?

> `optional` **capabilities**: `object`

Defined in: [core/modal-react/src/hooks/useConfig.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L116)

Additional capability requirements to merge with provider defaults

#### chains?

> `optional` **chains**: `string`[]

#### features?

> `optional` **features**: `string`[]

#### interfaces?

> `optional` **interfaces**: `string`[]

***

### targetChainType?

> `optional` **targetChainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useConfig.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L114)

Optional chain type focus for the upcoming discovery

***

### technologies?

> `optional` **technologies**: `object`[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:122](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L122)

Technology specific templates for discovery requests

#### features?

> `optional` **features**: `string`[]

#### interfaces?

> `optional` **interfaces**: `string`[]

#### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"` \| [`ChainType`](../enumerations/ChainType.md)
