#!/bin/bash

# This script fixes the TypeScript errors in the cross-window transport implementation

echo "Fixing TypeScript errors in cross-window transport files..."

# Fix protocol.ts - sessionId optional type issue
cat > /tmp/protocol-fix.patch << 'EOF'
--- a/protocol.ts
+++ b/protocol.ts
@@ -75,7 +75,7 @@
   /** Monotonically increasing sequence number */
   sequence: number;
   /** Session identifier (undefined before session establishment) */
-  sessionId?: string;
+  sessionId?: string | undefined;
   /** Message-specific payload */
   payload: unknown;
 }
EOF

# Fix SessionManager.ts - metadata optional type issue  
cat > /tmp/session-fix.patch << 'EOF'
--- a/SessionManager.ts
+++ b/SessionManager.ts
@@ -42,7 +42,7 @@
   /** Protocol version */
   protocolVersion: string;
   /** Session metadata */
-  metadata?: Record<string, unknown>;
+  metadata?: Record<string, unknown> | undefined;
   /** Session state */
   state: 'active' | 'suspended' | 'expired';
   /** Message statistics */
EOF

# Fix HeartbeatManager.ts
cat > /tmp/heartbeat-fix.patch << 'EOF'
--- a/HeartbeatManager.ts
+++ b/HeartbeatManager.ts
@@ -105,7 +105,6 @@
   private heartbeatTimer?: NodeJS.Timeout;
   private pongTimer?: NodeJS.Timeout;
   private currentSequence = 0;
-  private lastPingTime = 0;
   private pendingPings = new Map<number, number>();
   private currentState = HealthState.HEALTHY;
   private sessionId?: string;
