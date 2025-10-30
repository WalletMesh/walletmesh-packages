/**
 * Development mode features for enhanced debugging and validation
 * @internal
 */

import { isChainType, isWalletInfo } from '../../../api/types/guards.js';
import { walletMeshDebugger } from '../../../debug/debugger.js';
import type { ModalState } from '../../../types.js';
import { ErrorFactory } from '../errors/errorFactory.js';

// Extend Window interface for dev mode properties
declare global {
  interface Window {
    walletMeshDevModeEnabled?: boolean;
    walletMeshDev?: {
      config: DevModeConfig;
      getStateHistory: () => Array<{ timestamp: number; state: Partial<ModalState> }>;
      getEventLog: () => Array<{ timestamp: number; event: string; data: unknown }>;
      clearHistory: () => void;
      setConfig: (config: Partial<DevModeConfig>) => void;
    };
  }
}

/**
 * Development mode configuration
 */
export interface DevModeConfig {
  /** Enable verbose logging */
  verboseLogging?: boolean;
  /** Enable strict validation */
  strictValidation?: boolean;
  /** Enable performance monitoring */
  performanceMonitoring?: boolean;
  /** Enable state change tracking */
  stateTracking?: boolean;
  /** Log all events */
  logAllEvents?: boolean;
  /** Validate all inputs */
  validateInputs?: boolean;
  /** Enable deprecation warnings */
  deprecationWarnings?: boolean;
}

/**
 * Development mode manager
 */
export class DevModeManager {
  private config: DevModeConfig;
  private performanceMarks = new Map<string, number>();
  private stateHistory: Array<{ timestamp: number; state: Partial<ModalState> }> = [];
  private eventLog: Array<{ timestamp: number; event: string; data: unknown }> = [];

  constructor(config: DevModeConfig = {}) {
    this.config = {
      verboseLogging: true,
      strictValidation: true,
      performanceMonitoring: true,
      stateTracking: true,
      logAllEvents: true,
      validateInputs: true,
      deprecationWarnings: true,
      ...config,
    };

    if (this.isEnabled()) {
      this.initialize();
    }
  }

  /**
   * Check if development mode is enabled
   */
  isEnabled(): boolean {
    return typeof window !== 'undefined' && window.walletMeshDevModeEnabled === true;
  }

  /**
   * Initialize development mode features
   */
  private initialize(): void {
    walletMeshDebugger.setEnabled(true);
    walletMeshDebugger.installGlobal();

    if (typeof window !== 'undefined') {
      const self = this;
      window.walletMeshDev = {
        get config() {
          return self.config;
        },
        getStateHistory: () => this.stateHistory,
        getEventLog: () => this.eventLog,
        clearHistory: () => {
          this.stateHistory = [];
          this.eventLog = [];
        },
        setConfig: (config: Partial<DevModeConfig>) => {
          this.config = { ...this.config, ...config };
        },
      };
    }

    walletMeshDebugger.log('Development mode initialized', this.config);
  }

  /**
   * Validate wallet info with detailed error messages
   */
  validateWalletInfo(walletInfo: unknown, context: string): void {
    if (!this.config.validateInputs || !this.isEnabled()) return;

    if (!isWalletInfo(walletInfo)) {
      const errors: string[] = [];

      if (!walletInfo || typeof walletInfo !== 'object') {
        errors.push('Wallet info must be an object');
      } else {
        const info = walletInfo as Record<string, unknown>;

        if (typeof info['id'] !== 'string') {
          errors.push(`id must be a string, got ${typeof info['id']}`);
        }
        if (typeof info['name'] !== 'string') {
          errors.push(`name must be a string, got ${typeof info['name']}`);
        }
        if (typeof info['icon'] !== 'string') {
          errors.push(`icon must be a string (URL or data URI), got ${typeof info['icon']}`);
        }
        if (!Array.isArray(info['chains'])) {
          errors.push(`chains must be an array, got ${typeof info['chains']}`);
        } else if (!info['chains'].every(isChainType)) {
          errors.push('chains array contains invalid chain types. Valid: evm, solana, aztec');
        }
      }

      const errorMessage = `Invalid wallet info in ${context}:\n${errors.join('\n')}`;
      walletMeshDebugger.error(errorMessage, walletInfo);
      throw ErrorFactory.configurationError(errorMessage, { walletInfo, context });
    }
  }

