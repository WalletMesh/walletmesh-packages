[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractRouterLevelParams

# Function: extractRouterLevelParams()

> **extractRouterLevelParams**\<`M`\>(`method`, `methodParams`): `undefined` \| [`RouterMethodParamMap`](../interfaces/RouterMethodParamMap.md)\[`M`\]

Defined in: [middlewares/routerLevelExtractors.ts:300](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/routerLevelExtractors.ts#L300)

Generic extractor that dispatches to the appropriate method-specific extractor
based on the method name.

## Type Parameters

### M

`M` *extends* keyof [`RouterMethodParamMap`](../interfaces/RouterMethodParamMap.md)

## Parameters

### method

`M`

The Aztec WalletMesh method name

### methodParams

`unknown`

The params array from the JSON-RPC request

## Returns

`undefined` \| [`RouterMethodParamMap`](../interfaces/RouterMethodParamMap.md)\[`M`\]

Extracted parameters for the specified method, or undefined if invalid

## Example

```typescript
const method = callParams.call?.method;
if (method && isAztecWalletMeshMethod(method)) {
  const params = extractRouterLevelParams(method, callParams.call.params);
  // TypeScript knows the correct param type based on the method
}
```
