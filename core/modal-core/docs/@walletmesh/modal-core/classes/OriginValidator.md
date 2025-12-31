[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / OriginValidator

# Class: OriginValidator

Origin validator class

## Remarks

Implements comprehensive origin validation with security features including:
- HTTPS enforcement with localhost exceptions
- Homograph attack detection using character mapping
- Phishing pattern detection
- Configurable allow/block lists with regex pattern support
- Caching for performance optimization
- Extensible with custom validation logic

## Example

```typescript
const validator = new OriginValidator({
  enforceHttps: true,
  detectHomographs: true,
  allowedOrigins: ['https://myapp.com']
}, logger);

const isValid = await validator.validate('https://myapp.com');
if (!isValid) {
  throw new Error('Origin not allowed');
}
```

## Constructors

### Constructor

> **new OriginValidator**(`config`, `logger`): `OriginValidator`

#### Parameters

##### config

[`OriginValidationConfig`](../interfaces/OriginValidationConfig.md)

##### logger

[`Logger`](Logger.md)

#### Returns

`OriginValidator`

## Methods

### clearCache()

> **clearCache**(): `void`

Clear validation cache

#### Returns

`void`

#### Remarks

Removes all cached validation results. Useful when security policies
have been updated and cached results need to be invalidated.

#### Example

```typescript
// Update security policy
validator.updateConfig(newConfig);
// Clear cache to ensure new policy is applied
validator.clearCache();
```

***

### getCacheSize()

> **getCacheSize**(): `number`

Get cache size

#### Returns

`number`

The number of entries in the validation cache

#### Remarks

Returns the current number of cached validation results.
Useful for monitoring cache usage and performance.

#### Example

```typescript
const cacheSize = validator.getCacheSize();
console.log(`Cache contains ${cacheSize} entries`);
```

***

### validate()

> **validate**(`origin`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Validate an origin

#### Parameters

##### origin

`string`

The origin URL to validate

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if origin is valid, false otherwise

#### Remarks

Performs comprehensive validation checks on the provided origin including:
- Protocol validation (HTTPS enforcement)
- Blocklist/allowlist checking
- Pattern matching
- Homograph attack detection
- Custom validation logic

Results are cached if caching is enabled for performance optimization.

#### Example

```typescript
const isValid = await validator.validate('https://example.com');
if (!isValid) {
  console.error('Origin validation failed');
}
```
