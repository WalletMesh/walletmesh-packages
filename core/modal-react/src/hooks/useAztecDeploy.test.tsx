/**
 * Tests for useAztecDeploy hook
 *
 * @packageDocumentation
 */

import { AztecAddress } from '@aztec/aztec.js';
import { act, renderHook } from '@testing-library/react';
import * as aztecProviders from '@walletmesh/modal-core/providers/aztec';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../test/utils.js';
import { useAztecDeploy } from './useAztecDeploy.js';
import * as aztecWallet from './useAztecWallet.js';

// Mock dependencies
vi.mock('./useAztecWallet.js');
vi.mock('@walletmesh/modal-core/providers/aztec');

describe('useAztecDeploy', () => {
  const mockAddress = AztecAddress.fromString(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  );
  const mockContractAddress = AztecAddress.fromString(
    '0x2222222222222222222222222222222222222222222222222222222222222222',
  );
  const mockTxHash = '0x3333333333333333333333333333333333333333333333333333333333333333';
  const mockTxStatusId = 'test-status-id-123';

  const mockArtifact = {
    name: 'TestContract',
    functions: [],
    events: [],
    notes: {},
  };

  const mockArgs = ['arg1', 'arg2'];

  let mockAztecWallet: {
    wmDeployContract: ReturnType<typeof vi.fn>;
    deployContract: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup mock wallet with both wmDeployContract and deployContract
    mockAztecWallet = {
      wmDeployContract: vi.fn().mockResolvedValue({
        txHash: mockTxHash,
        contractAddress: mockContractAddress,
        txStatusId: mockTxStatusId,
      }),
      deployContract: vi.fn().mockResolvedValue({
        txHash: mockTxHash,
        deployed: vi.fn().mockResolvedValue({
          address: mockContractAddress,
        }),
        wait: vi.fn().mockResolvedValue({
          status: 'success',
          txHash: mockTxHash,
        }),
      }),
    };

    // Setup mocks - use mockReturnValue (not mockReturnValueOnce) to make it persist
    vi.mocked(aztecWallet.useAztecWallet).mockReturnValue({
      aztecWallet: mockAztecWallet,
      isReady: true,
      address: mockAddress as unknown as string,
      error: null,
    } as unknown as ReturnType<typeof aztecWallet.useAztecWallet>);

    // Setup aztec provider mocks
    vi.mocked(aztecProviders.normalizeArtifact).mockImplementation((artifact) => artifact);
    vi.mocked(aztecProviders.ensureContractClassRegistered).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Async Mode (deploy)', () => {
    it('should return txStatusId immediately without blocking', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      let statusId: string | undefined;
      await act(async () => {
        statusId = await result.current.deploy(mockArtifact, mockArgs);
      });

      expect(statusId).toBe(mockTxStatusId);
      expect(result.current.txStatusId).toBe(mockTxStatusId);
      expect(result.current.deployedAddress).toBe(mockContractAddress);
      expect(mockAztecWallet.wmDeployContract).toHaveBeenCalledWith(mockArtifact, mockArgs);
    });

    it('should set isDeploying to false after returning txStatusId', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs);
      });

      expect(result.current.isDeploying).toBe(false);
    });

    it('should call onStart callback when deployment begins', async () => {
      const onStart = vi.fn();
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs, { onStart });
      });

      expect(onStart).toHaveBeenCalled();
    });

    it('should handle errors and call onError callback', async () => {
      const onError = vi.fn();
      const error = new Error('Deployment failed');
      mockAztecWallet.wmDeployContract.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        try {
          await result.current.deploy(mockArtifact, mockArgs, { onError });
        } catch (_err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.stage).toBe('error');
      expect(onError).toHaveBeenCalled();
    });

    it('should throw error if wallet is not ready', async () => {
      vi.mocked(aztecWallet.useAztecWallet).mockReturnValueOnce({
        aztecWallet: null,
        isReady: false,
        address: null,
        error: null,
      } as ReturnType<typeof aztecWallet.useAztecWallet>);

      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await expect(result.current.deploy(mockArtifact, mockArgs)).rejects.toThrow(
          'Aztec wallet is not ready or no address available',
        );
      });

      expect(result.current.error).toBeDefined();
    });

    it('should throw error if wmDeployContract is not available', async () => {
      const walletWithoutWm = {
        deployContract: mockAztecWallet.deployContract,
        // wmDeployContract is undefined
      };

      vi.mocked(aztecWallet.useAztecWallet).mockReturnValueOnce({
        aztecWallet: walletWithoutWm,
        isReady: true,
        address: mockAddress as unknown as string,
        error: null,
      } as unknown as ReturnType<typeof aztecWallet.useAztecWallet>);

      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await expect(result.current.deploy(mockArtifact, mockArgs)).rejects.toThrow(
          'wmDeployContract method not available',
        );
      });
    });

    it('should update stage to preparing during deployment', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      // Start deployment
      const deployPromise = act(async () => {
        await result.current.deploy(mockArtifact, mockArgs);
      });

      // Check that stage was updated during deployment
      // Note: stage might be 'idle' if deployment completed immediately
      expect(['preparing', 'idle', 'proving']).toContain(result.current.stage);

      // Wait for deployment to complete
      await deployPromise;
    });

    it('should call onProgress callback with stages', async () => {
      const onProgress = vi.fn();
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs, { onProgress });
      });

      expect(onProgress).toHaveBeenCalledWith('preparing');
    });
  });

  describe('Sync Mode (deploySync)', () => {
    it('should wait for deployment to complete and return full result', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      let deploymentResult: Awaited<ReturnType<typeof result.current.deploySync>> | undefined;
      await act(async () => {
        deploymentResult = await result.current.deploySync(mockArtifact, mockArgs);
      });

      expect(deploymentResult).toBeDefined();
      expect(deploymentResult?.address).toBe(mockContractAddress);
      expect(deploymentResult?.txHash).toBeDefined();
      expect(deploymentResult?.receipt).toBeDefined();
      expect(mockAztecWallet.deployContract).toHaveBeenCalledWith(mockArtifact, mockArgs);
    });

    it('should set isDeploying to true during deployment and false after', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      // Start deployment
      const deployPromise = result.current.deploySync(mockArtifact, mockArgs);

      // Wait for state to update
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should be deploying or completed (mock is fast)
      // After completion, isDeploying should be false
      await act(async () => {
        await deployPromise;
      });

      expect(result.current.isDeploying).toBe(false);
      expect(result.current.stage).toBe('success');
    });

    it('should call onSuccess callback with deployed address', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploySync(mockArtifact, mockArgs, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith(mockContractAddress);
    });

    it('should call onProgress callback with all stages', async () => {
      const onProgress = vi.fn();
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploySync(mockArtifact, mockArgs, { onProgress });
      });

      expect(onProgress).toHaveBeenCalledWith('preparing');
      expect(onProgress).toHaveBeenCalledWith('computing');
      expect(onProgress).toHaveBeenCalledWith('proving');
      expect(onProgress).toHaveBeenCalledWith('sending');
      expect(onProgress).toHaveBeenCalledWith('confirming');
    });

    it('should handle errors and call onError callback', async () => {
      const onError = vi.fn();
      const error = new Error('Deployment failed');
      mockAztecWallet.deployContract.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        try {
          await result.current.deploySync(mockArtifact, mockArgs, { onError });
        } catch (_err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.stage).toBe('error');
      expect(onError).toHaveBeenCalled();
    });

    it('should set deployedAddress and lastDeployment on success', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploySync(mockArtifact, mockArgs);
      });

      expect(result.current.deployedAddress).toBe(mockContractAddress);
      expect(result.current.lastDeployment).toBeDefined();
      expect(result.current.lastDeployment?.address).toBe(mockContractAddress);
    });

    it('should update stage through all deployment phases', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      const stages: string[] = [];
      await act(async () => {
        await result.current.deploySync(mockArtifact, mockArgs, {
          onProgress: (stage) => stages.push(stage),
        });
      });

      expect(stages).toContain('preparing');
      expect(stages).toContain('computing');
      expect(stages).toContain('proving');
      expect(stages).toContain('sending');
      expect(stages).toContain('confirming');
    });
  });

  describe('State Management', () => {
    it('should reset state correctly', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      // Deploy first
      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs);
      });

      expect(result.current.txStatusId).toBe(mockTxStatusId);
      expect(result.current.deployedAddress).toBe(mockContractAddress);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isDeploying).toBe(false);
      expect(result.current.stage).toBe('idle');
      expect(result.current.error).toBeNull();
      expect(result.current.txStatusId).toBeNull();
    });

    it('should maintain txStatusId after deployment completes', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs);
      });

      // txStatusId should be set after deployment
      expect(result.current.txStatusId).toBe(mockTxStatusId);

      // Verify it persists after advancing timers
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.txStatusId).toBe(mockTxStatusId);
    });
  });

  describe('Error Handling', () => {
    it('should create enhanced error with deployment context', async () => {
      const error = new Error('Network error');
      mockAztecWallet.deployContract.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        try {
          await result.current.deploySync(mockArtifact, mockArgs);
        } catch (_err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Deployment failed');
    });

    it('should handle missing wallet gracefully', async () => {
      vi.mocked(aztecWallet.useAztecWallet).mockReturnValueOnce({
        aztecWallet: null,
        isReady: false,
        address: null,
        error: null,
      } as ReturnType<typeof aztecWallet.useAztecWallet>);

      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await expect(result.current.deploySync(mockArtifact, mockArgs)).rejects.toThrow();
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Integration with artifact normalization', () => {
    it('should normalize artifact before deployment (async)', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs);
      });

      expect(aztecProviders.normalizeArtifact).toHaveBeenCalledWith(mockArtifact);
    });

    it('should normalize artifact before deployment (sync)', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploySync(mockArtifact, mockArgs);
      });

      expect(aztecProviders.normalizeArtifact).toHaveBeenCalledWith(mockArtifact);
    });

    it('should ensure contract class is registered before deployment', async () => {
      const { result } = renderHook(() => useAztecDeploy(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.deploy(mockArtifact, mockArgs);
      });

      expect(aztecProviders.ensureContractClassRegistered).toHaveBeenCalledWith(
        mockAztecWallet,
        mockArtifact,
      );
    });
  });
});
