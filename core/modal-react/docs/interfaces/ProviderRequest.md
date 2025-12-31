[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ProviderRequest

# Interface: ProviderRequest\<TMethod, TParams\>

Defined in: core/modal-core/dist/internal/client/types.d.ts:14

Provider request parameters with generic constraints
 ProviderRequest

## Type Parameters

### TMethod

`TMethod` *extends* `string` = `string`

The method name type

### TParams

`TParams` = `unknown`[]

The parameters type

## Properties

### method

> **method**: `TMethod`

Defined in: core/modal-core/dist/internal/client/types.d.ts:19

The method name to call on the provider

***

### params?

> `optional` **params**: `TParams`

Defined in: core/modal-core/dist/internal/client/types.d.ts:24

Optional parameters for the method
