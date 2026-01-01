[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isWalletMeshError

# Function: isWalletMeshError()

> **isWalletMeshError**(`error`): error is \{ category: "user" \| "wallet" \| "network" \| "general" \| "validation" \| "sandbox"; cause?: unknown; classification?: "network" \| "permission" \| "provider" \| "temporary" \| "permanent" \| "unknown"; code: string; data?: Record\<string, unknown\>; maxRetries?: number; message: string; recoveryStrategy?: "retry" \| "wait\_and\_retry" \| "manual\_action" \| "none"; retryDelay?: number \}

Check if an error is a WalletMesh ModalError

## Parameters

### error

`unknown`

Error to check

## Returns

error is \{ category: "user" \| "wallet" \| "network" \| "general" \| "validation" \| "sandbox"; cause?: unknown; classification?: "network" \| "permission" \| "provider" \| "temporary" \| "permanent" \| "unknown"; code: string; data?: Record\<string, unknown\>; maxRetries?: number; message: string; recoveryStrategy?: "retry" \| "wait\_and\_retry" \| "manual\_action" \| "none"; retryDelay?: number \}

True if error is a ModalError
