# @walletmesh/router

## 0.5.3

### Patch Changes

- 3bbe9b2: Add modal-core and modal-react packages
- Updated dependencies [3bbe9b2]
  - @walletmesh/jsonrpc@0.5.3

## 0.5.2

### Patch Changes

- d63428d: This release introduces comprehensive error handling improvements to both the JSON-RPC and Router packages
- Updated dependencies [d63428d]
  - @walletmesh/jsonrpc@0.5.2

## 0.5.1

### Patch Changes

- 29a725f: Make the `ask` callback for the AllowAskDeny permission manager async

## 0.5.0

### Minor Changes

- cb714b7: The router has been refactored to be more flexible and transport-agnostic.

  - **BREAKING CHANGE**: The `WalletRouter` now accepts a map of `JSONRPCTransport` instances instead of `WalletClient` implementations. This decouples the router from wallet-specific logic.
  - Internally, the router now uses `JSONRPCProxy` for each registered wallet transport, improving request handling and timeout management.
  - Added a `ProviderSerializerRegistry` to `WalletRouterProvider` to manage method-specific parameter serialization on the client-side automatically.
  - Introduced `createLocalTransportPair` utility for creating in-process, bidirectionally connected transports, simplifying testing and embedded wallet setups.

### Patch Changes

- Updated dependencies [cb714b7]
  - @walletmesh/jsonrpc@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [937a416]
  - @walletmesh/jsonrpc@0.4.0

## 0.3.0

### Minor Changes

- 8bd3463: chore: Add aztec-specific packages to the monorepo & rename the git repository

### Patch Changes

- Updated dependencies [8bd3463]
  - @walletmesh/jsonrpc@0.3.0

## 0.2.7

### Patch Changes

- a301044: fix: type for JSONRPCNode in JSONRPCWalletClient

## 0.2.6

### Patch Changes

- 519bfb4: fix wm_call and wm_bulkCall result types

## 0.2.5

### Patch Changes

- 029833d: fix: type safety for method calls

## 0.2.4

### Patch Changes

- ff7e359: add operation builder

## 0.2.3

### Patch Changes

- 620c313: fix missing export WalletRouterProvider

## 0.2.2

### Patch Changes

- e2f8350: rename Transport -> JSONRPCTransport & make `JSONRPCTransport.send()` async
- Updated dependencies [e2f8350]
  - @walletmesh/jsonrpc@0.2.2

## 0.2.1

### Patch Changes

- a9df9bb: rework router permission system
- Updated dependencies [a9df9bb]
  - @walletmesh/jsonrpc@0.2.1

## 0.2.0

### Minor Changes

- 24d804c: Major refactor and enhancement of the JSON-RPC implementation and router:

  @walletmesh/jsonrpc:

  - Add MessageValidator and ParameterSerializer components
  - Rework middleware system
  - Improved error handling with standardized codes & more context
  - Separate method handlers from serializers
  - Add support for fallback method handlers & serializers
  - Improved type safety

  @walletmesh/router:

  - Update session management and permission system

### Patch Changes

- Updated dependencies [24d804c]
  - @walletmesh/jsonrpc@0.2.0

## 0.1.6

### Patch Changes

- 5573539: feat: dynamically add/remove wallets for the WalletRouter

## 0.1.5

### Patch Changes

- 06ce1e7: feat!(router): wm_getSupportMethods now returns an array of strings

## 0.1.4

### Patch Changes

- 40d9ac7: fix(router): make the JSONRPCWalletClient generic

## 0.1.3

### Patch Changes

- 4d47958: fix(jsonrpc): correcth andling of no parameters
- Updated dependencies [4d47958]
  - @walletmesh/jsonrpc@0.1.3

## 0.1.2

### Patch Changes

- 9f85e4a: chore(jsonrpc): types->interfaces in a few places
- Updated dependencies [9f85e4a]
  - @walletmesh/jsonrpc@0.1.2

## 0.1.1

### Patch Changes

- ee1868b: fix(jsonrpc): fix export
- Updated dependencies [ee1868b]
  - @walletmesh/jsonrpc@0.1.1

## 0.1.0

### Minor Changes

- 9c220ba: feat!(jsonrpc): Update jsonrpc library to enable full bidirectional communications

### Patch Changes

- Updated dependencies [9c220ba]
  - @walletmesh/jsonrpc@0.1.0
