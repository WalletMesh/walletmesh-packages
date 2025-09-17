import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InitiatorStateMachine, createInitiatorStateMachine } from './InitiatorStateMachine.js';
import { DISCOVERY_EVENTS, DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import { createConsoleSpy } from '../testing/consoleMocks.js';
import type {
  DiscoveryRequestEvent,
  DiscoveryCompleteEvent,
  DiscoveryErrorEvent,
  InitiatorInfo,
} from '../types/core.js';
import type { CapabilityRequirements } from '../types/capabilities.js';

describe('InitiatorStateMachine', () => {
  let mockEventTarget: EventTarget;
  let dispatchedEvents: CustomEvent[] = [];
  let stateMachine: InitiatorStateMachine;

  const testInitiatorInfo: InitiatorInfo = {
    name: 'Test DApp',
    url: 'https://testdapp.com',
    icon: 'data:image/svg+xml;base64,test',
  };

  const testRequirements: CapabilityRequirements = {
    technologies: [
      {
        type: 'evm' as const,
        interfaces: ['eip-1193'],
      },
    ],
    features: ['account-management'],
  };

  beforeEach(() => {
    vi.useFakeTimers();
    dispatchedEvents = [];

    // Create mock event target that captures dispatched events
    mockEventTarget = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn((event: Event) => {
        if (event instanceof CustomEvent) {
          dispatchedEvents.push(event);
        }
        return true;
      }),
    };

    stateMachine = new InitiatorStateMachine({
      eventTarget: mockEventTarget,
      sessionId: 'test-session-123',
      origin: 'https://testdapp.com',
      initiatorInfo: testInitiatorInfo,
      requirements: testRequirements,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    stateMachine.dispose();
  });

  describe('constructor', () => {
    it('should create state machine in IDLE state', () => {
      expect(stateMachine.getState()).toBe('IDLE');
    });

    it('should store session ID', () => {
      expect(stateMachine.getSessionId()).toBe('test-session-123');
    });

    it('should use window as default event target in browser environment', () => {
      const originalWindow = globalThis.window;
      globalThis.window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as Window & typeof globalThis;

      const sm = new InitiatorStateMachine({
        sessionId: 'test-session',
        origin: 'https://example.com',
        initiatorInfo: testInitiatorInfo,
        requirements: testRequirements,
      });

      sm.transition('DISCOVERING');
      expect(globalThis.window.dispatchEvent).toHaveBeenCalled();

      sm.dispose();
      globalThis.window = originalWindow;
    });
  });

  describe('IDLE → DISCOVERING transition', () => {
    it('should automatically send discovery request', () => {
      stateMachine.transition('DISCOVERING');

      expect(dispatchedEvents).toHaveLength(1);
      const event = dispatchedEvents[0];
      expect(event).toBeDefined();
      expect(event?.type).toBe(DISCOVERY_EVENTS.REQUEST);

      const request = event?.detail as DiscoveryRequestEvent;
      expect(request).toMatchObject({
        type: DISCOVERY_EVENTS.REQUEST,
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: 'test-session-123',
        origin: 'https://testdapp.com',
        initiatorInfo: testInitiatorInfo,
        required: testRequirements,
      });
    });

    it('should include optional preferences if provided', () => {
      const smWithPrefs = new InitiatorStateMachine({
        eventTarget: mockEventTarget,
        sessionId: 'test-session-456',
        origin: 'https://testdapp.com',
        initiatorInfo: testInitiatorInfo,
        requirements: testRequirements,
        preferences: {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: ['hardware-wallet'],
        },
      });

      smWithPrefs.transition('DISCOVERING');

      const event = dispatchedEvents[0];
      expect(event).toBeDefined();
      const request = event?.detail as DiscoveryRequestEvent;
      expect(request.optional).toEqual({
        technologies: [
          {
            type: 'evm' as const,
            interfaces: ['eip-1193'],
          },
        ],
        features: ['hardware-wallet'],
      });

      smWithPrefs.dispose();
    });

    it('should not send duplicate requests on invalid transitions', () => {
      stateMachine.transition('DISCOVERING');
      expect(dispatchedEvents).toHaveLength(1);

      // Try invalid transition from DISCOVERING to DISCOVERING
      expect(() => stateMachine.transition('DISCOVERING')).toThrow();
      expect(dispatchedEvents).toHaveLength(1); // No additional event
    });
  });

  describe('DISCOVERING → COMPLETED transition', () => {
    beforeEach(() => {
      stateMachine.transition('DISCOVERING');
      dispatchedEvents = []; // Clear request event
    });

    it('should automatically send discovery complete with timeout reason', () => {
      stateMachine.transition('COMPLETED', { reason: 'timeout' });

      expect(dispatchedEvents).toHaveLength(1);
      const event = dispatchedEvents[0];
      expect(event).toBeDefined();
      expect(event?.type).toBe(DISCOVERY_EVENTS.COMPLETE);

      const complete = event?.detail as DiscoveryCompleteEvent;
      expect(complete).toMatchObject({
        type: DISCOVERY_EVENTS.COMPLETE,
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: 'test-session-123',
        reason: 'timeout',
        respondersFound: 0,
      });
    });

    it('should handle manual stop reason', () => {
      stateMachine.transition('COMPLETED', {
        reason: 'manual-stop',
        respondersFound: 3,
      });

      const complete = dispatchedEvents[0]?.detail as DiscoveryCompleteEvent;
      expect(complete?.reason).toBe('manual-stop');
      expect(complete?.respondersFound).toBe(3);
    });

    it('should handle max responders reason', () => {
      stateMachine.transition('COMPLETED', {
        reason: 'max-responders',
        respondersFound: 10,
      });

      const complete = dispatchedEvents[0]?.detail as DiscoveryCompleteEvent;
      expect(complete?.reason).toBe('max-responders');
      expect(complete?.respondersFound).toBe(10);
    });

    it('should default to timeout reason if not specified', () => {
      stateMachine.transition('COMPLETED');

      const complete = dispatchedEvents[0]?.detail as DiscoveryCompleteEvent;
      expect(complete?.reason).toBe('timeout');
    });

    it('should handle discovery-stopped as manual-stop', () => {
      stateMachine.transition('COMPLETED', {
        reason: 'discovery-stopped',
        respondersFound: 2,
      });

      const complete = dispatchedEvents[0]?.detail as DiscoveryCompleteEvent;
      expect(complete?.reason).toBe('manual-stop');
    });
  });

  describe('DISCOVERING → ERROR transition', () => {
    beforeEach(() => {
      stateMachine.transition('DISCOVERING');
      dispatchedEvents = []; // Clear request event
    });

    it('should automatically send discovery error', () => {
      stateMachine.transition('ERROR', {
        errorCode: 2004,
        errorMessage: 'Duplicate response detected',
        errorCategory: 'security',
      });

      expect(dispatchedEvents).toHaveLength(1);
      const event = dispatchedEvents[0];
      expect(event).toBeDefined();
      expect(event?.type).toBe(DISCOVERY_EVENTS.ERROR);

      const error = event?.detail as DiscoveryErrorEvent;
      expect(error).toMatchObject({
        type: DISCOVERY_EVENTS.ERROR,
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: 'test-session-123',
        errorCode: 2004,
        errorMessage: 'Duplicate response detected',
        errorCategory: 'security',
      });
    });

    it('should use default error values if not provided', () => {
      stateMachine.transition('ERROR');

      const error = dispatchedEvents[0]?.detail as DiscoveryErrorEvent;
      expect(error?.errorCode).toBe(5001);
      expect(error?.errorMessage).toBe('Discovery failed');
      expect(error?.errorCategory).toBe('internal');
    });
  });

  describe('error handling', () => {
    it('should emit error event if message dispatch fails', () => {
      const errorHandler = vi.fn();
      stateMachine.on('error', errorHandler);

      // Make dispatch throw an error
      mockEventTarget.dispatchEvent = vi.fn(() => {
        throw new Error('Dispatch failed');
      });

      // Transition should succeed even if dispatch fails
      expect(() => stateMachine.transition('DISCOVERING')).not.toThrow();
      expect(stateMachine.getState()).toBe('DISCOVERING');

      // Error event should be emitted
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error), 'DISCOVERING');
    });

    it('should log error to console if dispatch fails', () => {
      const consoleSpy = createConsoleSpy({ methods: ['error'], mockFn: () => vi.fn() });

      mockEventTarget.dispatchEvent = vi.fn(() => {
        throw new Error('Dispatch failed');
      });

      stateMachine.transition('DISCOVERING');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[WalletMesh] Failed to dispatch discovery message:',
        expect.any(Error),
      );

      consoleSpy.restore();
    });
  });

  describe('state machine lifecycle', () => {
    it('should handle complete discovery lifecycle', async () => {
      // Start discovery
      stateMachine.transition('DISCOVERING');
      expect(dispatchedEvents).toHaveLength(1);
      expect(dispatchedEvents[0]?.type).toBe(DISCOVERY_EVENTS.REQUEST);

      // Check state before timeout
      expect(stateMachine.getState()).toBe('DISCOVERING');

      // Simulate timeout - state machine should auto-transition to COMPLETED
      await vi.advanceTimersByTimeAsync(3000);
      expect(stateMachine.getState()).toBe('COMPLETED');

      // Should have sent both request and complete events
      expect(dispatchedEvents).toHaveLength(2);
      expect(dispatchedEvents[1]?.type).toBe(DISCOVERY_EVENTS.COMPLETE);

      // State should be terminal
      expect(() => stateMachine.transition('DISCOVERING')).toThrow();
    });

    it('should handle error during discovery', () => {
      // Start discovery
      stateMachine.transition('DISCOVERING');

      // Error occurs
      stateMachine.transition('ERROR', {
        errorCode: 3001,
        errorMessage: 'Rate limit exceeded',
        errorCategory: 'network',
      });

      expect(dispatchedEvents).toHaveLength(2);
      expect(dispatchedEvents[0]?.type).toBe(DISCOVERY_EVENTS.REQUEST);
      expect(dispatchedEvents[1]?.type).toBe(DISCOVERY_EVENTS.ERROR);

      // State should be terminal
      expect(stateMachine.getState()).toBe('ERROR');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration except sessionId', () => {
      const newInitiatorInfo: InitiatorInfo = {
        name: 'Updated DApp',
        url: 'https://updated.com',
        icon: 'data:image/png;base64,updated',
      };

      stateMachine.updateConfig({
        initiatorInfo: newInitiatorInfo,
        origin: 'https://neworigin.com',
      });

      // Session ID should remain unchanged
      expect(stateMachine.getSessionId()).toBe('test-session-123');

      // Start discovery with updated config
      stateMachine.transition('DISCOVERING');

      const request = dispatchedEvents[0]?.detail as DiscoveryRequestEvent;
      expect(request.initiatorInfo).toEqual(newInitiatorInfo);
      expect(request.origin).toBe('https://neworigin.com');
      expect(request.sessionId).toBe('test-session-123'); // Unchanged
    });
  });

  describe('createInitiatorStateMachine', () => {
    it('should create state machine with factory function', () => {
      const sm = createInitiatorStateMachine({
        eventTarget: mockEventTarget,
        sessionId: 'factory-session',
        origin: 'https://factory.com',
        initiatorInfo: testInitiatorInfo,
        requirements: testRequirements,
        timeouts: {
          DISCOVERING: 5000,
        },
      });

      expect(sm).toBeInstanceOf(InitiatorStateMachine);
      expect(sm.getSessionId()).toBe('factory-session');
      expect(sm.getState()).toBe('IDLE');

      sm.dispose();
    });
  });

  describe('edge cases', () => {
    it('should only send messages for valid state transitions', () => {
      // COMPLETED → anywhere should not send messages
      stateMachine.transition('DISCOVERING');
      stateMachine.transition('COMPLETED');
      dispatchedEvents = [];

      // Terminal state - no transitions allowed
      expect(() => stateMachine.transition('IDLE')).toThrow();
      expect(dispatchedEvents).toHaveLength(0);
    });

    it('should handle missing metadata gracefully', () => {
      stateMachine.transition('DISCOVERING');
      dispatchedEvents = [];

      // Transition without metadata
      stateMachine.transition('COMPLETED');

      const complete = dispatchedEvents[0]?.detail as DiscoveryCompleteEvent;
      expect(complete?.reason).toBe('timeout');
      expect(complete?.respondersFound).toBe(0);
    });

    it('should handle non-browser environments', () => {
      const originalWindow = globalThis.window;
      (globalThis as unknown as Record<string, unknown>)['window'] = undefined;

      const sm = new InitiatorStateMachine({
        sessionId: 'no-window-session',
        origin: 'https://example.com',
        initiatorInfo: testInitiatorInfo,
        requirements: testRequirements,
      });

      // Should create with fallback EventTarget
      expect(sm.getState()).toBe('IDLE');

      sm.dispose();
      if (originalWindow) {
        globalThis.window = originalWindow;
      }
    });
  });
});
