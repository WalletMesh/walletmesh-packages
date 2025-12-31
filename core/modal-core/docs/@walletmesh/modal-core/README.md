[**@walletmesh/modal-core v0.0.3**](../../README.md)

***

[@walletmesh/modal-core](../../modules.md) / @walletmesh/modal-core

# @walletmesh/modal-core

WalletMesh Modal Core

A framework-agnostic, type-safe library for connecting web applications to blockchain wallets
through modal interfaces. Supports multiple blockchain ecosystems with clean, modular architecture.

## Features
- 🔗 **Multi-chain support**: EVM, Solana, Aztec
- 🎨 **Framework agnostic**: React, Vue, Svelte, vanilla JS
- 📱 **Multiple transports**: Popup, iframe, extension
- 🛡️ **Type-safe**: Full TypeScript support
- 🔄 **Error recovery**: Built-in retry and recovery mechanisms
- 📦 **Modular**: Use only what you need

## Documentation

- Integration Patterns - Common usage patterns and best practices
- Architecture - System design and component overview
- API Reference - Complete API documentation

## Examples

```ts
// Create wallet client with sensible defaults
import { createWalletMeshClient, ChainType } from '@walletmesh/modal-core';

const client = createWalletMeshClient('My DApp', {
  chains: [
    { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum' }
  ]
});

await client.initialize();

// Access business logic services
const services = client.getServices();
const connectionResult = services.connection.validateConnectionParams('metamask');
const chainResult = services.chain.switchChain(provider, '1');

// Connect to wallet
const connection = await client.connect('metamask', { chainId: '1' });
```

```ts
// Complete setup with all services
import { createCompleteWalletSetup } from '@walletmesh/modal-core';

const { client, connectionManager, discoveryService, eventSystem } = createCompleteWalletSetup({
  client: {
    appName: 'My DApp',
    chains: [{ chainId: '1', chainType: 'evm', name: 'Ethereum' }]
  },
  connectionRecovery: { autoReconnect: true },
  discovery: { enabled: true },
  events: { maxHistorySize: 1000 }
});

await client.initialize();
```

```ts
// Service-driven error handling
try {
  const services = client.getServices();
  const validation = services.connection.validateConnectionParams('metamask');

  if (validation.isValid) {
    await client.connect('metamask');
  }
} catch (error) {
  console.error('Connection error:', error);
  // ErrorFactory provides structured error handling
}
```

## Enumerations

- [ChainType](enumerations/ChainType.md)
- [ConnectionStatus](enumerations/ConnectionStatus.md)
- [ErrorType](enumerations/ErrorType.md)
- [LogLevel](enumerations/LogLevel.md)
- [TransportType](enumerations/TransportType.md)

## Classes

### Capability

- [CapabilityMatcher](classes/CapabilityMatcher.md)

### Other

- [AbstractWalletAdapter](classes/AbstractWalletAdapter.md)
- [AztecTransactionManager](classes/AztecTransactionManager.md)
- [BalanceService](classes/BalanceService.md)
- [BaseWalletProvider](classes/BaseWalletProvider.md)
- [ChainManager](classes/ChainManager.md)
- [ChainService](classes/ChainService.md)
- [ConnectionManager](classes/ConnectionManager.md)
- [ConnectionProgressTracker](classes/ConnectionProgressTracker.md)
- [ConnectionService](classes/ConnectionService.md)
- [ConnectionStateManager](classes/ConnectionStateManager.md)
- [DAppRpcIntegration](classes/DAppRpcIntegration.md)
- [DAppRpcService](classes/DAppRpcService.md)
- [DebugWallet](classes/DebugWallet.md)
- [DiscoveryAdapter](classes/DiscoveryAdapter.md)
- [DiscoveryService](classes/DiscoveryService.md)
- [ErrorFactory](classes/ErrorFactory.md)
- [EventSystem](classes/EventSystem.md)
- [EVMDiscoveryService](classes/EVMDiscoveryService.md)
- [EvmProvider](classes/EvmProvider.md)
- [HealthService](classes/HealthService.md)
- [IconErrorRecovery](classes/IconErrorRecovery.md)
- [Logger](classes/Logger.md)
- [ProviderRegistry](classes/ProviderRegistry.md)
- [PublicProviderWrapper](classes/PublicProviderWrapper.md)
- [QueryManager](classes/QueryManager.md)
- [ServiceRegistry](classes/ServiceRegistry.md)
- [SessionService](classes/SessionService.md)
- [SolanaDiscoveryService](classes/SolanaDiscoveryService.md)
- [TransactionService](classes/TransactionService.md)
- [UIService](classes/UIService.md)
- [WalletActionManager](classes/WalletActionManager.md)
- [WalletMeshAccount](classes/WalletMeshAccount.md)
- [WalletMeshDebugger](classes/WalletMeshDebugger.md)
- [WalletMetadataManager](classes/WalletMetadataManager.md)
- [WalletPreferenceService](classes/WalletPreferenceService.md)
- [WalletProviderFallbackWrapper](classes/WalletProviderFallbackWrapper.md)
- [WalletRegistry](classes/WalletRegistry.md)

### Security

- [OriginValidator](classes/OriginValidator.md)
- [RateLimiter](classes/RateLimiter.md)
- [SessionSecurityManager](classes/SessionSecurityManager.md)

## Interfaces

### Capability

- [CapabilityMatchResult](interfaces/CapabilityMatchResult.md)

### Configuration

- [DiscoveryInitiatorConfig](interfaces/DiscoveryInitiatorConfig.md)

### Core

- [DiscoveryInitiator](interfaces/DiscoveryInitiator.md)
- [DiscoveryResponder](interfaces/DiscoveryResponder.md)

### Discovery

- [CapabilityPreferences](interfaces/CapabilityPreferences.md)
- [CapabilityRequirements](interfaces/CapabilityRequirements.md)
- [QualifiedWallet](interfaces/QualifiedWallet.md)
- [ResponderFeature](interfaces/ResponderFeature.md)

### Other

