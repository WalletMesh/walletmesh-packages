# Practical Security Guide for Discovery Protocol

## Overview

This guide provides practical security recommendations for implementing and using the discovery protocol. While the protocol focuses on core security properties, additional measures are needed to address real-world threats.

## Real-World Threat Analysis

### Primary Threats (Address These)

1. **Visual Phishing** (High Impact, High Probability)
   - Fake responders mimicking legitimate ones
   - Similar names/icons to confuse users
   - Clone websites impersonating real responders

2. **Supply Chain Attacks** (High Impact, Medium Probability)
   - Compromised responder extensions in stores
   - Malicious dependencies in responder code
   - Man-in-the-middle attacks on downloads

3. **Social Engineering** (High Impact, High Probability)
   - Users tricked into connecting to malicious initiators
   - Fake support requests for private keys
   - Phishing websites collecting responder connections

4. **Timing Attacks** (Medium Impact, Medium Probability)
   - User behavior tracking through discovery patterns
   - Responder fingerprinting through response timing
   - Privacy leakage through request patterns

### Secondary Threats (Monitor These)

5. **Responder Spoofing** (Medium Impact, Low Probability)
   - RDNS provides defense mechanism
   - Users can verify responder authenticity
   - Addressed by protocol design

6. **Session Hijacking** (Low Impact, Low Probability)
   - Session isolation prevents this
   - Addressed by protocol design

## Practical Defense Strategies

### 1. Visual Phishing Prevention

#### For Responder Developers

**Unique Visual Identity**:
```typescript
interface ResponderIdentity {
  rdns: string;                    // Verified domain ownership
  name: string;                    // Unique, trademarked name
  icon: string;                    // Distinctive, copyrighted icon
  verificationBadge?: string;      // App store verification
  developerInfo: {
    company: string;
    website: string;
    supportContact: string;
  };
}
```

**Implementation Example**:
```typescript
const responderInfo = {
  rdns: 'com.example.responder',   // Must own example.com
  name: 'ExampleResponder™',      // Trademarked name
  icon: 'data:image/svg+xml;base64,...', // Unique design
  developerInfo: {
    company: 'Example Corp',
    website: 'https://example.com',
    supportContact: 'support@example.com'
  }
};
```

**Best Practices**:
- Use RDNS that matches your verified domain
- Trademark your responder name
- Design distinctive, copyrightable icons
- Display developer information clearly
- Register with official responder directories

#### For Initiator Developers

**Responder Reputation System**:
```typescript
interface ResponderReputation {
  rdns: string;
  trustScore: number;              // 0-100 based on metrics
  userCount: number;               // Active user base
  ageInDays: number;              // Time since first seen
  securityAudits: SecurityAudit[];
  reportedIssues: Issue[];
  verificationLevel: 'none' | 'basic' | 'verified' | 'official';
}

interface SecurityAudit {
  auditor: string;
  date: string;
  report: string;
  score: number;
}
```

**Implementation Example**:
```typescript
function calculateTrustScore(reputation: ResponderReputation): number {
  let score = 0;
  
  // Age factor (older = more trusted)
  score += Math.min(reputation.ageInDays / 365 * 30, 30);
  
  // User count factor
  score += Math.min(Math.log10(reputation.userCount) * 10, 25);
  
  // Security audits
  score += reputation.securityAudits.length * 15;
  
  // Verification level
  const verificationBonus = {
    'none': 0,
    'basic': 5,
    'verified': 15,
    'official': 25
  };
  score += verificationBonus[reputation.verificationLevel];
  
  // Penalty for reported issues
  score -= reputation.reportedIssues.length * 5;
  
  return Math.max(0, Math.min(100, score));
}
```

**User Interface Guidelines**:
```typescript
function displayResponderSecurely(responder: DiscoveryResponseEvent, reputation: ResponderReputation) {
  return {
    // Always show RDNS for verification
    primaryText: responder.name,
    secondaryText: `${responder.rdns} • ${reputation.userCount.toLocaleString()} users`,
    
    // Visual trust indicators
    trustBadge: reputation.verificationLevel,
    trustScore: calculateTrustScore(reputation),
    
    // Warnings for suspicious responders
    warnings: [
      ...(reputation.ageInDays < 30 ? ['New responder - verify authenticity'] : []),
      ...(reputation.userCount < 1000 ? ['Limited user base'] : []),
      ...(reputation.reportedIssues.length > 0 ? [`${reputation.reportedIssues.length} reported issues`] : [])
    ]
  };
}
```

