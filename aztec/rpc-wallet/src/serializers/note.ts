import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import { UniqueNote, TxHash, type NotesFilter } from '@aztec/circuit-types';
import { ExtendedNote, AztecAddress, Fr } from '@aztec/aztec.js';

/**
 * Serializer for the aztec_getNotes RPC method.
 * Handles serialization of note queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetNotesSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getNotes']['params'],
      AztecWalletMethodMap['aztec_getNotes']['result']
    >
{
  params = {
    /**
     * Serializes notes filter parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing filter criteria for notes
     * @returns Serialized filter data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getNotes']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { filter } = value;
      // Convert instances to their string representations for transport
      const serializedFilter = {
        txHash: filter.txHash?.toString(),
        contractAddress: filter.contractAddress?.toString(),
        storageSlot: filter.storageSlot?.toString(),
        owner: filter.owner?.toString(),
        status: filter.status,
        siloedNullifier: filter.siloedNullifier?.toString(),
        scopes: filter.scopes?.map((scope) => scope.toString()),
      };

      return Promise.resolve({
        method,
        serialized: JSON.stringify({ filter: serializedFilter }),
      });
    },
    /**
     * Deserializes notes filter parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized filter data
     * @returns Deserialized filter parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getNotes']['params']> => {
      const { filter } = JSON.parse(data.serialized);

      // Convert string representations back to instances
      const notesFilter: NotesFilter = {};
      if (filter.txHash) notesFilter.txHash = TxHash.fromString(filter.txHash);
      if (filter.contractAddress)
        notesFilter.contractAddress = AztecAddress.fromString(filter.contractAddress);
      if (filter.storageSlot) notesFilter.storageSlot = Fr.fromString(filter.storageSlot);
      if (filter.owner) notesFilter.owner = AztecAddress.fromString(filter.owner);
      if (filter.status) notesFilter.status = filter.status;
      if (filter.siloedNullifier) notesFilter.siloedNullifier = Fr.fromString(filter.siloedNullifier);
      if (filter.scopes)
        notesFilter.scopes = filter.scopes.map((scope: string) => AztecAddress.fromString(scope));

      return Promise.resolve({
        filter: notesFilter,
      });
    },
  };

  result = {
    /**
     * Serializes the notes query result.
     * @param method - The RPC method name
     * @param value - Array of unique notes matching the filter criteria
     * @returns Serialized note array
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getNotes']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value.map((n) => n.toString())),
      });
    },
    /**
     * Deserializes the notes query result.
     * @param _method - The RPC method name
     * @param data - The serialized note array data
     * @returns Array of deserialized unique notes
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getNotes']['result']> => {
      return Promise.resolve(JSON.parse(data.serialized).map((n: string) => UniqueNote.fromString(n)));
    },
  };
}

/**
 * Serializer for the aztec_addNote RPC method.
 * Handles serialization of note addition requests between JSON-RPC format and native Aztec types.
 */
export class AztecAddNoteSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_addNote']['params'],
      AztecWalletMethodMap['aztec_addNote']['result']
    >
{
  params = {
    /**
     * Serializes note addition parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the note to add
     * @returns Serialized note data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_addNote']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { note } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify({ note: note.toBuffer().toString('base64') }),
      });
    },
    /**
     * Deserializes note addition parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized note data
     * @returns Deserialized note parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_addNote']['params']> => {
      const { note: noteBase64 } = JSON.parse(data.serialized);
      const note = ExtendedNote.fromBuffer(Buffer.from(noteBase64, 'base64'));
      return Promise.resolve({ note });
    },
  };

  result = {
    /**
     * Serializes the note addition result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of the note addition
     * @returns Serialized result
     */
    serialize: async (method: string, value: boolean): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    /**
     * Deserializes the note addition result.
     * @param _method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<boolean> => {
      return Promise.resolve(JSON.parse(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_addNullifiedNote RPC method.
 * Handles serialization of nullified note addition requests between JSON-RPC format and native Aztec types.
 */
export class AztecAddNullifiedNoteSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_addNullifiedNote']['params'],
      AztecWalletMethodMap['aztec_addNullifiedNote']['result']
    >
{
  params = {
    /**
     * Serializes nullified note addition parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the nullified note to add
     * @returns Serialized note data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_addNullifiedNote']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { note } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify({ note: note.toBuffer().toString('base64') }),
      });
    },
    /**
     * Deserializes nullified note addition parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized note data
     * @returns Deserialized note parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_addNullifiedNote']['params']> => {
      const { note: noteBase64 } = JSON.parse(data.serialized);
      const note = ExtendedNote.fromBuffer(Buffer.from(noteBase64, 'base64'));
      return Promise.resolve({ note });
    },
  };

  result = {
    /**
     * Serializes the nullified note addition result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of the nullified note addition
     * @returns Serialized result
     */
    serialize: async (method: string, value: boolean): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    /**
     * Deserializes the nullified note addition result.
     * @param _method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<boolean> => {
      return Promise.resolve(JSON.parse(data.serialized));
    },
  };
}

/**
 * Pre-instantiated serializer instances for Aztec note-related RPC methods.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecGetNotesSerializer = new AztecGetNotesSerializer();
export const aztecAddNoteSerializer = new AztecAddNoteSerializer();
export const aztecAddNullifiedNoteSerializer = new AztecAddNullifiedNoteSerializer();
