import { Fq, Fr } from '@aztec/aztec.js/fields';
import { jsonParseWithSchema, jsonStringify } from '@aztec/foundation/json-rpc';
import type { AccountData } from './wallet-db.js';

/**
 * Serialized representation of AccountData for storage.
 * All complex types (Fr, Buffer, AztecAddress) are converted to JSON-safe types.
 */
export interface SerializedAccountData {
  type: string;
  secretKey: string; // Serialized Fr
  salt: string; // Serialized Fr
  signingKey: string; // Serialized Fq
  alias?: string;
}

/**
 * Serialize AccountData to a JSON-safe format for storage.
 * @param data - AccountData to serialize
 * @returns Serialized account data
 */
export function serializeAccountData(data: AccountData): SerializedAccountData {
  // Serialize Fr fields using jsonStringify (which handles Zod schemas)
  const secretKeySerialized = jsonStringify(data.secretKey);
  const saltSerialized = jsonStringify(data.salt);
  const signingKeySerialized = jsonStringify(data.signingKey);

  const result: SerializedAccountData = {
    type: data.type,
    secretKey: secretKeySerialized,
    salt: saltSerialized,
    signingKey: signingKeySerialized,
  };
  if (data.alias !== undefined) {
    result.alias = data.alias;
  }
  return result;
}

/**
 * Deserialize stored data back to AccountData.
 * @param serialized - Serialized account data
 * @returns AccountData with proper types
 */
export function deserializeAccountData(serialized: SerializedAccountData): AccountData {
  // Deserialize Fr fields using jsonParseWithSchema
  const secretKey = jsonParseWithSchema(serialized.secretKey, Fr.schema);
  const salt = jsonParseWithSchema(serialized.salt, Fr.schema);
  const signingKey = jsonParseWithSchema(serialized.signingKey, Fq.schema);

  const result: AccountData = {
    type: serialized.type,
    secretKey,
    salt,
    signingKey,
  };
  if (serialized.alias !== undefined) {
    result.alias = serialized.alias;
  }
  return result;
}
