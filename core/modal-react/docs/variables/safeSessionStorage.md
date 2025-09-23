[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / safeSessionStorage

# Variable: safeSessionStorage

> `const` **safeSessionStorage**: `Storage`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:259

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
