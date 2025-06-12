# @walletmesh/aztec-helpers

Helper utilities for working with Aztec contracts and PXE (Private Execution Environment) in the WalletMesh ecosystem.

## Overview

This package provides convenience functions for retrieving contract artifacts and function parameter information from the Aztec PXE. It is intended to simplify common integration tasks for dApps, wallets, and test environments working with Aztec smart contracts.

## Installation

```bash
pnpm add @walletmesh/aztec-helpers
```

## API

### `getContractArtifactFromContractAddress(pxe, contractAddress): Promise<ContractArtifact>`

Fetches and caches the contract artifact for a given Aztec contract address using the provided PXE instance.

- **Parameters:**
  - `pxe`: An initialized PXE client instance.
  - `contractAddress`: The Aztec address of the contract (string).
- **Returns:** Promise resolving to the contract's `ContractArtifact`.
- **Throws:** If the contract or its artifact is not registered in the PXE.

### `getFunctionArtifactFromContractAddress(pxe, contractAddress, functionNameOrSelector): Promise<FunctionArtifact>`

Retrieves the function artifact for a specific function within a contract.

- **Parameters:**
  - `pxe`: PXE client instance.
  - `contractAddress`: Aztec contract address (string).
  - `functionNameOrSelector`: Name of the function (string) or its `FunctionSelector`.
- **Returns:** Promise resolving to the function's `FunctionArtifact`.
- **Throws:** If the contract artifact or function artifact cannot be found.

### `getFunctionParameterInfoFromContractAddress(pxe, contractAddress, functionNameOrSelector): Promise<FunctionParameterInfo[]>`

Returns simplified parameter information (name and type) for a specific contract function.

- **Parameters:**
  - `pxe`: PXE client instance.
  - `contractAddress`: Aztec contract address (string).
  - `functionNameOrSelector`: Name of the function (string) or its `FunctionSelector`.
- **Returns:** Promise resolving to an array of `{ name: string, type: string }` objects.

## Example Usage

```typescript
import {
  getContractArtifactFromContractAddress,
  getFunctionArtifactFromContractAddress,
  getFunctionParameterInfoFromContractAddress
} from '@walletmesh/aztec-helpers';

// Example: Fetch contract artifact
const artifact = await getContractArtifactFromContractAddress(pxe, '0xabc...');

// Example: Fetch function artifact
const functionArtifact = await getFunctionArtifactFromContractAddress(pxe, '0xabc...', 'transfer');

// Example: Get function parameter info
const params = await getFunctionParameterInfoFromContractAddress(pxe, '0xabc...', 'transfer');
console.log(params); // [{ name: 'to', type: 'AztecAddress' }, { name: 'amount', type: 'field' }]
```

## Caching

- Contract artifacts are cached in-memory by contract address for the lifetime of the process.
- **Note:** The cache is not currently network-aware; if you use the same address on multiple networks, results may be incorrect.

## Error Handling

- Functions throw if the contract or function artifact is not found in the PXE.
- Errors are standard JavaScript `Error` objects with descriptive messages.
