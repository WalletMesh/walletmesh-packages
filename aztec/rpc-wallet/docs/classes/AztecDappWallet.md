[**@walletmesh/aztec-rpc-wallet v0.5.4**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecDappWallet

# Class: AztecDappWallet

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L85)

Aztec DApp Wallet that implements the aztec.js Wallet interface.
This class provides a client-side representation of an Aztec wallet,
interacting with a remote wallet implementation (typically an AccountWallet
managed by a JSONRPCNode created via `createAztecWalletNode`)
through the WalletMesh router system.

It requires an [AztecRouterProvider](AztecRouterProvider.md) instance to handle the
serialization and deserialization of Aztec-specific types (e.g., `AztecAddress`, `Fr`)
when communicating with the router.

An instance of this wallet should typically be created using the
[createAztecWallet](../functions/createAztecWallet.md) helper function, which also handles initialization.

## Example

```typescript
// Assuming 'provider' is an initialized AztecRouterProvider
const wallet = await createAztecWallet(provider, 'aztec:mainnet');
const address = wallet.getAddress(); // Synchronous access after initialization
const txHash = await wallet.sendTx(someTx);
```

## Implements

- `Wallet`

## Constructors

### Constructor

> **new AztecDappWallet**(`routerProvider`, `chainId`): `AztecDappWallet`

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L101)

Creates an instance of AztecDappWallet.
Note: Prefer using the [createAztecWallet](../functions/createAztecWallet.md) helper function for creating
and initializing wallet instances.

#### Parameters

##### routerProvider

[`AztecRouterProvider`](AztecRouterProvider.md)

The AztecRouterProvider instance used for communication.

##### chainId

`` `aztec:${string}` ``

The Aztec chain ID this wallet is associated with.

#### Returns

`AztecDappWallet`

## Methods

### createAuthWit()

#### Call Signature

> **createAuthWit**(`messageHash`): `Promise`\<`AuthWitness`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:438](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L438)

Creates an authorization witness for a given message hash or intent by making an RPC call to the remote wallet.
Implements Wallet.createAuthWit.

##### Parameters

###### messageHash

`Fr` | `Buffer`\<`ArrayBufferLike`\>

##### Returns

`Promise`\<`AuthWitness`\>

A promise that resolves to the AuthWitness.

##### See

[AztecWalletMethodMap.aztec\_createAuthWit](../interfaces/AztecWalletMethodMap.md#aztec_createauthwit)

##### Implementation of

`Wallet.createAuthWit`

#### Call Signature

> **createAuthWit**(`intent`): `Promise`\<`AuthWitness`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:439](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L439)

Creates an authorization witness for a given message hash or intent by making an RPC call to the remote wallet.
Implements Wallet.createAuthWit.

##### Parameters

###### intent

The message hash (Fr or Buffer) or intent object (IntentInnerHash or IntentAction) to authorize.

`IntentAction` | `IntentInnerHash`

##### Returns

`Promise`\<`AuthWitness`\>

A promise that resolves to the AuthWitness.

##### See

[AztecWalletMethodMap.aztec\_createAuthWit](../interfaces/AztecWalletMethodMap.md#aztec_createauthwit)

##### Implementation of

`Wallet.createAuthWit`

***

### createTxExecutionRequest()

> **createTxExecutionRequest**(`exec`, `fee`, `options`): `Promise`\<`TxExecutionRequest`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:416](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L416)

Creates a transaction execution request using the wallet's entrypoint.
Implements Wallet.createTxExecutionRequest.

#### Parameters

##### exec

`ExecutionPayload`

The execution payload.

##### fee

`FeeOptions`

Fee payment options.

##### options

`TxExecutionOptions`

Transaction execution options.

#### Returns

`Promise`\<`TxExecutionRequest`\>

A promise that resolves to the TxExecutionRequest.

#### Throws

If the wallet or its entrypoint is not initialized.

#### Implementation of

`Wallet.createTxExecutionRequest`

***

### deployContract()

> **deployContract**(`artifact`, `args`, `constructorName?`): `Promise`\<`DeploySentTx`\<`Contract`\>\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:816](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L816)

Deploys a contract using its artifact and constructor arguments.
This WalletMesh-specific helper method makes an RPC call to the `aztec_wmDeployContract`
method on the remote wallet. The remote wallet handles the deployment process.

#### Parameters

##### artifact

`ContractArtifact`

