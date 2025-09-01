[**@walletmesh/aztec-helpers v0.5.0**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getContractArtifactFromContractAddress

# Function: getContractArtifactFromContractAddress()

> **getContractArtifactFromContractAddress**(`pxe`, `contractAddress`): `Promise`\<`ContractArtifact`\>

Defined in: [helpers.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/helpers/src/helpers.ts#L21)

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
