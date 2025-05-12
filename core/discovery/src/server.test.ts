import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscoveryListener, createDiscoveryListener } from './server.js';
import { WmDiscovery, WM_PROTOCOL_VERSION } from './constants.js';
import type { DiscoveryResponseEvent, DiscoveryAckEvent } from './types.js';

// Example data URI for a small test icon (1x1 pixel transparent PNG)
const TEST_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

describe('DiscoveryListener', () => {
  let mockEventTarget: EventTarget;
  const technologies = ['test-tech'];

  beforeEach(() => {
    mockEventTarget = new EventTarget();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('factory function', () => {
    it('should create a DiscoveryListener with provided technologies and callback', () => {
      const callback = vi.fn();
      const listener = createDiscoveryListener(technologies, callback);

      expect(listener).toBeInstanceOf(DiscoveryListener);
      expect(listener['technologies']).toEqual(technologies);
      expect(listener['callback']).toBe(callback);
    });

    it('should create a DiscoveryListener with just technologies', () => {
      const listener = createDiscoveryListener(technologies);

      expect(listener).toBeInstanceOf(DiscoveryListener);
      expect(listener['technologies']).toEqual(technologies);
      expect(listener['callback']).toBeNull();
    });
  });

  it('should initialize event listeners upon calling start()', () => {
    const listener = new DiscoveryListener({ technologies });
    const addEventListenerSpy = vi.spyOn(mockEventTarget, 'addEventListener');

    listener['eventTarget'] = mockEventTarget;
    listener.start();

    expect(addEventListenerSpy).toHaveBeenCalledWith(WmDiscovery.Ready, expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith(WmDiscovery.Response, expect.any(Function));
  });

  it('should dispatch a DiscoveryRequestEvent upon calling start()', () => {
    const handler = vi.fn();
    mockEventTarget.addEventListener(WmDiscovery.Request, handler);

    const listener = new DiscoveryListener({
      eventTarget: mockEventTarget,
    });

    listener.start();

    expect(handler).toHaveBeenCalled();
    const eventArg = handler.mock.calls[0]?.[0] as CustomEvent;
    expect(eventArg?.detail?.version).toBe(WM_PROTOCOL_VERSION);
    expect(eventArg?.detail?.discoveryId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should clean up readyTimeout when calling stop()', () => {
    const listener = new DiscoveryListener({ technologies });
    listener['eventTarget'] = mockEventTarget;

    listener.start();
    mockEventTarget.dispatchEvent(new Event(WmDiscovery.Ready));

    // Verify timeout is set
    expect(listener['readyTimeout']).not.toBeNull();

    listener.stop();

    // Verify timeout is cleared
    expect(listener['readyTimeout']).toBeNull();
  });

  it('should not error when stopping with no active timeout', () => {
    const listener = new DiscoveryListener({ technologies });
    listener['eventTarget'] = mockEventTarget;

    listener.start();
    // No Ready event dispatched, so no timeout set
    expect(() => listener.stop()).not.toThrow();
    expect(listener['readyTimeout']).toBeNull();
  });

  it('should dispatch a DiscoveryRequestEvent with technologies', () => {
    const handler = vi.fn();
    mockEventTarget.addEventListener(WmDiscovery.Request, handler);

    const listener = new DiscoveryListener({
      technologies,
      eventTarget: mockEventTarget,
    });

    listener.start();

    expect(handler).toHaveBeenCalled();
    const eventArg = handler.mock.calls[0]?.[0] as CustomEvent;
    expect(eventArg?.detail?.technologies).toEqual(technologies);
  });

  it('should dispatch a DiscoveryRequestEvent without technologies if empty', () => {
    const handler = vi.fn();
    mockEventTarget.addEventListener(WmDiscovery.Request, handler);

    const listener = new DiscoveryListener({
      eventTarget: mockEventTarget,
    });

    listener.start();

    expect(handler).toHaveBeenCalled();
    const eventArg = handler.mock.calls[0]?.[0] as CustomEvent;
    expect(eventArg?.detail?.technologies).toBeUndefined();
  });

  it('should remove event listeners upon calling stop()', () => {
    const listener = new DiscoveryListener({ technologies });
    const removeEventListenerSpy = vi.spyOn(mockEventTarget, 'removeEventListener');

    listener['eventTarget'] = mockEventTarget;
    listener.start();
    listener.stop();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(WmDiscovery.Ready, expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith(WmDiscovery.Response, expect.any(Function));
  });

  it('should debounce DiscoveryReadyEvents and dispatch DiscoveryRequestEvent', () => {
    const handler = vi.fn();
    mockEventTarget.addEventListener(WmDiscovery.Request, handler);

    const listener = new DiscoveryListener({
      eventTarget: mockEventTarget,
    });

    listener.start();
    handler.mockClear();

    mockEventTarget.dispatchEvent(new Event(WmDiscovery.Ready));
    vi.advanceTimersByTime(0);
    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should clear existing timeout when a new DiscoveryReadyEvent is received', () => {
    const handler = vi.fn();
    mockEventTarget.addEventListener(WmDiscovery.Request, handler);

    const listener = new DiscoveryListener({
      eventTarget: mockEventTarget,
    });

    listener.start();
    handler.mockClear();

    mockEventTarget.dispatchEvent(new Event(WmDiscovery.Ready));
    vi.advanceTimersByTime(50);
    mockEventTarget.dispatchEvent(new Event(WmDiscovery.Ready));
    vi.advanceTimersByTime(50);
    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should handle valid DiscoveryResponseEvent', () => {
    const callback = vi.fn();
    const ackHandler = vi.fn();
    const listener = new DiscoveryListener({
      callback,
      eventTarget: mockEventTarget,
    });

    mockEventTarget.addEventListener(WmDiscovery.Ack, ackHandler);

    const walletId = 'wallet-123';
    const validResponseEvent = new CustomEvent<DiscoveryResponseEvent>(WmDiscovery.Response, {
      detail: {
        version: WM_PROTOCOL_VERSION,
        discoveryId: listener['discoveryId'],
        walletId,
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        },
      },
    });

    listener.start();
    mockEventTarget.dispatchEvent(validResponseEvent);

    // Verify the callback was called
    expect(callback).toHaveBeenCalledTimes(1);

    // Verify the wallet was added to the walletMap
    expect(listener['walletMap'].get(walletId)).toEqual({
      name: 'Test Wallet',
      icon: TEST_ICON,
      rdns: 'com.test.wallet',
    });

    // Verify an acknowledgment was sent
    expect(ackHandler).toHaveBeenCalledTimes(1);
    const ackEvent = ackHandler.mock.calls[0]?.[0] as CustomEvent<DiscoveryAckEvent>;
    expect(ackEvent.detail.walletId).toBe(walletId);
  });

  it('should return early for invalid DiscoveryResponseEvent', () => {
    const callback = vi.fn();
    const ackHandler = vi.fn();
    const listener = new DiscoveryListener({
      callback,
      eventTarget: mockEventTarget,
    });

    mockEventTarget.addEventListener(WmDiscovery.Ack, ackHandler);

    const invalidResponseEvent = new CustomEvent<DiscoveryResponseEvent>(WmDiscovery.Response, {
      detail: {
        version: '0.0.0' as typeof WM_PROTOCOL_VERSION,
        discoveryId: listener['discoveryId'],
        walletId: 'wallet-123',
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        },
      },
    });

    listener.start();
    mockEventTarget.dispatchEvent(invalidResponseEvent);

    expect(callback).not.toHaveBeenCalled();
    expect(listener['walletMap'].size).toBe(0);
    expect(ackHandler).not.toHaveBeenCalled();
  });

  it('should return early for mismatched discoveryId', () => {
    const callback = vi.fn();
    const ackHandler = vi.fn();
    const listener = new DiscoveryListener({
      callback,
      eventTarget: mockEventTarget,
    });

    mockEventTarget.addEventListener(WmDiscovery.Ack, ackHandler);

    const mismatchedResponseEvent = new CustomEvent<DiscoveryResponseEvent>(WmDiscovery.Response, {
      detail: {
        version: WM_PROTOCOL_VERSION,
        discoveryId: 'different-id',
        walletId: 'wallet-123',
        wallet: {
          name: 'Test Wallet',
          icon: TEST_ICON,
          rdns: 'com.test.wallet',
        },
      },
    });

    listener.start();
    mockEventTarget.dispatchEvent(mismatchedResponseEvent);

    expect(callback).not.toHaveBeenCalled();
    expect(listener['walletMap'].size).toBe(0);
    expect(ackHandler).not.toHaveBeenCalled();
  });

  it('should return the list of wallets', () => {
    const listener = new DiscoveryListener({
      eventTarget: mockEventTarget,
    });

    const wallets = [
      {
        name: 'Test Wallet 1',
        icon: TEST_ICON,
        rdns: 'com.test.wallet1',
      },
      {
        name: 'Test Wallet 2',
        icon: TEST_ICON,
        rdns: 'com.test.wallet2',
      },
    ];

    wallets.forEach((wallet, index) => {
      listener['walletMap'].set(`wallet-${index}`, wallet);
    });

    expect(listener.wallets).toEqual(wallets);
  });

  it('should return an empty list if there are no wallets', () => {
    const listener = new DiscoveryListener({
      eventTarget: mockEventTarget,
    });

    expect(listener.wallets).toEqual([]);
  });
});
