import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType, createTestEnvironment } from '../testing/index.js';
import type { ConnectionResult, ModalState, WalletInfo } from '../types.js';
import { WalletMeshDebugger, walletMeshDebugger } from './debugger.js';

// Mock global objects
const mockWindow = {
  walletMeshDebugEnabled: undefined as boolean | undefined,
  walletMeshDebug: undefined as unknown,
  ethereum: undefined as unknown,
  solana: undefined as unknown,
  aztec: undefined as unknown,
};

const mockNavigator = {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  platform: 'Win32',
};

const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  table: vi.fn(),
};

describe('WalletMeshDebugger', () => {
  let debuggerInstance: WalletMeshDebugger;

  // Store original values
  const originalWindow = global.window;
  const originalNavigator = global.navigator;
  const originalConsole = global.console;

  // Use centralized test setup pattern with custom browser setup
  const testEnv = createTestEnvironment({
    customSetup: () => {
      // Mock global objects
      Object.assign(global, { window: mockWindow });
      Object.assign(global, { navigator: mockNavigator });
      Object.assign(global, { console: mockConsole });
    },
    customTeardown: () => {
      // Restore original values
      Object.assign(global, { window: originalWindow });
      Object.assign(global, { navigator: originalNavigator });
      Object.assign(global, { console: originalConsole });
    },
  });

  beforeEach(async () => {
    await testEnv.setup();

    // Reset window state
    mockWindow.walletMeshDebugEnabled = undefined;
    mockWindow.walletMeshDebug = undefined;
    mockWindow.ethereum = undefined;
    mockWindow.solana = undefined;
    mockWindow.aztec = undefined;

    debuggerInstance = new WalletMeshDebugger();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Constructor and initialization', () => {
    it('should create debugger with debug disabled by default', () => {
      expect(debuggerInstance).toBeDefined();
      // Debug should be disabled since window.walletMeshDebugEnabled is undefined
      debuggerInstance.log('test message');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should create debugger with debug enabled when flag is set', () => {
      mockWindow.walletMeshDebugEnabled = true;
      debuggerInstance = new WalletMeshDebugger();

      debuggerInstance.log('test message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c test message',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        undefined,
      );
    });

    it('should handle environment without window object', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      debuggerInstance = new WalletMeshDebugger();

      // Should not throw and should be disabled
      debuggerInstance.log('test message');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe('setEnabled', () => {
    it('should enable debugging and set window flag', () => {
      debuggerInstance.setEnabled(true);

      expect(mockWindow.walletMeshDebugEnabled).toBe(true);

      debuggerInstance.log('test message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c test message',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        undefined,
      );
    });

    it('should disable debugging and set window flag', () => {
      debuggerInstance.setEnabled(true);
      debuggerInstance.setEnabled(false);

      expect(mockWindow.walletMeshDebugEnabled).toBe(false);

      debuggerInstance.log('test message');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should handle environment without window object', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      debuggerInstance.setEnabled(true);

      // Should not throw
      debuggerInstance.log('test message');
      // When window is undefined, debugging should still work since we can't set the flag
      expect(mockConsole.log).toHaveBeenCalled();
    });
  });

  describe('Logging methods', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
    });

    describe('log', () => {
      it('should log message without data', () => {
        debuggerInstance.log('test message');

        expect(mockConsole.log).toHaveBeenCalledWith(
          '%c[WalletMesh Debug]%c test message',
          'color: #4A90E2; font-weight: bold;',
          'color: inherit;',
          undefined,
        );
      });

      it('should log message with data', () => {
        const data = { key: 'value', number: 42 };
        debuggerInstance.log('test message', data);

        expect(mockConsole.log).toHaveBeenCalledWith(
          '%c[WalletMesh Debug]%c test message',
          'color: #4A90E2; font-weight: bold;',
          'color: inherit;',
          data,
        );
      });

      it('should not log when disabled', () => {
        debuggerInstance.setEnabled(false);
        debuggerInstance.log('test message');

        expect(mockConsole.log).not.toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should log warning without data', () => {
        debuggerInstance.warn('warning message');

        expect(mockConsole.warn).toHaveBeenCalledWith(
          '%c[WalletMesh Debug]%c warning message',
          'color: #F5A623; font-weight: bold;',
          'color: inherit;',
          undefined,
        );
      });

      it('should log warning with data', () => {
        const data = { warning: true };
        debuggerInstance.warn('warning message', data);

        expect(mockConsole.warn).toHaveBeenCalledWith(
          '%c[WalletMesh Debug]%c warning message',
          'color: #F5A623; font-weight: bold;',
          'color: inherit;',
          data,
        );
      });

      it('should not warn when disabled', () => {
        debuggerInstance.setEnabled(false);
        debuggerInstance.warn('warning message');

        expect(mockConsole.warn).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should log error without error object', () => {
        debuggerInstance.error('error message');

        expect(mockConsole.error).toHaveBeenCalledWith(
          '%c[WalletMesh Debug]%c error message',
          'color: #D0021B; font-weight: bold;',
          'color: inherit;',
          undefined,
        );
      });

      it('should log error with error object', () => {
        const error = new Error('Test error');
        debuggerInstance.error('error message', error);

        expect(mockConsole.error).toHaveBeenCalledWith(
          '%c[WalletMesh Debug]%c error message',
          'color: #D0021B; font-weight: bold;',
          'color: inherit;',
          error,
        );
      });

      it('should not error when disabled', () => {
        debuggerInstance.setEnabled(false);
        debuggerInstance.error('error message');

        expect(mockConsole.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('logWalletDetection', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
    });

    it('should log wallet detection results', () => {
      const walletInfo: WalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'icon-url',
        chains: [ChainType.Evm],
      };

      const results = [
        { wallet: walletInfo, available: true, details: { version: '10.0' } },
        { wallet: { ...walletInfo, id: 'phantom', name: 'Phantom' }, available: false },
      ];

      debuggerInstance.logWalletDetection(results);

      expect(mockConsole.group).toHaveBeenCalledWith(
        '%c[WalletMesh Debug] Wallet Detection Results',
        'color: #4A90E2; font-weight: bold;',
      );

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c✅ MetaMask%c (metamask)',
        'color: #27AE60; font-weight: bold;',
        'color: #7F8C8D;',
        { version: '10.0' },
      );

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c❌ Phantom%c (phantom)',
        'color: #E74C3C; font-weight: bold;',
        'color: #7F8C8D;',
        undefined,
      );

      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should not log when disabled', () => {
      debuggerInstance.setEnabled(false);
      debuggerInstance.logWalletDetection([]);

      expect(mockConsole.group).not.toHaveBeenCalled();
    });

    it('should handle empty results array', () => {
      debuggerInstance.logWalletDetection([]);

      expect(mockConsole.group).toHaveBeenCalled();
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });
  });

  describe('logConnection', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
      vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
    });

    it('should log connection attempt without chain type', () => {
      debuggerInstance.logConnection('metamask');

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c Attempting connection to metamask',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        { timestamp: '2023-01-01T12:00:00.000Z' },
      );
    });

    it('should log connection attempt with chain type', () => {
      debuggerInstance.logConnection('metamask', ChainType.Evm);

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c Attempting connection to metamask on evm',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        { timestamp: '2023-01-01T12:00:00.000Z' },
      );
    });

    it('should not log when disabled', () => {
      debuggerInstance.setEnabled(false);
      debuggerInstance.logConnection('metamask');

      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe('logConnectionResult', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
    });

    it('should log connection result', () => {
      const result: ConnectionResult = {
        address: '0x1234567890123456789012345678901234567890',
        accounts: ['0x1234567890123456789012345678901234567890'],
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: true,
          interfaces: ['eip1193'],
        },
        chainType: ChainType.Evm,
        walletId: 'metamask',
        walletInfo: {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'icon-url',
          chains: [ChainType.Evm],
        },
        provider: {},
        metadata: {
          connectedAt: Date.now(),
          lastActiveAt: Date.now(),
        },
      };

      debuggerInstance.logConnectionResult(result);

      expect(mockConsole.group).toHaveBeenCalledWith(
        '%c[WalletMesh Debug] Connection Successful',
        'color: #27AE60; font-weight: bold;',
      );

      expect(mockConsole.log).toHaveBeenCalledWith('Wallet:', 'metamask');
      expect(mockConsole.log).toHaveBeenCalledWith('Address:', '0x1234567890123456789012345678901234567890');
      expect(mockConsole.log).toHaveBeenCalledWith('Chain:', 'evm (0x1)');
      expect(mockConsole.log).toHaveBeenCalledWith('Accounts:', [
        '0x1234567890123456789012345678901234567890',
      ]);
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should not log when disabled', () => {
      debuggerInstance.setEnabled(false);
      const result = {} as ConnectionResult;
      debuggerInstance.logConnectionResult(result);

      expect(mockConsole.group).not.toHaveBeenCalled();
    });
  });

  describe('logStateChange', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
    });

    it('should log state change', () => {
      const oldState: Partial<ModalState> = { view: 'walletSelection' };
      const newState: Partial<ModalState> = { view: 'connecting' };

      debuggerInstance.logStateChange(oldState, newState);

      expect(mockConsole.group).toHaveBeenCalledWith(
        '%c[WalletMesh Debug] State Change',
        'color: #9B59B6; font-weight: bold;',
      );

      expect(mockConsole.log).toHaveBeenCalledWith('Previous:', oldState);
      expect(mockConsole.log).toHaveBeenCalledWith('Current:', newState);
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should not log when disabled', () => {
      debuggerInstance.setEnabled(false);
      debuggerInstance.logStateChange({}, {});

      expect(mockConsole.group).not.toHaveBeenCalled();
    });
  });

  describe('getDebugInfo', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
      mockWindow.ethereum = { isMetaMask: true };
      mockWindow.solana = { isPhantom: true };
      mockWindow.aztec = { version: '1.0' };
    });

    it('should get comprehensive debug information', async () => {
      const info = await debuggerInstance.getDebugInfo();

      expect(info).toEqual({
        timestamp: '2023-01-01T12:00:00.000Z',
        environment: {
          browser: 'Chrome',
          userAgent: mockNavigator.userAgent,
          platform: 'Win32',
          mobile: false,
        },
        wallets: {
          detected: [],
        },
        providers: {
          ethereum: true,
          solana: true,
          aztec: true,
        },
      });
    });

    it('should detect mobile environment', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        },
        writable: true,
      });

      const info = await debuggerInstance.getDebugInfo();

      expect(info.environment.mobile).toBe(true);
      expect(info.environment.browser).toBe('Safari');
    });

    it('should handle missing providers', async () => {
      mockWindow.ethereum = undefined;
      mockWindow.solana = undefined;
      mockWindow.aztec = undefined;

      const info = await debuggerInstance.getDebugInfo();

      expect(info.providers).toEqual({
        ethereum: false,
        solana: false,
        aztec: false,
      });
    });
  });

  describe('getBrowserInfo', () => {
    const testCases = [
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        expected: 'Chrome',
      },
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        expected: 'Firefox',
      },
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        expected: 'Safari',
      },
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.121',
        expected: 'Chrome',
      },
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
        expected: 'Chrome',
      },
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
        expected: 'Edge',
      },
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Opera/106.0.0.0',
        expected: 'Opera',
      },
      { userAgent: 'CustomBrowser/1.0', expected: 'Unknown' },
    ];

    for (const { userAgent, expected } of testCases) {
      it(`should detect ${expected} browser (${userAgent.includes('Edge') ? 'Edge-like' : userAgent.includes('OPR') ? 'Opera-like' : 'standard'})`, async () => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, userAgent },
          writable: true,
        });

        const info = await debuggerInstance.getDebugInfo();
        expect(info.environment.browser).toBe(expected);
      });
    }
  });

  describe('exportDebugInfo', () => {
    it('should export debug info as JSON string', async () => {
      vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));

      const jsonString = await debuggerInstance.exportDebugInfo();
      const parsed = JSON.parse(jsonString);

      expect(parsed.timestamp).toBe('2023-01-01T12:00:00.000Z');
      expect(parsed.environment).toBeDefined();
      expect(parsed.wallets).toBeDefined();
      expect(parsed.providers).toBeDefined();
    });
  });

  describe('createDebugReport', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
      vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
    });

    it('should create comprehensive debug report', async () => {
      await debuggerInstance.createDebugReport();

      expect(mockConsole.group).toHaveBeenCalledWith(
        '%c[WalletMesh Debug] Debug Report',
        'color: #E67E22; font-weight: bold;',
      );

      expect(mockConsole.log).toHaveBeenCalledWith('🕐 Generated at:', '2023-01-01T12:00:00.000Z');

      // Environment section
      expect(mockConsole.group).toHaveBeenCalledWith('🌐 Environment');
      expect(mockConsole.table).toHaveBeenCalledWith(
        expect.objectContaining({
          browser: 'Chrome',
          platform: 'Win32',
          mobile: false,
        }),
      );

      // Providers section
      expect(mockConsole.group).toHaveBeenCalledWith('💰 Wallet Providers');
      expect(mockConsole.table).toHaveBeenCalledWith(
        expect.objectContaining({
          ethereum: false,
          solana: false,
          aztec: false,
        }),
      );

      // Wallets section
      expect(mockConsole.group).toHaveBeenCalledWith('🔌 Detected Wallets');
      expect(mockConsole.log).toHaveBeenCalledWith('No wallets detected');

      expect(mockConsole.groupEnd).toHaveBeenCalledTimes(4); // Main group + 3 sub-groups
    });

    it('should show detected wallets when available', async () => {
      // Mock debug info with detected wallets
      const originalGetDebugInfo = debuggerInstance.getDebugInfo;
      debuggerInstance.getDebugInfo = vi.fn().mockResolvedValue({
        timestamp: '2023-01-01T12:00:00.000Z',
        environment: { browser: 'Chrome', userAgent: '', platform: 'Win32', mobile: false },
        wallets: {
          detected: [{ id: 'metamask', name: 'MetaMask', available: true }],
        },
        providers: { ethereum: true, solana: false, aztec: false },
      });

      await debuggerInstance.createDebugReport();

      expect(mockConsole.table).toHaveBeenCalledWith([{ id: 'metamask', name: 'MetaMask', available: true }]);

      // Restore original method
      debuggerInstance.getDebugInfo = originalGetDebugInfo;
    });

    it('should show connected wallet when available', async () => {
      // Mock debug info with connected wallet
      const originalGetDebugInfo = debuggerInstance.getDebugInfo;
      debuggerInstance.getDebugInfo = vi.fn().mockResolvedValue({
        timestamp: '2023-01-01T12:00:00.000Z',
        environment: { browser: 'Chrome', userAgent: '', platform: 'Win32', mobile: false },
        wallets: {
          detected: [],
          connected: {
            walletId: 'metamask',
            address: '0x123',
            chainType: ChainType.Evm,
            chainId: '0x1',
          },
        },
        providers: { ethereum: true, solana: false, aztec: false },
      });

      await debuggerInstance.createDebugReport();

      expect(mockConsole.group).toHaveBeenCalledWith('✅ Connected Wallet');
      expect(mockConsole.table).toHaveBeenCalledWith({
        walletId: 'metamask',
        address: '0x123',
        chainType: ChainType.Evm,
        chainId: '0x1',
      });

      // Restore original method
      debuggerInstance.getDebugInfo = originalGetDebugInfo;
    });

    it('should not create report when disabled', async () => {
      debuggerInstance.setEnabled(false);
      await debuggerInstance.createDebugReport();

      expect(mockConsole.group).not.toHaveBeenCalled();
    });
  });

  describe('installGlobal', () => {
    beforeEach(() => {
      debuggerInstance.setEnabled(true);
    });

    it('should install global debug utilities', () => {
      debuggerInstance.installGlobal();

      expect(mockWindow.walletMeshDebug).toBeDefined();
      expect(typeof mockWindow.walletMeshDebug.enable).toBe('function');
      expect(typeof mockWindow.walletMeshDebug.disable).toBe('function');
      expect(typeof mockWindow.walletMeshDebug.report).toBe('function');
      expect(typeof mockWindow.walletMeshDebug.export).toBe('function');
      expect(typeof mockWindow.walletMeshDebug.log).toBe('function');

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c Debug utilities installed. Access via window.walletMeshDebug',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        undefined,
      );
    });

    it('should enable debugging through global utility', () => {
      debuggerInstance.setEnabled(false);
      debuggerInstance.installGlobal();

      mockWindow.walletMeshDebug.enable();
      expect(mockWindow.walletMeshDebugEnabled).toBe(true);
    });

    it('should disable debugging through global utility', () => {
      debuggerInstance.installGlobal();

      mockWindow.walletMeshDebug.disable();
      expect(mockWindow.walletMeshDebugEnabled).toBe(false);
    });

    it('should log through global utility', () => {
      debuggerInstance.installGlobal();

      mockWindow.walletMeshDebug.log('global test message', { data: true });
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c global test message',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        { data: true },
      );
    });

    it('should create report through global utility', async () => {
      debuggerInstance.installGlobal();

      await mockWindow.walletMeshDebug.report();
      expect(mockConsole.group).toHaveBeenCalledWith(
        '%c[WalletMesh Debug] Debug Report',
        'color: #E67E22; font-weight: bold;',
      );
    });

    it('should export through global utility', async () => {
      debuggerInstance.installGlobal();

      const result = await mockWindow.walletMeshDebug.export();
      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toHaveProperty('timestamp');
    });

    it('should handle environment without window object', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      debuggerInstance.installGlobal();

      // Should not throw
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe('Global debugger instance and proxy', () => {
    it('should create singleton instance', () => {
      const instance1 = walletMeshDebugger.instance;
      const instance2 = walletMeshDebugger.instance;

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(WalletMeshDebugger);
    });

    it('should proxy log method', () => {
      walletMeshDebugger.setEnabled(true);
      walletMeshDebugger.log('proxy test message', { proxy: true });

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c proxy test message',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        { proxy: true },
      );
    });

    it('should proxy warn method', () => {
      walletMeshDebugger.setEnabled(true);
      walletMeshDebugger.warn('proxy warning', { warning: true });

      expect(mockConsole.warn).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c proxy warning',
        'color: #F5A623; font-weight: bold;',
        'color: inherit;',
        { warning: true },
      );
    });

    it('should proxy error method', () => {
      walletMeshDebugger.setEnabled(true);
      const error = new Error('proxy error');
      walletMeshDebugger.error('proxy error message', error);

      expect(mockConsole.error).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c proxy error message',
        'color: #D0021B; font-weight: bold;',
        'color: inherit;',
        error,
      );
    });

    it('should proxy setEnabled method', () => {
      walletMeshDebugger.setEnabled(true);
      expect(mockWindow.walletMeshDebugEnabled).toBe(true);

      walletMeshDebugger.setEnabled(false);
      expect(mockWindow.walletMeshDebugEnabled).toBe(false);
    });

    it('should proxy installGlobal method', () => {
      walletMeshDebugger.setEnabled(true);
      walletMeshDebugger.installGlobal();

      expect(mockWindow.walletMeshDebug).toBeDefined();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c Debug utilities installed. Access via window.walletMeshDebug',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        undefined,
      );
    });

    it('should proxy logStateChange method', () => {
      walletMeshDebugger.setEnabled(true);
      const oldState = { view: 'walletSelection' };
      const newState = { view: 'connecting' };

      walletMeshDebugger.logStateChange(oldState, newState);

      expect(mockConsole.group).toHaveBeenCalledWith(
        '%c[WalletMesh Debug] State Change',
        'color: #9B59B6; font-weight: bold;',
      );
    });

    it('should proxy getDebugInfo method', async () => {
      vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));

      const info = await walletMeshDebugger.getDebugInfo();

      expect(info).toHaveProperty('timestamp');
      expect(info).toHaveProperty('environment');
      expect(info).toHaveProperty('wallets');
      expect(info).toHaveProperty('providers');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle undefined userAgent', async () => {
      Object.defineProperty(global, 'navigator', {
        value: { platform: 'Win32', userAgent: undefined },
        writable: true,
      });

      const info = await debuggerInstance.getDebugInfo();
      expect(info.environment.browser).toBe('Unknown');
      expect(info.environment.mobile).toBe(false);
    });

    it('should handle logging with null data', () => {
      debuggerInstance.setEnabled(true);
      debuggerInstance.log('test message', null);

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c test message',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        null,
      );
    });

    it('should handle logging with complex nested objects', () => {
      debuggerInstance.setEnabled(true);
      const complexData = {
        level1: {
          level2: {
            array: [1, 2, 3],
            boolean: true,
            null: null,
            undefined: undefined,
          },
        },
      };

      debuggerInstance.log('complex data', complexData);

      expect(mockConsole.log).toHaveBeenCalledWith(
        '%c[WalletMesh Debug]%c complex data',
        'color: #4A90E2; font-weight: bold;',
        'color: inherit;',
        complexData,
      );
    });

    it('should handle wallet detection with empty results', () => {
      debuggerInstance.setEnabled(true);
      debuggerInstance.logWalletDetection([]);

      expect(mockConsole.group).toHaveBeenCalled();
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should handle connection result with minimal data', () => {
      debuggerInstance.setEnabled(true);
      const minimalResult = {
        walletId: 'test',
        address: '0x123',
        chainType: ChainType.Evm,
        chain: {
          chainId: '1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: true,
          interfaces: ['eip1193'],
        },
      } as ConnectionResult;

      debuggerInstance.logConnectionResult(minimalResult);

      expect(mockConsole.group).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith('Wallet:', 'test');
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });
  });
});