The ContractArtifact of the contract to deploy.

##### args

`unknown`[]

An array of arguments for the contract's constructor.

##### constructorName?

`string`

Optional name of the constructor function if the artifact has multiple.

#### Returns

`Promise`\<`DeploySentTx`\<`Contract`\>\>

A DeploySentTx object that can be used to track the deployment transaction
         and get the deployed contract instance.

#### See

[AztecWalletMethodMap.aztec\_wmDeployContract](../interfaces/AztecWalletMethodMap.md#aztec_wmdeploycontract)

***

### getAddress()

> **getAddress**(): `AztecAddress`

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:171](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L171)

Gets the primary Aztec address for this wallet.
This value is cached during initialization.
Implements Wallet.getAddress.

#### Returns

`AztecAddress`

The wallet's AztecAddress.

#### Throws

If the wallet is not initialized.

#### Implementation of

`Wallet.getAddress`

***

### getAddressAsync()

> **getAddressAsync**(): `Promise`\<`AztecAddress`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:185](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L185)

Asynchronously fetches the primary Aztec address from the remote wallet via an RPC call.
This method directly queries the connected wallet node.

#### Returns

`Promise`\<`AztecAddress`\>

A promise that resolves to the wallet's AztecAddress.

#### See

[AztecWalletMethodMap.aztec\_getAddress](../interfaces/AztecWalletMethodMap.md#aztec_getaddress)

***

### getBlock()

> **getBlock**(`number`): `Promise`\<`undefined` \| `L2Block`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:373](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L373)

Retrieves a specific L2 block by its number via an RPC call.
Implements Wallet.getBlock.

#### Parameters

##### number

`number`

The block number to retrieve.

#### Returns

`Promise`\<`undefined` \| `L2Block`\>

A promise that resolves to the L2Block or `undefined` if not found.

#### See

[AztecWalletMethodMap.aztec\_getBlock](../interfaces/AztecWalletMethodMap.md#aztec_getblock)

***

### getBlockNumber()

> **getBlockNumber**(): `Promise`\<`number`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:387](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L387)

Retrieves the current L2 block number via an RPC call.
Implements Wallet.getBlockNumber.

#### Returns

`Promise`\<`number`\>

A promise that resolves to the current block number.

#### See

[AztecWalletMethodMap.aztec\_getBlockNumber](../interfaces/AztecWalletMethodMap.md#aztec_getblocknumber)

***

### getChainId()

> **getChainId**(): `Fr`

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:112](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L112)

Gets the chain ID for this wallet.
This value is cached during initialization.

#### Returns

`Fr`

The chain ID as an Fr.

#### Throws

If the wallet is not initialized (e.g., if not created via `createAztecWallet`).

#### Implementation of

`Wallet.getChainId`

***

### getChainIdAsync()

> **getChainIdAsync**(): `Promise`\<`Fr`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L128)

Asynchronously fetches the chain ID from the remote wallet via an RPC call.
This method directly queries the connected wallet node.

#### Returns

`Promise`\<`Fr`\>

A promise that resolves to the chain ID as an Fr.

#### See

[AztecWalletMethodMap.aztec\_getChainId](../interfaces/AztecWalletMethodMap.md#aztec_getchainid)

***

### getCompleteAddress()

> **getCompleteAddress**(): `CompleteAddress`

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:199](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L199)

Gets the complete address (including public keys) for this wallet.
This value is cached during initialization.
Implements Wallet.getCompleteAddress.

#### Returns

`CompleteAddress`

The wallet's CompleteAddress.

#### Throws

If the wallet is not initialized.

#### Implementation of

`Wallet.getCompleteAddress`

***

### getCompleteAddressAsync()

> **getCompleteAddressAsync**(): `Promise`\<`CompleteAddress`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:213](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L213)

Asynchronously fetches the complete address (including public keys) from the remote wallet via an RPC call.
This method directly queries the connected wallet node.

#### Returns

`Promise`\<`CompleteAddress`\>

A promise that resolves to the wallet's CompleteAddress.

#### See

[AztecWalletMethodMap.aztec\_getCompleteAddress](../interfaces/AztecWalletMethodMap.md#aztec_getcompleteaddress)

***

### getContractClassMetadata()

> **getContractClassMetadata**(`id`, `includeArtifact?`): `Promise`\<`ContractClassMetadata`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:702](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L702)

