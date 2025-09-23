# Discovery Package - CLAUDE.md

This file provides detailed implementation information for the Discovery package (@walletmesh/discovery).

## Package Overview

**Version 0.1.0** - Development Release

The @walletmesh/discovery package implements a **cross-origin discovery protocol** for WalletMesh. The protocol uses 4 states and 4 message types to provide secure, universal discovery between initiators and responders. Connection establishment is handled separately by higher-level libraries (modal-core, modal-react) using the transport configuration provided during discovery.

### Key Features

- **4 core states**: Clear state model with terminal states for proper error handling
- **4 message types**: Complete discovery protocol with request, response, completion, and error handling
- **Flat JSON structures**: Clear message format with no nested objects
- **Chain-based matching**: Direct chain array support
- **Security through simplicity**: Focus on essential security properties
- **Transport configuration**: Provides connection details for modal-core/modal-react

### Formal Protocol Specifications

This implementation is based on a consolidated protocol specification:
- **[specs/PROTOCOL.md](specs/PROTOCOL.md)**: Complete protocol specification including architecture, state machine, implementation guide, and security model

## Protocol Change Management

### Important: Synchronizing Protocol Changes

When making changes to the discovery protocol, it is **critical** to update all related documentation and specifications to maintain consistency. The protocol is formally specified in multiple locations that must remain synchronized.

### Protocol Change Checklist

When modifying the protocol, follow this checklist to ensure all components remain synchronized:

- [ ] **Update TypeScript Implementation**
  - [ ] Update types in `src/core/types.ts`
  - [ ] Update constants in `src/core/constants.ts`
  - [ ] Update state machine in `src/core/ProtocolStateMachine.ts`
  - [ ] Update initiator/responder logic as needed

- [ ] **Update Protocol Specifications**
  - [ ] Update `specs/PROTOCOL.md` with new protocol details, state changes, implementation requirements, and security model updates
  - [ ] Note: The protocol specification has been consolidated into a single document

- [ ] **Update Quint Formal Specifications**
  - [ ] Update `quint/discovery/protocol.qnt` main protocol specification
  - [ ] Update `quint/discovery/types.qnt` for type changes
  - [ ] Update `quint/discovery/protocol_simple.qnt` and `protocol_enhanced.qnt`
  - [ ] Update security models in `quint/discovery/security*.qnt`
  - [ ] Run Quint verification: `quint verify quint/discovery/protocol.qnt`

- [ ] **Update Tests**
  - [ ] Update unit tests to reflect protocol changes
  - [ ] Add tests for new functionality
  - [ ] Update attack scenario tests if security model changes
  - [ ] Ensure all tests pass: `pnpm test`

- [ ] **Update Documentation**
  - [ ] Update this CLAUDE.md file with change summary in Recent Changes section
  - [ ] Update examples to use new API/types
  - [ ] Update migration guide if breaking changes

### Common Protocol Elements to Keep Synchronized

1. **State Machine States**: Currently 4 states (IDLE, DISCOVERING, COMPLETED, ERROR)
2. **Message Types**: CapabilityRequest and CapabilityResponse
3. **Event Types**: discovery:wallet:request, discovery:wallet:response, discovery:wallet:complete, discovery:wallet:error
4. **Security Model**: Session-based replay protection, duplicate response detection
5. **Transport Configuration**: Types and structure must match across all specs

## Architecture Overview

### Core Module Structure

**Core Module** (`src/core/`):
- `types.ts`: Protocol types (4 message types, flat structures)
- `constants.ts`: Protocol version and event types
- `ProtocolStateMachine.ts`: Formal 4-state machine implementation (IDLE, DISCOVERING, COMPLETED, ERROR)
- `index.ts`: Core exports

**Security Module** (`src/security/`) - **Internal Use Only**:
- `SessionTracker.ts`: Session tracking for replay prevention
- `OriginValidator.ts`: Origin validation and policy enforcement
- `RateLimiter.ts`: Per-origin rate limiting
- **Note**: Security utilities are internal implementation details and exported only for specific use cases

**Initiator Module** (`src/initiator/`):
- `DiscoveryInitiator.ts`: Discovery broadcast and collection
- `factory.ts`: Factory functions for initiator setup

**Responder Module** (`src/responder/`):
- `DiscoveryResponder.ts`: Responder announcement logic
- `CapabilityMatcher.ts`: Capability intersection calculation
- `factory.ts`: Factory functions for responder setup

**Testing Module** (`src/testing/`):
- Mock implementations for testing
- Test scenario builders
- Testing utilities

**Extension Module** (`src/extension/`):
- `browserApi.ts`: Cross-browser API abstraction layer
- `ContentScriptRelay.ts`: Message relay for content scripts
- `WalletDiscovery.ts`: Discovery implementation for background scripts
- Supports Chrome, Firefox, Edge, Opera, and polyfilled extensions

## Cross-Browser Extension Support

### Browser API Abstraction

The discovery package provides automatic cross-browser compatibility through a unified API abstraction layer:

**Supported Browsers**:
- Chrome (uses `chrome.*` namespace with callbacks)
- Firefox (uses `browser.*` namespace with Promises)
- Edge (uses `chrome.*` namespace)
- Opera (uses `chrome.*` namespace)
- Extensions using WebExtension polyfill

**Auto-Detection**:
The abstraction layer automatically detects which API is available:
1. Checks for `browser.*` namespace first (Firefox, polyfilled)
2. Falls back to `chrome.*` namespace (Chrome, Edge, Opera)
3. Converts callback-based Chrome APIs to Promises automatically
4. Provides consistent Promise-based interface across all browsers

