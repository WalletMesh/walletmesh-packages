[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionSecurityManager

# Class: SessionSecurityManager

Session security manager

## Remarks

Manages secure wallet sessions with the following features:
- Origin binding to prevent session hijacking
- Configurable session timeouts with automatic expiry
- Session persistence across page reloads
- Recovery tokens for session restoration
- Activity tracking to extend active sessions
- Concurrent session limits per origin
- Automatic cleanup of expired sessions

## Example

```typescript
const sessionManager = new SessionSecurityManager({
  bindToOrigin: true,
  sessionTimeout: 3600000,
  enableRecovery: true
}, logger);

// Create a new session
const session = await sessionManager.createSession({
  origin: 'https://myapp.com',
  walletId: 'metamask',
  authorizedChains: ['1', '137']
});

// Validate session
const validation = sessionManager.validateSession(session.id, 'https://myapp.com');
if (validation.valid) {
  // Session is valid
}
```

## Constructors

### Constructor

> **new SessionSecurityManager**(`config`, `logger`, `originValidator?`): `SessionSecurityManager`

#### Parameters

##### config

[`SessionSecurityConfig`](../interfaces/SessionSecurityConfig.md)

##### logger

[`Logger`](Logger.md)

##### originValidator?

[`OriginValidator`](OriginValidator.md)

#### Returns

`SessionSecurityManager`

## Methods

### clearAllSessions()

> **clearAllSessions**(): `void`

Clear all sessions

#### Returns

`void`

#### Remarks

Removes all sessions from memory and persistent storage.
Use with caution as this will invalidate all active sessions.

#### Example

```typescript
// Clear all sessions during security incident
sessionManager.clearAllSessions();
console.log('All sessions cleared');
```

***

### createSession()

> **createSession**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SecureSession`](../interfaces/SecureSession.md)\>

Create a new secure session

#### Parameters

##### params

Session creation parameters

###### authorizedChains

`string`[]

Chain IDs authorized for this session

###### metadata?

\{ `custom?`: `Record`\<`string`, `unknown`\>; `ipHash?`: `string`; `userAgent?`: `string`; \}

Optional session metadata

###### metadata.custom?

`Record`\<`string`, `unknown`\>

Custom metadata

###### metadata.ipHash?

`string`

IP address hash (for additional validation)

###### metadata.userAgent?

`string`

User agent that created the session

###### origin

`string`

The origin creating the session

###### walletId

`string`

The wallet identifier

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SecureSession`](../interfaces/SecureSession.md)\>

The created secure session

#### Remarks

Creates a new secure session bound to the specified origin and wallet.
Enforces concurrent session limits and validates origin if validator is provided.

#### Throws

Error if origin validation fails

#### Example

```typescript
const session = await sessionManager.createSession({
  origin: window.location.origin,
  walletId: 'metamask',
  authorizedChains: ['1', '137'],
  metadata: {
    userAgent: navigator.userAgent,
    custom: { theme: 'dark' }
  }
});
```

***

### destroy()

> **destroy**(): `void`

Destroy session manager

#### Returns

`void`

#### Remarks

Cleans up all resources including timers and session data.
Call this when the session manager is no longer needed.

#### Example

```typescript
// Clean up on application shutdown
sessionManager.destroy();
```

***

### getSessionsByOrigin()

> **getSessionsByOrigin**(`origin`): [`SecureSession`](../interfaces/SecureSession.md)[]

Get all sessions for an origin

#### Parameters

##### origin

`string`

The origin to query

#### Returns

[`SecureSession`](../interfaces/SecureSession.md)[]

Array of sessions for the origin

#### Remarks

Retrieves all active sessions associated with a specific origin.
Useful for managing multiple sessions from the same origin.

#### Example

```typescript
const sessions = sessionManager.getSessionsByOrigin('https://myapp.com');
console.log(`Found ${sessions.length} sessions for origin`);
```

***

### getSessionsByWallet()

> **getSessionsByWallet**(`walletId`): [`SecureSession`](../interfaces/SecureSession.md)[]

Get all sessions for a wallet

#### Parameters

##### walletId

`string`

The wallet ID to query

#### Returns

[`SecureSession`](../interfaces/SecureSession.md)[]

Array of sessions for the wallet

#### Remarks

Retrieves all active sessions associated with a specific wallet.
Useful for managing sessions across different origins for the same wallet.

#### Example

```typescript
const sessions = sessionManager.getSessionsByWallet('metamask');
sessions.forEach(session => {
  console.log(`Session from ${session.origin}`);
});
```

***

### recoverSession()

> **recoverSession**(`recoveryToken`, `origin`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SecureSession`](../interfaces/SecureSession.md)\>

Recover a session using recovery token

#### Parameters

##### recoveryToken

`string`

The recovery token

##### origin

`string`

The origin attempting recovery

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SecureSession`](../interfaces/SecureSession.md)\>

The recovered session or null if recovery fails

#### Remarks

Attempts to recover a session using a recovery token. Validates the token,
checks recovery timeout, verifies origin, and enforces attempt limits.

#### Example

```typescript
const recoveredSession = await sessionManager.recoverSession(
  savedRecoveryToken,
  window.location.origin
);
if (recoveredSession) {
  console.log('Session recovered successfully');
} else {
  console.error('Session recovery failed');
}
```

***

### revokeSession()

> **revokeSession**(`sessionId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Revoke a session

#### Parameters

##### sessionId

`string`

The session ID to revoke

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Remarks

Revokes a session, marking it as invalid and removing it from active indices.
The session is kept in memory temporarily for validation to return proper
'revoked' status before eventual cleanup.

#### Example

```typescript
// Revoke session on logout
await sessionManager.revokeSession(sessionId);
console.log('Session revoked');
```

***

### validateSession()

> **validateSession**(`sessionId`, `origin`): [`SessionValidationResult`](../../../internal/types/typedocExports/interfaces/SessionValidationResult.md)

Validate a session

#### Parameters

##### sessionId

`string`

The session ID to validate

##### origin

`string`

The origin making the request

#### Returns

[`SessionValidationResult`](../../../internal/types/typedocExports/interfaces/SessionValidationResult.md)

Validation result with status and updated session

#### Remarks

Validates that a session exists, is not expired, matches the origin,
and is in a valid state. Updates activity tracking if enabled.

#### Example

```typescript
const result = sessionManager.validateSession(sessionId, origin);
if (result.valid) {
  // Session is valid, proceed with request
  const session = result.session;
} else {
  // Handle invalid session
  console.error(`Session invalid: ${result.reason}`);
}
```
