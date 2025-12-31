[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConnectionError

# Function: useConnectionError()

> **useConnectionError**(): `undefined` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

Defined in: [core/modal-react/src/hooks/granular/index.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/granular/index.ts#L169)

Hook to get connection error
Re-renders only when connection error changes

## Returns

`undefined` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}
