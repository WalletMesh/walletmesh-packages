# Service Sequence Diagrams

This document provides detailed sequence diagrams for key service interactions in WalletMesh Modal Core.

## Wallet Connection Sequence

```mermaid
sequenceDiagram
    participant User
    participant Modal
    participant ConnectionService
    participant ChainService
    participant WalletPreferenceService
    participant BalanceService
    participant Store

    User->>Modal: Click Connect
    Modal->>ConnectionService: connect(walletId, provider)
    
    Note over ConnectionService: Validate wallet & provider
    
    ConnectionService->>ChainService: validateChain(chainId, provider)
    ChainService-->>ConnectionService: ValidationResult
    
    alt Chain Valid
        ConnectionService->>Store: createSession(sessionData)
        Store-->>ConnectionService: sessionId
        
        ConnectionService->>WalletPreferenceService: recordConnection(walletId)
        WalletPreferenceService-->>ConnectionService: Updated preferences
        
        ConnectionService->>BalanceService: fetchInitialBalances(account, chainId)
        BalanceService-->>ConnectionService: Balance data
        
        ConnectionService-->>Modal: ConnectionSuccess
        Modal->>User: Show connected state
    else Chain Invalid
        ConnectionService-->>Modal: ChainError
        Modal->>User: Show error message
    end
```

## Transaction Execution Sequence

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant TransactionService
    participant ChainService
    participant DAppRpcService
    participant Store

    User->>UI: Submit transaction
    UI->>TransactionService: sendTransaction(params)
    
    Note over TransactionService: Validate parameters
    
    TransactionService->>ChainService: getChainConfig(chainId)
    ChainService-->>TransactionService: Chain configuration
    
    TransactionService->>TransactionService: estimateGas(params)
    
    TransactionService->>Store: addTransaction(pending)
    
    TransactionService->>DAppRpcService: sendRequest(eth_sendTransaction)
    
    alt Transaction Sent
        DAppRpcService-->>TransactionService: txHash
        TransactionService->>Store: updateTransaction(broadcasting)
        
        loop Monitor confirmation
            TransactionService->>DAppRpcService: getTransactionReceipt(txHash)
            DAppRpcService-->>TransactionService: Receipt or null
            
            alt Confirmed
                TransactionService->>Store: updateTransaction(confirmed)
                TransactionService-->>UI: TransactionSuccess
            else Pending
                Note over TransactionService: Wait and retry
            end
        end
    else Transaction Failed
        DAppRpcService-->>TransactionService: Error
        TransactionService->>Store: updateTransaction(failed)
        TransactionService-->>UI: TransactionError
    end
```

## Chain Switching Sequence

```mermaid
sequenceDiagram
    participant User
    participant Modal
    participant ChainService
    participant ConnectionService
    participant DAppRpcService
    participant BalanceService
    participant Store

    User->>Modal: Select new chain
    Modal->>ChainService: switchChain(targetChainId)
    
    ChainService->>ChainService: validateTargetChain(targetChainId)
    
    alt Chain Supported
        ChainService->>ConnectionService: getActiveSession()
        ConnectionService-->>ChainService: Session & Provider
        
        ChainService->>DAppRpcService: sendRequest(wallet_switchEthereumChain)
        
        alt Switch Successful
            DAppRpcService-->>ChainService: Success
            
            ChainService->>Store: updateSessionChain(chainId)
            
            ChainService->>BalanceService: clearBalances()
            ChainService->>BalanceService: fetchBalances(newChainId)
            BalanceService-->>ChainService: New balances
            
            ChainService-->>Modal: ChainSwitchSuccess
            Modal->>User: Update UI
        else User Rejected
            DAppRpcService-->>ChainService: UserRejectedError
            ChainService-->>Modal: UserCancelled
        else Chain Not Added
            DAppRpcService-->>ChainService: ChainNotAddedError
            ChainService->>Modal: PromptAddChain
            Modal->>User: Show add chain dialog
        end
    else Chain Not Supported
        ChainService-->>Modal: ChainNotSupported
        Modal->>User: Show error
    end
