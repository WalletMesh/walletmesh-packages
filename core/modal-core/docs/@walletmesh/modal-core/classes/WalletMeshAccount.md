[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshAccount

# Class: WalletMeshAccount

WalletMesh implementation of nemi Account interface

This class implements the Account interface from @nemi-fi/wallet-sdk/eip1193,
allowing dApps using nemi SDK to connect wallets through WalletMesh.

Features:
- Implements complete nemi Account interface
- Caches expensive operations (CompleteAddress, ChainId, Version)
- Automatic cache invalidation on account/chain changes
- Works with any WalletMesh wallet adapter

## Implements

- [`NemiAccount`](../interfaces/NemiAccount.md)

## Properties

### address

> `readonly` **address**: `AztecAddress`

Aztec address of the account

#### Implementation of

[`NemiAccount`](../interfaces/NemiAccount.md).[`address`](../interfaces/NemiAccount.md#address)

## Methods

### createAuthWit()

> **createAuthWit**(`messageHash`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`AuthWitness`\>

Create authorization witness for a message hash

Used for delegating actions to other accounts.

#### Parameters

##### messageHash

Hash to authorize

`Buffer`\<`ArrayBufferLike`\> | `Fr`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`AuthWitness`\>

Promise resolving to AuthWitness

#### Implementation of

[`NemiAccount`](../interfaces/NemiAccount.md).[`createAuthWit`](../interfaces/NemiAccount.md#createauthwit)

***

### dispose()

> **dispose**(): `void`

Dispose of the account and clean up resources

Should be called when the account is no longer needed.

#### Returns

`void`

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Get the chain ID of the connected network

This operation is cached to avoid redundant requests.
Cache is invalidated on chain changes.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Promise resolving to chain ID

#### Implementation of

[`NemiAccount`](../interfaces/NemiAccount.md).[`getChainId`](../interfaces/NemiAccount.md#getchainid)

***

### getCompleteAddress()

> **getCompleteAddress**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`CompleteAddress`\>

Get complete address with public keys

This operation is cached to avoid redundant requests.
Cache is invalidated on account or chain changes.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`CompleteAddress`\>

Promise resolving to CompleteAddress

#### Implementation of

[`NemiAccount`](../interfaces/NemiAccount.md).[`getCompleteAddress`](../interfaces/NemiAccount.md#getcompleteaddress)

***

### getVersion()

> **getVersion**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Get the version of the Aztec protocol

This operation is cached to avoid redundant requests.
Cache is invalidated on chain changes.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Promise resolving to version

#### Implementation of

[`NemiAccount`](../interfaces/NemiAccount.md).[`getVersion`](../interfaces/NemiAccount.md#getversion)

***

### signMessage()

> **signMessage**(`message`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Buffer`\<`ArrayBufferLike`\>\>

Sign a message with the account's private key

#### Parameters

##### message

`Buffer`

Message to sign

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Buffer`\<`ArrayBufferLike`\>\>

Promise resolving to signature

#### Implementation of

[`NemiAccount`](../interfaces/NemiAccount.md).[`signMessage`](../interfaces/NemiAccount.md#signmessage)
