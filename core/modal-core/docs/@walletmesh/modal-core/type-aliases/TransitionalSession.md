[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransitionalSession

# Type Alias: TransitionalSession

> **TransitionalSession** = `Extract`\<[`DiscriminatedSessionState`](DiscriminatedSessionState.md), \{ `status`: `"connecting"` \| `"switching"` \| `"disconnecting"`; \}\>

Comprehensive session management types for persistent wallet connections.
Handles session lifecycle, permissions, and multi-chain state management.

## Example

```typescript
import { SessionState, SessionManager } from '@walletmesh/modal-core';

// Access current session
const session: SessionState = client.getState().session;
if (session.status === 'connected') {
  console.log('Active chain:', session.chain.name);
}
```
