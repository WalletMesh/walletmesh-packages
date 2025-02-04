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
      const serialized = aztecGetNotesSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetNotesSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.txHash?.toString()).toBe(filter.txHash?.toString());
      expect(deserialized.filter.contractAddress?.toString()).toBe(filter.contractAddress?.toString());
      expect(deserialized.filter.storageSlot?.toString()).toBe(filter.storageSlot?.toString());
      expect(deserialized.filter.owner?.toString()).toBe(filter.owner?.toString());
      expect(deserialized.filter.status).toBe(filter.status);
      expect(deserialized.filter.siloedNullifier?.toString()).toBe(filter.siloedNullifier?.toString());
      expect(deserialized.filter.scopes?.map((a) => a.toString())).toEqual(
        filter.scopes?.map((a) => a.toString()),
      );
    });

    it('should serialize and deserialize result', async () => {
      const result = [await UniqueNote.random(), await UniqueNote.random()];

      const serialized = aztecGetNotesSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetNotesSerializer.result.deserialize(METHOD, serialized);
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

      const serialized = aztecAddNoteSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNoteSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.note.toBuffer().toString('hex')).toBe(note.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', () => {
      const result = true;

      const serialized = aztecAddNoteSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNoteSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });

  describe('aztec_addNullifiedNote', () => {
    const METHOD = 'aztec_addNullifiedNote';

    it('should serialize and deserialize params', async () => {
      const note = await ExtendedNote.random();
      const params = { note };

      const serialized = aztecAddNullifiedNoteSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNullifiedNoteSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.note.toBuffer().toString('hex')).toBe(note.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', () => {
      const result = true;

      const serialized = aztecAddNullifiedNoteSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNullifiedNoteSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });
});
