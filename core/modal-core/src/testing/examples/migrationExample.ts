/**
 * Example showing how to migrate from inline mocks to centralized utilities
 *
 * This file demonstrates the before/after patterns for common test scenarios,
 * showing how the new testing utilities reduce boilerplate and improve readability.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// BEFORE: Old pattern with inline mocks and boilerplate
// =============================================================================

// ❌ OLD WAY - Lots of boilerplate and duplication
describe('OLD: Connection Test with Inline Mocks', () => {
  let mockClient: unknown;
  let mockLogger: unknown;
  let mockErrorHandler: unknown;
  let mockController: unknown;

  // Use the variables to avoid unused variable errors
  void mockClient;
  void mockLogger;
  void mockErrorHandler;
  void mockController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Manually create logger mock (repeated across many tests)
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setLevel: vi.fn(),
    };

    // Manually create error handler mock
    mockErrorHandler = {
      handleError: vi.fn(),
      clearError: vi.fn(),
    };

    // Complex client mock setup
    mockClient = {
      connect: vi.fn().mockResolvedValue({
        address: '0x1234567890123456789012345678901234567890',
        chainId: '0x1',
        walletId: 'metamask',
        provider: { connected: true },
      }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      isConnected: false,
    };

    // Manual controller mock
    mockController = {
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      connect: (mockClient as { connect: unknown }).connect as typeof vi.fn,
      getState: vi.fn().mockReturnValue({
        connection: { state: 'disconnected' },
        selectedWalletId: null,
      }),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should connect successfully (old way)', async () => {
    const result = await (mockClient as { connect: (walletId: string) => Promise<unknown> }).connect(
      'metamask',
    );

    expect((result as Record<string, unknown>)['address']).toBe('0x1234567890123456789012345678901234567890');
    expect((result as Record<string, unknown>)['walletId']).toBe('metamask');
    expect((mockClient as { connect: unknown }).connect).toHaveBeenCalledWith('metamask');
  });

  it('should handle connection failure (old way)', async () => {
    const error = new Error('Connection failed');
    (mockClient as { connect: unknown }).connect = vi.fn().mockRejectedValue(error);

    await expect(
      (mockClient as { connect: (walletId: string) => Promise<unknown> }).connect('metamask'),
    ).rejects.toThrow('Connection failed');
    expect((mockErrorHandler as { handleError: unknown }).handleError).not.toHaveBeenCalled(); // Would need manual trigger
  });
});

// =============================================================================
// AFTER: New pattern with centralized utilities
// =============================================================================

// ✅ NEW WAY - Clean, readable, and reusable
import {
  FluentTestBuilder,
  connectionScenarios,
  createTestEnvironment,
  testScenarios,
  testSetupPatterns,
} from '../index.js';

describe('NEW: Connection Test with Centralized Utilities', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  it('should connect successfully (new way)', async () => {
    // Using connection scenario builder
    const scenario = connectionScenarios.successfulMetaMask().build();
    const result = await scenario.run();

    expect((result as Record<string, unknown>)['address']).toBe('0x1234567890123456789012345678901234567890');
    expect((result as Record<string, unknown>)['walletId']).toBe('metamask');
    expect(scenario.client.connect).toHaveBeenCalledWith('metamask');
  });

  it('should handle connection failure (new way)', async () => {
    // Using pre-built error scenario
    const scenario = connectionScenarios.failedConnection('metamask', 'Connection failed').build();

    await expect(scenario.run()).rejects.toThrow('Connection failed');
  });

  it('should handle user rejection (fluent API)', async () => {
    // Using fluent test builder for readable test
    const result = await testScenarios.userRejection('metamask').run();

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('User rejected');
  });

  it('should test connection with modal (fluent API)', async () => {
    // Complex scenario made simple
    const result = await FluentTestBuilder.forModal()
      .withWallet('metamask')
      .opensModal()
      .connects()
      .expectSuccess()
      .run();

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// REACT COMPONENT EXAMPLE
// =============================================================================

// ❌ OLD WAY - React component test with manual setup
import { renderHook } from '@testing-library/react';
// Note: vi already imported above, React not needed for this example

// Mock the hook manually
vi.mock('../hooks/useAccount.js', () => ({
  useAccount: vi.fn().mockReturnValue({
    isConnected: false,
    address: null,
    wallet: null,
  }),
}));

describe('OLD: React Hook Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return disconnected state (old way)', () => {
    const { result } = renderHook(() => {
      // Manual hook import and setup
      const { useAccount } = require('../hooks/useAccount.js');
      return useAccount();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
  });
});

// ✅ NEW WAY - React test with scenario builder
// Note: ReactTestScenarios would be imported from modal-react package when available
// import { ReactTestScenarios } from '@walletmesh/modal-react/testing';

describe('NEW: React Hook Test with Scenarios', () => {
  it('should return disconnected state (new way)', () => {
    // ReactTestScenarios would be imported from modal-react package when available
    // const scenario = ReactTestScenarios.accountHook('disconnected').build();
    // const { result } = scenario.renderHook();
    // scenario.expectHookResult({ isConnected: false, address: null, wallet: null });
    void 'ReactTestScenarios not yet implemented';
  });

  it('should return connected state with wallet info', () => {
    // ReactTestScenarios would be imported from modal-react package when available
    // const scenario = ReactTestScenarios.accountHook().connected('metamask', '0x123').build();
    // const { result } = scenario.renderHook();
    // scenario.expectHookResult({ isConnected: true, address: '0x123', walletId: 'metamask' });
    void 'ReactTestScenarios not yet implemented';
  });

  it('should test connection flow', async () => {
    // ReactTestScenarios would be imported from modal-react package when available
    // const scenario = ReactTestScenarios.connectionFlow().build();
    // Executes: open modal, connect wallet, verify connected state
    // All in one fluent call
    void 'ReactTestScenarios not yet implemented';
  });
});

// =============================================================================
// COMPLEX INTEGRATION TEST EXAMPLE
// =============================================================================

// ❌ OLD WAY - Complex setup with many moving parts
describe('OLD: Integration Test', () => {
  let mockClient: unknown;
  let mockController: unknown;
  let mockAdapter: unknown;
  let mockLogger: unknown;

  // Use the variables to avoid unused variable errors
  void mockClient;
  void mockController;
  void mockAdapter;
  void mockLogger;

  beforeEach(() => {
    vi.useFakeTimers();

    // 50+ lines of manual mock setup...
    mockClient = {
      /* complex setup */
    };
    mockController = {
      /* complex setup */
    };
    mockAdapter = {
      /* complex setup */
    };
    mockLogger = {
      /* complex setup */
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should handle full connection flow', async () => {
    // 30+ lines of test logic...
  });
});

