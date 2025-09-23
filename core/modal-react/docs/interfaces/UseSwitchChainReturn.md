[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseSwitchChainReturn

# Interface: UseSwitchChainReturn

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:145](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L145)

Consolidated hook return type for chain management

## Properties

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L169)

Current chain

***

### chains

> **chains**: [`SwitchChainInfo`](SwitchChainInfo.md)[]

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:173](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L173)

Available chains

***

### chainType

> **chainType**: `null` \| [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:171](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L171)

Current chain type

***

### clearError()

> **clearError**: () => `void`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L183)

Clear validation error (alias for reset)

#### Returns

`void`

***

### ensureChain()

> **ensureChain**: (`requiredChain`, `options?`) => `Promise`\<[`ChainValidationResult`](ChainValidationResult.md)\>

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:152](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L152)

Ensure the user is on the correct chain (from useEnsureChain)

#### Parameters

##### requiredChain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### options?

[`ChainValidationOptions`](ChainValidationOptions.md)

#### Returns

`Promise`\<[`ChainValidationResult`](ChainValidationResult.md)\>

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:179](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L179)

Switch/validation error if any

***

### getChainMismatchMessage()

> **getChainMismatchMessage**: (`requiredChain`) => `string`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:165](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L165)

Get human-readable chain mismatch message

#### Parameters

##### requiredChain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

#### Returns

`string`

***

### isChainSupported()

> **isChainSupported**: (`chain`) => `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:161](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L161)

Check if a chain is supported

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

#### Returns

`boolean`

***

### isCorrectChain()

> **isCorrectChain**: (`requiredChain`) => `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L163)

Check if on the correct chain (convenience)

#### Parameters

##### requiredChain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

#### Returns

`boolean`

***

### isPending

> **isPending**: `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L177)

Whether the operation is pending

***

### isSwitching

> **isSwitching**: `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:175](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L175)

Whether currently switching

***

### lastError

> **lastError**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L187)

Last validation error (from ensureChain)

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:181](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L181)

Reset error state

#### Returns

`void`

***

### switchChain()

> **switchChain**: (`chain`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L148)

Switch to a different chain

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### options?

[`SwitchChainArgs`](SwitchChainArgs.md)

#### Returns

`Promise`\<`void`\>

***

### switchChainAsync()

> **switchChainAsync**: (`chain`, `options?`) => `Promise`\<[`SwitchChainResult`](SwitchChainResult.md)\>

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:150](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L150)

Async version that returns result

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### options?

[`SwitchChainArgs`](SwitchChainArgs.md)

#### Returns

`Promise`\<[`SwitchChainResult`](SwitchChainResult.md)\>

***

### validateChain()

> **validateChain**: (`requiredChain`) => [`ChainValidationResult`](ChainValidationResult.md)

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:159](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L159)

Validate if the current chain matches the required chain

#### Parameters

##### requiredChain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

#### Returns

[`ChainValidationResult`](ChainValidationResult.md)

***

### variables

> **variables**: `undefined` \| [`SwitchChainVariables`](SwitchChainVariables.md)

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:185](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L185)

Variables from current/last switch attempt
