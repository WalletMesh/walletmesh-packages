import { describe, expect, it } from 'vitest';
import { Fr, AztecAddress, CompleteAddress, AuthWitness } from '@aztec/aztec.js';
import {
  aztecSetScopesSerializer,
  aztecRegisterAccountSerializer,
  aztecAddAuthWitnessSerializer,
  aztecGetAuthWitnessSerializer,
} from './account.js';
import { schemas } from '@aztec/foundation/schemas';

describe('Account Serializers', () => {
  describe('aztec_setScopes', () => {
    const METHOD = 'aztec_setScopes';

    it('should serialize and deserialize params', async () => {
      const scopes = [await AztecAddress.random(), await AztecAddress.random()];
      const params = { scopes };

      const serialized = await aztecSetScopesSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecSetScopesSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.scopes.map((s) => s.toString())).toEqual(scopes.map((s) => s.toString()));
    });

    it('should serialize and deserialize result', async () => {
      const result = true;

      const serialized = await aztecSetScopesSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecSetScopesSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });

  describe('aztec_registerAccount', () => {
    const METHOD = 'aztec_registerAccount';

    it('should serialize and deserialize params', async () => {
      const secretKey = await Fr.random();
      const partialAddress = await Fr.random();
      const params = { secretKey, partialAddress };

      const serialized = await aztecRegisterAccountSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecRegisterAccountSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.secretKey.toString()).toBe(secretKey.toString());
      expect(deserialized.partialAddress.toString()).toBe(partialAddress.toString());
    });

    it('should serialize and deserialize result', async () => {
      const result = await CompleteAddress.random();

      const serialized = await aztecRegisterAccountSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecRegisterAccountSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.toString()).toBe(result.toString());
    });
  });

  describe('aztec_addAuthWitness', () => {
    const METHOD = 'aztec_addAuthWitness';

    it('should serialize and deserialize params', async () => {
      const authWitness = await AuthWitness.random();
      const params = { authWitness };

      const serialized = await aztecAddAuthWitnessSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecAddAuthWitnessSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.authWitness.toString()).toBe(authWitness.toString());
    });

    it('should serialize and deserialize result', async () => {
      const result = true;

      const serialized = await aztecAddAuthWitnessSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecAddAuthWitnessSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });

  describe('aztec_getAuthWitness', () => {
    const METHOD = 'aztec_getAuthWitness';

    it('should serialize and deserialize params', async () => {
      const messageHash = await Fr.random();
      const params = { messageHash };

      const serialized = await aztecGetAuthWitnessSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecGetAuthWitnessSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.messageHash.toString()).toBe(messageHash.toString());
    });

    it('should serialize and deserialize result', async () => {
      const result = [await Fr.random(), await Fr.random()];

      const serialized = await aztecGetAuthWitnessSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = await aztecGetAuthWitnessSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.map((w) => w.toString())).toEqual(result.map((w) => w.toString()));
    });
  });

  describe('Base64 encoding/decoding', () => {
    it('should properly encode and decode data', async () => {
      const messageHash = await Fr.random();

      const serialized = await aztecGetAuthWitnessSerializer.params.serialize('aztec_getAuthWitness', {
        messageHash,
      });
      const decoded = schemas.Fr.parse(JSON.parse(serialized.serialized));
      expect(decoded.toString()).toBe(messageHash.toString());
    });
  });
});