Retrieves metadata for a contract class by making an RPC call to the remote wallet.
Implements Wallet.getContractClassMetadata.

#### Parameters

##### id

`Fr`

The Fr ID of the contract class.

##### includeArtifact?

`boolean`

Optional flag to include the ContractArtifact in the metadata.

#### Returns

`Promise`\<`ContractClassMetadata`\>

A promise that resolves to the ContractClassMetadata.

#### See

[AztecWalletMethodMap.aztec\_getContractClassMetadata](../interfaces/AztecWalletMethodMap.md#aztec_getcontractclassmetadata)

#### Implementation of

`Wallet.getContractClassMetadata`

***

### getContractMetadata()

> **getContractMetadata**(`address`): `Promise`\<`ContractMetadata`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:686](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L686)

Retrieves metadata for a specific contract by making an RPC call to the remote wallet.
Implements Wallet.getContractMetadata.

#### Parameters

##### address

`AztecAddress`

The AztecAddress of the contract.

#### Returns

`Promise`\<`ContractMetadata`\>

A promise that resolves to the ContractMetadata.

#### See

[AztecWalletMethodMap.aztec\_getContractMetadata](../interfaces/AztecWalletMethodMap.md#aztec_getcontractmetadata)

#### Implementation of

`Wallet.getContractMetadata`

***

### getContracts()

> **getContracts**(): `Promise`\<`AztecAddress`[]\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:735](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L735)

Retrieves a list of all contracts registered with the remote wallet via an RPC call.
Implements Wallet.getContracts.

#### Returns

`Promise`\<`AztecAddress`[]\>

A promise that resolves to an array of AztecAddress objects for the contracts.

#### See

[AztecWalletMethodMap.aztec\_getContracts](../interfaces/AztecWalletMethodMap.md#aztec_getcontracts)

***

### getCurrentBaseFees()

> **getCurrentBaseFees**(): `Promise`\<`GasFees`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:400](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L400)

Retrieves the current base gas fees on the network via an RPC call.
Implements Wallet.getCurrentBaseFees.

#### Returns

`Promise`\<`GasFees`\>

A promise that resolves to the GasFees.

#### See

[AztecWalletMethodMap.aztec\_getCurrentBaseFees](../interfaces/AztecWalletMethodMap.md#aztec_getcurrentbasefees)

#### Implementation of

`Wallet.getCurrentBaseFees`

***

### getNodeInfo()

> **getNodeInfo**(): `Promise`\<`NodeInfo`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:346](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L346)

Retrieves information about the connected Aztec node via an RPC call.
Implements Wallet.getNodeInfo.

#### Returns

`Promise`\<`NodeInfo`\>

A promise that resolves to the NodeInfo.

#### See

[AztecWalletMethodMap.aztec\_getNodeInfo](../interfaces/AztecWalletMethodMap.md#aztec_getnodeinfo)

#### Implementation of

`Wallet.getNodeInfo`

***

### getPrivateEvents()

> **getPrivateEvents**\<`T`\>(`contractAddress`, `eventMetadata`, `from`, `numBlocks`, `recipients`): `Promise`\<`T`[]\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:643](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L643)

Retrieves private events (encrypted logs) by making an RPC call to the remote wallet.
Implements Wallet.getPrivateEvents.

#### Type Parameters

##### T

`T`

The expected type of the decoded event data.

#### Parameters

##### contractAddress

`AztecAddress`

The AztecAddress of the contract emitting the events.

##### eventMetadata

`EventMetadataDefinition`

EventMetadataDefinition of the event to query.

##### from

`number`

Starting block number (inclusive).

##### numBlocks

`number`

Number of blocks to query from the `from` block.

##### recipients

`AztecAddress`[]

Array of AztecAddress recipients for the events.

#### Returns

`Promise`\<`T`[]\>

A promise that resolves to an array of decoded event data of type `T`.

#### See

[AztecWalletMethodMap.aztec\_getPrivateEvents](../interfaces/AztecWalletMethodMap.md#aztec_getprivateevents)

#### Implementation of

`Wallet.getPrivateEvents`

***

### getPublicEvents()

> **getPublicEvents**\<`T`\>(`eventMetadata`, `from`, `limit`): `Promise`\<`T`[]\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:667](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L667)

Retrieves public events (unencrypted logs) by making an RPC call to the remote wallet.
Implements Wallet.getPublicEvents.

#### Type Parameters

##### T

`T`