### 2. Supply Chain Security

#### For Responder Developers

**Code Signing and Verification**:
```typescript
interface CodeSignature {
  algorithm: 'ECDSA' | 'RSA' | 'Ed25519';
  publicKey: string;
  signature: string;
  timestamp: number;
  certificate?: string;           // X.509 certificate
}

interface ResponderPackage {
  version: string;
  files: FileHash[];
  signature: CodeSignature;
  buildInfo: {
    commit: string;                // Git commit hash
    timestamp: number;             // Build timestamp
    environment: string;           // Build environment info
  };
}
```

**Security Checklist**:
- [ ] Sign all releases with verified certificates
- [ ] Use reproducible builds
- [ ] Audit all dependencies regularly
- [ ] Implement secure update mechanisms
- [ ] Publish signatures in multiple locations
- [ ] Use content-addressed storage for distribution

#### For Initiator Developers

**Responder Verification**:
```typescript
async function verifyResponderSignature(
  responderInfo: DiscoveryResponseEvent,
  expectedSignature: CodeSignature
): Promise<boolean> {
  try {
    // Verify the responder's code signature
    const publicKey = await getVerifiedPublicKey(responderInfo.rdns);
    const responderCode = await getResponderCode(responderInfo.rdns);
    
    return await crypto.subtle.verify(
      { name: expectedSignature.algorithm },
      publicKey,
      expectedSignature.signature,
      responderCode
    );
  } catch (error) {
    console.warn('Responder signature verification failed:', error);
    return false;
  }
}
```

### 3. Social Engineering Prevention

#### User Education Framework

**Security Awareness Messages**:
```typescript
interface SecurityMessage {
  type: 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  learnMoreUrl?: string;
}

const securityMessages: SecurityMessage[] = [
  {
    type: 'warning',
    title: 'Verify Responder Authenticity',
    message: 'Always verify the RDNS matches the official responder website before connecting.',
    learnMoreUrl: 'https://discovery.org/security/verify-responders'
  },
  {
    type: 'tip',
    title: 'New Responder Alert',
    message: 'This responder was recently added. Extra caution recommended.',
  },
  {
    type: 'info',
    title: 'Official Verification',
    message: 'This responder has been verified by the app store and security auditors.',
  }
];
```

**Smart Warning System**:
```typescript
function generateWarnings(
  responder: DiscoveryResponseEvent,
  reputation: ResponderReputation,
  context: DiscoveryContext
): SecurityMessage[] {
  const warnings: SecurityMessage[] = [];
  
  // New responder warning
  if (reputation.ageInDays < 30) {
    warnings.push({
      type: 'warning',
      title: 'New Responder',
      message: `This responder was first seen ${reputation.ageInDays} days ago. Verify authenticity before connecting.`
    });
  }
  
  // Similar name warning
  const similarResponders = findSimilarResponders(responder.name);
  if (similarResponders.length > 0) {
    warnings.push({
      type: 'warning',
      title: 'Similar Names Found',
      message: `Found ${similarResponders.length} responders with similar names. Verify this is the correct responder.`
    });
  }
  
  // High-value context warning
  if (context.transactionValue > 10000) {
    warnings.push({
      type: 'warning',
      title: 'High-Value Transaction',
      message: 'Double-check wallet authenticity before proceeding with high-value operations.'
    });
  }
  
  return warnings;
}
```

#### Initiator Security Practices

**Origin Verification Display**:
```typescript
function displayOriginSafely(origin: string): string {
  try {
    const url = new URL(origin);
    
    // Highlight potential spoofing attempts
    const suspiciousPatterns = [
      /[а-я]/,                     // Cyrillic characters
      /[αβγδε]/,                   // Greek characters  
      /xn--/,                      // Punycode
      /-+/,                        // Multiple hyphens
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/ // IP addresses
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url.hostname)
    );
    
    return {
      hostname: url.hostname,
      isSuspicious,
      protocol: url.protocol,
      warning: isSuspicious ? 'Suspicious domain detected' : undefined
    };
  } catch {
    return {
      hostname: 'Invalid Origin',
      isSuspicious: true,
      warning: 'Malformed origin'
    };
  }
}
```

