[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / parseAztecTransactionStatusNotification

# Function: parseAztecTransactionStatusNotification()

> **parseAztecTransactionStatusNotification**(`params`): `null` \| \{ `error?`: `string`; `status`: `"confirmed"` \| `"proving"` \| `"idle"` \| `"initiated"` \| `"simulating"` \| `"sending"` \| `"pending"` \| `"confirming"` \| `"failed"`; `timestamp`: `number`; `txHash?`: `string`; `txStatusId`: `string`; \}

Attempt to parse a transaction status notification payload.

Returns `null` when the payload does not conform to the schema.

## Parameters

### params

`unknown`

## Returns

`null` \| \{ `error?`: `string`; `status`: `"confirmed"` \| `"proving"` \| `"idle"` \| `"initiated"` \| `"simulating"` \| `"sending"` \| `"pending"` \| `"confirming"` \| `"failed"`; `timestamp`: `number`; `txHash?`: `string`; `txStatusId`: `string`; \}
