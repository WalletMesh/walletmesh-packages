[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DISCOVERY\_CONFIG

# Variable: DISCOVERY\_CONFIG

> `const` `readonly` **DISCOVERY\_CONFIG**: `object`

Defined in: [core/discovery/src/core/constants.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/core/constants.ts#L90)

Default configuration settings for the discovery protocol.

Provides sensible defaults for timeouts, limits, and intervals
used throughout the discovery process. These can be overridden
in specific implementations as needed.

## Type Declaration

### CLEANUP\_INTERVAL\_MS

> `readonly` **CLEANUP\_INTERVAL\_MS**: `number`

Cleanup interval for expired sessions in milliseconds.

#### Default

```ts
60000 (1 minute)
```

### DISCOVERY\_TIMEOUT\_MS

> `readonly` **DISCOVERY\_TIMEOUT\_MS**: `3000` = `3000`

Time in milliseconds to wait for wallet responses.
After this timeout, discovery is considered complete.

#### Default

```ts
3000
```

### MAX\_REQUESTS\_PER\_MINUTE

> `readonly` **MAX\_REQUESTS\_PER\_MINUTE**: `10` = `10`

Maximum number of requests per origin per minute.
Used for rate limiting to prevent abuse.

#### Default

```ts
10
```

### MAX\_SESSIONS\_PER\_ORIGIN

> `readonly` **MAX\_SESSIONS\_PER\_ORIGIN**: `5` = `5`

Maximum number of concurrent sessions per origin.

#### Default

```ts
5
```

### RATE\_LIMIT\_WINDOW\_MS

> `readonly` **RATE\_LIMIT\_WINDOW\_MS**: `number`

Time window for rate limiting in milliseconds.

#### Default

```ts
60000 (1 minute)
```

### SESSION\_MAX\_AGE\_MS

> `readonly` **SESSION\_MAX\_AGE\_MS**: `number`

Maximum age of a session in milliseconds.
Sessions older than this are considered expired.

#### Default

```ts
300000 (5 minutes)
```

## Example

```typescript
const customTimeout = DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS * 2;
const maxSessions = DISCOVERY_CONFIG.MAX_SESSIONS_PER_ORIGIN;
```

## Since

0.1.0
