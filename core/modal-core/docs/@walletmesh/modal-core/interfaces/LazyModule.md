[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / LazyModule

# Interface: LazyModule\<T\>

Result of creating a lazy module

## Type Parameters

### T

`T` = `unknown`

## Properties

### getModule()

> **getModule**: () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Get the loaded module (triggers import on first call)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### wrap()

> **wrap**: \<`F`\>(`functionName`) => `F`

Create a lazy wrapper for a specific function from the module

#### Type Parameters

##### F

`F`

#### Parameters

##### functionName

`string`

#### Returns

`F`

***

### wrapAll()

> **wrapAll**: \<`M`\>(`functionNames`) => `M`

Create lazy wrappers for multiple functions

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, (...`args`) => `unknown`\>

#### Parameters

##### functionNames

keyof `M`[]

#### Returns

`M`
