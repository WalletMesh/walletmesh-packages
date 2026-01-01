[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ContractFunctionInteraction

# Interface: ContractFunctionInteraction

Re-export core services

## Methods

### request()

> **request**(): `unknown`

Create the transaction request object

#### Returns

`unknown`

***

### send()

> **send**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `getTxHash?`: () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `toString`: `string`; \}\>; `txHash`: `string` \| \{ `toString`: `string`; \}; `wait`: [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>; \}\>

Send the transaction to the network

#### Parameters

##### options?

`AztecSendOptions`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `getTxHash?`: () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `toString`: `string`; \}\>; `txHash`: `string` \| \{ `toString`: `string`; \}; `wait`: [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>; \}\>

***

### simulate()

> **simulate**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Simulate the interaction to see what would happen

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>
