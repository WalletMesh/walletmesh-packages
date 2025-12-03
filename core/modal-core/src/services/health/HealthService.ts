/**
 * Health monitoring service for WalletMesh
 *
 * Monitors wallet connection health, network status, and provides recovery recommendations.
 * Extracted from ConnectionService for better separation of concerns.
 *
 * @module services/health/HealthService
 * @category Services
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';

/**
 * Health status levels
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Network status
 */
export type NetworkStatus = 'online' | 'offline' | 'slow' | 'unknown';

/**
 * Recovery strategy types
 */
export type RecoveryStrategy = 'retry' | 'reconnect' | 'refresh' | 'switch_endpoint' | 'manual';

/**
 * Error classification
 */
export type ErrorClassification =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'rate_limit'
  | 'server'
  | 'client'
  | 'unknown';

/**
 * Responsiveness metrics
 */
export interface ResponsivenessMetrics {
  /** Average response time in milliseconds */
  avgResponseTime: number;
  /** Maximum response time in milliseconds */
  maxResponseTime: number;
  /** Minimum response time in milliseconds */
  minResponseTime: number;
  /** Number of samples */
  sampleCount: number;
}

/**
 * Stability metrics
 */
export interface StabilityMetrics {
  /** Total number of requests */
  totalRequests: number;
  /** Number of failed requests */
  failedRequests: number;
  /** Error rate (0-1) */
  errorRate: number;
  /** Uptime percentage (0-100) */
  uptimePercentage: number;
  /** Last error timestamp */
  lastErrorAt?: number;
}

/**
 * Health issue
 */
export interface HealthIssue {
  /** Issue type */
  type: 'network' | 'performance' | 'stability' | 'configuration';
  /** Issue severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Issue description */
  description: string;
  /** Suggested resolution */
  resolution?: string;
  /** Timestamp when issue was detected */
  detectedAt: number;
}

/**
 * Health diagnostics
 */
export interface HealthDiagnostics {
  /** Overall health status */
  status: HealthStatus;
  /** Network status */
  networkStatus: NetworkStatus;
  /** Responsiveness metrics */
  responsiveness: ResponsivenessMetrics;
  /** Stability metrics */
  stability: StabilityMetrics;
  /** Active health issues */
  issues: HealthIssue[];
  /** Last health check timestamp */
  lastCheckAt: number;
}

/**
 * Provider test parameters
 */
export interface ProviderTestParams {
  /** Provider instance to test */
  provider: unknown;
  /** Test timeout in milliseconds */
  timeout?: number;
  /** Methods to test */
  methods?: string[];
}

/**
 * Network diagnostics
 */
export interface NetworkDiagnostics {
  /** Network latency in milliseconds */
  latency?: number;
  /** Packet loss percentage */
  packetLoss?: number;
  /** Connection stability score (0-100) */
  stabilityScore?: number;
  /** DNS resolution time in milliseconds */
  dnsTime?: number;
}

/**
 * Health test result
 */
export interface HealthTestResult {
  /** Test passed */
  passed: boolean;
  /** Test duration in milliseconds */
  duration: number;
  /** Error if test failed */
  error?: string;
  /** Additional test data */
  data?: Record<string, unknown>;
}

/**
 * Health monitoring configuration
 */
export interface HealthMonitoringConfig {
  /** Enable health monitoring */
  enabled?: boolean;
  /** Health check interval in milliseconds */
  checkInterval?: number;
  /** Metrics retention period in milliseconds */
  metricsRetention?: number;
  /** Threshold for degraded status (error rate) */
  degradedThreshold?: number;
  /** Threshold for unhealthy status (error rate) */
  unhealthyThreshold?: number;
}

/**
 * Recovery attempt
 */
export interface RecoveryAttempt {
  /** Attempt number */
  attemptNumber: number;
  /** Strategy used */
  strategy: RecoveryStrategy;
  /** Whether attempt succeeded */
  success: boolean;
  /** Error if attempt failed */
  error?: Error;
  /** Timestamp of attempt */
  timestamp: number;
  /** Duration of attempt in milliseconds */
  duration: number;
}

/**
 * Error analysis
 */
