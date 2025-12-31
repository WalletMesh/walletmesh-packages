[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecEvents

# Function: useAztecEvents()

> **useAztecEvents**(`contractAddress?`, `artifact?`, `eventName?`, `autoSubscribe?`): [`UseAztecEventsReturn`](../interfaces/UseAztecEventsReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecEvents.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecEvents.ts#L174)

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

`boolean` = `false`

Whether to automatically start subscription (default: false)

## Returns

[`UseAztecEventsReturn`](../interfaces/UseAztecEventsReturn.md)

Event subscription functions and state

## Since

1.0.0

## Remarks

**IMPORTANT:** Event subscriptions are now opt-in by default (autoSubscribe: false).
Call `subscribe()` manually or set autoSubscribe to true to enable automatic subscription.
This prevents unnecessary event polling when subscriptions aren't needed.

The hook provides:
- Real-time event subscriptions with automatic polling
- Historical event queries with block range filtering
- Private event queries for encrypted events
- Automatic cleanup on unmount
- Loading and error state management

Events are accumulated in the events array, with new events
appended as they arrive. Use clearEvents() to reset.

**Migration Note:** If you were relying on automatic subscription (v1 behavior),
either call `subscribe()` in useEffect or pass `autoSubscribe: true`.

## Examples

```tsx
import { useAztecEvents } from '@walletmesh/modal-react';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

// Opt-in subscription (recommended)
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
    // autoSubscribe defaults to false - call subscribe() manually
  );

  // Query last 100 blocks and optionally start subscription
  useEffect(() => {
    queryHistorical({ fromBlock: -100 });
    // Manually subscribe when needed
    // subscribe();
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
// Auto-subscribe (legacy v1 behavior)
function AutoSubscribeExample({ tokenAddress }) {
  const { events, isListening } = useAztecEvents(
    tokenAddress,
    TokenContractArtifact,
    'Transfer',
    true  // Pass true to auto-subscribe on mount
  );

  return <div>Events: {events.length} (auto-subscribed: {isListening})</div>;
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
