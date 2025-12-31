[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletActionManager

# Class: WalletActionManager

Framework-agnostic wallet action manager

Provides utilities for common wallet operations like sending transactions,
signing messages, and estimating gas. Handles provider validation and
error management consistently across all framework packages.

## Constructors

### Constructor

> **new WalletActionManager**(`provider`, `currentAddress?`): `WalletActionManager`

#### Parameters

##### provider

`unknown`

##### currentAddress?

`string`

#### Returns

`WalletActionManager`

## Methods

### estimateGas()

> **estimateGas**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Estimate gas for a transaction

#### Parameters

##### params

[`TransactionParams`](../interfaces/TransactionParams.md)

Transaction parameters

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Gas estimate in hex format

#### Throws

Error if provider doesn't support gas estimation or estimation fails

***

### getBalance()

> **getBalance**(`address?`, `blockTag?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get the balance of an address

#### Parameters

##### address?

`string`

Address to get balance for (defaults to current address)

##### blockTag?

`string` = `'latest'`

Block tag (defaults to 'latest')

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Balance in hex format (wei)

#### Throws

Error if provider doesn't support balance retrieval

***

### getBlockNumber()

> **getBlockNumber**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get the current block number

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Block number in hex format

#### Throws

Error if provider doesn't support block number retrieval

***

### getCurrentAddress()

> **getCurrentAddress**(): `undefined` \| `string`

Get the current address

#### Returns

`undefined` \| `string`

Current address or undefined

***

### getGasPrice()

> **getGasPrice**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get the current gas price

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Gas price in hex format

#### Throws

Error if provider doesn't support gas price retrieval

***

### sendTransaction()

> **sendTransaction**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Send a blockchain transaction

#### Parameters

##### params

[`TransactionParams`](../interfaces/TransactionParams.md)

Transaction parameters

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Transaction hash

#### Throws

Error if provider doesn't support transactions or transaction fails

***

### setCurrentAddress()

> **setCurrentAddress**(`address`): `void`

Update the current address

#### Parameters

##### address

`string`

New current address

#### Returns

`void`

***

### signMessage()

> **signMessage**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign a message using the connected wallet

#### Parameters

##### params

[`SignMessageParams`](../interfaces/SignMessageParams.md)

Message signing parameters

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Message signature

#### Throws

Error if provider doesn't support signing or signing fails

***

### signTypedData()

> **signTypedData**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign typed data using EIP-712 standard

#### Parameters

##### params

[`TypedDataParams`](../interfaces/TypedDataParams.md)

Typed data parameters

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Typed data signature

#### Throws

Error if provider doesn't support typed data signing or signing fails

***

### supportsMethod()

> **supportsMethod**(`method`): `boolean`

Check if provider supports a specific method

#### Parameters

##### method

`string`

Method name to check

#### Returns

`boolean`

True if method is likely supported
