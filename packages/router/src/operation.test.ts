import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OperationBuilder } from './operation.js';
import type { WalletRouterProvider } from './provider.js';
import { RouterError } from './errors.js';

describe('OperationBuilder', () => {
  const mockCall = vi.fn();
  const mockBulkCall = vi.fn();
  const mockProvider = {
    call: mockCall,
    bulkCall: mockBulkCall,
  } as unknown as WalletRouterProvider;

  beforeEach(() => {
    mockCall.mockClear();
    mockBulkCall.mockClear();
  });

  describe('Single Operation', () => {
    it('executes a single method call directly', async () => {
      const expectedResult = '0x123';
      mockCall.mockResolvedValueOnce(expectedResult);

      const result = await new OperationBuilder('eip155:1', mockProvider)
        .call('eth_getBalance', ['0xabc'])
        .execute();

      expect(result).toBe(expectedResult);
      expect(mockCall).toHaveBeenCalledWith(
        'eip155:1',
        {
          method: 'eth_getBalance',
          params: ['0xabc'],
        },
        undefined
      );
      expect(mockBulkCall).not.toHaveBeenCalled();
    });

    it('supports timeout parameter for single call', async () => {
      mockCall.mockResolvedValueOnce('0x123');

      await new OperationBuilder('eip155:1', mockProvider)
        .call('eth_getBalance', ['0xabc'])
        .execute(5000);

      expect(mockCall).toHaveBeenCalledWith(
        'eip155:1',
        {
          method: 'eth_getBalance',
          params: ['0xabc'],
        },
        5000
      );
    });
  });

  describe('Multiple Operations', () => {
    it('executes multiple method calls in sequence', async () => {
      const expectedResults = ['0x123', '0x456'];
      mockBulkCall.mockResolvedValueOnce(expectedResults);

      const [balance, code] = await new OperationBuilder('eip155:1', mockProvider)
        .call('eth_getBalance', ['0xabc'])
        .call('eth_getCode', ['0xdef'])
        .execute();

      expect(balance).toBe(expectedResults[0]);
      expect(code).toBe(expectedResults[1]);
      expect(mockBulkCall).toHaveBeenCalledWith(
        'eip155:1',
        [
          {
            method: 'eth_getBalance',
            params: ['0xabc'],
          },
          {
            method: 'eth_getCode',
            params: ['0xdef'],
          },
        ],
        undefined
      );
      expect(mockCall).not.toHaveBeenCalled();
    });

    it('supports timeout parameter for bulk calls', async () => {
      mockBulkCall.mockResolvedValueOnce(['0x123', '0x456']);

      await new OperationBuilder('eip155:1', mockProvider)
        .call('eth_getBalance', ['0xabc'])
        .call('eth_getCode', ['0xdef'])
        .execute(5000);

      expect(mockBulkCall).toHaveBeenCalledWith(
        'eip155:1',
        [
          {
            method: 'eth_getBalance',
            params: ['0xabc'],
          },
          {
            method: 'eth_getCode',
            params: ['0xdef'],
          },
        ],
        5000
      );
    });
  });

  describe('Error Handling', () => {
    it('throws error when executing empty operation chain', async () => {
      await expect(
        new OperationBuilder('eip155:1', mockProvider).execute()
      ).rejects.toThrow(new RouterError('invalidRequest', 'No operations to execute'));
    });

    it('propagates provider errors', async () => {
      const error = new RouterError('invalidSession');
      mockCall.mockRejectedValueOnce(error);

      await expect(
        new OperationBuilder('eip155:1', mockProvider)
          .call('eth_getBalance', ['0xabc'])
          .execute()
      ).rejects.toThrow(error);
    });
  });

  describe('Type Safety', () => {
    it('maintains type safety for method parameters', () => {
      // This is a type-level test that will fail to compile if type safety is broken
      const builder = new OperationBuilder('eip155:1', mockProvider);

      // These lines are expected to have type errors
      // @ts-expect-error Method 'invalid_method' is not a valid key of RouterMethodMap
      const invalidMethod = builder.call('invalid_method');

      // @ts-expect-error Parameters must be an array of strings for eth_getBalance
      const invalidParams = builder.call('eth_getBalance', [123]);

      // This should compile with correct types
      const validCall = builder.call('eth_getBalance', ['0xabc']);

      // Verify the builder's type safety
      expect(builder).toBeInstanceOf(OperationBuilder);
      expect(validCall).toBeInstanceOf(OperationBuilder);
    });
  });
});
