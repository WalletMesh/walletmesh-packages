[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / aztecTransactionStatusNotificationSchema

# Variable: aztecTransactionStatusNotificationSchema

> `const` **aztecTransactionStatusNotificationSchema**: `ZodObject`\<\{ `error`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\[`"idle"`, `"initiated"`, `"simulating"`, `"proving"`, `"sending"`, `"pending"`, `"confirming"`, `"confirmed"`, `"failed"`\]\>; `timestamp`: `ZodNumber`; `txHash`: `ZodOptional`\<`ZodString`\>; `txStatusId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `error?`: `string`; `status`: `"confirmed"` \| `"proving"` \| `"idle"` \| `"initiated"` \| `"simulating"` \| `"sending"` \| `"pending"` \| `"confirming"` \| `"failed"`; `timestamp`: `number`; `txHash?`: `string`; `txStatusId`: `string`; \}, \{ `error?`: `string`; `status`: `"confirmed"` \| `"proving"` \| `"idle"` \| `"initiated"` \| `"simulating"` \| `"sending"` \| `"pending"` \| `"confirming"` \| `"failed"`; `timestamp`: `number`; `txHash?`: `string`; `txStatusId`: `string`; \}\>

Schema for transaction status notification payload.

Note the distinction between txStatusId (internal tracking) and
txHash (blockchain identifier).
