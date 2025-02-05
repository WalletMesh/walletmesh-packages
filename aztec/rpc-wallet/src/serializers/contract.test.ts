import { describe, expect, it } from 'vitest';
import { aztecRegisterContractSerializer } from './contract.js';
import { randomDeployedContract } from '@aztec/circuit-types';
describe('Contract Serializers', () => {
  describe('aztec_registerContract', () => {
    it('should serialize and deserialize params', async () => {
      const { instance, artifact } = await randomDeployedContract();
      const serialized = await aztecRegisterContractSerializer.params.serialize('aztec_registerContract', {
        instance,
        artifact,
      });
      expect(serialized.method).toBe('aztec_registerContract');

      const deserialized = await aztecRegisterContractSerializer.params.deserialize(
        'aztec_registerContract',
        serialized,
      );
      expect(deserialized.instance.address.toString()).toBe(instance.address.toString());
      expect(deserialized.instance.contractClassId.toString()).toBe(instance.contractClassId.toString());
      expect(deserialized.instance.deployer.toString()).toBe(instance.deployer.toString());
      expect(deserialized.artifact).toEqual(artifact);
    });
  });
});