  /**
   * Start performance measurement
   */
  startPerformanceMeasure(label: string): void {
    if (!this.config.performanceMonitoring || !this.isEnabled()) return;

    const now = performance?.now ? performance.now() : Date.now();
    this.performanceMarks.set(label, now);
    walletMeshDebugger.log(`Performance: Started measuring "${label}"`);
  }

  /**
   * End performance measurement
   */
  endPerformanceMeasure(label: string): number | undefined {
    if (!this.config.performanceMonitoring || !this.isEnabled()) return;

    const startTime = this.performanceMarks.get(label);
    if (startTime === undefined) {
      walletMeshDebugger.warn(`Performance: No start mark found for "${label}"`);
      return;
    }

    const now = performance?.now ? performance.now() : Date.now();
    const duration = now - startTime;
    this.performanceMarks.delete(label);

    const color = duration < 100 ? '#27AE60' : duration < 500 ? '#F39C12' : '#E74C3C';
    // Note: Performance logging uses console for colored output in dev tools
    console.log(
      `%c[WalletMesh Performance]%c ${label}: ${duration.toFixed(2)}ms`,
      'color: #8E44AD; font-weight: bold;',
      `color: ${color};`,
    );

    return duration;
  }

  /**
   * Track state change
   */
  trackStateChange(oldState: Partial<ModalState>, newState: Partial<ModalState>): void {
    if (!this.config.stateTracking || !this.isEnabled()) return;

    this.stateHistory.push({
      timestamp: Date.now(),
      state: newState,
    });

    // Keep only last 50 state changes
    if (this.stateHistory.length > 50) {
      this.stateHistory.shift();
    }

    walletMeshDebugger.logStateChange(oldState, newState);
  }

  /**
   * Log event
   */
  logEvent(event: string, data?: unknown): void {
    if (!this.config.logAllEvents || !this.isEnabled()) return;

    this.eventLog.push({
      timestamp: Date.now(),
      event,
      data,
    });

    // Keep only last 100 events
    if (this.eventLog.length > 100) {
      this.eventLog.shift();
    }

    walletMeshDebugger.log(`Event: ${event}`, data);
  }

  /**
   * Validate chain type
   */
  validateChainType(chainType: unknown, context: string): void {
    if (!this.config.validateInputs || !this.isEnabled()) return;

    if (!isChainType(chainType)) {
      const error = `Invalid chain type "${chainType}" in ${context}. Valid types: evm, solana, aztec`;
      walletMeshDebugger.error(error);
      throw ErrorFactory.configurationError(error, { chainType, context });
    }
  }

  /**
   * Create a detailed error report
   */
  async createErrorReport(error: Error, context: Record<string, unknown>): Promise<string> {
    const debugInfo = await walletMeshDebugger.getDebugInfo();

    const report = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      debug: debugInfo,
      stateHistory: this.stateHistory.slice(-10), // Last 10 state changes
      eventLog: this.eventLog.slice(-20), // Last 20 events
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(report, null, 2);
  }
}

/**
 * Global development mode instance
 */
export const devMode = new DevModeManager();

/**
 * Development mode decorator for methods
 */
export function logPerformance(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  // Always apply debug timing in this build

  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    // biome-ignore lint/suspicious/noExplicitAny: Need constructor name from unknown target
    const label = `${(target as any).constructor.name}.${propertyKey}`;
    devMode.startPerformanceMeasure(label);

    try {
      const result = await originalMethod.apply(this, args);
      devMode.endPerformanceMeasure(label);
      return result;
    } catch (error) {
      devMode.endPerformanceMeasure(label);
      throw error;
    }
  };

  return descriptor;
}