- [AccountDiscoveryOptions](interfaces/AccountDiscoveryOptions.md)
- [AccountDisplayInfo](interfaces/AccountDisplayInfo.md)
- [AccountInfo](interfaces/AccountInfo.md)
- [AccountManagementContext](interfaces/AccountManagementContext.md)
- [AccountSelectionRecord](interfaces/AccountSelectionRecord.md)
- [AdapterContext](interfaces/AdapterContext.md)
- [AuthWitness](interfaces/AuthWitness.md)
- [AvailableWallet](interfaces/AvailableWallet.md)
- [AztecAccount](interfaces/AztecAccount.md)
- [AztecTransaction](interfaces/AztecTransaction.md)
- [AztecTransactionManagerConfig](interfaces/AztecTransactionManagerConfig.md)
- [AztecTransactionParams](interfaces/AztecTransactionParams.md)
- [AztecTransactionResult](interfaces/AztecTransactionResult.md)
- [AztecWalletProvider](interfaces/AztecWalletProvider.md)
- [BalanceInfo](interfaces/BalanceInfo.md)
- [BalanceQueryOptions](interfaces/BalanceQueryOptions.md)
- [BalanceServiceDependencies](interfaces/BalanceServiceDependencies.md)
- [BaseModalState](interfaces/BaseModalState.md)
- [BaseProvider](interfaces/BaseProvider.md)
- [BaseServiceDependencies](interfaces/BaseServiceDependencies.md)
- [BasicChainInfo](interfaces/BasicChainInfo.md)
- [BlockchainProvider](interfaces/BlockchainProvider.md)
- [ChainAddedEvent](interfaces/ChainAddedEvent.md)
- [ChainCompatibilityInfo](interfaces/ChainCompatibilityInfo.md)
- [ChainCompatibilityOptions](interfaces/ChainCompatibilityOptions.md)
- [ChainCompatibilityResult](interfaces/ChainCompatibilityResult.md)
- [ChainConfig](interfaces/ChainConfig.md)
- [ChainDefinition](interfaces/ChainDefinition.md)
- [ChainEnsuranceConfig](interfaces/ChainEnsuranceConfig.md)
- [ChainEnsuranceValidationResult](interfaces/ChainEnsuranceValidationResult.md)
- [ChainInfo](interfaces/ChainInfo.md)
- [ChainManagerConfig](interfaces/ChainManagerConfig.md)
- [ChainMismatchAnalysis](interfaces/ChainMismatchAnalysis.md)
- [ChainRequirementValidationResult](interfaces/ChainRequirementValidationResult.md)
- [ChainServiceDependencies](interfaces/ChainServiceDependencies.md)
- [ChainServiceEvents](interfaces/ChainServiceEvents.md)
- [ChainSessionInfo](interfaces/ChainSessionInfo.md)
- [ChainSolanaProvider](interfaces/ChainSolanaProvider.md)
- [ChainState](interfaces/ChainState.md)
- [ChainSwitchCompletedEventData](interfaces/ChainSwitchCompletedEventData.md)
- [ChainSwitchConfirmData](interfaces/ChainSwitchConfirmData.md)
- [ChainSwitchContext](interfaces/ChainSwitchContext.md)
- [ChainSwitchedEvent](interfaces/ChainSwitchedEvent.md)
- [ChainSwitchFailedEvent](interfaces/ChainSwitchFailedEvent.md)
- [ChainSwitchingEvent](interfaces/ChainSwitchingEvent.md)
- [ChainSwitchingEventData](interfaces/ChainSwitchingEventData.md)
- [ChainSwitchOrchestrationOptions](interfaces/ChainSwitchOrchestrationOptions.md)
- [ChainSwitchRecommendation](interfaces/ChainSwitchRecommendation.md)
- [ChainSwitchRecord](interfaces/ChainSwitchRecord.md)
- [ChainSwitchSuccessData](interfaces/ChainSwitchSuccessData.md)
- [ChainValidationEventData](interfaces/ChainValidationEventData.md)
- [ChainValidationOptions](interfaces/ChainValidationOptions.md)
- [ChainValidationResult](interfaces/ChainValidationResult.md)
- [ConnectArgs](interfaces/ConnectArgs.md)
- [ConnectButtonConnectionInfo](interfaces/ConnectButtonConnectionInfo.md)
- [ConnectButtonContent](interfaces/ConnectButtonContent.md)
- [ConnectButtonOptions](interfaces/ConnectButtonOptions.md)
- [ConnectionConfig](interfaces/ConnectionConfig.md)
- [ConnectionDisplayData](interfaces/ConnectionDisplayData.md)
- [ConnectionDisplayOptions](interfaces/ConnectionDisplayOptions.md)
- [ConnectionEstablishedEvent](interfaces/ConnectionEstablishedEvent.md)
- [ConnectionEstablishingEvent](interfaces/ConnectionEstablishingEvent.md)
- [ConnectionFailedEvent](interfaces/ConnectionFailedEvent.md)
- [ConnectionFlags](interfaces/ConnectionFlags.md)
- [ConnectionInitiatedEvent](interfaces/ConnectionInitiatedEvent.md)
- [ConnectionLostEvent](interfaces/ConnectionLostEvent.md)
- [ConnectionProgress](interfaces/ConnectionProgress.md)
- [ConnectionProgressInfo](interfaces/ConnectionProgressInfo.md)
- [ConnectionRecoveryOptions](interfaces/ConnectionRecoveryOptions.md)
- [ConnectionRestoredEvent](interfaces/ConnectionRestoredEvent.md)
- [ConnectionResult](interfaces/ConnectionResult.md)
- [ConnectionServiceDependencies](interfaces/ConnectionServiceDependencies.md)
- [ConnectionServiceResult](interfaces/ConnectionServiceResult.md)
- [ConnectionState](interfaces/ConnectionState.md)
- [ConnectionValidation](interfaces/ConnectionValidation.md)
- [ConnectOptions](interfaces/ConnectOptions.md)
- [ContractFunctionInteraction](interfaces/ContractFunctionInteraction.md)
- [CoreWalletMeshConfig](interfaces/CoreWalletMeshConfig.md)
- [CreateFallbackOptions](interfaces/CreateFallbackOptions.md)
- [CreateIconContainerOptions](interfaces/CreateIconContainerOptions.md)
- [CreateSandboxedIconOptions](interfaces/CreateSandboxedIconOptions.md)
- [CreateSessionParams](interfaces/CreateSessionParams.md)
- [CreateWalletMeshClientOptions](interfaces/CreateWalletMeshClientOptions.md)
- [CreateWalletMeshOptions](interfaces/CreateWalletMeshOptions.md)
- [CustomDiscoveryConfig](interfaces/CustomDiscoveryConfig.md)
- [DAppRpcConfig](interfaces/DAppRpcConfig.md)
- [DAppRpcEndpoint](interfaces/DAppRpcEndpoint.md)
- [DAppRpcServiceDependencies](interfaces/DAppRpcServiceDependencies.md)
- [DebugInfo](interfaces/DebugInfo.md)
- [DebugWalletConfig](interfaces/DebugWalletConfig.md)
- [DerivedConnectionFlags](interfaces/DerivedConnectionFlags.md)
- [DetectionResult](interfaces/DetectionResult.md)
- [DisabledIconStyle](interfaces/DisabledIconStyle.md)
- [DisconnectOptions](interfaces/DisconnectOptions.md)
- [DiscoveredEVMWallet](interfaces/DiscoveredEVMWallet.md)
- [DiscoveredSolanaWallet](interfaces/DiscoveredSolanaWallet.md)
- [DiscoveredWallet](interfaces/DiscoveredWallet.md)
- [DiscoveryAdapterConfig](interfaces/DiscoveryAdapterConfig.md)
- [DiscoveryConfig](interfaces/DiscoveryConfig.md)
- [DiscoveryConnectionManager](interfaces/DiscoveryConnectionManager.md)
- [DiscoveryConnectionState](interfaces/DiscoveryConnectionState.md)
- [DiscoveryConnectionStateChangeEvent](interfaces/DiscoveryConnectionStateChangeEvent.md)
- [DiscoveryRequestOptions](interfaces/DiscoveryRequestOptions.md)
- [DiscoveryResult](interfaces/DiscoveryResult.md)
- [EIP1193Provider](interfaces/EIP1193Provider.md)
- [EIP6963ProviderDetail](interfaces/EIP6963ProviderDetail.md)
- [EIP6963ProviderInfo](interfaces/EIP6963ProviderInfo.md)
- [EnhancedWalletSelectionManager](interfaces/EnhancedWalletSelectionManager.md)
- [EnsureChainParams](interfaces/EnsureChainParams.md)
- [ErrorAnalysis](interfaces/ErrorAnalysis.md)
- [ErrorData](interfaces/ErrorData.md)
- [ErrorHandler](interfaces/ErrorHandler.md)
- [ErrorRecoveryConfig](interfaces/ErrorRecoveryConfig.md)
- [EventEmitter](interfaces/EventEmitter.md)
- [EventHistoryEntry](interfaces/EventHistoryEntry.md)
- [EventSubscription](interfaces/EventSubscription.md)
- [EventSubscriptionOptions](interfaces/EventSubscriptionOptions.md)
- [EventSystemConfig](interfaces/EventSystemConfig.md)
- [EVMAssetConfig](interfaces/EVMAssetConfig.md)
- [EVMChainConfig](interfaces/EVMChainConfig.md)
- [EVMDiscoveryConfig](interfaces/EVMDiscoveryConfig.md)
- [EVMDiscoveryResults](interfaces/EVMDiscoveryResults.md)
- [EVMProvider](interfaces/EVMProvider.md)
- [EvmTransaction](interfaces/EvmTransaction.md)
- [EVMTransactionParams](interfaces/EVMTransactionParams.md)
- [EVMTransactionRequest](interfaces/EVMTransactionRequest.md)
- [EvmWalletProvider](interfaces/EvmWalletProvider.md)
- [FallbackIconConfig](interfaces/FallbackIconConfig.md)
- [FormattedError](interfaces/FormattedError.md)
- [FrameworkConfig](interfaces/FrameworkConfig.md)
- [GetNativeBalanceParams](interfaces/GetNativeBalanceParams.md)
- [GetTokenBalanceParams](interfaces/GetTokenBalanceParams.md)
- [GroupedWallets](interfaces/GroupedWallets.md)
- [HeadlessModal](interfaces/HeadlessModal.md)
- [HeadlessModalActions](interfaces/HeadlessModalActions.md)
- [HeadlessModalState](interfaces/HeadlessModalState.md)
- [HealthDiagnostics](interfaces/HealthDiagnostics.md)
- [HealthIssue](interfaces/HealthIssue.md)
- [HealthMonitoringConfig](interfaces/HealthMonitoringConfig.md)
- [HealthServiceDependencies](interfaces/HealthServiceDependencies.md)
- [HealthTestResult](interfaces/HealthTestResult.md)
- [IBaseWalletProvider](interfaces/IBaseWalletProvider.md)
- [IconContainerConfig](interfaces/IconContainerConfig.md)
- [IconError](interfaces/IconError.md)
- [LazyModule](interfaces/LazyModule.md)
- [LoadingState](interfaces/LoadingState.md)
- [LoadingStateConfig](interfaces/LoadingStateConfig.md)
- [ModalController](interfaces/ModalController.md)
- [ModalEventMap](interfaces/ModalEventMap.md)
- [ModalFactoryConfig](interfaces/ModalFactoryConfig.md)
- [ModalTransportConnectedEvent](interfaces/ModalTransportConnectedEvent.md)
- [ModalTransportDisconnectedEvent](interfaces/ModalTransportDisconnectedEvent.md)
- [ModalTransportErrorEvent](interfaces/ModalTransportErrorEvent.md)
- [ModalTransportMessageEvent](interfaces/ModalTransportMessageEvent.md)
- [MultiWalletConnectionState](interfaces/MultiWalletConnectionState.md)
- [MultiWalletState](interfaces/MultiWalletState.md)
- [NemiAccount](interfaces/NemiAccount.md)
- [NetworkDiagnostics](interfaces/NetworkDiagnostics.md)
- [NodeInfo](interfaces/NodeInfo.md)
- [NormalizedIconOptions](interfaces/NormalizedIconOptions.md)
- [ProviderConnectedEvent](interfaces/ProviderConnectedEvent.md)
- [ProviderDisconnectedEvent](interfaces/ProviderDisconnectedEvent.md)
- [ProviderEntry](interfaces/ProviderEntry.md)
- [ProviderErrorEvent](interfaces/ProviderErrorEvent.md)
- [ProviderQueryOptions](interfaces/ProviderQueryOptions.md)
- [ProviderQueryResult](interfaces/ProviderQueryResult.md)
- [ProviderRegisteredEvent](interfaces/ProviderRegisteredEvent.md)
- [ProviderRequest](interfaces/ProviderRequest.md)
- [ProviderStatusChangedEvent](interfaces/ProviderStatusChangedEvent.md)
- [ProviderTestParams](interfaces/ProviderTestParams.md)
- [ProviderUnregisteredEvent](interfaces/ProviderUnregisteredEvent.md)
- [PublicProvider](interfaces/PublicProvider.md)
- [QueryManagerDependencies](interfaces/QueryManagerDependencies.md)
- [RateLimitEntry](interfaces/RateLimitEntry.md)
- [RecoveryAction](interfaces/RecoveryAction.md)
- [RecoveryAttempt](interfaces/RecoveryAttempt.md)
- [RecoveryResult](interfaces/RecoveryResult.md)
- [RecoveryState](interfaces/RecoveryState.md)
- [ResponsivenessMetrics](interfaces/ResponsivenessMetrics.md)
- [RpcResult](interfaces/RpcResult.md)
- [SafeTransactionRequest](interfaces/SafeTransactionRequest.md)
- [SendTransactionParams](interfaces/SendTransactionParams.md)
- [ServiceChainInfo](interfaces/ServiceChainInfo.md)
- [ServicesConfig](interfaces/ServicesConfig.md)
- [SessionBuilder](interfaces/SessionBuilder.md)
- [SessionComparison](interfaces/SessionComparison.md)
- [SessionCreatedEvent](interfaces/SessionCreatedEvent.md)
- [SessionCreationContext](interfaces/SessionCreationContext.md)
- [SessionEndedEvent](interfaces/SessionEndedEvent.md)
- [SessionErrorEvent](interfaces/SessionErrorEvent.md)
- [SessionEventMap](interfaces/SessionEventMap.md)
- [SessionExpiredEvent](interfaces/SessionExpiredEvent.md)
- [SessionHistoryEntry](interfaces/SessionHistoryEntry.md)
- [SessionInfo](interfaces/SessionInfo.md)
- [SessionLifecycle](interfaces/SessionLifecycle.md)
- [SessionManager](interfaces/SessionManager.md)
- [SessionMetadata](interfaces/SessionMetadata.md)
- [SessionPermissions](interfaces/SessionPermissions.md)
- [SessionProvider](interfaces/SessionProvider.md)
- [SessionServiceDependencies](interfaces/SessionServiceDependencies.md)
- [SessionState](interfaces/SessionState.md)
- [SessionStateMetadata](interfaces/SessionStateMetadata.md)
- [SessionStatusChangedEvent](interfaces/SessionStatusChangedEvent.md)
- [SessionUpdatedEvent](interfaces/SessionUpdatedEvent.md)
- [SessionValidationResult](interfaces/SessionValidationResult.md)
- [SignMessageParams](interfaces/SignMessageParams.md)
- [SolanaCapabilities](interfaces/SolanaCapabilities.md)
- [SolanaConnectOptions](interfaces/SolanaConnectOptions.md)
- [SolanaDiscoveryConfig](interfaces/SolanaDiscoveryConfig.md)
- [SolanaDiscoveryResults](interfaces/SolanaDiscoveryResults.md)
- [SolanaInstruction](interfaces/SolanaInstruction.md)
- [SolanaProvider](interfaces/SolanaProvider.md)
- [SolanaTransaction](interfaces/SolanaTransaction.md)
- [SolanaTransactionParams](interfaces/SolanaTransactionParams.md)
- [SolanaWalletAccount](interfaces/SolanaWalletAccount.md)
- [SolanaWalletProvider](interfaces/SolanaWalletProvider.md)
- [SolanaWalletStandardWallet](interfaces/SolanaWalletStandardWallet.md)
- [StabilityMetrics](interfaces/StabilityMetrics.md)
- [StageTiming](interfaces/StageTiming.md)
- [StateResetEvent](interfaces/StateResetEvent.md)
- [StateUpdatedEvent](interfaces/StateUpdatedEvent.md)
- [StoreConfig](interfaces/StoreConfig.md)
- [SwitchChainResult](interfaces/SwitchChainResult.md)
- [ThemeAnimation](interfaces/ThemeAnimation.md)
- [ThemeBorderRadius](interfaces/ThemeBorderRadius.md)
- [ThemeColors](interfaces/ThemeColors.md)
- [ThemeConfig](interfaces/ThemeConfig.md)
- [ThemeDetection](interfaces/ThemeDetection.md)
- [ThemeShadows](interfaces/ThemeShadows.md)
- [ThemeSpacing](interfaces/ThemeSpacing.md)
- [ThemeTypography](interfaces/ThemeTypography.md)
- [TokenInfo](interfaces/TokenInfo.md)
- [TransactionCallbacks](interfaces/TransactionCallbacks.md)
- [TransactionContext](interfaces/TransactionContext.md)
- [TransactionManager](interfaces/TransactionManager.md)
- [TransactionParams](interfaces/TransactionParams.md)
- [TransactionResult](interfaces/TransactionResult.md)
- [TransactionServiceDependencies](interfaces/TransactionServiceDependencies.md)
- [TransactionStages](interfaces/TransactionStages.md)
- [Transport](interfaces/Transport.md)
- [TransportConnectedEvent](interfaces/TransportConnectedEvent.md)
- [TransportDisconnectedEvent](interfaces/TransportDisconnectedEvent.md)
- [TransportErrorEvent](interfaces/TransportErrorEvent.md)
- [TransportMessageEvent](interfaces/TransportMessageEvent.md)
- [TypedDataParams](interfaces/TypedDataParams.md)
- [UIConnectionInfo](interfaces/UIConnectionInfo.md)
- [UIError](interfaces/UIError.md)
- [UIServiceConfig](interfaces/UIServiceConfig.md)
- [UIServiceDependencies](interfaces/UIServiceDependencies.md)
- [UIState](interfaces/UIState.md)
- [ValidateChainParams](interfaces/ValidateChainParams.md)
- [ViewChangedEvent](interfaces/ViewChangedEvent.md)
- [ViewChangingEvent](interfaces/ViewChangingEvent.md)
- [WalletAdapter](interfaces/WalletAdapter.md)
- [WalletAdapterConnectionState](interfaces/WalletAdapterConnectionState.md)
- [WalletAdapterMetadata](interfaces/WalletAdapterMetadata.md)
- [WalletAdapterStatic](interfaces/WalletAdapterStatic.md)
- [WalletAvailableEvent](interfaces/WalletAvailableEvent.md)
- [WalletCapabilities](interfaces/WalletCapabilities.md)
- [WalletClientSetup](interfaces/WalletClientSetup.md)
- [WalletConfig](interfaces/WalletConfig.md)
- [WalletConnection](interfaces/WalletConnection.md)
- [WalletConnectionState](interfaces/WalletConnectionState.md)
- [WalletDiscoveredEvent](interfaces/WalletDiscoveredEvent.md)
- [WalletDisplayData](interfaces/WalletDisplayData.md)
- [WalletEventMap](interfaces/WalletEventMap.md)
- [WalletFilterCriteria](interfaces/WalletFilterCriteria.md)
- [WalletHistoryEntry](interfaces/WalletHistoryEntry.md)
- [WalletInfo](interfaces/WalletInfo.md)
- [WalletMeshClient](interfaces/WalletMeshClient.md)
- [WalletMeshConfig](interfaces/WalletMeshConfig.md)
- [WalletMeshState](interfaces/WalletMeshState.md)
- [WalletMethodMap](interfaces/WalletMethodMap.md)
- [WalletPermissions](interfaces/WalletPermissions.md)
- [WalletPreference](interfaces/WalletPreference.md)
- [WalletPreferenceConfig](interfaces/WalletPreferenceConfig.md)
- [WalletPreferences](interfaces/WalletPreferences.md)
- [WalletPreferenceServiceDependencies](interfaces/WalletPreferenceServiceDependencies.md)
- [WalletProvider](interfaces/WalletProvider.md)
- [WalletProviderContext](interfaces/WalletProviderContext.md)
- [WalletProviderState](interfaces/WalletProviderState.md)
- [WalletRecommendationCriteria](interfaces/WalletRecommendationCriteria.md)
- [WalletSelectedEvent](interfaces/WalletSelectedEvent.md)
- [WalletSelectionManager](interfaces/WalletSelectionManager.md)
- [WalletSession](interfaces/WalletSession.md)
- [WalletSessionContext](interfaces/WalletSessionContext.md)
- [WalletUIMetadata](interfaces/WalletUIMetadata.md)
- [WalletUnavailableEvent](interfaces/WalletUnavailableEvent.md)
- [WalletWithMetadata](interfaces/WalletWithMetadata.md)

