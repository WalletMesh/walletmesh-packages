---
"@walletmesh/jsonrpc": minor
"@walletmesh/router": minor
---

Major refactor and enhancement of the JSON-RPC implementation and router:

@walletmesh/jsonrpc:
- Add MessageValidator and ParameterSerializer components
- Rework middleware system
- Improved error handling with standardized codes & more context
- Separate method handlers from serializers
- Add support for fallback method handlers & serializers
- Improved type safety

@walletmesh/router:
- Update session management and permission system
