import type {
  ChainId,
  MethodCall,
  MethodParams,
  MethodResult,
  MethodResults,
  RouterMethodMap,
} from './types.js';
import type { WalletRouterProvider } from './provider.js';
import { RouterError } from './errors.js';

/**
 * @internal
 * Helper type for tuple concatenation with proper readonly constraints
 * @typeParam T - First tuple type
 * @typeParam U - Second tuple type
 */
type Concat<T extends readonly unknown[], U extends readonly unknown[]> = readonly [...T, ...U];

/**
 * @internal
 * Helper type for operation execution result
 * Returns a single result for one call, or a tuple of results for multiple calls
 * @typeParam T - Tuple of MethodCall types
 */
type ExecuteResult<T extends readonly MethodCall[]> = T extends readonly []
  ? never
  : T extends readonly [MethodCall<infer M>]
    ? MethodResult<M>
    : MethodResults<T>;

/**
 * A builder class that enables chaining multiple RPC method calls into a single operation.
 * This provides a fluent interface for constructing sequences of wallet method calls
 * that can be executed together.
 *
 * @example
 * ```typescript
 * // Create a new operation builder
 * const operation = provider.chain('eip155:1')
 *   .call('eth_getBalance', ['0x123...'])
 *   .call('eth_getCode', ['0x456...']);
 *
 * // Execute all calls in sequence
 * const [balance, code] = await operation.execute();
 * ```
 *
 * @typeParam T - Tuple type tracking the sequence of method calls
 */
export class OperationBuilder<T extends readonly MethodCall[] = readonly []> {
  constructor(
    private readonly chainId: ChainId,
    private readonly provider: WalletRouterProvider,
    private readonly calls: T = [] as unknown as T,
  ) {}

  /**
   * Adds a new method call to the operation chain.
   * Returns a new builder instance with the updated call sequence.
   *
   * @example
   * ```typescript
   * const operation = provider.chain('eip155:1')
   *   .call('eth_getBalance', ['0x123...'])
   *   .call('eth_getCode', ['0x456...']);
   * ```
   *
   * @param method - The RPC method name to call
   * @param params - Optional parameters for the method
   * @returns A new OperationBuilder instance with the added method call
   * @typeParam M - The specific method key from RouterMethodMap
   */
  public call<M extends keyof RouterMethodMap>(
    method: M,
    params?: MethodParams<M>,
  ): OperationBuilder<Concat<T, readonly [MethodCall<M>]>> {
    const newCall: MethodCall<M> = { method, params };
    return new OperationBuilder(this.chainId, this.provider, [...this.calls, newCall] as Concat<
      T,
      readonly [MethodCall<M>]
    >);
  }

  /**
   * Executes all method calls in the operation chain in sequence.
   * For a single call, returns the direct result.
   * For multiple calls, returns an array of results in the same order as the calls.
   *
   * @example
   * ```typescript
   * // Single call
   * const balance = await provider
   *   .chain('eip155:1')
   *   .call('eth_getBalance', ['0x123...'])
   *   .execute();
   *
   * // Multiple calls
   * const [balance, code] = await provider
   *   .chain('eip155:1')
   *   .call('eth_getBalance', ['0x123...'])
   *   .call('eth_getCode', ['0x456...'])
   *   .execute();
   * ```
   *
   * @returns For one call: the direct result. For multiple calls: array of results.
   * @throws {RouterError} If no operations are queued or if result validation fails
   */
  public async execute(timeout?: number): Promise<ExecuteResult<T>> {
    if (this.calls.length === 0) {
      throw new RouterError('invalidRequest', 'No operations to execute');
    }

    if (this.calls.length === 1) {
      const [call] = this.calls;
      // biome-ignore lint/style/noNonNullAssertion: checked by length check
      const result = await this.provider.call(this.chainId, call!, timeout);

      return result as ExecuteResult<T>;
    }

    const results = await this.provider.bulkCall(this.chainId, [...this.calls] as MethodCall[], timeout);
    return results as ExecuteResult<T>;
  }
}
