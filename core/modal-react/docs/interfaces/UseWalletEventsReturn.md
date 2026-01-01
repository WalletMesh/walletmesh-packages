[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseWalletEventsReturn

# Interface: UseWalletEventsReturn

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L49)

Event hook return type

## Properties

### activeEvents

> **activeEvents**: `string`[]

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L70)

Currently active event subscriptions

***

### isPaused

> **isPaused**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L68)

Whether subscriptions are currently paused

***

### off()

> **off**: \<`K`\>(`event`, `handler?`) => `void`

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L57)

Unsubscribe from an event

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### handler?

[`WalletEventHandler`](../type-aliases/WalletEventHandler.md)\<[`ModalEventMap`](ModalEventMap.md)\[`K`\]\>

#### Returns

`void`

***

### on()

> **on**: \<`K`\>(`event`, `handler`, `options?`) => () => `void`

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L51)

Subscribe to a new event at runtime

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### handler

[`WalletEventHandler`](../type-aliases/WalletEventHandler.md)\<[`ModalEventMap`](ModalEventMap.md)\[`K`\]\>

##### options?

[`EventOptions`](EventOptions.md)

#### Returns

> (): `void`

##### Returns

`void`

***

### once()

> **once**: \<`K`\>(`event`, `handler`) => () => `void`

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L59)

Subscribe to an event once

#### Type Parameters

##### K

`K` *extends* keyof [`ModalEventMap`](ModalEventMap.md)

#### Parameters

##### event

`K`

##### handler

[`WalletEventHandler`](../type-aliases/WalletEventHandler.md)\<[`ModalEventMap`](ModalEventMap.md)\[`K`\]\>

#### Returns

> (): `void`

##### Returns

`void`

***

### pause()

> **pause**: () => `void`

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L64)

Pause all event subscriptions

#### Returns

`void`

***

### resume()

> **resume**: () => `void`

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L66)

Resume all event subscriptions

#### Returns

`void`
