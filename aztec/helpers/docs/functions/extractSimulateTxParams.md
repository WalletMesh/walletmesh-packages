[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractSimulateTxParams

# Function: extractSimulateTxParams()

> **extractSimulateTxParams**(`methodParams`): `undefined` \| [`SimulateTxParams`](../interfaces/SimulateTxParams.md)

Defined in: [middlewares/routerLevelExtractors.ts:209](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/routerLevelExtractors.ts#L209)

Extracts parameters for aztec_wmSimulateTx from router-level object format.

At the router level, params are: `{ executionPayload: {...} }`
After serialization, they become: `[executionPayload]`

## Parameters

### methodParams

`unknown`

The params array from the JSON-RPC request (call.params)

## Returns

`undefined` \| [`SimulateTxParams`](../interfaces/SimulateTxParams.md)

Extracted simulate tx parameters, or undefined if invalid

## Example

```typescript
const params = extractSimulateTxParams(callParams.call.params);
if (params?.executionPayload) {
  // Prepare simulation data
}
```
