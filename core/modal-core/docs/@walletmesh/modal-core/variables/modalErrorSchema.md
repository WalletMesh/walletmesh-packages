[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / modalErrorSchema

# Variable: modalErrorSchema

> `const` **modalErrorSchema**: `ZodObject`\<\{ `category`: `ZodEnum`\<\[`"user"`, `"wallet"`, `"network"`, `"general"`, `"validation"`, `"sandbox"`\]\>; `cause`: `ZodOptional`\<`ZodUnknown`\>; `classification`: `ZodOptional`\<`ZodEnum`\<\[`"network"`, `"permission"`, `"provider"`, `"temporary"`, `"permanent"`, `"unknown"`\]\>\>; `code`: `ZodString`; `data`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `maxRetries`: `ZodOptional`\<`ZodNumber`\>; `message`: `ZodString`; `recoveryStrategy`: `ZodOptional`\<`ZodEnum`\<\[`"retry"`, `"wait_and_retry"`, `"manual_action"`, `"none"`\]\>\>; `retryDelay`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `category`: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`; `retryDelay?`: `number`; \}, \{ `category`: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`; `retryDelay?`: `number`; \}\>

Base modal error schema

Note: Recoverability is determined by the recoveryStrategy field:
- If recoveryStrategy is present and not 'none', the error is recoverable
- If recoveryStrategy is 'none' or undefined, the error is not recoverable
