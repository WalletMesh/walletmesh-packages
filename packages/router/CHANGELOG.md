# @walletmesh/router

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