```

## Balance Fetching Sequence

```mermaid
sequenceDiagram
    participant Component
    participant BalanceService
    participant ChainService
    participant DAppRpcService
    participant Cache
    participant Store

    Component->>BalanceService: getBalance(account, chainId)
    
    BalanceService->>Cache: checkCache(account, chainId)
    
    alt Cache Hit & Fresh
        Cache-->>BalanceService: Cached balance
        BalanceService-->>Component: Balance data
    else Cache Miss or Stale
        BalanceService->>ChainService: getChainInfo(chainId)
        ChainService-->>BalanceService: Chain details
        
        par Fetch Native Balance
            BalanceService->>DAppRpcService: eth_getBalance(account)
            DAppRpcService-->>BalanceService: Native balance
        and Fetch Token Balances
            BalanceService->>DAppRpcService: multicall(tokenBalances)
            DAppRpcService-->>BalanceService: Token balances
        end
        
        BalanceService->>Cache: updateCache(balances)
        BalanceService->>Store: updateBalances(balances)
        
        BalanceService-->>Component: Balance data
    end
    
    opt Auto-refresh enabled
        loop Every 30 seconds
            BalanceService->>BalanceService: refreshBalance()
        end
    end
```

## Service Initialization Sequence

```mermaid
sequenceDiagram
    participant Client
    participant ServiceRegistry
    participant ConnectionService
    participant ChainService
    participant TransactionService
    participant BalanceService
    participant DAppRpcService
    participant WalletPreferenceService

    Client->>ServiceRegistry: new ServiceRegistry(dependencies)
    
    ServiceRegistry->>ConnectionService: new(dependencies)
    ConnectionService->>ConnectionService: initialize()
    ConnectionService-->>ServiceRegistry: Ready
    
    ServiceRegistry->>ChainService: new(dependencies)
    ChainService->>ChainService: loadChainConfigs()
    ChainService-->>ServiceRegistry: Ready
    
    ServiceRegistry->>TransactionService: new(dependencies)
    TransactionService-->>ServiceRegistry: Ready
    
    ServiceRegistry->>BalanceService: new(dependencies)
    BalanceService->>BalanceService: initializeCache()
    BalanceService-->>ServiceRegistry: Ready
    
    ServiceRegistry->>DAppRpcService: new(dependencies)
    DAppRpcService-->>ServiceRegistry: Ready
    
    ServiceRegistry->>WalletPreferenceService: new(dependencies)
    WalletPreferenceService->>WalletPreferenceService: loadPreferences()
    WalletPreferenceService-->>ServiceRegistry: Ready
    
    ServiceRegistry-->>Client: Services ready
```

## Error Handling Sequence

```mermaid
sequenceDiagram
    participant Service
    participant ErrorFactory
    participant ErrorHandler
    participant Store
    participant UI

    Service->>Service: Operation fails
    
    Service->>ErrorFactory: createError(type, message, data)
    ErrorFactory->>ErrorFactory: categorizeError()
    ErrorFactory->>ErrorFactory: determineRecovery()
    ErrorFactory-->>Service: ModalError
    
    Service->>ErrorHandler: handleError(modalError)
    
    ErrorHandler->>ErrorHandler: analyzeError()
    
    alt Recoverable Error
        ErrorHandler->>ErrorHandler: applyRecoveryStrategy()
        
        alt Recovery Successful
            ErrorHandler->>Service: retry()
            Service->>Service: retryOperation()
        else Recovery Failed
            ErrorHandler->>Store: setError(modalError)
            Store->>UI: Update error state
            UI->>UI: Show error to user
        end
    else Fatal Error
        ErrorHandler->>Store: setError(modalError)
        ErrorHandler->>Store: closeModal()
        Store->>UI: Update state
        UI->>UI: Show fatal error
    end
