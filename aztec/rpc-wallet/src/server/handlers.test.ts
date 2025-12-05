import { Buffer } from 'node:buffer';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { AuthWitness } from '@aztec/aztec.js/authorization';
import { Fr } from '@aztec/aztec.js/fields';
import { type ExecutionPayload, TxHash } from '@aztec/aztec.js/tx';
import type { ProfileOptions, SendOptions, SimulateOptions, Wallet } from '@aztec/aztec.js/wallet';
import type { ContractArtifact, EventMetadataDefinition, FunctionCall } from '@aztec/stdlib/abi';
import { EventSelector, FunctionSelector, FunctionType } from '@aztec/stdlib/abi';
import type { ContractInstanceWithAddress, ContractMetadata } from '@aztec/stdlib/contract';
import { PublicKeys } from '@aztec/stdlib/keys';
import { TxProfileResult, TxSimulationResult, UtilitySimulationResult } from '@aztec/stdlib/tx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HANDLERS, registerAztecWalletHandlers } from './handlers.js';
import type { AztecWalletHandlerContext } from './types.js';

// Mock logger
vi.mock('@aztec/foundation/log', () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('handlers', () => {
  let mockNode: {
    registerMethod: ReturnType<typeof vi.fn>;
  };
  let mockWallet: Wallet;
  let mockContext: AztecWalletHandlerContext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockNode = {
      registerMethod: vi.fn(),
    };

    mockWallet = {
      getChainInfo: vi.fn().mockResolvedValue({ chainId: Fr.random(), version: Fr.random() }),
      getAccounts: vi.fn().mockResolvedValue([]),
      registerSender: vi.fn().mockResolvedValue(AztecAddress.fromString(`0x${'1'.repeat(64)}`)),
      getContractClassMetadata: vi.fn(),
      getContractMetadata: vi.fn(),
      getPrivateEvents: vi.fn(),
      getTxReceipt: vi.fn(),
      getAddressBook: vi.fn(),
      registerContract: vi.fn(),
      simulateTx: vi.fn(),
      simulateUtility: vi.fn(),
      profileTx: vi.fn(),
      sendTx: vi.fn(),
      createAuthWit: vi.fn(),
      batch: vi.fn(),
    } as unknown as Wallet;

    mockContext = {
      wallet: mockWallet,
      notify: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerAztecWalletHandlers', () => {
    it('should register all handlers from HANDLERS object', () => {
      registerAztecWalletHandlers(mockNode as never);

      // Verify registerMethod was called for each handler
      const handlerCount = Object.keys(HANDLERS).length;
      expect(mockNode.registerMethod).toHaveBeenCalledTimes(handlerCount);
    });

    it('should register handlers with correct method names', () => {
      registerAztecWalletHandlers(mockNode as never);

      const registeredMethods = vi.mocked(mockNode.registerMethod).mock.calls.map((call) => call[0]);

      // Check that key methods are registered
      expect(registeredMethods).toContain('aztec_getChainInfo');
      expect(registeredMethods).toContain('aztec_getAccounts');
      expect(registeredMethods).toContain('aztec_registerSender');
      expect(registeredMethods).toContain('aztec_getContractClassMetadata');
      expect(registeredMethods).toContain('aztec_getContractMetadata');
    });
  });

  describe('handler execution', () => {
    it('should call wallet.getChainInfo when aztec_getChainInfo handler is executed', async () => {
      const handler = HANDLERS['aztec_getChainInfo'] as (
        ctx: AztecWalletHandlerContext,
        params: [],
      ) => Promise<unknown>;

      const mockResult = { chainId: Fr.random(), version: Fr.random() };
      vi.mocked(mockWallet.getChainInfo).mockResolvedValue(mockResult);

      const result = await handler(mockContext, []);

      expect(mockWallet.getChainInfo).toHaveBeenCalledWith();
      expect(result).toBe(mockResult);
    });

    it('should call wallet.getAccounts when aztec_getAccounts handler is executed', async () => {
      const handler = HANDLERS['aztec_getAccounts'] as (
        ctx: AztecWalletHandlerContext,
        params: [],
      ) => Promise<unknown>;

      const mockResult = [{ alias: 'account1', item: AztecAddress.fromString(`0x${'2'.repeat(64)}`) }];
      vi.mocked(mockWallet.getAccounts).mockResolvedValue(mockResult);

      const result = await handler(mockContext, []);

      expect(mockWallet.getAccounts).toHaveBeenCalledWith();
      expect(result).toBe(mockResult);
    });

    it('should call wallet.registerSender with correct parameters', async () => {
      const handler = HANDLERS['aztec_registerSender'] as (
        ctx: AztecWalletHandlerContext,
        params: [AztecAddress],
      ) => Promise<unknown>;

      const senderAddress = AztecAddress.fromString(`0x${'3'.repeat(64)}`);
      const mockResult = senderAddress;
      vi.mocked(mockWallet.registerSender).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [senderAddress]);

      expect(mockWallet.registerSender).toHaveBeenCalledWith(senderAddress);
      expect(result).toBe(mockResult);
    });

    it('should extract parameters from tuple format correctly', async () => {
      const handler = HANDLERS['aztec_getContractClassMetadata'] as (
        ctx: AztecWalletHandlerContext,
        params: [Fr, boolean | undefined],
      ) => Promise<unknown>;

      const classId = Fr.random();
      const includeArtifact = true;
      // Create a minimal ContractClassMetadata object
      const mockResult = {
        contractClass: {
          version: 1 as const,
          id: Fr.random(),
          artifactHash: Fr.random(),
          privateFunctions: [],
          publicBytecodeCommitment: Fr.random(),
          unconstrainedFunctionsArtifactTreeRoot: Fr.random(),
          packedBytecode: Buffer.from([0x12, 0x34]),
        },
        isContractClassPubliclyRegistered: true,
        artifact: {
          name: 'TestContract',
          functions: [],
          nonDispatchPublicFunctions: [],
          outputs: { structs: {}, globals: {} },
          fileMap: {},
          storageLayout: {},
        },
      };
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [classId, includeArtifact]);

      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledWith(classId, includeArtifact);
      expect(result).toBe(mockResult);
    });

    it('should handle optional parameters correctly', async () => {
      const handler = HANDLERS['aztec_getContractClassMetadata'] as (
        ctx: AztecWalletHandlerContext,
        params: [Fr, boolean | undefined],
      ) => Promise<unknown>;

      const classId = Fr.random();
      const mockResult = {
        contractClass: {
          version: 1 as const,
          id: Fr.random(),
          artifactHash: Fr.random(),
          privateFunctions: [],
          publicBytecodeCommitment: Fr.random(),
          unconstrainedFunctionsArtifactTreeRoot: Fr.random(),
          packedBytecode: Buffer.from([0x12, 0x34]),
        },
        isContractClassPubliclyRegistered: true,
        artifact: {
          name: 'TestContract',
          functions: [],
          nonDispatchPublicFunctions: [],
          outputs: { structs: {}, globals: {} },
          fileMap: {},
          storageLayout: {},
        },
      };
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [classId, undefined]);

      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledWith(classId, undefined);
      expect(result).toBe(mockResult);
    });

    it('should call wallet.getTxReceipt with txHash parameter', async () => {
      const handler = HANDLERS['aztec_getTxReceipt'] as (
        ctx: AztecWalletHandlerContext,
        params: [TxHash],
      ) => Promise<unknown>;

      const txHash = TxHash.random();
      const mockResult = { status: 'mined', blockNumber: 123 };
      vi.mocked(mockWallet.getTxReceipt).mockResolvedValue(mockResult as never);

      const result = await handler(mockContext, [txHash]);

      expect(mockWallet.getTxReceipt).toHaveBeenCalledWith(txHash);
      expect(result).toBe(mockResult);
    });

    it('should call wallet.getContractMetadata with contractAddress parameter', async () => {
      const handler = HANDLERS['aztec_getContractMetadata'] as (
        ctx: AztecWalletHandlerContext,
        params: [AztecAddress],
      ) => Promise<unknown>;

      const contractAddress = AztecAddress.fromString(`0x${'4'.repeat(64)}`);
      const mockResult: ContractMetadata = {
        contractInstance: {
          address: contractAddress,
          version: 1,
          salt: Fr.random(),
          deployer: AztecAddress.fromString(`0x${'5'.repeat(64)}`),
          currentContractClassId: Fr.random(),
          originalContractClassId: Fr.random(),
          initializationHash: Fr.random(),
          publicKeys: PublicKeys.default(),
        },
        isContractInitialized: true,
        isContractPublished: true,
      };
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [contractAddress]);

      expect(mockWallet.getContractMetadata).toHaveBeenCalledWith(contractAddress);
      expect(result).toBe(mockResult);
    });

    it('should call wallet.getPrivateEvents with all parameters', async () => {
      const handler = HANDLERS['aztec_getPrivateEvents'] as (
        ctx: AztecWalletHandlerContext,
        params: [AztecAddress, EventMetadataDefinition, number, number, AztecAddress[]],
      ) => Promise<unknown>;

      const contractAddress = AztecAddress.fromString(`0x${'6'.repeat(64)}`);
      const eventMetadata: EventMetadataDefinition = {
        eventSelector: EventSelector.fromField(new Fr(1)),
        abiType: { kind: 'field' },
        fieldNames: ['field1'],
      };
      const from = 0;
      const numBlocks = 10;
      const recipients = [AztecAddress.fromString(`0x${'7'.repeat(64)}`)];
      const mockResult = [{ field1: Fr.random() }];
      vi.mocked(mockWallet.getPrivateEvents).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      ]);

      expect(mockWallet.getPrivateEvents).toHaveBeenCalledWith(
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      );
      expect(result).toBe(mockResult);
    });

    it('should call wallet.getAddressBook when aztec_getAddressBook handler is executed', async () => {
      const handler = HANDLERS['aztec_getAddressBook'] as (
        ctx: AztecWalletHandlerContext,
        params: [],
      ) => Promise<unknown>;

      const mockResult = [{ alias: 'sender1', item: AztecAddress.fromString(`0x${'8'.repeat(64)}`) }];
      vi.mocked(mockWallet.getAddressBook).mockResolvedValue(mockResult);

      const result = await handler(mockContext, []);

      expect(mockWallet.getAddressBook).toHaveBeenCalledWith();
      expect(result).toBe(mockResult);
    });

    it('should call wallet.registerContract with instance and artifact', async () => {
      const handler = HANDLERS['aztec_registerContract'] as (
        ctx: AztecWalletHandlerContext,
        params: [ContractInstanceWithAddress, ContractArtifact | undefined],
      ) => Promise<unknown>;

      const mockInstance: ContractInstanceWithAddress = {
        address: AztecAddress.fromString(`0x${'9'.repeat(64)}`),
        version: 1,
        salt: Fr.random(),
        deployer: AztecAddress.fromString(`0x${'a'.repeat(64)}`),
        currentContractClassId: Fr.random(),
        originalContractClassId: Fr.random(),
        initializationHash: Fr.random(),
        publicKeys: PublicKeys.default(),
      };
      const mockArtifact: ContractArtifact = {
        name: 'TestContract',
        functions: [],
        nonDispatchPublicFunctions: [],
        outputs: { structs: {}, globals: {} },
        fileMap: {},
        storageLayout: {},
      };
      vi.mocked(mockWallet.registerContract).mockResolvedValue(mockInstance);

      const result = await handler(mockContext, [mockInstance, mockArtifact]);

      expect(mockWallet.registerContract).toHaveBeenCalledWith(mockInstance, mockArtifact);
      expect(result).toBe(mockInstance);
    });

    it('should call wallet.registerContract with instance and undefined artifact', async () => {
      const handler = HANDLERS['aztec_registerContract'] as (
        ctx: AztecWalletHandlerContext,
        params: [ContractInstanceWithAddress, ContractArtifact | undefined],
      ) => Promise<unknown>;

      const mockInstance: ContractInstanceWithAddress = {
        address: AztecAddress.fromString(`0x${'b'.repeat(64)}`),
        version: 1,
        salt: Fr.random(),
        deployer: AztecAddress.fromString(`0x${'c'.repeat(64)}`),
        currentContractClassId: Fr.random(),
        originalContractClassId: Fr.random(),
        initializationHash: Fr.random(),
        publicKeys: PublicKeys.default(),
      };
      vi.mocked(mockWallet.registerContract).mockResolvedValue(mockInstance);

      const result = await handler(mockContext, [mockInstance, undefined]);

      expect(mockWallet.registerContract).toHaveBeenCalledWith(mockInstance, undefined);
      expect(result).toBe(mockInstance);
    });

    it('should call wallet.simulateTx with executionPayload and options', async () => {
      const handler = HANDLERS['aztec_simulateTx'] as (
        ctx: AztecWalletHandlerContext,
        params: [ExecutionPayload, SimulateOptions],
      ) => Promise<unknown>;

      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: SimulateOptions = {
        from: AztecAddress.fromString(`0x${'d'.repeat(64)}`),
      };
      const mockResult = TxSimulationResult.random();
      vi.mocked(mockWallet.simulateTx).mockResolvedValue(mockResult as never);

      const result = await handler(mockContext, [exec, opts]);

      expect(mockWallet.simulateTx).toHaveBeenCalledWith(exec, opts);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(TxSimulationResult);
    });

    it('should call wallet.simulateUtility with functionCall and authWitnesses', async () => {
      const handler = HANDLERS['aztec_simulateUtility'] as (
        ctx: AztecWalletHandlerContext,
        params: [FunctionCall, AuthWitness[] | undefined],
      ) => Promise<unknown>;

      const call: FunctionCall = {
        name: 'testFunction',
        to: AztecAddress.fromString(`0x${'e'.repeat(64)}`),
        selector: FunctionSelector.fromField(new Fr(1)),
        type: FunctionType.UTILITY,
        isStatic: false,
        hideMsgSender: false,
        args: [Fr.random()],
        returnTypes: [],
      };
      const authWitnesses = [AuthWitness.random()];
      const mockResult = UtilitySimulationResult.random();
      vi.mocked(mockWallet.simulateUtility).mockResolvedValue(mockResult as never);

      const result = await handler(mockContext, [call, authWitnesses]);

      expect(mockWallet.simulateUtility).toHaveBeenCalledWith(call, authWitnesses);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(UtilitySimulationResult);
    });

    it('should call wallet.simulateUtility with functionCall and undefined authWitnesses', async () => {
      const handler = HANDLERS['aztec_simulateUtility'] as (
        ctx: AztecWalletHandlerContext,
        params: [FunctionCall, AuthWitness[] | undefined],
      ) => Promise<unknown>;

      const call: FunctionCall = {
        name: 'testFunction',
        to: AztecAddress.fromString(`0x${'f'.repeat(64)}`),
        selector: FunctionSelector.fromField(new Fr(1)),
        type: FunctionType.UTILITY,
        isStatic: false,
        hideMsgSender: false,
        args: [Fr.random()],
        returnTypes: [],
      };
      const mockResult = UtilitySimulationResult.random();
      vi.mocked(mockWallet.simulateUtility).mockResolvedValue(mockResult as never);

      const result = await handler(mockContext, [call, undefined]);

      expect(mockWallet.simulateUtility).toHaveBeenCalledWith(call, undefined);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(UtilitySimulationResult);
    });

    it('should call wallet.profileTx with executionPayload and options', async () => {
      const handler = HANDLERS['aztec_profileTx'] as (
        ctx: AztecWalletHandlerContext,
        params: [ExecutionPayload, ProfileOptions],
      ) => Promise<unknown>;

      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: ProfileOptions = {
        from: AztecAddress.fromString(`0x${'1'.repeat(64)}`),
        profileMode: 'gates',
      };
      const mockResult = TxProfileResult.random();
      vi.mocked(mockWallet.profileTx).mockResolvedValue(mockResult as never);

      const result = await handler(mockContext, [exec, opts]);

      expect(mockWallet.profileTx).toHaveBeenCalledWith(exec, opts);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(TxProfileResult);
    });

    it('should call wallet.sendTx with executionPayload and options', async () => {
      const handler = HANDLERS['aztec_sendTx'] as (
        ctx: AztecWalletHandlerContext,
        params: [ExecutionPayload, SendOptions],
      ) => Promise<unknown>;

      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: SendOptions = {
        from: AztecAddress.fromString(`0x${'2'.repeat(64)}`),
      };
      const mockResult = TxHash.random();
      vi.mocked(mockWallet.sendTx).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [exec, opts]);

      expect(mockWallet.sendTx).toHaveBeenCalledWith(exec, opts);
      expect(result).toBe(mockResult);
    });

    it('should call wallet.createAuthWit with address and Fr', async () => {
      const handler = HANDLERS['aztec_createAuthWit'] as (
        ctx: AztecWalletHandlerContext,
        params: [AztecAddress, Fr],
      ) => Promise<unknown>;

      const from = AztecAddress.fromString(`0x${'3'.repeat(64)}`);
      const messageHash = Fr.random();
      const mockResult = AuthWitness.random();
      vi.mocked(mockWallet.createAuthWit).mockResolvedValue(mockResult);

      const result = await handler(mockContext, [from, messageHash]);

      expect(mockWallet.createAuthWit).toHaveBeenCalledWith(from, messageHash);
      expect(result).toBe(mockResult);
    });

    it('should call wallet.batch with batchedMethods array', async () => {
      const handler = HANDLERS['aztec_batch'] as (
        ctx: AztecWalletHandlerContext,
        params: [Array<{ name: string; args: unknown[] }>],
      ) => Promise<unknown>;

      const batchedMethods = [
        { name: 'registerSender' as const, args: [AztecAddress.fromString(`0x${'4'.repeat(64)}`), 'alias1'] },
        { name: 'simulateUtility' as const, args: [] },
      ];
      const mockResult = [
        AztecAddress.fromString(`0x${'5'.repeat(64)}`),
        UtilitySimulationResult.random() as never,
      ];
      vi.mocked(mockWallet.batch).mockResolvedValue(mockResult as never);

      const result = await handler(mockContext, [batchedMethods]);

      expect(mockWallet.batch).toHaveBeenCalledWith(batchedMethods);
      expect(result).toBe(mockResult);
    });
  });
});
