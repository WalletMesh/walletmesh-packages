import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import type { ModalState } from '../../../types.js';

// Install custom matchers
installCustomMatchers();

// Mock debugger using factory function to avoid hoisting issues
vi.mock('../../../debug/debugger.js', () => ({
  walletMeshDebugger: {
    setEnabled: vi.fn(),
    installGlobal: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    logStateChange: vi.fn(),
    getDebugInfo: vi.fn(() =>
      Promise.resolve({
        timestamp: '2023-01-01T12:00:00.000Z',
        environment: { browser: 'Chrome', userAgent: 'test', platform: 'Win32', mobile: false },
        wallets: { detected: [] },
        providers: { ethereum: false, solana: false, aztec: false },
      }),
    ),
  },
}));

import { walletMeshDebugger } from '../../../debug/debugger.js';
// Import after mocking
import { type DevModeConfig, DevModeManager, devMode, logPerformance } from './devMode.js';

// Mock global objects
const mockWindow = {
  walletMeshDevModeEnabled: undefined as boolean | undefined,
  walletMeshDev: undefined as unknown,
};

const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const mockPerformance = {
  now: vi.fn(() => 1000),
};

/**
 * DevModeManager Tests
 *
 * Comprehensive tests for DevModeManager with organized structure:
 * - Constructor and initialization - Core setup and environment detection
 * - isEnabled - Feature detection and runtime status
 * - validateWalletInfo - Input validation for wallet configurations
 * - Performance measurement - Timing and monitoring functionality
 * - State tracking - Development state management and history
 * - Event logging - Analytics and event management
 * - Chain type validation - Blockchain type validation systems
 * - Error reporting - Comprehensive error collection and reporting
 * - Global dev object - Runtime debugging interface
 * - Global devMode instance - Singleton management
 * - logPerformance decorator - Method-level performance monitoring
 * - Edge cases and error handling - Robustness and error scenarios
 *
 * @internal
 */

