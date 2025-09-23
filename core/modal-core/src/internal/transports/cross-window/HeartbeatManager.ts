/**
 * Heartbeat Manager for Cross-Window Transport
 *
 * Manages heartbeat/keep-alive mechanism for connection health monitoring.
 * Sends periodic PING messages and tracks PONG responses.
 *
 * @module cross-window/HeartbeatManager
 * @internal
 */

import {
  type ControlMessage,
  ControlType,
  type PingPayload,
  type PongPayload,
  createControlMessage,
} from './protocol.js';

/**
 * Heartbeat configuration
 */
export interface HeartbeatConfig {
  /** Heartbeat interval in milliseconds */
  interval?: number;
  /** Timeout for PONG response in milliseconds */
  timeout?: number;
  /** Number of missed heartbeats before connection is considered dead */
  maxMissed?: number;
  /** Whether to include metrics in heartbeat */
  includeMetrics?: boolean;
  /** Whether to auto-start heartbeat */
  autoStart?: boolean;
}

/**
 * Heartbeat metrics
 */
export interface HeartbeatMetrics {
  /** Number of heartbeats sent */
  pingsSent: number;
  /** Number of heartbeats received */
  pongsReceived: number;
  /** Number of missed heartbeats */
  missedPongs: number;
  /** Current consecutive missed count */
  consecutiveMissed: number;
  /** Average round-trip latency in milliseconds */
  avgLatency: number;
  /** Minimum latency in milliseconds */
  minLatency: number;
  /** Maximum latency in milliseconds */
  maxLatency: number;
  /** Last successful heartbeat timestamp */
  lastSuccessful: number;
  /** Connection health score (0-100) */
  healthScore: number;
}

/**
 * Heartbeat event handlers
 */
export interface HeartbeatHandlers {
  /** Called when a PING needs to be sent */
  onSendPing: (message: ControlMessage) => void;
  /** Called when connection is considered healthy */
  onHealthy?: () => void;
  /** Called when connection is degraded */
  onDegraded?: () => void;
  /** Called when connection is considered dead */
  onDead?: () => void;
  /** Called with updated metrics */
  onMetricsUpdate?: (metrics: HeartbeatMetrics) => void;
}

/**
 * Default heartbeat configuration
 */
const DEFAULT_CONFIG: Required<HeartbeatConfig> = {
  interval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  maxMissed: 3,
  includeMetrics: true,
  autoStart: true,
};

/**
 * Connection health states
 */
export enum HealthState {
  Healthy = 'healthy',
  Degraded = 'degraded',
  Dead = 'dead',
}

/**
 * Manages heartbeat mechanism for connection health
 */
export class HeartbeatManager {
  private readonly config: Required<HeartbeatConfig>;
  private readonly handlers: HeartbeatHandlers;
  private readonly metrics: HeartbeatMetrics;
  private readonly latencyHistory: number[] = [];
  private readonly maxHistorySize = 10;

  private heartbeatTimer?: NodeJS.Timeout;
  private pongTimer?: NodeJS.Timeout;
  private currentSequence = 0;
  private pendingPings = new Map<number, number>();
  private currentState = HealthState.Healthy;
  private sessionId?: string;
  private messageStats = {
    sent: 0,
    received: 0,
  };

  constructor(config: HeartbeatConfig, handlers: HeartbeatHandlers) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.handlers = handlers;

    this.metrics = {
      pingsSent: 0,
      pongsReceived: 0,
      missedPongs: 0,
      consecutiveMissed: 0,
      avgLatency: 0,
      minLatency: Number.POSITIVE_INFINITY,
      maxLatency: 0,
      lastSuccessful: Date.now(),
      healthScore: 100,
    };

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start heartbeat mechanism
   */
  start(sessionId?: string): void {
    if (sessionId) {
      this.sessionId = sessionId;
    }
    this.stop(); // Clear any existing timers
    this.scheduleNextHeartbeat();
    console.debug('[HeartbeatManager] Started heartbeat mechanism');
  }

