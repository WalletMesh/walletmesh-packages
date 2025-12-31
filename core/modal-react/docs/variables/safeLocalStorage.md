[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / safeLocalStorage

# Variable: safeLocalStorage

> `const` **safeLocalStorage**: `Storage`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:244

Safe localStorage instance

## Remarks

Pre-created safe localStorage wrapper that can be used anywhere without
worrying about SSR or browser compatibility issues

## Example

```typescript
import { safeLocalStorage } from '@walletmesh/modal-core';

// Use it like regular localStorage, but it won't throw errors
safeLocalStorage.setItem('theme', 'dark');
const theme = safeLocalStorage.getItem('theme') || 'light';
```