### Protocol

- [DAppInfo](interfaces/DAppInfo.md)
- [DiscoveryRequestEvent](interfaces/DiscoveryRequestEvent.md)
- [DiscoveryResponseEvent](interfaces/DiscoveryResponseEvent.md)

### Security

- [OriginValidationConfig](interfaces/OriginValidationConfig.md)
- [RateLimitConfig](interfaces/RateLimitConfig.md)
- [RateLimitResult](interfaces/RateLimitResult.md)
- [SecureSession](interfaces/SecureSession.md)
- [SessionSecurityConfig](interfaces/SessionSecurityConfig.md)

### Types

- [ChromeExtensionConfig](interfaces/ChromeExtensionConfig.md)
- [ConnectionInfo](interfaces/ConnectionInfo.md)
- [DiscoveredWalletInfo](interfaces/DiscoveredWalletInfo.md)
- [Disposable](interfaces/Disposable.md)
- [PopupConfig](interfaces/PopupConfig.md)
- [TransportConfig](interfaces/TransportConfig.md)
- [WalletClient](interfaces/WalletClient.md)
- [WalletMetadata](interfaces/WalletMetadata.md)

## Type Aliases

### Discovery

- [ResponderInfo](type-aliases/ResponderInfo.md)

### Other

- [ActiveSession](type-aliases/ActiveSession.md)
- [AdapterEvent](type-aliases/AdapterEvent.md)
- [AdapterEvents](type-aliases/AdapterEvents.md)
- [AddressFormat](type-aliases/AddressFormat.md)
- [AztecTransactionStatus](type-aliases/AztecTransactionStatus.md)
- [AztecTransactionStatusNotification](type-aliases/AztecTransactionStatusNotification.md)
- [ClientEventHandler](type-aliases/ClientEventHandler.md)
- [ConnectButtonState](type-aliases/ConnectButtonState.md)
- [ConnectionEvent](type-aliases/ConnectionEvent.md)
- [ConnectionStage](type-aliases/ConnectionStage.md)
- [ConnectionStateMachine](type-aliases/ConnectionStateMachine.md)
- [DiscoveryEvent](type-aliases/DiscoveryEvent.md)
- [DiscriminatedSessionState](type-aliases/DiscriminatedSessionState.md)
- [EnhancedDiscoveryEvent](type-aliases/EnhancedDiscoveryEvent.md)
- [ErrorCategory](type-aliases/ErrorCategory.md)
- [ErrorClassification](type-aliases/ErrorClassification.md)
- [ErrorContext](type-aliases/ErrorContext.md)
- [EventCategory](type-aliases/EventCategory.md)
- [EventData](type-aliases/EventData.md)
- [EventHandler](type-aliases/EventHandler.md)
- [EventListener](type-aliases/EventListener.md)
- [HealthStatus](type-aliases/HealthStatus.md)
- [IconErrorType](type-aliases/IconErrorType.md)
- [IconRecoveryStrategy](type-aliases/IconRecoveryStrategy.md)
- [InactiveSession](type-aliases/InactiveSession.md)
- [~~InternalWalletMeshClient~~](type-aliases/InternalWalletMeshClient.md)
- [ModalError](type-aliases/ModalError.md)
- [ModalErrorCategory](type-aliases/ModalErrorCategory.md)
- [ModalState](type-aliases/ModalState.md)
- [ModalView](type-aliases/ModalView.md)
- [NetworkStatus](type-aliases/NetworkStatus.md)
- [ProviderClass](type-aliases/ProviderClass.md)
- [ProviderEventListener](type-aliases/ProviderEventListener.md)
- [ProviderInstance](type-aliases/ProviderInstance.md)
- [ProviderLoader](type-aliases/ProviderLoader.md)
- [ProviderStatus](type-aliases/ProviderStatus.md)
- [RecoveryStrategy](type-aliases/RecoveryStrategy.md)
- [SessionStatus](type-aliases/SessionStatus.md)
- [StateSelector](type-aliases/StateSelector.md)
- [StateSubscriber](type-aliases/StateSubscriber.md)
- [StoreApi](type-aliases/StoreApi.md)
- [SupportedChain](type-aliases/SupportedChain.md)
- [ThemeCSSVariables](type-aliases/ThemeCSSVariables.md)
- [ThemeMode](type-aliases/ThemeMode.md)
- [TransactionMode](type-aliases/TransactionMode.md)
- [TransactionRequest](type-aliases/TransactionRequest.md)
- [TransactionStatus](type-aliases/TransactionStatus.md)
- [TransitionalSession](type-aliases/TransitionalSession.md)
- [TransportEvent](type-aliases/TransportEvent.md)
- [TxHash](type-aliases/TxHash.md)
- [UIView](type-aliases/UIView.md)
- [Unsubscribe](type-aliases/Unsubscribe.md)
- [WalletAdapterClass](type-aliases/WalletAdapterClass.md)
- [WalletAdapterConstructor](type-aliases/WalletAdapterConstructor.md)
- [WalletFeature](type-aliases/WalletFeature.md)
- [WalletMeshClientConfig](type-aliases/WalletMeshClientConfig.md)
- [WalletSortOption](type-aliases/WalletSortOption.md)