  /**
   * Stop heartbeat mechanism
   */
  stop(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete this.heartbeatTimer;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete this.pongTimer;
    }
    this.pendingPings.clear();
    console.debug('[HeartbeatManager] Stopped heartbeat mechanism');
  }

  /**
   * Handle incoming PONG message
   */
  handlePong(pong: PongPayload): void {
    const pingTime = pong.pingTime;
    const pongTime = pong.pongTime;

    // Check if we have a pending ping for this response
    if (!this.pendingPings.has(pingTime)) {
      console.warn('[HeartbeatManager] Received unexpected PONG');
      return;
    }

    // Calculate latency
    const latency = pongTime - pingTime;
    this.pendingPings.delete(pingTime);

    // Update metrics
    this.metrics.pongsReceived++;
    this.metrics.consecutiveMissed = 0;
    this.metrics.lastSuccessful = Date.now();
    this.updateLatencyMetrics(latency);

    // Update message stats from PONG
    if (pong.metrics) {
      this.messageStats.received = pong.metrics.messagesReceived;
    }

    // Clear pong timeout
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete this.pongTimer;
    }

    // Update health state
    this.updateHealthState();

    // Notify metrics update
    if (this.handlers.onMetricsUpdate) {
      this.handlers.onMetricsUpdate(this.getMetrics());
    }

    console.debug(`[HeartbeatManager] PONG received, latency: ${latency}ms`);
  }

  /**
   * Send a PING message
   */
  sendPing(): void {
    const pingTime = Date.now();
    this.currentSequence++;

    const metrics: PingPayload['metrics'] = {
      messagesSent: this.messageStats.sent,
      messagesReceived: this.messageStats.received,
      lastActivity: Date.now(),
    };
    if (this.config.includeMetrics) {
      const memUsage = this.getMemoryUsage();
      if (memUsage !== undefined) {
        metrics.memoryUsage = memUsage;
      }
    }
    const pingPayload: PingPayload = {
      metrics,
      pingTime,
    };

    const message = createControlMessage(ControlType.Ping, pingPayload, this.currentSequence, this.sessionId);

    // Track pending ping
    this.pendingPings.set(pingTime, Date.now());
    this.metrics.pingsSent++;

    // Send ping
    this.handlers.onSendPing(message);

    // Set timeout for PONG response
    this.pongTimer = setTimeout(() => {
      this.handleMissedPong(pingTime);
    }, this.config.timeout);

    console.debug('[HeartbeatManager] PING sent');
  }

  /**
   * Update message statistics
   */
  updateMessageStats(sent: number, received: number): void {
    this.messageStats.sent = sent;
    this.messageStats.received = received;
  }

  /**
   * Get current metrics
   */
  getMetrics(): Readonly<HeartbeatMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get current health state
   */
  getHealthState(): HealthState {
    return this.currentState;
  }

  /**
   * Check if connection is healthy
   */
  isHealthy(): boolean {
    return this.currentState === HealthState.Healthy;
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics.pingsSent = 0;
    this.metrics.pongsReceived = 0;
    this.metrics.missedPongs = 0;
    this.metrics.consecutiveMissed = 0;
    this.metrics.avgLatency = 0;
    this.metrics.minLatency = Number.POSITIVE_INFINITY;
    this.metrics.maxLatency = 0;
    this.metrics.lastSuccessful = Date.now();
    this.metrics.healthScore = 100;
    this.latencyHistory.length = 0;
    this.pendingPings.clear();
  }

  /**
   * Dispose of the heartbeat manager
   */
  dispose(): void {
    this.stop();
    this.pendingPings.clear();
    this.latencyHistory.length = 0;
  }

  /**
   * Schedule next heartbeat
   */
  private scheduleNextHeartbeat(): void {
    this.heartbeatTimer = setTimeout(() => {
      this.sendPing();
      this.scheduleNextHeartbeat();
    }, this.config.interval);
  }

  /**
   * Handle missed PONG
   */
  private handleMissedPong(pingTime: number): void {
    if (!this.pendingPings.has(pingTime)) {
      return; // Already handled
    }

    this.pendingPings.delete(pingTime);
    this.metrics.missedPongs++;
    this.metrics.consecutiveMissed++;

    console.warn(
      `[HeartbeatManager] Missed PONG (${this.metrics.consecutiveMissed}/${this.config.maxMissed})`,
    );

    // Update health state
    this.updateHealthState();

    // Check if connection is dead
    if (this.metrics.consecutiveMissed >= this.config.maxMissed) {
      this.handleDeadConnection();
    }

    // Notify metrics update
    if (this.handlers.onMetricsUpdate) {
      this.handlers.onMetricsUpdate(this.getMetrics());
    }
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latency: number): void {
    // Add to history
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.maxHistorySize) {
      this.latencyHistory.shift();
    }

    // Update min/max
    this.metrics.minLatency = Math.min(this.metrics.minLatency, latency);
    this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency);

    // Calculate average
    const sum = this.latencyHistory.reduce((acc, val) => acc + val, 0);
    this.metrics.avgLatency = Math.round(sum / this.latencyHistory.length);
  }

  /**
   * Update health state
   */
  private updateHealthState(): void {
    const previousState = this.currentState;

    // Calculate health score (0-100)
    const missedRatio = this.metrics.consecutiveMissed / this.config.maxMissed;
    const latencyScore = this.calculateLatencyScore();
    this.metrics.healthScore = Math.round((1 - missedRatio * 0.7) * latencyScore * 100);

    // Determine state
    if (this.metrics.consecutiveMissed >= this.config.maxMissed) {
      this.currentState = HealthState.Dead;
    } else if (this.metrics.consecutiveMissed > 0 || this.metrics.healthScore < 70) {
      this.currentState = HealthState.Degraded;
    } else {
      this.currentState = HealthState.Healthy;
    }

    // Notify state changes
    if (previousState !== this.currentState) {
      console.debug(`[HeartbeatManager] Health state changed: ${previousState} -> ${this.currentState}`);

      switch (this.currentState) {
        case HealthState.Healthy:
          this.handlers.onHealthy?.();
          break;
        case HealthState.Degraded:
          this.handlers.onDegraded?.();
          break;
        case HealthState.Dead:
          this.handlers.onDead?.();
          break;
      }
    }
  }

  /**
   * Calculate latency score (0-1)
   */
  private calculateLatencyScore(): number {
    if (this.latencyHistory.length === 0) {
      return 1;
    }

    // Score based on average latency
    // Excellent: <50ms = 1.0
    // Good: <200ms = 0.8
    // Fair: <500ms = 0.6
    // Poor: <1000ms = 0.4
    // Very Poor: >1000ms = 0.2
    const avg = this.metrics.avgLatency;
    if (avg < 50) return 1.0;
    if (avg < 200) return 0.8;
    if (avg < 500) return 0.6;
    if (avg < 1000) return 0.4;
    return 0.2;
  }

  /**
   * Handle dead connection
   */
  private handleDeadConnection(): void {
    console.error('[HeartbeatManager] Connection is dead');
    this.stop();
    this.handlers.onDead?.();
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
    }
    return undefined;
  }
}

/**
 * Create a heartbeat manager with default configuration
 */
export function createHeartbeatManager(
  handlers: HeartbeatHandlers,
  config?: HeartbeatConfig,
): HeartbeatManager {
  return new HeartbeatManager(config || {}, handlers);
}