export interface ErrorAnalysis {
  /** Error classification */
  classification: ErrorClassification;
  /** Whether error is recoverable */
  recoverable: boolean;
  /** Suggested recovery strategy */
  suggestedStrategy: RecoveryStrategy;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Recovery state
 */
export interface RecoveryState {
  /** Whether recovery is in progress */
  inProgress: boolean;
  /** Current attempt number */
  currentAttempt: number;
  /** Recovery attempts history */
  attempts: RecoveryAttempt[];
  /** Last successful recovery timestamp */
  lastSuccessAt?: number;
  /** Last failed recovery timestamp */
  lastFailureAt?: number;
}

/**
 * Health service dependencies
 */
export interface HealthServiceDependencies extends BaseServiceDependencies {
  logger: Logger;
}

/**
 * Health monitoring and recovery service
 *
 * Monitors connection health and provides recovery strategies.
 */
export class HealthService {
  private logger: Logger;
  private config: HealthMonitoringConfig;
  private diagnostics: HealthDiagnostics;
  private recoveryState: RecoveryState;
  private metricsHistory: Array<{ timestamp: number; metrics: ResponsivenessMetrics }> = [];

  constructor(dependencies: HealthServiceDependencies, config: HealthMonitoringConfig = {}) {
    this.logger = dependencies.logger;
    this.config = {
      enabled: true,
      checkInterval: 30000, // 30 seconds
      metricsRetention: 3600000, // 1 hour
      degradedThreshold: 0.1, // 10% error rate
      unhealthyThreshold: 0.3, // 30% error rate
      ...config,
    };

    this.diagnostics = this.createInitialDiagnostics();
    this.recoveryState = this.createInitialRecoveryState();
  }

  /**
   * Create initial health diagnostics
   */
  private createInitialDiagnostics(): HealthDiagnostics {
    return {
      status: 'unknown',
      networkStatus: 'unknown',
      responsiveness: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        sampleCount: 0,
      },
      stability: {
        totalRequests: 0,
        failedRequests: 0,
        errorRate: 0,
        uptimePercentage: 100,
      },
      issues: [],
      lastCheckAt: Date.now(),
    };
  }

  /**
   * Create initial recovery state
   */
  private createInitialRecoveryState(): RecoveryState {
    return {
      inProgress: false,
      currentAttempt: 0,
      attempts: [],
    };
  }

  /**
   * Check provider health
   */
  async checkHealth(provider: unknown): Promise<HealthDiagnostics> {
    if (!this.config.enabled) {
      return this.diagnostics;
    }

    const startTime = Date.now();
    this.logger.debug('Starting health check');

    try {
      // Test provider responsiveness
      const testResult = await this.testProvider({ provider });

      // Update metrics
      this.updateResponsivenessMetrics(testResult.duration);

      // Update network status
      this.diagnostics.networkStatus = testResult.passed ? 'online' : 'offline';

      // Calculate health status
      this.diagnostics.status = this.calculateHealthStatus(this.diagnostics);

      // Detect issues
      this.detectHealthIssues();

      this.diagnostics.lastCheckAt = Date.now();

      this.logger.debug('Health check completed', {
        status: this.diagnostics.status,
        duration: Date.now() - startTime,
      });

      return this.diagnostics;
    } catch (error) {
      this.logger.error('Health check failed', error);
      this.diagnostics.status = 'unknown';
      this.diagnostics.networkStatus = 'unknown';
      return this.diagnostics;
    }
  }

  /**
   * Test provider connectivity
   */
  private async testProvider(params: ProviderTestParams): Promise<HealthTestResult> {
    const { provider, timeout = 5000 } = params;
    const startTime = Date.now();

    try {
      // Simple connectivity test - check if provider exists and responds
      if (!provider) {
        throw ErrorFactory.connectionFailed('Provider not available');
      }

      // Test a basic method if provider has request method
      const providerWithRequest = provider as { request?: (params: { method: string }) => Promise<unknown> };
      if (typeof providerWithRequest.request === 'function') {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Provider test timeout')), timeout);
        });

        await Promise.race([providerWithRequest.request({ method: 'eth_chainId' }), timeoutPromise]);
      }