**Usage**:
```typescript
import { getBrowserAPI, ContentScriptRelay, WalletDiscovery } from '@walletmesh/discovery/extension';

// Auto-detects and uses appropriate browser API
const api = getBrowserAPI();
console.log(`Running in: ${api.apiType}`); // 'chrome' | 'browser' | 'none'
console.log(`Extension ID: ${api.runtime.id}`);

// Components work automatically in all browsers
const relay = new ContentScriptRelay(); // Works in Chrome and Firefox
const discovery = new WalletDiscovery(config); // Works in all browsers
```

## Protocol Design

### Four Message Types

**1. Capability Request** (`discovery:wallet:request`):
```typescript
interface DiscoveryRequestEvent {
  type: 'discovery:wallet:request';
  sessionId: string;      // crypto.randomUUID()
  required: {             // Required capabilities
    technologies: Array<{
      type: string;       // 'evm' | 'solana' | 'aztec'
      interfaces: string[];
      features?: string[];
    }>;
    features: string[];
  };
  origin: string;         // Initiator origin
  initiatorInfo: InitiatorInfo;
}
```

**2. Capability Response** (`discovery:wallet:response`):
```typescript
interface DiscoveryResponseEvent {
  type: 'discovery:wallet:response';
  responderId: string;    // crypto.randomUUID() (ephemeral)
  sessionId: string;      // Must match request
  rdns: string;           // 'com.example.wallet'
  name: string;           // 'Example Responder'
  icon: string;           // Data URI
  matched: {              // Capability intersection
    required: CapabilityRequirements;
  };
  transportConfig?: TransportConfig; // Optional transport configuration
}
```

**3. Discovery Complete** (`discovery:wallet:complete`):
```typescript
interface DiscoveryCompleteEvent {
  type: 'discovery:wallet:complete';
  sessionId: string;      // Session identifier
  reason: 'timeout' | 'manual-stop' | 'max-responders';
  respondersFound: number; // Number of qualified responders
}
```

**4. Discovery Error** (`discovery:wallet:error`):
```typescript
interface DiscoveryErrorEvent {
  type: 'discovery:wallet:error';
  sessionId: string;      // Session identifier
  errorCode: number;      // Error code for categorization
  errorMessage: string;   // Human-readable error message
  errorCategory: ErrorCategory; // Error category for handling
}
```

### Four States

```
1. IDLE        → No active session
2. DISCOVERING → Collecting responder announcements
3. COMPLETED   → Discovery finished successfully (terminal state)
4. ERROR       → Discovery failed due to security violation (terminal state)
```

**State Transitions**:
- IDLE → DISCOVERING (start discovery)
- DISCOVERING → COMPLETED (discovery timeout or manual completion)
- DISCOVERING → ERROR (security violation, e.g., duplicate response)
- COMPLETED/ERROR → IDLE (reset for new discovery)

### Connection Handling

**Note**: Connection establishment is handled separately by higher-level libraries (e.g., modal-core, modal-react) using the `transportConfig` information provided in the responder announcement. The discovery protocol only provides the information needed to establish a connection, not the connection itself.

### Protocol Flow

```
1. Initiator broadcasts capability request with requirements
2. Responders check if they can fulfill requirements
3. Qualified responders announce with transport config (silent if unqualified)
4. Initiator collects responder announcements
5. Higher-level libraries use transport config to establish connection
```

## Key Implementation Components

### Protocol State Machine

**Purpose**: Enforce valid state transitions and protocol correctness

**States**:
- `IDLE`: Initial state, waiting for discovery
- `DISCOVERING`: Active discovery session
- `COMPLETED`: Discovery finished successfully (terminal state)
- `ERROR`: Discovery failed due to security violation (terminal state)

**Key Features**:
- State transition validation with guards
- Automatic timeouts per state
- Event emission for state changes
- Security violation detection (duplicate responses)
- Terminal states require explicit reset

**Base State Machine** (`ProtocolStateMachine`):
```typescript
const stateMachine = new ProtocolStateMachine();

stateMachine.on('stateChange', (event) => {
  console.log(`State: ${event.fromState} → ${event.toState}`);
});

// Valid transitions
stateMachine.transition('DISCOVERING'); // Start discovery
stateMachine.transition('COMPLETED'); // Discovery successful
stateMachine.transition('ERROR', { error }); // Security violation
```

### InitiatorStateMachine

**Purpose**: Initiator-specific state machine with automatic protocol message dispatch

**Key Features**:
- Extends `ProtocolStateMachine` with automatic message sending
- Sends `discovery:wallet:request` on IDLE → DISCOVERING
- Sends `discovery:wallet:complete` on DISCOVERING → COMPLETED
- Sends `discovery:wallet:error` on DISCOVERING → ERROR
- Single-use pattern (terminal states require new instance)

**Usage**:
```typescript
const stateMachine = new InitiatorStateMachine({
  eventTarget: window,
  sessionId: crypto.randomUUID(),
  origin: window.location.origin,
  initiatorInfo: {
    name: 'My DApp',
    url: 'https://mydapp.com',
    icon: 'data:image/svg+xml;base64,...'
  },
  requirements: {
    technologies: [{
      type: 'evm',
      interfaces: ['eip-1193']
    }],
    features: ['account-management']
  }
});

// Start discovery - request message sent automatically
stateMachine.transition('DISCOVERING');

// On completion - complete message sent automatically
stateMachine.transition('COMPLETED', { 
  reason: 'timeout',
  respondersFound: 3 
});
```

### DiscoveryInitiator (Initiator-side)

**Purpose**: Responder discovery based on capability matching

**Key Methods**:
- `startDiscovery()`: Start discovery session (creates InitiatorStateMachine internally)
- `stopDiscovery()`: Cancel discovery
- `getQualifiedResponders()`: Get qualified responders

