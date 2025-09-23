[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecEvents

# Function: useAztecEvents()

> **useAztecEvents**(`contractAddress?`, `artifact?`, `eventName?`, `autoSubscribe?`): [`UseAztecEventsReturn`](../interfaces/UseAztecEventsReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecEvents.ts#L148)

Hook for subscribing to Aztec contract events

This hook provides real-time event subscriptions and historical event
queries for Aztec contracts. It automatically manages subscriptions
and cleans up when the component unmounts.

## Parameters

### contractAddress?

`unknown`

The contract address to watch (optional)

### artifact?

The contract artifact containing event definitions (optional)

`null` | `ContractArtifact`

### eventName?

Name of the event to subscribe to (optional)

`null` | `string`

### autoSubscribe?

`boolean` = `true`

Whether to automatically start subscription (default: true)

## Returns

[`UseAztecEventsReturn`](../interfaces/UseAztecEventsReturn.md)

Event subscription functions and state

## Since

1.0.0

## Remarks

The hook provides:
- Real-time event subscriptions with automatic polling
- Historical event queries with block range filtering
- Private event queries for encrypted events
- Automatic cleanup on unmount
- Loading and error state management

Events are accumulated in the events array, with new events
appended as they arrive. Use clearEvents() to reset.

## Examples

```tsx
import { useAztecEvents } from '@walletmesh/modal-react';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function TokenEvents({ tokenAddress }) {
  const {
    events,
    isListening,
    subscribe,
    unsubscribe,
    queryHistorical
  } = useAztecEvents(
    tokenAddress,
    TokenContractArtifact,
    'Transfer'
  );

  // Query last 100 blocks on mount
  useEffect(() => {
    queryHistorical({ fromBlock: -100 });
  }, []);

  return (
    <div>
      <button onClick={isListening ? unsubscribe : subscribe}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>

      <h3>Transfer Events ({events.length})</h3>
      {events.map((event, i) => (
        <div key={i}>
          From: {event.from} To: {event.to} Amount: {event.amount}
        </div>
      ))}
    </div>
  );
}
```

```tsx
// Private events with manual subscription
function PrivateEvents({ contractAddress, artifact }) {
  const { aztecWallet } = useAztecWallet();
  const {
    events,
    queryPrivate,
    isLoading
  } = useAztecEvents(
    contractAddress,
    artifact,
    'PrivateTransfer',
    false // Don't auto-subscribe
  );

  const loadMyEvents = async () => {
    const myAddress = wallet.getAddress();
    const privateEvents = await queryPrivate([myAddress]);
    console.log('My private events:', privateEvents);
  };

  return (
    <button onClick={loadMyEvents} disabled={isLoading}>
      Load My Private Events
    </button>
  );
}
```
