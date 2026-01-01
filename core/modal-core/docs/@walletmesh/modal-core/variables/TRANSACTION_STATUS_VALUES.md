[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TRANSACTION\_STATUS\_VALUES

# Variable: TRANSACTION\_STATUS\_VALUES

> `const` **TRANSACTION\_STATUS\_VALUES**: readonly \[`"idle"`, `"initiated"`, `"simulating"`, `"proving"`, `"sending"`, `"pending"`, `"confirming"`, `"confirmed"`, `"failed"`\]

Transaction status values for full lifecycle tracking.

Uses Aztec-native terminology:
- 'idle' - transaction created but not yet started
- 'initiated' - transaction has been received and ID generated (backend-only)
- 'simulating' aligns with Aztec's simulate() method
- 'proving' is unique to zero-knowledge systems
- 'sending' aligns with Aztec's send() method
- 'pending' is standard for awaiting confirmation
