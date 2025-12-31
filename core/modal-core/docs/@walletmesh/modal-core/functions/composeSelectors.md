[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / composeSelectors

# Function: composeSelectors()

> **composeSelectors**\<`T`\>(...`selectors`): [`StateSelector`](../type-aliases/StateSelector.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends StateSelector\<R\> ? R : never \}\>

Helper to compose multiple selectors

## Type Parameters

### T

`T` *extends* readonly [`StateSelector`](../type-aliases/StateSelector.md)\<`unknown`\>[]

## Parameters

### selectors

...`T`

Array of selectors to compose

## Returns

[`StateSelector`](../type-aliases/StateSelector.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends StateSelector\<R\> ? R : never \}\>

A composed selector that returns an array of results
