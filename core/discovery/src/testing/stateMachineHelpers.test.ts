/**
 * Tests for state machine testing utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import {
  testStateTransitions,
  testStateTimeouts,
  assertStateConsistency,
  createStateMachineTestSuite,
  createCommonDiscoveryInvariants,
  type StateTransitionTest,
  type StateTimeoutConfig,
  type StateInvariant,
  type StateMachine,
} from './stateMachineHelpers.js';
import { setupFakeTimers, cleanupFakeTimers } from './timingHelpers.js';

// Mock state machine implementation for testing
class MockStateMachine implements StateMachine {
  private state = 'IDLE';
  private history: Array<{ state: string; timestamp: number }> = [];
  private validTransitions: Record<string, string[]> = {
    IDLE: ['DISCOVERING', 'CONNECTED'],
    DISCOVERING: ['CONNECTING', 'COMPLETED', 'IDLE'],
    CONNECTING: ['CONNECTED', 'IDLE'],
    CONNECTED: ['IDLE'],
    COMPLETED: ['IDLE'],
  };

  getState(): string {
    return this.state;
  }

  canTransition(to: string): boolean {
    const validStates = this.validTransitions[this.state];
    return validStates ? validStates.includes(to) : false;
  }

  async transition(to: string, _data?: unknown): Promise<void> {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition from ${this.state} to ${to}`);
    }
    this.history.push({ state: this.state, timestamp: Date.now() });
    this.state = to;
  }

  reset(): void {
    this.state = 'IDLE';
    this.history = [];
  }

  getStateHistory(): Array<{ state: string; timestamp: number }> {
    return [...this.history];
  }

  // Event handling
  private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  on(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.listeners.get(event) || [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.listeners.get(event) || [];
    const filtered = listeners.filter((l) => l !== listener);
    this.listeners.set(event, filtered);
  }
}

describe('stateMachineHelpers', () => {
  let stateMachine: MockStateMachine;

  beforeEach(() => {
    setupFakeTimers();
    stateMachine = new MockStateMachine();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  describe('testStateTransitions', () => {
    it('should test basic state transitions', async () => {
      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'startDiscovery',
        },
        {
          from: 'DISCOVERING',
          to: 'CONNECTING',
          trigger: 'selectWallet',
        },
        {
          from: 'CONNECTING',
          to: 'CONNECTED',
          trigger: 'connectionEstablished',
        },
      ];

      await testStateTransitions(stateMachine, transitions);
      expect(stateMachine.getState()).toBe('CONNECTED');
    });

    it('should test transitions with delays', async () => {
      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'startDiscovery',
          delay: 100,
        },
      ];

      await testStateTransitions(stateMachine, transitions);
      expect(stateMachine.getState()).toBe('DISCOVERING');
    });

    it('should test transitions with custom validation', async () => {
      let validationRan = false;

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'startDiscovery',
          validation: async (sm) => {
            validationRan = true;
            expect(sm.getState()).toBe('DISCOVERING');
          },
        },
      ];

      await testStateTransitions(stateMachine, transitions);
      expect(validationRan).toBe(true);
    });

    it('should handle expected transition failures', async () => {
      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'INVALID_STATE',
          trigger: 'invalidTransition',
          shouldFail: true,
          expectedError: 'Invalid transition',
        },
      ];

      await testStateTransitions(stateMachine, transitions);
      expect(stateMachine.getState()).toBe('IDLE'); // Should remain in IDLE
    });

    it('should throw on unexpected transition failure', async () => {
      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'INVALID_STATE',
          trigger: 'unexpectedFailure',
          shouldFail: false, // We expect it to succeed, but it won't
        },
      ];

      await expect(testStateTransitions(stateMachine, transitions)).rejects.toThrow(
        'State transition test failed at step 0',
      );
    });

    it('should throw on wrong starting state', async () => {
      stateMachine.transition('DISCOVERING'); // Set to wrong state

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'startDiscovery',
        },
      ];

      await expect(testStateTransitions(stateMachine, transitions)).rejects.toThrow(
        "Expected starting state 'IDLE', got 'DISCOVERING'",
      );
    });

    it('should reset state machine before and after if configured', async () => {
      stateMachine.transition('DISCOVERING');

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'startDiscovery',
        },
      ];

      await testStateTransitions(stateMachine, transitions, {
        resetBefore: true,
        resetAfter: true,
      });

      expect(stateMachine.getState()).toBe('IDLE'); // Reset after
    });

    it('should handle state machine without canTransition method', async () => {
      const simpleStateMachine = {
        state: 'IDLE',
        getState() {
          return this.state;
        },
        transition(to: string) {
          this.state = to;
        },
      };

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'ACTIVE',
          trigger: 'activate',
        },
      ];

      await testStateTransitions(simpleStateMachine as StateMachine, transitions);
      expect(simpleStateMachine.getState()).toBe('ACTIVE');
    });

    it('should use real timers when configured', async () => {
      cleanupFakeTimers();

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'startDiscovery',
          delay: 10, // Short delay for real timer test
        },
      ];

      const start = Date.now();
      await testStateTransitions(stateMachine, transitions, {
        useFakeTimers: false,
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(10);
      expect(stateMachine.getState()).toBe('DISCOVERING');
    });

    it('should handle undefined transition in array', async () => {
      const transitions = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'start',
        },
        undefined,
      ] as StateTransitionTest[];

      await expect(testStateTransitions(stateMachine, transitions)).rejects.toThrow(
        'Transition 1: Transition definition is undefined',
      );
    });

    it('should verify expected error message on failure', async () => {
      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'INVALID',
          trigger: 'fail',
          shouldFail: true,
          expectedError: 'wrong error message', // This won't match
        },
      ];

      await expect(testStateTransitions(stateMachine, transitions)).rejects.toThrow(
        "Expected error containing 'wrong error message'",
      );
    });
  });

  describe('testStateTimeouts', () => {
    it('should test basic state timeouts', async () => {
      const timeouts: Record<string, StateTimeoutConfig> = {
        DISCOVERING: {
          timeout: 1000,
          nextState: 'IDLE',
        },
      };

      // Manually set up timeout behavior
      stateMachine.transition = vi.fn(async (to: string) => {
        if (to === 'DISCOVERING') {
          stateMachine['state'] = 'DISCOVERING';
          setTimeout(() => {
            stateMachine['state'] = 'IDLE';
          }, 1000);
        } else {
          stateMachine['state'] = to;
        }
      }) as Mock;

      await testStateTimeouts(stateMachine, timeouts);
      expect(stateMachine.getState()).toBe('IDLE');
    });

    it('should test timeouts with custom validation', async () => {
      let validationRan = false;

      const timeouts: Record<string, StateTimeoutConfig> = {
        DISCOVERING: {
          timeout: 500,
          nextState: 'IDLE',
          validation: async (sm) => {
            validationRan = true;
            expect(sm.getState()).toBe('IDLE');
          },
        },
      };

      // Set up timeout behavior
      stateMachine.transition = vi.fn(async (to: string) => {
        if (to === 'DISCOVERING') {
          stateMachine['state'] = 'DISCOVERING';
          setTimeout(() => {
            stateMachine['state'] = 'IDLE';
          }, 500);
        }
      }) as Mock;

      await testStateTimeouts(stateMachine, timeouts);
      expect(validationRan).toBe(true);
    });

    it('should isolate tests when configured', async () => {
      const resetSpy = vi.spyOn(stateMachine, 'reset');

      const timeouts: Record<string, StateTimeoutConfig> = {
        DISCOVERING: {
          timeout: 100,
          nextState: 'IDLE',
        },
        CONNECTING: {
          timeout: 100,
          nextState: 'IDLE',
        },
      };

      // Simple timeout simulation
      stateMachine.transition = vi.fn(async (to: string) => {
        stateMachine['state'] = to;
        setTimeout(() => {
          stateMachine['state'] = 'IDLE';
        }, 100);
      }) as Mock;

      await testStateTimeouts(stateMachine, timeouts, {
        isolateTests: true,
      });

      expect(resetSpy).toHaveBeenCalledTimes(2); // Reset before each test
    });

    it('should throw on timeout test failure', async () => {
      const timeouts: Record<string, StateTimeoutConfig> = {
        DISCOVERING: {
          timeout: 1000,
          nextState: 'COMPLETED', // Wrong expected state
        },
      };

      // Don't change state on timeout
      stateMachine.transition = vi.fn(async (to: string) => {
        stateMachine['state'] = to;
      }) as Mock;

      await expect(testStateTimeouts(stateMachine, timeouts)).rejects.toThrow(
        "Timeout test failed for state 'DISCOVERING'",
      );
    });

    it('should use real timers when configured', async () => {
      cleanupFakeTimers();

      const timeouts: Record<string, StateTimeoutConfig> = {
        DISCOVERING: {
          timeout: 10,
          nextState: 'IDLE',
        },
      };

      stateMachine.transition = vi.fn(async (to: string) => {
        stateMachine['state'] = to;
        setTimeout(() => {
          stateMachine['state'] = 'IDLE';
        }, 10);
      }) as Mock;

      const start = Date.now();
      await testStateTimeouts(stateMachine, timeouts, {
        useFakeTimers: false,
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(110); // timeout + buffer
    });
  });

  describe('assertStateConsistency', () => {
    it('should check state invariants', async () => {
      const invariants: StateInvariant[] = [
        {
          name: 'State is valid',
          check: async (sm) => {
            const validStates = ['IDLE', 'DISCOVERING', 'CONNECTING', 'CONNECTED', 'COMPLETED'];
            return validStates.includes(sm.getState());
          },
          critical: true,
        },
        {
          name: 'History is consistent',
          check: async (sm) => {
            const history = sm.getStateHistory?.() || [];
            return history.every((entry) => entry.timestamp > 0);
          },
          critical: false,
        },
      ];

      const result = await assertStateConsistency(stateMachine, invariants);

      expect(result.passed).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should throw on critical invariant violation', async () => {
      const invariants: StateInvariant[] = [
        {
          name: 'Always fails',
          check: async () => false,
          critical: true,
        },
      ];

      await expect(assertStateConsistency(stateMachine, invariants)).rejects.toThrow(
        "Invariant 'Always fails' violated in state 'IDLE'",
      );
    });

    it('should warn on non-critical invariant violation', async () => {
      const invariants: StateInvariant[] = [
        {
          name: 'Soft failure',
          check: async () => false,
          critical: false,
        },
      ];

      const result = await assertStateConsistency(stateMachine, invariants);

      expect(result.failed).toHaveLength(1);
      expect(result.warnings).toContain("Invariant 'Soft failure' violated in state 'IDLE'");
    });

    it('should skip invariants not applicable to current state', async () => {
      const invariants: StateInvariant[] = [
        {
          name: 'Only for DISCOVERING',
          check: async () => false, // Would fail if checked
          applicableStates: ['DISCOVERING'],
          critical: true,
        },
      ];

      const result = await assertStateConsistency(stateMachine, invariants);

      expect(result.passed).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle invariant check errors', async () => {
      const invariants: StateInvariant[] = [
        {
          name: 'Error throwing check',
          check: async () => {
            throw new Error('Check error');
          },
          critical: true,
        },
      ];

      await expect(assertStateConsistency(stateMachine, invariants)).rejects.toThrow(
        "Error checking invariant 'Error throwing check': Check error",
      );
    });

    it('should handle non-critical invariant check errors', async () => {
      const invariants: StateInvariant[] = [
        {
          name: 'Error throwing check',
          check: async () => {
            throw new Error('Check error');
          },
          critical: false,
        },
      ];

      const result = await assertStateConsistency(stateMachine, invariants);

      expect(result.failed).toHaveLength(1);
      expect(result.warnings[0]).toContain('Check error');
    });
  });

  describe('createStateMachineTestSuite', () => {
    it('should create comprehensive test suite', () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING', 'CONNECTING', 'CONNECTED', 'COMPLETED'],
        transitions: [{ from: 'IDLE', to: 'DISCOVERING', trigger: 'start' }],
        timeouts: {
          DISCOVERING: { timeout: 3000, nextState: 'IDLE' },
        },
        invariants: [{ name: 'Valid state', check: (sm) => sm.getState() !== 'INVALID' }],
        initialState: 'IDLE',
      });

      expect(suite).toHaveProperty('testBasicBehavior');
      expect(suite).toHaveProperty('testTransitions');
      expect(suite).toHaveProperty('testTimeouts');
      expect(suite).toHaveProperty('testInvariants');
      expect(suite).toHaveProperty('testInvalidTransitions');
      expect(suite).toHaveProperty('testEdgeCases');
      expect(suite).toHaveProperty('runAll');
      expect(suite).toHaveProperty('getCoverageReport');
    });

    it('should test basic behavior', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        initialState: 'IDLE',
      });

      await suite.testBasicBehavior();
      // Should not throw
    });

    it('should throw on invalid current state', async () => {
      stateMachine['state'] = 'INVALID';

      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
      });

      await expect(suite.testBasicBehavior()).rejects.toThrow(
        "Invalid state 'INVALID'. Valid states: IDLE, DISCOVERING",
      );
    });

    it('should test reset functionality', async () => {
      stateMachine.transition('DISCOVERING');

      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        initialState: 'IDLE',
      });

      await suite.testBasicBehavior();
      // Reset should have been tested
    });

    it('should test transitions when configured', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        transitions: [{ from: 'IDLE', to: 'DISCOVERING', trigger: 'start' }],
      });

      await suite.testTransitions();
      // Should use testStateTransitions internally
    });

    it('should skip transitions when none configured', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE'],
      });

      await suite.testTransitions();
      // Should not throw
    });

    it('should test timeouts when configured', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        timeouts: {
          DISCOVERING: { timeout: 100, nextState: 'IDLE' },
        },
      });

      // Mock the timeout behavior
      stateMachine.transition = vi.fn(async (to: string) => {
        stateMachine['state'] = to;
        if (to === 'DISCOVERING') {
          setTimeout(() => {
            stateMachine['state'] = 'IDLE';
          }, 100);
        }
      }) as Mock;

      await suite.testTimeouts();
      // Should use testStateTimeouts internally
    });

    it('should test invariants when configured', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE'],
        invariants: [{ name: 'Always true', check: () => true }],
      });

      await suite.testInvariants();
      // Should not throw
    });

    it('should handle invariant warnings', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE'],
        invariants: [{ name: 'Warning invariant', check: () => false, critical: false }],
      });

      await suite.testInvariants();

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should test invalid transitions', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE'],
      });

      await suite.testInvalidTransitions();
      expect(stateMachine.getState()).toBe('IDLE');
    });

    it('should skip invalid transition test when no transition method', async () => {
      const simpleStateMachine = {
        getState: () => 'IDLE',
      };

      const suite = createStateMachineTestSuite(simpleStateMachine as StateMachine, {
        states: ['IDLE'],
      });

      await suite.testInvalidTransitions();
      // Should not throw
    });

    it('should test edge cases', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        transitions: [{ from: 'IDLE', to: 'DISCOVERING', trigger: 'start' }],
      });

      await suite.testEdgeCases();
      // Should test rapid transitions and concurrency
    });

    it('should handle edge cases with no transitions', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE'],
      });

      await suite.testEdgeCases();
      // Should handle gracefully
    });

    it('should handle concurrent transitions in edge cases', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        transitions: [{ from: 'IDLE', to: 'DISCOVERING', trigger: 'start' }],
      });

      await suite.testEdgeCases();
      expect(stateMachine.getState()).toBe('DISCOVERING');
    });

    it('should throw on undefined transition in edge cases', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING'],
        transitions: [
          undefined as unknown as { from: string; to: string; trigger: string }, // This will cause the error
          { from: 'IDLE', to: 'DISCOVERING', trigger: 'start' },
        ],
      });

      await expect(suite.testEdgeCases()).rejects.toThrow(
        'Transition is undefined despite array length check',
      );
    });

    it('should run all tests', async () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE'],
      });

      const testBasicSpy = vi.spyOn(suite, 'testBasicBehavior');
      const testTransitionsSpy = vi.spyOn(suite, 'testTransitions');
      const testTimeoutsSpy = vi.spyOn(suite, 'testTimeouts');
      const testInvariantsSpy = vi.spyOn(suite, 'testInvariants');
      const testInvalidSpy = vi.spyOn(suite, 'testInvalidTransitions');
      const testEdgeSpy = vi.spyOn(suite, 'testEdgeCases');

      await suite.runAll();

      expect(testBasicSpy).toHaveBeenCalled();
      expect(testTransitionsSpy).toHaveBeenCalled();
      expect(testTimeoutsSpy).toHaveBeenCalled();
      expect(testInvariantsSpy).toHaveBeenCalled();
      expect(testInvalidSpy).toHaveBeenCalled();
      expect(testEdgeSpy).toHaveBeenCalled();
    });

    it('should get coverage report', () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: ['IDLE', 'DISCOVERING', 'CONNECTING', 'CONNECTED'],
        transitions: [
          { from: 'IDLE', to: 'DISCOVERING', trigger: 'start' },
          { from: 'DISCOVERING', to: 'CONNECTING', trigger: 'select' },
        ],
        timeouts: {
          DISCOVERING: { timeout: 1000, nextState: 'IDLE' },
        },
      });

      const report = suite.getCoverageReport();

      expect(report.totalStates).toBe(4);
      expect(report.testedStates.size).toBe(3); // IDLE, DISCOVERING, CONNECTING
      expect(report.totalTransitions).toBe(2);
      expect(report.testedTransitions).toBe(2);
      expect(report.coveragePercentage).toBe(75); // 3/4 states
    });

    it('should handle empty state list in coverage report', () => {
      const suite = createStateMachineTestSuite(stateMachine, {
        states: [],
      });

      const report = suite.getCoverageReport();

      expect(report.totalStates).toBe(0);
      expect(report.coveragePercentage).toBe(0);
    });
  });

  describe('createCommonDiscoveryInvariants', () => {
    it('should create common invariants', () => {
      const invariants = createCommonDiscoveryInvariants();

      expect(invariants).toHaveLength(4);
      expect(invariants[0]?.name).toBe('State is valid string');
      expect(invariants[1]?.name).toBe('State is uppercase');
      expect(invariants[2]?.name).toBe('Can always transition to initial state');
      expect(invariants[3]?.name).toBe('State history is consistent');
    });

    it('should validate state is valid string', async () => {
      const invariants = createCommonDiscoveryInvariants();
      const stateStringInvariant = invariants[0];

      expect(stateStringInvariant).toBeDefined();
      expect(await stateStringInvariant?.check(stateMachine)).toBe(true);

      // Test with invalid state
      const badStateMachine = {
        getState: () => '',
      };
      expect(await stateStringInvariant?.check(badStateMachine as StateMachine)).toBe(false);
    });

    it('should validate state is uppercase', async () => {
      const invariants = createCommonDiscoveryInvariants();
      const uppercaseInvariant = invariants[1];

      expect(uppercaseInvariant).toBeDefined();
      expect(await uppercaseInvariant?.check(stateMachine)).toBe(true);

      // Test with lowercase state
      const lowercaseStateMachine = {
        getState: () => 'idle',
      };
      expect(await uppercaseInvariant?.check(lowercaseStateMachine as StateMachine)).toBe(false);
    });

    it('should validate can transition to initial state', async () => {
      const invariants = createCommonDiscoveryInvariants();
      const transitionInvariant = invariants[2];

      // Should only apply to non-IDLE states
      expect(transitionInvariant).toBeDefined();
      expect(transitionInvariant?.applicableStates).toEqual(['DISCOVERING', 'CONNECTING', 'CONNECTED']);

      // Test with state machine that can transition
      stateMachine.transition('DISCOVERING');
      expect(await transitionInvariant?.check(stateMachine)).toBe(true);

      // Test with state machine without canTransition
      const simpleStateMachine = {
        getState: () => 'DISCOVERING',
      };
      expect(await transitionInvariant?.check(simpleStateMachine as StateMachine)).toBe(true);
    });

    it('should validate state history consistency', async () => {
      const invariants = createCommonDiscoveryInvariants();
      const historyInvariant = invariants[3];

      // Empty history should be valid
      expect(historyInvariant).toBeDefined();
      expect(await historyInvariant?.check(stateMachine)).toBe(true);

      // Add some history
      await stateMachine.transition('DISCOVERING');
      expect(await historyInvariant?.check(stateMachine)).toBe(true);

      // Test with no getStateHistory method
      const noHistoryStateMachine = {
        getState: () => 'IDLE',
      };
      expect(await historyInvariant?.check(noHistoryStateMachine as StateMachine)).toBe(true);

      // Test with inconsistent history
      const inconsistentStateMachine = {
        getState: () => 'IDLE',
        getStateHistory: () => [{ state: 'DISCOVERING', timestamp: Date.now() }],
      };
      expect(await historyInvariant?.check(inconsistentStateMachine as StateMachine)).toBe(false);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle state machine without transition method in testStateTransitions', async () => {
      const minimalStateMachine = {
        getState: () => 'IDLE',
      };

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'ACTIVE',
          trigger: 'activate',
        },
      ];

      // Should complete without error since no transition method exists
      await testStateTransitions(minimalStateMachine as StateMachine, transitions);
      expect(minimalStateMachine.getState()).toBe('IDLE'); // State unchanged
    });

    it('should handle non-Error objects in transition failures', async () => {
      const throwingStateMachine = {
        getState: () => stateMachine.getState(),
        transition: async () => {
          throw 'string error'; // eslint-disable-line no-throw-literal
        },
      };

      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'start',
          shouldFail: true,
        },
      ];

      await testStateTransitions(throwingStateMachine as StateMachine, transitions);
      // Should handle non-Error objects gracefully
    });

    it('should handle validation function errors', async () => {
      const transitions: StateTransitionTest[] = [
        {
          from: 'IDLE',
          to: 'DISCOVERING',
          trigger: 'start',
          validation: async () => {
            throw new Error('Validation error');
          },
        },
      ];

      await expect(testStateTransitions(stateMachine, transitions)).rejects.toThrow(
        'State transition test failed at step 0',
      );
    });
  });
});
