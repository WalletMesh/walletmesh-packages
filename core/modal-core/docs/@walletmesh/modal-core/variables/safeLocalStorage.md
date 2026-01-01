[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / safeLocalStorage

# Variable: safeLocalStorage

> `const` **safeLocalStorage**: `Storage`

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
