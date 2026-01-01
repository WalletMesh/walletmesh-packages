[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseTransactionLockReturn

# Interface: UseTransactionLockReturn

Defined in: [core/modal-react/src/hooks/useTransactionLock.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useTransactionLock.ts#L25)

Return type for the useTransactionLock hook.

## Properties

### isLocked

> **isLocked**: `boolean`

Defined in: [core/modal-react/src/hooks/useTransactionLock.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useTransactionLock.ts#L27)

Whether the lock is currently held

***

### lock()

> **lock**: () => `boolean`

Defined in: [core/modal-react/src/hooks/useTransactionLock.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useTransactionLock.ts#L32)

Attempt to acquire the lock.

#### Returns

`boolean`

true if lock was acquired, false if already locked

***

### unlock()

> **unlock**: () => `void`

Defined in: [core/modal-react/src/hooks/useTransactionLock.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useTransactionLock.ts#L34)

Release the lock

#### Returns

`void`

***

### withLock()

> **withLock**: \<`T`\>(`fn`) => `Promise`\<`T`\>

Defined in: [core/modal-react/src/hooks/useTransactionLock.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useTransactionLock.ts#L40)

Execute a function with automatic lock management.
Acquires lock, executes function, releases lock on completion.

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

#### Throws

Error if lock cannot be acquired
