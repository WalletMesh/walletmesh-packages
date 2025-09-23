import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ChainType } from '../../core/types.js';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import {
  hasErrorCode,
  hasErrorMessage,
  isArray,
  isBoolean,
  isChainType,
  isConnectionResult,
  isConnectionState,
  isModalError,
  isModalViewType,
  isNumber,
  isObject,
  isString,
  isTransportType,
  isWalletInfo,
} from './guards.js';

// Install custom matchers
installCustomMatchers();

describe('Type Guards', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('isWalletInfo', () => {
    it('should return true for valid WalletInfo', () => {
      const validWalletInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(validWalletInfo)).toBe(true);
    });

    it('should return true for WalletInfo with multiple chains', () => {
      const validWalletInfo = {
        id: 'multi-wallet',
        name: 'Multi Wallet',
        icon: 'data:image/png;base64,xyz789',
        chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
      };

      expect(isWalletInfo(validWalletInfo)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isWalletInfo(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isWalletInfo(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isWalletInfo('string')).toBe(false);
      expect(isWalletInfo(123)).toBe(false);
      expect(isWalletInfo(true)).toBe(false);
      expect(isWalletInfo([])).toBe(false);
    });

    it('should return false for object missing id', () => {
      const invalid = {
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object with non-string id', () => {
      const invalid = {
        id: 123,
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object missing name', () => {
      const invalid = {
        id: 'metamask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object with non-string name', () => {
      const invalid = {
        id: 'metamask',
        name: true,
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object missing icon', () => {
      const invalid = {
        id: 'metamask',
        name: 'MetaMask',
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object with non-string icon', () => {
      const invalid = {
        id: 'metamask',
        name: 'MetaMask',
        icon: null,
        chains: [ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object missing chains', () => {
      const invalid = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object with non-array chains', () => {
      const invalid = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: 'evm',
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for object with invalid chain types', () => {
      const invalid = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: ['invalid-chain', ChainType.Evm],
      };

      expect(isWalletInfo(invalid)).toBe(false);
    });

    it('should return false for empty chains array', () => {
      const invalid = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [],
      };

      expect(isWalletInfo(invalid)).toBe(true); // Empty chains array is valid
    });
  });

  describe('isChainType', () => {
    it('should return true for valid ChainType.Evm', () => {
      expect(isChainType(ChainType.Evm)).toBe(true);
    });

    it('should return true for valid ChainType.Solana', () => {
      expect(isChainType(ChainType.Solana)).toBe(true);
    });

    it('should return true for valid ChainType.Aztec', () => {
      expect(isChainType(ChainType.Aztec)).toBe(true);
    });

    it('should return false for invalid chain types', () => {
      expect(isChainType('bitcoin')).toBe(false);
      expect(isChainType('invalid')).toBe(false);
      expect(isChainType('')).toBe(false);
      expect(isChainType(null)).toBe(false);
      expect(isChainType(undefined)).toBe(false);
      expect(isChainType(123)).toBe(false);
      expect(isChainType(true)).toBe(false);
      expect(isChainType({})).toBe(false);
      expect(isChainType([])).toBe(false);
    });
  });

  describe('isConnectionResult', () => {
    const validConnectionResult = {
      address: '0x1234567890123456789012345678901234567890',
      accounts: ['0x1234567890123456789012345678901234567890'],
      chainId: '0x1',
      chainType: ChainType.Evm,
      walletId: 'metamask',
      walletInfo: {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,abc123',
        chains: [ChainType.Evm],
      },
    };

    it('should return true for valid ConnectionResult', () => {
      expect(isConnectionResult(validConnectionResult)).toBe(true);
    });

    it('should return true for ConnectionResult with numeric chainId', () => {
      const withNumericChainId = {
        ...validConnectionResult,
        chainId: 1,
      };

      expect(isConnectionResult(withNumericChainId)).toBe(true);
    });

    it('should return true for ConnectionResult with multiple accounts', () => {
      const withMultipleAccounts = {
        ...validConnectionResult,
        accounts: [
          '0x1234567890123456789012345678901234567890',
          '0x9876543210987654321098765432109876543210',
        ],
      };

      expect(isConnectionResult(withMultipleAccounts)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isConnectionResult(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isConnectionResult(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isConnectionResult('string')).toBe(false);
      expect(isConnectionResult(123)).toBe(false);
      expect(isConnectionResult(true)).toBe(false);
      expect(isConnectionResult([])).toBe(false);
    });

    it('should return false for object missing address', () => {
      const invalid = { ...validConnectionResult };
      const { address, ...invalidWithoutAddress } = invalid;

      expect(isConnectionResult(invalidWithoutAddress)).toBe(false);
    });

    it('should return false for object with non-string address', () => {
      const invalid = {
        ...validConnectionResult,
        address: 123,
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });

    it('should return false for object missing accounts', () => {
      const invalid = { ...validConnectionResult };
      const { accounts, ...invalidWithoutAccounts } = invalid;

      expect(isConnectionResult(invalidWithoutAccounts)).toBe(false);
    });

    it('should return false for object with non-array accounts', () => {
      const invalid = {
        ...validConnectionResult,
        accounts: 'single-account',
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });

    it('should return false for object with non-string accounts', () => {
      const invalid = {
        ...validConnectionResult,
        accounts: [123, '0x1234567890123456789012345678901234567890'],
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });

    it('should return false for object missing chainId', () => {
      const invalid = { ...validConnectionResult };
      const { chainId, ...invalidWithoutChainId } = invalid;

      expect(isConnectionResult(invalidWithoutChainId)).toBe(false);
    });

    it('should return false for object with invalid chainId type', () => {
      const invalid = {
        ...validConnectionResult,
        chainId: true,
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });

    it('should return false for object missing chainType', () => {
      const invalid = { ...validConnectionResult };
      const { chainType, ...invalidWithoutChainType } = invalid;

      expect(isConnectionResult(invalidWithoutChainType)).toBe(false);
    });

    it('should return false for object with invalid chainType', () => {
      const invalid = {
        ...validConnectionResult,
        chainType: 'bitcoin',
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });

    it('should return false for object missing walletId', () => {
      const invalid = { ...validConnectionResult };
      const { walletId, ...invalidWithoutWalletId } = invalid;

      expect(isConnectionResult(invalidWithoutWalletId)).toBe(false);
    });

    it('should return false for object with non-string walletId', () => {
      const invalid = {
        ...validConnectionResult,
        walletId: 123,
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });

    it('should return false for object missing walletInfo', () => {
      const invalid = { ...validConnectionResult };
      const { walletInfo, ...invalidWithoutWalletInfo } = invalid;

      expect(isConnectionResult(invalidWithoutWalletInfo)).toBe(false);
    });

    it('should return false for object with invalid walletInfo', () => {
      const invalid = {
        ...validConnectionResult,
        walletInfo: {
          id: 'metamask',
          // Missing required fields
        },
      };

      expect(isConnectionResult(invalid)).toBe(false);
    });
  });

  describe('isModalError', () => {
    const validModalError = {
      code: 'connection_failed',
      message: 'Failed to connect to wallet',
      category: 'network',
    };

    it('should return true for valid ModalError', () => {
      expect(isModalError(validModalError)).toBe(true);
    });

    it('should return true for all valid categories', () => {
      const categories = ['general', 'wallet', 'network', 'user'];

      for (const category of categories) {
        const error = {
          ...validModalError,
          category,
        };
        expect(isModalError(error)).toBe(true);
      }
    });

    it('should return false for null', () => {
      expect(isModalError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isModalError(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isModalError('string')).toBe(false);
      expect(isModalError(123)).toBe(false);
      expect(isModalError(true)).toBe(false);
      expect(isModalError([])).toBe(false);
    });

    it('should return false for object missing code', () => {
      const invalid = { ...validModalError };
      const { code, ...invalidWithoutCode } = invalid;

      expect(isModalError(invalidWithoutCode)).toBe(false);
    });

    it('should return false for object with non-string code', () => {
      const invalid = {
        ...validModalError,
        code: 123,
      };

      expect(isModalError(invalid)).toBe(false);
    });

    it('should return false for object missing message', () => {
      const invalid = { ...validModalError };
      const { message, ...invalidWithoutMessage } = invalid;

      expect(isModalError(invalidWithoutMessage)).toBe(false);
    });

    it('should return false for object with non-string message', () => {
      const invalid = {
        ...validModalError,
        message: true,
      };

      expect(isModalError(invalid)).toBe(false);
    });

    it('should return false for object missing category', () => {
      const invalid = { ...validModalError };
      const { category, ...invalidWithoutCategory } = invalid;

      expect(isModalError(invalidWithoutCategory)).toBe(false);
    });

    it('should return false for object with non-string category', () => {
      const invalid = {
        ...validModalError,
        category: 123,
      };

      expect(isModalError(invalid)).toBe(false);
    });

    it('should return false for object with invalid category', () => {
      const invalid = {
        ...validModalError,
        category: 'invalid-category',
      };

      expect(isModalError(invalid)).toBe(false);
    });
  });

  describe('isTransportType', () => {
    it('should return true for valid transport types', () => {
      expect(isTransportType('popup')).toBe(true);
      expect(isTransportType('extension')).toBe(true);
    });

    it('should return false for invalid transport types', () => {
      expect(isTransportType('websocket')).toBe(false);
      expect(isTransportType('http')).toBe(false);
      expect(isTransportType('')).toBe(false);
      expect(isTransportType(null)).toBe(false);
      expect(isTransportType(undefined)).toBe(false);
      expect(isTransportType(123)).toBe(false);
      expect(isTransportType(true)).toBe(false);
      expect(isTransportType({})).toBe(false);
      expect(isTransportType([])).toBe(false);
    });
  });

  describe('isModalViewType', () => {
    it('should return true for valid modal view types', () => {
      expect(isModalViewType('walletSelection')).toBe(true);
      expect(isModalViewType('connecting')).toBe(true);
      expect(isModalViewType('connected')).toBe(true);
      expect(isModalViewType('error')).toBe(true);
    });

    it('should return false for invalid modal view types', () => {
      expect(isModalViewType('invalid')).toBe(false);
      expect(isModalViewType('loading')).toBe(false);
      expect(isModalViewType('')).toBe(false);
      expect(isModalViewType(null)).toBe(false);
      expect(isModalViewType(undefined)).toBe(false);
      expect(isModalViewType(123)).toBe(false);
      expect(isModalViewType(true)).toBe(false);
      expect(isModalViewType({})).toBe(false);
      expect(isModalViewType([])).toBe(false);
    });
  });

  describe('isConnectionState', () => {
    it('should return true for valid connection states', () => {
      expect(isConnectionState('disconnected')).toBe(true);
      expect(isConnectionState('connecting')).toBe(true);
      expect(isConnectionState('connected')).toBe(true);
    });

    it('should return false for invalid connection states', () => {
      expect(isConnectionState('invalid')).toBe(false);
      expect(isConnectionState('pending')).toBe(false);
      expect(isConnectionState('')).toBe(false);
      expect(isConnectionState(null)).toBe(false);
      expect(isConnectionState(undefined)).toBe(false);
      expect(isConnectionState(123)).toBe(false);
      expect(isConnectionState(true)).toBe(false);
      expect(isConnectionState({})).toBe(false);
      expect(isConnectionState([])).toBe(false);
    });
  });

  describe('hasErrorCode', () => {
    it('should return true for objects with string code', () => {
      expect(hasErrorCode({ code: 'ERROR_001' })).toBe(true);
      expect(hasErrorCode({ code: 'connection_failed' })).toBe(true);
      expect(hasErrorCode({ code: '' })).toBe(true); // Empty string is still a string
    });

    it('should return true for objects with number code', () => {
      expect(hasErrorCode({ code: 404 })).toBe(true);
      expect(hasErrorCode({ code: 0 })).toBe(true);
      expect(hasErrorCode({ code: -1 })).toBe(true);
    });

    it('should return true for objects with additional properties', () => {
      expect(hasErrorCode({ code: 'ERROR_001', message: 'Error occurred' })).toBe(true);
      expect(hasErrorCode({ code: 500, details: 'Server error', timestamp: Date.now() })).toBe(true);
    });

    it('should return false for null', () => {
      expect(hasErrorCode(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasErrorCode(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(hasErrorCode('string')).toBe(false);
      expect(hasErrorCode(123)).toBe(false);
      expect(hasErrorCode(true)).toBe(false);
      expect(hasErrorCode([])).toBe(false);
    });

    it('should return false for objects without code property', () => {
      expect(hasErrorCode({})).toBe(false);
      expect(hasErrorCode({ message: 'Error occurred' })).toBe(false);
      expect(hasErrorCode({ status: 500 })).toBe(false);
    });

    it('should return false for objects with invalid code types', () => {
      expect(hasErrorCode({ code: true })).toBe(false);
      expect(hasErrorCode({ code: {} })).toBe(false);
      expect(hasErrorCode({ code: [] })).toBe(false);
      expect(hasErrorCode({ code: null })).toBe(false);
      expect(hasErrorCode({ code: undefined })).toBe(false);
    });
  });

  describe('hasErrorMessage', () => {
    it('should return true for objects with string message', () => {
      expect(hasErrorMessage({ message: 'Error occurred' })).toBe(true);
      expect(hasErrorMessage({ message: 'Connection failed' })).toBe(true);
      expect(hasErrorMessage({ message: '' })).toBe(true); // Empty string is still a string
    });

    it('should return true for objects with additional properties', () => {
      expect(hasErrorMessage({ message: 'Error occurred', code: 'ERROR_001' })).toBe(true);
      expect(hasErrorMessage({ message: 'Server error', status: 500, timestamp: Date.now() })).toBe(true);
    });

    it('should return false for null', () => {
      expect(hasErrorMessage(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasErrorMessage(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(hasErrorMessage('string')).toBe(false);
      expect(hasErrorMessage(123)).toBe(false);
      expect(hasErrorMessage(true)).toBe(false);
      expect(hasErrorMessage([])).toBe(false);
    });

    it('should return false for objects without message property', () => {
      expect(hasErrorMessage({})).toBe(false);
      expect(hasErrorMessage({ code: 'ERROR_001' })).toBe(false);
      expect(hasErrorMessage({ status: 500 })).toBe(false);
    });

    it('should return false for objects with invalid message types', () => {
      expect(hasErrorMessage({ message: 123 })).toBe(false);
      expect(hasErrorMessage({ message: true })).toBe(false);
      expect(hasErrorMessage({ message: {} })).toBe(false);
      expect(hasErrorMessage({ message: [] })).toBe(false);
      expect(hasErrorMessage({ message: null })).toBe(false);
      expect(hasErrorMessage({ message: undefined })).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString('123')).toBe(true);
      expect(isString('true')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString(false)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(new Date())).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-456)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
      expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(isNumber(Number.NaN)).toBe(false);
      expect(isNumber(Number.NaN)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber(false)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(new Date())).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('should return false for non-booleans', () => {
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean('false')).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean([])).toBe(false);
      expect(isBoolean(new Date())).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject({ nested: { object: true } })).toBe(true);
    });

    it('should return true for object instances', () => {
      expect(isObject(new Date())).toBe(true);
      expect(isObject(new Error())).toBe(true);
      expect(isObject(/regex/)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isObject([])).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(['a', 'b', 'c'])).toBe(true);
      expect(isArray([{ key: 'value' }])).toBe(true);
      expect(isArray(new Array(5))).toBe(true);
    });

    it('should work with generic type parameter', () => {
      const stringArray = ['a', 'b', 'c'];
      const numberArray = [1, 2, 3];

      expect(isArray<string>(stringArray)).toBe(true);
      expect(isArray<number>(numberArray)).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isArray('string')).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
      expect(isArray({})).toBe(false);
      expect(isArray(new Date())).toBe(false);
    });

    it('should return false for array-like objects', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };
      expect(isArray(arrayLike)).toBe(false);
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle nested type checking correctly', () => {
      const complexWalletInfo = {
        id: 'complex-wallet',
        name: 'Complex Wallet',
        icon: 'data:image/svg+xml;base64,complex',
        chains: [ChainType.Evm, ChainType.Solana],
        // Additional properties should not break validation
        extraProperty: 'should not affect validation',
        version: '1.0.0',
      };

      expect(isWalletInfo(complexWalletInfo)).toBe(true);
    });

    it('should handle complex ConnectionResult with all optional fields', () => {
      const complexConnectionResult = {
        address: '0x1234567890123456789012345678901234567890',
        accounts: [
          '0x1234567890123456789012345678901234567890',
          '0x9876543210987654321098765432109876543210',
        ],
        chainId: 137, // Polygon
        chainType: ChainType.Evm,
        walletId: 'metamask',
        walletInfo: {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'data:image/svg+xml;base64,metamask',
          chains: [ChainType.Evm, ChainType.Solana],
        },
        // Additional properties
        metadata: { connectedAt: Date.now() },
        provider: { request: () => {} },
      };

      expect(isConnectionResult(complexConnectionResult)).toBe(true);
    });

    it('should handle error objects with mixed code types', () => {
      const errorWithStringCode = new Error('Test error');
      (errorWithStringCode as { code: string }).code = 'CUSTOM_ERROR';

      const errorWithNumericCode = new Error('Test error');
      (errorWithNumericCode as { code: number }).code = 404;

      expect(hasErrorCode(errorWithStringCode)).toBe(true);
      expect(hasErrorCode(errorWithNumericCode)).toBe(true);
    });

    it('should handle objects with inherited properties', () => {
      class CustomError extends Error {
        code = 'CUSTOM_ERROR';
      }

      const customError = new CustomError('Custom error occurred');

      expect(hasErrorCode(customError)).toBe(true);
      expect(hasErrorMessage(customError)).toBe(true);
    });

    it('should handle frozen and sealed objects', () => {
      const frozenObject = Object.freeze({ code: 'FROZEN_ERROR', message: 'Frozen error' });
      const sealedObject = Object.seal({ code: 'SEALED_ERROR', message: 'Sealed error' });

      expect(hasErrorCode(frozenObject)).toBe(true);
      expect(hasErrorMessage(frozenObject)).toBe(true);
      expect(hasErrorCode(sealedObject)).toBe(true);
      expect(hasErrorMessage(sealedObject)).toBe(true);
    });

    it('should handle circular references safely', () => {
      const circularObject: { code: string; self?: unknown } = { code: 'CIRCULAR_ERROR' };
      circularObject.self = circularObject;

      expect(hasErrorCode(circularObject)).toBe(true);
    });
  });
});
