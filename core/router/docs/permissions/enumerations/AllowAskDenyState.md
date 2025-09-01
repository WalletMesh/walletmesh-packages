[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / AllowAskDenyState

# Enumeration: AllowAskDenyState

Defined in: [core/router/src/permissions/allowAskDeny.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/permissions/allowAskDeny.ts#L38)

Permission states for the three-state permission model.
Each method can be in one of these three states.

## Enumeration Members

### ALLOW

> **ALLOW**: `"allow"`

Defined in: [core/router/src/permissions/allowAskDeny.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/permissions/allowAskDeny.ts#L40)

Method is always allowed without prompting

***

### ASK

> **ASK**: `"ask"`

Defined in: [core/router/src/permissions/allowAskDeny.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/permissions/allowAskDeny.ts#L44)

User should be prompted for permission each time

***

### DENY

> **DENY**: `"deny"`

Defined in: [core/router/src/permissions/allowAskDeny.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/permissions/allowAskDeny.ts#L42)

Method is always denied without prompting
