import { describe, expect, it } from 'vitest';
import { Fr, AztecAddress, ExtendedNote } from '@aztec/aztec.js';
import { type NotesFilter, NoteStatus, TxHash, UniqueNote } from '@aztec/circuit-types';
import { aztecGetNotesSerializer, aztecAddNoteSerializer, aztecAddNullifiedNoteSerializer } from './note.js';

describe('Note Serializers', () => {
  describe('aztec_getNotes', () => {
    const METHOD = 'aztec_getNotes';

    it('should serialize and deserialize params', async () => {
      const filter: NotesFilter = {
        txHash: await TxHash.random(),
        contractAddress: await AztecAddress.random(),
        storageSlot: await Fr.random(),
        owner: await AztecAddress.random(),
        status: NoteStatus.ACTIVE,
        siloedNullifier: await Fr.random(),
        scopes: [await AztecAddress.random()],
      };
      const params = { filter };

      const serialized = await aztecGetNotesSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecGetNotesSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.txHash?.toString()).toBe(filter.txHash?.toString());
      expect(deserialized.filter.contractAddress?.toString()).toBe(filter.contractAddress?.toString());
      expect(deserialized.filter.storageSlot?.toString()).toBe(filter.storageSlot?.toString());
      expect(deserialized.filter.owner?.toString()).toBe(filter.owner?.toString());
      expect(deserialized.filter.status).toBe(filter.status);
      expect(deserialized.filter.siloedNullifier?.toString()).toBe(filter.siloedNullifier?.toString());
      expect(deserialized.filter.scopes?.map((s) => s.toString())).toEqual(
        filter.scopes?.map((s) => s.toString()),
      );
    });

    it('should serialize and deserialize result', async () => {
      const result = [await UniqueNote.random(), await UniqueNote.random()];

      const serialized = await aztecGetNotesSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecGetNotesSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.map((note: UniqueNote) => note.toString())).toEqual(
        result.map((note: UniqueNote) => note.toString()),
      );
    });
  });

  describe('aztec_addNote', () => {
    const METHOD = 'aztec_addNote';

    it('should serialize and deserialize params', async () => {
      const note = await ExtendedNote.random();
      const params = { note };

      const serialized = await aztecAddNoteSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecAddNoteSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.note.toBuffer().toString('hex')).toBe(note.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', async () => {
      const result = true;

      const serialized = await aztecAddNoteSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecAddNoteSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });

  describe('aztec_addNullifiedNote', () => {
    const METHOD = 'aztec_addNullifiedNote';

    it('should serialize and deserialize params', async () => {
      const note = await ExtendedNote.random();
      const params = { note };

      const serialized = await aztecAddNullifiedNoteSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecAddNullifiedNoteSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.note.toBuffer().toString('hex')).toBe(note.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', async () => {
      const result = true;

      const serialized = await aztecAddNullifiedNoteSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecAddNullifiedNoteSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in deserialization', async () => {
      const METHOD = 'aztec_getNotes';
      const invalidData = { method: METHOD, serialized: 'invalid json' };

      await expect(aztecGetNotesSerializer.params.deserialize(METHOD, invalidData)).rejects.toThrow();
    });

    it('should handle empty filter fields', async () => {
      const METHOD = 'aztec_getNotes';
      const filter: NotesFilter = {};
      const params = { filter };

      const serialized = await aztecGetNotesSerializer.params.serialize(METHOD, params);
      const deserialized = await aztecGetNotesSerializer.params.deserialize(METHOD, serialized);

      expect(deserialized.filter.txHash).toBeUndefined();
      expect(deserialized.filter.contractAddress).toBeUndefined();
      expect(deserialized.filter.storageSlot).toBeUndefined();
      expect(deserialized.filter.owner).toBeUndefined();
      expect(deserialized.filter.status).toBeUndefined();
      expect(deserialized.filter.siloedNullifier).toBeUndefined();
      expect(deserialized.filter.scopes).toBeUndefined();
    });
  });
});
