[**@walletmesh/aztec-rpc-wallet v0.5.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletSerializer

# Variable: AztecWalletSerializer

> `const` **AztecWalletSerializer**: [`JSONRPCSerializer`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md)\<`JSONRPCParams`, `unknown`\>

Defined in: [aztec/rpc-wallet/src/wallet/serializers.ts:263](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/rpc-wallet/src/wallet/serializers.ts#L263)

A comprehensive [JSONRPCSerializer](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md) for all Aztec wallet methods.

This serializer handles both parameters and results:

**Parameters (`params`):**
 - `serialize`: Currently uses a fallback mechanism (`createFallbackSerializer`) which
   stringifies parameters using `jsonStringify`. This assumes the client-side
   (e.g., [AztecDappWallet](../classes/AztecDappWallet.md) via [AztecRouterProvider](../classes/AztecRouterProvider.md)) sends parameters
   already in a format that can be processed by the `deserialize` logic after
   basic JSON parsing.
 - `deserialize`: Contains detailed, method-specific logic to parse the JSON string
   of incoming parameters and reconstruct them into their correct Aztec types
   (e.g., `AztecAddress.fromString`, `TxExecutionRequest.schema.parse`). It uses
   Zod schemas and helper functions (`ensureParam`, `getOptionalParam`) for
   validation and type conversion.

**Results (`result`):**
 - `serialize`: For each method, it attempts to use a specific serializer defined in
   `RESULT_SERIALIZERS`. These typically use `jsonStringify` with a Zod schema
   for the specific result type (e.g., `AztecAddress.schema`, `TxHash.schema`).
   If no specific serializer is found, it uses `createFallbackSerializer`.
 - `deserialize`: Similar to result serialization, it uses `RESULT_SERIALIZERS`
   to find a method-specific deserializer, often employing `jsonParseWithSchema`
   with the appropriate Zod schema. If no specific deserializer exists, it may
   return the raw data or attempt a simple JSON parse.

This serializer is crucial for ensuring that complex Aztec objects maintain their
type integrity and structure when transmitted over JSON-RPC.

## See

 - [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md) for the definitions of methods, params, and results.
 - [JSONRPCSerializer](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md) for the interface it implements.
