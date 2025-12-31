[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractBatchExecuteParams

# Function: extractBatchExecuteParams()

> **extractBatchExecuteParams**(`methodParams`): `undefined` \| [`BatchExecuteParams`](../interfaces/BatchExecuteParams.md)

Defined in: [middlewares/routerLevelExtractors.ts:126](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/routerLevelExtractors.ts#L126)

Extracts parameters for aztec_wmBatchExecute from router-level object format.

At the router level, params are: `{ executionPayloads: [...], sendOptions?: {} }`
After serialization, they become: `[executionPayloads, sendOptions]`

## Parameters

### methodParams

`unknown`

The params array from the JSON-RPC request (call.params)

## Returns

`undefined` \| [`BatchExecuteParams`](../interfaces/BatchExecuteParams.md)

Extracted batch execute parameters, or undefined if invalid

## Example

```typescript
const params = extractBatchExecuteParams(callParams.call.params);
if (params?.executionPayloads) {
  for (const payload of params.executionPayloads) {
    // Process each payload
  }
}
```
