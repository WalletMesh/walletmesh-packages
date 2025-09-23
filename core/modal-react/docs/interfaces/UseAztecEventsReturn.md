[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecEventsReturn

# Interface: UseAztecEventsReturn

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L29)

Event subscription hook return type

## Properties

### clearEvents()

> **clearEvents**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L47)

Clear all events from state

#### Returns

`void`

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L37)

Any error that occurred

***

### events

> **events**: `unknown`[]

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L31)

Array of events received (real-time + historical)

***

### isListening

> **isListening**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L33)

Whether currently listening for events

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L35)

Whether loading historical events

***

### queryHistorical()

> **queryHistorical**: (`options?`) => `Promise`\<`unknown`[]\>

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L43)

Query historical events

#### Parameters

##### options?

[`EventQueryOptions`](EventQueryOptions.md)

#### Returns

`Promise`\<`unknown`[]\>

***

### queryPrivate()

> **queryPrivate**: (`recipients`, `options?`) => `Promise`\<`unknown`[]\>

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L45)

Query private events

#### Parameters

##### recipients

`unknown`[]

##### options?

[`EventQueryOptions`](EventQueryOptions.md)

#### Returns

`Promise`\<`unknown`[]\>

***

### subscribe()

> **subscribe**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L39)

Start listening for events

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L41)

Stop listening for events

#### Returns

`void`
