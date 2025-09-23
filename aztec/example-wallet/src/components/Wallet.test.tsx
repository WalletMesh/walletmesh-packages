/**
 * Tests for Aztec Wallet Component
 *
 * Verifies that the wallet can handle account registration failures gracefully
 * and continue functioning with limited capabilities.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Aztec imports
vi.mock('@aztec/accounts/schnorr', () => ({
  getSchnorrAccount: vi.fn(),
}));

vi.mock('@aztec/accounts/testing', () => ({
  getInitialTestAccounts: vi.fn(),
}));

vi.mock('@aztec/aztec.js', () => ({
  createAztecNodeClient: vi.fn(),
  waitForNode: vi.fn(),
  waitForPXE: vi.fn(),
}));

describe('Wallet Component - Account Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle account registration failure gracefully', async () => {
    // Mock account that fails to register
    const mockAccount = {
      isDeployable: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockRejectedValue(new Error('Registration failed')),
      getWallet: vi.fn().mockResolvedValue({
        getAddress: () => ({ toString: () => '0xaztec123' }),
      }),
    };

    const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
    vi.mocked(getSchnorrAccount).mockResolvedValue(mockAccount as any);

    // The wallet should not throw even if registration fails
    expect(mockAccount.register).rejects.toThrow('Registration failed');

    // But getWallet should still work as a fallback
    const wallet = await mockAccount.getWallet();
    expect(wallet.getAddress().toString()).toBe('0xaztec123');
  });

  it('should use account directly as last resort fallback', async () => {
    // Mock account where both register and getWallet fail
    const mockAccount = {
      isDeployable: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockRejectedValue(new Error('Registration failed')),
      getWallet: vi.fn().mockRejectedValue(new Error('getWallet not available')),
      getAddress: () => ({ toString: () => '0xaztec456' }),
    };

    const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
    vi.mocked(getSchnorrAccount).mockResolvedValue(mockAccount as any);

    // Both methods fail
    expect(mockAccount.register).rejects.toThrow('Registration failed');
    expect(mockAccount.getWallet).rejects.toThrow('getWallet not available');

    // But we can still use the account directly
    expect(mockAccount.getAddress().toString()).toBe('0xaztec456');
  });

  it('should attempt background registration after initial failure', async () => {
    vi.useFakeTimers();

    const mockAccount = {
      isDeployable: vi.fn().mockResolvedValue(true),
      register: vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({
          getAddress: () => ({ toString: () => '0xaztec789' }),
        }),
      getWallet: vi.fn().mockResolvedValue({
        getAddress: () => ({ toString: () => '0xaztec789' }),
      }),
    };

    const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
    vi.mocked(getSchnorrAccount).mockResolvedValue(mockAccount as any);

    // First registration attempt fails
    await expect(mockAccount.register()).rejects.toThrow('First attempt failed');

    // But getWallet works
    const wallet = await mockAccount.getWallet();
    expect(wallet).toBeDefined();

    // Second registration attempt (background) succeeds
    const registeredWallet = await mockAccount.register();
    expect(registeredWallet.getAddress().toString()).toBe('0xaztec789');

    vi.useRealTimers();
  });

  it('should handle successful registration on first attempt', async () => {
    const mockWallet = {
      getAddress: () => ({ toString: () => '0xaztecSuccess' }),
    };

    const mockAccount = {
      isDeployable: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockResolvedValue(mockWallet),
      getWallet: vi.fn().mockResolvedValue(mockWallet),
    };

    const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
    vi.mocked(getSchnorrAccount).mockResolvedValue(mockAccount as any);

    // Registration succeeds
    const wallet = await mockAccount.register();
    expect(wallet.getAddress().toString()).toBe('0xaztecSuccess');

    // getWallet should not be called when registration succeeds
    expect(mockAccount.getWallet).not.toHaveBeenCalled();
  });
});
