[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / supportedChainsConfigSchema

# Variable: supportedChainsConfigSchema

> `const` **supportedChainsConfigSchema**: `ZodObject`\<\{ `allowFallbackChains`: `ZodOptional`\<`ZodBoolean`\>; `allowMultipleWalletsPerChain`: `ZodOptional`\<`ZodBoolean`\>; `chainsByTech`: `ZodRecord`\<`ZodString`, `ZodArray`\<`ZodObject`\<\{ `chainId`: `ZodEffects`\<`ZodString`, `string`, `string`\>; `chainType`: `ZodNativeEnum`\<*typeof* [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)\>; `group`: `ZodOptional`\<`ZodString`\>; `icon`: `ZodOptional`\<`ZodString`\>; `interfaces`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `label`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `required`: `ZodBoolean`; \}, `"strip"`, `ZodTypeAny`, \{ `chainId`: `string`; `chainType`: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}, \{ `chainId`: `string`; `chainType`: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}\>, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `allowFallbackChains?`: `boolean`; `allowMultipleWalletsPerChain?`: `boolean`; `chainsByTech`: `Record`\<`string`, `object`[]\>; \}, \{ `allowFallbackChains?`: `boolean`; `allowMultipleWalletsPerChain?`: `boolean`; `chainsByTech`: `Record`\<`string`, `object`[]\>; \}\>

Supported chains configuration schema
