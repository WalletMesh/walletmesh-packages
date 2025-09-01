[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SessionTrackingState

# Interface: SessionTrackingState

Defined in: [core/types.ts:1434](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1434)

**`Internal`**

Session tracking state for managing active discovery sessions.

Maintains the internal state needed for session validation, rate limiting,
and cleanup. Used by responders to prevent session replay attacks and
enforce rate limits.

## Example

```typescript
const sessionState: SessionTrackingState = {
  usedSessions: new Map([
    ['https://app1.com', new Set(['session-1', 'session-2'])],
    ['https://app2.com', new Set(['session-3'])]
  ]),
  sessionTimestamps: new Map([
    ['https://app1.com', new Map([
      ['session-1', 1640995200000],
      ['session-2', 1640995260000]
    ])]
  ]),
  requestCounts: new Map([
    ['https://app1.com', [1640995200000, 1640995210000, 1640995220000]]
  ]),
  lastCleanup: 1640995200000
};
```

## Since

0.1.0

## See

[SessionOptions](SessionOptions.md) for configuration

## Properties

### lastCleanup

> **lastCleanup**: `number`

Defined in: [core/types.ts:1438](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1438)

***

### requestCounts

> **requestCounts**: `Map`\<`string`, `number`[]\>

Defined in: [core/types.ts:1437](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1437)

***

### sessionTimestamps

> **sessionTimestamps**: `Map`\<`string`, `Map`\<`string`, `number`\>\>

Defined in: [core/types.ts:1436](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1436)

***

### usedSessions

> **usedSessions**: `Map`\<`string`, `Set`\<`string`\>\>

Defined in: [core/types.ts:1435](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1435)
