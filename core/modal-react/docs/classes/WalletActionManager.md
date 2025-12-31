[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletActionManager

# Class: WalletActionManager

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:73

Framework-agnostic wallet action manager

Provides utilities for common wallet operations like sending transactions,
signing messages, and estimating gas. Handles provider validation and
error management consistently across all framework packages.

## Constructors

### Constructor

> **new WalletActionManager**(`provider`, `currentAddress?`): `WalletActionManager`

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:76

#### Parameters

##### provider

`unknown`

##### currentAddress?

`string`

#### Returns

`WalletActionManager`

## Methods

### estimateGas()

> **estimateGas**(`params`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:104

Estimate gas for a transaction

#### Parameters

##### params

[`TransactionParams`](../interfaces/TransactionParams.md)

Transaction parameters

#### Returns

`Promise`\<`string`\>

Gas estimate in hex format

#### Throws

Error if provider doesn't support gas estimation or estimation fails

***

### getBalance()

> **getBalance**(`address?`, `blockTag?`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:124

Get the balance of an address

#### Parameters

##### address?

`string`

Address to get balance for (defaults to current address)

##### blockTag?

`string`

Block tag (defaults to 'latest')

#### Returns

`Promise`\<`string`\>

Balance in hex format (wei)

#### Throws

Error if provider doesn't support balance retrieval

***

### getBlockNumber()

> **getBlockNumber**(): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:116

Get the current block number

#### Returns

`Promise`\<`string`\>

Block number in hex format

#### Throws

Error if provider doesn't support block number retrieval

***

### getCurrentAddress()

> **getCurrentAddress**(): `undefined` \| `string`

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:134

Get the current address

#### Returns

`undefined` \| `string`

Current address or undefined

***

### getGasPrice()

> **getGasPrice**(): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:110

Get the current gas price

#### Returns

`Promise`\<`string`\>

Gas price in hex format

#### Throws

Error if provider doesn't support gas price retrieval

***

### sendTransaction()

> **sendTransaction**(`params`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:83

Send a blockchain transaction

#### Parameters

##### params

[`TransactionParams`](../interfaces/TransactionParams.md)

Transaction parameters

#### Returns

`Promise`\<`string`\>

Transaction hash

#### Throws

Error if provider doesn't support transactions or transaction fails

***

### setCurrentAddress()

> **setCurrentAddress**(`address`): `void`

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:129

Update the current address

#### Parameters

##### address

`string`

New current address

#### Returns

`void`

***

### signMessage()

> **signMessage**(`params`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:90

Sign a message using the connected wallet

#### Parameters

##### params

[`SignMessageParams`](../interfaces/SignMessageParams.md)

Message signing parameters

#### Returns

`Promise`\<`string`\>

Message signature

#### Throws

Error if provider doesn't support signing or signing fails

***

### signTypedData()

> **signTypedData**(`params`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:97

Sign typed data using EIP-712 standard

#### Parameters

##### params

[`TypedDataParams`](../interfaces/TypedDataParams.md)

Typed data parameters

#### Returns

`Promise`\<`string`\>

Typed data signature

#### Throws

Error if provider doesn't support typed data signing or signing fails

***

### supportsMethod()

> **supportsMethod**(`method`): `boolean`

Defined in: core/modal-core/dist/internal/utils/walletActions.d.ts:140

Check if provider supports a specific method

#### Parameters

##### method

`string`

Method name to check

#### Returns

`boolean`

True if method is likely supported
