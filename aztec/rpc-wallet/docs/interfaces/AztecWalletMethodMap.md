[**@walletmesh/aztec-rpc-wallet v0.3.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletMethodMap

# Interface: AztecWalletMethodMap

Defined in: [aztec/rpc-wallet/src/types.ts:161](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L161)

Type for Aztec wallet RPC method map.
This extends the AztecWalletBaseMethodMap with the methods used in by Aztec's `AccountWallet`

## Extends

- [`AztecWalletBaseMethodMap`](AztecWalletBaseMethodMap.md)

## Indexable

\[`method`: `string`\]: `object`

## Properties

### aztec\_addAuthWitness

> **aztec\_addAuthWitness**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L196)

#### params

> **params**: `object`

##### params.authWitness

> **authWitness**: `AuthWitness`

#### result

> **result**: `boolean`

***

### aztec\_addCapsule

> **aztec\_addCapsule**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:184](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L184)

#### params

> **params**: `object`

##### params.capsule

> **capsule**: `Fr`[]

#### result

> **result**: `boolean`

***

### aztec\_addNote

> **aztec\_addNote**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L270)

#### params

> **params**: `object`

##### params.note

> **note**: `ExtendedNote`

#### result

> **result**: `boolean`

***

### aztec\_addNullifiedNote

> **aztec\_addNullifiedNote**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:271](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L271)

#### params

> **params**: `object`

##### params.note

> **note**: `ExtendedNote`

#### result

> **result**: `boolean`

***

### aztec\_connect

> **aztec\_connect**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L88)

Connects to the Aztec network.

#### result

> **result**: `boolean`

#### Returns

A boolean indicating if the connection was successful

#### Inherited from

[`AztecWalletBaseMethodMap`](AztecWalletBaseMethodMap.md).[`aztec_connect`](AztecWalletBaseMethodMap.md#aztec_connect)

***

### aztec\_createAuthWit

> **aztec\_createAuthWit**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:198](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L198)

#### params

> **params**: `object`

##### params.intent

> **intent**: `Fr` \| `Buffer` \| `IntentAction` \| `IntentInnerHash`

#### result

> **result**: `AuthWitness`

***

### aztec\_createTxExecutionRequest

> **aztec\_createTxExecutionRequest**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L244)

#### params

> **params**: `object`

##### params.exec

> **exec**: `ExecutionRequestInit`

#### result

> **result**: `TxExecutionRequest`

***

### aztec\_getAccount

> **aztec\_getAccount**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L94)

Gets the account address from the wallet.

#### result

> **result**: `string`

#### Returns

The account address as a string

#### Inherited from

[`AztecWalletBaseMethodMap`](AztecWalletBaseMethodMap.md).[`aztec_getAccount`](AztecWalletBaseMethodMap.md#aztec_getaccount)

***

### aztec\_getAddress

> **aztec\_getAddress**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L187)

#### result

> **result**: `AztecAddress`

***

### aztec\_getAuthWitness

> **aztec\_getAuthWitness**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:197](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L197)

#### params

> **params**: `object`

##### params.messageHash

> **messageHash**: `Fr`

#### result

> **result**: `Fr`[]

***

### aztec\_getBlock

> **aztec\_getBlock**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L163)

#### params

> **params**: `object`

##### params.number

> **number**: `number`

#### result

> **result**: `L2Block`

***

### aztec\_getBlockNumber

> **aztec\_getBlockNumber**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:164](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L164)

#### result

> **result**: `number`

***

### aztec\_getChainId

> **aztec\_getChainId**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:165](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L165)

#### result

> **result**: `number`

***

### aztec\_getCompleteAddress

> **aztec\_getCompleteAddress**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:188](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L188)

#### result

> **result**: `CompleteAddress`

***

### aztec\_getContractClassLogs

> **aztec\_getContractClassLogs**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:275](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L275)

#### params

> **params**: `object`

##### params.filter

> **filter**: `LogFilter`

#### result

> **result**: `GetContractClassLogsResponse`

***

### aztec\_getContractClassMetadata

> **aztec\_getContractClassMetadata**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:218](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L218)

#### params

> **params**: `object`

##### params.id

> **id**: `Fr`

##### params.includeArtifact?

> `optional` **includeArtifact**: `boolean`

#### result

> **result**: `ContractClassMetadata`

***

### aztec\_getContractMetadata

> **aztec\_getContractMetadata**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L217)

#### params

> **params**: `object`

