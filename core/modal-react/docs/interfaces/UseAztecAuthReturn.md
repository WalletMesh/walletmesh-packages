[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecAuthReturn

# Interface: UseAztecAuthReturn

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L48)

Auth witness hook return type

## Properties

### clearStoredWitnesses()

> **clearStoredWitnesses**: (`storageKey?`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L65)

Clear stored auth witnesses

#### Parameters

##### storageKey?

`string`

#### Returns

`void`

***

### createAuthWit()

> **createAuthWit**: (`interaction`, `description?`) => `Promise`\<`AuthWitnessWithMetadata`\>

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L50)

Create auth witness for a single interaction

#### Parameters

##### interaction

`ContractFunctionInteraction`

##### description?

`string`

#### Returns

`Promise`\<`AuthWitnessWithMetadata`\>

***

### createBatchAuthWit()

> **createBatchAuthWit**: (`interactions`) => `Promise`\<`AuthWitnessWithMetadata`[]\>

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L55)

Create auth witnesses for multiple interactions

#### Parameters

##### interactions

`ContractFunctionInteraction`[]

#### Returns

`Promise`\<`AuthWitnessWithMetadata`[]\>

***

### createMessageAuthWit()

> **createMessageAuthWit**: (`message`, `description?`) => `Promise`\<`AuthWitnessWithMetadata`\>

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L57)

Create auth witness for a message

#### Parameters

##### message

`string`

##### description?

`string`

#### Returns

`Promise`\<`AuthWitnessWithMetadata`\>

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L73)

Any error that occurred

***

### getStoredWitnesses()

> **getStoredWitnesses**: (`storageKey`) => `undefined` \| `AuthWitnessWithMetadata`[]

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L63)

Retrieve stored auth witnesses

#### Parameters

##### storageKey

`string`

#### Returns

`undefined` \| `AuthWitnessWithMetadata`[]

***

### isCreating

> **isCreating**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L71)

Whether currently creating auth witnesses

***

### removeStoredEntry()

> **removeStoredEntry**: (`id`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L69)

Remove a specific stored entry

#### Parameters

##### id

`string`

#### Returns

`void`

***

### storedEntries

> **storedEntries**: [`AuthWitnessEntry`](AuthWitnessEntry.md)[]

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L67)

List of all stored auth witness entries

***

### storeWitnesses()

> **storeWitnesses**: (`witnesses`, `label?`) => `string`

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L61)

Store auth witnesses and get storage key

#### Parameters

##### witnesses

`AuthWitnessWithMetadata`[]

##### label?

`string`

#### Returns

`string`

***

### verifyAuthWit()

> **verifyAuthWit**: (`authWitness`, `expectedMessage?`) => `Promise`\<`boolean`\>

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecAuth.ts#L59)

Verify an auth witness

#### Parameters

##### authWitness

`unknown`

##### expectedMessage?

`unknown`

#### Returns

`Promise`\<`boolean`\>
