import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestCapabilityRequirements,
  waitFor,
  waitForCondition,
  generateTestSessionId,
  generateTestWalletId,
  generateTestOrigin,
} from './testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('testUtils - Complete Coverage', () => {
  describe('createTestCapabilityRequirements', () => {
    describe('ethereum', () => {
      it('should create Ethereum capability requirements', () => {
        const requirements = createTestCapabilityRequirements.ethereum();

        expect(requirements).toEqual({
          chains: ['eip155:1'],
          features: ['account-management', 'transaction-signing'],
          interfaces: ['eip-1193'],
        });
      });
    });

    describe('solana', () => {
      it('should create Solana capability requirements', () => {
        const requirements = createTestCapabilityRequirements.solana();

        expect(requirements).toEqual({
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          features: ['account-management', 'transaction-signing'],
          interfaces: ['solana-wallet-standard'],
        });
      });
    });

    describe('aztec', () => {
      it('should create Aztec capability requirements', () => {
        const requirements = createTestCapabilityRequirements.aztec();

        expect(requirements).toEqual({
          chains: ['aztec:mainnet'],
          features: ['private-transactions', 'transaction-signing'],
          interfaces: ['aztec-wallet-api-v1'],
        });
      });
    });

    describe('multiChain', () => {
      it('should create multi-chain capability requirements', () => {
        const requirements = createTestCapabilityRequirements.multiChain();

        expect(requirements).toEqual({
          chains: ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          features: ['account-management', 'transaction-signing'],
          interfaces: ['eip-1193', 'solana-wallet-standard'],
        });
      });
    });
  });

  describe('waitFor', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      cleanupFakeTimers();
    });

    it('should wait for specified milliseconds', async () => {
      const waitPromise = waitFor(1000);

      // Should not be resolved immediately
      expect(vi.getTimerCount()).toBe(1);

      // Advance time
      await vi.advanceTimersByTimeAsync(1000);
      await waitPromise;

      expect(vi.getTimerCount()).toBe(0);
    });

    it('should handle zero delay', async () => {
      const waitPromise = waitFor(0);
      await vi.advanceTimersByTimeAsync(0);
      await waitPromise;

      expect(vi.getTimerCount()).toBe(0);
    });

    it('should handle negative delay (treated as 0)', async () => {
      const waitPromise = waitFor(-100);
      await vi.advanceTimersByTimeAsync(0);
      await waitPromise;

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('waitForCondition', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      cleanupFakeTimers();
    });

    it('should resolve immediately if condition is already true', async () => {
      const condition = vi.fn(() => true);

      await waitForCondition(condition);

      expect(condition).toHaveBeenCalledTimes(1);
    });

    it('should poll until condition becomes true', async () => {
      let counter = 0;
      const condition = vi.fn(() => {
        counter++;
        return counter >= 3;
      });

      const waitPromise = waitForCondition(condition, 5000, 100);

      // First check - false
      expect(condition).toHaveBeenCalledTimes(1);

      // Advance 100ms - second check - false
      await vi.advanceTimersByTimeAsync(100);
      expect(condition).toHaveBeenCalledTimes(2);

      // Advance 100ms - third check - true
      await vi.advanceTimersByTimeAsync(100);
      await waitPromise;

      expect(condition).toHaveBeenCalledTimes(3);
    });

    it('should throw error if condition is not met within timeout', async () => {
      const condition = vi.fn(() => false);

      // Use a shorter timeout to avoid async promise rejection warnings
      const waitPromise = waitForCondition(condition, 200, 50).catch((error) => error);

      // Advance past timeout
      await vi.advanceTimersByTimeAsync(250);

      const result = await waitPromise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Condition not met within 200ms');

      // Should have been called multiple times
      expect(condition.mock.calls.length).toBeGreaterThan(2);
    });

    it('should use custom timeout and interval', async () => {
      let callCount = 0;
      const condition = vi.fn(() => {
        callCount++;
        return callCount >= 2;
      });

      const waitPromise = waitForCondition(condition, 1000, 200);

      // First check immediately
      expect(condition).toHaveBeenCalledTimes(1);

      // Advance 200ms for second check
      await vi.advanceTimersByTimeAsync(200);
      await waitPromise;

      expect(condition).toHaveBeenCalledTimes(2);
    });

    it('should handle synchronous errors in condition', async () => {
      const condition = vi.fn(() => {
        throw new Error('Condition error');
      });

      await expect(waitForCondition(condition)).rejects.toThrow('Condition error');
    });
  });

  describe('generateTestSessionId', () => {
    it('should generate session ID with correct prefix', () => {
      const sessionId = generateTestSessionId();
      expect(sessionId).toMatch(
        /^test-session-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should generate unique session IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTestSessionId());
      }
      expect(ids.size).toBe(100);
    });

    it('should use crypto.randomUUID', () => {
      const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
      const originalRandomUUID = crypto.randomUUID;
      crypto.randomUUID = vi.fn(() => mockUUID) as () => `${string}-${string}-${string}-${string}-${string}`;

      const sessionId = generateTestSessionId();

      expect(sessionId).toBe(`test-session-${mockUUID}`);
      expect(crypto.randomUUID).toHaveBeenCalled();

      crypto.randomUUID = originalRandomUUID;
    });
  });

  describe('generateTestWalletId', () => {
    it('should generate wallet ID with correct prefix', () => {
      const walletId = generateTestWalletId();
      expect(walletId).toMatch(/^test-wallet-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should generate unique wallet IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTestWalletId());
      }
      expect(ids.size).toBe(100);
    });

    it('should use crypto.randomUUID', () => {
      const mockUUID = '987f6543-21ba-34dc-ba98-876543210000';
      const originalRandomUUID = crypto.randomUUID;
      crypto.randomUUID = vi.fn(() => mockUUID) as () => `${string}-${string}-${string}-${string}-${string}`;

      const walletId = generateTestWalletId();

      expect(walletId).toBe(`test-wallet-${mockUUID}`);
      expect(crypto.randomUUID).toHaveBeenCalled();

      crypto.randomUUID = originalRandomUUID;
    });
  });

  describe('generateTestOrigin', () => {
    it('should generate HTTPS origin URLs', () => {
      for (let i = 0; i < 20; i++) {
        const origin = generateTestOrigin();
        expect(origin).toMatch(/^https:\/\/[a-z]+\.[a-z]+\.(com|org|net)$/);
      }
    });

    it('should use valid subdomains', () => {
      const validSubdomains = ['app', 'dapp', 'wallet', 'defi'];
      const origins = new Set<string>();

      // Generate many origins to likely get all combinations
      for (let i = 0; i < 100; i++) {
        origins.add(generateTestOrigin());
      }

      // Extract subdomains from generated origins
      const foundSubdomains = new Set<string>();
      for (const origin of origins) {
        const match = origin.match(/https:\/\/([^.]+)\./);
        if (match?.[1]) {
          foundSubdomains.add(match[1]);
        }
      }

      // All found subdomains should be valid
      for (const subdomain of foundSubdomains) {
        expect(validSubdomains).toContain(subdomain);
      }
    });

    it('should use valid domains', () => {
      const validDomains = ['example.com', 'test.org', 'demo.net'];
      const origins = new Set<string>();

      // Generate many origins to likely get all combinations
      for (let i = 0; i < 100; i++) {
        origins.add(generateTestOrigin());
      }

      // Extract domains from generated origins
      const foundDomains = new Set<string>();
      for (const origin of origins) {
        const match = origin.match(/https:\/\/[^.]+\.(.+)$/);
        if (match?.[1]) {
          foundDomains.add(match[1]);
        }
      }

      // All found domains should be valid
      for (const domain of foundDomains) {
        expect(validDomains).toContain(domain);
      }
    });

    it('should generate variety of origins', () => {
      const origins = new Set();

      // Generate 50 origins
      for (let i = 0; i < 50; i++) {
        origins.add(generateTestOrigin());
      }

      // Should have generated multiple different origins
      expect(origins.size).toBeGreaterThan(1);
      expect(origins.size).toBeLessThanOrEqual(12); // Max possible combinations (4 subdomains * 3 domains)
    });

    it('should use Math.random for randomization', () => {
      const originalRandom = Math.random;
      const mockRandomValues = [0.1, 0.5, 0.9, 0.3, 0.7];
      let mockIndex = 0;

      Math.random = vi.fn(() => {
        const value = mockRandomValues[mockIndex % mockRandomValues.length];
        mockIndex++;
        return value;
      }) as () => number;

      const origins = [];
      for (let i = 0; i < 5; i++) {
        origins.push(generateTestOrigin());
      }

      // Should have called Math.random twice per origin (subdomain + domain)
      expect(Math.random).toHaveBeenCalledTimes(10);

      // Should generate different origins based on mock values
      expect(new Set(origins).size).toBeGreaterThan(1);

      Math.random = originalRandom;
    });
  });
});
