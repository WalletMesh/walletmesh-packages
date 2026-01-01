[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / errorContextSchema

# Variable: errorContextSchema

> `const` **errorContextSchema**: `ZodObject`\<\{ `attempt`: `ZodOptional`\<`ZodNumber`\>; `chainId`: `ZodOptional`\<`ZodString`\>; `component`: `ZodOptional`\<`ZodString`\>; `extra`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `method`: `ZodOptional`\<`ZodString`\>; `operation`: `ZodOptional`\<`ZodString`\>; `timestamp`: `ZodOptional`\<`ZodDate`\>; `userAgent`: `ZodOptional`\<`ZodString`\>; `walletId`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `attempt?`: `number`; `chainId?`: `string`; `component?`: `string`; `extra?`: `Record`\<`string`, `unknown`\>; `method?`: `string`; `operation?`: `string`; `timestamp?`: `Date`; `userAgent?`: `string`; `walletId?`: `string`; \}, \{ `attempt?`: `number`; `chainId?`: `string`; `component?`: `string`; `extra?`: `Record`\<`string`, `unknown`\>; `method?`: `string`; `operation?`: `string`; `timestamp?`: `Date`; `userAgent?`: `string`; `walletId?`: `string`; \}\>

Error context schema for additional debugging information