The expected type of the decoded event data.

#### Parameters

##### eventMetadata

`EventMetadataDefinition`

EventMetadataDefinition of the event to query.

##### from

`number`

Starting block number (inclusive).

##### limit

`number`

Maximum number of events to return.

#### Returns

`Promise`\<`T`[]\>

A promise that resolves to an array of decoded event data of type `T`.

#### See

[AztecWalletMethodMap.aztec\_getPublicEvents](../interfaces/AztecWalletMethodMap.md#aztec_getpublicevents)

#### Implementation of

`Wallet.getPublicEvents`

***

### getPXEInfo()

> **getPXEInfo**(): `Promise`\<`PXEInfo`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:359](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L359)

Retrieves information about the PXE service via an RPC call.
Implements Wallet.getPXEInfo.

#### Returns

`Promise`\<`PXEInfo`\>

A promise that resolves to the PXEInfo.

#### See

[AztecWalletMethodMap.aztec\_getPXEInfo](../interfaces/AztecWalletMethodMap.md#aztec_getpxeinfo)

#### Implementation of

`Wallet.getPXEInfo`

***

### getSenders()

> **getSenders**(): `Promise`\<`AztecAddress`[]\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:282](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L282)

Retrieves the list of registered senders for this account by making an RPC call to the remote wallet.
Implements Wallet.getSenders.

#### Returns

`Promise`\<`AztecAddress`[]\>

A promise that resolves to an array of AztecAddress objects.

#### See

[AztecWalletMethodMap.aztec\_getSenders](../interfaces/AztecWalletMethodMap.md#aztec_getsenders)

#### Implementation of

`Wallet.getSenders`

***

### getTxReceipt()

> **getTxReceipt**(`txHash`): `Promise`\<`TxReceipt`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:506](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L506)

Retrieves the receipt for a given transaction hash via an RPC call to the remote wallet.
Implements Wallet.getTxReceipt.

#### Parameters

##### txHash

`TxHash`

The TxHash of the transaction.

#### Returns

`Promise`\<`TxReceipt`\>

A promise that resolves to the TxReceipt.

#### See

[AztecWalletMethodMap.aztec\_getTxReceipt](../interfaces/AztecWalletMethodMap.md#aztec_gettxreceipt)

#### Implementation of

`Wallet.getTxReceipt`

***

### getVersion()

> **getVersion**(): `Fr`

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:141](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L141)

Gets the version of the wallet (typically PXE version).
This value is cached during initialization.

#### Returns

`Fr`

The wallet version as an Fr.

#### Throws

If the wallet is not initialized.

#### Implementation of

`Wallet.getVersion`

***

### getVersionAsync()

> **getVersionAsync**(): `Promise`\<`Fr`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:157](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L157)

Asynchronously fetches the wallet version (typically the PXE version) from the remote wallet via an RPC call.
This method directly queries the connected wallet node.

#### Returns

`Promise`\<`Fr`\>

A promise that resolves to the wallet version as an Fr.

#### See

[AztecWalletMethodMap.aztec\_getVersion](../interfaces/AztecWalletMethodMap.md#aztec_getversion)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:238](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L238)

**`Internal`**

Initializes the wallet instance by fetching and caching necessary values.
This method is called by [createAztecWallet](../functions/createAztecWallet.md).

#### Returns

`Promise`\<`void`\>

***

### profileTx()

> **profileTx**(`txRequest`, `profileMode`, `skipProofGeneration?`, `msgSender?`): `Promise`\<`TxProfileResult`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:567](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L567)

Profiles a transaction for performance analysis by making an RPC call to the remote wallet.
Implements Wallet.profileTx.

#### Parameters

##### txRequest

`TxExecutionRequest`

The TxExecutionRequest to profile.

##### profileMode

The mode for profiling: 'gates', 'execution-steps', or 'full'.

`"gates"` | `"execution-steps"` | `"full"`

##### skipProofGeneration?

`boolean`

Optional flag to skip proof generation during profiling.

##### msgSender?

`AztecAddress`

Optional AztecAddress of the message sender for profiling context.

#### Returns

`Promise`\<`TxProfileResult`\>

A promise that resolves to the TxProfileResult.

#### See

[AztecWalletMethodMap.aztec\_profileTx](../interfaces/AztecWalletMethodMap.md#aztec_profiletx)

#### Implementation of

`Wallet.profileTx`

***

### proveTx()

> **proveTx**(`txRequest`, `privateExecutionResult?`): `Promise`\<`TxProvingResult`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:456](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L456)

