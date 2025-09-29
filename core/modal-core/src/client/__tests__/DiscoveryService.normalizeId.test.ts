/**
 * Tests for DiscoveryService wallet ID normalization
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockLogger, createMockRegistry } from '../../testing/helpers/mocks.js';
import { DiscoveryService } from '../DiscoveryService.js';

// Mock the store module used by DiscoveryService
const createStoreState = () => ({
  entities: {
    wallets: {} as Record<string, { id: string; name: string; icon: string; chains: string[]; transportConfig?: { type?: string; extensionId?: string } }>,
    sessions: {},
    transactions: {},
  },
  ui: { isOpen: false, isLoading: false, error: undefined },
  connections: {
    activeSessions: [],
    availableWallets: [],
    discoveredWallets: [],
    activeSessionId: null,
    connectionStatus: 'disconnected',
  },
  transactions: {
    pending: [],
    confirmed: [],
    failed: [],
    activeTransaction: undefined,
  },
  meta: {
    availableWalletIds: [] as string[],
    lastDiscoveryTime: null as number | null,
    connectionTimestamps: {} as Record<string, number>,
    discoveryErrors: [] as string[],
    transactionStatus: 'idle' as const,
  },
  active: {
    walletId: null as string | null,
    sessionId: null as string | null,
    transactionId: null as string | null,
    selectedWalletId: null as string | null,
  },
});

let storeState = createStoreState();

const mockStore = {
  getState: vi.fn(() => storeState),
  setState: vi.fn((updater: unknown) => {
    if (typeof updater === 'function') {
      (updater as (state: typeof storeState) => void)(storeState);
    }
  }),
  subscribe: vi.fn(() => vi.fn()),
  subscribeWithSelector: vi.fn(() => vi.fn()),
};

vi.mock('../../state/store.js', () => ({
  getStoreInstance: vi.fn(() => mockStore),
}));

interface ServiceWithInternals extends DiscoveryService {
  convertQualifiedResponderToWalletInfo(responder: QualifiedResponder): {
    id: string;
    name: string;
    icon: string;
    chains: string[];
  };
  normalizeWalletInfoId(
    walletInfo: { id: string; name: string; icon: string; chains: string[]; transportConfig?: { type?: string; extensionId?: string } },
    responder: QualifiedResponder,
  ): { id: string; name: string; icon: string; chains: string[]; transportConfig?: { type?: string; extensionId?: string } };
}

const createResponder = (): QualifiedResponder => ({
  responderId: 'a62a7e1c-8f7a-49f6-a4c9-d91880668931',
  rdns: 'com.aztec.browser-wallet-poc',
  name: 'Aztec Browser Wallet',
  icon: 'data:image/svg+xml;base64,PHN2Zy8+',
  matched: {
    required: {
      technologies: [
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: [],
        },
      ],
    },
  },
  transportConfig: {
    type: 'extension',
    extensionId: 'kboigbikfcgehaiegnjmfmapdjmpokmb',
  },
});

const createService = () => {
  const rawLogger = createMockLogger();
  const logger = rawLogger as unknown as {
    debug: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };
  const registry = createMockRegistry();
  const service = new DiscoveryService(
    {
      enabled: true,
      timeout: 5_000,
      retryInterval: 0,
      maxAttempts: 1,
      announce: false,
    },
    registry,
    rawLogger,
  ) as ServiceWithInternals;

  return { service, logger };
};

afterEach(() => {
  vi.clearAllMocks();
  storeState = createStoreState();
  mockStore.getState.mockImplementation(() => storeState);
  mockStore.setState.mockImplementation((updater: unknown) => {
    if (typeof updater === 'function') {
      (updater as (state: typeof storeState) => void)(storeState);
    }
  });
  mockStore.subscribe.mockImplementation(() => vi.fn());
  mockStore.subscribeWithSelector.mockImplementation(() => vi.fn());
});

describe('DiscoveryService wallet ID normalization', () => {
  it('normalizes wallet info IDs to the rdns value when responder IDs differ', () => {
    const { service, logger } = createService();
    const responder = createResponder();
    const walletInfo = service.convertQualifiedResponderToWalletInfo(responder);
    const mutated = { ...walletInfo, id: responder.responderId };

    const normalized = service.normalizeWalletInfoId(mutated, responder);

    expect(normalized.id).toBe(responder.rdns);
    expect(logger.debug).toHaveBeenCalledWith(
      'Normalizing wallet ID to RDNS',
      expect.objectContaining({
        responderId: responder.responderId,
        previousId: responder.responderId,
        canonicalId: responder.rdns,
      }),
    );
  });

  it('falls back to extension transport ID when rdns is missing', () => {
    const { service, logger } = createService();
    const responder = {
      ...createResponder(),
      rdns: '',
    } as QualifiedResponder;
    const walletInfo = service.convertQualifiedResponderToWalletInfo(responder);

    const normalized = service.normalizeWalletInfoId(walletInfo, responder);

    expect(normalized.id).toBe(`extension:${responder.transportConfig?.extensionId}`);
    expect(logger.debug).toHaveBeenCalledWith(
      'Normalizing wallet ID to extension transport identifier',
      expect.objectContaining({
        responderId: responder.responderId,
        extensionId: responder.transportConfig?.extensionId,
        canonicalId: `extension:${responder.transportConfig?.extensionId}`,
      }),
    );
  });

  it('leaves wallet info untouched when IDs already match', () => {
    const { service, logger } = createService();
    // Clear initialization logs
    logger.debug.mockClear();

    const responder = createResponder();
    const walletInfo = service.convertQualifiedResponderToWalletInfo(responder);

    const normalized = service.normalizeWalletInfoId(walletInfo, responder);

    expect(normalized).toEqual(walletInfo);
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('reuses existing wallet ID when extension transport already registered', () => {
    const { service, logger } = createService();
    // Clear initialization logs
    logger.debug.mockClear();

    const responder = {
      ...createResponder(),
      rdns: '',
    } as QualifiedResponder;

    const existingId = 'aztec-browser-wallet';
    storeState.entities.wallets[existingId] = {
      id: existingId,
      name: 'Aztec Browser Wallet',
      icon: 'data:image/svg+xml;base64,PHN2Zy8+',
      chains: ['aztec'],
      transportConfig: {
        type: 'extension',
        extensionId: responder.transportConfig?.extensionId,
      },
    };

    const walletInfo = service.convertQualifiedResponderToWalletInfo(responder);
    const normalized = service.normalizeWalletInfoId(walletInfo, responder);

    expect(normalized.id).toBe(existingId);
    expect(logger.debug).toHaveBeenCalledWith(
      'Reusing existing wallet ID based on extension transport',
      expect.objectContaining({
        responderId: responder.responderId,
        previousId: responder.responderId,
        canonicalId: existingId,
        extensionId: responder.transportConfig?.extensionId,
      }),
    );
  });

  it('removes stale discovered wallets from the store when they are not rediscovered', () => {
    const { service } = createService();
    const responder = createResponder();
    const syncInternals = service as unknown as {
      discoveredWalletIdsInStore: Set<string>;
      synchronizeDiscoveredWalletStore(ids: Set<string>): void;
    };

    const previousWalletId = responder.rdns;
    storeState.entities.wallets[previousWalletId] = {
      id: previousWalletId,
      name: responder.name,
      icon: responder.icon,
      chains: ['aztec'],
      transportConfig: {
        type: 'extension',
        extensionId: responder.transportConfig?.extensionId,
      },
    };
    storeState.meta.availableWalletIds.push(previousWalletId);
    syncInternals.discoveredWalletIdsInStore = new Set([previousWalletId]);

    syncInternals.synchronizeDiscoveredWalletStore(new Set());

    expect(storeState.entities.wallets[previousWalletId]).toBeUndefined();
    expect(storeState.meta.availableWalletIds).not.toContain(previousWalletId);
  });

  it('warns and keeps provided ID when no rdns or transport identifier is available', () => {
    const { service, logger } = createService();
    const responder = {
      ...createResponder(),
      rdns: '',
      transportConfig: undefined,
    } as unknown as QualifiedResponder;

    const walletInfo = service.convertQualifiedResponderToWalletInfo(responder);
    const normalized = service.normalizeWalletInfoId(walletInfo, responder);

    expect(normalized.id).toBe(walletInfo.id);
    expect(logger.warn).toHaveBeenCalledWith(
      'Unable to derive canonical wallet ID from discovery data; using provided ID',
      expect.objectContaining({
        responderId: responder.responderId,
        providedId: walletInfo.id,
      }),
    );
  });
});
