import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks/useAztecProvingStatus.js', () => ({
  useAztecProvingStatus: vi.fn(),
}));
vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: vi.fn((node: unknown) => node),
  };
});

import { useAztecProvingStatus } from '../hooks/useAztecProvingStatus.js';
import { createPortal } from 'react-dom';
import { isBrowser } from '../utils/ssr-walletmesh.js';
import { AztecProvingOverlay } from './AztecProvingOverlay.js';

const mockUseAztecProvingStatus = vi.mocked(useAztecProvingStatus);
const mockCreatePortal = vi.mocked(createPortal);

const createDefaultState = () => ({
  isProving: false,
  activeCount: 0,
  activeEntries: [],
  currentEntry: null,
  getEntry: vi.fn(),
  shouldShowOverlay: false,
});

const createActiveState = () => {
  const entry = {
    provingId: 'proof-123',
    status: 'started' as const,
    startedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    txHash: '0xabc123def4567890',
  };

  return {
    isProving: true,
    activeCount: 1,
    activeEntries: [entry],
    currentEntry: entry,
    getEntry: vi.fn(),
    shouldShowOverlay: true,
  };
};

describe('AztecProvingOverlay', () => {
  beforeEach(() => {
    expect(isBrowser()).toBe(true);
    mockUseAztecProvingStatus.mockImplementation(() => createDefaultState());
    mockCreatePortal.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockCreatePortal.mockClear();
  });

  it('returns null when there is no active proving state', () => {
    render(<AztecProvingOverlay />);

    expect(mockCreatePortal).not.toHaveBeenCalled();
  });

  it('renders a portal when proving is active', () => {
    mockUseAztecProvingStatus.mockImplementation(() => createActiveState());

    const { getByText } = render(<AztecProvingOverlay />);

    expect(mockCreatePortal).toHaveBeenCalledTimes(1);
    expect(getByText('Generating Aztec proof…')).toBeInTheDocument();
  });
});