Proves a transaction execution request by making an RPC call to the remote wallet.
Implements Wallet.proveTx.

#### Parameters

##### txRequest

`TxExecutionRequest`

The TxExecutionRequest to prove.

##### privateExecutionResult?

`PrivateExecutionResult`

Optional PrivateExecutionResult from a private execution phase.

#### Returns

`Promise`\<`TxProvingResult`\>

A promise that resolves to the TxProvingResult.

#### See

[AztecWalletMethodMap.aztec\_proveTx](../interfaces/AztecWalletMethodMap.md#aztec_provetx)

#### Implementation of

`Wallet.proveTx`

***

### registerContract()

> **registerContract**(`contract`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:310](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L310)

Registers a deployed contract instance with the remote wallet via an RPC call.
Implements Wallet.registerContract.

#### Parameters

##### contract

An object containing the contract's ContractInstanceWithAddress and optionally its ContractArtifact.

###### artifact?

`ContractArtifact`

###### instance

`ContractInstanceWithAddress`

#### Returns

`Promise`\<`void`\>

A promise that resolves when the contract is registered by the remote wallet.

#### See

[AztecWalletMethodMap.aztec\_registerContract](../interfaces/AztecWalletMethodMap.md#aztec_registercontract)

#### Implementation of

`Wallet.registerContract`

***

### registerContractClass()

> **registerContractClass**(`artifact`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:333](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L333)

Registers a contract class (artifact/bytecode) with the remote wallet via an RPC call.
Implements Wallet.registerContractClass.

#### Parameters

##### artifact

`ContractArtifact`

The ContractArtifact to register.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the class is registered by the remote wallet.

#### See

[AztecWalletMethodMap.aztec\_registerContractClass](../interfaces/AztecWalletMethodMap.md#aztec_registercontractclass)

#### Implementation of

`Wallet.registerContractClass`

***

### registerSender()

> **registerSender**(`address`): `Promise`\<`AztecAddress`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:268](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L268)

Registers an authorized sender for this account by making an RPC call to the remote wallet.
Implements Wallet.registerSender.

#### Parameters

##### address

`AztecAddress`

The AztecAddress of the sender to register.

#### Returns

`Promise`\<`AztecAddress`\>

A promise that resolves to the registered sender's AztecAddress.

#### See

[AztecWalletMethodMap.aztec\_registerSender](../interfaces/AztecWalletMethodMap.md#aztec_registersender)

#### Implementation of

`Wallet.registerSender`

***

### removeSender()

> **removeSender**(`sender`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:296](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L296)

Removes an authorized sender from this account by making an RPC call to the remote wallet.
Implements Wallet.removeSender.

#### Parameters

##### sender

`AztecAddress`

The AztecAddress of the sender to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the sender is removed by the remote wallet.

#### See

[AztecWalletMethodMap.aztec\_removeSender](../interfaces/AztecWalletMethodMap.md#aztec_removesender)

#### Implementation of

`Wallet.removeSender`

***

### sendTx()

> **sendTx**(`tx`): `Promise`\<`TxHash`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:491](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L491)

Sends a proven transaction to the network via an RPC call to the remote wallet.
Implements Wallet.sendTx.

#### Parameters

##### tx

`Tx`

The proven Tx to send.

#### Returns

`Promise`\<`TxHash`\>

A promise that resolves to the TxHash.

#### See

[AztecWalletMethodMap.aztec\_sendTx](../interfaces/AztecWalletMethodMap.md#aztec_sendtx)

#### Implementation of

`Wallet.sendTx`

***

### simulateTx()

> **simulateTx**(`txRequest`, `simulatePublic`, `skipTxValidation?`, `skipFeeEnforcement?`, `overrides?`, `scopes?`): `Promise`\<`TxSimulationResult`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:526](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L526)

Simulates a transaction by making an RPC call to the remote wallet.
Implements Wallet.simulateTx.

#### Parameters

##### txRequest

`TxExecutionRequest`

The TxExecutionRequest to simulate.

##### simulatePublic

`boolean`

Whether to simulate public parts of the transaction.

##### skipTxValidation?

`boolean`

Optional flag to skip transaction validation during simulation.

##### skipFeeEnforcement?

`boolean`

Optional flag to skip fee enforcement during simulation.

##### overrides?

`SimulationOverrides`

Optional SimulationOverrides for simulation context (includes msgSender).

##### scopes?

`AztecAddress`[]

Optional array of AztecAddress scopes for the simulation.

#### Returns

`Promise`\<`TxSimulationResult`\>

A promise that resolves to the TxSimulationResult.

#### See

[AztecWalletMethodMap.aztec\_simulateTx](../interfaces/AztecWalletMethodMap.md#aztec_simulatetx)

#### Implementation of

`Wallet.simulateTx`

***

### simulateUtility()

> **simulateUtility**(`functionName`, `args`, `to`, `authWits?`, `from?`): `Promise`\<`UtilitySimulationResult`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:603](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L603)

Simulates a utility function call (view function) by making an RPC call to the remote wallet.
Implements Wallet.simulateUtility.

#### Parameters

##### functionName

`string`

The name of the utility function to call.

##### args

`unknown`[]

Arguments for the function call.

##### to

`AztecAddress`

The AztecAddress of the contract or account to call.

##### authWits?

`AuthWitness`[]

Optional array of AuthWitness for authorization.

##### from?

`AztecAddress`

Optional AztecAddress of the sender.

#### Returns

`Promise`\<`UtilitySimulationResult`\>

A promise that resolves to the UtilitySimulationResult.

#### See

[AztecWalletMethodMap.aztec\_simulateUtility](../interfaces/AztecWalletMethodMap.md#aztec_simulateutility)

#### Implementation of

`Wallet.simulateUtility`

***

### updateContract()

> **updateContract**(`_contractAddress`, `artifact`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:722](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L722)

Updates a contract's artifact by re-registering its class with the remote wallet via an RPC call.
Implements Wallet.updateContract.

#### Parameters

##### \_contractAddress

`AztecAddress`

The AztecAddress of the contract to update (often unused if primarily updating the class).

##### artifact

`ContractArtifact`

The new ContractArtifact.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the update is complete on the remote wallet.

#### See

[AztecWalletMethodMap.aztec\_registerContractClass](../interfaces/AztecWalletMethodMap.md#aztec_registercontractclass) (as this is what it typically calls)

#### Implementation of

`Wallet.updateContract`

***

### wmExecuteTx()

> **wmExecuteTx**(`interaction`): `Promise`\<`SentTx`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:753](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L753)

Executes a transaction based on a ContractFunctionInteraction.
This WalletMesh-specific helper method simplifies sending a transaction by deriving
the necessary ExecutionPayload from the interaction and making an RPC call
to the `aztec_wmExecuteTx` method on the remote wallet.
The remote wallet is expected to handle fee configuration, proof generation, and submission.

#### Parameters

##### interaction

`ContractFunctionInteraction`

The ContractFunctionInteraction representing the desired contract call.

#### Returns

`Promise`\<`SentTx`\>

A SentTx object that can be used to track the transaction.

#### See

[AztecWalletMethodMap.aztec\_wmExecuteTx](../interfaces/AztecWalletMethodMap.md#aztec_wmexecutetx)

***

### wmSimulateTx()

> **wmSimulateTx**(`interaction`): `Promise`\<`TxSimulationResult`\>

Defined in: [aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts:786](https://github.com/WalletMesh/walletmesh-packages/blob/441c37c9745b2e99f43add247d17e8d0e84a0495/aztec/rpc-wallet/src/client/aztec-dapp-wallet.ts#L786)

Simulates a transaction based on a ContractFunctionInteraction.
This WalletMesh-specific helper method simplifies simulating a transaction by deriving
the necessary ExecutionPayload from the interaction and making an RPC call
to the `aztec_wmSimulateTx` method on the remote wallet.

#### Parameters

##### interaction

`ContractFunctionInteraction`

The ContractFunctionInteraction representing the desired contract call.

#### Returns

`Promise`\<`TxSimulationResult`\>

A promise that resolves to the TxSimulationResult.

#### Remarks

TODO(twt): This should return a more useful result, not the raw TxSimulationResult.
  Copying the logic from `aztec.js/src/contract/contract_function_interaction.ts`
  could work if we can get the Function ABI or maybe have `aztec_wmSimulateTx` return hints
  about how to interpret the result.

#### See

[AztecWalletMethodMap.aztec\_wmSimulateTx](../interfaces/AztecWalletMethodMap.md#aztec_wmsimulatetx)
