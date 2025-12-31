[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SecureSession

# Interface: SecureSession

Secure session information

## Remarks

Contains comprehensive information about a secure wallet session including
origin binding, authorization details, activity tracking, and recovery tokens.

## Example

```typescript
const session: SecureSession = {
  id: 'session_1234567890',
  origin: 'https://myapp.com',
  walletId: 'metamask',
  authorizedChains: ['1', '137'],
  createdAt: Date.now(),
  lastActivity: Date.now(),
  expiresAt: Date.now() + 3600000,
  state: 'active',
  metadata: {
    userAgent: navigator.userAgent
  }
};
```

## Properties

### authorizedChains

> **authorizedChains**: `string`[]

Chain IDs authorized for this session

***

### createdAt

> **createdAt**: `number`

Session creation timestamp

***

### expiresAt

> **expiresAt**: `number`

Session expiry timestamp

***

### id

> **id**: `string`

Unique session identifier

***

### lastActivity

> **lastActivity**: `number`

Last activity timestamp

***

### metadata

> **metadata**: `object`

Session metadata

#### custom?

> `optional` **custom**: `Record`\<`string`, `unknown`\>

Custom metadata

#### ipHash?

> `optional` **ipHash**: `string`

IP address hash (for additional validation)

#### userAgent?

> `optional` **userAgent**: `string`

User agent that created the session

***

### origin

> **origin**: `string`

Origin that created the session

***

### recoveryAttempts?

> `optional` **recoveryAttempts**: `number`

Number of recovery attempts

***

### recoveryToken?

> `optional` **recoveryToken**: `string`

Recovery token (if recovery is enabled)

***

### state

> **state**: `"revoked"` \| `"active"` \| `"expired"`

Session state

***

### walletId

> **walletId**: `string`

Wallet ID
