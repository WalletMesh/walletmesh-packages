[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchOrchestrationOptions

# Interface: ChainSwitchOrchestrationOptions

Options for orchestrating chain switches with user interaction

## Example

```ts
const options: ChainSwitchOrchestrationOptions = {
  onConfirm: async (data) => {
    return confirm(`Switch from ${data.currentChain?.name} to ${data.targetChain.name}?`);
  },
  onSuccess: (data) => {
    console.log(`Switched to ${data.newChain.name} in ${data.duration}ms`);
  },
  timeout: 30000
};
```

## Properties

### onConfirm()?

> `optional` **onConfirm**: (`data`) => `boolean` \| [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Callback before confirming switch

#### Parameters

##### data

[`ChainSwitchConfirmData`](ChainSwitchConfirmData.md)

#### Returns

`boolean` \| [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

***

### onSuccess()?

> `optional` **onSuccess**: (`data`) => `void`

Callback on successful switch

#### Parameters

##### data

[`ChainSwitchSuccessData`](ChainSwitchSuccessData.md)

#### Returns

`void`

***

### timeout?

> `optional` **timeout**: `number`

Timeout for switch operation
