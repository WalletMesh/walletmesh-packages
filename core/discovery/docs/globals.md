[**@walletmesh/discovery v0.1.2**](README.md)

***

# @walletmesh/discovery v0.1.2

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

- [CHAIN\_TYPES](variables/CHAIN_TYPES.md)

## Capability

- [CapabilityMatcher](classes/CapabilityMatcher.md)
- [CapabilityMatchResult](interfaces/CapabilityMatchResult.md)

## Configuration

- [DiscoveryInitiatorConfig](interfaces/DiscoveryInitiatorConfig.md)
- [DiscoveryInitiatorOptions](interfaces/DiscoveryInitiatorOptions.md)
- [DiscoveryResponderConfig](interfaces/DiscoveryResponderConfig.md)
- [DiscoveryResponderOptions](interfaces/DiscoveryResponderOptions.md)
- [DISCOVERY\_CONFIG](variables/DISCOVERY_CONFIG.md)

## Core

- [ConsoleLogger](classes/ConsoleLogger.md)
- [DiscoveryInitiator](classes/DiscoveryInitiator.md)
- [DiscoveryResponder](classes/DiscoveryResponder.md)
- [Logger](interfaces/Logger.md)
- [createLogger](functions/createLogger.md)

## Discovery

- [BaseResponderInfo](interfaces/BaseResponderInfo.md)
- [CapabilityIntersection](interfaces/CapabilityIntersection.md)
- [CapabilityPreferences](interfaces/CapabilityPreferences.md)
- [CapabilityRequirements](interfaces/CapabilityRequirements.md)
- [ChainCapability](interfaces/ChainCapability.md)
- [ChainFeature](interfaces/ChainFeature.md)
- [ExtensionResponderInfo](interfaces/ExtensionResponderInfo.md)
- [NetworkInfo](interfaces/NetworkInfo.md)
- [ParameterSpec](interfaces/ParameterSpec.md)
- [PermissionModel](interfaces/PermissionModel.md)
- [QualifiedResponder](interfaces/QualifiedResponder.md)
- [ResponderFeature](interfaces/ResponderFeature.md)
- [ResponderPlatform](interfaces/ResponderPlatform.md)
- [TechnologyCapability](interfaces/TechnologyCapability.md)
- [TechnologyMatch](interfaces/TechnologyMatch.md)
- [TechnologyRequirement](interfaces/TechnologyRequirement.md)
- [TransactionType](interfaces/TransactionType.md)
- [ValidationRule](interfaces/ValidationRule.md)
- [VerificationInfo](interfaces/VerificationInfo.md)
- [WebResponderInfo](interfaces/WebResponderInfo.md)
- [ChainType](type-aliases/ChainType.md)
- [ResponderInfo](type-aliases/ResponderInfo.md)
- [ResponderType](type-aliases/ResponderType.md)

## Errors

- [ProtocolError](classes/ProtocolError.md)
- [ERROR\_CODES](variables/ERROR_CODES.md)
- [ERROR\_MESSAGES](variables/ERROR_MESSAGES.md)
- [RETRYABLE\_ERROR\_CODES](variables/RETRYABLE_ERROR_CODES.md)
- [SILENT\_FAILURE\_CODES](variables/SILENT_FAILURE_CODES.md)
- [getErrorCategory](functions/getErrorCategory.md)

## Events

- [DISCOVERY\_EVENTS](variables/DISCOVERY_EVENTS.md)

## Factory

- [createCapabilityMatcher](functions/createCapabilityMatcher.md)
- [createDiscoveryResponder](functions/createDiscoveryResponder.md)
- [createInitiatorDiscoverySetup](functions/createInitiatorDiscoverySetup.md)
- [createResponderDiscoverySetup](functions/createResponderDiscoverySetup.md)

## Features

- [RESPONDER\_FEATURES](variables/RESPONDER_FEATURES.md)

## Helpers

- [createCapabilityRequirements](variables/createCapabilityRequirements.md)
- [createResponderInfo](variables/createResponderInfo.md)

