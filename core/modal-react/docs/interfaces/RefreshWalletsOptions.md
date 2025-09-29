[@walletmesh/modal-react](../globals.md) / RefreshWalletsOptions

# Interface: RefreshWalletsOptions

Runtime overrides applied when requesting a discovery scan before opening the modal.

## Properties

### targetChainType?

> `optional` **targetChainType**: [`ChainType`](../enumerations/ChainType.md)

Optional chain type hint used to filter wallets before showing the modal.

### capabilities?

> `optional` **capabilities**: `object`

Capability filters merged with the provider defaults.

### capabilities.chains?

> `optional` **chains**: `string`[]

CAIP-2 chain identifiers to require from discovered wallets.

### capabilities.features?

> `optional` **features**: `string`[]

Feature flags that wallets must support.

### capabilities.interfaces?

> `optional` **interfaces**: `string`[]

Interface identifiers used by discovery templates.

### technologies?

> `optional` **technologies**: `object`[]

Discovery technology templates describing chain type, interfaces, and features.

### technologies[].type

> **type**: [`ChainType`](../enumerations/ChainType.md) \| "evm" \| "solana" \| "aztec"

### technologies[].interfaces?

> `optional` **interfaces**: `string`[]

### technologies[].features?

> `optional` **features**: `string`[]

