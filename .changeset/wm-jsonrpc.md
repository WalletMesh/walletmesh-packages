---
"@walletmesh/jsonrpc": minor
---

This version introduces significant improvements to the core JSON-RPC handling and transport layer.

-   Added `JSONRPCProxy`, a new class for transparently forwarding JSON-RPC messages with low overhead, including support for request timeouts and health monitoring.
-   Refactored `MethodManager` to improve serialization handling.
-   Enhanced the `JSONRPCTransport` interface to be explicitly bidirectional, requiring an `onMessage` handler for receiving messages. This enables more robust communication patterns.
