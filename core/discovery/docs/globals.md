[**@walletmesh/discovery v0.1.0**](README.md)

***

# @walletmesh/discovery v0.1.0

Generic Cross-Blockchain Discovery Protocol

A capability-first discovery protocol that enables initiators (dApps)
to discover and connect to responders (wallets) across any blockchain network.

Features:
- Capability-first discovery: Initiators specify requirements, responders self-qualify
- Multi-blockchain support: Works across EVM, Solana, Aztec, and other chains
- Enhanced security: Origin validation, session tracking, anti-spoofing
- Privacy protection: Dual identifier system prevents tracking
- CSP compliance: No Content Security Policy violations

## Blockchain

- [ChainCapability](interfaces/ChainCapability.md)
- [ChainFeature](interfaces/ChainFeature.md)
- [NetworkInfo](interfaces/NetworkInfo.md)
- [ParameterSpec](interfaces/ParameterSpec.md)
- [TransactionType](interfaces/TransactionType.md)
- [ValidationRule](interfaces/ValidationRule.md)
- [ChainType](type-aliases/ChainType.md)
- [CHAIN\_TYPES](variables/CHAIN_TYPES.md)

## Capability

- [CapabilityMatcher](classes/CapabilityMatcher.md)
- [CapabilityMatchResult](interfaces/CapabilityMatchResult.md)

## Configuration

- [DISCOVERY\_CONFIG](variables/DISCOVERY_CONFIG.md)

## Connection

- [Account](interfaces/Account.md)
- [ConnectionManagerConfig](interfaces/ConnectionManagerConfig.md)

## Core

- [ConsoleLogger](classes/ConsoleLogger.md)
- [Logger](interfaces/Logger.md)
- [createLogger](functions/createLogger.md)

## Discovery

- [DiscoveryInitiator](classes/DiscoveryInitiator.md)
- [DiscoveryResponder](classes/DiscoveryResponder.md)
- [CapabilityIntersection](interfaces/CapabilityIntersection.md)
- [CapabilityPreferences](interfaces/CapabilityPreferences.md)
- [CapabilityRequirements](interfaces/CapabilityRequirements.md)
- [DiscoveryInitiatorConfig](interfaces/DiscoveryInitiatorConfig.md)
- [DiscoveryRequestEvent](interfaces/DiscoveryRequestEvent.md)
- [DiscoveryResponderConfig](interfaces/DiscoveryResponderConfig.md)
- [DiscoveryResponseEvent](interfaces/DiscoveryResponseEvent.md)
- [QualifiedResponder](interfaces/QualifiedResponder.md)
- [TransportConfig](interfaces/TransportConfig.md)

## Errors

- [DiscoveryError](interfaces/DiscoveryError.md)
- [ERROR\_CODES](variables/ERROR_CODES.md)
- [ERROR\_MESSAGES](variables/ERROR_MESSAGES.md)
- [RETRYABLE\_ERROR\_CODES](variables/RETRYABLE_ERROR_CODES.md)
- [SILENT\_FAILURE\_CODES](variables/SILENT_FAILURE_CODES.md)
- [getErrorCategory](functions/getErrorCategory.md)

## Events

- [DiscoveryCompleteEvent](interfaces/DiscoveryCompleteEvent.md)
- [DiscoveryErrorEvent](interfaces/DiscoveryErrorEvent.md)
- [DiscoveryRequestEventHandler](type-aliases/DiscoveryRequestEventHandler.md)
- [DISCOVERY\_EVENTS](variables/DISCOVERY_EVENTS.md)

## Factory

- [createCapabilityMatcher](functions/createCapabilityMatcher.md)
- [createDiscoveryInitiator](functions/createDiscoveryInitiator.md)
- [createDiscoveryResponder](functions/createDiscoveryResponder.md)
- [createInitiatorDiscoverySetup](functions/createInitiatorDiscoverySetup.md)
- [createResponderDiscoverySetup](functions/createResponderDiscoverySetup.md)

## Features

- [RESPONDER\_FEATURES](variables/RESPONDER_FEATURES.md)

## Helpers

- [createCapabilityRequirements](variables/createCapabilityRequirements.md)
- [createResponderInfo](variables/createResponderInfo.md)
- [createSecurityPolicy](variables/createSecurityPolicy.md)

## Interfaces

- [RESPONDER\_INTERFACES](variables/RESPONDER_INTERFACES.md)

## Other

- [DiscoveryResponseEventHandler](type-aliases/DiscoveryResponseEventHandler.md)
- [defaultLogger](variables/defaultLogger.md)

## Protocol

- [ProtocolStateMachine](classes/ProtocolStateMachine.md)
- [BaseDiscoveryMessage](interfaces/BaseDiscoveryMessage.md)
- [InitiatorInfo](interfaces/InitiatorInfo.md)
- [ProtocolError](interfaces/ProtocolError.md)
- [DiscoveryMessage](type-aliases/DiscoveryMessage.md)
- [ErrorCategory](type-aliases/ErrorCategory.md)
- [DISCOVERY\_PROTOCOL\_VERSION](variables/DISCOVERY_PROTOCOL_VERSION.md)

## Responder

- [BaseResponderInfo](interfaces/BaseResponderInfo.md)
- [ExtensionResponderInfo](interfaces/ExtensionResponderInfo.md)
- [ResponderFeature](interfaces/ResponderFeature.md)
- [ResponderPlatform](interfaces/ResponderPlatform.md)
- [WebResponderInfo](interfaces/WebResponderInfo.md)
- [ResponderInfo](type-aliases/ResponderInfo.md)
- [ResponderType](type-aliases/ResponderType.md)

## Security

- [OriginValidator](classes/OriginValidator.md)
- [RateLimiter](classes/RateLimiter.md)
- [SessionTracker](classes/SessionTracker.md)
- [OriginValidationResult](interfaces/OriginValidationResult.md)
- [PermissionModel](interfaces/PermissionModel.md)
- [RateLimitConfig](interfaces/RateLimitConfig.md)
- [SecurityPolicy](interfaces/SecurityPolicy.md)
- [SessionOptions](interfaces/SessionOptions.md)
- [SessionTrackingState](interfaces/SessionTrackingState.md)
- [VerificationInfo](interfaces/VerificationInfo.md)
- [validateEventOrigin](functions/validateEventOrigin.md)

## State Machine

- [InitiatorStateMachine](classes/InitiatorStateMachine.md)
- [InitiatorStateMachineConfig](interfaces/InitiatorStateMachineConfig.md)
- [StateTimeouts](interfaces/StateTimeouts.md)
- [StateTransitionEvent](interfaces/StateTransitionEvent.md)
- [ProtocolState](type-aliases/ProtocolState.md)
- [createInitiatorStateMachine](functions/createInitiatorStateMachine.md)
- [createProtocolStateMachine](functions/createProtocolStateMachine.md)

## Validation

- [validateOrigin](functions/validateOrigin.md)
