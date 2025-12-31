[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / OriginValidationConfig

# Interface: OriginValidationConfig

Origin validation configuration

## Remarks

Configures the origin validation security module with various security policies
including HTTPS enforcement, homograph attack detection, and custom validation rules.

## Example

```typescript
const config: OriginValidationConfig = {
  enforceHttps: true,
  allowLocalhost: true,
  allowedOrigins: ['https://myapp.com', 'https://app.myapp.com'],
  detectHomographs: true,
  knownDomains: ['myapp.com', 'trusted-partner.com'],
  logValidation: true
};
```

## Properties

### allowedOrigins?

> `optional` **allowedOrigins**: `string`[]

Allowed origins (exact match)

***

### allowedPatterns?

> `optional` **allowedPatterns**: `RegExp`[]

Allowed origin patterns (regex)

***

### allowInternationalDomains?

> `optional` **allowInternationalDomains**: `boolean`

Allow international domain names

***

### allowLocalhost?

> `optional` **allowLocalhost**: `boolean`

Allow localhost origins for development

***

### blockedOrigins?

> `optional` **blockedOrigins**: `string`[]

Blocked origins (exact match)

***

### blockedPatterns?

> `optional` **blockedPatterns**: `RegExp`[]

Blocked origin patterns (regex)

***

### cacheMaxSize?

> `optional` **cacheMaxSize**: `number`

Cache max size

***

### cacheTTL?

> `optional` **cacheTTL**: `number`

Cache TTL in milliseconds

***

### checkHomographs?

> `optional` **checkHomographs**: `boolean`

***

### customValidator()?

> `optional` **customValidator**: (`origin`) => `boolean` \| [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Custom validation function

#### Parameters

##### origin

`string`

#### Returns

`boolean` \| [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

***

### detectHomographs?

> `optional` **detectHomographs**: `boolean`

Enable homograph attack detection

***

### enableCache?

> `optional` **enableCache**: `boolean`

Enable caching

***

### enforceHttps?

> `optional` **enforceHttps**: `boolean`

Enforce HTTPS for all origins except localhost

***

### knownDomains?

> `optional` **knownDomains**: `string`[]

Known legitimate domains for homograph detection

***

### logValidation?

> `optional` **logValidation**: `boolean`

Log validation attempts

***

### logValidationEvents?

> `optional` **logValidationEvents**: `boolean`

***

### requireHttps?

> `optional` **requireHttps**: `boolean`