**Implementation Details**:
- Uses `InitiatorStateMachine` internally for state management and message dispatch
- Handles response collection and duplicate detection
- Manages discovery lifecycle and security validation

**Usage**:
```typescript
const initiator = createDiscoveryInitiator({
  requirements: {
    technologies: [{
      type: 'evm',
      interfaces: ['eip-1193']
    }],
    features: ['account-management']
  },
  initiatorInfo: {
    name: 'My DApp',
    url: 'https://mydapp.com',
    icon: 'data:image/svg+xml;base64,...'
  }
});

// Start discovery - InitiatorStateMachine created internally
// Request message sent automatically by state machine
const responders = await initiator.startDiscovery();
// User selects responder
```

### DiscoveryResponder (Responder-side)

**Purpose**: Capability-based responder announcement

**Key Methods**:
- `startListening()`: Listen for discovery requests
- `stopListening()`: Stop and cleanup
- `updateWalletInfo()`: Update supported capabilities

**Security Features**:
- Origin validation (HTTPS + allowlist)
- Session tracking (Set<string>)
- Rate limiting (requests per minute)

**Usage**:
```typescript
const responder = createDiscoveryResponder({
  walletInfo: {
    uuid: 'my-responder',
    rdns: 'com.mycompany.wallet',
    name: 'My Responder',
    icon: 'data:image/png;base64,...',
    type: 'extension',
    chains: [/* chain capabilities */],
    features: [/* feature capabilities */]
  },
  securityPolicy: {
    allowedOrigins: ['https://trusted-initiator.com'],
    requireHttps: true
  }
});

responder.startListening();
```

### CapabilityMatcher

**Purpose**: Capability intersection calculation

**Algorithm**:
1. Check if responder can fulfill all required capabilities
2. Calculate intersection of responder and requested capabilities
3. Return match result with intersection details

```typescript
class CapabilityMatcher {
  private walletInfo: WalletInfo;
  
  constructor(walletInfo: WalletInfo) {
    this.walletInfo = walletInfo;
  }
  
  matchCapabilities(request: CapabilityRequest): CapabilityMatchResult {
    // Check if can fulfill all required capabilities
    const canFulfillChains = this.checkChains(request.required.chains);
    const canFulfillFeatures = this.checkFeatures(request.required.features);
    const canFulfillInterfaces = this.checkInterfaces(request.required.interfaces);
    
    return {
      canFulfill: canFulfillChains && canFulfillFeatures && canFulfillInterfaces,
      intersection: /* calculated intersection */
    };
  }
}
```

### Security Components (Internal Implementation)

**Note**: These security components are primarily used internally by the discovery protocol. While they are exported for specific use cases, external packages should generally implement their own security layers tailored to their specific requirements rather than depending on these internal implementations.

**SessionTracker**:
```typescript
class SessionTracker {
  private usedSessions = new Set<string>();
  
  isUsed(sessionId: string): boolean {
    return this.usedSessions.has(sessionId);
  }
  
  markUsed(sessionId: string): void {
    this.usedSessions.add(sessionId);
  }
  
  cleanup(): void {
    // Clear all sessions every hour
    this.usedSessions.clear();
  }
}
```

**Security Logging**:
- Security events are logged directly to the console using `console.warn`
- Origin validation failures: `[WalletMesh] Origin blocked: <origin>`
- Rate limit violations: `[WalletMesh] Rate limit exceeded for origin: <origin>`
- Session replay attempts: `[WalletMesh] Session replay detected`
- Simple, browser-native logging approach for transparency

**OriginValidator**:
```typescript
class OriginValidator {
  constructor(private allowedOrigins: string[] = []) {}
  
  isAllowed(origin: string): boolean {
    // Check allowlist if configured
    if (this.allowedOrigins.length > 0) {
      return this.allowedOrigins.includes(origin);
    }
    
    // Default: HTTPS or localhost
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' || url.hostname === 'localhost';
    } catch {
      return false;
    }
  }
}
```

### Logger Interface

**Purpose**: Standardized logging interface compatible with modal-core

The discovery package provides a logger interface that allows applications to inject their own logging implementation. This ensures consistent logging across the WalletMesh ecosystem.

**Logger Interface**:
```typescript
interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}
```

**Default Implementation**:
```typescript
// ConsoleLogger is provided as the default implementation
const logger = new ConsoleLogger('[WalletMesh]');
```

**Usage with Components**:
```typescript
// Inject custom logger into DiscoveryInitiator
const initiator = createDiscoveryInitiator({
  requirements: { /* ... */ },
  initiatorInfo: { /* ... */ },
  logger: myCustomLogger  // Optional: defaults to ConsoleLogger
});

// Inject custom logger into DiscoveryResponder
const responder = createDiscoveryResponder({
  responderInfo: { /* ... */ },
  securityPolicy: { /* ... */ },
  logger: myCustomLogger  // Optional: defaults to ConsoleLogger
});
```

**Creating Custom Loggers**:
```typescript
// Example: Silent logger for testing
const silentLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
};

// Example: Logger with custom formatting
class CustomLogger implements Logger {
  private prefix: string;
  
  constructor(prefix: string) {
    this.prefix = prefix;
  }
  
  debug(message: string, data?: unknown) {
    if (process.env.DEBUG) {
      console.debug(`[${this.prefix}] ${message}`, data);
    }
  }
  
  info(message: string, data?: unknown) {
    console.info(`[${this.prefix}] ${message}`, data);
  }
  
  warn(message: string, data?: unknown) {
    console.warn(`[${this.prefix}] ⚠️ ${message}`, data);
  }
  
  error(message: string, error?: unknown) {
    console.error(`[${this.prefix}] ❌ ${message}`, error);
  }
}
```

