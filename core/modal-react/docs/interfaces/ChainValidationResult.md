[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainValidationResult

# Interface: ChainValidationResult

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:127](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L127)

Chain validation result (from useEnsureChain)

## Properties

### currentChain

> **currentChain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L131)

The current chain

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:135](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L135)

Error if chain validation or switching failed

***

### isCorrectChain

> **isCorrectChain**: `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:129](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L129)

Whether the current chain matches the required chain

***

### isSwitching

> **isSwitching**: `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:137](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L137)

Whether a chain switch is currently in progress

***

### requiredChain

> **requiredChain**: `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:133](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L133)

The required chain

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
