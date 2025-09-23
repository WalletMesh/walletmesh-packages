/**
 * Tests for modalEvents.ts
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import {
  type ClosedEvent,
  type ClosingEvent,
  type ModalErrorEvent,
  type ModalEvent,
  ModalEventType,
  type OpenedEvent,
  type OpeningEvent,
  type ViewChangedEvent,
  type ViewChangingEvent,
} from './modalEvents.js';

// Install custom matchers
installCustomMatchers();

describe('modalEvents', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('ModalEventType enum', () => {
    it('should have all expected event types', () => {
      expect(ModalEventType.Opening).toBe('opening');
      expect(ModalEventType.Opened).toBe('opened');
      expect(ModalEventType.Closing).toBe('closing');
      expect(ModalEventType.Closed).toBe('closed');
      expect(ModalEventType.ViewChanging).toBe('viewChanging');
      expect(ModalEventType.ViewChanged).toBe('viewChanged');
      expect(ModalEventType.Error).toBe('error');
    });

    it('should have string values for all event types', () => {
      const values = Object.values(ModalEventType);
      expect(values).toHaveLength(7);

      for (const value of values) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });

    it('should have unique values for all event types', () => {
      const values = Object.values(ModalEventType);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Event interfaces', () => {
    describe('OpeningEvent', () => {
      it('should have correct type structure', () => {
        const event: OpeningEvent = {
          type: ModalEventType.Opening,
        };

        expect(event.type).toBe('opening');
        expect(typeof event.type).toBe('string');
      });

      it('should be assignable to ModalEvent union', () => {
        const event: OpeningEvent = {
          type: ModalEventType.Opening,
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('opening');
      });
    });

    describe('OpenedEvent', () => {
      it('should have correct type structure', () => {
        const event: OpenedEvent = {
          type: ModalEventType.Opened,
        };

        expect(event.type).toBe('opened');
        expect(typeof event.type).toBe('string');
      });

      it('should be assignable to ModalEvent union', () => {
        const event: OpenedEvent = {
          type: ModalEventType.Opened,
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('opened');
      });
    });

    describe('ClosingEvent', () => {
      it('should have correct type structure', () => {
        const event: ClosingEvent = {
          type: ModalEventType.Closing,
        };

        expect(event.type).toBe('closing');
        expect(typeof event.type).toBe('string');
      });

      it('should be assignable to ModalEvent union', () => {
        const event: ClosingEvent = {
          type: ModalEventType.Closing,
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('closing');
      });
    });

    describe('ClosedEvent', () => {
      it('should have correct type structure', () => {
        const event: ClosedEvent = {
          type: ModalEventType.Closed,
        };

        expect(event.type).toBe('closed');
        expect(typeof event.type).toBe('string');
      });

      it('should be assignable to ModalEvent union', () => {
        const event: ClosedEvent = {
          type: ModalEventType.Closed,
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('closed');
      });
    });

    describe('ViewChangingEvent', () => {
      it('should have correct type structure', () => {
        const event: ViewChangingEvent = {
          type: ModalEventType.ViewChanging,
          fromView: 'walletSelection',
          toView: 'connecting',
          cancelable: true,
        };

        expect(event.type).toBe('viewChanging');
        expect(event.fromView).toBe('walletSelection');
        expect(event.toView).toBe('connecting');
        expect(event.cancelable).toBe(true);
      });

      it('should support different view transitions', () => {
        const events: ViewChangingEvent[] = [
          {
            type: ModalEventType.ViewChanging,
            fromView: 'walletSelection',
            toView: 'connecting',
            cancelable: true,
          },
          {
            type: ModalEventType.ViewChanging,
            fromView: 'connecting',
            toView: 'connected',
            cancelable: false,
          },
          {
            type: ModalEventType.ViewChanging,
            fromView: 'connected',
            toView: 'error',
            cancelable: false,
          },
        ];

        for (const event of events) {
          expect(typeof event.fromView).toBe('string');
          expect(typeof event.toView).toBe('string');
          expect(typeof event.cancelable).toBe('boolean');
        }
      });

      it('should be assignable to ModalEvent union', () => {
        const event: ViewChangingEvent = {
          type: ModalEventType.ViewChanging,
          fromView: 'walletSelection',
          toView: 'connecting',
          cancelable: true,
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('viewChanging');
      });
    });

    describe('ViewChangedEvent', () => {
      it('should have correct type structure', () => {
        const event: ViewChangedEvent = {
          type: ModalEventType.ViewChanged,
          previousView: 'walletSelection',
          currentView: 'connecting',
        };

        expect(event.type).toBe('viewChanged');
        expect(event.previousView).toBe('walletSelection');
        expect(event.currentView).toBe('connecting');
      });

      it('should support different view states', () => {
        const viewStates = ['walletSelection', 'providerSelection', 'connecting', 'connected', 'error'];

        for (let i = 0; i < viewStates.length - 1; i++) {
          const previousView = viewStates[i];
          const currentView = viewStates[i + 1];
          if (!previousView || !currentView) continue;

          const event: ViewChangedEvent = {
            type: ModalEventType.ViewChanged,
            previousView,
            currentView,
          };

          expect(typeof event.previousView).toBe('string');
          expect(typeof event.currentView).toBe('string');
          expect(event.previousView).not.toBe(event.currentView);
        }
      });

      it('should be assignable to ModalEvent union', () => {
        const event: ViewChangedEvent = {
          type: ModalEventType.ViewChanged,
          previousView: 'walletSelection',
          currentView: 'connecting',
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('viewChanged');
      });
    });

    describe('ModalErrorEvent', () => {
      it('should have correct type structure with Error object', () => {
        const error = new Error('Test modal error');
        const event: ModalErrorEvent = {
          type: ModalEventType.Error,
          error,
        };

        expect(event.type).toBe('error');
        expect(event.error).toBe(error);
        expect(event.error instanceof Error).toBe(true);
        expect(event.error.message).toBe('Test modal error');
      });

      it('should support different error types', () => {
        const errors = [
          new Error('Generic error'),
          new TypeError('Type error'),
          new RangeError('Range error'),
        ];

        for (const error of errors) {
          const event: ModalErrorEvent = {
            type: ModalEventType.Error,
            error,
          };

          expect(event.error).toBe(error);
          expect(event.error instanceof Error).toBe(true);
        }
      });

      it('should be assignable to ModalEvent union', () => {
        const event: ModalErrorEvent = {
          type: ModalEventType.Error,
          error: new Error('Test error'),
        };

        const modalEvent: ModalEvent = event;
        expect(modalEvent.type).toBe('error');
      });
    });
  });

  describe('ModalEvent union type', () => {
    it('should support all modal event types', () => {
      const events: ModalEvent[] = [
        { type: ModalEventType.Opening },
        { type: ModalEventType.Opened },
        { type: ModalEventType.Closing },
        { type: ModalEventType.Closed },
        {
          type: ModalEventType.ViewChanging,
          fromView: 'walletSelection',
          toView: 'connecting',
          cancelable: true,
        },
        {
          type: ModalEventType.ViewChanged,
          previousView: 'connecting',
          currentView: 'connected',
        },
        {
          type: ModalEventType.Error,
          error: new Error('Test error'),
        },
      ];

      expect(events).toHaveLength(7);

      // Verify each event has correct type
      expect(events.length).toBe(7);
      expect(events[0]?.type).toBe('opening');
      expect(events[1]?.type).toBe('opened');
      expect(events[2]?.type).toBe('closing');
      expect(events[3]?.type).toBe('closed');
      expect(events[4]?.type).toBe('viewChanging');
      expect(events[5]?.type).toBe('viewChanged');
      expect(events[6]?.type).toBe('error');
    });

    it('should allow type discrimination', () => {
      const events: ModalEvent[] = [
        { type: ModalEventType.Opening },
        {
          type: ModalEventType.ViewChanging,
          fromView: 'walletSelection',
          toView: 'connecting',
          cancelable: true,
        },
        {
          type: ModalEventType.Error,
          error: new Error('Test error'),
        },
      ];

      for (const event of events) {
        switch (event.type) {
          case ModalEventType.Opening:
          case ModalEventType.Opened:
          case ModalEventType.Closing:
          case ModalEventType.Closed:
            // These should not have additional properties
            expect(Object.keys(event)).toEqual(['type']);
            break;
          case ModalEventType.ViewChanging:
            // Should have view transition properties
            expect('fromView' in event).toBe(true);
            expect('toView' in event).toBe(true);
            expect('cancelable' in event).toBe(true);
            break;
          case ModalEventType.ViewChanged:
            // Should have view state properties
            expect('previousView' in event).toBe(true);
            expect('currentView' in event).toBe(true);
            break;
          case ModalEventType.Error:
            // Should have error property
            expect('error' in event).toBe(true);
            expect(event.error instanceof Error).toBe(true);
            break;
          default: {
            // TypeScript should ensure this never happens
            const _exhaustiveCheck: never = event;
            expect.fail(`Unexpected event type: ${_exhaustiveCheck}`);
          }
        }
      }
    });
  });

  describe('Event creation and validation', () => {
    it('should create valid opening event', () => {
      const event: OpeningEvent = {
        type: ModalEventType.Opening,
      };

      expect(event).toEqual({
        type: 'opening',
      });
    });

    it('should create valid view changing event', () => {
      const event: ViewChangingEvent = {
        type: ModalEventType.ViewChanging,
        fromView: 'walletSelection',
        toView: 'connecting',
        cancelable: true,
      };

      expect(event).toEqual({
        type: 'viewChanging',
        fromView: 'walletSelection',
        toView: 'connecting',
        cancelable: true,
      });
    });

    it('should create valid error event', () => {
      const error = new Error('Connection failed');
      const event: ModalErrorEvent = {
        type: ModalEventType.Error,
        error,
      };

      expect(event.type).toBe('error');
      expect(event.error).toBe(error);
      expect(event.error.message).toBe('Connection failed');
    });
  });
});