      return {
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Provider test failed',
      };
    }
  }

  /**
   * Update responsiveness metrics
   */
  private updateResponsivenessMetrics(responseTime: number): void {
    const metrics = this.diagnostics.responsiveness;

    // Update sample count
    metrics.sampleCount++;

    // Update min/max
    if (metrics.sampleCount === 1) {
      metrics.minResponseTime = responseTime;
      metrics.maxResponseTime = responseTime;
    } else {
      metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
      metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
    }

    // Update average
    metrics.avgResponseTime =
      (metrics.avgResponseTime * (metrics.sampleCount - 1) + responseTime) / metrics.sampleCount;

    // Store in history
    this.metricsHistory.push({
      timestamp: Date.now(),
      metrics: { ...metrics },
    });

    // Clean old metrics
    this.cleanOldMetrics();
  }

  /**
   * Clean old metrics from history
   */
  private cleanOldMetrics(): void {
    const metricsRetention = this.config.metricsRetention ?? 3600000;
    const cutoff = Date.now() - metricsRetention;
    this.metricsHistory = this.metricsHistory.filter((m) => m.timestamp > cutoff);
  }

  /**
   * Calculate health status based on diagnostics
   */
  private calculateHealthStatus(diagnostics: HealthDiagnostics): HealthStatus {
    // Check network status
    if (diagnostics.networkStatus === 'offline') {
      return 'unhealthy';
    }

    // Check error rate
    const { errorRate } = diagnostics.stability;
    const unhealthyThreshold = this.config.unhealthyThreshold ?? 0.3;
    const degradedThreshold = this.config.degradedThreshold ?? 0.1;
    if (errorRate >= unhealthyThreshold) {
      return 'unhealthy';
    }
    if (errorRate >= degradedThreshold) {
      return 'degraded';
    }

    // Check responsiveness
    if (diagnostics.responsiveness.avgResponseTime > 5000) {
      return 'degraded';
    }

    // Check for critical issues
    const hasCriticalIssue = diagnostics.issues.some((i) => i.severity === 'critical');
    if (hasCriticalIssue) {
      return 'unhealthy';
    }

    const hasHighIssue = diagnostics.issues.some((i) => i.severity === 'high');
    if (hasHighIssue) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Detect health issues
   */
  private detectHealthIssues(): void {
    const issues: HealthIssue[] = [];
    const { responsiveness, stability, networkStatus } = this.diagnostics;

    // Check network issues
    if (networkStatus === 'offline') {
      issues.push({
        type: 'network',
        severity: 'critical',
        description: 'Network connection is offline',
        resolution: 'Check network connection and provider availability',
        detectedAt: Date.now(),
      });
    } else if (networkStatus === 'slow') {
      issues.push({
        type: 'network',
        severity: 'medium',
        description: 'Network connection is slow',
        resolution: 'Network may be congested, consider switching endpoints',
        detectedAt: Date.now(),
      });
    }

    // Check performance issues
    if (responsiveness.avgResponseTime > 5000) {
      issues.push({
        type: 'performance',
        severity: 'high',
        description: `High average response time: ${responsiveness.avgResponseTime}ms`,
        resolution: 'Consider switching to a faster endpoint',
        detectedAt: Date.now(),
      });
    }

    // Check stability issues
    if (stability.errorRate > 0.3) {
      issues.push({
        type: 'stability',
        severity: 'critical',
        description: `High error rate: ${(stability.errorRate * 100).toFixed(1)}%`,
        resolution: 'Connection is unstable, consider reconnecting',
        detectedAt: Date.now(),
      });
    } else if (stability.errorRate > 0.1) {
      issues.push({
        type: 'stability',
        severity: 'medium',
        description: `Elevated error rate: ${(stability.errorRate * 100).toFixed(1)}%`,
        resolution: 'Monitor connection stability',
        detectedAt: Date.now(),
      });
    }

    this.diagnostics.issues = issues;
  }

  /**
   * Classify an error
   */
  classifyError(error: Error): ErrorClassification {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'rate_limit';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'server';
    }
    if (message.includes('client') || message.includes('400')) {
      return 'client';
    }

    return 'unknown';
  }

  /**
   * Analyze error and suggest recovery strategy
   */
  analyzeError(error: Error, attemptCount = 0): ErrorAnalysis {
    const classification = this.classifyError(error);

    let recoverable = true;
    let suggestedStrategy: RecoveryStrategy = 'retry';
    let retryDelay = 1000;
    let maxRetries = 3;

    switch (classification) {
      case 'network':
        suggestedStrategy = attemptCount > 2 ? 'switch_endpoint' : 'retry';
        retryDelay = this.calculateRetryDelay(attemptCount);
        maxRetries = 5;
        break;

      case 'timeout':
        suggestedStrategy = 'retry';
        retryDelay = this.calculateRetryDelay(attemptCount, 2000);
        maxRetries = 3;
        break;

      case 'auth':
        suggestedStrategy = 'reconnect';
        recoverable = attemptCount < 2;
        maxRetries = 1;
        break;

      case 'rate_limit':
        suggestedStrategy = 'retry';
        retryDelay = 30000; // 30 seconds
        maxRetries = 10;
        break;

      case 'server':
        suggestedStrategy = attemptCount > 3 ? 'switch_endpoint' : 'retry';
        retryDelay = this.calculateRetryDelay(attemptCount, 5000);
        maxRetries = 5;
        break;

      case 'client':
        recoverable = false;
        suggestedStrategy = 'manual';
        maxRetries = 0;
        break;

      default:
        suggestedStrategy = attemptCount > 2 ? 'reconnect' : 'retry';
        retryDelay = this.calculateRetryDelay(attemptCount);
        maxRetries = 3;
    }

    return {
      classification,
      recoverable,
      suggestedStrategy,
      retryDelay,
      maxRetries,
      context: {
        attemptCount,
        errorMessage: error.message,
      },
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
    const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  /**
   * Record recovery attempt
   */
  recordRecoveryAttempt(strategy: RecoveryStrategy, success: boolean, error?: Error, duration = 0): void {
    const attempt: RecoveryAttempt = {
      attemptNumber: this.recoveryState.currentAttempt + 1,
      strategy,
      success,
      ...(error !== undefined && { error }),
      timestamp: Date.now(),
      duration,
    };

    this.recoveryState.attempts.push(attempt);
    this.recoveryState.currentAttempt++;

    if (success) {
      this.recoveryState.lastSuccessAt = Date.now();
      this.recoveryState.inProgress = false;
      this.recoveryState.currentAttempt = 0;
    } else {
      this.recoveryState.lastFailureAt = Date.now();
    }

    // Update stability metrics
    this.diagnostics.stability.totalRequests++;
    if (!success) {
      this.diagnostics.stability.failedRequests++;
      this.diagnostics.stability.lastErrorAt = Date.now();
    }
    this.diagnostics.stability.errorRate =
      this.diagnostics.stability.failedRequests / this.diagnostics.stability.totalRequests;
  }

  /**
   * Start recovery process
   */
  startRecovery(): void {
    this.recoveryState.inProgress = true;
    this.logger.info('Starting recovery process');
  }

  /**
   * Stop recovery process
   */
  stopRecovery(): void {
    this.recoveryState.inProgress = false;
    this.recoveryState.currentAttempt = 0;
    this.logger.info('Stopped recovery process');
  }

  /**
   * Get recovery state
   */
  getRecoveryState(): RecoveryState {
    return { ...this.recoveryState };
  }

  /**
   * Get current health diagnostics
   */
  getDiagnostics(): HealthDiagnostics {
    return { ...this.diagnostics };
  }

  /**
   * Reset health metrics
   */
  resetMetrics(): void {
    this.diagnostics = this.createInitialDiagnostics();
    this.recoveryState = this.createInitialRecoveryState();
    this.metricsHistory = [];
    this.logger.info('Health metrics reset');
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    status: HealthStatus;
    networkStatus: NetworkStatus;
    issueCount: number;
    errorRate: number;
    avgResponseTime: number;
  } {
    return {
      status: this.diagnostics.status,
      networkStatus: this.diagnostics.networkStatus,
      issueCount: this.diagnostics.issues.length,
      errorRate: this.diagnostics.stability.errorRate,
      avgResponseTime: this.diagnostics.responsiveness.avgResponseTime,
    };
  }
}