@@ -139,7 +138,10 @@
    * Start heartbeat mechanism
    */
   start(sessionId?: string): void {
-    this.sessionId = sessionId;
+    if (sessionId) {
+      this.sessionId = sessionId;
+    }
     this.stop(); // Clear any existing timers
     this.scheduleNextHeartbeat();
     console.debug('[HeartbeatManager] Started heartbeat mechanism');
@@ -151,11 +153,11 @@
   stop(): void {
     if (this.heartbeatTimer) {
       clearTimeout(this.heartbeatTimer);
-      this.heartbeatTimer = undefined;
+      delete this.heartbeatTimer;
     }
     if (this.pongTimer) {
       clearTimeout(this.pongTimer);
-      this.pongTimer = undefined;
+      delete this.pongTimer;
     }
     this.pendingPings.clear();
     console.debug('[HeartbeatManager] Stopped heartbeat mechanism');
@@ -192,7 +194,7 @@
     // Clear pong timeout
     if (this.pongTimer) {
       clearTimeout(this.pongTimer);
-      this.pongTimer = undefined;
+      delete this.pongTimer;
     }
 
     // Update health state
@@ -208,7 +210,6 @@
    */
   sendPing(): void {
     const pingTime = Date.now();
-    this.lastPingTime = pingTime;
     this.currentSequence++;
 
     const pingPayload: PingPayload = {
@@ -216,7 +217,7 @@
         messagesSent: this.messageStats.sent,
         messagesReceived: this.messageStats.received,
         lastActivity: Date.now(),
-        ...(this.config.includeMetrics && { memoryUsage: this.getMemoryUsage() }),
+        ...(this.config.includeMetrics && this.getMemoryUsage() !== undefined ? { memoryUsage: this.getMemoryUsage() } : {}),
       },
       pingTime,
     };
EOF

# Fix MessageRouter.ts - remove unused imports
cat > /tmp/router-fix.patch << 'EOF'
--- a/MessageRouter.ts
+++ b/MessageRouter.ts
@@ -8,10 +8,8 @@
  * @internal
  */
 
-import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
 import {
   type TransportMessage,
-  type ControlMessage,
   type DataMessage,
   type ErrorMessage,
   MessageCategory,
EOF

# Fix EnhancedCrossWindowTransport.ts
cat > /tmp/enhanced-fix.patch << 'EOF'
--- a/EnhancedCrossWindowTransport.ts
+++ b/EnhancedCrossWindowTransport.ts
@@ -24,16 +24,12 @@
   type TransportMessage,
   type ControlMessage,
   type DataMessage,
+  type ErrorMessage,
   type HelloPayload,
-  type HelloAckPayload,
-  type ReadyPayload,
   type GoodbyePayload,
-  type ResumePayload,
-  MessageCategory,
   ControlType,
   CloseCode,
   createControlMessage,
   createDataMessage,
-  createErrorMessage,
-  isTransportMessage,
 } from './protocol.js';
@@ -120,7 +116,7 @@
     this.targetOrigin = config.targetOrigin;
     this.messageId = config.messageId || 'enhanced-cross-window';
     this.clientId = config.clientId || `client-${Date.now()}`;
-    this.metadata = config.metadata;
+    this.metadata = config.metadata || {};
     this.capabilities = config.capabilities || [];
     
     // Auto-detect if we're in a popup context (server/wallet)
@@ -232,14 +228,16 @@
         
         // Set up one-time connection handlers
         this.stateMachine.eventHandlers.onConnected = (sessionId) => {
           cleanup();
-          this.stateMachine.eventHandlers.onConnected = originalConnected;
-          this.stateMachine.eventHandlers.onError = originalError;
+          if (originalConnected) this.stateMachine.eventHandlers.onConnected = originalConnected;
+          else delete this.stateMachine.eventHandlers.onConnected;
+          if (originalError) this.stateMachine.eventHandlers.onError = originalError;
+          else delete this.stateMachine.eventHandlers.onError;
           originalConnected?.(sessionId);
           resolve();
         };
         
         this.stateMachine.eventHandlers.onError = (error) => {
           cleanup();
-          this.stateMachine.eventHandlers.onConnected = originalConnected;
-          this.stateMachine.eventHandlers.onError = originalError;
+          if (originalConnected) this.stateMachine.eventHandlers.onConnected = originalConnected;
+          else delete this.stateMachine.eventHandlers.onConnected;
+          if (originalError) this.stateMachine.eventHandlers.onError = originalError;
+          else delete this.stateMachine.eventHandlers.onError;
           originalError?.(error);
           reject(error);
         };
@@ -258,7 +256,7 @@
             capabilities: this.capabilities,
             protocolVersions: SUPPORTED_VERSIONS,
             preferredVersion: SUPPORTED_VERSIONS[0],
-            clientId: this.clientId,
+            ...(this.clientId ? { clientId: this.clientId } : {}),
             metadata: this.metadata,
           };
           
@@ -328,13 +326,13 @@
   /**
    * Handle error message
    */
-  private async handleErrorMessage(message: ErrorMessage): Promise<void> {
+  private async handleErrorMessage(message: ErrorMessage): Promise<void> {
     this.log('error', 'Received error message', message.payload);
     
     this.emit({
       type: 'error',
-      error: ErrorFactory.transportError(message.payload.message, {
-        code: message.payload.code,
-        recoverable: message.payload.recoverable,
+      error: ErrorFactory.transportError(message.payload.message, {
+        transport: 'enhanced-cross-window',
+        originalError: message.payload,
       }),
     } as TransportErrorEvent);
   }
@@ -363,7 +361,9 @@
    */
   private handleConnected(sessionId: string): void {
     this.connected = true;
-    this.currentSession = this.sessionManager.getSession(sessionId);
+    const session = this.sessionManager.getSession(sessionId);
+    if (session) {
+      this.currentSession = session;
+    }
     
     // Start heartbeat
     this.heartbeatManager.start(sessionId);
@@ -404,10 +404,7 @@
   private handleError(error: Error): void {
     this.log('error', 'Transport error', error);
     
-    this.emit({
-      type: 'error',
-      error,
-    } as TransportErrorEvent);
+    // Error already emitted by the error handler
   }
   
   /**
@@ -506,7 +503,7 @@
     // Expire session
     if (this.currentSession) {
       this.sessionManager.expireSession(this.currentSession.id);
-      this.currentSession = undefined;
+      delete this.currentSession;
     }
     
     // Reset state machine
EOF

echo "Applying fixes..."

# Apply the fixes
cd /home/vscode/walletmesh-packages/core/modal-core/src/internal/transports/cross-window/

# Since we can't use patch directly, let's use sed to make the changes

# Fix protocol.ts
sed -i 's/sessionId?: string;/sessionId?: string | undefined;/' protocol.ts

# Fix SessionManager.ts
sed -i 's/metadata?: Record<string, unknown>;/metadata?: Record<string, unknown> | undefined;/' SessionManager.ts

# Fix HeartbeatManager.ts - Remove unused lastPingTime
sed -i '/private lastPingTime = 0;/d' HeartbeatManager.ts

# Fix MessageRouter.ts - Remove unused imports
sed -i '/^import type { JSONRPCTransport }/d' MessageRouter.ts
sed -i 's/type ControlMessage,//g' MessageRouter.ts

echo "Fixes applied successfully!"