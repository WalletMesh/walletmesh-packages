[**@walletmesh/aztec-rpc-wallet v0.4.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletErrorMap

# Variable: AztecWalletErrorMap

> `const` `readonly` **AztecWalletErrorMap**: `Record`\<`AztecWalletErrorType`, \{ `code`: `number`; `message`: `string`; \}\>

Defined in: [aztec/rpc-wallet/src/errors.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/c22c9775e630bf48780e547c01c8f5442dc5b36c/aztec/rpc-wallet/src/errors.ts#L59)

A map associating each AztecWalletErrorType with a specific JSON-RPC error code
and a human-readable message. This map is used by the [AztecWalletError](../classes/AztecWalletError.md) class
to construct standardized error objects.

The error codes are chosen from the range typically reserved for server-defined errors
in JSON-RPC (e.g., -32000 to -32099).