**Log Levels Used**:
- **debug**: Detailed information for debugging (capability matching, state transitions)
- **info**: General informational messages (discovery started/stopped)
- **warn**: Security events and warnings (rate limiting, origin validation failures)
- **error**: Error conditions (state machine errors, initialization failures)

## Types and Interfaces

### Core Protocol Types

```typescript
// Wallet information
interface WalletInfo {
  id: string;           // Unique identifier
  rdns: string;         // Reverse domain name
  name: string;         // Display name
  icon: string;         // Data URI or URL
  chains: string[];     // Supported chains
  transportConfig?: TransportConfig; // Optional transport configuration
}

// Transport configuration (new in 0.1.0)
interface TransportConfig {
  type: 'extension' | 'popup' | 'websocket' | 'injected';
  extensionId?: string;        // Chrome extension ID (for extension transport)
  popupUrl?: string;           // Popup window URL (for popup transport)
  websocketUrl?: string;       // WebSocket endpoint URL (for websocket transport)
  walletAdapter?: string;      // Wallet adapter class name
  adapterConfig?: Record<string, unknown>;  // Additional adapter configuration
}

// Chain identifiers (CAIP-2 compliant)
type ChainId = 
  | `eip155:${number}`        // EVM chains: eip155:1, eip155:137
  | `solana:${string}`        // Solana: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp
  | `aztec:${string}`         // Aztec: aztec:mainnet
  | `bip122:${string}`;       // Bitcoin: bip122:000000000019d6689c085ae165831e93

// Security configuration
interface SecurityConfig {
  allowedOrigins?: string[];
  requireHttps?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}
```

### State Management

```typescript
// Initiator state (4-state model)
interface InitiatorState {
  state: 'IDLE' | 'DISCOVERING' | 'COMPLETED' | 'ERROR';
  sessionId?: string;
  responders: CapabilityResponse[];
  error?: Error;
}

// Responder state
interface ResponderState {
  state: 'IDLE' | 'CONNECTING' | 'CONNECTED';
  usedSessions: Set<string>;
  connection?: Connection;
}
```

## Factory Functions

### Responder Info Creation

```typescript
// Chain-specific helpers
createWalletInfo.ethereum(config)     // EVM with ['eip155:1']
createWalletInfo.polygon(config)      // EVM with ['eip155:137']
createWalletInfo.solana(config)       // Solana with ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']
createWalletInfo.multiChain(config)   // Multiple chains

// Security policies
createSecurityPolicy.strict()         // HTTPS required, strict validation
createSecurityPolicy.development()    // Localhost allowed, relaxed
```

### Setup Functions

```typescript
// Complete initiator setup
const initiatorSetup = createInitiatorDiscoverySetup({
  technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
  features: ['account-management'],
  timeout: 3000
});

// Complete responder setup
const responderSetup = createResponderDiscoverySetup({
  walletInfo: myWalletInfo,
  security: strictPolicy
});
```

## Transport Configuration

**Purpose**: Allow responders to specify how initiators should connect to them

**Transport Types**:
- `extension`: Browser extension (requires extensionId)
- `popup`: Popup window (requires popupUrl)
- `websocket`: WebSocket connection (requires websocketUrl)
- `injected`: Injected provider (e.g., window.ethereum)

**Usage Example**:
```typescript
// Responder announces with transport config
const walletInfo = {
  // ... other wallet info ...
  transportConfig: {
    type: 'extension',
    extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn'
  }
};

// Initiator receives and uses transport config
const responder = await initiator.startDiscovery()[0];
if (responder.transportConfig?.type === 'extension') {
  // Connect to Chrome extension
  chrome.runtime.connect(responder.transportConfig.extensionId);
}
```

## Protocol Features

### Core Security Properties
- ✅ Origin validation
- ✅ Session uniqueness  
- ✅ User consent
- ✅ Session isolation
- ✅ Replay prevention
- ✅ RDNS verification

### Essential Functionality
- ✅ Multi-chain support
- ✅ Cross-origin discovery
- ✅ User choice
- ✅ CustomEvent transport
- ✅ Extension compatibility
- ✅ Transport configuration

### Protocol Metrics

| Aspect | Value |
|--------|-------|
| States | 4 |
| Messages | 4 |
| Typical LoC | ~400 |
| Test Cases | ~40 |
| Implementation Time | ~2 days |
| Security Audit Time | ~2 days |

## Performance Characteristics

### Message Processing

**Message Validation**:
- Flat JSON structures
- 4 message types
- Direct field validation
- Chain-based matching only

**State Management**:
- 4 states with clear transitions
- Straightforward state tracking
- Session-based management
- Efficient memory usage

**Network Efficiency**:
- Compact messages (8KB max)
- Fast parsing
- Efficient bandwidth usage
- Mobile-optimized

## Testing Strategy

### Test Categories

**Unit Tests**:
- Message validation (4 types)
- State transitions (4 states)
- Chain matching
- Security validation

**Integration Tests**:
- Discovery flow (3 steps)
- Connection flow
- Error scenarios
- Cross-platform compatibility

**Security Tests** (Focused):
- Origin validation
- Session replay prevention
- Rate limiting
- User consent enforcement

### Testing Best Practices and Patterns

Based on comprehensive test fixes, follow these patterns for effective discovery package testing:

