[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / RouterEventMap

# Interface: RouterEventMap

Router event map for bi-directional communication
Defines events that can be emitted by the router

## Hierarchy

- `JSONRPCEventMap`

  ↳ **`RouterEventMap`**

## Indexable

▪ [event: `string`]: `unknown`

## Table of contents

### Properties

- [wm\_permissionsChanged](RouterEventMap.md#wm_permissionschanged)
- [wm\_sessionTerminated](RouterEventMap.md#wm_sessionterminated)
- [wm\_walletStateChanged](RouterEventMap.md#wm_walletstatechanged)

## Properties

### wm\_permissionsChanged

• **wm\_permissionsChanged**: `Object`

Emitted when a session's permissions are updated

#### Type declaration

| Name | Type |
| :------ | :------ |
| `permissions` | [`ChainPermissions`](../modules.md#chainpermissions) |
| `sessionId` | `string` |

#### Defined in

[packages/router/src/types.ts:225](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L225)

___

### wm\_sessionTerminated

• **wm\_sessionTerminated**: `Object`

Emitted when a session is terminated by the router

#### Type declaration

| Name | Type |
| :------ | :------ |
| `reason` | `string` |
| `sessionId` | `string` |

#### Defined in

[packages/router/src/types.ts:233](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L233)

___

### wm\_walletStateChanged

• **wm\_walletStateChanged**: `Object`

Emitted when a wallet's state changes (e.g., account changes, network changes)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `chainId` | `string` |
| `changes` | \{ `[key: string]`: `unknown`; `accounts?`: `string`[] ; `networkId?`: `string`  } |
| `changes.accounts?` | `string`[] |
| `changes.networkId?` | `string` |

#### Defined in

[packages/router/src/types.ts:213](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L213)
