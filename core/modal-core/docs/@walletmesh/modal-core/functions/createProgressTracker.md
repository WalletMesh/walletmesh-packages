[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createProgressTracker

# Function: createProgressTracker()

> **createProgressTracker**(): [`ConnectionProgressTracker`](../classes/ConnectionProgressTracker.md)

Create a connection progress tracker

## Returns

[`ConnectionProgressTracker`](../classes/ConnectionProgressTracker.md)

New connection progress tracker instance

## Example

```typescript
const tracker = createProgressTracker();

// Update to connecting stage
const progress = tracker.updateStage('connecting', 'Connecting to MetaMask...');
console.log(progress);
// { progress: 40, stage: 'connecting', step: 'Connecting to wallet...', details: 'Connecting to MetaMask...' }

// Check if in progress
console.log(tracker.isInProgress()); // true

// Update to connected
tracker.updateStage('connected');
console.log(tracker.isComplete()); // true
```