#### 1. Fake Timer Usage (Critical)
**Always use fake timers in tests to prevent slow execution and timeouts:**

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// In tests - advance timers instead of waiting
it('should handle timeout scenarios', async () => {
  const promise = connectionManager.startDiscovery();
  
  // Advance fake timers instead of real waiting
  await vi.advanceTimersByTimeAsync(1000);
  
  const result = await promise;
  expect(result).toBe(expectedValue);
});
```

**Anti-patterns to avoid:**
- `await new Promise(resolve => setTimeout(resolve, delay))` in tests
- Tests with `{ timeout: 10000 }` configurations (indicates real timer usage)
- Using `vi.useRealTimers()` unless absolutely necessary

#### 2. Mock Usage for Component Pairs
**Use mocks for the "other" component in initiator/responder pairs:**

```typescript
// For testing DiscoveryResponder, use real responder with MockEventTarget
describe('DiscoveryResponder', () => {
  let responder: DiscoveryResponder;
  let mockEventTarget: MockEventTarget;
  
  beforeEach(() => {
    mockEventTarget = new MockEventTarget();
    responder = new DiscoveryResponder({
      responderInfo: createTestResponderInfo.ethereum(),
      eventTarget: mockEventTarget, // Use mock for event handling
      securityPolicy: { /* config */ }
    });
  });
  
  it('should respond to valid requests', () => {
    responder.startListening();
    
    const request = createTestCapabilityRequest();
    const event = new CustomEvent('discovery:request', { detail: request });
    
    mockEventTarget.dispatchEvent(event);
    
    // Check responses using mock's inspection methods
    const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
    expect(responses).toHaveLength(1);
  });
});
```

#### 3. Correct API Usage Patterns
**Use the correct SessionTracker API methods:**

```typescript
// Correct SessionTracker usage
const tracker = new SessionTracker();

// Track a session
tracker.trackSession(origin, sessionId);

// Check if session exists
expect(tracker.hasSession(origin, sessionId)).toBe(true);

// WRONG methods (these don't exist):
// tracker.markUsed(sessionId, origin);  ❌
// tracker.isUsed(sessionId, origin);    ❌
```

**Use correct MockEventTarget inspection methods:**
```typescript
// Correct way to inspect dispatched events
const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');

// WRONG method (doesn't exist):
// const responses = responder.getSentResponses();  ❌
```

#### 4. Configuration Property Names
**Use correct configuration property names:**

```typescript
// Correct DiscoveryResponderConfig
const config: DiscoveryResponderConfig = {
  responderInfo: createTestResponderInfo.ethereum(), // ✅ Correct
  eventTarget: mockEventTarget,
  securityPolicy: { /* ... */ }
};

// WRONG property name:
// walletInfo: createTestResponderInfo.ethereum()  ❌
```

#### 5. Browser Environment Simulation
**Properly set up window object for browser environment tests:**

```typescript
describe('Browser environment tests', () => {
  beforeEach(() => {
    // Set up window.location.origin for browser environment simulation
    globalThis.window = {
      location: {
        origin: 'https://trusted-dapp.com'
      }
    } as Window & typeof globalThis;
  });
  
  afterEach(() => {
    // Clean up window simulation
    if (originalWindow) {
      globalThis.window = originalWindow;
    } else {
      delete (globalThis as unknown as Record<string, unknown>).window;
    }
  });
});
```

#### 6. State Transition Timing
**Ensure proper timing for state transitions to prevent invalid transitions:**

```typescript
it('should handle concurrent state transitions', async () => {
  initiator.startDiscovery();
  
  // Allow discovery to start properly
  await vi.advanceTimersByTimeAsync(100);
  
  // Then advance to test transition timing
  // Use 900ms instead of 990ms to prevent completion before transition
  await vi.advanceTimersByTimeAsync(900);
  
  expect(initiator.getCurrentState()).toBe('DISCOVERING');
});
```

#### 7. Type Casting for Private Property Access
**When testing private properties, use proper TypeScript casting:**

```typescript
// Access private properties for testing
const privateConnectionManager = connectionManager as unknown as {
  isDiscovering: boolean;
  currentSessionId: string | null;
};

expect(privateConnectionManager.isDiscovering).toBe(true);
```

#### 8. Event Validation Patterns
**Ensure proper event structure validation:**

```typescript
it('should validate event structure', () => {
  const responses = mockEventTarget.getDispatchedEventsOfType('responder:announce');
  expect(responses).toHaveLength(1);
  
  const response = responses[0].detail;
  expect(response).toMatchObject({
    type: 'responder:announce',
    sessionId: expect.any(String),
    responderId: expect.any(String),
    rdns: expect.any(String),
    name: expect.any(String),
    matched: expect.any(Object)
  });
});
```

#### 9. Origin Validation Testing
**Test origin validation with proper security configurations:**

```typescript
it('should validate origins correctly', () => {
  const config = {
    responderInfo: createTestResponderInfo.ethereum(),
    eventTarget: mockEventTarget,
    securityPolicy: {
      allowedOrigins: ['https://trusted-dapp.com'],
      requireHttps: true,
    },
  };
  
  const responder = new DiscoveryResponder(config);
  responder.startListening();
  
  // Test with valid origin
  const validRequest = createTestCapabilityRequest({
    origin: 'https://trusted-dapp.com'
  });
  
  mockEventTarget.dispatchEvent(
    new CustomEvent('discovery:request', { detail: validRequest })
  );
  
  expect(mockEventTarget.getDispatchedEventsOfType('responder:announce')).toHaveLength(1);
});
```

#### 10. Common Test Failure Patterns and Solutions

**Timeout Errors (10000ms)**:
- **Cause**: Using real setTimeout instead of fake timers
- **Solution**: Always use `vi.useFakeTimers()` and `vi.advanceTimersByTimeAsync()`

**"Invalid state transition" Errors**:
- **Cause**: Timing issues with state machine transitions
- **Solution**: Adjust timing to ensure proper state machine flow

**"Function does not exist" Errors**:
- **Cause**: Using incorrect API method names
- **Solution**: Check actual implementation for correct method names

**"Origin validation failed" Errors**:
- **Cause**: Missing window.location.origin in browser environment tests
- **Solution**: Properly simulate window object with location.origin

**"Cannot read properties of undefined" Errors**:
- **Cause**: Incorrect configuration property names
- **Solution**: Use correct property names from type definitions

### Test File Organization

Organize tests by component and functionality:

```
tests/
├── core/
│   ├── ProtocolStateMachine.test.ts
│   └── types.test.ts
├── initiator/
│   ├── DiscoveryInitiator.test.ts
│   ├── DiscoveryInitiator.additional.test.ts
│   └── ConnectionManager.timeout-edge.test.ts
├── responder/
│   ├── DiscoveryResponder.test.ts
│   ├── DiscoveryResponder.node.test.ts
│   └── CapabilityMatcher.test.ts
└── security/
    ├── OriginValidator.test.ts
    ├── SessionTracker.edge.test.ts
    └── RateLimiter.test.ts
