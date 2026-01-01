[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ConnectButtonContent

# Interface: ConnectButtonContent

Content returned by the connect button service

## Properties

### disabled

> **disabled**: `boolean`

Whether the button should be disabled

***

### displayInfo?

> `optional` **displayInfo**: `object`

Additional display information (address, chain, etc.)

#### address?

> `optional` **address**: `string`

#### chainName?

> `optional` **chainName**: `string`

#### walletName?

> `optional` **walletName**: `string`

***

### indicatorType

> **indicatorType**: `"none"` \| `"loading"` \| `"success"`

Type of indicator to show

***

### showIndicator

> **showIndicator**: `boolean`

Whether to show a status indicator (green dot, spinner, etc.)

***

### text

> **text**: `string`

Main text to display on the button
