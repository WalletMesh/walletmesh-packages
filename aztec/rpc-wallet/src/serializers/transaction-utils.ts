/**
 * @module transaction-utils
 * Utilities for serializing and deserializing Aztec transaction execution requests.
 * These utilities handle the conversion between native Aztec types and JSON-RPC compatible formats.
 */

import { HashedValues, FunctionCall, AuthWitness } from '@aztec/circuit-types';
import { AztecAddress, Fr, FunctionSelector, GasSettings } from '@aztec/circuits.js';
import type { FunctionType, AbiType } from '@aztec/foundation/abi';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';
import { NoFeePaymentMethod } from '@aztec/aztec.js';

/**
 * Interface representing the serialized form of a function call.
 * This structure maps the native FunctionCall type to a JSON-serializable format
 * where complex Aztec types are converted to strings.
 *
 * @property name - The name of the function being called
 * @property to - The target contract address as a string
 * @property selector - The function selector as a string
 * @property type - The function type (public/private)
 * @property isStatic - Whether the function is static (read-only)
 * @property args - Array of function arguments as strings
 * @property returnTypes - Array of return type definitions
 */
interface SerializedFunctionCall {
  name: string;
  to: string;
  selector: string;
  type: FunctionType;
  isStatic: boolean;
  args: string[];
  returnTypes: AbiType[];
}

/**
 * Interface representing the serialized form of an execution request initialization.
 * This structure maps the ExecutionRequestInit type to a JSON-serializable format
 * where complex Aztec types are converted to strings.
 *
 * @property calls - Array of serialized function calls
 * @property authWitnesses - Optional array of authentication witness strings
 * @property hashedArguments - Optional array of hashed argument values as base64 strings
 * @property fee - Fee settings including gas configuration
 * @property nonce - Optional transaction nonce as a string
 * @property cancellable - Optional flag indicating if the transaction can be cancelled
 */
interface SerializedExecutionRequestInit {
  calls: SerializedFunctionCall[];
  authWitnesses?: string[];
  hashedArguments?: string[];
  fee: {
    gasSettings: string;
  };
  nonce?: string;
  cancellable?: boolean;
}

/**
 * Serializes an ExecutionRequestInit object to a string for JSON-RPC transport.
 * This function converts a native Aztec transaction execution request into a format
 * that can be safely transmitted over JSON-RPC, handling the conversion of complex
 * types like addresses, field elements, and function selectors to strings.
 *
 * Note: The fee payment method is not serialized as it contains async methods.
 * The deserializer will use a default NoFeePaymentMethod which should be replaced
 * by the caller with an appropriate implementation.
 *
 * @param init - The ExecutionRequestInit object to serialize, containing:
 *               - calls: Array of function calls to execute
 *               - fee: Gas settings and payment method
 *               - authWitnesses: Optional authentication proofs
 *               - hashedArguments: Optional pre-hashed arguments
 *               - nonce: Optional transaction nonce
 *               - cancellable: Optional cancellation flag
 * @returns A JSON string representation of the serialized data, with all complex
 *          Aztec types converted to string representations
 * @throws If any of the complex types cannot be serialized
 */
export function serializeExecutionRequestInit(init: ExecutionRequestInit): string {
  const serialized: SerializedExecutionRequestInit = {
    calls: init.calls.map((call) => ({
      name: call.name,
      to: call.to.toString(),
      selector: call.selector.toString(),
      type: call.type,
      isStatic: call.isStatic,
      args: call.args.map((arg) => arg.toString()),
      returnTypes: call.returnTypes,
    })),
    fee: {
      gasSettings: init.fee.gasSettings.toBuffer().toString('base64'),
    },
  };

  if (init.authWitnesses) {
    serialized.authWitnesses = init.authWitnesses.map((w) => w.toString());
  }

  if (init.hashedArguments) {
    serialized.hashedArguments = init.hashedArguments.map((ha) => ha.toBuffer().toString('base64'));
  }

  if (init.nonce) {
    serialized.nonce = init.nonce.toString();
  }

  if (init.cancellable !== undefined) {
    serialized.cancellable = init.cancellable;
  }

  return JSON.stringify(serialized);
}

/**
 * Deserializes a string into an ExecutionRequestInit object for use in the Aztec protocol.
 * This function reconstructs a native Aztec transaction execution request from its
 * JSON-RPC serialized form, converting string representations back into their
 * appropriate Aztec types.
 *
 * Note: A default NoFeePaymentMethod is used for the fee payment method.
 * The caller should override this with the appropriate implementation based on
 * their fee payment requirements.
 *
 * @param data - The serialized string data containing:
 *               - calls: Array of serialized function calls
 *               - fee: Serialized gas settings
 *               - authWitnesses: Optional serialized authentication proofs
 *               - hashedArguments: Optional serialized hashed arguments
 *               - nonce: Optional serialized nonce
 *               - cancellable: Optional cancellation flag
 * @returns The deserialized ExecutionRequestInit object with all string representations
 *          converted back to their native Aztec types
 * @throws If any of the serialized data cannot be properly deserialized into valid Aztec types
 */
export function deserializeExecutionRequestInit(data: string): ExecutionRequestInit {
  const parsed: SerializedExecutionRequestInit = JSON.parse(data);

  const result: ExecutionRequestInit = {
    calls: parsed.calls.map(
      (call) =>
        new FunctionCall(
          call.name,
          AztecAddress.fromString(call.to),
          FunctionSelector.fromString(call.selector),
          call.type,
          call.isStatic,
          call.args.map((arg) => Fr.fromString(arg)),
          call.returnTypes,
        ),
    ),
    fee: {
      gasSettings: GasSettings.fromBuffer(Buffer.from(parsed.fee.gasSettings, 'base64')),
      paymentMethod: new NoFeePaymentMethod(), // Default, caller should override
    },
  };

  if (parsed.authWitnesses) {
    result.authWitnesses = parsed.authWitnesses.map((w) => AuthWitness.fromString(w));
  }
  if (parsed.hashedArguments) {
    result.hashedArguments = parsed.hashedArguments.map((ha) =>
      HashedValues.fromBuffer(Buffer.from(ha, 'base64')),
    );
  }
  if (parsed.nonce) {
    result.nonce = Fr.fromString(parsed.nonce);
  }
  if (parsed.cancellable !== undefined) {
    result.cancellable = parsed.cancellable;
  }

  return result;
}
