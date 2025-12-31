[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseSwitchChainOptions

# Interface: UseSwitchChainOptions

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSwitchChain.ts#L97)

Hook options for chain switching

## Properties

### onConfirm()?

> `optional` **onConfirm**: (`data`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSwitchChain.ts#L99)

Callback fired before chain switch - return false to cancel

#### Parameters

##### data

###### fromChain

\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

###### fromChain.chainId

`string`

###### fromChain.chainType

[`ChainType`](../enumerations/ChainType.md)

###### fromChain.group?

`string`

###### fromChain.icon?

`string`

###### fromChain.interfaces?

`string`[]

###### fromChain.label?

`string`

###### fromChain.name

`string`

###### fromChain.required

`boolean`

###### toChain

\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

###### toChain.chainId

`string`

###### toChain.chainType

[`ChainType`](../enumerations/ChainType.md)

###### toChain.group?

`string`

###### toChain.icon?

`string`

###### toChain.interfaces?

`string`[]

###### toChain.label?

`string`

###### toChain.name

`string`

###### toChain.required

`boolean`

###### walletId

`string`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSwitchChain.ts#L107)

Callback fired on switch error

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSwitchChain.ts#L105)

Callback fired on successful switch

#### Parameters

##### data

###### fromChain

\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

###### fromChain.chainId

`string`

###### fromChain.chainType

[`ChainType`](../enumerations/ChainType.md)

###### fromChain.group?

`string`

###### fromChain.icon?

`string`

###### fromChain.interfaces?

`string`[]

###### fromChain.label?

`string`

###### fromChain.name

`string`

###### fromChain.required

`boolean`

###### toChain

\{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

###### toChain.chainId

`string`

###### toChain.chainType

[`ChainType`](../enumerations/ChainType.md)

###### toChain.group?

`string`

###### toChain.icon?

`string`

###### toChain.interfaces?

`string`[]

###### toChain.label?

`string`

###### toChain.name

`string`

###### toChain.required

`boolean`

###### walletId

`string`

#### Returns

`void`
