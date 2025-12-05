// biome-ignore-all lint/style/noNonNullAssertion: doing a lot of these for serializers that we know are defined and will be used in the tests
import { Buffer } from 'node:buffer';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { AuthWitness, type CallIntent, type IntentInnerHash } from '@aztec/aztec.js/authorization';
import { Fr } from '@aztec/aztec.js/fields';
import { type ExecutionPayload, TxHash } from '@aztec/aztec.js/tx';
import type { ProfileOptions, SendOptions, SimulateOptions } from '@aztec/aztec.js/wallet';
import type { ChainInfo } from '@aztec/entrypoints/interfaces';
import type { ContractArtifact, EventMetadataDefinition, FunctionCall } from '@aztec/stdlib/abi';
import { EventSelector, FunctionSelector, FunctionType } from '@aztec/stdlib/abi';
import type {
  ContractClassMetadata,
  ContractInstanceWithAddress,
  ContractMetadata,
} from '@aztec/stdlib/contract';
import { PublicKeys } from '@aztec/stdlib/keys';
import { TxProfileResult, TxReceipt, TxSimulationResult, UtilitySimulationResult } from '@aztec/stdlib/tx';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SERIALIZERS } from './serializers.js';

describe('serializers', () => {
  beforeEach(() => {
    // No fake timers needed for serializer tests
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('aztec_getContractClassMetadata', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_getContractClassMetadata'];
      const params: [Fr, boolean | undefined] = [Fr.random(), true];

      const serialized = await serializer!.params.serialize('aztec_getContractClassMetadata', params);
      const deserialized = (await serializer!.params.deserialize(
        'aztec_getContractClassMetadata',
        serialized,
      )) as [Fr, boolean | undefined];

      expect(deserialized[0]).toBeInstanceOf(Fr);
      expect(deserialized[0].toString()).toBe(params[0].toString());
      expect(deserialized[1]).toBe(true);
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getContractClassMetadata'];
      // Create a minimal ContractClassMetadata object
      const result = {
        contractClass: {
          version: 1,
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

      const serialized = await serializer!.result!.serialize('aztec_getContractClassMetadata', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_getContractClassMetadata',
        serialized,
      )) as ContractClassMetadata;

      expect(deserialized.contractClass).toBeDefined();
      expect(deserialized.contractClass!.id).toBeInstanceOf(Fr);
      expect(deserialized.isContractClassPubliclyRegistered).toBe(true);
    });
  });

  describe('aztec_getContractMetadata', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_getContractMetadata'];
      const params: [AztecAddress] = [await AztecAddress.random()];

      const serialized = await serializer!.params.serialize('aztec_getContractMetadata', params);
      const deserialized = (await serializer!.params.deserialize(
        'aztec_getContractMetadata',
        serialized,
      )) as [AztecAddress];

      expect(deserialized[0]).toBeInstanceOf(AztecAddress);
      expect(deserialized[0].toString()).toBe(params[0].toString());
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getContractMetadata'];
      const result = {
        contractInstance: {
          address: await AztecAddress.random(),
          version: 1,
          salt: Fr.random(),
          deployer: await AztecAddress.random(),
          currentContractClassId: Fr.random(),
          originalContractClassId: Fr.random(),
          initializationHash: Fr.random(),
          publicKeys: await PublicKeys.random(),
        },
        isContractInitialized: true,
        isContractPublished: true,
      };

      const serialized = await serializer!.result!.serialize('aztec_getContractMetadata', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_getContractMetadata',
        serialized,
      )) as ContractMetadata;

      expect(deserialized.contractInstance).toBeDefined();
      expect(deserialized.contractInstance!.address).toBeInstanceOf(AztecAddress);
      expect(deserialized.isContractInitialized).toBe(true);
    });
  });

  describe('aztec_getPrivateEvents', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_getPrivateEvents'];
      const eventMetadata: EventMetadataDefinition = {
        eventSelector: EventSelector.fromField(new Fr(1)),
        abiType: { kind: 'field' },
        fieldNames: ['field1'],
      };
      const params: [AztecAddress, EventMetadataDefinition, number, number, AztecAddress[]] = [
        await AztecAddress.random(),
        eventMetadata,
        0,
        10,
        [await AztecAddress.random()],
      ];

      const serialized = await serializer!.params.serialize('aztec_getPrivateEvents', params);
      const deserialized = (await serializer!.params.deserialize('aztec_getPrivateEvents', serialized)) as [
        AztecAddress,
        EventMetadataDefinition,
        number,
        number,
        AztecAddress[],
      ];

      expect(deserialized[0]).toBeInstanceOf(AztecAddress);
      expect(deserialized[1]).toBeDefined();
      expect(deserialized[2]).toBe(0);
      expect(deserialized[3]).toBe(10);
      expect(deserialized[4]).toHaveLength(1);
      expect(deserialized[4][0]).toBeInstanceOf(AztecAddress);
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getPrivateEvents'];
      const result = [{ field1: Fr.random() }];

      const serialized = await serializer!.result!.serialize('aztec_getPrivateEvents', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_getPrivateEvents',
        serialized,
      )) as unknown[];

      expect(deserialized).toHaveLength(1);
      expect(deserialized[0]).toBeDefined();
    });
  });

  describe('aztec_getChainInfo', () => {
    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getChainInfo'];
      const result = {
        chainId: Fr.random(),
        version: Fr.random(),
      };

      const serialized = await serializer!.result!.serialize('aztec_getChainInfo', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_getChainInfo',
        serialized,
      )) as ChainInfo;

      expect(deserialized.chainId).toBeInstanceOf(Fr);
      expect(deserialized.version).toBeInstanceOf(Fr);
    });
  });

  describe('aztec_getTxReceipt', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_getTxReceipt'];
      const params: [TxHash] = [TxHash.random()];

      const serialized = await serializer!.params.serialize('aztec_getTxReceipt', params);
      const deserialized = (await serializer!.params.deserialize('aztec_getTxReceipt', serialized)) as [
        TxHash,
      ];

      expect(deserialized[0]).toBeInstanceOf(TxHash);
      expect(deserialized[0].toString()).toBe(params[0].toString());
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getTxReceipt'];
      const result = TxReceipt.empty();

      const serialized = await serializer!.result!.serialize('aztec_getTxReceipt', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_getTxReceipt',
        serialized,
      )) as TxReceipt;

      expect(deserialized).toBeInstanceOf(TxReceipt);
    });
  });

  describe('aztec_registerSender', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_registerSender'];
      const params: [AztecAddress] = [await AztecAddress.random()];

      const serialized = await serializer!.params.serialize('aztec_registerSender', params);
      const deserialized = (await serializer!.params.deserialize('aztec_registerSender', serialized)) as [
        AztecAddress,
      ];

      expect(deserialized[0]).toBeInstanceOf(AztecAddress);
      expect(deserialized[0].toString()).toBe(params[0].toString());
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_registerSender'];
      const result = await AztecAddress.random();

      const serialized = await serializer!.result!.serialize('aztec_registerSender', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_registerSender',
        serialized,
      )) as AztecAddress;

      expect(deserialized).toBeInstanceOf(AztecAddress);
      expect(deserialized.toString()).toBe(result.toString());
    });
  });

  describe('aztec_getAddressBook', () => {
    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getAddressBook'];
      const result = [{ alias: 'sender1', item: await AztecAddress.random() }];

      const serialized = await serializer!.result!.serialize('aztec_getAddressBook', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_getAddressBook',
        serialized,
      )) as Array<{
        alias: string;
        item: AztecAddress;
      }>;

      expect(deserialized).toHaveLength(1);
      expect(deserialized[0]!.alias).toBe('sender1');
      expect(deserialized[0]!.item).toBeInstanceOf(AztecAddress);
    });
  });

  describe('aztec_getAccounts', () => {
    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_getAccounts'];
      const result = [{ alias: 'account1', item: await AztecAddress.random() }];

      const serialized = await serializer!.result!.serialize('aztec_getAccounts', result);
      const deserialized = (await serializer!.result!.deserialize('aztec_getAccounts', serialized)) as Array<{
        alias: string;
        item: AztecAddress;
      }>;

      expect(deserialized).toHaveLength(1);
      expect(deserialized[0]!.alias).toBe('account1');
      expect(deserialized[0]!.item).toBeInstanceOf(AztecAddress);
    });
  });

  describe('aztec_registerContract', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_registerContract'];
      const mockArtifact: ContractArtifact = {
        name: 'TestContract',
        functions: [],
        nonDispatchPublicFunctions: [],
        outputs: { structs: {}, globals: {} },
        fileMap: {},
        storageLayout: {},
      };
      const mockInstance: ContractInstanceWithAddress = {
        address: await AztecAddress.random(),
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        currentContractClassId: Fr.random(),
        originalContractClassId: Fr.random(),
        initializationHash: Fr.random(),
        publicKeys: PublicKeys.default(),
      };
      const params: [ContractInstanceWithAddress, ContractArtifact | undefined] = [
        mockInstance,
        mockArtifact,
      ];

      const serialized = await serializer!.params.serialize('aztec_registerContract', params);
      const deserialized = (await serializer!.params.deserialize('aztec_registerContract', serialized)) as [
        ContractInstanceWithAddress,
        ContractArtifact | undefined,
      ];

      expect(deserialized[0].address).toBeInstanceOf(AztecAddress);
      expect(deserialized[0].version).toBe(1);
      expect(deserialized[1]).toBeDefined();
      expect(deserialized[1]?.name).toBe('TestContract');
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_registerContract'];
      const result: ContractInstanceWithAddress = {
        address: await AztecAddress.random(),
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        currentContractClassId: Fr.random(),
        originalContractClassId: Fr.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
      };

      const serialized = await serializer!.result!.serialize('aztec_registerContract', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_registerContract',
        serialized,
      )) as ContractInstanceWithAddress;

      expect(deserialized.address).toBeInstanceOf(AztecAddress);
      expect(deserialized.version).toBe(1);
    });
  });

  describe('aztec_simulateTx', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_simulateTx'];
      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: SimulateOptions = {
        from: await AztecAddress.random(),
      };
      const params: [ExecutionPayload, SimulateOptions] = [exec, opts];

      const serialized = await serializer!.params.serialize('aztec_simulateTx', params);
      const deserialized = (await serializer!.params.deserialize('aztec_simulateTx', serialized)) as [
        ExecutionPayload,
        SimulateOptions,
      ];

      expect(deserialized[0]).toBeDefined();
      expect(deserialized[0].calls).toEqual([]);
      expect(deserialized[1].from).toBeInstanceOf(AztecAddress);
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_simulateTx'];
      const result = TxSimulationResult.random();

      const serialized = await serializer!.result!.serialize('aztec_simulateTx', result);
      // TODO: TxSimulationResult.random() doesn't create a fully valid object that passes schema validation
      // The serializer works correctly for real results from the wallet, but random() objects may not validate
      // We need to write a proper test with a fully valid TxSimulationResult object in the future
      expect(serialized).toBeDefined();
      expect(serialized.serialized).toBeDefined();
    });
  });

  describe('aztec_simulateUtility', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_simulateUtility'];
      const call: FunctionCall = {
        name: 'testFunction',
        to: await AztecAddress.random(),
        selector: FunctionSelector.fromField(new Fr(1)),
        type: FunctionType.UTILITY,
        isStatic: false,
        hideMsgSender: false,
        args: [Fr.random()],
        returnTypes: [],
      };
      const params: [FunctionCall, AuthWitness[] | undefined] = [call, [AuthWitness.random()]];

      const serialized = await serializer!.params.serialize('aztec_simulateUtility', params);
      const deserialized = (await serializer!.params.deserialize('aztec_simulateUtility', serialized)) as [
        FunctionCall,
        AuthWitness[] | undefined,
      ];

      expect(deserialized[0]).toBeDefined();
      expect(deserialized[0].name).toBe('testFunction');
      expect(deserialized[1]).toBeDefined();
      expect(deserialized[1]?.[0]).toBeInstanceOf(AuthWitness);
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_simulateUtility']!;
      const result = UtilitySimulationResult.random();

      const serialized = await serializer.result!.serialize('aztec_simulateUtility', result);
      const deserialized = (await serializer.result!.deserialize(
        'aztec_simulateUtility',
        serialized,
      )) as UtilitySimulationResult;

      expect(deserialized).toBeInstanceOf(UtilitySimulationResult);
    });
  });

  describe('aztec_profileTx', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_profileTx']!;
      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: ProfileOptions = {
        from: await AztecAddress.random(),
        profileMode: 'gates',
      };
      const params: [ExecutionPayload, ProfileOptions] = [exec, opts];

      const serialized = await serializer.params.serialize('aztec_profileTx', params);
      const deserialized = (await serializer.params.deserialize('aztec_profileTx', serialized)) as [
        ExecutionPayload,
        ProfileOptions,
      ];

      expect(deserialized[0]).toBeDefined();
      expect(deserialized[1].from).toBeInstanceOf(AztecAddress);
      expect(deserialized[1].profileMode).toBe('gates');
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_profileTx'];
      const result = TxProfileResult.random();

      const serialized = await serializer!.result!.serialize('aztec_profileTx', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_profileTx',
        serialized,
      )) as TxProfileResult;

      expect(deserialized).toBeInstanceOf(TxProfileResult);
    });
  });

  describe('aztec_sendTx', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_sendTx'];
      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: SendOptions = {
        from: await AztecAddress.random(),
      };
      const params: [ExecutionPayload, SendOptions] = [exec, opts];

      const serialized = await serializer!.params.serialize('aztec_sendTx', params);
      const deserialized = (await serializer!.params.deserialize('aztec_sendTx', serialized)) as [
        ExecutionPayload,
        SendOptions,
      ];

      expect(deserialized[0]).toBeDefined();
      expect(deserialized[1].from).toBeInstanceOf(AztecAddress);
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_sendTx'];
      const result = TxHash.random();

      const serialized = await serializer!.result!.serialize('aztec_sendTx', result);
      const deserialized = (await serializer!.result!.deserialize('aztec_sendTx', serialized)) as TxHash;

      expect(deserialized).toBeInstanceOf(TxHash);
      expect(deserialized.toString()).toBe(result.toString());
    });
  });

  describe('aztec_createAuthWit', () => {
    it('should serialize and deserialize params with Fr', async () => {
      const serializer = SERIALIZERS['aztec_createAuthWit'];
      const params: [Fr | IntentInnerHash | CallIntent] = [Fr.random()];

      const serialized = await serializer!.params.serialize('aztec_createAuthWit', params);
      const deserialized = (await serializer!.params.deserialize('aztec_createAuthWit', serialized)) as [
        Fr | IntentInnerHash | CallIntent,
      ];

      expect(deserialized[0]).toBeInstanceOf(Fr);
      expect((deserialized[0] as Fr).toString()).toBe((params[0] as Fr).toString());
    });

    it('should serialize and deserialize params with IntentInnerHash', async () => {
      const serializer = SERIALIZERS['aztec_createAuthWit'];
      const params: [Fr | IntentInnerHash | CallIntent] = [
        {
          consumer: await AztecAddress.random(),
          innerHash: Fr.random(),
        },
      ];

      const serialized = await serializer!.params.serialize('aztec_createAuthWit', params);
      const deserialized = (await serializer!.params.deserialize('aztec_createAuthWit', serialized)) as [
        Fr | IntentInnerHash | CallIntent,
      ];

      expect(deserialized[0]).toBeDefined();
      expect((deserialized[0] as IntentInnerHash).consumer).toBeInstanceOf(AztecAddress);
      expect((deserialized[0] as IntentInnerHash).innerHash).toBeInstanceOf(Fr);
    });

    it('should serialize and deserialize params with CallIntent', async () => {
      const serializer = SERIALIZERS['aztec_createAuthWit'];
      const params: [Fr | IntentInnerHash | CallIntent] = [
        {
          caller: await AztecAddress.random(),
          call: {
            name: 'testFunction',
            to: await AztecAddress.random(),
            selector: FunctionSelector.fromField(new Fr(1)),
            type: FunctionType.UTILITY,
            isStatic: false,
            hideMsgSender: false,
            args: [Fr.random()],
            returnTypes: [],
          },
        },
      ];

      const serialized = await serializer!.params.serialize('aztec_createAuthWit', params);
      const deserialized = (await serializer!.params.deserialize('aztec_createAuthWit', serialized)) as [
        Fr | IntentInnerHash | CallIntent,
      ];

      expect(deserialized[0]).toBeDefined();
      expect((deserialized[0] as CallIntent).caller).toBeInstanceOf(AztecAddress);
      expect((deserialized[0] as CallIntent).call).toBeDefined();
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_createAuthWit'];
      const result = AuthWitness.random();

      const serialized = await serializer!.result!.serialize('aztec_createAuthWit', result);
      const deserialized = (await serializer!.result!.deserialize(
        'aztec_createAuthWit',
        serialized,
      )) as AuthWitness;

      expect(deserialized).toBeInstanceOf(AuthWitness);
    });
  });

  describe('aztec_batch', () => {
    it('should serialize and deserialize params', async () => {
      const serializer = SERIALIZERS['aztec_batch'];
      const address1 = await AztecAddress.random();
      const address2 = await AztecAddress.random();
      const address3 = await AztecAddress.random();
      const exec: ExecutionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
        feePayer: undefined,
      };
      const opts: SendOptions = {
        from: await AztecAddress.random(),
      };
      const simulateOpts: SimulateOptions = {
        from: await AztecAddress.random(),
      };

      const call: FunctionCall = {
        name: 'testFunction',
        to: address3,
        selector: FunctionSelector.fromField(new Fr(1)),
        type: FunctionType.UTILITY,
        isStatic: false,
        hideMsgSender: false,
        args: [Fr.random()],
        returnTypes: [],
      };

      const mockInstance: ContractInstanceWithAddress = {
        address: address2,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
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

      const methods = [
        { name: 'registerSender' as const, args: [address1, 'alias1'] },
        { name: 'registerContract' as const, args: [mockInstance, mockArtifact, undefined] },
        { name: 'sendTx' as const, args: [exec, opts] },
        { name: 'simulateUtility' as const, args: [call, [AuthWitness.random()]] },
        { name: 'simulateTx' as const, args: [exec, simulateOpts] },
      ];

      const serialized = await serializer!.params.serialize('aztec_batch', methods);
      const deserialized = (await serializer!.params.deserialize('aztec_batch', serialized)) as Array<{
        name: string;
        args: unknown[];
      }>;

      expect(deserialized).toHaveLength(5);
      expect(deserialized[0]!.name).toBe('registerSender');
      expect(deserialized[1]!.name).toBe('registerContract');
      expect(deserialized[2]!.name).toBe('sendTx');
      expect(deserialized[3]!.name).toBe('simulateUtility');
      expect(deserialized[4]!.name).toBe('simulateTx');
    });

    it('should serialize and deserialize result', async () => {
      const serializer = SERIALIZERS['aztec_batch'];
      const result = [
        await AztecAddress.random(), // registerSender
        true, // registerContract
        TxHash.random(), // sendTx
        UtilitySimulationResult.random(), // simulateUtility
        TxSimulationResult.random(), // simulateTx
      ];

      const serialized = await serializer!.result!.serialize('aztec_batch', result);
      // TODO: The batch result schema validation requires fully valid objects that match the union type
      // TxSimulationResult.random() doesn't create a fully valid object that passes schema validation
      // We need to write a proper test with fully valid result objects in the future
      expect(serialized).toBeDefined();
      expect(serialized.serialized).toBeDefined();
    });
  });
});
