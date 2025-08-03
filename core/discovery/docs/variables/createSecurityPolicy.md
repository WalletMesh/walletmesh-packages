[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createSecurityPolicy

# Variable: createSecurityPolicy

> `const` **createSecurityPolicy**: `object`

Defined in: [security/createSecurityPolicy.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/createSecurityPolicy.ts#L35)

Helper functions to create common security policies for different deployment environments.

## Type declaration

## Security

#### custom()

> **custom**(`options`): [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Create a custom security policy with user-defined settings.

Flexible factory for creating security policies with specific requirements.
All settings are optional and default to secure values if not specified.

##### Parameters

###### options

`Partial`\<[`SecurityPolicy`](../interfaces/SecurityPolicy.md)\> = `{}`

Custom security policy settings

##### Returns

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Custom security policy

##### Example

```typescript
const policy = createSecurityPolicy.custom({
  requireHttps: true,
  allowLocalhost: true, // Allow localhost in production for debugging
  allowedOrigins: ['https://app.example.com'],
  rateLimit: {
    enabled: true,
    maxRequests: 30,
    windowMs: 60000
  }
});
```

##### Since

0.1.0

#### development()

> **development**(`options`): [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Create a development-friendly security policy.

Relaxed security settings suitable for development environments where
localhost access is needed and HTTPS may not be available. Maintains
basic protections while allowing development workflows.

##### Parameters

###### options

Optional allowlist/blocklist customization

###### allowedOrigins?

`string`[]

###### blockedOrigins?

`string`[]

##### Returns

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Development-optimized security policy

##### Examples

```typescript
const policy = createSecurityPolicy.development();
// Allows:
// - http://localhost:3000
// - http://127.0.0.1:8080
// - https://production-api.com (if needed for testing)
```

```typescript
const policy = createSecurityPolicy.development({
  allowedOrigins: [
    'http://localhost:3000',
    'https://staging.myapp.com'
  ]
});
```

##### Since

0.1.0

#### permissive()

> **permissive**(): [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Create a permissive security policy suitable for testing.

Minimal security restrictions designed for automated testing environments
where full control over the test environment exists. Should never be used
in production as it disables most security protections.

##### Returns

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Permissive security policy for testing

##### Example

```typescript
const policy = createSecurityPolicy.permissive();
// Settings:
// - No HTTPS requirement
// - Localhost allowed
// - No rate limiting
// - No certificate validation
```

##### Since

0.1.0

#### production()

> **production**(`options`): [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Create a production security policy with moderate restrictions.

Balanced security settings suitable for production environments where
strict certificate validation might cause issues. Requires HTTPS but
allows for some flexibility in certificate handling.

##### Parameters

###### options

Optional allowlist/blocklist customization

###### allowedOrigins?

`string`[]

###### blockedOrigins?

`string`[]

##### Returns

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Production security policy with balanced settings

##### Example

```typescript
const policy = createSecurityPolicy.production();
// Requires HTTPS, moderate rate limiting
```

##### Since

0.1.0

#### strict()

> **strict**(`options`): [`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Create a strict security policy optimized for production environments.

Enforces strong security requirements including HTTPS, certificate validation,
and strict rate limiting. Suitable for production deployments where security
is paramount and all traffic should be from known, trusted sources.

##### Parameters

###### options

Optional allowlist/blocklist customization

###### allowedOrigins?

`string`[]

###### blockedOrigins?

`string`[]

##### Returns

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Strict security policy for production use

##### Examples

```typescript
const policy = createSecurityPolicy.strict({
  allowedOrigins: [
    'https://app.mycompany.com',
    'https://admin.mycompany.com'
  ],
  blockedOrigins: [
    'https://known-malicious-site.com'
  ]
});
```

```typescript
const policy = createSecurityPolicy.strict();
// Settings:
// - requireHttps: true
// - allowLocalhost: false
// - certificateValidation: true
// - rateLimit: 10 requests per minute
```

##### Since

0.1.0

## Examples

```typescript
const policy = createSecurityPolicy.strict({
  allowedOrigins: ['https://myapp.com', 'https://app.mydomain.com']
});
// → HTTPS required, no localhost, rate limiting enabled
```

```typescript
const policy = createSecurityPolicy.development();
// → Allows localhost, relaxed HTTPS, higher rate limits
```

## Since

0.1.0

## See

[SecurityPolicy](../interfaces/SecurityPolicy.md) for the structure
