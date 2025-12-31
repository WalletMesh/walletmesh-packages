[**@walletmesh/aztec-rpc-wallet v0.5.7**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / ALL\_AZTEC\_METHODS

# Variable: ALL\_AZTEC\_METHODS

> `const` **ALL\_AZTEC\_METHODS**: readonly \[`"aztec_getAddress"`, `"aztec_getCompleteAddress"`, `"aztec_getChainId"`, `"aztec_getVersion"`, `"aztec_sendTx"`, `"aztec_getTxReceipt"`, `"aztec_simulateTx"`, `"aztec_getNodeInfo"`, `"aztec_getBlockNumber"`, `"aztec_getCurrentBaseFees"`, `"aztec_registerSender"`, `"aztec_getSenders"`, `"aztec_removeSender"`, `"aztec_registerContract"`, `"aztec_registerContractClass"`, `"aztec_getContractMetadata"`, `"aztec_getContractClassMetadata"`, `"aztec_proveTx"`, `"aztec_profileTx"`, `"aztec_simulateUtility"`, `"aztec_getPrivateEvents"`, `"aztec_getPublicEvents"`, `"aztec_getPXEInfo"`, `"aztec_getBlock"`, `"aztec_createAuthWit"`, `"aztec_wmDeployContract"`, `"aztec_wmExecuteTx"`, `"aztec_wmSimulateTx"`\]

Defined in: [aztec/rpc-wallet/src/client/helpers.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/rpc-wallet/src/client/helpers.ts#L17)

A comprehensive list of all JSON-RPC methods supported by the Aztec RPC wallet.
This array includes standard Aztec wallet methods as well as WalletMesh-specific extensions (prefixed with `wm_`).
It can be used when establishing a connection to request permissions for all available functionalities.

## See

 - [AztecWalletMethodMap](../interfaces/AztecWalletMethodMap.md) for detailed type information on each method.
 - [connectAztec](../functions/connectAztec.md) and connectAztecWithWallet which use this list by default.
