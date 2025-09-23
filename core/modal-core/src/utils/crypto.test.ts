import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateId,
  generateRandomString,
  generateSecureToken,
  generateSessionId,
  isCryptoAvailable,
} from './crypto.js';

describe('crypto utilities', () => {
  // Save original crypto object
  const originalCrypto = global.crypto;

  beforeEach(() => {
    // Mock crypto.randomUUID to return predictable values for testing
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

    // Mock crypto.getRandomValues for predictable testing
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array: Uint8Array) => {
      // Fill with predictable values for testing
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256;
      }
      return array;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSessionId', () => {
    it('should generate a session ID without prefix', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should generate a session ID with prefix', () => {
      const sessionId = generateSessionId('session');
      expect(sessionId).toBe('session_550e8400-e29b-41d4-a716-446655440000');
    });

    it('should use crypto.randomUUID', () => {
      generateSessionId();
      expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateId', () => {
    it('should generate a basic ID', () => {
      const id = generateId();
      expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should generate an ID with prefix', () => {
      const id = generateId({ prefix: 'switch' });
      expect(id).toBe('switch_550e8400-e29b-41d4-a716-446655440000');
    });

    it('should generate an ID with timestamp', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      const id = generateId({ timestamp: true });
      expect(id).toBe('1234567890_550e8400-e29b-41d4-a716-446655440000');
    });

    it('should generate an ID with prefix and timestamp', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      const id = generateId({ prefix: 'tx', timestamp: true });
      expect(id).toBe('tx_1234567890_550e8400-e29b-41d4-a716-446655440000');
    });

    it('should use custom separator', () => {
      const id = generateId({ prefix: 'test', separator: '-' });
      expect(id).toBe('test-550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a token with default length', () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token).toBe('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    });

    it('should generate a token with custom length', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(token).toBe('000102030405060708090a0b0c0d0e0f');
    });

    it('should use crypto.getRandomValues', () => {
      generateSecureToken();
      expect(crypto.getRandomValues).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateRandomString', () => {
    it('should generate a random string with default charset', () => {
      const str = generateRandomString(10);
      expect(str).toHaveLength(10);
      // With our mock, this will produce predictable output
      expect(str).toMatch(/^[0-9A-Za-z]+$/);
    });

    it('should generate a random string with custom charset', () => {
      const str = generateRandomString(8, '0123456789abcdef');
      expect(str).toHaveLength(8);
      expect(str).toMatch(/^[0-9a-f]+$/);
    });

    it('should use crypto.getRandomValues', () => {
      generateRandomString(5);
      expect(crypto.getRandomValues).toHaveBeenCalledTimes(1);
    });
  });

  describe('isCryptoAvailable', () => {
    it('should return true when crypto API is available', () => {
      expect(isCryptoAvailable()).toBe(true);
    });

    it('should return false when crypto is undefined', () => {
      // Mock crypto as undefined using Object.defineProperty
      const descriptor = Object.getOwnPropertyDescriptor(global, 'crypto');
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        configurable: true,
      });

      expect(isCryptoAvailable()).toBe(false);

      // Restore original descriptor
      if (descriptor) {
        Object.defineProperty(global, 'crypto', descriptor);
      }
    });

    it('should return false when randomUUID is missing', () => {
      const descriptor = Object.getOwnPropertyDescriptor(global, 'crypto');
      Object.defineProperty(global, 'crypto', {
        value: { getRandomValues: originalCrypto.getRandomValues },
        configurable: true,
      });

      expect(isCryptoAvailable()).toBe(false);

      if (descriptor) {
        Object.defineProperty(global, 'crypto', descriptor);
      }
    });

    it('should return false when getRandomValues is missing', () => {
      const descriptor = Object.getOwnPropertyDescriptor(global, 'crypto');
      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: originalCrypto.randomUUID },
        configurable: true,
      });

      expect(isCryptoAvailable()).toBe(false);

      if (descriptor) {
        Object.defineProperty(global, 'crypto', descriptor);
      }
    });
  });

  describe('real crypto behavior', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate valid UUIDs', () => {
      const id = generateSessionId();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});