```

## Multi-Chain Session Management

```mermaid
sequenceDiagram
    participant User
    participant Modal
    participant ConnectionService
    participant ChainServiceRegistry
    participant EVMService
    participant SolanaService
    participant Store

    User->>Modal: Connect multi-chain wallet
    
    Modal->>ConnectionService: connectMultiChain(walletId)
    
    ConnectionService->>ChainServiceRegistry: getSupportedChains(walletId)
    ChainServiceRegistry-->>ConnectionService: [EVM, Solana]
    
    par EVM Connection
        ConnectionService->>EVMService: connect(provider)
        EVMService->>EVMService: getAccounts()
        EVMService-->>ConnectionService: EVM accounts
    and Solana Connection
        ConnectionService->>SolanaService: connect(provider)
        SolanaService->>SolanaService: getAccounts()
        SolanaService-->>ConnectionService: Solana accounts
    end
    
    ConnectionService->>Store: createMultiChainSession({
        evm: evmAccounts,
        solana: solanaAccounts
    })
    
    Store-->>ConnectionService: sessionId
    
    ConnectionService-->>Modal: MultiChainConnected
    Modal->>User: Show all connected chains
```

## Service Disposal Sequence

```mermaid
sequenceDiagram
    participant Client
    participant ServiceRegistry
    participant ConnectionService
    participant ChainService
    participant TransactionService
    participant BalanceService
    participant DAppRpcService
    participant WalletPreferenceService

    Client->>ServiceRegistry: dispose()
    
    ServiceRegistry->>ConnectionService: dispose()
    ConnectionService->>ConnectionService: cleanupSessions()
    ConnectionService->>ConnectionService: removeListeners()
    ConnectionService-->>ServiceRegistry: Disposed
    
    ServiceRegistry->>ChainService: dispose()
    ChainService->>ChainService: clearCache()
    ChainService-->>ServiceRegistry: Disposed
    
    ServiceRegistry->>TransactionService: dispose()
    TransactionService->>TransactionService: cancelPendingTx()
    TransactionService-->>ServiceRegistry: Disposed
    
    ServiceRegistry->>BalanceService: dispose()
    BalanceService->>BalanceService: stopPolling()
    BalanceService->>BalanceService: clearCache()
    BalanceService-->>ServiceRegistry: Disposed
    
    ServiceRegistry->>DAppRpcService: dispose()
    DAppRpcService->>DAppRpcService: closeConnections()
    DAppRpcService-->>ServiceRegistry: Disposed
    
    ServiceRegistry->>WalletPreferenceService: dispose()
    WalletPreferenceService->>WalletPreferenceService: savePreferences()
    WalletPreferenceService-->>ServiceRegistry: Disposed
    
    ServiceRegistry->>ServiceRegistry: clearReferences()
    ServiceRegistry-->>Client: All services disposed
```

## Key Interaction Patterns

### 1. Request-Response Pattern
Most service interactions follow a request-response pattern with error handling:
- Service A calls Service B method
- Service B processes and returns result or throws error
- Service A handles response or error appropriately

### 2. Event-Driven Updates
Some interactions use events for loose coupling:
- Service emits event when state changes
- Other services or UI components listen and react
- No direct dependencies between event source and listeners

### 3. Cache-First Pattern
Services like BalanceService use caching to improve performance:
- Check cache before making external calls
- Update cache after successful fetches
- Invalidate cache on relevant state changes

### 4. Retry with Backoff
Critical operations implement retry logic:
- Initial attempt
- Exponential backoff on failure
- Maximum retry limit
- Final error if all retries fail

## Performance Optimization Points

1. **Parallel Operations**: Services execute independent operations in parallel (e.g., fetching balances for multiple tokens)

2. **Lazy Loading**: Services load data only when needed (e.g., chain configs loaded on first use)

3. **Debouncing**: Rapid repeated calls are debounced (e.g., balance refresh requests)

4. **Resource Pooling**: Connections are reused where possible (e.g., RPC connections)

## Testing Considerations

When testing these sequences:

1. **Mock External Calls**: Mock RPC providers and external services
2. **Test Error Paths**: Ensure error cases are properly handled
3. **Verify State Updates**: Check that store is updated correctly
4. **Test Async Flows**: Handle promises and async operations properly
5. **Check Cleanup**: Verify resources are properly disposed