##### params.address

> **address**: `AztecAddress`

#### result

> **result**: `ContractMetadata`

***

### aztec\_getContracts

> **aztec\_getContracts**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:216](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L216)

#### result

> **result**: `AztecAddress`[]

***

### aztec\_getCurrentBaseFees

> **aztec\_getCurrentBaseFees**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:170](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L170)

#### result

> **result**: `GasFees`

***

### aztec\_getL1ToL2MembershipWitness

> **aztec\_getL1ToL2MembershipWitness**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:178](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L178)

#### params

> **params**: `object`

##### params.contractAddress

> **contractAddress**: `AztecAddress`

##### params.messageHash

> **messageHash**: `Fr`

##### params.secret

> **secret**: `Fr`

#### result

> **result**: \[`bigint`, `SiblingPath`\<`39`\>\]

***

### aztec\_getNodeInfo

> **aztec\_getNodeInfo**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L167)

#### result

> **result**: `NodeInfo`

***

### aztec\_getNotes

> **aztec\_getNotes**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:269](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L269)

#### params

> **params**: `object`

##### params.filter

> **filter**: `NotesFilter`

#### result

> **result**: `UniqueNote`[]

***

### aztec\_getPrivateEvents

> **aztec\_getPrivateEvents**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:276](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L276)

#### params

> **params**: `object`

##### params.event

> **event**: `EventMetadataDefinition`

##### params.from

> **from**: `number`

##### params.limit

> **limit**: `number`

##### params.vpks?

> `optional` **vpks**: `Point`[]

#### result

> **result**: `unknown`[]

***

### aztec\_getProvenBlockNumber

> **aztec\_getProvenBlockNumber**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L168)

#### result

> **result**: `number`

***

### aztec\_getPublicEvents

> **aztec\_getPublicEvents**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:280](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L280)

#### params

> **params**: `object`

##### params.event

> **event**: `EventMetadataDefinition`

##### params.from

> **from**: `number`

##### params.limit

> **limit**: `number`

#### result

> **result**: `unknown`[]

***

### aztec\_getPublicLogs

> **aztec\_getPublicLogs**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:274](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L274)

#### params

> **params**: `object`

##### params.filter

> **filter**: `LogFilter`

#### result

> **result**: `GetPublicLogsResponse`

***

### aztec\_getPublicStorageAt

> **aztec\_getPublicStorageAt**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:240](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L240)

#### params

> **params**: `object`

##### params.contract

> **contract**: `AztecAddress`

##### params.storageSlot

> **storageSlot**: `Fr`

#### result

> **result**: `any`

***

### aztec\_getPXEInfo

> **aztec\_getPXEInfo**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L169)

#### result

> **result**: `PXEInfo`

***

### aztec\_getRegisteredAccounts

> **aztec\_getRegisteredAccounts**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:193](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L193)

#### result

> **result**: `CompleteAddress`[]

***

### aztec\_getScopes

> **aztec\_getScopes**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L174)

#### result

> **result**: `AztecAddress`[]

***

### aztec\_getSenders

> **aztec\_getSenders**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:211](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L211)

#### result

> **result**: `AztecAddress`[]

***

### aztec\_getTxEffect

> **aztec\_getTxEffect**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:249](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L249)

#### params

> **params**: `object`

##### params.txHash

> **txHash**: `TxHash`

#### result

> **result**: `InBlock`\<`TxEffect`\>

***

### aztec\_getTxReceipt

> **aztec\_getTxReceipt**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:250](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L250)

#### params

> **params**: `object`

##### params.txHash

> **txHash**: `TxHash`

#### result

> **result**: `TxReceipt`

***

### aztec\_getVersion

> **aztec\_getVersion**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L166)

#### result

> **result**: `number`

***

### aztec\_isL1ToL2MessageSynced

> **aztec\_isL1ToL2MessageSynced**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L177)

#### params

> **params**: `object`

##### params.l1ToL2Message

> **l1ToL2Message**: `Fr`

#### result

> **result**: `boolean`

***

### aztec\_proveTx

> **aztec\_proveTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:245](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L245)

#### params

> **params**: `object`

##### params.privateExecutionResult

> **privateExecutionResult**: `PrivateExecutionResult`

##### params.txRequest

> **txRequest**: `TxExecutionRequest`

#### result

> **result**: `TxProvingResult`

***

### aztec\_registerAccount

> **aztec\_registerAccount**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:189](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L189)

