import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { ERROR_MESSAGES, createDeveloperMessage, formatErrorWithContext } from './errorMessages.js';

// Install custom matchers
installCustomMatchers();

describe('errorMessages', () => {
  const testEnv = createTestEnvironment();
  let originalEnv: string | undefined;

  beforeEach(async () => {
    await testEnv.setup();
    originalEnv = process.env['NODE_ENV'];
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env['NODE_ENV'] = originalEnv;
    } else {
      process.env['NODE_ENV'] = undefined;
    }
    await testEnv.teardown();
  });

  describe('ERROR_MESSAGES', () => {
    describe('CONNECTION errors', () => {
      it('should generate wallet not found error with install link', () => {
        const error = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('metamask');

        expect(error.message).toBe('Wallet "metamask" not found or not installed');
        expect(error.suggestion).toContain('Please ensure the wallet extension is installed');
        expect(error.link).toBe('https://metamask.io/download/');
      });

      it('should handle unknown wallet without install link', () => {
        const error = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('unknown-wallet');

        expect(error.message).toBe('Wallet "unknown-wallet" not found or not installed');
        expect(error.suggestion).toContain('Please ensure the wallet extension is installed');
        expect(error.link).toBeUndefined();
      });

      it('should generate user rejected error', () => {
        const error = ERROR_MESSAGES.CONNECTION.USER_REJECTED();

        expect(error.message).toBe('User rejected the connection request');
        expect(error.suggestion).toContain('The user cancelled the connection');
      });

      it('should generate timeout error with custom timeout', () => {
        const error = ERROR_MESSAGES.CONNECTION.TIMEOUT(5000);

        expect(error.message).toBe('Connection timed out after 5000ms');
        expect(error.suggestion).toContain('The wallet took too long to respond');
      });

      it('should generate already connected error', () => {
        const error = ERROR_MESSAGES.CONNECTION.ALREADY_CONNECTED('metamask');

        expect(error.message).toBe('Already connected to metamask');
        expect(error.suggestion).toContain('Disconnect the current wallet');
      });

      it('should generate chain not supported error', () => {
        const error = ERROR_MESSAGES.CONNECTION.CHAIN_NOT_SUPPORTED(ChainType.Solana, 'metamask');

        expect(error.message).toBe('Wallet "metamask" does not support solana chains');
        expect(error.suggestion).toContain('Choose a different wallet that supports solana');
      });
    });

    describe('CONFIGURATION errors', () => {
      it('should generate invalid wallet info error with example', () => {
        const error = ERROR_MESSAGES.CONFIGURATION.INVALID_WALLET_INFO('name');

        expect(error.message).toBe('Invalid wallet configuration: missing or invalid "name"');
        expect(error.suggestion).toContain('Ensure the wallet info object has all required fields');
        expect(error.example).toContain("id: 'my-wallet'");
        expect(error.example).toContain("name: 'My Wallet'");
      });

      it('should generate invalid chain type error', () => {
        const error = ERROR_MESSAGES.CONFIGURATION.INVALID_CHAIN_TYPE('bitcoin');

        expect(error.message).toBe('Invalid chain type: "bitcoin"');
        expect(error.suggestion).toBe('Valid chain types are: "evm", "solana", "aztec"');
      });

      it('should handle non-string chain type value', () => {
        const error = ERROR_MESSAGES.CONFIGURATION.INVALID_CHAIN_TYPE(123);

        expect(error.message).toBe('Invalid chain type: "123"');
        expect(error.suggestion).toBe('Valid chain types are: "evm", "solana", "aztec"');
      });

      it('should generate missing adapter error', () => {
        const error = ERROR_MESSAGES.CONFIGURATION.MISSING_ADAPTER('custom-wallet');

        expect(error.message).toBe('No adapter found for wallet "custom-wallet"');
        expect(error.suggestion).toContain('Make sure the wallet adapter is registered');
      });
    });

    describe('PROVIDER errors', () => {
      it('should generate provider not found error', () => {
        const error = ERROR_MESSAGES.PROVIDER.NOT_FOUND(ChainType.Aztec);

        expect(error.message).toBe('No provider found for aztec chain');
        expect(error.suggestion).toContain('Ensure the wallet is connected');
      });

      it('should generate method not supported error', () => {
        const error = ERROR_MESSAGES.PROVIDER.METHOD_NOT_SUPPORTED('personal_sign', 'MetaMask');

        expect(error.message).toBe('Method "personal_sign" is not supported by MetaMask provider');
        expect(error.suggestion).toContain('Check the provider documentation');
      });

      it('should generate invalid params error', () => {
        const error = ERROR_MESSAGES.PROVIDER.INVALID_PARAMS('eth_sendTransaction', 'transaction object');

        expect(error.message).toBe('Invalid parameters for "eth_sendTransaction"');
        expect(error.suggestion).toBe('Expected: transaction object');
      });
    });

    describe('TRANSPORT errors', () => {
      it('should generate connection failed error without reason', () => {
        const error = ERROR_MESSAGES.TRANSPORT.CONNECTION_FAILED('WebSocket');

        expect(error.message).toBe('Failed to connect to WebSocket transport');
        expect(error.suggestion).toContain('Check your network connection');
      });

      it('should generate connection failed error with reason', () => {
        const error = ERROR_MESSAGES.TRANSPORT.CONNECTION_FAILED('WebSocket', 'Network unreachable');

        expect(error.message).toBe('Failed to connect to WebSocket transport: Network unreachable');
        expect(error.suggestion).toContain('Check your network connection');
      });

      it('should generate message failed error', () => {
        const error = ERROR_MESSAGES.TRANSPORT.MESSAGE_FAILED('WebRTC');

        expect(error.message).toBe('Failed to send message through WebRTC transport');
        expect(error.suggestion).toContain('The transport may be disconnected');
      });
    });

    describe('DEVELOPMENT errors', () => {
      it('should generate deprecated method error', () => {
        const error = ERROR_MESSAGES.DEVELOPMENT.DEPRECATED_METHOD('oldMethod', 'newMethod');

        expect(error.message).toBe('Method "oldMethod" is deprecated');
        expect(error.suggestion).toContain('Use "newMethod" instead');
        expect(error.suggestion).toContain('This method will be removed');
      });

      it('should generate invalid hook context error', () => {
        const error = ERROR_MESSAGES.DEVELOPMENT.INVALID_HOOK_CONTEXT('useWallet');

        expect(error.message).toBe('useWallet must be used within a WalletMeshProvider');
        expect(error.suggestion).toContain('<WalletMeshProvider>');
        expect(error.suggestion).toContain('<App />');
      });
    });

    describe('wallet install links', () => {
      it('should provide correct links for known wallets', () => {
        const metamaskError = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('metamask');
        const phantomError = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('phantom');
        const coinbaseError = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('coinbase');
        const rabbyError = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('rabby');

        expect(metamaskError.link).toBe('https://metamask.io/download/');
        expect(phantomError.link).toBe('https://phantom.app/download');
        expect(coinbaseError.link).toBe('https://www.coinbase.com/wallet');
        expect(rabbyError.link).toBe('https://rabby.io');
      });

      it('should handle case-insensitive wallet IDs', () => {
        const error = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('METAMASK');

        expect(error.link).toBe('https://metamask.io/download/');
      });

      it('should return undefined for unknown wallets', () => {
        const error = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND('unknown-wallet');

        expect(error.link).toBeUndefined();
      });
    });
  });

  describe('formatErrorWithContext', () => {
    it('should format Error instance with context', () => {
      const error = new Error('Something went wrong');
      const context = {
        operation: 'connect',
        walletId: 'metamask',
        chainType: ChainType.Evm,
      };

      const formatted = formatErrorWithContext(error, context);

      expect(formatted).toContain('Error: Something went wrong');
      expect(formatted).toContain('Context:');
      expect(formatted).toContain('operation: "connect"');
      expect(formatted).toContain('walletId: "metamask"');
      expect(formatted).toContain('chainType: "evm"');
    });

    it('should format non-Error objects', () => {
      const error = 'String error message';
      const context = { operation: 'test' };

      const formatted = formatErrorWithContext(error, context);

      expect(formatted).toContain('Error: String error message');
      expect(formatted).toContain('Context:');
      expect(formatted).toContain('operation: "test"');
    });

    it('should handle undefined context values', () => {
      const error = new Error('Test error');
      const context: {
        operation?: string;
        walletId?: string;
        chainType?: ChainType;
        [key: string]: unknown;
      } = {
        operation: 'connect',
        walletId: undefined,
        chainType: ChainType.Evm,
      };

      const formatted = formatErrorWithContext(error, context);

      expect(formatted).toContain('operation: "connect"');
      expect(formatted).toContain('chainType: "evm"');
      expect(formatted).not.toContain('walletId');
    });

    it('should include stack trace in development mode', () => {
      process.env['NODE_ENV'] = 'development';
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      const formatted = formatErrorWithContext(error, {});

      expect(formatted).toContain('Stack trace:');
      expect(formatted).toContain('Error: Test error\n    at test.js:1:1');
    });

    it('should not include stack trace in production mode', () => {
      process.env['NODE_ENV'] = 'production';
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      const formatted = formatErrorWithContext(error, {});

      expect(formatted).not.toContain('Stack trace:');
      expect(formatted).not.toContain('at test.js:1:1');
    });

    it('should not include stack trace when stack is undefined', () => {
      process.env['NODE_ENV'] = 'development';
      const error = new Error('Test error');
      (error as { stack?: string }).stack = undefined;

      const formatted = formatErrorWithContext(error, {});

      expect(formatted).not.toContain('Stack trace:');
    });

    it('should handle empty context', () => {
      const error = new Error('Test error');
      const context = {};

      const formatted = formatErrorWithContext(error, context);

      expect(formatted).toContain('Error: Test error');
      expect(formatted).toContain('Context:');
      expect(formatted.split('\n')).toHaveLength(3); // Error, empty line, context header
    });

    it('should handle complex context values', () => {
      const error = new Error('Test error');
      const context = {
        operation: 'complex',
        data: { nested: { value: 42 } },
        array: [1, 2, 3],
        bool: true,
      };

      const formatted = formatErrorWithContext(error, context);

      expect(formatted).toContain('data: {"nested":{"value":42}}');
      expect(formatted).toContain('array: [1,2,3]');
      expect(formatted).toContain('bool: true');
    });
  });

  describe('createDeveloperMessage', () => {
    it('should create message with all template fields', () => {
      const template = {
        message: 'Test error occurred',
        suggestion: 'Try this solution',
        link: 'https://docs.example.com',
        example: 'console.log("example");',
      };

      const result = createDeveloperMessage(template);

      expect(result).toContain('Test error occurred');
      expect(result).toContain('💡 Suggestion: Try this solution');
      expect(result).toContain('🔗 Learn more: https://docs.example.com');
      expect(result).toContain('📝 Example:\nconsole.log("example");');
    });

    it('should create message with only required fields', () => {
      const template = {
        message: 'Simple error message',
      };

      const result = createDeveloperMessage(template);

      expect(result).toBe('Simple error message');
      expect(result).not.toContain('💡 Suggestion:');
      expect(result).not.toContain('🔗 Learn more:');
      expect(result).not.toContain('📝 Example:');
    });

    it('should include context when provided', () => {
      const template = {
        message: 'Error with context',
        suggestion: 'Check the debug info',
      };
      const context = {
        walletId: 'metamask',
        chainId: '0x1',
      };

      const result = createDeveloperMessage(template, context);

      expect(result).toContain('Error with context');
      expect(result).toContain('💡 Suggestion: Check the debug info');
      expect(result).toContain('🔍 Debug info:');
      expect(result).toContain('"walletId": "metamask"');
      expect(result).toContain('"chainId": "0x1"');
    });

    it('should handle empty context', () => {
      const template = {
        message: 'Error message',
      };
      const context = {};

      const result = createDeveloperMessage(template, context);

      expect(result).toBe('Error message');
      expect(result).not.toContain('🔍 Debug info:');
    });

    it('should handle undefined context', () => {
      const template = {
        message: 'Error message',
        suggestion: 'Try this',
      };

      const result = createDeveloperMessage(template, undefined);

      expect(result).toContain('Error message');
      expect(result).toContain('💡 Suggestion: Try this');
      expect(result).not.toContain('🔍 Debug info:');
    });

    it('should format complex context objects', () => {
      const template = {
        message: 'Complex error',
      };
      const context = {
        config: {
          timeout: 5000,
          retries: 3,
        },
        flags: [true, false, true],
      };

      const result = createDeveloperMessage(template, context);

      expect(result).toContain('🔍 Debug info:');
      expect(result).toContain('"timeout": 5000');
      expect(result).toContain('"retries": 3');
      expect(result).toContain('true');
      expect(result).toContain('false');
    });

    it('should handle multiline examples correctly', () => {
      const template = {
        message: 'Configuration error',
        example: `const config = {
  walletId: 'metamask',
  chainType: 'evm'
};`,
      };

      const result = createDeveloperMessage(template);

      expect(result).toContain('📝 Example:');
      expect(result).toContain('const config = {');
      expect(result).toContain("walletId: 'metamask'");
      expect(result).toContain("chainType: 'evm'");
    });

    it('should preserve suggestion formatting', () => {
      const template = {
        message: 'Hook error',
        suggestion: `Wrap your component with the provider:

<WalletMeshProvider>
  <YourComponent />
</WalletMeshProvider>`,
      };

      const result = createDeveloperMessage(template);

      expect(result).toContain('💡 Suggestion: Wrap your component');
      expect(result).toContain('<WalletMeshProvider>');
      expect(result).toContain('<YourComponent />');
    });

    it('should handle all chain types correctly', () => {
      const evmError = ERROR_MESSAGES.CONNECTION.CHAIN_NOT_SUPPORTED(ChainType.Evm, 'phantom');
      const solanaError = ERROR_MESSAGES.CONNECTION.CHAIN_NOT_SUPPORTED(ChainType.Solana, 'metamask');
      const aztecError = ERROR_MESSAGES.CONNECTION.CHAIN_NOT_SUPPORTED(ChainType.Aztec, 'metamask');

      expect(evmError.message).toContain('does not support evm chains');
      expect(solanaError.message).toContain('does not support solana chains');
      expect(aztecError.message).toContain('does not support aztec chains');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined error objects', () => {
      const nullFormatted = formatErrorWithContext(null, {});
      const undefinedFormatted = formatErrorWithContext(undefined, {});

      expect(nullFormatted).toContain('Error: null');
      expect(undefinedFormatted).toContain('Error: undefined');
    });

    it('should handle circular references in context', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;

      const error = new Error('Test error');

      // This will throw because JSON.stringify cannot handle circular references
      expect(() => {
        formatErrorWithContext(error, { circular });
      }).toThrow('Converting circular structure to JSON');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new Error(longMessage);

      const formatted = formatErrorWithContext(error, { operation: 'test' });

      expect(formatted).toContain(longMessage);
      expect(formatted).toContain('operation: "test"');
    });

    it('should handle special characters in wallet IDs', () => {
      const specialWalletId = 'wallet-with-special@chars.test';
      const error = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND(specialWalletId);

      expect(error.message).toContain(`"${specialWalletId}"`);
      expect(error.link).toBeUndefined(); // Should not find a match
    });

    it('should handle numeric context values', () => {
      const error = new Error('Test error');
      const context = {
        timeout: 5000,
        retries: 3,
        percentage: 85.5,
        zero: 0,
        negative: -1,
      };

      const formatted = formatErrorWithContext(error, context);

      expect(formatted).toContain('timeout: 5000');
      expect(formatted).toContain('retries: 3');
      expect(formatted).toContain('percentage: 85.5');
      expect(formatted).toContain('zero: 0');
      expect(formatted).toContain('negative: -1');
    });

    it('should preserve original error properties', () => {
      const originalError = new Error('Original message');
      originalError.name = 'CustomError';

      const formatted = formatErrorWithContext(originalError, {});

      expect(formatted).toContain('Error: Original message');
      // The error name should be preserved in the error object
      expect(originalError.name).toBe('CustomError');
    });
  });
});
