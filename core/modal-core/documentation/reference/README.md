# WalletMesh Reference Documentation

This section contains reference materials and technical specifications for WalletMesh Modal Core.

## 📚 Available References

### [Error Handling Reference](./error-handling-reference.md)
Comprehensive error codes, types, and handling strategies.
- Error code definitions
- Recovery patterns
- User-facing error messages

### [Naming Conventions](./naming-conventions.md)
Coding standards and naming conventions used throughout the project.
- File naming patterns
- Variable and function naming
- Type and interface conventions

### [SSR Guide](./ssr-guide.md)
Server-side rendering considerations and patterns.
- Framework-specific SSR support
- Hydration strategies
- State persistence

### [Testing Guide](../testing/TESTING_GUIDE.md)
Testing strategies and best practices.
- Unit testing patterns
- Integration testing
- Mock implementations

## 🔍 Quick Reference

### Error Codes
Common error codes you might encounter:
- `WALLET_NOT_FOUND` - No wallet available
- `CONNECTION_FAILED` - Connection attempt failed
- `USER_REJECTED` - User rejected the connection
- `UNSUPPORTED_CHAIN` - Chain not supported

See the [Error Handling Reference](./error-handling-reference.md) for complete list.

### Naming Patterns
- Services: `*Service` (e.g., `ConnectionService`)
- Adapters: `*Adapter` (e.g., `MetaMaskAdapter`)
- Providers: `*Provider` (e.g., `EVMProvider`)
- Managers: `*Manager` (e.g., `SessionManager`)

See [Naming Conventions](./naming-conventions.md) for details.

## 📖 Additional Resources

- [TypeDoc API Reference](../../docs/README.md) - Auto-generated API documentation
- [Architecture Documents](../architecture/README.md) - System design details
- [Developer Guides](../guides/README.md) - Role-specific guides