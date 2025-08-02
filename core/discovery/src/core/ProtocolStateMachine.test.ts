import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProtocolStateMachine, type ProtocolState } from './ProtocolStateMachine.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';

describe('ProtocolStateMachine', () => {
  let stateMachine: ProtocolStateMachine;

  beforeEach(() => {
    setupFakeTimers();
    stateMachine = new ProtocolStateMachine();
  });

  afterEach(() => {
    stateMachine.dispose();
    cleanupFakeTimers();
  });

  describe('initialization', () => {
    it('should start in IDLE state', () => {
      expect(stateMachine.getState()).toBe('IDLE');
      expect(stateMachine.isInState('IDLE')).toBe(true);
    });

    it('should have no metadata initially', () => {
      expect(stateMachine.getStateMetadata()).toBeUndefined();
    });

    it('should allow custom timeouts', () => {
      const customStateMachine = new ProtocolStateMachine({
        DISCOVERING: 5000,
      });

      expect(customStateMachine).toBeDefined();
      customStateMachine.dispose();
    });
  });

  describe('state transitions', () => {
    it('should transition from IDLE to DISCOVERING', () => {
      expect(() => stateMachine.transition('DISCOVERING', { sessionId: 'test-123' })).not.toThrow();

      expect(stateMachine.getState()).toBe('DISCOVERING');
      expect(stateMachine.getStateMetadata()).toEqual({ sessionId: 'test-123' });
    });

    it('should transition from DISCOVERING to COMPLETED', () => {
      stateMachine.transition('DISCOVERING', { sessionId: 'test-123' });
      expect(() => stateMachine.transition('COMPLETED', { respondersFound: 2 })).not.toThrow();

      expect(stateMachine.getState()).toBe('COMPLETED');
      expect(stateMachine.getStateMetadata()).toEqual({ respondersFound: 2 });
    });

    it('should prevent invalid transitions', () => {
      // Can't go directly from IDLE to COMPLETED
      expect(() => stateMachine.transition('COMPLETED')).toThrow('Invalid state transition');
      expect(stateMachine.getState()).toBe('IDLE');
    });

    it('should prevent transitioning to same state', () => {
      stateMachine.transition('DISCOVERING');
      expect(() => stateMachine.transition('DISCOVERING')).toThrow('Invalid state transition');
      expect(stateMachine.getState()).toBe('DISCOVERING');
    });

    it('should emit stateChange events', () => {
      const stateChangeHandler = vi.fn();
      stateMachine.on('stateChange', stateChangeHandler);

      stateMachine.transition('DISCOVERING', { sessionId: 'test-123' });

      expect(stateChangeHandler).toHaveBeenCalledWith({
        fromState: 'IDLE',
        toState: 'DISCOVERING',
        timestamp: expect.any(Number),
        metadata: { sessionId: 'test-123' },
      });
    });

    it('should throw error on invalid transition', () => {
      const errorHandler = vi.fn();
      stateMachine.on('error', errorHandler);

      // Try invalid transition
      expect(() => stateMachine.transition('COMPLETED')).toThrow('Invalid state transition');
    });

    it('should update metadata when transitioning', () => {
      stateMachine.transition('DISCOVERING', { sessionId: 'test-123' });
      expect(stateMachine.getStateMetadata()).toEqual({ sessionId: 'test-123' });

      stateMachine.transition('COMPLETED', { respondersFound: 2 });
      expect(stateMachine.getStateMetadata()).toEqual({ respondersFound: 2 });
    });
  });

  describe('single-use session pattern', () => {
    it('should make COMPLETED state terminal', () => {
      stateMachine.transition('DISCOVERING');
      stateMachine.transition('COMPLETED');

      // Should not allow any transitions from COMPLETED
      expect(stateMachine.canTransition('IDLE')).toBe(false);
      expect(stateMachine.canTransition('DISCOVERING')).toBe(false);
      expect(stateMachine.canTransition('ERROR')).toBe(false);
    });

    it('should make ERROR state terminal', () => {
      stateMachine.transition('DISCOVERING');
      stateMachine.transition('ERROR');

      // Should not allow any transitions from ERROR
      expect(stateMachine.canTransition('IDLE')).toBe(false);
      expect(stateMachine.canTransition('DISCOVERING')).toBe(false);
      expect(stateMachine.canTransition('COMPLETED')).toBe(false);
    });

    it('should preserve metadata in terminal states', () => {
      stateMachine.transition('DISCOVERING', { sessionId: 'test-123' });
      stateMachine.transition('COMPLETED', { respondersFound: 2 });

      // Metadata should be preserved in terminal state
      expect(stateMachine.getStateMetadata()).toEqual({ respondersFound: 2 });
    });

    it('should require new instances for subsequent discovery sessions', () => {
      // Complete first session
      stateMachine.transition('DISCOVERING');
      stateMachine.transition('COMPLETED');

      // For new discovery, need a new instance
      const newStateMachine = new ProtocolStateMachine();
      expect(newStateMachine.getState()).toBe('IDLE');
      expect(newStateMachine.canTransition('DISCOVERING')).toBe(true);
    });
  });

  describe('timeouts', () => {
    it('should set timeout for DISCOVERING state', () => {
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      stateMachine.transition('DISCOVERING');

      // Advance time to just before timeout
      vi.advanceTimersByTime(2999);
      expect(timeoutHandler).not.toHaveBeenCalled();

      // Advance past timeout
      vi.advanceTimersByTime(2);
      expect(timeoutHandler).toHaveBeenCalledWith('DISCOVERING');
    });

    it('should not set timeout for COMPLETED state', () => {
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      stateMachine.transition('DISCOVERING');
      stateMachine.transition('COMPLETED');

      // COMPLETED state has no timeout, so advance time significantly
      vi.advanceTimersByTime(100000);
      expect(timeoutHandler).not.toHaveBeenCalled();
    });

    it('should not set timeout for IDLE state', () => {
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      // Already in IDLE
      vi.advanceTimersByTime(100000);
      expect(timeoutHandler).not.toHaveBeenCalled();
    });

    it('should auto-transition to COMPLETED on timeout', () => {
      stateMachine.transition('DISCOVERING');

      vi.advanceTimersByTime(3001);

      expect(stateMachine.getState()).toBe('COMPLETED');
    });

    it('should clear previous timeout when transitioning', () => {
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      stateMachine.transition('DISCOVERING');

      // Transition before timeout
      vi.advanceTimersByTime(1000);
      stateMachine.transition('COMPLETED');

      // Advance past original timeout
      vi.advanceTimersByTime(2500);

      // Should not have fired DISCOVERING timeout
      expect(timeoutHandler).not.toHaveBeenCalledWith('DISCOVERING');
    });

    it('should handle errors during timeout transition', () => {
      const errorHandler = vi.fn();
      stateMachine.on('error', errorHandler);

      stateMachine.transition('DISCOVERING');

      // Mock transition to throw an error during timeout
      const originalTransition = stateMachine.transition.bind(stateMachine);
      stateMachine.transition = vi.fn().mockImplementation((toState, metadata) => {
        if (toState === 'COMPLETED' && metadata?.reason === 'timeout') {
          throw new Error('Transition failed');
        }
        return originalTransition(toState, metadata);
      });

      vi.advanceTimersByTime(3001);

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Transition failed' }),
        'DISCOVERING',
      );
    });
  });

  describe('canTransition', () => {
    it('should check if transition is valid', () => {
      expect(stateMachine.canTransition('DISCOVERING')).toBe(true);
      expect(stateMachine.canTransition('COMPLETED')).toBe(false);

      stateMachine.transition('DISCOVERING');
      expect(stateMachine.canTransition('COMPLETED')).toBe(true);
      expect(stateMachine.canTransition('IDLE')).toBe(false); // DISCOVERING cannot go directly to IDLE
      expect(stateMachine.canTransition('DISCOVERING')).toBe(false);
    });
  });

  describe('isInState', () => {
    it('should correctly check current state', () => {
      expect(stateMachine.isInState('IDLE')).toBe(true);
      expect(stateMachine.isInState('DISCOVERING')).toBe(false);

      stateMachine.transition('DISCOVERING');

      expect(stateMachine.isInState('IDLE')).toBe(false);
      expect(stateMachine.isInState('DISCOVERING')).toBe(true);
    });
  });

  describe('dispose', () => {
    it('should clear timeouts on dispose', () => {
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      stateMachine.transition('DISCOVERING');
      stateMachine.dispose();

      vi.advanceTimersByTime(5000);

      expect(timeoutHandler).not.toHaveBeenCalled();
    });

    it('should remove all listeners on dispose', () => {
      const handler = vi.fn();
      stateMachine.on('stateChange', handler);

      stateMachine.dispose();
      stateMachine.transition('DISCOVERING');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should clear metadata on dispose', () => {
      stateMachine.transition('DISCOVERING', { sessionId: 'test' });

      stateMachine.dispose();

      expect(stateMachine.getStateMetadata()).toBeUndefined();
    });
  });

  describe('event handling', () => {
    it('should handle timeout events properly', () => {
      const userTimeoutHandler = vi.fn();
      stateMachine.on('timeout', userTimeoutHandler);

      stateMachine.transition('DISCOVERING');
      vi.advanceTimersByTime(3001);

      // Both user handler and internal handling should occur
      expect(userTimeoutHandler).toHaveBeenCalledWith('DISCOVERING');
      expect(stateMachine.getState()).toBe('COMPLETED');
    });
  });

  describe('edge cases', () => {
    it('should prevent transitions from terminal states', () => {
      stateMachine.transition('DISCOVERING');
      stateMachine.transition('COMPLETED');

      // Should throw when trying to transition from terminal state
      expect(() => {
        stateMachine.transition('DISCOVERING');
      }).toThrow('Invalid state transition from COMPLETED to DISCOVERING');

      expect(stateMachine.getState()).toBe('COMPLETED');
    });

    it('should handle metadata updates during transitions', () => {
      const meta1 = { sessionId: 'test-1' };

      stateMachine.transition('DISCOVERING', { ...meta1 });

      // Modify original metadata object after transition
      meta1.sessionId = 'modified';

      // Should not affect stored metadata
      expect(stateMachine.getStateMetadata()).toEqual({ sessionId: 'test-1' });
    });

    it('should handle concurrent timeout and manual transition', () => {
      stateMachine.transition('DISCOVERING');

      // Set up handlers
      const timeoutHandler = vi.fn();
      const stateChangeHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);
      stateMachine.on('stateChange', stateChangeHandler);

      // Advance time to just before timeout
      vi.advanceTimersByTime(2999);

      // Manual transition just before timeout
      stateMachine.transition('COMPLETED');

      // Complete the timeout period
      vi.advanceTimersByTime(2);

      // Timeout should not have affected state
      expect(stateMachine.getState()).toBe('COMPLETED');
      expect(timeoutHandler).not.toHaveBeenCalled();
    });
  });

  describe('enhanced validation and error handling', () => {
    it('should reject null/undefined state transitions', () => {
      expect(() => stateMachine.transition(null as unknown as ProtocolState)).toThrow(
        'Target state must be a valid string',
      );
      expect(() => stateMachine.transition(undefined as unknown as ProtocolState)).toThrow(
        'Target state must be a valid string',
      );
      expect(() => stateMachine.transition('' as unknown as ProtocolState)).toThrow(
        'Target state must be a valid string',
      );
    });

    it('should reject invalid state names', () => {
      expect(() => stateMachine.transition('INVALID_STATE' as unknown as ProtocolState)).toThrow(
        'Unknown state: INVALID_STATE',
      );
      expect(() => stateMachine.transition('discovering' as unknown as ProtocolState)).toThrow(
        'Unknown state: discovering',
      );
      expect(() => stateMachine.transition('CONNECTED' as unknown as ProtocolState)).toThrow(
        'Unknown state: CONNECTED',
      );
    });

    it('should validate metadata is plain object', () => {
      expect(() =>
        stateMachine.transition('DISCOVERING', 'invalid-metadata' as unknown as Record<string, unknown>),
      ).toThrow('Metadata must be a plain object');
      expect(() => stateMachine.transition('DISCOVERING', 123 as unknown as Record<string, unknown>)).toThrow(
        'Metadata must be a plain object',
      );
      expect(() =>
        stateMachine.transition('DISCOVERING', ['array'] as unknown as Record<string, unknown>),
      ).toThrow('Metadata must be a plain object');
      expect(() =>
        stateMachine.transition('DISCOVERING', new Date() as unknown as Record<string, unknown>),
      ).toThrow('Metadata must be a plain object');
    });

    it('should allow null metadata', () => {
      expect(() =>
        stateMachine.transition('DISCOVERING', null as unknown as Record<string, unknown>),
      ).not.toThrow();
      expect(stateMachine.getStateMetadata()).toBeUndefined();
    });

    it('should handle canTransition with invalid inputs', () => {
      expect(stateMachine.canTransition(null as unknown as ProtocolState)).toBe(false);
      expect(stateMachine.canTransition(undefined as unknown as ProtocolState)).toBe(false);
      expect(stateMachine.canTransition('' as unknown as ProtocolState)).toBe(false);
      expect(stateMachine.canTransition('INVALID' as unknown as ProtocolState)).toBe(false);
      expect(stateMachine.canTransition(123 as unknown as ProtocolState)).toBe(false);
    });

    it('should handle transition errors and rollback', () => {
      // Mock the setStateTimeout method to throw an error only on the first call
      const originalSetStateTimeout = (
        stateMachine as unknown as { setStateTimeout: (state: string) => void }
      ).setStateTimeout;
      let callCount = 0;
      (stateMachine as unknown as { setStateTimeout: (state: string) => void }).setStateTimeout = vi
        .fn()
        .mockImplementation((state: string) => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Timeout setup failed');
          }
          // On subsequent calls (during rollback), use the original method
          return originalSetStateTimeout.call(stateMachine, state);
        });

      const errorHandler = vi.fn();
      stateMachine.on('error', errorHandler);

      expect(() => stateMachine.transition('DISCOVERING')).toThrow('State transition failed');
      expect(stateMachine.getState()).toBe('IDLE'); // Should rollback
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('State transition failed') }),
        'IDLE',
      );

      // Restore original method
      (stateMachine as unknown as { setStateTimeout: (state: string) => void }).setStateTimeout =
        originalSetStateTimeout;
    });

    it('should handle timeout callback safety checks', () => {
      stateMachine.transition('DISCOVERING');

      // Get the timeout handler by accessing it directly
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      // Manually change state to simulate race condition
      (stateMachine as unknown as { currentState: string }).currentState = 'COMPLETED';

      // Advance time to trigger timeout
      vi.advanceTimersByTime(3001);

      // Timeout should not fire for the wrong state
      expect(timeoutHandler).not.toHaveBeenCalled();
    });

    it('should handle disposed state machine timeout', () => {
      stateMachine.transition('DISCOVERING');

      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      // Clear timeout reference to simulate disposal
      (stateMachine as unknown as { stateTimeout: ReturnType<typeof setTimeout> | undefined }).stateTimeout =
        undefined;

      vi.advanceTimersByTime(3001);

      // Should not crash or emit events
      expect(timeoutHandler).not.toHaveBeenCalled();
    });

    it('should handle timeout error during transition', () => {
      stateMachine.transition('DISCOVERING');

      const errorHandler = vi.fn();
      stateMachine.on('error', errorHandler);

      // Mock transition to throw error during timeout
      const originalTransition = stateMachine.transition.bind(stateMachine);
      stateMachine.transition = vi.fn().mockImplementation((toState, metadata) => {
        if (toState === 'COMPLETED' && metadata?.reason === 'timeout') {
          throw new Error('Transition error in timeout');
        }
        return originalTransition(toState, metadata);
      });

      vi.advanceTimersByTime(3001);

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Transition error in timeout' }),
        'DISCOVERING',
      );
    });

    it('should handle setStateTimeout with non-existent timeout', () => {
      // Create machine with only DISCOVERING timeout
      const customMachine = new ProtocolStateMachine({ DISCOVERING: 1000 });

      // Transition to state that doesn't have timeout configured
      customMachine.transition('DISCOVERING');
      customMachine.transition('COMPLETED');

      // Should not crash when trying to set timeout for COMPLETED
      expect(customMachine.getState()).toBe('COMPLETED');

      customMachine.dispose();
    });

    it('should preserve metadata in single-use session pattern', () => {
      stateMachine.transition('DISCOVERING', { sessionId: 'test' });
      expect(stateMachine.getStateMetadata()).toEqual({ sessionId: 'test' });

      stateMachine.transition('COMPLETED', { result: 'success' });
      // Metadata should be updated to the terminal state metadata
      expect(stateMachine.getStateMetadata()).toEqual({ result: 'success' });
    });

    it('should preserve metadata defensive copies', () => {
      const metadata = { sessionId: 'test', data: { nested: 'value' } };
      stateMachine.transition('DISCOVERING', metadata);

      // Modify original metadata
      metadata.sessionId = 'modified';

      // Get stored metadata
      const storedMetadata = stateMachine.getStateMetadata();

      // Top-level properties should be protected
      expect(storedMetadata?.['sessionId']).toBe('test');

      // Note: Nested objects are not deep-cloned (shallow copy only)
      // This is a known limitation of the current implementation
      (metadata.data as { nested: string }).nested = 'modified';
      expect((storedMetadata?.['data'] as { nested: string })?.nested).toBe('modified');
    });

    it('should handle multiple dispose calls safely', () => {
      stateMachine.transition('DISCOVERING');

      expect(() => {
        stateMachine.dispose();
        stateMachine.dispose();
        stateMachine.dispose();
      }).not.toThrow();

      // Should not crash on subsequent operations
      expect(stateMachine.getState()).toBe('DISCOVERING');
    });

    it('should handle timeout for IDLE state correctly', () => {
      // IDLE state should never have timeout
      const timeoutHandler = vi.fn();
      stateMachine.on('timeout', timeoutHandler);

      // Already in IDLE state
      vi.advanceTimersByTime(10000);
      expect(timeoutHandler).not.toHaveBeenCalled();

      // Terminal states should not have timeouts
      stateMachine.transition('DISCOVERING');
      stateMachine.transition('COMPLETED');
      vi.advanceTimersByTime(10000);
      expect(timeoutHandler).not.toHaveBeenCalled();
    });

    it('should validate state machine is not in invalid state after errors', () => {
      // Force an error during transition
      const originalSetTimeout = globalThis.setTimeout;
      globalThis.setTimeout = vi.fn().mockImplementation(() => {
        throw new Error('setTimeout failed');
      }) as unknown as typeof setTimeout;

      const errorHandler = vi.fn();
      stateMachine.on('error', errorHandler);

      expect(() => stateMachine.transition('DISCOVERING')).toThrow();
      expect(stateMachine.getState()).toBe('IDLE'); // Should be rolled back

      // Restore setTimeout
      globalThis.setTimeout = originalSetTimeout;
    });
  });

  describe('createProtocolStateMachine factory', () => {
    it('should create state machine with default config', async () => {
      const { createProtocolStateMachine } = await import('./ProtocolStateMachine.js');
      const machine = createProtocolStateMachine();

      expect(machine.getState()).toBe('IDLE');
      expect(machine.canTransition('DISCOVERING')).toBe(true);

      machine.dispose();
    });

    it('should create state machine with custom timeouts', async () => {
      const { createProtocolStateMachine } = await import('./ProtocolStateMachine.js');
      const machine = createProtocolStateMachine({
        DISCOVERING: 5000,
      });

      expect(machine.getState()).toBe('IDLE');

      machine.dispose();
    });

    it('should create multiple independent state machines', async () => {
      const { createProtocolStateMachine } = await import('./ProtocolStateMachine.js');
      const machine1 = createProtocolStateMachine();
      const machine2 = createProtocolStateMachine();

      machine1.transition('DISCOVERING');
      expect(machine1.getState()).toBe('DISCOVERING');
      expect(machine2.getState()).toBe('IDLE');

      machine1.dispose();
      machine2.dispose();
    });
  });
});
