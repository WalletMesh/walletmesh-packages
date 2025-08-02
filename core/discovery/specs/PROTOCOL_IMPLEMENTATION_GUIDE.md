# Generic Cross-Blockchain Discovery Protocol - Implementation Guide

## Abstract

This document provides concrete implementation requirements and guidance for developers implementing the Generic Cross-Blockchain Discovery Protocol. The protocol uses 4 states and 2 message types to provide secure, universal blockchain compatibility and support for use cases beyond just wallets.

## Related Documents

This implementation guide is part of a three-document protocol specification suite:

1. **[PROTOCOL_SPECIFICATION.md](PROTOCOL_SPECIFICATION.md)** - Main protocol specification defining architecture and concepts
2. **[PROTOCOL_STATE_MACHINE.md](PROTOCOL_STATE_MACHINE.md)** - Formal state machine definitions and security properties
3. **PROTOCOL_IMPLEMENTATION_GUIDE.md** (this document) - Concrete technical requirements for implementers

### How to Use These Documents

- **Start with** PROTOCOL_SPECIFICATION.md to understand the protocol design
- **Refer to** PROTOCOL_STATE_MACHINE.md for state transitions 
- **Use this guide** for concrete implementation details and code examples

## Table of Contents

1. [Wire Format](#wire-format)
2. [Message Types](#message-types)
3. [State Machine Implementation](#state-machine-implementation)
4. [Security Implementation](#security-implementation)
5. [Platform-Specific Guides](#platform-specific-guides)
6. [Implementation Checklist](#implementation-checklist)
7. [Message Examples](#message-examples)
8. [Test Vectors](#test-vectors)
9. [Error Handling](#error-handling)
10. [Performance Guidelines](#performance-guidelines)

## Wire Format

### Message Encoding

All protocol messages use **JSON** with flat structures:

#### Encoding Requirements
- **Character Encoding**: UTF-8 (REQUIRED)
- **JSON Specification**: RFC 8259 compliant
- **Flat Structure**: No nested objects for clarity
- **Required Fields Only**: Minimal field set

#### Size Limits
```json
{
  "maxMessageSize": 8192,         // 8KB max per message
  "maxStringLength": 512,         // 512 bytes max per string
  "maxArrayLength": 20,           // Max 20 chains per array
  "maxNestingDepth": 1            // Flat structures only
}
```

#### Core Field Requirements
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `type` | string | Yes | One of 3 message types |
| `sessionId` | string | Yes | UUID v4 format |
| `origin` | string | Yes | Valid URI |

### Message Validation

```typescript
function validateMessage(message: unknown): ValidationResult {
  if (typeof message !== 'object' || message === null) {
    return { valid: false, error: 'Message must be object' };
  }
  
  // Check required fields
  const required = ['type', 'sessionId', 'origin'];
  for (const field of required) {
    if (!(field in message)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Validate UUID format
  if (!isValidUUID(message.sessionId)) {
    return { valid: false, error: 'Invalid sessionId format' };
  }
  
  // Validate origin
  if (!isValidOrigin(message.origin)) {
    return { valid: false, error: 'Invalid origin format' };
  }
  
  return { valid: true };
}
```

## Message Types

### Two Core Messages

#### 1. Discovery Request Event (Initiator → Responders)
```typescript
interface DiscoveryRequestEvent {
  type: 'discovery:wallet:request';
  sessionId: string;      // crypto.randomUUID()
  chains: string[];       // ['evm:1', 'evm:137']
  origin: string;         // Initiator origin
  interfaces?: string[];  // ['eip-1193', 'eip-6963'] - optional
}
```

**Validation Rules:**
- `sessionId`: Must be UUID v4
- `chains`: Array of 1-20 chain identifiers
- `origin`: Must match event.origin

#### 2. Discovery Response Event (Responder → Initiator)
```typescript
interface DiscoveryResponseEvent {
  type: 'discovery:wallet:response';
  responderId: string;         // crypto.randomUUID() (ephemeral)
  sessionId: string;           // Must match discovery request
  rdns: string;                // 'com.example.responder'
  name: string;                // 'Example Responder'
  icon: string;                // Data URI or URL
  chains: string[];            // Intersection of requested chains
  interfaces?: string[];       // Subset of initiator's supported interfaces
  transportConfig?: TransportConfig;  // Optional transport configuration
}

interface TransportConfig {
  type: 'extension' | 'popup' | 'websocket' | 'injected';
  extensionId?: string;        // Chrome extension ID (for extension transport)
  popupUrl?: string;           // Popup window URL (for popup transport)
  websocketUrl?: string;       // WebSocket endpoint URL (for websocket transport)
  walletAdapter?: string;      // Wallet adapter class name
  adapterConfig?: Record<string, unknown>;  // Additional adapter configuration
}
```

**Validation Rules:**
- `responderId`: Must be UUID v4 (ephemeral)
- `sessionId`: Must match original discovery request
- `rdns`: Valid reverse domain name
- `chains`: Must be subset of requested chains
- `interfaces`: Must be subset of initiator's interfaces (if provided)

#### 3. Session Events (Discovery → Observers)

The protocol defines session lifecycle events for observability:

```typescript
// Discovery Completed Event
interface DiscoveryCompletedEvent {
  type: 'discovery:wallet:complete';
  version: string;          // Protocol version
  sessionId: string;        // Session identifier
  reason: 'timeout' | 'manual-stop' | 'max-responders';
  respondersFound: number;  // Number of responders discovered
}

// Discovery Error Event
interface DiscoveryErrorEvent {
  type: 'discovery:wallet:error';
  version: string;          // Protocol version
  sessionId: string;        // Session identifier
  errorCode: number;        // Standard error code
  errorMessage: string;     // Human-readable error description
  errorCategory: 'protocol' | 'security' | 'capability' | 'connection' | 'internal';
}
```

**Implementation Requirements:**
- Events are emitted when discovery state transitions to COMPLETED or ERROR
- Events should be dispatched as CustomEvents for consistency
- Event broadcasting failures should not break discovery functionality
- Events provide observability but do not affect discovery protocol logic

### Connection Separation

**Important**: The discovery protocol ends after the responder announcement. Connection establishment is handled separately by higher-level libraries (e.g., modal-core, modal-react) using the `transportConfig` information provided in the announcement. The discovery protocol only provides the information needed to know HOW to connect.

### Chain Identifier Format

Standardized format: `{type}:{network}`

```typescript
// EVM chains
'evm:1'         // Ethereum Mainnet
'evm:137'       // Polygon
'evm:56'        // BSC

// Account-based chains  
'solana:mainnet'
'solana:devnet'
'aztec:mainnet'
'near:mainnet'

// UTXO chains
'bitcoin:mainnet'
'bitcoin:testnet'
```

### Provider Interface Negotiation

Implementing interface negotiation for optimal provider connectivity:

#### Initiator Implementation
```typescript
// Initiator declares what it can work with
function initiateDiscovery() {
  const request: DiscoveryRequestEvent = {
    type: 'discovery:wallet:request',
    sessionId: crypto.randomUUID(),
    chains: ['evm:1', 'evm:137'],
    origin: window.location.origin,
    // Declare all interfaces the initiator supports
    interfaces: ['eip-1193', 'eip-6963', 'walletconnect-v2']
  };
  
  broadcast(request);
}

// Connection establishment is handled by higher-level libraries
// using the transport configuration from the discovery response
function connectToResponder(announcement: DiscoveryResponseEvent) {
  // Discovery protocol ends here - connection handled by modal-core/modal-react
  // using announcement.transportConfig and announcement.interfaces
  
  // Example: Higher-level library handles connection
  // modalCore.connectToWallet({
  //   rdns: announcement.rdns,
  //   transportConfig: announcement.transportConfig,
  //   supportedInterfaces: announcement.interfaces
  // });
}
```

#### Responder Implementation
```typescript
// Responder responds with interfaces it can provide
function handleDiscoveryRequest(request: DiscoveryRequestEvent) {
  const responderInterfaces = ['eip-1193', 'eip-6963', 'solana-wallet-standard'];
  
  // Find intersection with initiator's supported interfaces
  const compatibleInterfaces = request.interfaces
    ? request.interfaces.filter(iface => responderInterfaces.includes(iface))
    : responderInterfaces; // If initiator doesn't specify, return all
  
  // Only announce if we have compatible interfaces
  if (compatibleInterfaces.length === 0 && request.interfaces) {
    return; // No compatible interfaces
  }
  
  const announcement: DiscoveryResponseEvent = {
    // ... standard fields ...
    interfaces: compatibleInterfaces
  };
  
  // For browser extensions, include extension ID
  if (isExtension) {
    (announcement as any).extensionId = chrome.runtime.id;
  }
  
  sendAnnouncement(announcement);
}

// Connection establishment is handled by higher-level libraries
// after discovery completes. The discovery protocol ends when
// the responder sends the capability response. Interface selection
// and provider initialization are handled by modal-core/modal-react.
```

## State Machine Implementation

### Four States Implementation

```typescript
type ProtocolState = 'IDLE' | 'DISCOVERING' | 'COMPLETED' | 'ERROR';

interface InitiatorState {
  state: ProtocolState;
  sessionId?: string;
  responders: DiscoveryResponseEvent[];
  selectedResponder?: DiscoveryResponseEvent;
  connection?: Connection;
}
```

### Single-Use Session Pattern

The protocol implements a **single-use session pattern** where discovery sessions become immutable after reaching terminal states:

**Terminal States**: `COMPLETED` and `ERROR` states are terminal
- Once a discovery session reaches these states, it cannot be reused
- Attempts to start new discovery from terminal states throw an error
- This prevents state corruption and simplifies security analysis

**Implementation Requirements**:
```typescript
class DiscoveryInitiator {
  startDiscovery(): Promise<DiscoveryResponseEvent[]> {
    // Check for terminal states
    if (this.state === 'COMPLETED' || this.state === 'ERROR') {
      throw new Error(
        `Cannot reuse discovery session in ${this.state} state. ` +
        `Create a new DiscoveryInitiator instance for each discovery session.`
      );
    }
    
    // Proceed with normal discovery logic...
  }
}

interface ResponderState {
  state: ProtocolState;
  usedSessions: Set<string>;    // Prevent replay
  activeConnection?: Connection;
}
```

### State Transition Implementation

```typescript
class ProtocolStateMachine {
  private state: ProtocolState = 'IDLE';
  private sessionId?: string;
  
  // Initiator: Start discovery (single-use session pattern)
  startDiscovery(chains: string[]): void {
    // Terminal states cannot be reused
    if (this.state === 'COMPLETED' || this.state === 'ERROR') {
      throw new Error(
        `Cannot reuse discovery session in ${this.state} state. Create a new DiscoveryInitiator instance for each discovery session.`
      );
    }
    
    if (this.state !== 'IDLE') {
      throw new Error('Can only start discovery from IDLE state');
    }
    
    this.sessionId = crypto.randomUUID();
    this.state = 'DISCOVERING';
    
    this.broadcast({
      type: 'discovery:wallet:request',
      sessionId: this.sessionId,
      chains,
      origin: window.location.origin
    });
  }
  
  // Initiator: Complete discovery (terminal state)
  completeDiscovery(): void {
    if (this.state !== 'DISCOVERING') {
      throw new Error('Can only complete from DISCOVERING state');
    }
    
    this.state = 'COMPLETED'; // Terminal state
  }
  
  // Initiator: Error during discovery (terminal state)
  errorDiscovery(error: string): void {
    if (this.state !== 'DISCOVERING') {
      throw new Error('Can only error from DISCOVERING state');
    }
    
    this.state = 'ERROR'; // Terminal state
  }
  
  // Responder: Handle discovery request
  handleDiscoveryRequest(request: DiscoveryRequestEvent): void {
    if (this.state !== 'IDLE') {
      return; // Ignore if not idle
    }
    
    // Validate origin
    if (!this.isOriginAllowed(request.origin)) {
      return; // Silent rejection
    }
    
    // Check if we can support requested chains
    const supportedChains = this.getSupportedChains();
    const intersection = request.chains.filter(chain => 
      supportedChains.includes(chain)
    );
    
    if (intersection.length === 0) {
      return; // Can't fulfill requirements
    }
    
    // Announce capability
    this.broadcast({
      type: 'discovery:wallet:response',
      responderId: crypto.randomUUID(), // Ephemeral
      sessionId: request.sessionId,
      rdns: this.responderInfo.rdns,
      name: this.responderInfo.name,
      icon: this.responderInfo.icon,
      chains: intersection
    });
  }
}
```

## Security Implementation

### Origin Validation

```typescript
class OriginValidator {
  private allowedOrigins: Set<string>;
  private blockedOrigins: Set<string>;
  
  constructor(config: SecurityConfig) {
    this.allowedOrigins = new Set(config.allowedOrigins || []);
    this.blockedOrigins = new Set(config.blockedOrigins || []);
  }
  
  validateOrigin(origin: string): boolean {
    // Check if explicitly blocked
    if (this.blockedOrigins.has(origin)) {
      return false;
    }
    
    // If allowlist exists, check if origin is allowed
    if (this.allowedOrigins.size > 0) {
      return this.allowedOrigins.has(origin);
    }
    
    // Default: allow HTTPS origins, localhost for dev
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' || 
             (url.hostname === 'localhost' && this.isDevelopment());
    } catch {
      return false;
    }
  }
  
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}
```

### Session Tracking (Responder-Side)

```typescript
// Simplified session tracking for responders
class ResponderSessionTracker {
  private usedSessions = new Set<string>();
  
  isSessionUsed(sessionId: string): boolean {
    return this.usedSessions.has(sessionId);
  }
  
  markSessionUsed(sessionId: string): void {
    this.usedSessions.add(sessionId);
  }
  
  cleanup(): void {
    // Clear all sessions (responders can clean up periodically)
    this.usedSessions.clear();
  }
}
```

### Duplicate Response Detection (Initiator-Side)

```typescript
// Initiator tracks seen responders to detect suspicious duplicate responses
class DuplicateResponseDetector {
  private seenResponders = new Map<string, number>(); // rdns -> count
  
  checkForDuplicate(response: DiscoveryResponseEvent): boolean {
    const count = this.seenResponders.get(response.rdns) || 0;
    const isDuplicate = count > 0;
    
    if (isDuplicate) {
      console.warn('[WalletMesh] Duplicate response detected from responder', {
        rdns: response.rdns,
        responderId: response.responderId,
        responseCount: count + 1,
        sessionId: response.sessionId,
      });
    }
    
    // Track this responder response
    this.seenResponders.set(response.rdns, count + 1);
    
    return isDuplicate; // Return true if this is a duplicate (but still process it)
  }
  
  reset(): void {
    // Clear tracking for new discovery session
    this.seenResponders.clear();
  }
  
  getStats(): { seenRespondersCount: number; duplicateResponses: Array<{rdns: string, count: number}> } {
    return {
      seenRespondersCount: this.seenResponders.size,
      duplicateResponses: Array.from(this.seenResponders.entries())
        .filter(([, count]) => count > 1)
        .map(([rdns, count]) => ({ rdns, count })),
    };
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(origin: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(origin) || [];
    
    // Remove old requests outside window
    const recentRequests = requests.filter(
      time => now - time < this.windowMs
    );
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Record this request
    recentRequests.push(now);
    this.requests.set(origin, recentRequests);
    
    return true;
  }
}
```

## Platform-Specific Guides

### Browser Implementation

```typescript
class BrowserResponderDiscovery {
  private transport: EventTarget;
  private validator: OriginValidator;
  private sessionTracker: SessionTracker;
  
  constructor(config: BrowserConfig) {
    this.transport = window;
    this.validator = new OriginValidator(config.security);
    this.sessionTracker = new SessionTracker();
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Listen for discovery requests
    this.transport.addEventListener('discovery:request', (event) => {
      this.handleDiscoveryRequest(event as CustomEvent);
    });
    
    // Note: Connection requests are handled by higher-level libraries
    // Discovery protocol only handles capability request/response
  }
  
  private handleDiscoveryRequest(event: CustomEvent): void {
    const request = event.detail as DiscoveryRequestEvent;
    
    // Validate origin
    if (!this.validator.validateOrigin(request.origin)) {
      return; // Silent rejection
    }
    
    // Check session replay
    if (this.sessionTracker.isSessionUsed(request.sessionId, request.origin)) {
      return; // Prevent replay
    }
    
    // Mark session as used
    this.sessionTracker.markSessionUsed(request.sessionId, request.origin);
    
    // Process request...
  }
  
  broadcast(message: ProtocolMessage): void {
    const event = new CustomEvent(message.type, {
      detail: message
    });
    this.transport.dispatchEvent(event);
  }
}
```

### Extension Implementation

```typescript
// Content Script (Minimal)
class ExtensionContentScript {
  constructor() {
    this.setupMessageBridge();
  }
  
  private setupMessageBridge(): void {
    // Forward page events to background script
    window.addEventListener('discovery:request', (event) => {
      chrome.runtime.sendMessage({
        type: 'discovery-request',
        data: event.detail
      });
    });
    
    // Forward background responses to page
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'responder-announcement') {
        const event = new CustomEvent('responder:announce', {
          detail: message.data
        });
        window.dispatchEvent(event);
      }
    });
  }
}

// Background Script
class ExtensionBackgroundScript {
  private responderInfo: ResponderInfo;
  private security: SecurityManager;
  
  constructor(responderInfo: ResponderInfo) {
    this.responderInfo = responderInfo;
    this.security = new SecurityManager();
    this.setupMessageHandlers();
  }
  
  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (message.type === 'discovery-request') {
        this.handleDiscoveryRequest(message.data, sender);
      }
    });
  }
  
  private handleDiscoveryRequest(request: DiscoveryRequestEvent, sender: any): void {
    // Validate origin from sender.tab.url
    const origin = new URL(sender.tab.url).origin;
    
    if (!this.security.isOriginAllowed(origin)) {
      return; // Silent rejection
    }
    
    // Check chain compatibility
    const supportedChains = this.responderInfo.chains;
    const chainIntersection = request.chains.filter(chain =>
      supportedChains.includes(chain)
    );
    
    if (chainIntersection.length === 0) {
      return; // Can't fulfill
    }
    
    // Check interface compatibility with initiator's supported interfaces
    const responderInterfaces = ['eip-1193', 'eip-6963'];
    let compatibleInterfaces = responderInterfaces;
    
    if (request.interfaces && request.interfaces.length > 0) {
      // Find intersection with initiator's supported interfaces
      compatibleInterfaces = request.interfaces.filter(
        iface => responderInterfaces.includes(iface)
      );
      
      if (compatibleInterfaces.length === 0) {
        return; // No compatible interfaces
      }
    }
    
    // Send announcement back to content script
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'responder-announcement',
      data: {
        type: 'discovery:wallet:response',
        responderId: crypto.randomUUID(),
        sessionId: request.sessionId,
        rdns: this.responderInfo.rdns,
        name: this.responderInfo.name,
        icon: this.responderInfo.icon,
        chains: chainIntersection,
        // Include extension ID for direct connection
        extensionId: chrome.runtime.id,
        // Include compatible interfaces (subset of initiator's)
        interfaces: compatibleInterfaces
      }
    });
  }
  
  // Note: Connection handling is done by higher-level libraries
  // The discovery protocol ends after sending the capability response
  // Connection establishment is handled by modal-core/modal-react using
  // the transport configuration provided in the discovery response
}
```

## Implementation Checklist

### Core Requirements

- [ ] **Generate unique session IDs** using `crypto.randomUUID()`
- [ ] **Validate all message origins** against security policy
- [ ] **Track used sessions** to prevent replay attacks
- [ ] **Implement timeouts** (3s discovery, 30s connection)
- [ ] **Handle errors gracefully** with proper logging
- [ ] **Clean up resources** when disconnecting

### Security Requirements

- [ ] **Origin validation** for all incoming messages
- [ ] **Session replay prevention** with session tracking (responder-side)
- [ ] **Duplicate response detection** with logging (initiator-side)
- [ ] **Rate limiting** per origin (configurable)
- [ ] **RDNS verification** guidance for users (during connection)
- [ ] **Silent rejection** of invalid requests

### Platform Requirements

- [ ] **CustomEvent support** for browser environments
- [ ] **Message bridge** for extension content scripts
- [ ] **Native messaging** for mobile/desktop apps
- [ ] **Error boundaries** for graceful degradation
- [ ] **Performance monitoring** for message handling

### Testing Requirements

- [ ] **Unit tests** for all message validators
- [ ] **Integration tests** for discovery flow
- [ ] **Security tests** for attack scenarios
- [ ] **Performance tests** for message throughput
- [ ] **Cross-platform tests** for compatibility

## Message Examples

### Complete Discovery Flow

```typescript
// 1. Initiator initiates discovery
const discoveryRequest: DiscoveryRequestEvent = {
  type: 'discovery:wallet:request',
  sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  chains: ['evm:1', 'evm:137'],
  origin: 'https://myapp.com'
};

// 2. Responder announces capability
const discoveryResponse: DiscoveryResponseEvent = {
  type: 'discovery:wallet:response',
  responderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  rdns: 'com.example.responder',
  name: 'Example Responder',
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
  chains: ['evm:1', 'evm:137'],
  transportConfig: {               // How to connect to this responder
    type: 'extension',
    extensionId: 'abcdefghijklmnopqrstuvwxyz',
    walletAdapter: 'MetaMaskAdapter'
  }
};

// 3. Connection establishment (handled by higher-level libraries)
// Discovery protocol completes here. Connection establishment
// is handled by modal-core/modal-react using the transport configuration
// provided in the capability response.
```

### Extended Flow with Provider Interfaces

```typescript
// 1. Initiator declares all interfaces it supports
const discoveryRequestWithInterfaces: DiscoveryRequestEvent = {
  type: 'discovery:wallet:request',
  sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  chains: ['evm:1', 'evm:137'],
  origin: 'https://myapp.com',
  interfaces: ['eip-1193', 'eip-6963', 'walletconnect-v2']  // Initiator supports these
};

// 2. Extension responder announces with subset of interfaces it can provide
const discoveryResponseWithInterfaces: DiscoveryResponseEvent = {
  type: 'discovery:wallet:response',
  responderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  rdns: 'com.example.responder',
  name: 'Example Responder',
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
  chains: ['evm:1', 'evm:137'],
  interfaces: ['eip-1193', 'eip-6963'], // Subset: responder doesn't support WalletConnect
  transportConfig: {               // Transport configuration for connection
    type: 'extension',
    extensionId: 'abcdefghijklmnopqrstuvwxyz',  // Chrome extension ID
    walletAdapter: 'MetaMaskAdapter'
  }
};

// 3. Connection establishment using selected interface (handled by higher-level libraries)
// Discovery protocol completes here. Connection is established by modal-core/modal-react
// using the transport configuration and interface selection from the discovery response.
// For example, the initiator would choose 'eip-6963' from the responder's supported interfaces.
```

## Test Vectors

### Valid Messages

```typescript
// Test vector 1: Basic discovery
const testDiscovery = {
  input: {
    type: 'discovery:wallet:request',
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
    chains: ['evm:1'],
    origin: 'https://example.com'
  },
  expectedValid: true
};

// Test vector 2: Multi-chain announcement
const testAnnouncement = {
  input: {
    type: 'discovery:wallet:response',
    responderId: '987fcdeb-51d2-4a3b-8765-123456789abc',
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
    rdns: 'com.test.responder',
    name: 'Test Responder',
    icon: 'data:image/svg+xml;base64,PHN2Zz4=',
    chains: ['evm:1', 'evm:137']
  },
  expectedValid: true
};
```

### Invalid Messages

```typescript
// Test vector 3: Invalid UUID
const testInvalidUUID = {
  input: {
    type: 'discovery:wallet:request',
    sessionId: 'not-a-uuid',
    chains: ['evm:1'],
    origin: 'https://example.com'
  },
  expectedValid: false,
  expectedError: 'Invalid sessionId format'
};

// Test vector 4: Missing required field
const testMissingField = {
  input: {
    type: 'discovery:wallet:response',
    responderId: '987fcdeb-51d2-4a3b-8765-123456789abc',
    // Missing sessionId
    rdns: 'com.test.responder',
    name: 'Test Responder',
    icon: 'data:image/svg+xml;base64,PHN2Zz4=',
    chains: ['evm:1']
  },
  expectedValid: false,
  expectedError: 'Missing required field: sessionId'
};
```

## Error Handling

### Error Categories and Codes

The protocol defines standardized error codes for consistent error handling:

1. **Protocol Errors (1000-1999)**: Invalid messages, wrong state
2. **Security Errors (2000-2999)**: Origin validation, rate limiting  
3. **Capability Errors (3000-3999)**: Unsupported chains, missing features
4. **Connection Errors (4000-4999)**: Transport failures, timeouts
5. **Internal Errors (5000-5999)**: Unexpected states, system failures

### Common Error Codes

| Code | Category | Description | Retryable |
|------|----------|-------------|-----------|
| 1001 | Protocol | Invalid message format | No |
| 1002 | Protocol | Wrong protocol state | No |
| 1003 | Protocol | Session not found | No |
| 2001 | Security | Origin validation failed | No |
| 2002 | Security | Rate limit exceeded | Yes |
| 2003 | Security | Session replay attempt | No |
| 3001 | Capability | Capability not supported | No |
| 3002 | Capability | No matching chains | No |
| 4001 | Connection | Connection failed | Yes |
| 4002 | Connection | Connection timeout | Yes |
| 5001 | Internal | Internal error | No |

### Error Response Pattern

```typescript
interface DiscoveryErrorEvent {
  type: 'discovery:wallet:error';
  version: string;
  sessionId: string;
  error: {
    code: number;        // 4-digit error code
    message: string;     // Human-readable message
    category: 'protocol' | 'security' | 'capability' | 'connection' | 'internal';
    details?: {
      retryable: boolean;
      retryAfter?: number;  // milliseconds
      hint?: string;
    };
  };
}

// Common error codes
const ERROR_CODES = {
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  INVALID_ORIGIN: 'INVALID_ORIGIN',
  SESSION_REPLAY: 'SESSION_REPLAY',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  USER_REJECTED: 'USER_REJECTED'
} as const;
```

### Silent vs Explicit Errors

**Silent Errors** (for privacy):
- Invalid origin
- Session replay attempts
- Rate limiting violations
- Unsupported chains

**Explicit Errors** (for debugging):
- Malformed messages
- Invalid UUIDs
- Connection timeouts
- User rejections

## Performance Guidelines

### Message Processing

- **Validate early**: Check message format before processing
- **Cache validations**: Reuse origin validation results
- **Batch cleanup**: Clean up sessions/rate limits periodically
- **Limit concurrency**: Process one discovery at a time

### Memory Management

- **Clean up sessions**: Remove old sessions (1 hour TTL)
- **Limit storage**: Cap rate limiting and session storage
- **Weak references**: Use WeakMap for temporary data
- **Event cleanup**: Remove event listeners on disconnect

### Network Optimization

- **Minimize message size**: Use short field names in practice
- **Debounce discovery**: Prevent rapid discovery requests
- **Connection pooling**: Reuse connections where possible
- **Timeout tuning**: Adjust timeouts based on network conditions

## Conclusion

The protocol implementation provides strong security properties through design clarity. Key benefits:

1. **Minimal state space** for thorough testing
2. **Flat message structures** reduce parsing complexity
3. **Clear error handling** with explicit vs silent failure modes
4. **Focused security model** addresses practical threats
5. **Universal compatibility** works across all platforms

By prioritizing clarity and focused functionality, implementations achieve both security and correctness in practice.