import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Fr, getContractClassFromArtifact } from '@aztec/aztec.js';
import type {
  AztecAddress,
  TxExecutionRequest,
  ContractInstanceWithAddress,
  ContractClassWithId,
  ContractArtifact,
  ExtendedNote,
  TxHash,
  L2Block,
  Point,
  TxReceipt,
  Tx,
  CompleteAddress,
  PartialAddress,
  AuthWitness,
} from '@aztec/aztec.js';
import type {
  PrivateExecutionResult,
  TxProvingResult,
  TxSimulationResult,
  InBlock,
  TxEffect,
  EventMetadataDefinition,
  PXEInfo,
  NotesFilter,
  UniqueNote,
} from '@aztec/circuit-types';
import { randomDeployedContract } from '@aztec/circuit-types';

import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';
import type { GasFees } from '@aztec/circuits.js';
import { AztecRemoteWallet, createAztecRPCWallet } from './aztecRemoteWallet.js';
import type { AztecProvider } from './provider.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';

describe('AztecRemoteWallet', () => {
  let provider: AztecProvider;
  let wallet: AztecRemoteWallet;
  let mockChainBuilder: { call: ReturnType<typeof vi.fn>; execute: ReturnType<typeof vi.fn> };
  const chainId = 'aztec:testnet';
  const mockAddress = { toString: () => '0x1234' } as unknown as AztecAddress;
  const mockChainIdFr = Fr.fromString('1');
  const mockVersionFr = Fr.fromString('1');

  beforeEach(() => {
    // Mock provider and chain builder
    mockChainBuilder = {
      call: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    };
    provider = {
      chain: vi.fn().mockReturnValue(mockChainBuilder),
    } as unknown as AztecProvider;

    wallet = new AztecRemoteWallet(provider, chainId);
  });

  describe('core operations', () => {
    it('gets address', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockAddress);

      // First call should throw and trigger async load
      expect(() => wallet.getAddress()).toThrow('Address not yet available');

      // Wait for promise to resolve
      await new Promise(process.nextTick);

      // Second call should return cached value
      expect(wallet.getAddress()).toBe(mockAddress);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getAddress');
    });

    it('gets complete address', async () => {
      const mockCompleteAddress = { toString: () => '0x1234' } as unknown as CompleteAddress;
      mockChainBuilder.execute.mockResolvedValueOnce(mockCompleteAddress);

      expect(() => wallet.getCompleteAddress()).toThrow('Complete address not yet available');
      await new Promise(process.nextTick);
      expect(wallet.getCompleteAddress()).toBe(mockCompleteAddress);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getCompleteAddress');
    });

    it('gets chain ID', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockChainIdFr);

      expect(() => wallet.getChainId()).toThrow('Chain ID not yet available');
      await new Promise(process.nextTick);
      expect(wallet.getChainId()).toStrictEqual(mockChainIdFr);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getChainId');
    });

    it('gets version', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockVersionFr);

      expect(() => wallet.getVersion()).toThrow('Version not yet available');
      await new Promise(process.nextTick);
      expect(wallet.getVersion()).toStrictEqual(mockVersionFr);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getVersion');
    });

    it('gets scopes', async () => {
      const mockScopes = [mockAddress];
      mockChainBuilder.execute.mockResolvedValueOnce(mockScopes);

      expect(() => wallet.getScopes()).toThrow('Scopes not yet available');
      await new Promise(process.nextTick);
      expect(wallet.getScopes()).toBe(mockScopes);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getScopes');
    });

    it('gets scopes async', async () => {
      const mockScopes = [mockAddress];
      mockChainBuilder.execute.mockResolvedValueOnce(mockScopes);

      const result = await wallet.getScopesAsync();
      expect(result).toBe(mockScopes);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getScopes');
    });

    it('checks if L1 to L2 message is synced', async () => {
      const mockL1ToL2Message = Fr.fromString('1');
      const mockResult = true;
      mockChainBuilder.execute.mockResolvedValueOnce(mockResult);

      const result = await wallet.isL1ToL2MessageSynced(mockL1ToL2Message);
      expect(result).toBe(mockResult);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_isL1ToL2MessageSynced', {
        l1ToL2Message: mockL1ToL2Message,
      });
    });

    it('creates tx execution request', async () => {
      const mockExec = { someParam: 'value' } as unknown as ExecutionRequestInit;
      const mockRequest = { id: '123' } as unknown as TxExecutionRequest;
      mockChainBuilder.execute.mockResolvedValueOnce(mockRequest);

      const result = await wallet.createTxExecutionRequest(mockExec);
      expect(result).toBe(mockRequest);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_createTxExecutionRequest', {
        exec: mockExec,
      });
    });

    it('creates auth wit', async () => {
      const mockIntent = Fr.fromString('1');
      const mockAuthWitness = { witness: '0x1234' } as unknown as AuthWitness;
      mockChainBuilder.execute.mockResolvedValueOnce(mockAuthWitness);

      const result = await wallet.createAuthWit(mockIntent);
      expect(result).toBe(mockAuthWitness);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_createAuthWit', { intent: mockIntent });
    });

    it('sets scopes', async () => {
      const mockScopes = [mockAddress];
      const mockResult = true;
      mockChainBuilder.execute.mockResolvedValueOnce(mockResult);

      wallet.setScopes(mockScopes);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_setScopes', { scopes: mockScopes });
    });

    it('adds capsule', async () => {
      const mockCapsule = [Fr.fromString('1')];
      mockChainBuilder.execute.mockResolvedValueOnce(true);
      await wallet.addCapsule(mockCapsule);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_addCapsule', { capsule: mockCapsule });
    });

    it('registers account', async () => {
      const mockSecretKey = Fr.fromString('1');
      const mockPartialAddress = {} as PartialAddress;
      const mockCompleteAddress = {} as CompleteAddress;
      mockChainBuilder.execute.mockResolvedValueOnce(mockCompleteAddress);

      const result = await wallet.registerAccount(mockSecretKey, mockPartialAddress);
      expect(result).toBe(mockCompleteAddress);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_registerAccount', {
        secretKey: mockSecretKey,
        partialAddress: mockPartialAddress,
      });
    });

    it('gets registered accounts', async () => {
      const mockAccounts = [{} as CompleteAddress];
      mockChainBuilder.execute.mockResolvedValueOnce(mockAccounts);

      const result = await wallet.getRegisteredAccounts();
      expect(result).toBe(mockAccounts);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getRegisteredAccounts');
    });
  });

  describe('contract operations', () => {
    let mockContract: { instance: ContractInstanceWithAddress; artifact: ContractArtifact };
    let contractClass: ContractClassWithId;

    beforeEach(async () => {
      mockContract = await randomDeployedContract();
      contractClass = await getContractClassFromArtifact(mockContract.artifact);
    });

    it('registers contract', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(true);
      await wallet.registerContract({ instance: mockContract.instance, artifact: mockContract.artifact });
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_registerContract', {
        instance: mockContract.instance,
        artifact: mockContract.artifact,
      });
    });

    it('registers contract class', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(true);
      await wallet.registerContractClass(mockContract.artifact);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_registerContractClass', {
        artifact: mockContract.artifact,
      });
    });

    it('gets contracts', async () => {
      const mockContracts = [mockContract.instance.address];
      mockChainBuilder.execute.mockResolvedValueOnce(mockContracts);

      const result = await wallet.getContracts();
      expect(result).toBe(mockContracts);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getContracts');
    });

    it('gets contract metadata', async () => {
      const mockMetadata = { contractInstance: mockContract.instance };
      mockChainBuilder.execute.mockResolvedValueOnce(mockMetadata);

      const result = await wallet.getContractMetadata(mockContract.instance.address);
      expect(result).toBe(mockMetadata);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getContractMetadata', {
        address: mockContract.instance.address,
      });
    });

    it('gets contract class metadata', async () => {
      const mockMetadata = { artifact: mockContract.artifact };
      mockChainBuilder.execute.mockResolvedValueOnce(mockMetadata);

      const result = await wallet.getContractClassMetadata(contractClass.id);
      expect(result).toBe(mockMetadata);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getContractClassMetadata', {
        id: contractClass.id,
      });
    });
  });

  describe('auth witness operations', () => {
    const mockAuthWitness = { witness: '0x1234' } as unknown as AuthWitness;
    const mockMessageHash = Fr.fromString('1');

    it('adds auth witness', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(true);
      await wallet.addAuthWitness(mockAuthWitness);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_addAuthWitness', {
        authWitness: mockAuthWitness,
      });
    });

    it('gets auth witness', async () => {
      const mockWitness = [Fr.fromString('1')];
      mockChainBuilder.execute.mockResolvedValueOnce(mockWitness);
      const result = await wallet.getAuthWitness(mockMessageHash);
      expect(result).toBe(mockWitness);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getAuthWitness', {
        messageHash: mockMessageHash,
      });
    });
  });

  describe('transaction operations', () => {
    const mockTxRequest = {} as TxExecutionRequest;
    const mockPrivateExecutionResult = {} as PrivateExecutionResult;
    const mockTxHash = {} as TxHash;
    const mockTx = {} as Tx;
    const mockTxEffect = {} as InBlock<TxEffect>;
    const mockTxReceipt = {} as TxReceipt;
    const mockSimulationResult = {} as TxSimulationResult;
    const mockProvingResult = {} as TxProvingResult;

    it('simulates tx', async () => {
      const mockScopes = [mockAddress];
      mockChainBuilder.execute.mockResolvedValueOnce(mockScopes).mockResolvedValueOnce(mockSimulationResult);

      await wallet.simulateTx(mockTxRequest, true);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_simulateTx', {
        txRequest: mockTxRequest,
        simulatePublic: true,
        msgSender: undefined,
        skipTxValidation: undefined,
        enforceFeePayment: undefined,
        profile: undefined,
      });
    });

    it('proves tx', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockProvingResult);

      const result = await wallet.proveTx(mockTxRequest, mockPrivateExecutionResult);
      expect(result).toBe(mockProvingResult);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_proveTx', {
        txRequest: mockTxRequest,
        privateExecutionResult: mockPrivateExecutionResult,
      });
    });

    it('sends tx', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockTxHash);

      const result = await wallet.sendTx(mockTx);
      expect(result).toBe(mockTxHash);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_sendTx', { tx: mockTx });
    });

    it('gets tx effect', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockTxEffect);

      const result = await wallet.getTxEffect(mockTxHash);
      expect(result).toBe(mockTxEffect);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getTxEffect', { txHash: mockTxHash });
    });

    it('gets tx receipt', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockTxReceipt);

      const result = await wallet.getTxReceipt(mockTxHash);
      expect(result).toBe(mockTxReceipt);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getTxReceipt', { txHash: mockTxHash });
    });
  });

  describe('storage and block operations', () => {
    const mockStorageSlot = Fr.fromString('1');
    const mockStorageValue = Fr.fromString('2');
    const mockBlock = {} as L2Block;
    const mockGasFees = {} as GasFees;
    const mockBlockNumber = 123;

    it('gets public storage at', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockStorageValue);

      const result = await wallet.getPublicStorageAt(mockAddress, mockStorageSlot);
      expect(result).toBe(mockStorageValue);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getPublicStorageAt', {
        contract: mockAddress,
        storageSlot: mockStorageSlot,
      });
    });

    it('gets block', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockBlock);

      const result = await wallet.getBlock(mockBlockNumber);
      expect(result).toBe(mockBlock);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getBlock', { number: mockBlockNumber });
    });

    it('gets current base fees', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockGasFees);

      const result = await wallet.getCurrentBaseFees();
      expect(result).toBe(mockGasFees);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getCurrentBaseFees');
    });

    it('gets block number', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockBlockNumber);

      const result = await wallet.getBlockNumber();
      expect(result).toBe(mockBlockNumber);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getBlockNumber');
    });

    it('gets proven block number', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(mockBlockNumber);

      const result = await wallet.getProvenBlockNumber();
      expect(result).toBe(mockBlockNumber);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getProvenBlockNumber');
    });
  });

  describe('PXE operations', () => {
    it('gets PXE info', async () => {
      const mockInfo = { version: '1.0.0' } as unknown as PXEInfo;
      mockChainBuilder.execute.mockResolvedValueOnce(mockInfo);
      const result = await wallet.getPXEInfo();
      expect(result).toBe(mockInfo);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getPXEInfo');
    });
  });

  describe('note operations', () => {
    const mockNote = {} as ExtendedNote;
    const mockFilter = {} as NotesFilter;

    it('adds note', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(true);
      await wallet.addNote(mockNote);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_addNote', { note: mockNote });
    });

    it('adds nullified note', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(true);
      await wallet.addNullifiedNote(mockNote);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_addNullifiedNote', { note: mockNote });
    });

    it('gets notes', async () => {
      const mockNotes = [{}] as UniqueNote[];
      mockChainBuilder.execute.mockResolvedValueOnce(mockNotes);
      const result = await wallet.getNotes(mockFilter);
      expect(result).toBe(mockNotes);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getNotes', { filter: mockFilter });
    });
  });

  describe('event operations', () => {
    const mockEvent = {
      eventSelector: Fr.fromString('1') as unknown as Fr & { _branding: 'EventSelector' },
      abiType: 'array',
      fieldNames: ['field1', 'field2'],
    } as unknown as EventMetadataDefinition;
    const mockVpks = [{}] as Point[];
    const mockCompleteAddress = { publicKeys: { masterIncomingViewingPublicKey: {} } } as CompleteAddress;

    it('gets private events with default vpks', async () => {
      const mockEvents = [{ data: '0x1234' }];
      mockChainBuilder.execute.mockResolvedValueOnce(mockCompleteAddress).mockResolvedValueOnce(mockEvents);

      // Initialize complete address
      try {
        wallet.getCompleteAddress();
      } catch (e) {
        // Expected error
      }

      // Wait for promise to resolve
      await new Promise(process.nextTick);

      const result = await wallet.getPrivateEvents(mockEvent, 0, 10);
      expect(result).toBe(mockEvents);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getPrivateEvents', {
        event: mockEvent,
        from: 0,
        limit: 10,
        vpks: [mockCompleteAddress.publicKeys.masterIncomingViewingPublicKey],
      });
    });

    it('gets private events with custom vpks', async () => {
      const mockEvents = [{ data: '0x1234' }];
      mockChainBuilder.execute.mockResolvedValueOnce(mockCompleteAddress).mockResolvedValueOnce(mockEvents);

      // Initialize complete address
      try {
        wallet.getCompleteAddress();
      } catch (e) {
        // Expected error
      }

      // Wait for promise to resolve
      await new Promise(process.nextTick);

      const result = await wallet.getPrivateEvents(mockEvent, 0, 10, mockVpks);
      expect(result).toBe(mockEvents);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getPrivateEvents', {
        event: mockEvent,
        from: 0,
        limit: 10,
        vpks: mockVpks,
      });
    });

    it('gets public events', async () => {
      const mockEvents = [{ data: '0x1234' }];
      mockChainBuilder.execute.mockResolvedValueOnce(mockEvents);
      const result = await wallet.getPublicEvents(mockEvent, 0, 10);
      expect(result).toBe(mockEvents);
      expect(mockChainBuilder.call).toHaveBeenCalledWith('aztec_getPublicEvents', {
        event: mockEvent,
        from: 0,
        limit: 10,
      });
    });
  });
});

describe('createAztecRPCWallet', () => {
  it('creates wallet instance with transport and chain ID', () => {
    const transport = {} as JSONRPCTransport;
    const chainId = 'aztec:testnet';

    const wallet = createAztecRPCWallet(transport, chainId);

    expect(wallet).toBeInstanceOf(AztecRemoteWallet);
  });
});
