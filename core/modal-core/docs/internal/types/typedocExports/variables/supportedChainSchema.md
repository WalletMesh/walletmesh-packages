[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / supportedChainSchema

# Variable: supportedChainSchema

> `const` **supportedChainSchema**: `ZodObject`\<\{ `chainId`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `chainType`: `ZodNativeEnum`\<*typeof* [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)\>; `group`: `ZodOptional`\<`ZodString`\>; `icon`: `ZodOptional`\<`ZodString`\>; `interfaces`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `label`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `required`: `ZodBoolean`; \}, `"strip"`, `ZodTypeAny`, \{ `chainId`: `string`; `chainType`: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}, \{ `chainId`: `string`; `chainType`: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}\>

Supported chain schema

## Remarks

Defines the structure of a supported chain configuration