### Types

- [SupportedChainsConfig](type-aliases/SupportedChainsConfig.md)

## Variables

### Features

- [RESPONDER\_FEATURES](variables/RESPONDER_FEATURES.md)

### Other

- [actions](variables/actions.md)
- [arbitrumOne](variables/arbitrumOne.md)
- [arbitrumSepolia](variables/arbitrumSepolia.md)
- [aztecChains](variables/aztecChains.md)
- [aztecMainnet](variables/aztecMainnet.md)
- [aztecMainnets](variables/aztecMainnets.md)
- [aztecSandbox](variables/aztecSandbox.md)
- [aztecTestChains](variables/aztecTestChains.md)
- [aztecTestnet](variables/aztecTestnet.md)
- [aztecTransactionActions](variables/aztecTransactionActions.md)
- [aztecTransactionStatusNotificationSchema](variables/aztecTransactionStatusNotificationSchema.md)
- [baseMainnet](variables/baseMainnet.md)
- [baseSepolia](variables/baseSepolia.md)
- [CHAIN\_CONFIGS](variables/CHAIN_CONFIGS.md)
- [CHAIN\_NAMES](variables/CHAIN_NAMES.md)
- [connectButtonUtils](variables/connectButtonUtils.md)
- [connectionActions](variables/connectionActions.md)
- [connectionSelectors](variables/connectionSelectors.md)
- [ConnectionStages](variables/ConnectionStages.md)
- [connectionUIService](variables/connectionUIService.md)
- [DEFAULT\_CSS\_PREFIX](variables/DEFAULT_CSS_PREFIX.md)
- [DEFAULT\_THEME\_STORAGE\_KEY](variables/DEFAULT_THEME_STORAGE_KEY.md)
- [DEFAULT\_WALLET\_PREFERENCE\_KEY](variables/DEFAULT_WALLET_PREFERENCE_KEY.md)
- [displayHelpers](variables/displayHelpers.md)
- [ERROR\_CODES](variables/ERROR_CODES.md)
- [errorContextSchema](variables/errorContextSchema.md)
- [errorSelectors](variables/errorSelectors.md)
- [ethereumHolesky](variables/ethereumHolesky.md)
- [ethereumMainnet](variables/ethereumMainnet.md)
- [ethereumSepolia](variables/ethereumSepolia.md)
- [eventCategories](variables/eventCategories.md)
- [evmChains](variables/evmChains.md)
- [evmMainnets](variables/evmMainnets.md)
- [evmTestnets](variables/evmTestnets.md)
- [formatters](variables/formatters.md)
- [INITIAL\_CONNECTION\_STATE](variables/INITIAL_CONNECTION_STATE.md)
- [INITIAL\_MODAL\_STATE](variables/INITIAL_MODAL_STATE.md)
- [modalErrorSchema](variables/modalErrorSchema.md)
- [modalEventNames](variables/modalEventNames.md)
- [modalLogger](variables/modalLogger.md)
- [optimismMainnet](variables/optimismMainnet.md)
- [optimismSepolia](variables/optimismSepolia.md)
- [polygonAmoy](variables/polygonAmoy.md)
- [polygonMainnet](variables/polygonMainnet.md)
- [queryKeys](variables/queryKeys.md)
- [RECOVERY\_PRESETS](variables/RECOVERY_PRESETS.md)
- [safeLocalStorage](variables/safeLocalStorage.md)
- [safeSessionStorage](variables/safeSessionStorage.md)
- [selectors](variables/selectors.md)
- [solanaChains](variables/solanaChains.md)
- [solanaDevnet](variables/solanaDevnet.md)
- [solanaMainnet](variables/solanaMainnet.md)
- [solanaMainnets](variables/solanaMainnets.md)
- [solanaTestChains](variables/solanaTestChains.md)
- [solanaTestnet](variables/solanaTestnet.md)
- [SSR\_MODAL\_STATE](variables/SSR_MODAL_STATE.md)
- [ssrState](variables/ssrState.md)
- [subscriptions](variables/subscriptions.md)
- [TRANSACTION\_STATUS\_VALUES](variables/TRANSACTION_STATUS_VALUES.md)
- [transactionActions](variables/transactionActions.md)
- [TRANSPORT\_CONFIG](variables/TRANSPORT_CONFIG.md)
- [uiActions](variables/uiActions.md)
- [uiSelectors](variables/uiSelectors.md)
- [useStore](variables/useStore.md)
- [WALLET\_ERROR\_CODES](variables/WALLET_ERROR_CODES.md)
- [walletMeshDebugger](variables/walletMeshDebugger.md)
- [walletMetadataManager](variables/walletMetadataManager.md)
- [walletSelectors](variables/walletSelectors.md)

