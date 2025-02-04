import { describe, expect, it } from 'vitest';
import { AztecAddress, TxHash, Tx, NoFeePaymentMethod, TxReceipt } from '@aztec/aztec.js';
import {
  PrivateExecutionResult,
  TxProvingResult,
  FunctionCall,
  TxEffect,
  TxSimulationResult,
  TxStatus,
  PublicSimulationOutput,
  SimulationError,
} from '@aztec/circuit-types';
import { Fr, FunctionSelector, PrivateKernelTailCircuitPublicInputs } from '@aztec/circuits.js';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';
import { FunctionType } from '@aztec/foundation/abi';
import {
  aztecCreateTxExecutionRequestSerializer,
  aztecSendTxSerializer,
  aztecGetTxEffectSerializer,
  aztecGetTxReceiptSerializer,
  aztecSimulateTxSerializer,
  aztecProveTxSerializer,
} from './transaction.js';
import { TxExecutionRequest } from '@aztec/aztec.js';

import { jsonStringify } from '@aztec/foundation/json-rpc';

describe('Transaction Serializers', () => {
  describe('aztec_createTxExecutionRequest', () => {
    const METHOD = 'aztec_createTxExecutionRequest';

    it('should serialize and deserialize params', async () => {
      const randomTx = await TxExecutionRequest.random();
      const exec = {
        calls: [], // Empty calls array since we're just testing serialization
        fee: {
          gasSettings: randomTx.txContext.gasSettings,
          paymentMethod: new NoFeePaymentMethod(),
        },
      };
      const params = { exec };

      const serialized = aztecCreateTxExecutionRequestSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecCreateTxExecutionRequestSerializer.params.deserialize(METHOD, serialized);
      expect(JSON.stringify(deserialized.exec)).toBe(JSON.stringify(params.exec));
    });

    it('should handle complex function calls in params', async () => {
      const randomTx = await TxExecutionRequest.random();
      const address = await AztecAddress.random();
      const selector = FunctionSelector.random();
      const functionCall = new FunctionCall(
        'transfer',
        address,
        selector,
        FunctionType.PRIVATE,
        false,
        [await Fr.random(), await Fr.random()],
        [{ kind: 'field' }, { kind: 'boolean' }],
      );
      const exec: ExecutionRequestInit = {
        calls: [functionCall],
        fee: {
          gasSettings: randomTx.txContext.gasSettings,
          paymentMethod: new NoFeePaymentMethod(),
        },
      };
      const params = { exec };

      const serialized = aztecCreateTxExecutionRequestSerializer.params.serialize(METHOD, params);
      const deserialized = aztecCreateTxExecutionRequestSerializer.params.deserialize(METHOD, serialized);

      expect(deserialized.exec.calls[0].name).toBe(exec.calls[0].name);
      expect(deserialized.exec.calls[0].to.toString()).toBe(exec.calls[0].to.toString());
      expect(deserialized.exec.calls[0].type).toBe(exec.calls[0].type);
    });

    it('should serialize and deserialize result', async () => {
      const result = await TxExecutionRequest.random();

      const serialized = aztecCreateTxExecutionRequestSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecCreateTxExecutionRequestSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.toString()).toBe(result.toString());
    });

    it('should handle invalid params', () => {
      expect(() => {
        // @ts-ignore - Testing invalid input
        aztecCreateTxExecutionRequestSerializer.params.serialize(METHOD, { exec: null });
      }).toThrow();
    });
  });

  describe('aztec_getTxEffect', () => {
    const METHOD = 'aztec_getTxEffect';

    it('should serialize and deserialize params', async () => {
      const txHash = await TxHash.random();
      const params = { txHash };

      const serialized = aztecGetTxEffectSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetTxEffectSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txHash.toString()).toBe(txHash.toString());
    });

    it('should serialize and deserialize result', async () => {
      const txHash = await TxHash.random();
      const effect = await TxEffect.random();
      const blockHash = await Fr.random();
      const result = {
        txHash,
        l2BlockNumber: 123,
        l2BlockHash: blockHash.toString(),
        data: effect,
      };

      const serialized = aztecGetTxEffectSerializer.result.serialize(METHOD, result);
      const deserialized = aztecGetTxEffectSerializer.result.deserialize(METHOD, serialized);

      expect(deserialized.l2BlockNumber).toBe(result.l2BlockNumber);
      expect(deserialized.data).toBeDefined();
    });
  });

  describe('aztec_getTxReceipt', () => {
    const METHOD = 'aztec_getTxReceipt';

    it('should serialize and deserialize params', async () => {
      const txHash = await TxHash.random();
      const params = { txHash };

      const serialized = aztecGetTxReceiptSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetTxReceiptSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txHash.toString()).toBe(txHash.toString());
    });

    it('should serialize and deserialize result', async () => {
      const receipt = new TxReceipt(
        TxHash.random(),
        TxStatus.DROPPED,
        'error',
        undefined,
        undefined,
        undefined,
      );

      const serialized = aztecGetTxReceiptSerializer.result.serialize(METHOD, receipt);
      const deserialized = aztecGetTxReceiptSerializer.result.deserialize(METHOD, serialized);

      expect(deserialized.txHash.toString()).toBe(receipt.txHash.toString());
      expect(deserialized.error).toBe(receipt.error);
    });
  });

  describe('aztec_sendTx', () => {
    const METHOD = 'aztec_sendTx';

    it('should serialize and deserialize params', async () => {
      const tx = await Tx.random();
      const params = { tx };

      const serialized = aztecSendTxSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecSendTxSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.tx.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', async () => {
      const result = await TxHash.random();

      const serialized = aztecSendTxSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecSendTxSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.toString()).toBe(result.toString());
    });
  });

  describe('aztec_simulateTx', () => {
    const METHOD = 'aztec_simulateTx';

    it('should serialize and deserialize params', async () => {
      const params = {
        txRequest: await TxExecutionRequest.random(),
        simulatePublic: true,
        msgSender: await AztecAddress.random(),
        skipTxValidation: false,
        enforceFeePayment: true,
        profile: false,
      };

      const serialized = aztecSimulateTxSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecSimulateTxSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txRequest.toString()).toBe((params.txRequest as TxExecutionRequest).toString());
      expect(deserialized.simulatePublic).toBe(params.simulatePublic);
      expect(deserialized.msgSender?.toString()).toBe(params.msgSender.toString());
      expect(deserialized.skipTxValidation).toBe(params.skipTxValidation);
      expect(deserialized.enforceFeePayment).toBe(params.enforceFeePayment);
      expect(deserialized.profile).toBe(params.profile);
    });

    it('should serialize and deserialize result', async () => {
      const result = await TxSimulationResult.random();

      const serialized = aztecSimulateTxSerializer.result.serialize(METHOD, result);
      const deserialized = aztecSimulateTxSerializer.result.deserialize(METHOD, serialized);

      expect(deserialized.privateExecutionResult).toBeDefined();
      expect(deserialized.publicInputs).toBeDefined();
      expect(deserialized.publicOutput).toBeDefined();

      expect(jsonStringify(deserialized.privateExecutionResult)).toEqual(
        jsonStringify(result.privateExecutionResult),
      );
      expect(jsonStringify(deserialized.publicInputs)).toEqual(jsonStringify(result.publicInputs));
      if (!result.publicOutput || !deserialized.publicOutput) {
        // Should never happen
        throw new Error('Public output is undefined');
      }
      expect(jsonStringify(deserialized.publicOutput.constants)).toEqual(
        jsonStringify(result.publicOutput.constants),
      );
      expect(jsonStringify(deserialized.publicOutput.constants)).toEqual(
        jsonStringify(result.publicOutput.constants),
      );
      expect(jsonStringify(deserialized.publicOutput.gasUsed.publicGas)).toEqual(
        jsonStringify(result.publicOutput.gasUsed.publicGas),
      );
      expect(jsonStringify(deserialized.publicOutput.gasUsed.teardownGas)).toEqual(
        jsonStringify(result.publicOutput.gasUsed.teardownGas),
      );
      expect(jsonStringify(deserialized.publicOutput.gasUsed.totalGas)).toEqual(
        jsonStringify(result.publicOutput.gasUsed.totalGas),
      );
    });

    it('should handle simulation errors in result', async () => {
      const privateExecutionResult = await PrivateExecutionResult.random();
      const publicInputs = PrivateKernelTailCircuitPublicInputs.empty();
      const publicOutput = await PublicSimulationOutput.random();
      // Simulate an error by setting revertReason
      publicOutput.revertReason = await SimulationError.random();
      const result = new TxSimulationResult(privateExecutionResult, publicInputs, publicOutput, undefined);

      const serialized = aztecSimulateTxSerializer.result.serialize(METHOD, result);
      const deserialized = aztecSimulateTxSerializer.result.deserialize(METHOD, serialized);

      const output = deserialized.publicOutput;
      expect(output).toBeDefined();
      if (output && result.publicOutput) {
        expect(output.revertReason).toBeDefined();
        expect(output.gasUsed).toEqual(result.publicOutput.gasUsed);
      }
    });
  });

  describe('aztec_proveTx', () => {
    const METHOD = 'aztec_proveTx';

    it('should serialize and deserialize params', async () => {
      const txRequest = await TxExecutionRequest.random();
      const privateExecutionResult = await PrivateExecutionResult.random();
      const params = { txRequest, privateExecutionResult };

      const serialized = aztecProveTxSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecProveTxSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txRequest.toString()).toBe(txRequest.toString());
      expect(jsonStringify(deserialized.privateExecutionResult)).toEqual(
        jsonStringify(privateExecutionResult),
      );
    });

    it('should serialize and deserialize result', async () => {
      const result = await TxProvingResult.random();

      const serialized = aztecProveTxSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecProveTxSerializer.result.deserialize(METHOD, serialized);
      expect(jsonStringify(deserialized)).toEqual(jsonStringify(result));
    });

    it('should handle complex private execution results', async () => {
      const txRequest = await TxExecutionRequest.random();
      const privateExecutionResult = await PrivateExecutionResult.random();

      // Add nested executions and complex data
      const nestedExecution = await PrivateExecutionResult.random();
      privateExecutionResult.entrypoint.nestedExecutions.push(nestedExecution.entrypoint);

      const params = { txRequest, privateExecutionResult };
      const serialized = aztecProveTxSerializer.params.serialize(METHOD, params);
      const deserialized = aztecProveTxSerializer.params.deserialize(METHOD, serialized);

      expect(jsonStringify(deserialized.privateExecutionResult)).toEqual(
        jsonStringify(privateExecutionResult),
      );
    });
  });
});
