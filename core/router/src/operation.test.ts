import type { JSONRPCMethodDef, JSONRPCParams } from '@walletmesh/jsonrpc';
import { describe, expect, it } from 'vitest';
import { OperationBuilder } from './operation.js';
import { WalletRouterProvider } from './provider.js';
import type { MethodCall, RouterMethodMap } from './types.js';

// Mock transaction types to match real types
interface TransactionParams {
  transactions: unknown[];
  witnesses?: unknown[];
}

interface TransactionFunctionCall {
  to: string;
  functionName: string;
  args: unknown[];
}

/**
 * Test method map that extends RouterMethodMap
 */
class TestProvider extends WalletRouterProvider {
  constructor() {
    super({ send: async () => {}, onMessage: () => {} });
    // Set up a mock session ID for testing
    Object.defineProperty(this, '_sessionId', {
      value: 'test-session',
      writable: true,
    });
  }

  override async call<M extends keyof TestExtendedMethodMap>(
    _chainId: string,
    call: { method: M; params?: TestExtendedMethodMap[M]['params'] },
  ): Promise<TestExtendedMethodMap[M]['result']> {
    // Mock responses based on method
    switch (call.method) {
      case 'test_connect':
        return true as TestExtendedMethodMap[M]['result'];
      case 'test_getAccount':
        return '0x123' as TestExtendedMethodMap[M]['result'];
      case 'test_getSenders':
        return ['0x123', '0x456'] as TestExtendedMethodMap[M]['result'];
      case 'test_sendTransaction':
        return '0xtxhash' as TestExtendedMethodMap[M]['result'];
      case 'test_simulateTransaction':
        return {} as TestExtendedMethodMap[M]['result'];
      default:
        return {} as TestExtendedMethodMap[M]['result'];
    }
  }

  override async callMethod<M extends keyof TestExtendedMethodMap>(
    method: M,
    params?: TestExtendedMethodMap[M]['params'],
  ): Promise<TestExtendedMethodMap[M]['result']> {
    // Handle bulk calls
    if (method === 'wm_bulkCall') {
      const { calls, chainId } = params as {
        calls: Array<MethodCall<keyof TestExtendedMethodMap>>;
        chainId: string;
        sessionId: string;
      };
      const results = await Promise.all(calls.map((call) => this.call(chainId, call)));
      return results as TestExtendedMethodMap[M]['result'];
    }

    // Handle single calls
    if (method === 'wm_call') {
      const {
        chainId,
        call,
        sessionId: _,
      } = params as {
        chainId: string;
        call: MethodCall<keyof TestExtendedMethodMap>;
        sessionId: string;
      };
      return this.call(chainId, call);
    }

    // Default fallback
    return {} as TestExtendedMethodMap[M]['result'];
  }
}

interface TestExtendedMethodMap extends RouterMethodMap {
  [key: string]: JSONRPCMethodDef<JSONRPCParams, unknown>;

  test_connect: JSONRPCMethodDef<never, boolean>;
  test_getAccount: JSONRPCMethodDef<never, string>;
  test_getSenders: JSONRPCMethodDef<never, string[]>;
  test_sendTransaction: JSONRPCMethodDef<[TransactionParams], string>;
  test_simulateTransaction: JSONRPCMethodDef<[TransactionFunctionCall], unknown>;
}

// Type tests - these will fail at compile time if types are incorrect
describe('Operation Builder Type Tests', () => {
  it('should properly infer types from extended method map', async () => {
    const mockProvider = new TestProvider();

    // Create the operation builder with our mock provider
    const builder = new OperationBuilder('test:testnet', mockProvider);

    // Type test: Operation builder with extended methods
    const operation = builder.call('test_connect').call('test_getAccount').call('test_getSenders');

    // TypeScript should infer this as Promise<[boolean, string, string[]]>
    const results = await operation.execute();
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(3);
    expect(typeof results[0]).toBe('boolean');
    expect(typeof results[1]).toBe('string');
    expect(Array.isArray(results[2])).toBe(true);

    // Type test: Single call return type
    const singleOp = new OperationBuilder('test:testnet', mockProvider).call('test_connect');

    // TypeScript should infer this as Promise<boolean>
    const singleResult = await singleOp.execute();
    expect(typeof singleResult).toBe('boolean');

    // Type test: Complex params
    const txOperation = new OperationBuilder('test:testnet', mockProvider)
      .call('test_sendTransaction', [
        {
          transactions: [],
          witnesses: [],
        } as TransactionParams,
      ])
      .call('test_simulateTransaction', [
        {
          to: '0x123',
          functionName: 'test',
          args: [],
        } as TransactionFunctionCall,
      ]);

    // TypeScript should infer this as Promise<[string, unknown]>
    const txResults = await txOperation.execute();
    expect(Array.isArray(txResults)).toBe(true);
    expect(txResults).toHaveLength(2);
    expect(typeof txResults[0]).toBe('string');
  });

  it('should allow direct method calls with proper type inference', async () => {
    const mockProvider = new TestProvider();

    // Type test: Direct call with no params
    const connectResult: boolean = await mockProvider.call('test:testnet', {
      method: 'test_connect',
    });
    expectType<boolean>(connectResult);
    expect(typeof connectResult).toBe('boolean');

    // Type test: Direct call with array result
    const sendersResult: string[] = await mockProvider.call('test:testnet', {
      method: 'test_getSenders',
    });
    expectType<string[]>(sendersResult);
    expect(Array.isArray(sendersResult)).toBe(true);

    // Type test: Direct call with complex params
    const txResult: string = await mockProvider.call('test:testnet', {
      method: 'test_sendTransaction',
      params: [
        {
          transactions: [],
          witnesses: [],
        } as TransactionParams,
      ],
    });
    expectType<string>(txResult);
    expect(typeof txResult).toBe('string');
  });
});

// Helper function for type checking
// This will fail at compile time if the type is incorrect
function expectType<T>(_value: T): void {}
