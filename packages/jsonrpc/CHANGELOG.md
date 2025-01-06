# @walletmesh/jsonrpc

## 0.2.2

### Patch Changes

- e2f8350: rename Transport -> JSONRPCTransport & make `JSONRPCTransport.send()` async

## 0.2.1

### Patch Changes

- a9df9bb: rework router permission system

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

## 0.1.3

### Patch Changes

- 4d47958: fix(jsonrpc): correcth andling of no parameters

## 0.1.2

### Patch Changes

- 9f85e4a: chore(jsonrpc): types->interfaces in a few places

## 0.1.1

### Patch Changes

- ee1868b: fix(jsonrpc): fix export

## 0.1.0

### Minor Changes

- 9c220ba: feat!(jsonrpc): Update jsonrpc library to enable full bidirectional communications
