[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getFunctionArtifactFromContractAddress

# Function: getFunctionArtifactFromContractAddress()

> **getFunctionArtifactFromContractAddress**(`pxe`, `contractAddress`, `functionNameOrSelector`): `Promise`\<`FunctionArtifact`\>

Defined in: [helpers.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/helpers.ts#L110)

Retrieves the function artifact for a specific function within a contract.

## Parameters

### pxe

`PXE`

An initialized PXE client instance.

### contractAddress

`string`

The Aztec address of the contract as a string.

### functionNameOrSelector

The name of the function (string) or its FunctionSelector.

`string` | `FunctionSelector`

## Returns

`Promise`\<`FunctionArtifact`\>

A promise that resolves to the FunctionArtifact.

## Throws

If the contract artifact or the specific function artifact cannot be found.