```

### Test Maintenance Guidelines

1. **Keep tests up-to-date**: When changing APIs, update corresponding tests immediately
2. **Use descriptive test names**: Clearly indicate what scenario is being tested
3. **Test both success and failure paths**: Include edge cases and error scenarios
4. **Maintain test data consistency**: Use test utilities like `createTestCapabilityRequest()`
5. **Document complex test scenarios**: Add comments explaining non-obvious test logic

### Test Data

```typescript
// Test responder
const testResponder = createTestResponderInfo({
  chains: ['eip155:1', 'eip155:137'],
  rdns: 'com.test.responder'
});

// Test scenario
const testScenario = createDiscoveryTestScenario({
  chains: ['eip155:1'],
  expectedResponders: 1,
  timeout: 1000
});
```

## Build & Development

### Build Commands

- **Build**: `pnpm build`
- **Test**: `pnpm test`
- **Type check**: `pnpm type-check`
- **Lint**: `pnpm lint`

### Development Workflow

1. **Add new chain support**: Just add to chain ID union type
2. **Update security**: Modify simple security policy
3. **Add features**: Extensions to base functionality
4. **Test changes**: Run test suite

## Common Issues

### Discovery Issues

**Problem**: Responder not announcing
**Solution**: Check if responder supports any requested chains

**Problem**: No responders found
**Solution**: Verify initiator and responder are using same chain identifiers

### Security Issues

**Problem**: Origin validation failing
**Solution**: Check allowedOrigins configuration or HTTPS requirement

**Problem**: Rate limiting triggered
**Solution**: Adjust rate limiting configuration or implement backoff

### Implementation Issues

**Problem**: State transition errors
**Solution**: Check valid transitions (4 states)

**Problem**: Message validation failing
**Solution**: Flat message structure - check required fields only

## Best Practices

### For Initiator Developers

- **Use minimal chain requests**: Only request chains you actually need
- **Handle timeouts gracefully**: 3-second discovery timeout
- **Present clear responder choices**: Show responder names and supported chains
- **Implement retry logic**: Retry with new session ID

### For Responder Developers

- **Implement security**: Origin validation + rate limiting
- **Support standard chains**: Use standard chain identifiers
- **Provide clear user consent**: Approval/rejection dialog
- **Clean up resources**: Session cleanup every hour

### For Security

- **Focus on real threats**: Visual phishing, supply chain attacks
- **Maintain simplicity**: Clear design reduces bugs
- **Test thoroughly**: Comprehensive coverage
- **Monitor in production**: Log security events for analysis

## Memory Management

### Key Files

- `src/core/types.ts`: 4 message types and interfaces
- `src/core/constants.ts`: 4 event types, protocol constants
- `src/initiator/DiscoveryInitiator.ts`: Discovery logic
- `src/responder/DiscoveryResponder.ts`: Announcement logic
- `src/responder/CapabilityMatcher.ts`: Capability intersection logic
- `src/security/`: Security components

### Architecture Notes

- **Event flow**: discover → announce → connect
- **Flat message structures**: No nested objects
- **Security focus**: Origin validation and user consent
- **Chain-based matching**: Direct intersection
- **4 states**: Clear and implementable

## Conclusion

The protocol achieves strong security guarantees through design clarity:

1. **Clear implementation** reduces bugs
2. **Efficient auditing** through focused design
3. **Strong performance** with minimal overhead
4. **Developer friendly** with obvious flow
5. **Maintainable** with focused codebase

The key insight is that **security through simplicity** provides more effective real-world protection than complexity.

## Recent Changes

### Version 0.8.0 - Cross-Browser Extension Support (Current)

**Major Changes**:
1. **Browser API Abstraction Layer**
   - Added `browserApi.ts` module for auto-detecting browser extension APIs
   - Supports both `chrome.*` (Chrome, Edge, Opera) and `browser.*` (Firefox, polyfilled) namespaces
   - Automatically converts Chrome callback-based APIs to Promises
   - Provides unified interface for extension development

2. **Enhanced Extension Components**:
   - `ContentScriptRelay` now auto-detects and uses appropriate browser API
   - `WalletDiscovery` works seamlessly with both Chrome and Firefox extensions
   - No code changes required for cross-browser compatibility

3. **New Exports**:
   ```typescript
   import {
     getBrowserAPI,        // Get unified browser API instance
     isExtensionEnvironment, // Check if running in extension
     getExtensionId,       // Get current extension ID
     type BrowserAPI,      // TypeScript types for API
     type BrowserRuntime,
     type BrowserTabs,
     type MessageSender
   } from '@walletmesh/discovery/extension';
   ```

4. **Benefits**:
   - Automatic compatibility with Firefox extensions
   - Support for WebExtension polyfill users
   - No breaking changes to existing Chrome extension code
   - Future-proof for standardized browser API
   - Consistent Promise-based interface across all browsers

**Migration Guide**:
- No changes required for existing Chrome extensions
- Firefox extension developers can use the same code as Chrome
- The abstraction layer handles all browser differences automatically
- For direct API access, use `getBrowserAPI()` instead of `chrome` or `browser` globals

**Example Usage**:
```typescript
// Works in both Chrome and Firefox
import { getBrowserAPI, WalletDiscovery } from '@walletmesh/discovery/extension';