### Theme

- [themeDetection](variables/themeDetection.md)

## Functions

### API

- [createWalletMesh](functions/createWalletMesh.md)

### Connection Progress

- [createCustomProgress](functions/createCustomProgress.md)
- [createProgress](functions/createProgress.md)
- [createProgressTracker](functions/createProgressTracker.md)
- [getStageDescription](functions/getStageDescription.md)
- [getStageProgress](functions/getStageProgress.md)
- [interpolateProgress](functions/interpolateProgress.md)
- [isInProgress](functions/isInProgress.md)
- [isTerminalStage](functions/isTerminalStage.md)

### Other

- [addDiscoveryError](functions/addDiscoveryError.md)
- [addSession](functions/addSession.md)
- [addTransaction](functions/addTransaction.md)
- [addWallet](functions/addWallet.md)
- [applyFallbackToElement](functions/applyFallbackToElement.md)
- [canGoBack](functions/canGoBack.md)
- [categorizeError](functions/categorizeError.md)
- [clearAllInstances](functions/clearAllInstances.md)
- [clearDiscoveryErrors](functions/clearDiscoveryErrors.md)
- [clearError](functions/clearError.md)
- [clearWalletAdapterRegistry](functions/clearWalletAdapterRegistry.md)
- [closeModal](functions/closeModal.md)
- [composeSelectors](functions/composeSelectors.md)
- [configureModalLogger](functions/configureModalLogger.md)
- [createAllChainsConfig](functions/createAllChainsConfig.md)
- [createAztecTransactionManager](functions/createAztecTransactionManager.md)
- [createCompleteWalletSetup](functions/createCompleteWalletSetup.md)
- [createCustomConfig](functions/createCustomConfig.md)
- [createCustomDiscoveryConfig](functions/createCustomDiscoveryConfig.md)
- [createDebugLogger](functions/createDebugLogger.md)
- [createDevelopmentWalletSetup](functions/createDevelopmentWalletSetup.md)
- [createEVMDiscoveryConfig](functions/createEVMDiscoveryConfig.md)
- [createFallbackConfig](functions/createFallbackConfig.md)
- [createFallbackConfigs](functions/createFallbackConfigs.md)
- [createIconAccessibilityAttributes](functions/createIconAccessibilityAttributes.md)
- [createIconContainerConfig](functions/createIconContainerConfig.md)
- [createIconErrorRecovery](functions/createIconErrorRecovery.md)
- [createLazy](functions/createLazy.md)
- [createLazyAsync](functions/createLazyAsync.md)
- [createLazyProxy](functions/createLazyProxy.md)
- [createLazySingleton](functions/createLazySingleton.md)
- [createMainnetConfig](functions/createMainnetConfig.md)
- [createModal](functions/createModal.md)
- [createModalError](functions/createModalError.md)
- [createModalState](functions/createModalState.md)
- [createMultiChainDiscoveryConfig](functions/createMultiChainDiscoveryConfig.md)
- [createProductionWalletSetup](functions/createProductionWalletSetup.md)
- [createQueryKey](functions/createQueryKey.md)
- [createSafeStorage](functions/createSafeStorage.md)
- [createSandboxedIcon](functions/createSandboxedIcon.md)
- [createSandboxedIcons](functions/createSandboxedIcons.md)
- [createSelector](functions/createSelector.md)
- [createSolanaDiscoveryConfig](functions/createSolanaDiscoveryConfig.md)
- [createSSRController](functions/createSSRController.md)
- [createTestDiscoveryConfig](functions/createTestDiscoveryConfig.md)
- [createTestModal](functions/createTestModal.md)
- [createTestnetConfig](functions/createTestnetConfig.md)
- [createTransport](functions/createTransport.md)
- [createUniversalController](functions/createUniversalController.md)
- [createWalletActionManager](functions/createWalletActionManager.md)
- [createWalletMeshAccount](functions/createWalletMeshAccount.md)
- [createWalletMeshClient](functions/createWalletMeshClient.md)
- [createWalletMeshClientWithConfig](functions/createWalletMeshClientWithConfig.md)
- [ensureError](functions/ensureError.md)
- [ensureModalError](functions/ensureModalError.md)
- [filterChainsByGroup](functions/filterChainsByGroup.md)
- [getActiveSession](functions/getActiveSession.md)
- [getActiveTransaction](functions/getActiveTransaction.md)
- [getActiveWallet](functions/getActiveWallet.md)
- [getAllSessions](functions/getAllSessions.md)
- [getAllTransactions](functions/getAllTransactions.md)
- [getAllWallets](functions/getAllWallets.md)
- [getAvailableWallets](functions/getAvailableWallets.md)
- [getBackgroundTransactionCount](functions/getBackgroundTransactionCount.md)
- [getBackgroundTransactions](functions/getBackgroundTransactions.md)
- [getConnectionStatus](functions/getConnectionStatus.md)
- [getConnectionTimestamp](functions/getConnectionTimestamp.md)
- [getCurrentOrigin](functions/getCurrentOrigin.md)
- [getCurrentView](functions/getCurrentView.md)
- [getDocument](functions/getDocument.md)
- [getError](functions/getError.md)
- [getEventsByCategory](functions/getEventsByCategory.md)
- [getExistingInstance](functions/getExistingInstance.md)
- [getFilteredWallets](functions/getFilteredWallets.md)
- [getIconContainerStyles](functions/getIconContainerStyles.md)
- [getNavigator](functions/getNavigator.md)
- [getRecoveryActions](functions/getRecoveryActions.md)
- [getRegisteredWalletAdapters](functions/getRegisteredWalletAdapters.md)
- [getRequiredChains](functions/getRequiredChains.md)
- [getSelectedWallet](functions/getSelectedWallet.md)
- [getSessionsByWallet](functions/getSessionsByWallet.md)
- [getStageDuration](functions/getStageDuration.md)
- [getStatusDescription](functions/getStatusDescription.md)
- [getStoreInstance](functions/getStoreInstance.md)
- [getTotalDuration](functions/getTotalDuration.md)
- [getTransactionHistory](functions/getTransactionHistory.md)
- [getUserFriendlyMessage](functions/getUserFriendlyMessage.md)
- [getWalletClientInstance](functions/getWalletClientInstance.md)
- [getWalletMeshStore](functions/getWalletMeshStore.md)
- [getWindow](functions/getWindow.md)
- [hasErrorCode](functions/hasErrorCode.md)
- [hasErrorMessage](functions/hasErrorMessage.md)
- [hasIndexedDB](functions/hasIndexedDB.md)
- [hasLocalStorage](functions/hasLocalStorage.md)
- [hasServiceWorkerSupport](functions/hasServiceWorkerSupport.md)
- [hasSessionStorage](functions/hasSessionStorage.md)
- [hasWebWorkerSupport](functions/hasWebWorkerSupport.md)
- [isActiveState](functions/isActiveState.md)
- [isActiveStatus](functions/isActiveStatus.md)
- [isArray](functions/isArray.md)
- [isAztecRouterProvider](functions/isAztecRouterProvider.md)
- [isAztecWalletProvider](functions/isAztecWalletProvider.md)
- [isBackgroundTransaction](functions/isBackgroundTransaction.md)
- [isBoolean](functions/isBoolean.md)
- [isBrowser](functions/isBrowser.md)
- [isBrowserExtension](functions/isBrowserExtension.md)
- [isChainSupported](functions/isChainSupported.md)
- [isChainType](functions/isChainType.md)
- [isConnected](functions/isConnected.md)
- [isConnecting](functions/isConnecting.md)
- [isConnectionResult](functions/isConnectionResult.md)
- [isConnectionState](functions/isConnectionState.md)
- [isDisconnected](functions/isDisconnected.md)
- [isDiscovering](functions/isDiscovering.md)
- [isError](functions/isError.md)
- [isEventInCategory](functions/isEventInCategory.md)
- [isEvmProvider](functions/isEvmProvider.md)
- [isEvmWalletProvider](functions/isEvmWalletProvider.md)
- [isFinalStatus](functions/isFinalStatus.md)
- [isInactiveState](functions/isInactiveState.md)
- [isInIframe](functions/isInIframe.md)
- [isModalError](functions/isModalError.md)
- [isModalEvent](functions/isModalEvent.md)
- [isModalOpen](functions/isModalOpen.md)
- [isModalViewType](functions/isModalViewType.md)
- [isNumber](functions/isNumber.md)
- [isObject](functions/isObject.md)
- [isReconnecting](functions/isReconnecting.md)
- [isSandboxSupported](functions/isSandboxSupported.md)
- [isServer](functions/isServer.md)
- [isSolanaProvider](functions/isSolanaProvider.md)
- [isSolanaWalletProvider](functions/isSolanaWalletProvider.md)
- [isString](functions/isString.md)
- [isTransportType](functions/isTransportType.md)
- [isValidConnectionStatus](functions/isValidConnectionStatus.md)
- [isWalletAdapterRegistered](functions/isWalletAdapterRegistered.md)
- [isWalletAvailable](functions/isWalletAvailable.md)
- [isWalletInfo](functions/isWalletInfo.md)
- [isWalletMeshError](functions/isWalletMeshError.md)
- [markChainsRequired](functions/markChainsRequired.md)
- [normalizeIconOptions](functions/normalizeIconOptions.md)
- [openModal](functions/openModal.md)
- [parseAztecTransactionStatusNotification](functions/parseAztecTransactionStatusNotification.md)
- [popViewHistory](functions/popViewHistory.md)
- [pushViewHistory](functions/pushViewHistory.md)
- [registerWalletAdapter](functions/registerWalletAdapter.md)
- [removeSession](functions/removeSession.md)
- [removeTransaction](functions/removeTransaction.md)
- [removeWallet](functions/removeWallet.md)
- [setActiveSession](functions/setActiveSession.md)
- [setActiveTransaction](functions/setActiveTransaction.md)
- [setActiveWallet](functions/setActiveWallet.md)
- [setAvailableWalletIds](functions/setAvailableWalletIds.md)
- [setConnectionTimestamp](functions/setConnectionTimestamp.md)
- [setCurrentView](functions/setCurrentView.md)
- [setError](functions/setError.md)
- [setLastDiscoveryTime](functions/setLastDiscoveryTime.md)
- [setLoading](functions/setLoading.md)
- [setLogLevel](functions/setLogLevel.md)
- [setSelectedWallet](functions/setSelectedWallet.md)
- [setSwitchingChainData](functions/setSwitchingChainData.md)
- [setTargetChainType](functions/setTargetChainType.md)
- [setTransactionStatus](functions/setTransactionStatus.md)
- [setWalletFilter](functions/setWalletFilter.md)
- [subscribeToAllChanges](functions/subscribeToAllChanges.md)
- [subscribeToConnectionChanges](functions/subscribeToConnectionChanges.md)
- [toModalError](functions/toModalError.md)
- [unregisterWalletAdapter](functions/unregisterWalletAdapter.md)
- [updateSession](functions/updateSession.md)
- [updateTransaction](functions/updateTransaction.md)
- [updateWallet](functions/updateWallet.md)
- [useConnectButtonState](functions/useConnectButtonState.md)
- [useStoreActions](functions/useStoreActions.md)
- [waitForConnection](functions/waitForConnection.md)
- [waitForModalClose](functions/waitForModalClose.md)
- [waitForState](functions/waitForState.md)

