import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityMatcher } from './CapabilityMatcher.js';
import { createTestResponderInfo } from '../testing/testUtils.js';
import type { DiscoveryRequestEvent } from '../types/core.js';
import type { ResponderInfo, CapabilityRequirements } from '../types/capabilities.js';

describe('CapabilityMatcher', () => {
  let matcher: CapabilityMatcher;
  let responderInfo: ResponderInfo;

  beforeEach(() => {
    // Use the test utility to create a proper ResponderInfo with technologies
    responderInfo = createTestResponderInfo.ethereum({
      rdns: 'com.example.wallet',
      name: 'Example Wallet',
    });

    matcher = new CapabilityMatcher(responderInfo);
  });

  describe('matchCapabilities', () => {
    describe('technology-based matching', () => {
      it('should match EVM technology with required interfaces', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['eip-1193'],
              },
            ],
            features: ['account-management'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection).toBeDefined();
        expect(result.intersection?.required.technologies).toHaveLength(1);
        expect(result.intersection?.required.technologies[0]?.type).toBe('evm');
        expect(result.intersection?.required.technologies[0]?.interfaces).toContain('eip-1193');
      });

      it('should match multiple technology requirements', () => {
        // Create a multi-chain responder
        responderInfo = createTestResponderInfo.multiChain();
        matcher = new CapabilityMatcher(responderInfo);

        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['eip-1193'],
              },
              {
                type: 'solana',
                interfaces: ['solana-wallet-standard'],
              },
            ],
            features: ['account-management'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.technologies).toHaveLength(2);
      });
    });

    describe('failed matching scenarios', () => {
      it('should fail when required technology is not supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'solana', // EVM wallet doesn't support Solana
                interfaces: ['solana-wallet-standard'],
              },
            ],
            features: ['account-management'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.missing.technologies).toHaveLength(1);
        expect(result.missing.technologies[0]).toEqual({
          type: 'solana',
          reason: "Technology 'solana' not supported or missing required interfaces",
        });
      });

      it('should fail when required interface is not supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['non-existent-interface'],
              },
            ],
            features: ['account-management'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should fail with null request', () => {
        const result = matcher.matchCapabilities(null as unknown as DiscoveryRequestEvent);

        expect(result.canFulfill).toBe(false);
        expect(result.intersection).toBeNull();
      });

      it('should fail with missing required field', () => {
        const request = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        } as DiscoveryRequestEvent;

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
      });

      it('should fail with missing technologies array', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            features: ['account-management'],
          } as unknown as CapabilityRequirements, // Missing technologies
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
      });
    });

    describe('updateResponderInfo', () => {
      it('should update responder info and affect matching', () => {
        // Initially should fail for Solana
        const solanaRequest: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'solana',
                interfaces: ['solana-wallet-standard'],
              },
            ],
            features: ['account-management'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        // Initially should fail
        let result = matcher.matchCapabilities(solanaRequest);
        expect(result.canFulfill).toBe(false);

        // Update to multi-chain responder
        const updatedResponderInfo = createTestResponderInfo.multiChain();
        matcher.updateResponderInfo(updatedResponderInfo);

        // Now should succeed
        result = matcher.matchCapabilities(solanaRequest);
        expect(result.canFulfill).toBe(true);
      });
    });

    describe('network matching', () => {
      it('should match when networks overlap', () => {
        // Create Aztec wallet with specific networks
        responderInfo = {
          ...createTestResponderInfo.multiChain(),
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
              networks: ['aztec:31337', 'aztec:mainnet'],
            },
          ],
        };
        matcher = new CapabilityMatcher(responderInfo);

        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-wallet-api-v1'],
                networks: ['aztec:31337'], // Request sandbox network
              },
            ],
            features: [],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.technologies[0]?.networks).toEqual(['aztec:31337']);
      });

      it('should fail when networks do not overlap', () => {
        // Wallet only supports mainnet
        responderInfo = {
          ...createTestResponderInfo.multiChain(),
          technologies: [
            {
              type: 'aztec',
              interfaces: ['aztec-wallet-api-v1'],
              networks: ['aztec:mainnet'],
            },
          ],
        };
        matcher = new CapabilityMatcher(responderInfo);

        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'aztec',
                interfaces: ['aztec-wallet-api-v1'],
                networks: ['aztec:31337'], // Request sandbox but wallet only has mainnet
              },
            ],
            features: [],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.missing.technologies[0]?.type).toBe('aztec');
      });

      it('should match when no networks specified (backwards compatibility)', () => {
        // Wallet specifies networks
        responderInfo = {
          ...createTestResponderInfo.ethereum(),
          technologies: [
            {
              type: 'evm',
              interfaces: ['eip-1193'],
              networks: ['eip155:1', 'eip155:137'],
            },
          ],
        };
        matcher = new CapabilityMatcher(responderInfo);

        // Request without networks
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['eip-1193'],
                // No networks specified - should still match
              },
            ],
            features: [],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        // networks not included in result when not requested
        expect(result.intersection?.required.technologies[0]?.networks).toBeUndefined();
      });

      it('should return all overlapping networks', () => {
        // Wallet supports multiple networks
        responderInfo = {
          ...createTestResponderInfo.ethereum(),
          technologies: [
            {
              type: 'evm',
              interfaces: ['eip-1193'],
              networks: ['eip155:1', 'eip155:137', 'eip155:42161'],
            },
          ],
        };
        matcher = new CapabilityMatcher(responderInfo);

        // Request multiple networks
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['eip-1193'],
                networks: ['eip155:1', 'eip155:137', 'eip155:10'], // Last one not supported
              },
            ],
            features: [],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.technologies[0]?.networks).toHaveLength(2);
        expect(result.intersection?.required.technologies[0]?.networks).toContain('eip155:1');
        expect(result.intersection?.required.technologies[0]?.networks).toContain('eip155:137');
        expect(result.intersection?.required.technologies[0]?.networks).not.toContain('eip155:10');
      });
    });

    describe('getCapabilityDetails', () => {
      it('should return detailed capability information', () => {
        const details = matcher.getCapabilityDetails();

        expect(details).toHaveProperty('supportedTechnologies');
        expect(details).toHaveProperty('supportedFeatures');
        expect(details).toHaveProperty('supportedInterfaces');
        expect(details).toHaveProperty('responderType');
        expect(details).toHaveProperty('technologyCount');
        expect(details).toHaveProperty('featureCount');

        expect(Array.isArray(details.supportedTechnologies)).toBe(true);
        expect(Array.isArray(details.supportedFeatures)).toBe(true);
        expect(Array.isArray(details.supportedInterfaces)).toBe(true);
      });
    });
  });
});
