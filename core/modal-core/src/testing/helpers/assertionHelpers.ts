import { expect } from 'vitest';
import type { SessionState } from '../../api/types/sessionState.js';
import type { ModalError } from '../../types.js';

/**
 * Assert that an error is a ModalError with expected properties
 */
export function expectModalError(
  error: unknown,
  expectations: {
    code?: string;
    message?: string | RegExp;
    category?: string;
    recoveryStrategy?: 'retry' | 'wait_and_retry' | 'manual_action' | 'none';
    component?: string;
  },
) {
  expect(error).toBeDefined();
  expect(error).toHaveProperty('code');
  expect(error).toHaveProperty('message');
  expect(error).toHaveProperty('category');
  // recoveryStrategy is optional

  const modalError = error as ModalError;

  if (expectations.code) {
    expect(modalError.code).toBe(expectations.code);
  }

  if (expectations.message) {
    if (typeof expectations.message === 'string') {
      expect(modalError.message).toBe(expectations.message);
    } else {
      expect(modalError.message).toMatch(expectations.message);
    }
  }

  if (expectations.category) {
    expect(modalError.category).toBe(expectations.category);
  }

  if (expectations.recoveryStrategy !== undefined) {
    expect(modalError.recoveryStrategy).toBe(expectations.recoveryStrategy);
  }

  if (expectations.component) {
    expect(modalError.data?.['component']).toBe(expectations.component);
  }
}

/**
 * Assert that a promise rejects with a ModalError
 */
export async function expectModalErrorRejection(
  // biome-ignore lint/suspicious/noExplicitAny: Promise result type needs flexibility for error testing
  promise: Promise<any>,
  expectations: Parameters<typeof expectModalError>[1],
) {
  await expect(promise).rejects.toThrow();

  try {
    await promise;
  } catch (error) {
    expectModalError(error, expectations);
  }
}

/**
 * Assert wallet connection state
 */
export function expectConnectionState(
  // biome-ignore lint/suspicious/noExplicitAny: State parameter needs flexible structure for testing
  state: any,
  expectations: {
    isConnected?: boolean;
    address?: string;
    chainId?: string;
    walletId?: string;
  },
) {
  if (expectations.isConnected !== undefined) {
    expect(state.connections.activeSessionId).toBe(expectations.isConnected ? expect.any(String) : null);
  }

  if (expectations.address && state.connections.activeSessionId) {
    const session = state.connections.activeSessions.find(
      (s: SessionState) => s.sessionId === state.connections.activeSessionId,
    );
    expect(session?.primaryAddress).toBe(expectations.address);
  }

  if (expectations.chainId && state.connections.activeSessionId) {
    const session = state.connections.activeSessions.find(
      (s: SessionState) => s.sessionId === state.connections.activeSessionId,
    );
    expect(session?.chain.chainId).toBe(expectations.chainId);
  }

  if (expectations.walletId && state.connections.activeSessionId) {
    const session = state.connections.activeSessions.find(
      (s: SessionState) => s.sessionId === state.connections.activeSessionId,
    );
    expect(session?.walletId).toBe(expectations.walletId);
  }
}

/**
 * Assert transaction result
 */
export function expectTransactionResult(
  // biome-ignore lint/suspicious/noExplicitAny: Transaction result needs flexible structure for testing
  result: any,
  expectations: {
    hash?: string | RegExp;
    chainId?: string;
    status?: string;
  },
) {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('hash');

  if (expectations.hash) {
    if (typeof expectations.hash === 'string') {
      expect(result.hash).toBe(expectations.hash);
    } else {
      expect(result.hash).toMatch(expectations.hash);
    }
  }

  if (expectations.chainId) {
    expect(result.chainId).toBe(expectations.chainId);
  }

  if (expectations.status) {
    expect(result.status).toBe(expectations.status);
  }
}

/**
 * Assert event was emitted with expected data
 */
export function expectEventEmitted(
  // biome-ignore lint/suspicious/noExplicitAny: Spy object needs flexible structure for test assertions
  emitSpy: any,
  eventName: string,
  // biome-ignore lint/suspicious/noExplicitAny: Event data needs flexible structure for testing
  expectedData?: any,
) {
  // biome-ignore lint/suspicious/noExplicitAny: Mock call args need flexible structure for filtering
  const calls = emitSpy.mock.calls.filter((call: any[]) => call[0] === eventName);

  expect(calls.length).toBeGreaterThan(0);

  if (expectedData !== undefined) {
    const eventData = calls[calls.length - 1][1];
    if (typeof expectedData === 'object') {
      expect(eventData).toMatchObject(expectedData);
    } else {
      expect(eventData).toBe(expectedData);
    }
  }
}

/**
 * Assert state transition occurred
 */
export function expectStateTransition(
  // biome-ignore lint/suspicious/noExplicitAny: State spy needs flexible structure for test assertions
  stateSpy: any,
  // biome-ignore lint/suspicious/noExplicitAny: State values need flexible structure for comparison
  fromState: any,
  // biome-ignore lint/suspicious/noExplicitAny: State values need flexible structure for comparison
  toState: any,
) {
  const calls = stateSpy.mock.calls;
  let foundTransition = false;

  for (let i = 0; i < calls.length - 1; i++) {
    const currentState = calls[i][0];
    const nextState = calls[i + 1][0];

    if (
      JSON.stringify(currentState) === JSON.stringify(fromState) &&
      JSON.stringify(nextState) === JSON.stringify(toState)
    ) {
      foundTransition = true;
      break;
    }
  }

  expect(foundTransition).toBe(true);
}

/**
 * Assert balance format
 */
export function expectBalanceFormat(
  // biome-ignore lint/suspicious/noExplicitAny: Balance object needs flexible structure for testing
  balance: any,
  expectations: {
    value?: string;
    formatted?: string;
    symbol?: string;
    decimals?: number;
  },
) {
  expect(balance).toBeDefined();

  if (expectations.value) {
    expect(balance.value).toBe(expectations.value);
  }

  if (expectations.formatted) {
    expect(balance.formatted).toBe(expectations.formatted);
  }

  if (expectations.symbol) {
    expect(balance.symbol).toBe(expectations.symbol);
  }

  if (expectations.decimals !== undefined) {
    expect(balance.decimals).toBe(expectations.decimals);
  }
}

/**
 * Assert chain info format
 */
export function expectChainInfo(
  // biome-ignore lint/suspicious/noExplicitAny: Chain info needs flexible structure for testing
  chain: any,
  expectations: {
    chainId?: string;
    name?: string;
    type?: string;
    nativeCurrency?: {
      name?: string;
      symbol?: string;
      decimals?: number;
    };
  },
) {
  expect(chain).toBeDefined();

  if (expectations.chainId) {
    expect(chain.chainId).toBe(expectations.chainId);
  }

  if (expectations.name) {
    expect(chain.name).toBe(expectations.name);
  }

  if (expectations.type) {
    expect(chain.type).toBe(expectations.type);
  }

  if (expectations.nativeCurrency) {
    expect(chain.nativeCurrency).toMatchObject(expectations.nativeCurrency);
  }
}

/**
 * Create a custom matcher for async operations
 */
export function createAsyncMatcher<T>(checkFn: (value: T) => boolean, timeout = 1000) {
  return async (getValue: () => T | Promise<T>) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const value = await getValue();
      if (checkFn(value)) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return false;
  };
}
