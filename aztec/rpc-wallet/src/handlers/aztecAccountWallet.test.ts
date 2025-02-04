import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AccountWallet } from '@aztec/aztec.js';
import { Fr, AztecAddress, TxHash, ExtendedNote, EventSelector } from '@aztec/aztec.js';
import type {
  TxExecutionRequest,
  ContractInstanceWithAddress,
  ContractArtifact,
  PublicKeys,
  Note,
  AuthWitness,
  Tx,
} from '@aztec/aztec.js';
import type { PrivateExecutionResult, EventMetadataDefinition } from '@aztec/circuit-types';
import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';
import { Point } from '@aztec/circuits.js';
import type { AztecWalletMethodMap } from '../types.js';
import { aztecWalletHandler } from './aztecAccountWallet.js';
import { AztecWalletError } from '../errors.js';
import type { AztecWalletContext } from '../types.js';

describe('Aztec Account Wallet Handler', () => {
  let context: AztecWalletContext;
  let wallet: AccountWallet;

  beforeEach(() => {
    // Mock wallet with common methods
    wallet = {
      getBlock: vi.fn(),
      getBlockNumber: vi.fn(),
      getChainId: vi.fn(),
      getVersion: vi.fn(),
      getNodeInfo: vi.fn(),
      getCurrentBaseFees: vi.fn(),
      setScopes: vi.fn(),
      getScopes: vi.fn(),
      addCapsule: vi.fn(),
      getAddress: vi.fn(),
      getCompleteAddress: vi.fn(),
      registerAccount: vi.fn(),
      getRegisteredAccounts: vi.fn(),
      registerSender: vi.fn(),
      getSenders: vi.fn(),
      removeSender: vi.fn(),
      addAuthWitness: vi.fn(),
      getAuthWitness: vi.fn(),
      createAuthWit: vi.fn(),
      isL1ToL2MessageSynced: vi.fn(),
      getContracts: vi.fn(),
      getContractInstance: vi.fn(),
      getContractClass: vi.fn(),
      getContractArtifact: vi.fn(),
      isContractClassPubliclyRegistered: vi.fn(),
      isContractPubliclyDeployed: vi.fn(),
      isContractInitialized: vi.fn(),
      registerContract: vi.fn(),
      registerContractClass: vi.fn(),
      getPublicStorageAt: vi.fn(),
      createTxExecutionRequest: vi.fn(),
      proveTx: vi.fn(),
      sendTx: vi.fn(),
      getTxEffect: vi.fn(),
      getTxReceipt: vi.fn(),
      simulateTx: vi.fn(),
      simulateUnconstrained: vi.fn(),
      getNotes: vi.fn(),
      addNote: vi.fn(),
      addNullifiedNote: vi.fn(),
      getPublicLogs: vi.fn(),
      getContractClassLogs: vi.fn(),
      getPrivateEvents: vi.fn(),
      getPublicEvents: vi.fn(),
      getL1ToL2MembershipWitness: vi.fn(),
    } as unknown as AccountWallet;

    context = { wallet } as AztecWalletContext;
  });

  describe('Chain Methods', () => {
    it('handles aztec_getBlock', async () => {
      const mockBlock = { number: 1, hash: '0x123' };
      wallet.getBlock = vi.fn().mockResolvedValue(mockBlock);

      const result = await aztecWalletHandler(context, 'aztec_getBlock', { number: 1 });
      expect(result).toEqual(mockBlock);
      expect(wallet.getBlock).toHaveBeenCalledWith(1);
    });

    it('throws error when block not found', async () => {
      wallet.getBlock = vi.fn().mockResolvedValue(null);

      await expect(aztecWalletHandler(context, 'aztec_getBlock', { number: 1 })).rejects.toThrow(
        AztecWalletError,
      );
    });

    it('handles aztec_getBlockNumber', async () => {
      const mockBlockNumber = 100;
      wallet.getBlockNumber = vi.fn().mockResolvedValue(mockBlockNumber);

      const result = await aztecWalletHandler(context, 'aztec_getBlockNumber', {});
      expect(result).toBe(mockBlockNumber);
    });

    it('handles aztec_getChainId', async () => {
      wallet.getChainId = vi.fn().mockReturnValue(BigInt(1));

      const result = await aztecWalletHandler(context, 'aztec_getChainId', {});
      expect(result).toBe(1);
    });

    it('handles aztec_getVersion', async () => {
      wallet.getVersion = vi.fn().mockReturnValue(BigInt(1));

      const result = await aztecWalletHandler(context, 'aztec_getVersion', {});
      expect(result).toBe(1);
    });
  });

  describe('Scope Methods', () => {
    it('handles aztec_setScopes', async () => {
      const mockAddress = await AztecAddress.random();
      const scopes = [mockAddress];
      wallet.setScopes = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_setScopes', { scopes });
      expect(result).toBe(true);
      expect(wallet.setScopes).toHaveBeenCalledWith(scopes);
    });

    it('handles aztec_getScopes', async () => {
      const scopes = [await AztecAddress.random(), await AztecAddress.random()];
      wallet.getScopes = vi.fn().mockResolvedValue(scopes);

      const result = await aztecWalletHandler(context, 'aztec_getScopes', {});
      expect(result).toEqual(scopes);
    });

    it('handles aztec_getScopes with null response', async () => {
      wallet.getScopes = vi.fn().mockResolvedValue(null);

      const result = await aztecWalletHandler(context, 'aztec_getScopes', {});
      expect(result).toEqual([]);
    });
  });

  describe('Account Methods', () => {
    it('handles aztec_getAddress', async () => {
      const mockAddress = await AztecAddress.random();
      wallet.getAddress = vi.fn().mockReturnValue(mockAddress);

      const result = await aztecWalletHandler(context, 'aztec_getAddress', {});
      expect(result).toBe(mockAddress);
    });

    it('handles aztec_getCompleteAddress', async () => {
      const mockAddress = {
        address: await AztecAddress.random(),
        publicKey: await AztecAddress.random(),
      };
      wallet.getCompleteAddress = vi.fn().mockReturnValue(mockAddress);

      const result = await aztecWalletHandler(context, 'aztec_getCompleteAddress', {});
      expect(result).toBe(mockAddress);
    });

    it('handles aztec_registerAccount', async () => {
      const mockParams = { secretKey: new Fr(1), partialAddress: new Fr(2) };
      const mockResult = { address: AztecAddress.random() };
      wallet.registerAccount = vi.fn().mockResolvedValue(mockResult);

      const result = await aztecWalletHandler(context, 'aztec_registerAccount', mockParams);
      expect(result).toBe(mockResult);
      expect(wallet.registerAccount).toHaveBeenCalledWith(mockParams.secretKey, mockParams.partialAddress);
    });
  });

  describe('Node Info Methods', () => {
    it('handles aztec_getNodeInfo', async () => {
      const mockNodeInfo = { version: '1.0.0', status: 'running' };
      wallet.getNodeInfo = vi.fn().mockResolvedValue(mockNodeInfo);

      const result = await aztecWalletHandler(context, 'aztec_getNodeInfo', {});
      expect(result).toBe(mockNodeInfo);
    });

    it('handles aztec_getCurrentBaseFees', async () => {
      const mockFees = { baseFee: BigInt(1000) };
      wallet.getCurrentBaseFees = vi.fn().mockResolvedValue(mockFees);

      const result = await aztecWalletHandler(context, 'aztec_getCurrentBaseFees', {});
      expect(result).toBe(mockFees);
    });
  });

  describe('L1->L2 Message Methods', () => {
    it('handles aztec_isL1ToL2MessageSynced', async () => {
      const mockMessage = await Fr.random();
      wallet.isL1ToL2MessageSynced = vi.fn().mockResolvedValue(true);

      const result = await aztecWalletHandler(context, 'aztec_isL1ToL2MessageSynced', {
        l1ToL2Message: mockMessage,
      });
      expect(result).toBe(true);
    });

    it('handles aztec_getL1ToL2MembershipWitness', async () => {
      const mockParams = {
        contractAddress: await AztecAddress.random(),
        messageHash: await Fr.random(),
        secret: await Fr.random(),
      };
      const mockWitness = { witness: new Uint8Array([1, 2, 3]) };
      wallet.getL1ToL2MembershipWitness = vi.fn().mockResolvedValue(mockWitness);

      const result = await aztecWalletHandler(context, 'aztec_getL1ToL2MembershipWitness', mockParams);
      expect(result).toBe(mockWitness);
      expect(wallet.getL1ToL2MembershipWitness).toHaveBeenCalledWith(
        mockParams.contractAddress,
        mockParams.messageHash,
        mockParams.secret,
      );
    });
  });

  describe('Note Methods', () => {
    it('handles aztec_getNotes', async () => {
      const mockFilter = { contractAddress: await AztecAddress.random() };
      const mockNote = await ExtendedNote.random();
      const mockNotes = [mockNote];
      wallet.getNotes = vi.fn().mockResolvedValue(mockNotes);

      const result = await aztecWalletHandler(context, 'aztec_getNotes', { filter: mockFilter });
      expect(result).toBe(mockNotes);
      expect(wallet.getNotes).toHaveBeenCalledWith(mockFilter);
    });

    it('handles aztec_addNote', async () => {
      const mockNote = await ExtendedNote.random();
      wallet.addNote = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_addNote', { note: mockNote });
      expect(result).toBe(true);
      expect(wallet.addNote).toHaveBeenCalledWith(mockNote);
    });

    it('handles aztec_addNullifiedNote', async () => {
      const mockNote = await ExtendedNote.random();
      Object.assign(mockNote, { nullified: true });
      wallet.addNullifiedNote = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_addNullifiedNote', { note: mockNote });
      expect(result).toBe(true);
      expect(wallet.addNullifiedNote).toHaveBeenCalledWith(mockNote);
    });
  });

  describe('Contract Methods', () => {
    it('handles aztec_getContractInstance', async () => {
      const mockAddress = await AztecAddress.random();
      const mockInstance = {
        address: mockAddress,
        toString: () => mockAddress.toString(),
      } as unknown as ContractInstanceWithAddress;
      wallet.getContractInstance = vi.fn().mockResolvedValue(mockInstance);

      const result = await aztecWalletHandler(context, 'aztec_getContractInstance', { address: mockAddress });
      expect(result).toBe(mockInstance);
    });

    it('throws error when contract instance not found', async () => {
      wallet.getContractInstance = vi.fn().mockResolvedValue(null);

      const testAddress = await AztecAddress.random();
      await expect(
        aztecWalletHandler(context, 'aztec_getContractInstance', { address: testAddress }),
      ).rejects.toThrow(AztecWalletError);
    });

    it('handles aztec_getContractClass', async () => {
      const mockId = await Fr.random();
      const mockContractClass = { id: mockId };
      wallet.getContractClass = vi.fn().mockResolvedValue(mockContractClass);

      const result = await aztecWalletHandler(context, 'aztec_getContractClass', { id: mockId });
      expect(result).toBe(mockContractClass);
    });

    it('throws error when contract class not found', async () => {
      wallet.getContractClass = vi.fn().mockResolvedValue(null);
      const mockId = await Fr.random();

      await expect(aztecWalletHandler(context, 'aztec_getContractClass', { id: mockId })).rejects.toThrow(
        AztecWalletError,
      );
    });

    it('handles aztec_getContractArtifact', async () => {
      const mockId = await Fr.random();
      const mockArtifact = { id: mockId, name: 'TestContract' };
      wallet.getContractArtifact = vi.fn().mockResolvedValue(mockArtifact);

      const result = await aztecWalletHandler(context, 'aztec_getContractArtifact', { id: mockId });
      expect(result).toBe(mockArtifact);
    });

    it('throws error when contract artifact not found', async () => {
      wallet.getContractArtifact = vi.fn().mockResolvedValue(null);
      const mockId = await Fr.random();

      await expect(aztecWalletHandler(context, 'aztec_getContractArtifact', { id: mockId })).rejects.toThrow(
        AztecWalletError,
      );
    });

    it('handles aztec_isContractClassPubliclyRegistered', async () => {
      const mockId = await Fr.random();
      wallet.isContractClassPubliclyRegistered = vi.fn().mockResolvedValue(true);

      const result = await aztecWalletHandler(context, 'aztec_isContractClassPubliclyRegistered', {
        id: mockId,
      });
      expect(result).toBe(true);
    });

    it('handles aztec_isContractPubliclyDeployed', async () => {
      const mockAddress = await AztecAddress.random();
      wallet.isContractPubliclyDeployed = vi.fn().mockResolvedValue(true);

      const result = await aztecWalletHandler(context, 'aztec_isContractPubliclyDeployed', {
        address: mockAddress,
      });
      expect(result).toBe(true);
    });

    it('handles aztec_isContractInitialized', async () => {
      const mockAddress = await AztecAddress.random();
      wallet.isContractInitialized = vi.fn().mockResolvedValue(true);

      const result = await aztecWalletHandler(context, 'aztec_isContractInitialized', {
        address: mockAddress,
      });
      expect(result).toBe(true);
    });

    it('handles aztec_registerContract', async () => {
      const mockAddress = await AztecAddress.random();
      const mockPublicKeys = {
        masterNullifierPublicKey: new Fr(1),
        masterIncomingViewingPublicKey: new Fr(2),
        masterOutgoingViewingPublicKey: new Fr(3),
        masterTaggingPublicKey: new Fr(4),
        masterClaimingPublicKey: new Fr(5),
        masterNoteHashingPublicKey: new Fr(6),
        masterNoteCommitmentPublicKey: new Fr(7),
        masterNullifierGeneratorPublicKey: new Fr(8),
        masterTaggingGeneratorPublicKey: new Fr(9),
        masterClaimingGeneratorPublicKey: new Fr(10),
        hash: () => new Fr(11),
        isEmpty: () => false,
        equals: () => false,
        toBuffer: () => new Uint8Array(),
        toString: () => 'mockPublicKeys',
        toJSON: () => ({}),
      } as unknown as PublicKeys;

      const mockInstance = {
        address: mockAddress,
        version: 1,
        salt: new Fr(2),
        deployer: mockAddress,
        contractClassId: new Fr(3),
        initializationHash: new Fr(4),
        publicKeys: mockPublicKeys,
      } as unknown as ContractInstanceWithAddress;

      const mockArtifact = {
        name: 'TestContract',
        functions: {
          test: {
            name: 'test',
            parameters: [],
          },
        },
        outputs: {
          structs: {},
          globals: {},
        },
        storageLayout: {
          structs: {},
          globals: {},
        },
        notes: {},
        fileMap: {},
      } as unknown as ContractArtifact;
      const mockParams = {
        instance: mockInstance,
        artifact: mockArtifact,
      };
      wallet.registerContract = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_registerContract', mockParams);
      expect(result).toBe(true);
      expect(wallet.registerContract).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('Log Methods', () => {
    it('handles aztec_getPublicLogs', async () => {
      const mockFilter = { contractAddress: await AztecAddress.random() };
      const mockLogs = [{ data: new Uint8Array([1, 2, 3]) }];
      wallet.getPublicLogs = vi.fn().mockResolvedValue(mockLogs);

      const result = await aztecWalletHandler(context, 'aztec_getPublicLogs', { filter: mockFilter });
      expect(result).toBe(mockLogs);
      expect(wallet.getPublicLogs).toHaveBeenCalledWith(mockFilter);
    });

    it('handles aztec_getContractClassLogs', async () => {
      const mockFilter = { contractAddress: await AztecAddress.random() };
      const mockLogs = [{ data: new Uint8Array([1, 2, 3]) }];
      wallet.getContractClassLogs = vi.fn().mockResolvedValue(mockLogs);

      const result = await aztecWalletHandler(context, 'aztec_getContractClassLogs', { filter: mockFilter });
      expect(result).toBe(mockLogs);
    });

    it('handles aztec_getPrivateEvents', async () => {
      const mockEvent = {
        name: 'TestEvent',
        parameters: [{ name: 'value', type: 'field' }],
        returnType: { type: 'struct', items: [{ name: 'value', type: 'field' }] },
        eventSelector: await EventSelector.random(),
        abiType: 'event',
        fieldNames: ['value'],
      } as unknown as EventMetadataDefinition;
      const mockParams = {
        event: mockEvent,
        from: 0,
        limit: 10,
        vpks: [await Point.random()],
      };
      const mockEvents = [{ data: new Uint8Array([1, 2, 3]) }];
      wallet.getPrivateEvents = vi.fn().mockResolvedValue(mockEvents);

      const result = await aztecWalletHandler(context, 'aztec_getPrivateEvents', mockParams);
      expect(result).toBe(mockEvents);
      expect(wallet.getPrivateEvents).toHaveBeenCalledWith(
        mockParams.event,
        mockParams.from,
        mockParams.limit,
        mockParams.vpks,
      );
    });

    it('handles aztec_getPublicEvents', async () => {
      const mockEvent = {
        name: 'TestEvent',
        parameters: [{ name: 'value', type: 'field' }],
        returnType: { type: 'struct', items: [{ name: 'value', type: 'field' }] },
        eventSelector: await EventSelector.random(),
        abiType: 'event',
        fieldNames: ['value'],
      } as unknown as EventMetadataDefinition;
      const mockParams = {
        event: mockEvent,
        from: 0,
        limit: 10,
      };
      const mockEvents = [{ data: new Uint8Array([1, 2, 3]) }];
      wallet.getPublicEvents = vi.fn().mockResolvedValue(mockEvents);

      const result = await aztecWalletHandler(context, 'aztec_getPublicEvents', mockParams);
      expect(result).toBe(mockEvents);
      expect(wallet.getPublicEvents).toHaveBeenCalledWith(
        mockParams.event,
        mockParams.from,
        mockParams.limit,
      );
    });
  });

  describe('Transaction Methods', () => {
    it('handles aztec_getTxReceipt', async () => {
      const mockTxHash = await TxHash.random();
      const mockReceipt = { status: 1 };
      wallet.getTxReceipt = vi.fn().mockResolvedValue(mockReceipt);

      const result = await aztecWalletHandler(context, 'aztec_getTxReceipt', { txHash: mockTxHash });
      expect(result).toBe(mockReceipt);
    });

    it('throws error when transaction receipt not found', async () => {
      wallet.getTxReceipt = vi.fn().mockResolvedValue(null);

      const mockTxHash = await TxHash.random();
      await expect(aztecWalletHandler(context, 'aztec_getTxReceipt', { txHash: mockTxHash })).rejects.toThrow(
        AztecWalletError,
      );
    });

    it('handles aztec_simulateTx', async () => {
      const mockParams = {
        txRequest: {
          origin: await AztecAddress.random(),
          functionSelector: new Fr(1),
          firstCallArgsHash: new Fr(2),
          txContext: {
            chainId: 1,
            version: 1,
            protocolVersion: 1,
            excessFeeReceiver: await AztecAddress.random(),
          },
          callData: new Uint8Array(),
          gasLimit: 1000000n,
          gasPrice: 1000000n,
          storageContractAddress: await AztecAddress.random(),
          portalContract: await AztecAddress.random(),
          argsOfCalls: [],
          authWitnesses: [],
          toTxRequest: () => ({ id: '0x123' }),
          toBuffer: () => new Uint8Array(),
        } as unknown as TxExecutionRequest,
        simulatePublic: true,
        msgSender: await AztecAddress.random(),
        skipTxValidation: false,
        enforceFeePayment: true,
        profile: true,
      };
      const mockResult = { success: true };
      wallet.simulateTx = vi.fn().mockResolvedValue(mockResult);

      const result = await aztecWalletHandler(context, 'aztec_simulateTx', mockParams);
      expect(result).toBe(mockResult);
      expect(wallet.simulateTx).toHaveBeenCalledWith(
        mockParams.txRequest,
        mockParams.simulatePublic,
        mockParams.msgSender,
        mockParams.skipTxValidation,
        mockParams.enforceFeePayment,
        mockParams.profile,
      );
    });
  });

  describe('Capsule Methods', () => {
    it('handles aztec_addCapsule', async () => {
      const mockCapsule = [await Fr.random(), await Fr.random(), await Fr.random()];
      wallet.addCapsule = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_addCapsule', { capsule: mockCapsule });
      expect(result).toBe(true);
      expect(wallet.addCapsule).toHaveBeenCalledWith(mockCapsule);
    });
  });

  describe('Auth Witness Methods', () => {
    it('handles aztec_addAuthWitness', async () => {
      const mockAuthWitness = {
        requestHash: await Fr.random(),
        witness: new Uint8Array([1, 2, 3]),
        toJSON: () => ({}),
        toBuffer: () => new Uint8Array([1, 2, 3]),
      } as unknown as AuthWitness;
      wallet.addAuthWitness = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_addAuthWitness', {
        authWitness: mockAuthWitness,
      });
      expect(result).toBe(true);
      expect(wallet.addAuthWitness).toHaveBeenCalledWith(mockAuthWitness);
    });

    it('handles aztec_createAuthWit', async () => {
      const mockIntent = (await Fr.random()) as unknown as IntentAction | IntentInnerHash;
      const mockAuthWit = { witness: new Uint8Array([4, 5, 6]) };
      wallet.createAuthWit = vi.fn().mockResolvedValue(mockAuthWit);

      const result = await aztecWalletHandler(context, 'aztec_createAuthWit', { intent: mockIntent });
      expect(result).toBe(mockAuthWit);
      expect(wallet.createAuthWit).toHaveBeenCalledWith(mockIntent);
    });
  });

  describe('Sender Methods', () => {
    it('handles aztec_registerSender', async () => {
      const mockSender = await AztecAddress.random();
      const mockResult = { success: true };
      wallet.registerSender = vi.fn().mockResolvedValue(mockResult);

      const result = await aztecWalletHandler(context, 'aztec_registerSender', { sender: mockSender });
      expect(result).toBe(mockResult);
      expect(wallet.registerSender).toHaveBeenCalledWith(mockSender);
    });

    it('handles aztec_removeSender', async () => {
      const mockSender = await AztecAddress.random();
      wallet.removeSender = vi.fn().mockResolvedValue(undefined);

      const result = await aztecWalletHandler(context, 'aztec_removeSender', { sender: mockSender });
      expect(result).toBe(true);
      expect(wallet.removeSender).toHaveBeenCalledWith(mockSender);
    });
  });

  describe('Transaction Methods', () => {
    it('handles aztec_proveTx', async () => {
      const mockTxRequest = {
        origin: await AztecAddress.random(),
        functionSelector: new Fr(1),
        firstCallArgsHash: new Fr(2),
        txContext: {
          chainId: 1,
          version: 1,
          protocolVersion: 1,
          excessFeeReceiver: await AztecAddress.random(),
        },
        callData: new Uint8Array(),
        gasLimit: 1000000n,
        gasPrice: 1000000n,
        storageContractAddress: await AztecAddress.random(),
        portalContract: await AztecAddress.random(),
        argsOfCalls: [],
        authWitnesses: [],
        toTxRequest: () => ({ id: '0x123' }),
        toBuffer: () => new Uint8Array(),
      } as unknown as TxExecutionRequest;
      const mockPrivateExecutionResult = {
        acir: new Uint8Array([1, 2, 3]),
        vk: new Uint8Array([4, 5, 6]),
        partialWitness: new Uint8Array([7, 8, 9]),
        publicInputs: [await Fr.random()],
        success: true,
        gasUsed: 1000n,
        returnValue: new Uint8Array(),
        unencryptedLogs: [],
        contractClassLogs: [],
        encryptedLogs: [],
        encryptedLogPreimages: [],
        encryptedLogKeys: [],
      } as unknown as PrivateExecutionResult;
      const mockProvenTx = { hash: await TxHash.random() };
      wallet.proveTx = vi.fn().mockResolvedValue(mockProvenTx);

      const result = await aztecWalletHandler(context, 'aztec_proveTx', {
        txRequest: mockTxRequest,
        privateExecutionResult: mockPrivateExecutionResult,
      });
      expect(result).toBe(mockProvenTx);
      expect(wallet.proveTx).toHaveBeenCalledWith(mockTxRequest, mockPrivateExecutionResult);
    });

    it('handles aztec_sendTx', async () => {
      const mockTx = {
        hash: await TxHash.random(),
        data: new Uint8Array([1, 2, 3]),
        clientIvcProof: new Uint8Array([4, 5, 6]),
        unencryptedLogs: [],
        contractClassLogs: [],
        encryptedLogs: [],
        encryptedLogPreimages: [],
        encryptedLogKeys: [],
        encryptedLogsSalt: await Fr.random(),
        encryptedLogsCommitment: await Fr.random(),
        encryptedLogsTreeIndex: 0,
        encryptedLogProofs: [],
        encryptedLogProofsTreeIndex: 0,
        encryptedLogProofsCommitment: await Fr.random(),
        encryptedLogProofsSalt: await Fr.random(),
        toBuffer: () => new Uint8Array(),
        toString: () => 'mockTx',
      } as unknown as Tx;
      const mockTxHash = await TxHash.random();
      wallet.sendTx = vi.fn().mockResolvedValue(mockTxHash);

      const result = await aztecWalletHandler(context, 'aztec_sendTx', { tx: mockTx });
      expect(result).toBe(mockTxHash);
      expect(wallet.sendTx).toHaveBeenCalledWith(mockTx);
    });

    it('handles aztec_getTxEffect', async () => {
      const mockTxHash = await TxHash.random();
      const mockEffect = { success: true };
      wallet.getTxEffect = vi.fn().mockResolvedValue(mockEffect);

      const result = await aztecWalletHandler(context, 'aztec_getTxEffect', { txHash: mockTxHash });
      expect(result).toBe(mockEffect);
      expect(wallet.getTxEffect).toHaveBeenCalledWith(mockTxHash);
    });

    it('throws error when transaction effect not found', async () => {
      wallet.getTxEffect = vi.fn().mockResolvedValue(null);

      const mockTxHash = await TxHash.random();
      await expect(aztecWalletHandler(context, 'aztec_getTxEffect', { txHash: mockTxHash })).rejects.toThrow(
        AztecWalletError,
      );
    });
  });

  describe('Public Storage Methods', () => {
    it('handles aztec_getPublicStorageAt', async () => {
      const mockContract = await AztecAddress.random();
      const mockStorageSlot = await Fr.random();
      const mockValue = await Fr.random();
      wallet.getPublicStorageAt = vi.fn().mockResolvedValue(mockValue);

      const result = await aztecWalletHandler(context, 'aztec_getPublicStorageAt', {
        contract: mockContract,
        storageSlot: mockStorageSlot,
      });
      expect(result).toBe(mockValue);
      expect(wallet.getPublicStorageAt).toHaveBeenCalledWith(mockContract, mockStorageSlot);
    });
  });

  describe('Error Handling', () => {
    it('throws error for unsupported method', async () => {
      await expect(
        aztecWalletHandler(context, 'not_a_real_method' as keyof AztecWalletMethodMap, {}),
      ).rejects.toThrow(AztecWalletError);
    });
  });
});
