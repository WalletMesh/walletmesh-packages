[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletEvents

# Function: useWalletEvents()

## Call Signature

> **useWalletEvents**(): [`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L203)

Wallet event subscription hook

A single, flexible API for subscribing to wallet events. Supports:
- Single event subscriptions
- Multiple event subscriptions
- One-time event subscriptions
- Runtime subscription management
- Pause/resume functionality
- Full TypeScript support

### Returns

[`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Event management functions and state

### Example

```tsx
// Single event
useWalletEvents('connection:established', (data) => {
  console.log('Connected:', data);
});

// Multiple events with object syntax
const { pause, resume } = useWalletEvents({
  'connection:established': (data) => console.log('Connected:', data),
  'connection:lost': (data) => console.log('Disconnected:', data),
  'accounts:changed': (data) => console.log('Accounts changed:', data),
});

// Array syntax with options
const { on, off } = useWalletEvents([
  ['connection:established', handleConnect],
  ['connection:lost', handleDisconnect, { once: true }],
]);

// Runtime subscription
const { on, off } = useWalletEvents();

const unsubscribe = on('chain:switched', (data) => {
  console.log('Chain switched to:', data.chainId);
});

// Later...
unsubscribe();
// or
off('chain:switched');
```

## Call Signature

> **useWalletEvents**\<`K`\>(`event`, `handler`, `options?`): [`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:204](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L204)

Wallet event subscription hook

A single, flexible API for subscribing to wallet events. Supports:
- Single event subscriptions
- Multiple event subscriptions
- One-time event subscriptions
- Runtime subscription management
- Pause/resume functionality
- Full TypeScript support

### Type Parameters

#### K

`K` *extends* keyof [`ModalEventMap`](../interfaces/ModalEventMap.md)

### Parameters

#### event

`K`

#### handler

[`WalletEventHandler`](../type-aliases/WalletEventHandler.md)\<[`ModalEventMap`](../interfaces/ModalEventMap.md)\[`K`\]\>

#### options?

[`EventOptions`](../interfaces/EventOptions.md)

### Returns

[`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Event management functions and state

### Example

```tsx
// Single event
useWalletEvents('connection:established', (data) => {
  console.log('Connected:', data);
});

// Multiple events with object syntax
const { pause, resume } = useWalletEvents({
  'connection:established': (data) => console.log('Connected:', data),
  'connection:lost': (data) => console.log('Disconnected:', data),
  'accounts:changed': (data) => console.log('Accounts changed:', data),
});

// Array syntax with options
const { on, off } = useWalletEvents([
  ['connection:established', handleConnect],
  ['connection:lost', handleDisconnect, { once: true }],
]);

// Runtime subscription
const { on, off } = useWalletEvents();

const unsubscribe = on('chain:switched', (data) => {
  console.log('Chain switched to:', data.chainId);
});

// Later...
unsubscribe();
// or
off('chain:switched');
```

## Call Signature

> **useWalletEvents**(`handlers`, `options?`): [`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:209](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L209)

Wallet event subscription hook

A single, flexible API for subscribing to wallet events. Supports:
- Single event subscriptions
- Multiple event subscriptions
- One-time event subscriptions
- Runtime subscription management
- Pause/resume functionality
- Full TypeScript support

### Parameters

#### handlers

[`EventHandlers`](../type-aliases/EventHandlers.md)

#### options?

[`EventOptions`](../interfaces/EventOptions.md)

### Returns

[`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Event management functions and state

### Example

```tsx
// Single event
useWalletEvents('connection:established', (data) => {
  console.log('Connected:', data);
});

// Multiple events with object syntax
const { pause, resume } = useWalletEvents({
  'connection:established': (data) => console.log('Connected:', data),
  'connection:lost': (data) => console.log('Disconnected:', data),
  'accounts:changed': (data) => console.log('Accounts changed:', data),
});

// Array syntax with options
const { on, off } = useWalletEvents([
  ['connection:established', handleConnect],
  ['connection:lost', handleDisconnect, { once: true }],
]);

// Runtime subscription
const { on, off } = useWalletEvents();

const unsubscribe = on('chain:switched', (data) => {
  console.log('Chain switched to:', data.chainId);
});

// Later...
unsubscribe();
// or
off('chain:switched');
```

## Call Signature

> **useWalletEvents**(`events`, `options?`): [`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:210](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletEvents.ts#L210)

Wallet event subscription hook

A single, flexible API for subscribing to wallet events. Supports:
- Single event subscriptions
- Multiple event subscriptions
- One-time event subscriptions
- Runtime subscription management
- Pause/resume functionality
- Full TypeScript support

### Parameters

#### events

[`EventConfig`](../type-aliases/EventConfig.md)\<keyof [`ModalEventMap`](../interfaces/ModalEventMap.md)\>[]

#### options?

[`EventOptions`](../interfaces/EventOptions.md)

### Returns

[`UseWalletEventsReturn`](../interfaces/UseWalletEventsReturn.md)

Event management functions and state

### Example

```tsx
// Single event
useWalletEvents('connection:established', (data) => {
  console.log('Connected:', data);
});

// Multiple events with object syntax
const { pause, resume } = useWalletEvents({
  'connection:established': (data) => console.log('Connected:', data),
  'connection:lost': (data) => console.log('Disconnected:', data),
  'accounts:changed': (data) => console.log('Accounts changed:', data),
});

// Array syntax with options
const { on, off } = useWalletEvents([
  ['connection:established', handleConnect],
  ['connection:lost', handleDisconnect, { once: true }],
]);

// Runtime subscription
const { on, off } = useWalletEvents();

const unsubscribe = on('chain:switched', (data) => {
  console.log('Chain switched to:', data.chainId);
});

// Later...
unsubscribe();
// or
off('chain:switched');
```
