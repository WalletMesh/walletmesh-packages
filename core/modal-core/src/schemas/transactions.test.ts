/**
 * @fileoverview Tests for transaction parameter schemas
 */

import { describe, it, expect } from 'vitest';
import {
  evmAddressSchema,
  solanaAddressSchema,
  aztecAddressSchema,
  transactionStatusSchema,
  baseTransactionParamsSchema,
  evmTransactionParamsSchema,
  evmTransactionResultSchema,
  solanaTransactionParamsSchema,
  solanaTransactionResultSchema,
  aztecTransactionParamsSchema,
  aztecTransactionResultSchema,
  transactionRequestSchema,
  transactionResultSchema,
  transactionInfoSchema,
  transactionQueryOptionsSchema,
} from './transactions.js';

describe('Transaction Schemas', () => {
  describe('Address Validation Schemas', () => {
    describe('evmAddressSchema', () => {
      it('should validate valid EVM addresses', () => {
        const validAddresses = [
          '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          '0x0000000000000000000000000000000000000000',
          '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        ];
        for (const address of validAddresses) {
          expect(() => evmAddressSchema.parse(address)).not.toThrow();
        }
      });

      it('should reject invalid EVM addresses', () => {
        const invalidAddresses = [
          '742d35Cc6634C0532925a3b844Bc9e7595f7F1eD', // Missing 0x
          '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD123', // Too long
          '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1e', // Too short
          '0xZZZZ35Cc6634C0532925a3b844Bc9e7595f7F1eD', // Invalid hex
          'invalid-address',
        ];
        for (const address of invalidAddresses) {
          expect(() => evmAddressSchema.parse(address)).toThrow('Invalid EVM address format');
        }
      });
    });

    describe('solanaAddressSchema', () => {
      it('should validate valid Solana addresses', () => {
        const validAddresses = [
          'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
          '11111111111111111111111111111111',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ];
        for (const address of validAddresses) {
          expect(() => solanaAddressSchema.parse(address)).not.toThrow();
        }
      });

      it('should reject invalid Solana addresses', () => {
        const invalidAddresses = [
          'invalid!address',
          '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD', // EVM address
          'short',
          'wayTooLongAddressThatExceedsTheMaximumLengthForSolanaAddresses',
        ];
        for (const address of invalidAddresses) {
          expect(() => solanaAddressSchema.parse(address)).toThrow('Invalid Solana address format');
        }
      });
    });

    describe('aztecAddressSchema', () => {
      it('should validate non-empty Aztec addresses', () => {
        const validAddresses = ['aztec-address-123', '0x123', 'any-non-empty-string'];
        for (const address of validAddresses) {
          expect(() => aztecAddressSchema.parse(address)).not.toThrow();
        }
      });

      it('should reject empty Aztec addresses', () => {
        expect(() => aztecAddressSchema.parse('')).toThrow('Aztec address cannot be empty');
      });
    });
  });

  describe('Transaction Status Schema', () => {
    it('should validate all transaction statuses', () => {
      const statuses = ['idle', 'preparing', 'signing', 'broadcasting', 'confirming', 'confirmed', 'failed'];
      for (const status of statuses) {
        expect(() => transactionStatusSchema.parse(status)).not.toThrow();
      }
    });

    it('should reject invalid status', () => {
      expect(() => transactionStatusSchema.parse('invalid')).toThrow();
    });
  });

  describe('EVM Transaction Schemas', () => {
    describe('evmTransactionParamsSchema', () => {
      it('should validate minimal EVM transaction', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate simple ETH transfer', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          value: '1000000000000000000', // 1 ETH in wei
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate contract interaction', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          data: '0xa9059cbb000000000000000000000000',
          gas: '65000',
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate EIP-1559 transaction', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          value: '1000000000000000000',
          maxFeePerGas: '30000000000',
          maxPriorityFeePerGas: '2000000000',
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate complete transaction with metadata', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          from: '0x1234567890123456789012345678901234567890',
          value: '1000000000000000000',
          data: '0xa9059cbb',
          gas: '21000',
          nonce: 5,
          chainId: 'eip155:1',
          autoSwitchChain: true,
          metadata: {
            description: 'Transfer 1 ETH',
            action: 'transfer',
            data: { recipient: 'Alice' },
          },
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should reject invalid address', () => {
        const tx = { to: 'invalid-address' };
        expect(() => evmTransactionParamsSchema.parse(tx)).toThrow('Invalid EVM address format');
      });

      it('should reject non-numeric value', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          value: 'abc',
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).toThrow('Value must be numeric string');
      });

      it('should reject invalid hex data', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          data: '0xZZZ',
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).toThrow('Invalid hex data');
      });

      it('should reject negative nonce', () => {
        const tx = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          nonce: -1,
        };
        expect(() => evmTransactionParamsSchema.parse(tx)).toThrow();
      });
    });

    describe('evmTransactionResultSchema', () => {
      it('should validate transaction result', () => {
        const result = {
          hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          to: '0x1234567890123456789012345678901234567890',
          value: '1000000000000000000',
          gasUsed: '21000',
          effectiveGasPrice: '20000000000',
          blockNumber: 12345678,
          blockHash: '0xabcdef1234567890123456789012345678901234567890123456789012345678',
          status: 1,
        };
        expect(() => evmTransactionResultSchema.parse(result)).not.toThrow();
      });

      it('should allow null to address (contract creation)', () => {
        const result = {
          hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          to: null,
          value: '0',
        };
        expect(() => evmTransactionResultSchema.parse(result)).not.toThrow();
      });

      it('should reject invalid hash format', () => {
        const result = {
          hash: '0x123', // Too short
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          to: null,
          value: '0',
        };
        expect(() => evmTransactionResultSchema.parse(result)).toThrow('Invalid transaction hash');
      });
    });
  });

  describe('Solana Transaction Schemas', () => {
    describe('solanaTransactionParamsSchema', () => {
      it('should validate base64 transaction', () => {
        const tx = {
          transaction: Buffer.from('test transaction data').toString('base64'),
        };
        expect(() => solanaTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate with options', () => {
        const tx = {
          transaction: Buffer.from('test').toString('base64'),
          options: {
            skipPreflight: false,
            preflightCommitment: 'confirmed' as const,
            maxRetries: 3,
          },
        };
        expect(() => solanaTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate with metadata', () => {
        const tx = {
          transaction: Buffer.from('test').toString('base64'),
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          metadata: {
            description: 'Transfer SOL',
            action: 'transfer',
          },
        };
        expect(() => solanaTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should reject invalid base64', () => {
        const tx = { transaction: '!!!invalid-base64!!!' };
        expect(() => solanaTransactionParamsSchema.parse(tx)).toThrow('Invalid base64 transaction');
      });

      it('should reject invalid commitment level', () => {
        const tx = {
          transaction: Buffer.from('test').toString('base64'),
          options: {
            preflightCommitment: 'invalid',
          },
        };
        expect(() => solanaTransactionParamsSchema.parse(tx)).toThrow();
      });

      it('should reject retries out of range', () => {
        const tx = {
          transaction: Buffer.from('test').toString('base64'),
          options: {
            maxRetries: 11,
          },
        };
        expect(() => solanaTransactionParamsSchema.parse(tx)).toThrow();
      });
    });

    describe('solanaTransactionResultSchema', () => {
      it('should validate transaction result', () => {
        const result = {
          signature: '5VERyL7jHgB8K8rCHa6cWq1234567890abcdefghijklmnopqrstuvwxyz',
          slot: 123456789,
          blockTime: 1234567890,
          confirmationStatus: 'confirmed' as const,
          err: null,
        };
        expect(() => solanaTransactionResultSchema.parse(result)).not.toThrow();
      });

      it('should validate minimal result', () => {
        const result = {
          signature: 'sig123',
        };
        expect(() => solanaTransactionResultSchema.parse(result)).not.toThrow();
      });

      it('should validate with error', () => {
        const result = {
          signature: 'sig123',
          err: { InsufficientFunds: {} },
        };
        expect(() => solanaTransactionResultSchema.parse(result)).not.toThrow();
      });
    });
  });

  describe('Aztec Transaction Schemas', () => {
    describe('aztecTransactionParamsSchema', () => {
      it('should validate minimal Aztec transaction', () => {
        const tx = {
          contractAddress: 'aztec-contract-123',
          functionName: 'transfer',
        };
        expect(() => aztecTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate with args', () => {
        const tx = {
          contractAddress: 'aztec-contract-123',
          functionName: 'transfer',
          args: ['recipient', 1000, true],
        };
        expect(() => aztecTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate with fee config', () => {
        const tx = {
          contractAddress: 'aztec-contract-123',
          functionName: 'transfer',
          fee: {
            gasSettings: {
              gasLimits: {
                teardownGasLimits: 10000,
                daGas: 20000,
                l2Gas: 30000,
              },
              maxFeesPerGas: {
                feePerDaGas: 100,
                feePerL2Gas: 200,
              },
            },
            paymentMethod: 'FPC',
          },
        };
        expect(() => aztecTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should validate view function', () => {
        const tx = {
          contractAddress: 'aztec-contract-123',
          functionName: 'getBalance',
          isView: true,
        };
        expect(() => aztecTransactionParamsSchema.parse(tx)).not.toThrow();
      });

      it('should reject empty function name', () => {
        const tx = {
          contractAddress: 'aztec-contract-123',
          functionName: '',
        };
        expect(() => aztecTransactionParamsSchema.parse(tx)).toThrow('Function name is required');
      });
    });

    describe('aztecTransactionResultSchema', () => {
      it('should validate transaction result', () => {
        const result = {
          txHash: 'aztec-tx-hash-123',
          blockNumber: 12345,
          blockHash: 'aztec-block-hash-456',
          status: 'mined' as const,
        };
        expect(() => aztecTransactionResultSchema.parse(result)).not.toThrow();
      });

      it('should validate failed result', () => {
        const result = {
          txHash: 'aztec-tx-hash-123',
          status: 'failed' as const,
          error: 'Insufficient funds',
        };
        expect(() => aztecTransactionResultSchema.parse(result)).not.toThrow();
      });
    });
  });

  describe('Generic Transaction Schemas', () => {
    describe('transactionRequestSchema', () => {
      it('should validate EVM request', () => {
        const request = {
          type: 'evm' as const,
          params: {
            to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
            value: '1000000000000000000',
          },
        };
        expect(() => transactionRequestSchema.parse(request)).not.toThrow();
      });

      it('should validate Solana request', () => {
        const request = {
          type: 'solana' as const,
          params: {
            transaction: Buffer.from('test').toString('base64'),
          },
        };
        expect(() => transactionRequestSchema.parse(request)).not.toThrow();
      });

      it('should validate Aztec request', () => {
        const request = {
          type: 'aztec' as const,
          params: {
            contractAddress: 'aztec-contract',
            functionName: 'transfer',
          },
        };
        expect(() => transactionRequestSchema.parse(request)).not.toThrow();
      });

      it('should reject invalid type', () => {
        const request = {
          type: 'invalid',
          params: {},
        };
        expect(() => transactionRequestSchema.parse(request)).toThrow();
      });
    });

    describe('transactionInfoSchema', () => {
      it('should validate complete transaction info', () => {
        const info = {
          id: 'tx-123',
          chainId: 'eip155:1',
          status: 'confirmed' as const,
          walletId: 'metamask',
          request: {
            type: 'evm' as const,
            params: {
              to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
              value: '1000000000000000000',
            },
          },
          result: {
            type: 'evm' as const,
            result: {
              hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
              from: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
              to: '0x1234567890123456789012345678901234567890',
              value: '1000000000000000000',
            },
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        expect(() => transactionInfoSchema.parse(info)).not.toThrow();
      });

      it('should validate failed transaction', () => {
        const info = {
          id: 'tx-123',
          chainId: 'eip155:1',
          status: 'failed' as const,
          walletId: 'metamask',
          request: {
            type: 'evm' as const,
            params: {
              to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
            },
          },
          error: {
            code: 4001,
            message: 'User rejected transaction',
            data: { originalError: {} },
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        expect(() => transactionInfoSchema.parse(info)).not.toThrow();
      });
    });

    describe('transactionQueryOptionsSchema', () => {
      it('should validate query options', () => {
        const options = {
          status: ['confirming', 'confirmed'],
          chainId: 'eip155:1',
          walletId: 'metamask',
          limit: 50,
          offset: 0,
          sortOrder: 'desc' as const,
          since: Date.now() - 86400000,
          until: Date.now(),
        };
        expect(() => transactionQueryOptionsSchema.parse(options)).not.toThrow();
      });

      it('should reject invalid limit', () => {
        expect(() => transactionQueryOptionsSchema.parse({ limit: 0 })).toThrow();
        expect(() => transactionQueryOptionsSchema.parse({ limit: 1001 })).toThrow();
      });

      it('should reject negative offset', () => {
        expect(() => transactionQueryOptionsSchema.parse({ offset: -1 })).toThrow();
      });
    });
  });
});