## Interfaces

- [RESPONDER\_INTERFACES](variables/RESPONDER_INTERFACES.md)

## Other

- [ValidationError](classes/ValidationError.md)
- [defaultLogger](variables/defaultLogger.md)
- [isValidTransportConfig](functions/isValidTransportConfig.md)
- [validateCapabilityPreferences](functions/validateCapabilityPreferences.md)
- [validateCapabilityRequirements](functions/validateCapabilityRequirements.md)
- [validateEventOrigin](functions/validateEventOrigin.md)
- [validateInitiatorInfo](functions/validateInitiatorInfo.md)
- [validateOrigin](functions/validateOrigin.md)
- [validateResponderInfo](functions/validateResponderInfo.md)
- [validateSecurityPolicy](functions/validateSecurityPolicy.md)
- [validateSessionId](functions/validateSessionId.md)
- [validateTimeout](functions/validateTimeout.md)
- [validateTransportConfig](functions/validateTransportConfig.md)

## Presets

- [CAPABILITY\_PRESETS](variables/CAPABILITY_PRESETS.md)
- [FEATURE\_PRESETS](variables/FEATURE_PRESETS.md)
- [RESPONDER\_PRESETS](variables/RESPONDER_PRESETS.md)
- [SECURITY\_PRESETS](variables/SECURITY_PRESETS.md)

## Protocol

- [ProtocolStateMachine](classes/ProtocolStateMachine.md)
- [BaseDiscoveryMessage](interfaces/BaseDiscoveryMessage.md)
- [DiscoveryCompleteEvent](interfaces/DiscoveryCompleteEvent.md)
- [DiscoveryError](interfaces/DiscoveryError.md)
- [DiscoveryErrorEvent](interfaces/DiscoveryErrorEvent.md)
- [DiscoveryRequestEvent](interfaces/DiscoveryRequestEvent.md)
- [DiscoveryResponseEvent](interfaces/DiscoveryResponseEvent.md)
- [DuplicateResponseDetails](interfaces/DuplicateResponseDetails.md)
- [InitiatorInfo](interfaces/InitiatorInfo.md)
- [TransportConfig](interfaces/TransportConfig.md)
- [DiscoveryMessage](type-aliases/DiscoveryMessage.md)
- [DiscoveryRequestEventHandler](type-aliases/DiscoveryRequestEventHandler.md)
- [DiscoveryResponseEventHandler](type-aliases/DiscoveryResponseEventHandler.md)
- [ErrorCategory](type-aliases/ErrorCategory.md)
- [DISCOVERY\_PROTOCOL\_VERSION](variables/DISCOVERY_PROTOCOL_VERSION.md)

## Security

- [OriginValidator](classes/OriginValidator.md)
- [RateLimiter](classes/RateLimiter.md)
- [SecurityManager](classes/SecurityManager.md)
- [SessionTracker](classes/SessionTracker.md)
- [OriginValidationResult](interfaces/OriginValidationResult.md)
- [RateLimitConfig](interfaces/RateLimitConfig.md)
- [SecurityPolicy](interfaces/SecurityPolicy.md)
- [SessionOptions](interfaces/SessionOptions.md)
- [SessionTrackingState](interfaces/SessionTrackingState.md)
- [createSecurityPolicy](functions/createSecurityPolicy.md)

## State Machine

- [InitiatorStateMachine](classes/InitiatorStateMachine.md)
- [InitiatorStateMachineConfig](interfaces/InitiatorStateMachineConfig.md)
- [StateTimeouts](interfaces/StateTimeouts.md)
- [StateTransitionEvent](interfaces/StateTransitionEvent.md)
- [ProtocolState](type-aliases/ProtocolState.md)
- [createInitiatorStateMachine](functions/createInitiatorStateMachine.md)
- [createProtocolStateMachine](functions/createProtocolStateMachine.md)

## Utils

- [EventEmitter](classes/EventEmitter.md)
