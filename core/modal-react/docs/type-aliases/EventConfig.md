[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EventConfig

# Type Alias: EventConfig\<K\>

> **EventConfig**\<`K`\> = `K` \| \[`K`, [`WalletEventHandler`](WalletEventHandler.md)\<[`ModalEventMap`](../interfaces/ModalEventMap.md)\[`K`\]\>\] \| \[`K`, [`WalletEventHandler`](WalletEventHandler.md)\<[`ModalEventMap`](../interfaces/ModalEventMap.md)\[`K`\]\>, [`EventOptions`](../interfaces/EventOptions.md)\]

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletEvents.ts#L34)

Event subscription configuration

## Type Parameters

### K

`K` *extends* keyof [`ModalEventMap`](../interfaces/ModalEventMap.md) = keyof [`ModalEventMap`](../interfaces/ModalEventMap.md)