### 4. Privacy Protection

#### Timing Attack Prevention

**Request Timing Normalization**:
```typescript
class TimingProtection {
  private static readonly DISCOVERY_DELAY = 100; // ms
  private lastRequestTime = 0;
  
  async sendDiscoveryRequest(request: DiscoveryRequestEvent): Promise<void> {
    // Normalize timing to prevent fingerprinting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, TimingProtection.DISCOVERY_DELAY - timeSinceLastRequest);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    await this.transport.send(request);
  }
}
```

**Response Timing Randomization**:
```typescript
class ResponderResponseTiming {
  private static readonly MIN_DELAY = 50;  // ms
  private static readonly MAX_DELAY = 200; // ms
  
  async announceWithRandomDelay(announcement: DiscoveryResponseEvent): Promise<void> {
    // Add random delay to prevent timing analysis
    const delay = Math.random() * 
      (ResponderResponseTiming.MAX_DELAY - ResponderResponseTiming.MIN_DELAY) + 
      ResponderResponseTiming.MIN_DELAY;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    await this.transport.send(announcement);
  }
}
```

#### Request Pattern Protection

**Discovery Pattern Anonymization**:
```typescript
interface DiscoveryPattern {
  frequency: number;              // Requests per hour
  chains: string[];              // Requested chains
  origins: string[];             // Requesting origins
  timePattern: number[];         // Request times
}

function isPatternSuspicious(pattern: DiscoveryPattern): boolean {
  // Detect automated/bot behavior
  if (pattern.frequency > 100) {   // >100 requests/hour
    return true;
  }
  
  // Detect pattern regularity (possible tracking)
  const intervals = pattern.timePattern
    .slice(1)
    .map((time, i) => time - pattern.timePattern[i]);
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => 
    sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  // Low variance indicates regular pattern (suspicious)
  return variance < avgInterval * 0.1;
}
```

## Implementation Guidelines

### Security Configuration Templates

#### Production Security Policy
```typescript
const productionSecurity: SecurityConfig = {
  // Strict origin validation
  allowedOrigins: [], // Empty = HTTPS only
  requireHttps: true,
  allowLocalhost: false,
  
  // Conservative rate limiting
  rateLimit: {
    maxRequests: 5,
    windowMs: 60000  // 1 minute
  },
  
  // Enhanced verification
  requireResponderSignature: true,
  enableReputationSystem: true,
  showSecurityWarnings: true,
  
  // Privacy protection
  enableTimingProtection: true,
  randomizeResponseTiming: true
};
```

#### Development Security Policy
```typescript
const developmentSecurity: SecurityConfig = {
  // Relaxed for development
  allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  requireHttps: false,
  allowLocalhost: true,
  
  // Higher limits for testing
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000
  },
  
  // Reduced verification for ease of testing
  requireResponderSignature: false,
  enableReputationSystem: false,
  showSecurityWarnings: true, // Still show warnings
  
  // Minimal privacy protection
  enableTimingProtection: false,
  randomizeResponseTiming: false
};
```

### Monitoring and Alerting

#### Security Event Logging
```typescript
interface SecurityEvent {
  type: 'origin_blocked' | 'rate_limited' | 'session_replay' | 'origin_spoofing' | 
        'invalid_signature' | 'capability_enumeration' | 'suspicious_pattern' | 'responder_verified';
  timestamp: number;
  origin: string;
  sessionId?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  
  logEvent(event: SecurityEvent): void {
    this.events.push(event);
    
    // Real-time alerting for high-severity events
    if (event.severity === 'high') {
      this.sendAlert(event);
    }
    
    // Cleanup old events
    this.cleanupOldEvents();
  }
  
  private sendAlert(event: SecurityEvent): void {
    // Implementation depends on your alerting system
    console.warn('Security Alert:', event);
  }
  
  generateSecurityReport(): SecurityReport {
    const now = Date.now();
    const last24h = this.events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    
    return {
      totalEvents: last24h.length,
      eventsByType: this.groupEventsByType(last24h),
      topOrigins: this.getTopOrigins(last24h),
      riskScore: this.calculateRiskScore(last24h)
    };
  }
}
```

### User Interface Security

