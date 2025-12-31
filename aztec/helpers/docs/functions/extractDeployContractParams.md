[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractDeployContractParams

# Function: extractDeployContractParams()

> **extractDeployContractParams**(`methodParams`): `undefined` \| [`DeployContractParams`](../interfaces/DeployContractParams.md)

Defined in: [middlewares/routerLevelExtractors.ts:251](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/routerLevelExtractors.ts#L251)

Extracts parameters for aztec_wmDeployContract from router-level object format.

At the router level, params are: `{ artifact: {...}, args: [...], constructorName?: string }`
After serialization, they become: `[{ artifact, args, constructorName }]`

## Parameters

### methodParams

`unknown`

The params array from the JSON-RPC request (call.params)

## Returns

`undefined` \| [`DeployContractParams`](../interfaces/DeployContractParams.md)

Extracted deploy contract parameters, or undefined if invalid

## Example

```typescript
const params = extractDeployContractParams(callParams.call.params);
if (params?.artifact && params?.args) {
  console.log(`Deploying contract with ${params.args.length} constructor args`);
}
```