#### params

> **params**: `object`

##### params.partialAddress

> **partialAddress**: `Fr`

##### params.secretKey

> **secretKey**: `Fr`

#### result

> **result**: `CompleteAddress`

***

### aztec\_registerContract

> **aztec\_registerContract**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:228](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L228)

Registers a contract instance in the user's PXE.

#### params

> **params**: `object`

##### params.artifact?

> `optional` **artifact**: `ContractArtifact`

##### params.instance

> **instance**: `ContractInstanceWithAddress`

#### result

> **result**: `boolean`

#### Param

The contract details to register

#### Returns

True if registration was successful

***

### aztec\_registerContractClass

> **aztec\_registerContractClass**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:238](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L238)

Registers a contract class in the user's PXE.

#### params

> **params**: `object`

##### params.artifact

> **artifact**: `ContractArtifact`

#### result

> **result**: `boolean`

#### Param

The contract artifact to register

#### Returns

True if registration was successful

***

### aztec\_registerSender

> **aztec\_registerSender**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:210](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L210)

Registers a contact in the user's PXE

#### params

> **params**: `object`

##### params.sender

> **sender**: `AztecAddress`

#### result

> **result**: `AztecAddress`

#### Param

The sender (contact) address to register

#### Returns

True if registration was successful

***

### aztec\_removeSender

> **aztec\_removeSender**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:212](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L212)

#### params

> **params**: `object`

##### params.sender

> **sender**: `AztecAddress`

#### result

> **result**: `boolean`

***

### aztec\_sendTransaction

> **aztec\_sendTransaction**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L101)

Sends transactions to the Aztec network.

#### params

> **params**: [`TransactionParams`](../type-aliases/TransactionParams.md)

#### result

> **result**: `string`

#### Param

The transactions to execute and optional authorization witnesses

#### Returns

The transaction hash as a string

#### Inherited from

[`AztecWalletBaseMethodMap`](AztecWalletBaseMethodMap.md).[`aztec_sendTransaction`](AztecWalletBaseMethodMap.md#aztec_sendtransaction)

***

### aztec\_sendTx

> **aztec\_sendTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:243](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L243)

#### params

> **params**: `object`

##### params.tx

> **tx**: `Tx`

#### result

> **result**: `TxHash`

***

### aztec\_setScopes

> **aztec\_setScopes**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:173](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L173)

#### params

> **params**: `object`

##### params.scopes

> **scopes**: `AztecAddress`[]

#### result

> **result**: `boolean`

***

### aztec\_simulateTransaction

> **aztec\_simulateTransaction**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:111](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L111)

Simulates a transaction without executing it.

#### params

> **params**: [`TransactionFunctionCall`](../type-aliases/TransactionFunctionCall.md)

#### result

> **result**: `unknown`

#### Param

The transaction to simulate

#### Returns

The simulation result

#### Inherited from

[`AztecWalletBaseMethodMap`](AztecWalletBaseMethodMap.md).[`aztec_simulateTransaction`](AztecWalletBaseMethodMap.md#aztec_simulatetransaction)

***

### aztec\_simulateTx

> **aztec\_simulateTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:252](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L252)

#### params

> **params**: `object`

##### params.enforceFeePayment?

> `optional` **enforceFeePayment**: `boolean`

##### params.msgSender?

> `optional` **msgSender**: `AztecAddress`

##### params.profile?

> `optional` **profile**: `boolean`

##### params.simulatePublic

> **simulatePublic**: `boolean`

##### params.skipTxValidation?

> `optional` **skipTxValidation**: `boolean`

##### params.txRequest

> **txRequest**: `TxExecutionRequest`

#### result

> **result**: `TxSimulationResult`

***

### aztec\_simulateUnconstrained

> **aztec\_simulateUnconstrained**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:263](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L263)

#### params

> **params**: `object`

##### params.args

> **args**: `unknown`[]

##### params.from?

> `optional` **from**: `AztecAddress`

##### params.functionName

> **functionName**: `string`

##### params.to

> **to**: `AztecAddress`

#### result

> **result**: `AbiDecoded`

***

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L120)

Returns the list of supported methods for the wallet.

#### result

> **result**: `string`[]

#### Returns

An array of supported methods

#### Inherited from

[`AztecWalletBaseMethodMap`](AztecWalletBaseMethodMap.md).[`wm_getSupportedMethods`](AztecWalletBaseMethodMap.md#wm_getsupportedmethods)
