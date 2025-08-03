[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SessionTracker

# Class: SessionTracker

Defined in: [security/SessionTracker.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L80)

Session tracker implementing origin-bound session tracking for replay attack prevention.

Maintains separate session namespaces per origin to prevent session poisoning
attacks where malicious origins attempt to replay session IDs from legitimate
origins. Essential component of the discovery protocol's security model.

Key security features:
- Origin-isolated session tracking (sessions can't cross origins)
- Automatic session expiration based on age
- Per-origin session limits with LRU eviction
- Request rate tracking for additional abuse prevention
- Memory-efficient cleanup of expired sessions
- Comprehensive monitoring and statistics

## Examples

```typescript
const tracker = new SessionTracker({
  maxAge: 5 * 60 * 1000,           // 5 minute session lifetime
  maxSessionsPerOrigin: 10,       // Max 10 concurrent sessions per origin
  cleanupInterval: 60 * 1000      // Cleanup every minute
});

// Validate new session
const isValid = tracker.trackSession(
  'https://dapp.com',
  'session-uuid-123',
  Date.now()
);

if (isValid) {
  console.log('Session is new and valid');
} else {
  console.log('Session replay attack detected!');
}
```

```typescript
const origin = 'https://example.com';
const sessionId = 'abc-123';

// First use - should succeed
const first = tracker.trackSession(origin, sessionId);
console.log(first); // true

// Replay attempt - should fail
const replay = tracker.trackSession(origin, sessionId);
console.log(replay); // false - replay attack blocked

// Same session from different origin - should succeed
const different = tracker.trackSession('https://other.com', sessionId);
console.log(different); // true - different origin namespace
```

```typescript
// Monitor session activity
const stats = tracker.getOriginStats('https://dapp.com');
console.log(`Active sessions: ${stats.activeSessions}`);
console.log(`Recent requests: ${stats.recentRequests}`);

// Manual cleanup of expired sessions
tracker.cleanup();

// Memory usage monitoring
const memory = tracker.getMemoryStats();
console.log(`Tracking ${memory.totalSessions} sessions across ${memory.totalOrigins} origins`);
```

## Since

0.1.0

## See

 - [SessionOptions](../interfaces/SessionOptions.md) for configuration options
 - [OriginValidator](OriginValidator.md) for origin validation
 - [RateLimiter](RateLimiter.md) for request rate limiting

## Constructors

### Constructor

> **new SessionTracker**(`options`): `SessionTracker`

Defined in: [security/SessionTracker.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L89)

#### Parameters

##### options

`Partial`\<[`SessionOptions`](../interfaces/SessionOptions.md)\> = `{}`

#### Returns

`SessionTracker`

## Maintenance

### cleanup()

> **cleanup**(): `void`

Defined in: [security/SessionTracker.ts:469](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L469)

Clean up expired sessions and old request tracking data.

Removes sessions that have exceeded the maximum age and cleans up
old request count data outside the rate limiting window. Helps
maintain memory efficiency and prevents unbounded growth.

This method is called automatically based on the cleanup interval,
but can also be called manually for immediate cleanup.

#### Returns

`void`

#### Example

```typescript
// Manual cleanup
tracker.cleanup();

// Check memory usage after cleanup
const stats = tracker.getMemoryStats();
console.log(`Memory freed, now tracking ${stats.totalSessions} sessions`);
```

#### Since

0.1.0

## Management

### clear()

> **clear**(): `void`

Defined in: [security/SessionTracker.ts:534](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L534)

Clear all tracking data.

Completely resets the session tracker by removing all tracked
sessions, timestamps, and request counts for all origins.
Use with caution as this removes all replay protection.

#### Returns

`void`

#### Example

```typescript
// Emergency reset
tracker.clear();
console.log('All session tracking data cleared');

// Periodic maintenance
schedule.daily(() => {
  tracker.clear();
  console.log('Daily session reset completed');
});
```

#### Since

0.1.0

## Monitoring

### getState()

> **getState**(): [`SessionTrackingState`](../interfaces/SessionTrackingState.md)

Defined in: [security/SessionTracker.ts:383](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L383)

Get the current state of session tracking for debugging and monitoring.

Returns a complete snapshot of the tracker's internal state including
all tracked sessions, timestamps, and request counts. Useful for
debugging, monitoring, and testing.

#### Returns

[`SessionTrackingState`](../interfaces/SessionTrackingState.md)

Complete session tracking state (defensive copy)

#### Example

```typescript
const state = tracker.getState();

// Inspect tracked sessions by origin
for (const [origin, sessions] of state.usedSessions) {
  console.log(`${origin}: ${sessions.size} active sessions`);
}

// Check session timestamps
for (const [origin, timestamps] of state.sessionTimestamps) {
  for (const [sessionId, timestamp] of timestamps) {
    const age = Date.now() - timestamp;
    console.log(`Session ${sessionId}: ${age}ms old`);
  }
}
```

#### Since

0.1.0

## Rate Limiting

### isRateLimited()

> **isRateLimited**(`origin`, `timestamp`): `boolean`

Defined in: [security/SessionTracker.ts:301](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L301)

Check if an origin is rate limited.

Determines whether the specified origin has exceeded the maximum
number of requests allowed within the rate limit window. Uses
the default discovery protocol rate limits.

#### Parameters

##### origin

`string`

Origin URL to check rate limit status

##### timestamp

`number` = `...`

Optional timestamp for check (defaults to now)

#### Returns

`boolean`

True if origin is rate limited, false otherwise

#### Example

```typescript
if (tracker.isRateLimited('https://suspicious.com')) {
  console.log('Origin exceeded rate limit');
  // Reject discovery request
  return { error: 'Rate limit exceeded' };
}
```

#### Since

0.1.0

***

### trackRequest()

> **trackRequest**(`origin`, `timestamp`): `void`

Defined in: [security/SessionTracker.ts:263](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L263)

Track a request for rate limiting purposes.

Records a request from the specified origin for internal rate limiting
calculations. This is separate from session tracking and is used to
monitor request frequency patterns.

#### Parameters

##### origin

`string`

Origin URL making the request

##### timestamp

`number` = `...`

Optional request timestamp (defaults to now)

#### Returns

`void`

#### Example

```typescript
// Track each discovery request
tracker.trackRequest('https://dapp.com');

// Later check if rate limited
if (tracker.isRateLimited('https://dapp.com')) {
  console.log('Too many requests from this origin');
}
```

#### Since

0.1.0

## Session Management

### removeSession()

> **removeSession**(`origin`, `sessionId`): `void`

Defined in: [security/SessionTracker.ts:334](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L334)

Remove a session from tracking.

Manually removes a specific session from the tracking system.
Useful for explicit session invalidation or cleanup scenarios.
Automatically cleans up empty origin entries.

#### Parameters

##### origin

`string`

Origin URL that owns the session

##### sessionId

`string`

Session identifier to remove

#### Returns

`void`

#### Example

```typescript
// Invalidate session on logout
tracker.removeSession('https://dapp.com', userSessionId);

// Cleanup after session expiry
const expiredSessions = getExpiredSessions();
expiredSessions.forEach(session => {
  tracker.removeSession(session.origin, session.id);
});
```

#### Since

0.1.0

## Session Tracking

### hasSession()

> **hasSession**(`origin`, `sessionId`): `boolean`

Defined in: [security/SessionTracker.ts:234](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L234)

Check if a session has been used for the given origin.

Verifies whether a specific session ID has already been used for
the given origin. Useful for pre-validation checks and debugging.

#### Parameters

##### origin

`string`

Origin URL to check

##### sessionId

`string`

Session identifier to verify

#### Returns

`boolean`

True if session exists for origin, false otherwise

#### Example

```typescript
const sessionId = 'session-123';
const origin = 'https://example.com';

if (tracker.hasSession(origin, sessionId)) {
  console.log('Session already used - potential replay');
} else {
  console.log('New session');
}
```

#### Since

0.1.0

***

### trackSession()

> **trackSession**(`origin`, `sessionId`, `timestamp`): `boolean`

Defined in: [security/SessionTracker.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L142)

Track a new session for the given origin.

Validates and records a new session for the specified origin.
Prevents replay attacks by rejecting sessions that have already
been used for the same origin. Maintains origin isolation to
prevent cross-origin session poisoning.

#### Parameters

##### origin

`string`

Origin URL requesting session tracking

##### sessionId

`string`

Unique session identifier to track

##### timestamp

`number` = `...`

Optional request timestamp (defaults to now)

#### Returns

`boolean`

True if session is new and valid, false if replay detected

#### Examples

```typescript
const result = tracker.trackSession(
  'https://dapp.com',
  crypto.randomUUID(),
  Date.now()
);
// → true (new session recorded)
```

```typescript
const sessionId = 'session-123';
const origin = 'https://example.com';

// First use
tracker.trackSession(origin, sessionId); // → true

// Replay attempt
tracker.trackSession(origin, sessionId); // → false (replay blocked)
```

```typescript
const sessionId = 'shared-session-id';

tracker.trackSession('https://origin1.com', sessionId); // → true
tracker.trackSession('https://origin2.com', sessionId); // → true (different origin)
tracker.trackSession('https://origin1.com', sessionId); // → false (replay for origin1)
```

#### Since

0.1.0

## Statistics

### getMemoryStats()

> **getMemoryStats**(): `object`

Defined in: [security/SessionTracker.ts:573](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L573)

Get memory usage statistics.

Provides detailed information about memory consumption including
the number of tracked origins, sessions, and requests. Useful for
monitoring resource usage and detecting memory leaks.

#### Returns

`object`

Memory statistics with detailed breakdown

##### memoryFootprint

> **memoryFootprint**: `object`

###### memoryFootprint.requestEntries

> **requestEntries**: `number` = `totalRequests`

###### memoryFootprint.sessionEntries

> **sessionEntries**: `number` = `totalSessions`

###### memoryFootprint.sessionMaps

> **sessionMaps**: `number`

##### totalOrigins

> **totalOrigins**: `number`

##### totalRequests

> **totalRequests**: `number`

##### totalSessions

> **totalSessions**: `number`

#### Example

```typescript
const memory = tracker.getMemoryStats();

console.log(`Tracking ${memory.totalOrigins} origins`);
console.log(`Total sessions: ${memory.totalSessions}`);
console.log(`Total requests: ${memory.totalRequests}`);

// Monitor memory growth
if (memory.totalSessions > 10000) {
  console.warn('High memory usage - consider cleanup');
  tracker.cleanup();
}

// Detailed memory breakdown
const { memoryFootprint } = memory;
console.log(`Maps: ${memoryFootprint.sessionMaps}`);
console.log(`Entries: ${memoryFootprint.sessionEntries}`);
```

#### Since

0.1.0

***

### getOriginStats()

> **getOriginStats**(`origin`): `object`

Defined in: [security/SessionTracker.ts:423](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/SessionTracker.ts#L423)

Get session statistics for an origin.

Provides detailed statistics about session activity for a specific
origin including active session count, recent requests, and session
age information. Useful for monitoring and debugging.

#### Parameters

##### origin

`string`

Origin URL to get statistics for

#### Returns

`object`

Statistics object with session and request metrics

##### activeSessions

> **activeSessions**: `number` = `sessions`

##### newestSession

> **newestSession**: `number`

##### oldestSession

> **oldestSession**: `number`

##### origin

> **origin**: `string`

##### recentRequests

> **recentRequests**: `number` = `requests`

#### Example

```typescript
const stats = tracker.getOriginStats('https://dapp.com');

console.log(`Active sessions: ${stats.activeSessions}`);
console.log(`Recent requests: ${stats.recentRequests}`);

if (stats.oldestSession) {
  const age = Date.now() - stats.oldestSession;
  console.log(`Oldest session age: ${age}ms`);
}

// Monitor for suspicious activity
if (stats.activeSessions > 50) {
  console.warn(`High session count for ${origin}`);
}
```

#### Since

0.1.0