describe('DevModeManager', () => {
  const testEnv = createTestEnvironment();
  let manager: DevModeManager;

  beforeEach(async () => {
    await testEnv.setup();

    // Reset mock objects
    mockWindow.walletMeshDevModeEnabled = undefined;
    mockWindow.walletMeshDev = undefined;

    // Mock global objects
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });

    Object.defineProperty(global, 'console', {
      value: mockConsole,
      writable: true,
    });

    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
    });

    vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Constructor and initialization', () => {
    it('should create manager with default config', () => {
      manager = new DevModeManager();

      expect(manager).toBeDefined();
      expect(walletMeshDebugger.setEnabled).not.toHaveBeenCalled();
      expect(walletMeshDebugger.installGlobal).not.toHaveBeenCalled();
    });

    it('should create manager with custom config', () => {
      const config: DevModeConfig = {
        verboseLogging: false,
        strictValidation: false,
        performanceMonitoring: false,
        stateTracking: false,
        logAllEvents: false,
        validateInputs: false,
        deprecationWarnings: false,
      };

      manager = new DevModeManager(config);

      expect(manager).toBeDefined();
    });

    it('should initialize when dev mode is enabled', () => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();

      expect(walletMeshDebugger.setEnabled).toHaveBeenCalledWith(true);
      expect(walletMeshDebugger.installGlobal).toHaveBeenCalled();
      expect(walletMeshDebugger.log).toHaveBeenCalledWith(
        'Development mode initialized',
        expect.objectContaining({
          verboseLogging: true,
          strictValidation: true,
          performanceMonitoring: true,
          stateTracking: true,
          logAllEvents: true,
          validateInputs: true,
        }),
      );
    });

    it('should set up global dev object when enabled', () => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();

      expect(mockWindow.walletMeshDev).toBeDefined();
      expect(typeof mockWindow.walletMeshDev.getStateHistory).toBe('function');
      expect(typeof mockWindow.walletMeshDev.getEventLog).toBe('function');
      expect(typeof mockWindow.walletMeshDev.clearHistory).toBe('function');
      expect(typeof mockWindow.walletMeshDev.setConfig).toBe('function');
    });

    it('should handle environment without window object', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      manager = new DevModeManager();

      expect(manager.isEnabled()).toBe(false);
      expect(walletMeshDebugger.setEnabled).not.toHaveBeenCalled();
    });
  });

  describe('isEnabled', () => {
    beforeEach(() => {
      manager = new DevModeManager();
    });

    it('should return false when dev mode flag is not set', () => {
      expect(manager.isEnabled()).toBe(false);
    });

    it('should return false when dev mode flag is false', () => {
      mockWindow.walletMeshDevModeEnabled = false;
      expect(manager.isEnabled()).toBe(false);
    });

    it('should return true when dev mode flag is true', () => {
      mockWindow.walletMeshDevModeEnabled = true;
      expect(manager.isEnabled()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe('validateWalletInfo', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should not validate when validateInputs is disabled', () => {
      const config = { validateInputs: false };
      manager = new DevModeManager(config);

      expect(() => manager.validateWalletInfo({}, 'test')).not.toThrow();
    });

    it('should not validate when dev mode is disabled', () => {
      mockWindow.walletMeshDevModeEnabled = false;
      manager = new DevModeManager();

      expect(() => manager.validateWalletInfo({}, 'test')).not.toThrow();
    });

    it('should pass validation for valid wallet info', () => {
      const validWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(validWalletInfo, 'test context')).not.toThrow();
    });

    it('should throw error for null wallet info', () => {
      expect(() => manager.validateWalletInfo(null, 'test context')).toThrow(
        'Invalid wallet info in test context:\nWallet info must be an object',
      );
    });

    it('should throw error for non-object wallet info', () => {
      expect(() => manager.validateWalletInfo('string', 'test context')).toThrow(
        'Invalid wallet info in test context:\nWallet info must be an object',
      );
    });

    it('should throw detailed error for missing id', () => {
      const invalidWalletInfo = {
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nid must be a string, got undefined',
      );
    });

    it('should throw detailed error for invalid id type', () => {
      const invalidWalletInfo = {
        id: 123,
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nid must be a string, got number',
      );
    });

    it('should throw detailed error for missing name', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nname must be a string, got undefined',
      );
    });

    it('should throw detailed error for invalid name type', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        name: true,
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nname must be a string, got boolean',
      );
    });

    it('should throw detailed error for missing icon', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nicon must be a string (URL or data URI), got undefined',
      );
    });

    it('should throw detailed error for invalid icon type', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: null,
        chains: [ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nicon must be a string (URL or data URI), got object',
      );
    });

    it('should throw detailed error for missing chains', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nchains must be an array, got undefined',
      );
    });

    it('should throw detailed error for non-array chains', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: 'evm',
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nchains must be an array, got string',
      );
    });

    it('should throw detailed error for invalid chain types', () => {
      const invalidWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: ['invalid-chain', ChainType.Evm],
      };

      expect(() => manager.validateWalletInfo(invalidWalletInfo, 'test context')).toThrow(
        'Invalid wallet info in test context:\nchains array contains invalid chain types. Valid: evm, solana, aztec',
      );
    });

    it('should log error when validation fails', () => {
      const invalidWalletInfo = { id: 123 };

      try {
        manager.validateWalletInfo(invalidWalletInfo, 'test context');
      } catch {
        // Expected to throw
      }

      expect(walletMeshDebugger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid wallet info in test context'),
        invalidWalletInfo,
      );
    });

    it('should collect multiple validation errors', () => {
      const invalidWalletInfo = {
        id: 123,
        name: true,
        icon: null,
        chains: 'not-an-array',
      };

      const errorMessage = () => manager.validateWalletInfo(invalidWalletInfo, 'test context');
      expect(errorMessage).toThrow();

      try {
        manager.validateWalletInfo(invalidWalletInfo, 'test context');
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain('id must be a string, got number');
        expect(message).toContain('name must be a string, got boolean');
        expect(message).toContain('icon must be a string (URL or data URI), got object');
        expect(message).toContain('chains must be an array, got string');
      }
    });
  });

  describe('Performance measurement', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should not measure when performanceMonitoring is disabled', () => {
      const config = { performanceMonitoring: false };
      manager = new DevModeManager(config);

      manager.startPerformanceMeasure('test');
      const duration = manager.endPerformanceMeasure('test');

      expect(duration).toBeUndefined();
      expect(mockPerformance.now).not.toHaveBeenCalled();
    });

    it('should not measure when dev mode is disabled', () => {
      mockWindow.walletMeshDevModeEnabled = false;
      manager = new DevModeManager();

      manager.startPerformanceMeasure('test');
      const duration = manager.endPerformanceMeasure('test');

      expect(duration).toBeUndefined();
    });

    it('should start performance measurement', () => {
      manager.startPerformanceMeasure('test operation');

      expect(mockPerformance.now).toHaveBeenCalled();
      expect(walletMeshDebugger.log).toHaveBeenCalledWith('Performance: Started measuring "test operation"');
    });

    it('should end performance measurement and return duration', () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1500);

      manager.startPerformanceMeasure('test operation');
      const duration = manager.endPerformanceMeasure('test operation');

      expect(duration).toBe(500);
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Performance]%c test operation: 500.00ms',
        'color: #8E44AD; font-weight: bold;',
        'color: #E74C3C;',
      );
    });

    it('should use green color for fast operations', () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1050);

      manager.startPerformanceMeasure('fast operation');
      manager.endPerformanceMeasure('fast operation');

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Performance]%c fast operation: 50.00ms',
        'color: #8E44AD; font-weight: bold;',
        'color: #27AE60;',
      );
    });

    it('should use orange color for medium operations', () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1200);

      manager.startPerformanceMeasure('medium operation');
      manager.endPerformanceMeasure('medium operation');

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Performance]%c medium operation: 200.00ms',
        'color: #8E44AD; font-weight: bold;',
        'color: #F39C12;',
      );
    });

    it('should handle missing start mark', () => {
      const duration = manager.endPerformanceMeasure('non-existent');

      expect(duration).toBeUndefined();
      expect(walletMeshDebugger.warn).toHaveBeenCalledWith(
        'Performance: No start mark found for "non-existent"',
      );
    });

    it('should clean up performance marks after measurement', () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      manager.startPerformanceMeasure('test');
      manager.endPerformanceMeasure('test');

      // Second call should not find the mark
      const duration = manager.endPerformanceMeasure('test');
      expect(duration).toBeUndefined();
    });
  });

  describe('State tracking', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should not track when stateTracking is disabled', () => {
      const config = { stateTracking: false };
      manager = new DevModeManager(config);

      const oldState: Partial<ModalState> = { view: 'walletSelection' };
      const newState: Partial<ModalState> = { view: 'connecting' };

      manager.trackStateChange(oldState, newState);

      expect(walletMeshDebugger.logStateChange).not.toHaveBeenCalled();
    });

    it('should not track when dev mode is disabled', () => {
      mockWindow.walletMeshDevModeEnabled = false;
      manager = new DevModeManager();

      const oldState: Partial<ModalState> = { view: 'walletSelection' };
      const newState: Partial<ModalState> = { view: 'connecting' };

      manager.trackStateChange(oldState, newState);

      expect(walletMeshDebugger.logStateChange).not.toHaveBeenCalled();
    });

    it('should track state changes', () => {
      const oldState: Partial<ModalState> = { view: 'walletSelection' };
      const newState: Partial<ModalState> = { view: 'connecting' };

      manager.trackStateChange(oldState, newState);

      expect(walletMeshDebugger.logStateChange).toHaveBeenCalledWith(oldState, newState);
    });

    it('should limit state history to 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        const state: Partial<ModalState> = { view: 'walletSelection' };
        manager.trackStateChange({}, state);
      }

      const history = mockWindow.walletMeshDev?.getStateHistory();
      expect(history).toHaveLength(50);
    });

    it('should provide state history through global dev object', () => {
      const state1: Partial<ModalState> = { view: 'walletSelection' };
      const state2: Partial<ModalState> = { view: 'connecting' };

      manager.trackStateChange({}, state1);
      manager.trackStateChange(state1, state2);

      const history = mockWindow.walletMeshDev?.getStateHistory();
      expect(history).toHaveLength(2);
      expect(history?.[0].state).toEqual(state1);
      expect(history?.[1].state).toEqual(state2);
    });
  });

  describe('Event logging', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should not log when logAllEvents is disabled', () => {
      const config = { logAllEvents: false };
      manager = new DevModeManager(config);

      manager.logEvent('test-event', { data: true });

      expect(walletMeshDebugger.log).toHaveBeenCalledWith('Development mode initialized', expect.any(Object));
      expect(walletMeshDebugger.log).not.toHaveBeenCalledWith('Event: test-event', expect.any(Object));
    });

    it('should not log when dev mode is disabled', () => {
      vi.clearAllMocks(); // Clear previous calls
      mockWindow.walletMeshDevModeEnabled = false;
      manager = new DevModeManager();

      manager.logEvent('test-event', { data: true });

      // Should only have the initialization call, not the event call
      const calls = vi.mocked(walletMeshDebugger.log).mock.calls;
      const eventCalls = calls.filter((call) => call[0].startsWith('Event:'));
      expect(eventCalls).toHaveLength(0);
    });

    it('should log events with data', () => {
      const eventData = { walletId: 'metamask', connected: true };

      manager.logEvent('wallet-connected', eventData);

      expect(walletMeshDebugger.log).toHaveBeenCalledWith('Event: wallet-connected', eventData);
    });

    it('should log events without data', () => {
      manager.logEvent('modal-opened');

      expect(walletMeshDebugger.log).toHaveBeenCalledWith('Event: modal-opened', undefined);
    });

    it('should limit event log to 100 entries', () => {
      for (let i = 0; i < 110; i++) {
        manager.logEvent(`event-${i}`);
      }

      const eventLog = mockWindow.walletMeshDev?.getEventLog();
      expect(eventLog).toHaveLength(100);
      expect(eventLog?.[0].event).toBe('event-10'); // First 10 should be removed
    });

    it('should provide event log through global dev object', () => {
      manager.logEvent('event-1', { data: 1 });
      manager.logEvent('event-2', { data: 2 });

      const eventLog = mockWindow.walletMeshDev?.getEventLog();
      expect(eventLog).toHaveLength(2);
      expect(eventLog?.[0].event).toBe('event-1');
      expect(eventLog?.[1].event).toBe('event-2');
    });
  });

  describe('Chain type validation', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should not validate when validateInputs is disabled', () => {
      const config = { validateInputs: false };
      manager = new DevModeManager(config);

      expect(() => manager.validateChainType('invalid', 'test')).not.toThrow();
    });

    it('should not validate when dev mode is disabled', () => {
      mockWindow.walletMeshDevModeEnabled = false;
      manager = new DevModeManager();

      expect(() => manager.validateChainType('invalid', 'test')).not.toThrow();
    });

    it('should pass validation for valid chain types', () => {
      expect(() => manager.validateChainType(ChainType.Evm, 'test')).not.toThrow();
      expect(() => manager.validateChainType(ChainType.Solana, 'test')).not.toThrow();
      expect(() => manager.validateChainType(ChainType.Aztec, 'test')).not.toThrow();
    });

    it('should throw error for invalid chain type', () => {
      expect(() => manager.validateChainType('bitcoin', 'test context')).toThrow(
        'Invalid chain type "bitcoin" in test context. Valid types: evm, solana, aztec',
      );
    });

    it('should log error when chain type validation fails', () => {
      try {
        manager.validateChainType('invalid', 'test context');
      } catch {
        // Expected to throw
      }

      expect(walletMeshDebugger.error).toHaveBeenCalledWith(
        'Invalid chain type "invalid" in test context. Valid types: evm, solana, aztec',
      );
    });
  });

  describe('Error reporting', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should create detailed error report', async () => {
      const testError = new Error('Test error');
      testError.stack = 'Error stack trace';
      const context = { component: 'TestComponent', operation: 'test' };

      // Add some state and events
      manager.trackStateChange({}, { view: 'walletSelection' });
      manager.logEvent('test-event', { data: true });

      const report = await manager.createErrorReport(testError, context);
      const parsed = JSON.parse(report);

      expect(parsed.error.message).toBe('Test error');
      expect(parsed.error.stack).toBe('Error stack trace');
      expect(parsed.error.name).toBe('Error');
      expect(parsed.context).toEqual(context);
      expect(parsed.debug).toBeDefined();
      expect(parsed.debug.timestamp).toBe('2023-01-01T12:00:00.000Z');
      expect(parsed.debug.environment.browser).toBe('Chrome');
      expect(parsed.stateHistory).toHaveLength(1);
      expect(parsed.eventLog).toHaveLength(1);
      expect(parsed.timestamp).toBe('2023-01-01T12:00:00.000Z');
    });

    it('should limit state history in error report to last 10 entries', async () => {
      const testError = new Error('Test error');
      const context = {};

      // Add 15 state changes
      for (let i = 0; i < 15; i++) {
        manager.trackStateChange({}, { view: 'walletSelection' });
      }

      const report = await manager.createErrorReport(testError, context);
      const parsed = JSON.parse(report);

      expect(parsed.stateHistory).toHaveLength(10);
    });

    it('should limit event log in error report to last 20 entries', async () => {
      const testError = new Error('Test error');
      const context = {};

      // Add 25 events
      for (let i = 0; i < 25; i++) {
        manager.logEvent(`event-${i}`);
      }

      const report = await manager.createErrorReport(testError, context);
      const parsed = JSON.parse(report);

      expect(parsed.eventLog).toHaveLength(20);
    });
  });

  describe('Global dev object', () => {
    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();
    });

    it('should clear history and events', () => {
      manager.trackStateChange({}, { view: 'walletSelection' });
      manager.logEvent('test-event');

      expect(mockWindow.walletMeshDev?.getStateHistory()).toHaveLength(1);
      expect(mockWindow.walletMeshDev?.getEventLog()).toHaveLength(1);

      mockWindow.walletMeshDev?.clearHistory();

      expect(mockWindow.walletMeshDev?.getStateHistory()).toHaveLength(0);
      expect(mockWindow.walletMeshDev?.getEventLog()).toHaveLength(0);
    });

    it('should update config through global object', () => {
      const globalDev = mockWindow.walletMeshDev as {
        config: DevModeConfig;
        setConfig: (config: Partial<DevModeConfig>) => void;
      };

      // Verify initial config
      expect(globalDev?.config.verboseLogging).toBe(true);
      expect(globalDev?.config.strictValidation).toBe(true);

      const newConfig = { verboseLogging: false, strictValidation: false };
      globalDev?.setConfig(newConfig);

      // After setConfig, the config object is replaced, so we need to access it again
      const updatedConfig = globalDev?.config;
      expect(updatedConfig.verboseLogging).toBe(false);
      expect(updatedConfig.strictValidation).toBe(false);
      // Other config values should remain unchanged
      expect(updatedConfig.performanceMonitoring).toBe(true);
    });

    it('should provide access to current config', () => {
      const config = mockWindow.walletMeshDev?.config;

      expect(config).toEqual({
        verboseLogging: true,
        strictValidation: true,
        performanceMonitoring: true,
        stateTracking: true,
        logAllEvents: true,
        validateInputs: true,
        deprecationWarnings: true,
      });
    });
  });

  describe('Global devMode instance', () => {
    it('should be available as singleton', () => {
      expect(devMode).toBeDefined();
      expect(devMode).toBeInstanceOf(DevModeManager);
    });

    it('should use same instance across imports', async () => {
      const { devMode: devMode2 } = await import('./devMode.js');
      expect(devMode).toBe(devMode2);
    });
  });

  describe('logPerformance decorator', () => {
    class TestClass {
      constructor(public name: string) {}

      async testMethod(value: string): Promise<string> {
        // Use immediate resolve to avoid timer issues in tests
        await Promise.resolve();
        return `processed: ${value}`;
      }

      async throwingMethod(): Promise<void> {
        throw new Error('Test error');
      }

      syncMethod(value: number): number {
        return value * 2;
      }
    }

    // Apply decorator manually
    const testMethodDescriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod');
    if (testMethodDescriptor) {
      Object.defineProperty(
        TestClass.prototype,
        'testMethod',
        logPerformance(TestClass.prototype, 'testMethod', testMethodDescriptor),
      );
    }

    const throwingMethodDescriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'throwingMethod');
    if (throwingMethodDescriptor) {
      Object.defineProperty(
        TestClass.prototype,
        'throwingMethod',
        logPerformance(TestClass.prototype, 'throwingMethod', throwingMethodDescriptor),
      );
    }

    const syncMethodDescriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'syncMethod');
    if (syncMethodDescriptor) {
      Object.defineProperty(
        TestClass.prototype,
        'syncMethod',
        logPerformance(TestClass.prototype, 'syncMethod', syncMethodDescriptor),
      );
    }

    let testInstance: TestClass;

    beforeEach(() => {
      mockWindow.walletMeshDevModeEnabled = true;
      testInstance = new TestClass('test');
    });

    it('should measure performance of async methods', async () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      const result = await testInstance.testMethod('test-value');

      expect(result).toBe('processed: test-value');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Performance]%c TestClass.testMethod: 100.00ms',
        'color: #8E44AD; font-weight: bold;',
        'color: #F39C12;',
      );
    });

    it('should measure performance of sync methods', async () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1050);

      const result = await testInstance.syncMethod(5);

      expect(result).toBe(10);
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Performance]%c TestClass.syncMethod: 50.00ms',
        'color: #8E44AD; font-weight: bold;',
        'color: #27AE60;',
      );
    });

    it('should handle errors and still measure performance', async () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1200);

      await expect(testInstance.throwingMethod()).rejects.toThrow('Test error');

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Performance]%c TestClass.throwingMethod: 200.00ms',
        'color: #8E44AD; font-weight: bold;',
        'color: #F39C12;',
      );
    });

    it('should work when dev mode is disabled', async () => {
      mockWindow.walletMeshDevModeEnabled = false;

      const result = await testInstance.testMethod('test-value');

      expect(result).toBe('processed: test-value');
      // Performance logging should still happen (decorator always applies)
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing performance.now', () => {
      // Create manager with dev mode enabled
      mockWindow.walletMeshDevModeEnabled = true;

      // Mock performance object to not have the now method
      Object.defineProperty(global, 'performance', {
        value: {},
        writable: true,
      });

      manager = new DevModeManager();

      // Should handle gracefully when performance.now is not available
      expect(() => manager.startPerformanceMeasure('test')).not.toThrow();
      expect(() => manager.endPerformanceMeasure('test')).not.toThrow();
    });

    it('should handle validation of complex nested objects', () => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();

      const complexObject = {
        id: 'wallet',
        name: 'Wallet',
        icon: 'icon',
        chains: [ChainType.Evm],
        nested: {
          deep: {
            value: true,
          },
        },
        array: [1, 2, 3],
      };

      expect(() => manager.validateWalletInfo(complexObject, 'test')).not.toThrow();
    });

    it('should handle empty chains array', () => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();

      const walletWithEmptyChains = {
        id: 'wallet',
        name: 'Wallet',
        icon: 'icon',
        chains: [],
      };

      expect(() => manager.validateWalletInfo(walletWithEmptyChains, 'test')).not.toThrow();
    });

    it('should handle concurrent performance measurements', () => {
      mockWindow.walletMeshDevModeEnabled = true;
      manager = new DevModeManager();

      // Mock performance.now to return different values
      let callCount = 0;
      const mockNow = vi.fn(() => {
        const values = [1000, 2000, 3000, 4000];
        return values[callCount++] || 5000;
      });

      Object.defineProperty(global, 'performance', {
        value: { now: mockNow },
        writable: true,
      });

      manager.startPerformanceMeasure('operation1');
      manager.startPerformanceMeasure('operation2');

      const duration1 = manager.endPerformanceMeasure('operation1');
      const duration2 = manager.endPerformanceMeasure('operation2');

      expect(duration1).toBe(2000); // 3000 - 1000
      expect(duration2).toBe(2000); // 4000 - 2000
    });
  });
});