#### Secure Responder Display Component
```tsx
interface SecureResponderDisplayProps {
  responder: DiscoveryResponseEvent;
  reputation: ResponderReputation;
  onConnect: () => void;
}

function SecureResponderDisplay({ responder, reputation, onConnect }: SecureResponderDisplayProps) {
  const trustScore = calculateTrustScore(reputation);
  const warnings = generateWarnings(responder, reputation);
  
  return (
    <div className="responder-option">
      <div className="responder-header">
        <img src={responder.icon} alt={responder.name} />
        <div>
          <h3>{responder.name}</h3>
          <p className="rdns">{responder.rdns}</p>
        </div>
        <TrustBadge score={trustScore} level={reputation.verificationLevel} />
      </div>
      
      <div className="responder-details">
        <p>{reputation.userCount.toLocaleString()} users</p>
        <p>Supported chains: {responder.chains.join(', ')}</p>
      </div>
      
      {warnings.length > 0 && (
        <div className="security-warnings">
          {warnings.map((warning, i) => (
            <SecurityWarning key={i} warning={warning} />
          ))}
        </div>
      )}
      
      <button 
        onClick={onConnect}
        className={`connect-button ${trustScore < 50 ? 'low-trust' : ''}`}
      >
        Connect to Responder
      </button>
    </div>
  );
}
```

## Emergency Response Procedures

### Incident Response Plan

1. **Detection**: Monitor for suspicious patterns
2. **Assessment**: Evaluate threat severity
3. **Containment**: Block malicious origins/responders
4. **Communication**: Alert users and developers
5. **Recovery**: Update security measures
6. **Lessons Learned**: Improve defenses

### Responder Blocklist Management
```typescript
interface ResponderBlocklist {
  blockedResponders: Set<string>;  // RDNS of blocked responders
  blockedOrigins: Set<string>;     // Blocked initiator origins
  lastUpdated: number;
  version: string;
}

class SecurityBlocklist {
  private blocklist: ResponderBlocklist;
  
  async updateBlocklist(): Promise<void> {
    // Fetch from trusted security feeds
    const updates = await this.fetchBlocklistUpdates();
    this.mergeUpdates(updates);
    this.notifyComponents();
  }
  
  isResponderBlocked(rdns: string): boolean {
    return this.blocklist.blockedResponders.has(rdns);
  }
  
  isOriginBlocked(origin: string): boolean {
    return this.blocklist.blockedOrigins.has(origin);
  }
}
```

## Multi-Environment Support

### Origin Proof for Non-Browser Environments

In non-browser environments where `window.location.origin` is not available, the protocol supports origin proofs:

```typescript
interface OriginProof {
  method: 'event-origin' | 'proof';
  timestamp: number;
  nonce?: string;
  signature?: string;  // Required for non-browser
}

// Browser environment - automatic origin
const browserRequest: DiscoveryRequestEvent = {
  type: 'discovery:wallet:request',
  origin: window.location.origin,
  // ... other fields
};

// Non-browser environment - origin proof
const nonBrowserRequest: DiscoveryRequestEvent = {
  type: 'discovery:wallet:request', 
  origin: 'app://my-desktop-app',
  originProof: {
    method: 'proof',
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
    signature: await signOrigin(privateKey, origin)
  },
  // ... other fields
};
```

### Environment Detection

```typescript
function detectEnvironment(): 'browser' | 'non-browser' {
  if (typeof window !== 'undefined' && window.location) {
    return 'browser';
  }
  return 'non-browser';
}

function validateOriginForEnvironment(
  origin: string,
  proof?: OriginProof
): boolean {
  const env = detectEnvironment();
  
  if (env === 'browser') {
    // Validate using window.location.origin
    return origin === window.location.origin;
  } else {
    // Validate using origin proof
    return proof && validateOriginProof(origin, proof);
  }
}
```

## Conclusion

Practical security for the discovery protocol requires a layered approach:

1. **Protocol Security**: Core properties enforced by the protocol
2. **Implementation Security**: Proper coding practices and validation
3. **User Education**: Clear warnings and verification guidance
4. **Monitoring**: Real-time threat detection and response
5. **Community**: Shared threat intelligence and best practices

The protocol provides a solid foundation, but real-world security requires addressing the threats that actually impact users. Focus on visual phishing prevention, supply chain security, and user education rather than theoretical protocol attacks.

**Remember**: The goal is not perfect theoretical security, but practical protection against real-world threats that users actually face.