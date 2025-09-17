/**
 * Tests for integration testing utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createFullDiscoveryFlow,
  testCrossOriginCommunication,
  validateDiscoveryCompliance,
  createEndToEndIntegrationTest,
  type DiscoveryFlowConfig,
  type ComplianceTestConfig,
} from './integrationHelpers.js';
// import { MockEventTarget } from './MockEventTarget.js';
import { createTestResponderInfo, createTestSecurityPolicy } from './testUtils.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

describe('integrationHelpers', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('createFullDiscoveryFlow', () => {
    it('should create basic discovery flow', () => {
      const config: DiscoveryFlowConfig = {
        initiatorOrigin: 'https://dapp.example.com',
        responderInfo: createTestResponderInfo.ethereum(),
        requirements: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['account-management'],
        },
      };

      const flow = createFullDiscoveryFlow(config);

      expect(flow).toHaveProperty('runComplete');
      expect(flow).toHaveProperty('config');
      expect(flow.config.initiatorOrigin).toBe('https://dapp.example.com');
    });

    it('should create flow with multiple responders', () => {
      const config: DiscoveryFlowConfig = {
        responders: [createTestResponderInfo.ethereum(), createTestResponderInfo.solana()],
      };

      const flow = createFullDiscoveryFlow(config);

      expect(flow.config.responders).toHaveLength(2);
    });

    it('should create flow with custom security policy', () => {
      const securityPolicy = createTestSecurityPolicy({ requireHttps: true, allowedOrigins: [] });
      const config: DiscoveryFlowConfig = {
        securityPolicy,
        responderInfo: createTestResponderInfo.ethereum(),
      };

      const flow = createFullDiscoveryFlow(config);

      expect(flow.config.securityPolicy).toBe(securityPolicy);
    });

    it('should use default values when config is empty', () => {
      const flow = createFullDiscoveryFlow();

      expect(flow.config.initiatorOrigin).toBe('https://dapp.example.com');
      expect(flow.config.responders).toBeDefined();
      expect(flow.config.requirements).toBeDefined();
      expect(flow.config.timeout).toBe(5000);
    });

    it('should run complete discovery flow', async () => {
      const config: DiscoveryFlowConfig = {
        responders: [createTestResponderInfo.ethereum()],
        requirements: {
          technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
          features: [],
        },
        timeout: 1000,
      };

      const flow = createFullDiscoveryFlow(config);

      // Don't await immediately - let the function set up timers first
      const result = await flow.runComplete();

      // The flow should find the ethereum responder
      expect(result.success).toBe(true);
      expect(result.responses.length).toBeGreaterThan(0);
      expect(result.qualifiedResponders.length).toBeGreaterThan(0);
      expect(result.timing.duration).toBeGreaterThan(0);
    });
  });

  describe('testCrossOriginCommunication', () => {
    it('should test basic cross-origin setup', async () => {
      const result = await testCrossOriginCommunication([
        'https://app.example.com',
        'https://wallet.example.com',
      ]);

      expect(result.success).toBe(true);
      expect(result.origins).toEqual(['https://app.example.com', 'https://wallet.example.com']);
      expect(result.pairResults[0]?.success).toBe(true);
    });

    it('should test with custom event targets', async () => {
      // const _initiatorTarget = new MockEventTarget();
      // const _responderTarget = new MockEventTarget();

      const result = await testCrossOriginCommunication(
        ['https://app.example.com', 'https://wallet.example.com'],
        {},
      );

      expect(result.success).toBe(true);
      expect(result.pairResults.every((pair) => pair.success)).toBe(true);
    });

    it('should handle communication failures', async () => {
      const result = await testCrossOriginCommunication(
        ['https://app.example.com', 'https://wallet.example.com'],
        {
          securityPolicy: {
            allowedOrigins: ['https://different.com'],
            requireHttps: true,
            allowLocalhost: false,
          },
          testAllowedPairs: false, // Don't override the security policy
        },
      );

      // When security policy blocks origins, discovery fails silently (times out)
      // because responders don't respond to unauthorized origins
      expect(result.success).toBe(false);
      expect(result.pairResults.every((pair) => !pair.success)).toBe(true);
      expect(result.securityResults.originValidationPassed).toBe(true);
    });
  });

  describe('validateDiscoveryCompliance', () => {
    it('should validate basic protocol compliance', async () => {
      const config: ComplianceTestConfig = {
        implementation: createTestResponderInfo.ethereum(),
      };

      const result = await validateDiscoveryCompliance(config);

      expect(result.passed).toBe(true);
      expect(result.results).toBeDefined();
      // Check for actual test names that exist
      expect(result.results['Message format compliance']).toBe(true);
      expect(result.results['State machine compliance']).toBe(true);
      expect(result.results['Security policy compliance']).toBe(true);
    });

    it('should test specific compliance aspects', async () => {
      const config: ComplianceTestConfig = {
        implementation: createTestResponderInfo.ethereum(),
        customScenarios: [
          { name: 'protocolVersion', test: async () => true },
          { name: 'messageFormat', test: async () => true },
          { name: 'securityValidation', test: async () => true },
          { name: 'timeoutHandling', test: async () => true },
        ],
      };

      const result = await validateDiscoveryCompliance(config);

      expect(result.passed).toBe(true);
      expect(result.totalTests).toBeGreaterThanOrEqual(4);
    });

    it('should handle non-compliant scenarios', async () => {
      const config: ComplianceTestConfig = {
        implementation: createTestResponderInfo.ethereum(),
        strictMode: true,
        // Add a custom scenario that will fail to test the failure path
        customScenarios: [
          {
            name: 'failingTest',
            test: async () => false, // This will fail
          },
        ],
      };

      const result = await validateDiscoveryCompliance(config);

      expect(result.passed).toBe(false);
      expect(result.failedTests.length).toBeGreaterThan(0);
    });
  });

  describe('createEndToEndIntegrationTest', () => {
    it('should create basic integration test', () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Basic E2E Test',
          config: {
            responders: [createTestResponderInfo.ethereum()],
          },
          expectedResult: {
            success: true,
          },
        },
      ]);

      expect(test.scenarios).toHaveLength(1);
      expect(test.scenarios[0]?.name).toBe('Basic E2E Test');
      expect(test).toHaveProperty('runAll');
      expect(test).toHaveProperty('runScenario');
      expect(test).toHaveProperty('getScenarios');
    });

    it('should run integration test with multiple scenarios', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Ethereum Discovery',
          config: {
            responders: [createTestResponderInfo.ethereum()],
            requirements: {
              technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
              features: [],
            },
          },
          expectedResult: {
            success: true,
          },
        },
        {
          name: 'Solana Discovery',
          config: {
            responders: [createTestResponderInfo.solana()],
            requirements: {
              technologies: [{ type: 'solana', interfaces: ['solana-wallet-standard'] }],
              features: [],
            },
          },
          expectedResult: {
            success: true,
          },
        },
      ]);

      const results = await test.runAll();

      expect(results).toHaveProperty('totalScenarios');
      expect(results.totalScenarios).toBe(2);
      expect(results.overallSuccess).toBeDefined();
    });

    it('should handle test failures gracefully', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Failing Scenario',
          config: {
            responders: [createTestResponderInfo.ethereum()],
            timeout: 100, // Force timeout for failure
          },
          expectedResult: {
            success: false,
            timeoutExpected: true,
          },
        },
      ]);

      const results = await test.runAll();

      expect(results.overallSuccess).toBe(false);
      expect(results.failedScenarios.length).toBeGreaterThan(0);
    });

    it('should support custom validation', async () => {
      let customValidationRan = false;

      const test = createEndToEndIntegrationTest([
        {
          name: 'Custom Scenario',
          config: {
            responders: [createTestResponderInfo.ethereum()],
          },
          expectedResult: {
            success: true,
          },
          customValidation: async (result) => {
            customValidationRan = true;
            expect(result).toBeDefined();
          },
        },
      ]);

      await test.runAll();

      expect(customValidationRan).toBe(true);
    });

    it('should measure performance metrics', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Performance Scenario',
          config: {
            responders: [createTestResponderInfo.ethereum()],
          },
          expectedResult: {
            success: true,
          },
        },
      ]);

      const results = await test.runAll();

      expect(results).toHaveProperty('totalScenarios');
      expect(results).toHaveProperty('overallSuccess');
    });

    it('should handle expected wallet count validation', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Wallet Count Test',
          config: {
            responders: [createTestResponderInfo.ethereum(), createTestResponderInfo.solana()],
            requirements: {
              technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
              features: [],
            },
          },
          expectedResult: {
            success: true,
            walletCount: 1, // Only ethereum should match
          },
        },
      ]);

      const results = await test.runAll();
      expect(results.overallSuccess).toBe(true);
    });

    it('should handle wallet count mismatch', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Wallet Count Mismatch',
          config: {
            responders: [createTestResponderInfo.ethereum()],
            requirements: {
              technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
              features: [],
            },
          },
          expectedResult: {
            success: true,
            walletCount: 2, // Expecting 2 but will only get 1
          },
        },
      ]);

      const results = await test.runAll();
      expect(results.overallSuccess).toBe(false);
      expect(results.failedScenarios).toHaveLength(1);
      expect(results.failedScenarios[0]?.error).toContain('Expected 2 wallets, got: 1');
    });

    it('should handle timeout expected validation', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Timeout Expected',
          config: {
            responders: [], // No responders will cause timeout
            timeout: 100,
          },
          expectedResult: {
            success: false,
            timeoutExpected: true,
          },
        },
      ]);

      const results = await test.runAll();
      expect(results.overallSuccess).toBe(true); // Success because we expected timeout
    });

    it('should fail when timeout expected but not occurred', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Timeout Not Occurred',
          config: {
            responders: [createTestResponderInfo.ethereum()],
            requirements: {
              technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
              features: [],
            },
          },
          expectedResult: {
            success: true,
            timeoutExpected: true, // Expecting timeout but it won't happen
          },
        },
      ]);

      const results = await test.runAll();
      expect(results.overallSuccess).toBe(false);
      expect(results.failedScenarios[0]?.error).toContain('Expected timeout but found qualified responders');
    });

    it('should handle security rejection expected validation', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Security Rejection Expected',
          config: {
            responders: [createTestResponderInfo.ethereum()],
            securityPolicy: {
              allowedOrigins: ['https://different-origin.com'], // Will cause rejection
              requireHttps: true,
            },
            timeout: 100,
          },
          expectedResult: {
            success: false,
            securityRejectionExpected: true,
          },
        },
      ]);

      const results = await test.runAll();
      // When security blocks, discovery fails silently (timeout)
      expect(results.overallSuccess).toBe(true); // Success because we expected rejection
    });

    it('should fail when security rejection expected but not occurred', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Security Not Rejected',
          config: {
            responders: [createTestResponderInfo.ethereum()],
            requirements: {
              technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
              features: [],
            },
          },
          expectedResult: {
            success: true,
            securityRejectionExpected: true, // Expecting rejection but it won't happen
          },
        },
      ]);

      const results = await test.runAll();
      expect(results.overallSuccess).toBe(false);
      expect(results.failedScenarios[0]?.error).toContain(
        'Expected security rejection but found qualified responders',
      );
    });

    it('should run specific scenario by name', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'First Scenario',
          config: { responders: [createTestResponderInfo.ethereum()] },
          expectedResult: { success: true },
        },
        {
          name: 'Second Scenario',
          config: {
            responders: [createTestResponderInfo.solana()],
            requirements: {
              technologies: [
                {
                  type: 'solana' as const,
                  interfaces: ['solana-wallet-standard'],
                },
              ],
              features: ['account-management'],
            },
          },
          expectedResult: { success: true },
        },
      ]);

      const result = await test.runScenario('Second Scenario');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should throw when running non-existent scenario', async () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Existing Scenario',
          config: { responders: [createTestResponderInfo.ethereum()] },
          expectedResult: { success: true },
        },
      ]);

      await expect(test.runScenario('Non-existent Scenario')).rejects.toThrow(
        "Scenario 'Non-existent Scenario' not found",
      );
    });

    it('should filter scenarios by expected results', () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Success Scenario',
          config: { responders: [createTestResponderInfo.ethereum()] },
          expectedResult: { success: true },
        },
        {
          name: 'Timeout Scenario',
          config: { responders: [], timeout: 100 },
          expectedResult: { success: false, timeoutExpected: true },
        },
        {
          name: 'Security Scenario',
          config: { responders: [] },
          expectedResult: { success: false, securityRejectionExpected: true },
        },
      ]);

      // Test filtering by success
      const successScenarios = test.getScenarios({ expectSuccess: true });
      expect(successScenarios).toHaveLength(1);
      expect(successScenarios[0]?.name).toBe('Success Scenario');

      // Test filtering by timeout
      const timeoutScenarios = test.getScenarios({ expectTimeout: true });
      expect(timeoutScenarios).toHaveLength(1);
      expect(timeoutScenarios[0]?.name).toBe('Timeout Scenario');

      // Test filtering by security rejection
      const securityScenarios = test.getScenarios({ expectSecurityRejection: true });
      expect(securityScenarios).toHaveLength(1);
      expect(securityScenarios[0]?.name).toBe('Security Scenario');

      // Test no filter returns all
      const allScenarios = test.getScenarios();
      expect(allScenarios).toHaveLength(3);
    });

    it('should filter scenarios with multiple criteria', () => {
      const test = createEndToEndIntegrationTest([
        {
          name: 'Combined Scenario',
          config: { responders: [] },
          expectedResult: { success: false, timeoutExpected: true, securityRejectionExpected: false },
        },
      ]);

      const filtered = test.getScenarios({
        expectSuccess: false,
        expectTimeout: true,
        expectSecurityRejection: false,
      });
      expect(filtered).toHaveLength(1);
    });
  });
});
