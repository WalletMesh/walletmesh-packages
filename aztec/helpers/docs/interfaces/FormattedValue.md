[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / FormattedValue

# Interface: FormattedValue

Defined in: [types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L33)

Formatted value for display in UI

Provides both a formatted version for display and the raw value
for copying/verification.

## Properties

### copyable

> **copyable**: `boolean`

Defined in: [types.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L41)

Whether to show a copy button for this value

***

### display

> **display**: `string`

Defined in: [types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L35)

Human-readable formatted value for display

***

### raw

> **raw**: `string`

Defined in: [types.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L38)

Original raw value (hex, decimal, etc.)
