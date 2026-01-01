[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ethereumMainnet

# Variable: ethereumMainnet

> `const` **ethereumMainnet**: [`SupportedChain`](../type-aliases/SupportedChain.md)

Defined in: core/modal-core/dist/chains/ethereum.d.ts:22

Ethereum mainnet configuration

## Example

```typescript
import { ethereumMainnet } from '@walletmesh/modal/chains';

const config: SupportedChainsConfig = {
  chainsByTech: {
    [ChainType.Evm]: [ethereumMainnet]
  }
};
```
