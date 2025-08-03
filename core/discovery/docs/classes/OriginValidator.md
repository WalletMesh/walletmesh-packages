[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / OriginValidator

# Class: OriginValidator

Defined in: [security/OriginValidator.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L66)

Origin validator implementing robust validation and anti-spoofing measures.

Provides comprehensive origin validation to prevent cross-origin attacks,
session poisoning, and malicious discovery requests. Features configurable
security policies with support for allowlists, blocklists, HTTPS enforcement,
and sophisticated suspicious pattern detection.

Key security features:
- Configurable allowlist/blocklist of trusted/blocked origins
- HTTPS enforcement with development localhost exceptions
- Homograph attack detection (Unicode spoofing)
- Suspicious domain pattern detection
- Event origin vs claimed origin validation
- Hostname format validation and length limits

## Examples

```typescript
const validator = new OriginValidator({
  requireHttps: true,
  allowLocalhost: false,
  allowedOrigins: ['https://trusted-dapp.com'],
  blockedOrigins: ['https://malicious-site.com']
});

const result = validator.validateOrigin('https://example.com');
if (result.valid) {
  console.log('Origin is valid');
} else {
  console.warn('Blocked:', result.reason);
}
```

```typescript
const devValidator = new OriginValidator({
  requireHttps: false,
  allowLocalhost: true,
  // More permissive for development
});

// Allows localhost:3000, 127.0.0.1:8080, etc.
const result = devValidator.validateOrigin('http://localhost:3000');
```

```typescript
// Validates that event origin matches claimed origin
const result = validator.validateEventOrigin(
  event.origin,           // Actual event origin
  request.origin          // Claimed origin in message
);

if (!result.valid) {
  console.error('Possible spoofing attempt:', result.reason);
}
```

## Since

0.1.0

## See

 - [SecurityPolicy](../interfaces/SecurityPolicy.md) for configuration options
 - [OriginValidationResult](../interfaces/OriginValidationResult.md) for validation results

## Constructors

### Constructor

> **new OriginValidator**(`policy`): `OriginValidator`

Defined in: [security/OriginValidator.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L74)

#### Parameters

##### policy

[`SecurityPolicy`](../interfaces/SecurityPolicy.md) = `{}`

#### Returns

`OriginValidator`

## Configuration

### allowOrigin()

> **allowOrigin**(`origin`): `void`

Defined in: [security/OriginValidator.ts:415](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L415)

Add an origin to the allowed list.

Adds the specified origin to the allowlist, creating the allowlist
if it doesn't exist. If the origin was previously blocked, it
remains blocked (blocklist takes precedence).

#### Parameters

##### origin

`string`

Origin to add to allowlist

#### Returns

`void`

#### Example

```typescript
validator.allowOrigin('https://new-partner.com');

// Now this origin will pass validation
const result = validator.validateOrigin('https://new-partner.com');
```

#### Since

0.1.0

***

### blockOrigin()

> **blockOrigin**(`origin`): `void`

Defined in: [security/OriginValidator.ts:443](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L443)

Add an origin to the blocked list.

Adds the specified origin to the blocklist and removes it from
the allowlist if present. Blocked origins are rejected regardless
of other policy settings.

#### Parameters

##### origin

`string`

Origin to block

#### Returns

`void`

#### Example

```typescript
validator.blockOrigin('https://suspicious-site.com');

// This origin will now be rejected
const result = validator.validateOrigin('https://suspicious-site.com');
// → { valid: false, reason: 'Origin is explicitly blocked' }
```

#### Since

0.1.0

***

### getPolicy()

> **getPolicy**(): [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Defined in: [security/OriginValidator.ts:384](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L384)

Get the current security policy configuration.

Returns a copy of the current policy settings including allowlists,
blocklists, HTTPS requirements, and other security configurations.

#### Returns

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Current security policy configuration

#### Example

```typescript
const policy = validator.getPolicy();
console.log('HTTPS required:', policy.requireHttps);
console.log('Allowed origins:', policy.allowedOrigins);
```

#### Since

0.1.0

***

### updatePolicy()

> **updatePolicy**(`policy`): `void`

Defined in: [security/OriginValidator.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L99)

Update the security policy configuration.

Applies new security settings while maintaining the current validator state.
Policy changes take effect immediately for subsequent validations.

#### Parameters

##### policy

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

New security policy settings to apply

#### Returns

`void`

#### Example

```typescript
// Update to stricter production settings
validator.updatePolicy({
  requireHttps: true,
  allowLocalhost: false,
  allowedOrigins: ['https://production-app.com']
});
```

#### Since

0.1.0

## Other

### isAllowed()

> **isAllowed**(`origin`): `boolean`

Defined in: [security/OriginValidator.ts:465](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L465)

Check if an origin is explicitly allowed.

#### Parameters

##### origin

`string`

#### Returns

`boolean`

***

### isBlocked()

> **isBlocked**(`origin`): `boolean`

Defined in: [security/OriginValidator.ts:475](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L475)

Check if an origin is explicitly blocked.

#### Parameters

##### origin

`string`

#### Returns

`boolean`

***

### removeOrigin()

> **removeOrigin**(`origin`): `void`

Defined in: [security/OriginValidator.ts:455](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L455)

Remove an origin from both allowed and blocked lists.

#### Parameters

##### origin

`string`

#### Returns

`void`

## Security

### validateEventOrigin()

> **validateEventOrigin**(`eventOrigin`, `claimedOrigin`): [`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Defined in: [security/OriginValidator.ts:260](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L260)

Validate that event origin matches the claimed origin in the message.

Critical security check to prevent session poisoning attacks where malicious
sites attempt to forge messages claiming to be from trusted origins.
Validates both the event origin and the consistency between event and claimed origins.

#### Parameters

##### eventOrigin

`string`

Actual origin from the event (e.g., event.origin)

##### claimedOrigin

`string`

Origin claimed in the message payload

#### Returns

[`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Validation result with mismatch detection

#### Examples

```typescript
const result = validator.validateEventOrigin(
  'https://trusted-app.com',    // Event origin
  'https://trusted-app.com'     // Claimed origin
);
// → { valid: true, origin: 'https://trusted-app.com', ... }
```

```typescript
const result = validator.validateEventOrigin(
  'https://malicious-site.com',  // Actual event origin
  'https://trusted-app.com'      // Falsely claimed origin
);
// → { valid: false, reason: 'Origin mismatch: event origin...', ... }
```

```typescript
const result = validator.validateEventOrigin(
  'http://blocked-site.com',     // Invalid event origin
  'http://blocked-site.com'      // Matching but still invalid
);
// → { valid: false, reason: 'HTTPS required', ... }
```

#### Since

0.1.0

#### See

[validateOrigin](../functions/validateOrigin.md) for individual origin validation

## Statistics

### getStats()

> **getStats**(): `object`

Defined in: [security/OriginValidator.ts:498](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L498)

Get statistics about current origin validation configuration.

Returns detailed statistics about the validator's current state
including list sizes, policy settings, and configuration status.

#### Returns

`object`

Statistics object with configuration details

##### allowedOriginsCount

> **allowedOriginsCount**: `number`

##### allowLocalhost

> **allowLocalhost**: `boolean`

##### blockedOriginsCount

> **blockedOriginsCount**: `number`

##### certificateValidation

> **certificateValidation**: `boolean`

##### hasCSPRequirement

> **hasCSPRequirement**: `boolean`

##### requireHttps

> **requireHttps**: `boolean`

#### Example

```typescript
const stats = validator.getStats();
console.log(`${stats.allowedOriginsCount} allowed origins`);
console.log(`${stats.blockedOriginsCount} blocked origins`);
console.log('HTTPS required:', stats.requireHttps);
```

#### Since

0.1.0

## Validation

### validateOrigin()

> **validateOrigin**(`origin`): [`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Defined in: [security/OriginValidator.ts:153](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L153)

Validate an origin against the configured security policy.

Performs comprehensive validation including format checking, allowlist/blocklist
evaluation, HTTPS enforcement, localhost handling, and suspicious pattern detection.
Returns detailed validation result with specific failure reasons.

#### Parameters

##### origin

`string`

Origin URL to validate (e.g., 'https://example.com')

#### Returns

[`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Validation result with status and optional failure reason

#### Examples

```typescript
// HTTPS origin with valid policy
validator.validateOrigin('https://trusted-app.com');
// → { valid: true, origin: '...', timestamp: ... }

// Localhost in development mode
devValidator.validateOrigin('http://localhost:3000');
// → { valid: true, origin: '...', timestamp: ... }
```

```typescript
// HTTP when HTTPS required
validator.validateOrigin('http://example.com');
// → { valid: false, reason: 'HTTPS required', ... }

// Blocked origin
validator.validateOrigin('https://malicious.com');
// → { valid: false, reason: 'Origin is explicitly blocked', ... }

// Suspicious homograph attack
validator.validateOrigin('https://аpple.com');  // Cyrillic 'а'
// → { valid: false, reason: 'Suspicious origin pattern detected', ... }
```

#### Since

0.1.0
