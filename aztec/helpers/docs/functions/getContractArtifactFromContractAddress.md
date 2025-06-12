[**@walletmesh/aztec-helpers v0.4.0**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getContractArtifactFromContractAddress

# Function: getContractArtifactFromContractAddress()

> **getContractArtifactFromContractAddress**(`pxe`, `contractAddress`): `Promise`\<`ContractArtifact`\>

Defined in: [helpers.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/aztec/helpers/src/helpers.ts#L21)

Retrieves the contract artifact for a given contract address.
Fetches from the PXE service and caches the result.

## Parameters

### pxe

`PXE`

An initialized PXE client instance.

### contractAddress

`string`

The Aztec address of the contract as a string.

## Returns

`Promise`\<`ContractArtifact`\>

A promise that resolves to the ContractArtifact.

## Throws

If the contract or its artifact is not registered in the PXE.
