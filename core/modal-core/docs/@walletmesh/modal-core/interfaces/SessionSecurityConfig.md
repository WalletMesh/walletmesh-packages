[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionSecurityConfig

# Interface: SessionSecurityConfig

Session security configuration

## Remarks

Configures the session security module with origin binding, persistence,
recovery options, and activity tracking for secure wallet sessions.

## Example

```typescript
const config: SessionSecurityConfig = {
  bindToOrigin: true,
  sessionTimeout: 3600000, // 1 hour
  enablePersistence: true,
  enableRecovery: true,
  maxConcurrentSessions: 5
};
```

## Properties

### bindToOrigin?

> `optional` **bindToOrigin**: `boolean`

Enable origin binding for sessions

***

### enablePersistence?

> `optional` **enablePersistence**: `boolean`

Enable session persistence

***

### enableRecovery?

> `optional` **enableRecovery**: `boolean`

Enable session recovery

***

### logEvents?

> `optional` **logEvents**: `boolean`

Log security events

***

### maxConcurrentSessions?

> `optional` **maxConcurrentSessions**: `number`

Maximum number of concurrent sessions

***

### recoveryTimeout?

> `optional` **recoveryTimeout**: `number`

Recovery timeout in milliseconds

***

### sessionIdGenerator()?

> `optional` **sessionIdGenerator**: () => `string`

Custom session ID generator

#### Returns

`string`

***

### sessionTimeout?

> `optional` **sessionTimeout**: `number`

Session timeout in milliseconds

***

### storageKeyPrefix?

> `optional` **storageKeyPrefix**: `string`

Storage key prefix for persisted sessions

***

### trackActivity?

> `optional` **trackActivity**: `boolean`

Enable session activity tracking
