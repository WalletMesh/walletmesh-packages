[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractExecuteTxParams

# Function: extractExecuteTxParams()

> **extractExecuteTxParams**(`methodParams`): `undefined` \| [`ExecuteTxParams`](../interfaces/ExecuteTxParams.md)

Defined in: [middlewares/routerLevelExtractors.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/routerLevelExtractors.ts#L167)

Extracts parameters for aztec_wmExecuteTx from router-level object format.

At the router level, params are: `{ executionPayload: {...}, sendOptions?: {} }`
After serialization, they become: `[executionPayload, sendOptions]`

## Parameters

### methodParams

`unknown`

The params array from the JSON-RPC request (call.params)

## Returns

`undefined` \| [`ExecuteTxParams`](../interfaces/ExecuteTxParams.md)

Extracted execute tx parameters, or undefined if invalid

## Example

```typescript
const params = extractExecuteTxParams(callParams.call.params);
if (params?.executionPayload?.calls) {
  for (const call of params.executionPayload.calls) {
    console.log(`Function: ${call.name}`);
  }
}
```