// ✅ NEW WAY - Integration test with fluent builder
describe('NEW: Integration Test with Fluent API', () => {
  const testEnv = testSetupPatterns.standard();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  it('should handle full connection flow', async () => {
    const result = await FluentTestBuilder.forIntegration()
      .opensModal()
      .withWallet('metamask')
      .onChain('0x1' /* ChainType.Evm would be imported when available */)
      .connects()
      .expectState({ connection: { state: 'connected' } })
      .expectCalled('connect', 1)
      .closesModal()
      .run();

    expect(result.success).toBe(true);
  });

  it('should handle error scenarios with recovery', async () => {
    const result = await FluentTestBuilder.forConnection('metamask')
      .failsWith('Network error')
      .withRetries(3)
      .expectFailure()
      .expectCalled('connect', 3) // Retried 3 times
      .run();

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Network error');
  });
});

// =============================================================================
// COMPARISON SUMMARY
// =============================================================================

/*
 * IMPROVEMENTS FROM NEW UTILITIES:
 *
 * 1. ✅ LESS CODE:
 *    - Old: 50+ lines of setup per test
 *    - New: 5-10 lines with fluent API
 *
 * 2. ✅ MORE READABLE:
 *    - Old: Complex mock setup obscures test intent
 *    - New: Fluent API reads like natural language
 *
 * 3. ✅ CONSISTENT:
 *    - Old: Each test creates mocks differently
 *    - New: Standardized patterns across all tests
 *
 * 4. ✅ MAINTAINABLE:
 *    - Old: Changes require updating many files
 *    - New: Changes in centralized utilities benefit all tests
 *
 * 5. ✅ DISCOVERABLE:
 *    - Old: Need to know exact mock structure
 *    - New: IDE autocomplete guides you through options
 *
 * 6. ✅ POWERFUL:
 *    - Old: Limited to simple scenarios
 *    - New: Complex integration tests made easy
 */