### SSR Utilities

- [safeBrowserAPI](functions/safeBrowserAPI.md)
- [transformFrameworkConfig](functions/transformFrameworkConfig.md)
- [validateFrameworkConfig](functions/validateFrameworkConfig.md)

### State Derivation

- [deriveConnectionStatus](functions/deriveConnectionStatus.md)
- [filterSessionsByStatus](functions/filterSessionsByStatus.md)
- [getActiveWalletSession](functions/getActiveWalletSession.md)
- [getConnectedWalletIds](functions/getConnectedWalletIds.md)
- [getCurrentChain](functions/getCurrentChain.md)
- [getPrimaryAddress](functions/getPrimaryAddress.md)
- [getSessionsByChainType](functions/getSessionsByChainType.md)
- [hasConnectedSession](functions/hasConnectedSession.md)
- [isConnectedToChain](functions/isConnectedToChain.md)

### Theme

- [applyCSSVariables](functions/applyCSSVariables.md)
- [applyThemeClass](functions/applyThemeClass.md)
- [disableTransitions](functions/disableTransitions.md)
- [getNextTheme](functions/getNextTheme.md)
- [getStoredTheme](functions/getStoredTheme.md)
- [getSystemTheme](functions/getSystemTheme.md)
- [initializeTheme](functions/initializeTheme.md)
- [isValidThemeMode](functions/isValidThemeMode.md)
- [onSystemThemeChange](functions/onSystemThemeChange.md)
- [removeCSSVariables](functions/removeCSSVariables.md)
- [removeStoredTheme](functions/removeStoredTheme.md)
- [resolveTheme](functions/resolveTheme.md)
- [storeTheme](functions/storeTheme.md)
- [themeConfigToCSSVariables](functions/themeConfigToCSSVariables.md)
- [toggleTheme](functions/toggleTheme.md)