const api = getBrowserAPI();
const walletDiscovery = new WalletDiscovery(config);

// Listen for messages using the unified API
api.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'discovery:request' && sender.tab?.id) {
    walletDiscovery.handleDiscoveryRequest(
      message.data,
      message.origin,
      sender.tab.id
    );
  }
});
```

### Version 0.7.0 - Technology-Based Discovery

**Breaking Changes - Backward Compatibility Removed**:
1. **Protocol Types Updated**
   - `CapabilityRequirements` no longer accepts `chains[]` or `interfaces[]` fields
   - `technologies` field is now required (not optional)
   - All capability matching now uses technology-based format exclusively

2. **Updated Interfaces**:
   ```typescript
   // OLD (no longer supported)
   interface CapabilityRequirements {
     chains?: string[];
     interfaces?: string[];
     features: string[];
   }
   
   // NEW (required format)
   interface CapabilityRequirements {
     technologies: Array<{
       type: string;       // 'evm' | 'solana' | 'aztec'
       interfaces: string[];
       features?: string[];
     }>;
     features: string[];
   }
   ```

3. **CapabilityMatcher Changes**:
   - Removed all legacy matching methods
   - Removed support for chain-based matching
   - Only technology-based matching is supported

4. **Test Utilities Updated**:
   - All test creation utilities now use technology format
   - Integration helpers updated for new structure

**Migration Guide**:
```typescript
// OLD
const request = {
  required: {
    chains: ['eip155:1'],
    interfaces: ['eip-1193'],
    features: ['account-management']
  }
};

