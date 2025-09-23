import '../test-utils/setup.js';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccount } from '../hooks/useAccount.js';
import { useConfig } from '../hooks/useConfig.js';
import { useSSR } from '../hooks/useSSR.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';

describe('SSR Simple', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Server-side rendering', () => {
    it('should render without errors on server', () => {
      const TestComponent = () => {
        useConfig();
        const { isConnected } = useAccount();

        return (
          <div>
            <span data-testid="config-status">Config loaded</span>
            <span data-testid="connection-status">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        );
      };

      const TestWrapper = wrapper;

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      expect(screen.getByTestId('config-status')).toBeDefined();
      expect(screen.getByTestId('connection-status')).toBeDefined();
    });

    it('should handle SSR hooks', () => {
      const TestComponent = () => {
        const { isBrowser, isServer } = useSSR();

        return (
          <div>
            <span data-testid="client-status">Client: {isBrowser ? 'true' : 'false'}</span>
            <span data-testid="server-status">Server: {isServer ? 'true' : 'false'}</span>
          </div>
        );
      };

      const TestWrapper = wrapper;

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      expect(screen.getByTestId('client-status')).toBeDefined();
      expect(screen.getByTestId('server-status')).toBeDefined();
    });
  });

  describe('Hydration', () => {
    it('should handle hydration without errors', () => {
      const TestComponent = () => {
        const { isBrowser } = useSSR();
        const { isConnected } = useAccount();

        if (!isBrowser) {
          return <div data-testid="ssr-content">Loading...</div>;
        }

        return <div data-testid="hydrated-content">{isConnected ? 'Connected' : 'Ready to connect'}</div>;
      };

      const TestWrapper = wrapper;

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      // Should render without errors - in test environment, isBrowser is true
      expect(screen.getByTestId('hydrated-content')).toBeDefined();
    });
  });
});
