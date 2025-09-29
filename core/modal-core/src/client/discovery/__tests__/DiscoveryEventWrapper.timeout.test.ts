import { describe, expect, it, vi } from 'vitest';
import type { QualifiedResponder } from '@walletmesh/discovery';
import { DiscoveryEventWrapper } from '../DiscoveryEventWrapper.js';

describe('DiscoveryEventWrapper timeout handling', () => {
  it('returns responders discovered before timeout', async () => {
    vi.useFakeTimers();

    const partialResponder: QualifiedResponder = {
      responderId: 'com.aztec.wallet',
      rdns: 'com.aztec.wallet',
      name: 'Aztec Wallet',
      icon: 'data:image/svg+xml;base64,PHN2Zy8+',
      matched: {
        required: {
          technologies: [{ type: 'aztec', interfaces: ['aztec-wallet-api-v1'], features: [] }],
          features: [],
        },
      },
      sessionId: 'session-123',
      transportConfig: { type: 'extension', extensionId: 'abc123' } as any,
    };

    const pendingPromise = new Promise<QualifiedResponder[]>(() => {
      // Intentionally never resolve – matches behaviour when responders do not send completion events
    });

    const mockInitiator = {
      startDiscovery: vi.fn(() => pendingPromise),
      getQualifiedResponders: vi.fn(() => [partialResponder]),
      isDiscovering: vi.fn(() => true),
      stopDiscovery: vi.fn(() => undefined),
    } as unknown as import('@walletmesh/discovery').DiscoveryInitiator;

    const mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;

    const wrapper = new DiscoveryEventWrapper(mockInitiator, {} as any, mockLogger, {
      timeout: 50,
      emitProgress: false,
    });

    const emittedEvents: Array<{ type: string }> = [];
    const unsubscribe = wrapper.addEventListener((event) => emittedEvents.push(event));

    const discoveryPromise = wrapper.startDiscovery(mockInitiator);

    await vi.advanceTimersByTimeAsync(60);

    const results = await discoveryPromise;

    expect(results).toEqual([]);
    expect(mockInitiator.getQualifiedResponders).not.toHaveBeenCalled();
    expect(mockInitiator.stopDiscovery).toHaveBeenCalledTimes(1);

    const timeoutEvent = emittedEvents.find((event) => event.type === 'discovery_timeout');
    expect(timeoutEvent).toBeDefined();
    expect(timeoutEvent && 'partialResults' in timeoutEvent ? timeoutEvent.partialResults : []).toEqual([]);

    const walletFoundEvents = emittedEvents.filter((event) => event.type === 'wallet_found');
    expect(walletFoundEvents.length).toBe(0);

    unsubscribe();
    wrapper.cleanup();
    vi.useRealTimers();
  });
});
