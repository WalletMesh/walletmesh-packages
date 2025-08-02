# Quint Formal Specification Guide

## Overview

This document describes the Quint formal specification modules for the WalletMesh Discovery Protocol. These specifications enable formal verification of the protocol's security properties and serve as a precise reference for implementations.

## Quint Module Structure

The Quint specifications are organized into several modules, each focusing on a specific aspect of the protocol:

### Core Modules

#### 1. `types.qnt` - Type Definitions
**Purpose**: Defines all core types used across the protocol specification.

**Key Types**:
- `ProtocolState`: The 4-state model (IDLE, DISCOVERING, COMPLETED, ERROR)
- `TransportConfig`: Transport configuration for wallet connections
- `SecurityEvent`: Security event tracking (imported from security_events.qnt)
- `ProtocolError`: Error handling with categories and codes
- `WalletInfo`, `DiscoveryRequestEvent`, `DiscoveryResponseEvent`: Core protocol messages

**Important Notes**:
- Uses `transportType` instead of `type` (as `type` is a Quint reserved keyword)
- Includes comprehensive error code constants (1000-5999 ranges)
- Enhanced with security event support in v0.2.0

#### 2. `protocol.qnt` - Complete Protocol Implementation
**Purpose**: Full protocol implementation with all features and security mechanisms.

**Features**:
- Complete state machine implementation
- Message handling and validation
- Security enforcement
- Transport configuration support

#### 3. `protocol_simple.qnt` - Simplified Protocol
**Purpose**: Minimal implementation for formal verification and understanding core concepts.

**Features**:
- Essential protocol flow
- Basic security properties
- Simplified for verification efficiency

#### 4. `protocol_enhanced.qnt` - Security-Enhanced Protocol
**Purpose**: Security-focused implementation with comprehensive validation.

**Features**:
- Integrated origin validation
- Rate limiting enforcement
- Security event tracking
- Multi-layered security validation

### Security Modules

#### 5. `security.qnt` - Security Properties
**Purpose**: Defines security invariants and properties that must hold.

**Key Properties**:
- Origin consistency
- Session uniqueness
- No unauthorized state transitions
- Transport configuration validation

#### 6. `security_events.qnt` - Security Event System (NEW in v0.2.0)
**Purpose**: Comprehensive security event tracking and analysis.

**Features**:
- `SecurityEventType` enum with all event categories
- Event severity levels (Low, Medium, High, Critical)
- Event creation helpers
- Security statistics calculation

**Event Types**:
- `OriginBlocked`: Origin validation failure
- `RateLimitExceeded`: Rate limit triggered
- `SessionReplay`: Session ID reuse attempt
- `OriginSpoofingAttempt`: Origin spoofing detected
- `InvalidSignature`: Signature verification failure
- `CapabilityEnumeration`: Capability enumeration attempt

#### 7. `origin_validation.qnt` - Origin Validation
**Purpose**: Origin validation logic with multi-environment support.

**Features**:
- Browser environment validation
- Non-browser origin proof validation (NEW in v0.2.0)
- Origin policy enforcement
- Wildcard pattern matching

**Multi-Environment Support**:
```quint
type OriginProof = {
  method: str,      // "event-origin" or "proof"
  timestamp: int,
  nonce: str,
  signature: str
}
```

#### 8. `rate_limiting.qnt` - Rate Limiting
**Purpose**: Rate limiting implementation to prevent abuse.

**Features**:
- Sliding window algorithm
- Per-origin tracking
- Burst handling
- Block duration support

### Testing Modules

#### 9. `test_properties.qnt` - Test Properties (NEW in v0.2.0)
**Purpose**: Comprehensive test properties matching TypeScript test suite.

**Test Categories**:
- Message validation tests
- State machine transition tests
- Capability matching tests
- Security enforcement tests
- Attack scenario tests

**Key Properties**:
- `ValidDiscoveryRequestTest`: Message structure validation
- `UniqueSessionIdsTest`: Session uniqueness enforcement
- `ValidStateTransitionsTest`: State machine correctness
- `OriginValidationEnforcedTest`: Security validation
- `AllTestsPass`: Master test property

#### 10. `attacks.qnt` - Attack Scenarios
**Purpose**: Models various attack scenarios to verify security properties.

**Attack Types**:
- Message interception
- Session hijacking
- Replay attacks
- Origin spoofing
- Rate limit bypass
- Capability enumeration

## Implementation Differences

### Transport Configuration Field Name
- **Quint**: Uses `transportType` field
- **TypeScript**: Uses `type` field
- **Reason**: `type` is a reserved keyword in Quint
- **Resolution**: Documented as acceptable implementation difference

### Adapter Configuration Type
- **Quint**: Uses `str` (JSON string)
- **TypeScript**: Uses `Record<string, unknown>`
- **Reason**: Type system differences
- **Resolution**: Both approaches are valid

## Verification Commands

### Basic Verification
```bash
# Verify core protocol properties
quint verify protocol.qnt --invariant=ValidStateTransitions

# Verify security properties
quint verify security.qnt --invariant=SecurityInvariant

# Run attack scenarios
quint run attacks.qnt --max-steps=100
```

### Test Properties
```bash
# Run all test properties
quint test test_properties.qnt --max-samples=1000

# Run specific test
quint test test_properties.qnt --test=ValidDiscoveryRequestTest
```

### Security Analysis
```bash
# Verify origin validation
quint verify origin_validation.qnt --invariant=AllOriginsValidated

# Check rate limiting
quint verify rate_limiting.qnt --invariant=RateLimitsEnforced
```

## Best Practices

### 1. State Machine Modeling
- Keep state count minimal (4 states)
- Make transitions explicit
- Validate all state changes

### 2. Security Properties
- Define properties before implementation
- Test both positive and negative cases
- Include attack scenarios

### 3. Type Safety
- Use discriminated unions for message types
- Define clear type hierarchies
- Avoid any/unknown types

### 4. Verification Strategy
- Start with simple properties
- Build up to complex invariants
- Use counterexamples to improve

## Recent Enhancements (v0.2.0)

### New Modules Added
1. **security_events.qnt**: Comprehensive security event system
2. **test_properties.qnt**: Test properties matching TypeScript tests

### Enhanced Modules
1. **types.qnt**: Added error categories and security event imports
2. **origin_validation.qnt**: Added multi-environment support

### Alignment with Implementation
These enhancements bring the Quint specification closer to the TypeScript implementation while maintaining formal verification benefits.

## Conclusion

The Quint specifications provide a formal foundation for the WalletMesh Discovery Protocol, enabling:
- Mathematical verification of security properties
- Clear reference for implementations
- Automated testing of protocol behavior
- Confidence in protocol correctness

By maintaining these specifications alongside the implementation, we ensure the protocol remains secure and behaves as intended.