[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractFunctionArgNamesForBatch

# Function: extractFunctionArgNamesForBatch()

> **extractFunctionArgNamesForBatch**(`pxe`, `executionPayloads`): `Promise`\<[`FunctionArgNames`](../type-aliases/FunctionArgNames.md)\>

Defined in: [middlewares/functionArgNamesMiddleware.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/functionArgNamesMiddleware.ts#L24)

Extracts function argument names for an array of execution payloads (batch execute).
This is a helper function that can be used in router-level middleware.

## Parameters

### pxe

`PXE`

The PXE instance to query contract ABIs

### executionPayloads

`ExecutionPayload`[]

Array of execution payloads containing calls

## Returns

`Promise`\<[`FunctionArgNames`](../type-aliases/FunctionArgNames.md)\>

Function argument names organized by contract address and function name
