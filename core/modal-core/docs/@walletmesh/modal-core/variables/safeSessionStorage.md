[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / safeSessionStorage

# Variable: safeSessionStorage

> `const` **safeSessionStorage**: `Storage`

Safe sessionStorage instance

## Remarks

Pre-created safe sessionStorage wrapper that can be used anywhere without
worrying about SSR or browser compatibility issues

## Example

```typescript
import { safeSessionStorage } from '@walletmesh/modal-core';

// Use it like regular sessionStorage, but it won't throw errors
safeSessionStorage.setItem('tempData', JSON.stringify(data));
const saved = safeSessionStorage.getItem('tempData');
```
