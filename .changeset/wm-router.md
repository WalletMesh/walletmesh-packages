---
"@walletmesh/router": minor
---

The router has been refactored to be more flexible and transport-agnostic.

-   **BREAKING CHANGE**: The `WalletRouter` now accepts a map of `JSONRPCTransport` instances instead of `WalletClient` implementations. This decouples the router from wallet-specific logic.
-   Internally, the router now uses `JSONRPCProxy` for each registered wallet transport, improving request handling and timeout management.
-   Added a `ProviderSerializerRegistry` to `WalletRouterProvider` to manage method-specific parameter serialization on the client-side automatically.
-   Introduced `createLocalTransportPair` utility for creating in-process, bidirectionally connected transports, simplifying testing and embedded wallet setups.
