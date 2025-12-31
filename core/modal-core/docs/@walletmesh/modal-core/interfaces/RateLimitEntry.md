[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / RateLimitEntry

# Interface: RateLimitEntry

Rate limit entry tracking

## Properties

### blockedUntil?

> `optional` **blockedUntil**: `number`

Blocked until time

***

### burstTokens

> **burstTokens**: `number`

Tokens available for burst

***

### lastRequestTime

> **lastRequestTime**: `number`

Last request time

***

### penaltyEndTime?

> `optional` **penaltyEndTime**: `number`

Current penalty end time

***

### requests

> **requests**: `number`

Number of requests in current window

***

### violations

> **violations**: `number`

Number of violations

***

### windowStart

> **windowStart**: `number`

Window start time
