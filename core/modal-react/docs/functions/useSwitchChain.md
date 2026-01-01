[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSwitchChain

# Function: useSwitchChain()

> **useSwitchChain**(`options`): [`UseSwitchChainReturn`](../interfaces/UseSwitchChainReturn.md)

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:294](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSwitchChain.ts#L294)

Consolidated hook for switching blockchain networks and ensuring correct chain

Provides methods to switch chains with validation, ensure correct chain
before operations, loading states, and error handling.

## Parameters

### options

[`UseSwitchChainOptions`](../interfaces/UseSwitchChainOptions.md) = `{}`

Hook options for callbacks

## Returns

[`UseSwitchChainReturn`](../interfaces/UseSwitchChainReturn.md)

Chain switching and validation methods and state

## Since

2.0.0

## See

 - [useAccount](useAccount.md) - For account and chain state
 - [useConnect](useConnect.md) - For initial wallet connection
 - [useTransaction](useTransaction.md) - For chain-specific transactions

## Remarks

This hook consolidates chain switching and validation functionality.
It handles chain switching across different wallet types and includes
validation to ensure the target chain is supported. The ensureChain
method provides automatic switching when needed.

Chain switching flow:
1. Validate wallet connection
2. Check chain support
3. Call confirmation callback (if provided)
4. Switch chain via wallet
5. Update session state
6. Call success callback (if provided)

## Examples

```tsx
function ChainManager() {
  const {
    switchChain,
    ensureChain,
    chainId,
    chains,
    isSwitching,
    error
  } = useSwitchChain();

  const handleEthereumAction = async () => {
    // Ensure user is on Ethereum mainnet
    await ensureChain('0x1', { autoSwitch: true });
    // Proceed with Ethereum-specific action
  };

  return (
    <div>
      <p>Current Chain: {chainId}</p>
      {error && <p>Error: {error.message}</p>}

      <select
        value={chainId || ''}
        onChange={(e) => switchChain(e.target.value)}
        disabled={isSwitching}
      >
        {chains.map(chain => (
          <option key={chain.chainId} value={chain.chainId}>
            {chain.name}
          </option>
        ))}
      </select>

      <button onClick={handleEthereumAction}>
        Ethereum Action
      </button>
    </div>
  );
}
```

```tsx
// Validate chain before operation
function ChainSpecificFeature() {
  const { validateChain, ensureChain } = useSwitchChain();

  const handlePolygonTransaction = async () => {
    // Check chain without auto-switching
    const result = validateChain('0x89');

    if (!result.isCorrectChain) {
      if (confirm('Switch to Polygon to continue?')) {
        await ensureChain('0x89', { autoSwitch: true });
      }
      return;
    }

    // Proceed with Polygon transaction
  };

  return (
    <button onClick={handlePolygonTransaction}>
      Polygon Transaction
    </button>
  );
}
```
