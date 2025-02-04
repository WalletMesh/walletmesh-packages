[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / AllowAskDenyState

# Enumeration: AllowAskDenyState

Permission states for the three-state permission model.
Each method can be in one of these three states.

## Enumeration Members

### ALLOW

> **ALLOW**: `"allow"`

Method is always allowed without prompting

#### Defined in

[packages/router/src/permissions/allowAskDeny.ts:40](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/permissions/allowAskDeny.ts#L40)

***

### ASK

> **ASK**: `"ask"`

User should be prompted for permission each time

#### Defined in

[packages/router/src/permissions/allowAskDeny.ts:44](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/permissions/allowAskDeny.ts#L44)

***

### DENY

> **DENY**: `"deny"`

Method is always denied without prompting

#### Defined in

[packages/router/src/permissions/allowAskDeny.ts:42](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/permissions/allowAskDeny.ts#L42)
