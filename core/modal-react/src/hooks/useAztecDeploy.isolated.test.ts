/**
 * Isolated tests for useAztecDeploy hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockAztecWallet = {
  wmDeployContract: vi.fn().mockResolvedValue({
    txHash: '0x123',
    contractAddress: { toString: () => '0x456' },
    txStatusId: 'test-status-id',
  }),
  deployContract: vi.fn().mockResolvedValue({
    txHash: '0x123',
    deployed: vi.fn().mockResolvedValue({
      address: { toString: () => '0x456' },
    }),
    wait: vi.fn().mockResolvedValue({
      status: 'success',
      txHash: '0x123',
    }),
  }),
};

// Mock logger
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock useAztecWallet
vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(() => ({
    aztecWallet: mockAztecWallet,
    isReady: true,
    address: '0x1111111111111111111111111111111111111111111111111111111111111111',
    error: null,
  })),
}));

// Mock aztec providers
vi.mock('@walletmesh/modal-core/providers/aztec', () => ({
  normalizeArtifact: vi.fn((artifact) => artifact),
  ensureContractClassRegistered: vi.fn().mockResolvedValue(undefined),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useAztecDeploy - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return proper initial state', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(result.current.isDeploying).toBe(false);
      expect(result.current.stage).toBe('idle');
      expect(result.current.error).toBeNull();
      expect(result.current.txStatusId).toBeNull();
      expect(result.current.deployedAddress).toBeNull();
    });

    it('should provide required function interfaces', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(typeof result.current.deploy).toBe('function');
      expect(typeof result.current.deploySync).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('State Properties', () => {
    it('should expose deployment state', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(result.current).toHaveProperty('isDeploying');
      expect(result.current).toHaveProperty('stage');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('txStatusId');
      expect(result.current).toHaveProperty('deployedAddress');
      expect(result.current).toHaveProperty('lastDeployment');
    });

    it('should have correct initial types', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(typeof result.current.isDeploying).toBe('boolean');
      expect(typeof result.current.stage).toBe('string');
      expect([
        'idle',
        'preparing',
        'computing',
        'proving',
        'sending',
        'confirming',
        'success',
        'error',
      ]).toContain(result.current.stage);
    });
  });

  describe('Function Interfaces', () => {
    it('should provide deploy function for async deployment', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(typeof result.current.deploy).toBe('function');
      // Deploy function should accept artifact, args, and optional callbacks
      expect(result.current.deploy.length).toBeGreaterThanOrEqual(2);
    });

    it('should provide deploySync function for synchronous deployment', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(typeof result.current.deploySync).toBe('function');
      // DeploySync function should accept artifact, args, and optional callbacks
      expect(result.current.deploySync.length).toBeGreaterThanOrEqual(2);
    });

    it('should provide reset function', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(typeof result.current.reset).toBe('function');
      expect(result.current.reset.length).toBe(0);
    });
  });

  describe('Stage Values', () => {
    it('should start with idle stage', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(result.current.stage).toBe('idle');
    });
  });

  describe('Deployment Results', () => {
    it('should track txStatusId for async deployments', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(result.current.txStatusId).toBeNull();
    });

    it('should track deployedAddress', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(result.current.deployedAddress).toBeNull();
    });

    it('should track lastDeployment', async () => {
      const { useAztecDeploy } = await import('./useAztecDeploy.js');
      const { result } = renderHook(() => useAztecDeploy(), { wrapper });

      expect(result.current.lastDeployment).toBeNull();
    });
  });
});
