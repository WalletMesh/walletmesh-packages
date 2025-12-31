[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / NemiAccount

# Interface: NemiAccount

Account interface compatible with @nemi-fi/wallet-sdk/eip1193

This interface matches the Account type from nemi SDK, allowing
WalletMesh accounts to be used with nemi's Contract.fromAztec() pattern.

## Properties

### address

> `readonly` **address**: `AztecAddress`

Aztec address of the account

## Methods

### createAuthWit()

> **createAuthWit**(`messageHash`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`AuthWitness`\>

Create authorization witness for a message hash
Used for delegating actions to other accounts

#### Parameters

##### messageHash

Hash to authorize

`Buffer`\<`ArrayBufferLike`\> | `Fr`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`AuthWitness`\>

Promise resolving to AuthWitness

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Get the chain ID of the connected network

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Promise resolving to chain ID

***

### getCompleteAddress()

> **getCompleteAddress**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`CompleteAddress`\>

Get complete address with public keys

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`CompleteAddress`\>

Promise resolving to CompleteAddress

***

### getVersion()

> **getVersion**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Get the version of the Aztec protocol

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`Fr`\>

Promise resolving to version

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