// NEW
const request = {
  required: {
    technologies: [{
      type: 'evm',
      interfaces: ['eip-1193']
    }],
    features: ['account-management']
  }
};
```

**Benefits**:
- Cleaner API with single discovery format
- Better support for multi-interface wallets
- Improved type safety with required fields
- Simplified capability matching logic

### Documentation Consolidation

**Major Changes**:
1. **Protocol Documentation Reorganization**
   - Consolidated three separate specification documents into single `PROTOCOL.md`
   - Removed `PROTOCOL_SPECIFICATION.md`, `PROTOCOL_STATE_MACHINE.md`, and `PROTOCOL_IMPLEMENTATION_GUIDE.md`
   - New consolidated document provides better organization and reduces duplication
   - Added comprehensive table of contents for easy navigation

2. **Content Updates**:
   - Updated all chain identifiers to proper CAIP-2 format (e.g., 'eip155:1' instead of 'evm:1')
   - Changed terminology from listener/announcer to initiator/responder throughout
   - Added missing documentation for Logger interface and InitiatorStateMachine
   - Removed deprecated references to timestamps and OriginProof

3. **Benefits**:
   - Single source of truth for protocol specification
   - Easier to maintain and keep synchronized
   - Better navigation with comprehensive table of contents
   - Reduced confusion from conflicting information across documents

**Migration Guide**:
- Update any references to the three separate specification files to point to `specs/PROTOCOL.md`
- All content has been preserved and reorganized - use table of contents to find specific sections

### Version 0.6.0 (Logger Interface)

**Major Changes**:
1. **Logger Interface Implementation**
   - Added standardized `Logger` interface compatible with modal-core
   - Replaced all console.log/warn/error calls with logger interface
   - Supports dependency injection for custom logging implementations
   - Default `ConsoleLogger` implementation provided

2. **Component Updates**:
   - `DiscoveryInitiator` now accepts optional `logger` in config
   - `DiscoveryResponder` now accepts optional `logger` in config
   - `WalletDiscovery` now accepts optional `logger` in config
   - Internal utilities use logger for consistent output

3. **Benefits**:
   - Applications can inject their own logging solution
   - Consistent log formatting across WalletMesh ecosystem
   - Better control over log levels and output
   - Easier testing with silent loggers
   - Production-ready logging integration

**API Changes**:
- Added optional `logger?: Logger` to `DiscoveryInitiatorConfig`
- Added optional `logger?: Logger` to `DiscoveryResponderConfig`
- Added optional `logger?: Logger` to `WalletDiscoveryConfig`
- Exported `Logger` interface and `ConsoleLogger` class

**Migration Guide**:
- No breaking changes - logger is optional with sensible defaults
- To use custom logger: provide it in component configuration
- Console output format slightly changed (removed `[WalletMesh]` prefix from individual messages as it's now in logger)

### Version 0.5.0 (InitiatorStateMachine with Automatic Message Dispatch)

**Major Changes**:
1. **InitiatorStateMachine Implementation**
   - New `InitiatorStateMachine` class that extends `ProtocolStateMachine`
   - Automatic message dispatch on state transitions
   - Sends protocol messages (`discovery:wallet:request`, `discovery:wallet:complete`, `discovery:wallet:error`) automatically
   - Simplifies DiscoveryInitiator implementation by ~200 lines

2. **Improved Separation of Concerns**
   - State management and message dispatch now handled by InitiatorStateMachine
   - DiscoveryInitiator focuses on response collection and business logic
   - Protocol messaging isolated from discovery logic
   - Better testability with state machine behavior in isolation

3. **Architecture Enhancement**
   - Clear separation between base state machine and role-specific implementations
   - Foundation for future ResponderStateMachine with different states
   - Consistent message dispatch tied to state transitions
   - Single source of truth for protocol state and messaging

**API Changes**:
- New `InitiatorStateMachine` class exported from `@walletmesh/discovery`
- New `createInitiatorStateMachine` factory function
- DiscoveryInitiator now uses InitiatorStateMachine internally
- Protocol messages automatically sent on state transitions

**Migration Guide**:
- No breaking changes to public APIs
- DiscoveryInitiator usage remains the same
- InitiatorStateMachine available for advanced use cases
- Consider using InitiatorStateMachine directly for custom discovery flows

### Version 0.4.0 (4-State Machine with Error Handling)

**Major Changes**:
1. **4-State Machine Implementation**
   - Added ERROR state to handle security violations and protocol errors
   - Updated state model: IDLE → DISCOVERING → COMPLETED/ERROR → IDLE
   - Terminal states (COMPLETED, ERROR) require explicit reset
   - Enhanced state machine with proper error state transitions

2. **Duplicate Response Error Handling**
   - Implemented DuplicateResponseError with forensic details
   - Enforces "first response wins" security model
   - Transitions to ERROR state on duplicate response detection
   - Comprehensive duplicate response detection by RDNS

3. **Message Type Standardization**
   - Renamed message types for consistency across all specifications:
     - DiscoveryRequest → CapabilityRequest
     - WalletAnnouncement/ResponderAnnouncement → CapabilityResponse
   - Updated all protocol documents and Quint specifications
   - Aligned TypeScript implementation with standardized naming

4. **Protocol Event Enhancements**
   - Added COMPLETE and ERROR events to protocol
   - DiscoveryCompletedEvent broadcasts on successful completion
   - DiscoveryErrorEvent broadcasts on security violations
   - Enhanced event-driven architecture for better observability

**API Changes**:
- State machine now supports 4 states with ERROR state
- New error events: discovery:wallet:complete, discovery:wallet:error
- Standardized message type names throughout the API
- Enhanced error handling with categorized errors

**Migration Guide**:
- Update state handling to account for ERROR state
- Listen for new completion and error events if needed
- Update any references to old message type names
- Handle DuplicateResponseError in discovery flows

### Version 0.3.0 (Security Model Simplification)

**Major Changes**:
1. **Timestamp Removal from Protocol**
   - Removed `timestamp` field from CapabilityRequest interface
   - Eliminated timestamp-based replay protection in favor of "first response wins" model
   - Simplified message validation by removing temporal checks
   - Updated Quint formal specifications to reflect timestamp removal

2. **First Response Wins Security Model Implementation**
   - Implemented duplicate response detection in DiscoveryInitiator
   - Track responders by RDNS identifier to detect multiple responses
   - Log suspicious duplicate responses without blocking functionality
   - Clear duplicate tracking between discovery sessions for session isolation

3. **SessionTracker Simplification**
   - Replaced SessionTracker class usage with simple `Set<string>` for session tracking
   - Maintained replay protection while removing unnecessary complexity
   - Simplified session management in DiscoveryResponder

4. **Protocol Specification Updates**
   - Updated all three protocol specification documents
   - Aligned Quint formal specifications with TypeScript implementation
   - Added error code 2004 for duplicate response detection
   - Updated state machine to reflect "first response wins" security model

**Security Model Changes**:
- **Before**: Timestamp-based replay protection with complex validation
- **After**: Session-based replay protection with duplicate response detection
- **Benefit**: More honest about security limitations while maintaining practical protection

**API Changes**:
- Removed `timestamp` field from CapabilityRequest type
- DiscoveryInitiator now tracks and logs duplicate responses
- DiscoveryResponder uses simple Set for session tracking instead of SessionTracker class

**Migration Guide**:
- No breaking changes to public APIs
- Internal timestamp validation removed
- Enhanced duplicate response logging provides better visibility into suspicious activity

### Version 0.2.0 (Protocol Alignment)

**Major Changes**:
1. **Initial State Machine Implementation**
   - Implemented `ProtocolStateMachine` class with formal state management
   - Aligned with Quint formal specification
   - State transition validation with guards
   - Automatic timeouts and event emission

2. **Simplified Security Logging**
   - Security events now logged directly to console
   - Removed complex SecurityEventLogger in favor of simple console.warn
   - Browser-only implementation simplifies origin validation
   - Clear, actionable security warnings in developer console

3. **Attack Scenario Testing**
   - Added comprehensive attack scenario tests
   - Session poisoning prevention
   - Replay attack detection
   - Origin spoofing protection
   - Rate limiting enforcement
   - Capability enumeration prevention

4. **Transport Configuration Enhancement**
   - Enhanced Quint specification to match TypeScript TransportConfig
   - Detailed transport type specifications (extension, popup, websocket, injected)
   - Wallet adapter configuration support

**API Changes**:
- `DiscoveryInitiator.isDiscovering()` now uses 3-state machine (renamed from isDiscoveryInProgress)
- Security events now logged to console instead of stored
- Simplified origin validation for browser-only environments
- Removed OriginProof and SecurityEvent types

**Security Improvements**:
- Simplified security model for browser-only implementation
- Direct console logging for transparency
- Retained essential security features: rate limiting, origin validation, session tracking
- Comprehensive test coverage for attack scenarios

**Migration Guide**:
- Breaking change: `getSecurityEvents()` method removed
- Security events now logged to console instead of being stored
- OriginProof and SecurityEvent types removed
- Origin validation simplified for browser environments