### Utilities

- [createProviderQueryKey](functions/createProviderQueryKey.md)
- [executeProviderMethod](functions/executeProviderMethod.md)
- [formatError](functions/formatError.md)
- [getErrorTitle](functions/getErrorTitle.md)
- [getRecoveryMessage](functions/getRecoveryMessage.md)
- [isMethodSupported](functions/isMethodSupported.md)
- [isSessionError](functions/isSessionError.md)
- [isUserInitiatedError](functions/isUserInitiatedError.md)

### Wallet Selection

- [clearWalletPreference](functions/clearWalletPreference.md)
- [createEnhancedWalletSelectionManager](functions/createEnhancedWalletSelectionManager.md)
- [createWalletSelectionManager](functions/createWalletSelectionManager.md)
- [filterWalletsByChain](functions/filterWalletsByChain.md)
- [getInstallUrl](functions/getInstallUrl.md)
- [getPreferredWallet](functions/getPreferredWallet.md)
- [getRecommendedWallet](functions/getRecommendedWallet.md)
- [getRecommendedWalletWithHistory](functions/getRecommendedWalletWithHistory.md)
- [getWalletsByUsageFrequency](functions/getWalletsByUsageFrequency.md)
- [getWalletsSortedByAvailability](functions/getWalletsSortedByAvailability.md)
- [isWalletInstalled](functions/isWalletInstalled.md)
- [setPreferredWallet](functions/setPreferredWallet.md)

## References

### CapabilityRequest

Renames and re-exports [CapabilityRequirements](interfaces/CapabilityRequirements.md)

***

### ClientDiscoveryService

Renames and re-exports [DiscoveryService](classes/DiscoveryService.md)

***

### ConnectVariables

Renames and re-exports [ConnectArgs](interfaces/ConnectArgs.md)

***

### DiscoveryWalletAdapterConstructor

Renames and re-exports [WalletAdapterConstructor](type-aliases/WalletAdapterConstructor.md)
