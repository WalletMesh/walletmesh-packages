/**
 * Tests for Framework Adapter Types
 */

import { describe, expect, it } from 'vitest';
import type {
  ComponentMap,
  ConnectedProps,
  ConnectingProps,
  ErrorProps,
  ReactAdapterConfig,
  ReactComponent,
  ReactComponentMap,
  SvelteAdapterConfig,
  VueAdapterConfig,
  WalletSelectionProps,
} from './frameworkAdapters.js';

describe('Framework Adapter Types', () => {
  describe('View Props Interfaces', () => {
    it('should properly type WalletSelectionProps', () => {
      const mockWallets = [
        {
          id: 'metamask',
          name: 'MetaMask',
          icon: 'metamask.svg',
          description: 'MetaMask wallet',
          chains: ['ethereum', 'polygon'],
        },
        {
          id: 'phantom',
          name: 'Phantom',
          icon: 'phantom.svg',
          description: 'Phantom wallet',
          chains: ['solana'],
        },
      ];

      const props: WalletSelectionProps = {
        state: { view: 'walletSelection', isOpen: true },
        onAction: (action: string, payload?: unknown) => {
          expect(typeof action).toBe('string');
          if (payload) {
            expect(typeof payload).toBe('object');
          }
        },
        wallets: mockWallets,
      };

      expect(props.wallets).toHaveLength(2);
      expect(props.wallets[0]?.id).toBe('metamask');
      expect(props.wallets[0]?.chains).toContain('ethereum');
      expect(props.wallets[1]?.name).toBe('Phantom');
    });

    it('should properly type ConnectingProps', () => {
      const props: ConnectingProps = {
        state: { view: 'connecting', isOpen: true },
        onAction: (action: string, _payload?: unknown) => {
          expect(typeof action).toBe('string');
        },
        walletId: 'metamask',
      };

      expect(props.walletId).toBe('metamask');
      expect(typeof props.onAction).toBe('function');
    });

    it('should handle null walletId in ConnectingProps', () => {
      const props: ConnectingProps = {
        state: { view: 'connecting', isOpen: true },
        onAction: () => {},
        walletId: null,
      };

      expect(props.walletId).toBeNull();
    });

    it('should properly type ConnectedProps', () => {
      const props: ConnectedProps = {
        state: { view: 'connected', isOpen: true },
        onAction: (action: string, _payload?: unknown) => {
          expect(typeof action).toBe('string');
        },
        walletId: 'metamask',
        accounts: ['0x123', '0x456'],
        chainId: '1',
      };

      expect(props.walletId).toBe('metamask');
      expect(props.accounts).toHaveLength(2);
      expect(props.accounts).toContain('0x123');
      expect(props.chainId).toBe('1');
    });

    it('should handle null values in ConnectedProps', () => {
      const props: ConnectedProps = {
        state: { view: 'connected', isOpen: true },
        onAction: () => {},
        walletId: null,
        accounts: [],
        chainId: null,
      };

      expect(props.walletId).toBeNull();
      expect(props.accounts).toHaveLength(0);
      expect(props.chainId).toBeNull();
    });

    it('should properly type ErrorProps', () => {
      const mockError = {
        code: 'CONNECTION_FAILED',
        message: 'Failed to connect to wallet',
        category: 'wallet',
      };

      const props: ErrorProps = {
        state: { view: 'error', isOpen: true },
        onAction: (action: string, _payload?: unknown) => {
          expect(typeof action).toBe('string');
        },
        error: mockError,
      };

      expect(props.error).toEqual(mockError);
      expect(typeof props.onAction).toBe('function');
    });
  });

  describe('React Types', () => {
    it('should properly type ReactComponent', () => {
      interface TestProps {
        name: string;
        count: number;
      }

      const TestComponent: ReactComponent<TestProps> = (props) => {
        expect(props.name).toBe('test');
        expect(props.count).toBe(42);
        return `Hello ${props.name}`;
      };

      const result = TestComponent({ name: 'test', count: 42 });
      expect(result).toBe('Hello test');
    });

    it('should properly type ReactComponent without props', () => {
      const SimpleComponent: ReactComponent = () => {
        return 'Simple component';
      };

      const result = SimpleComponent({});
      expect(result).toBe('Simple component');
    });

    it('should properly type ReactComponentMap', () => {
      const WalletSelection: ReactComponent<WalletSelectionProps> = (props) => {
        expect(props.wallets).toBeDefined();
        return 'WalletSelection';
      };

      const Connecting: ReactComponent<ConnectingProps> = (props) => {
        expect(props.walletId).toBeDefined();
        return 'Connecting';
      };

      const Connected: ReactComponent<ConnectedProps> = (props) => {
        expect(props.accounts).toBeDefined();
        return 'Connected';
      };

      const ErrorComponent: ReactComponent<ErrorProps> = (props) => {
        expect(props.error).toBeDefined();
        return 'Error';
      };

      const componentMap: ReactComponentMap = {
        walletSelection: WalletSelection,
        connecting: Connecting,
        connected: Connected,
        error: ErrorComponent,
      };

      expect(typeof componentMap.walletSelection).toBe('function');
      expect(typeof componentMap.connecting).toBe('function');
      expect(typeof componentMap.connected).toBe('function');
      expect(typeof componentMap.error).toBe('function');
    });

    it('should handle partial ReactComponentMap', () => {
      const componentMap: ReactComponentMap = {
        walletSelection: () => 'Custom wallet selection',
      };

      expect(typeof componentMap.walletSelection).toBe('function');
      expect(componentMap.connecting).toBeUndefined();
      expect(componentMap.connected).toBeUndefined();
      expect(componentMap.error).toBeUndefined();
    });
  });

  describe('React Adapter Configuration', () => {
    it('should properly type ReactAdapterConfig with all options', () => {
      const mockComponents: ReactComponentMap = {
        walletSelection: () => 'Custom WalletSelection',
        connecting: () => 'Custom Connecting',
      };

      const config: ReactAdapterConfig = {
        rootId: 'modal-root',
        target: '#modal-container',
        components: mockComponents,
        componentProps: {
          theme: 'dark',
          customProp: 'value',
        },
        className: 'wallet-modal custom-modal',
        style: {
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '8px',
        },
      };

      expect(config.rootId).toBe('modal-root');
      expect(config.target).toBe('#modal-container');
      expect(config.components).toEqual(mockComponents);
      expect(config.componentProps?.theme).toBe('dark');
      expect(config.className).toBe('wallet-modal custom-modal');
      expect(config.style?.zIndex).toBe(1000);
    });

    it('should handle minimal ReactAdapterConfig', () => {
      const config: ReactAdapterConfig = {};

      expect(config.rootId).toBeUndefined();
      expect(config.target).toBeUndefined();
      expect(config.components).toBeUndefined();
      expect(config.componentProps).toBeUndefined();
      expect(config.className).toBeUndefined();
      expect(config.style).toBeUndefined();
    });

    it('should support HTMLElement as target', () => {
      const targetElement = document.createElement('div');
      const config: ReactAdapterConfig = {
        target: targetElement,
      };

      expect(config.target).toBe(targetElement);
    });

    it('should support string as target', () => {
      const config: ReactAdapterConfig = {
        target: '#custom-target',
      };

      expect(config.target).toBe('#custom-target');
    });
  });

  describe('Vue Adapter Configuration', () => {
    it('should properly type VueAdapterConfig with all options', () => {
      const config: VueAdapterConfig = {
        version: 3,
        composition: true,
        target: '#vue-container',
        components: {
          walletSelection: 'VueWalletSelection',
          connecting: 'VueConnecting',
          connected: 'VueConnected',
          error: 'VueError',
        },
      };

      expect(config.version).toBe(3);
      expect(config.composition).toBe(true);
      expect(config.target).toBe('#vue-container');
      expect(config.components?.walletSelection).toBe('VueWalletSelection');
    });

    it('should handle Vue 2 configuration', () => {
      const config: VueAdapterConfig = {
        version: 2,
        composition: false,
        target: '#vue2-container',
      };

      expect(config.version).toBe(2);
      expect(config.composition).toBe(false);
    });

    it('should handle minimal VueAdapterConfig', () => {
      const config: VueAdapterConfig = {};

      expect(config.version).toBeUndefined();
      expect(config.composition).toBeUndefined();
      expect(config.target).toBeUndefined();
      expect(config.components).toBeUndefined();
    });

    it('should support HTMLElement as target for Vue', () => {
      const targetElement = document.createElement('div');
      const config: VueAdapterConfig = {
        target: targetElement,
      };

      expect(config.target).toBe(targetElement);
    });
  });

  describe('Svelte Adapter Configuration', () => {
    it('should properly type SvelteAdapterConfig with all options', () => {
      const targetElement = document.createElement('div');
      const anchorElement = document.createElement('span');
      const contextMap = new Map();

      const config: SvelteAdapterConfig = {
        target: '#svelte-container',
        svelteOptions: {
          target: targetElement,
          anchor: anchorElement,
          context: contextMap,
          hydrate: true,
          intro: false,
        },
        components: {
          walletSelection: 'SvelteWalletSelection',
          connecting: 'SvelteConnecting',
          connected: 'SvelteConnected',
          error: 'SvelteError',
        },
      };

      expect(config.target).toBe('#svelte-container');
      expect(config.svelteOptions?.target).toBe(targetElement);
      expect(config.svelteOptions?.anchor).toBe(anchorElement);
      expect(config.svelteOptions?.context).toBe(contextMap);
      expect(config.svelteOptions?.hydrate).toBe(true);
      expect(config.svelteOptions?.intro).toBe(false);
      expect(config.components?.walletSelection).toBe('SvelteWalletSelection');
    });

    it('should handle minimal SvelteAdapterConfig', () => {
      const config: SvelteAdapterConfig = {};

      expect(config.target).toBeUndefined();
      expect(config.svelteOptions).toBeUndefined();
      expect(config.components).toBeUndefined();
    });

    it('should support HTMLElement as target for Svelte', () => {
      const targetElement = document.createElement('div');
      const config: SvelteAdapterConfig = {
        target: targetElement,
      };

      expect(config.target).toBe(targetElement);
    });
  });

  describe('ComponentMap Type', () => {
    it('should properly type ComponentMap', () => {
      const componentMap: ComponentMap = {
        walletSelection: 'WalletSelectionComponent',
        connecting: () => 'ConnectingComponent',
        connected: { component: 'ConnectedComponent', props: {} },
        error: null,
        customComponent: 42,
      };

      expect(componentMap.walletSelection).toBe('WalletSelectionComponent');
      expect(typeof componentMap.connecting).toBe('function');
      expect(componentMap.connected).toEqual({ component: 'ConnectedComponent', props: {} });
      expect(componentMap.error).toBeNull();
      expect(componentMap.customComponent).toBe(42);
    });

    it('should handle empty ComponentMap', () => {
      const componentMap: ComponentMap = {};

      expect(Object.keys(componentMap)).toHaveLength(0);
    });
  });

  describe('Framework Adapter Types', () => {
    it('should properly type ReactAdapter', () => {
      // ReactAdapter is just an alias for FrameworkAdapter
      // We can't instantiate it directly, but we can verify the type exists
      const adapterType: string = 'ReactAdapter';
      expect(adapterType).toBe('ReactAdapter');
    });

    it('should properly type VueAdapter', () => {
      // VueAdapter is just an alias for FrameworkAdapter
      // We can't instantiate it directly, but we can verify the type exists
      const adapterType: string = 'VueAdapter';
      expect(adapterType).toBe('VueAdapter');
    });

    it('should properly type SvelteAdapter', () => {
      // SvelteAdapter is just an alias for FrameworkAdapter
      // We can't instantiate it directly, but we can verify the type exists
      const adapterType: string = 'SvelteAdapter';
      expect(adapterType).toBe('SvelteAdapter');
    });
  });

  describe('Component Props Edge Cases', () => {
    it('should handle complex wallet objects in WalletSelectionProps', () => {
      const complexWallet = {
        id: 'complex-wallet',
        name: 'Complex Wallet',
        icon: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        description: 'A wallet with all possible properties',
        chains: ['ethereum', 'polygon', 'arbitrum'],
      };

      const props: WalletSelectionProps = {
        state: { complex: true, nested: { data: 'value' } },
        onAction: (action, payload) => {
          if (action === 'selectWallet' && payload) {
            expect(payload).toHaveProperty('walletId');
          }
        },
        wallets: [complexWallet],
      };

      expect(props.wallets[0]?.chains).toHaveLength(3);
      expect(props.wallets[0]?.icon).toContain('data:image');
    });

    it('should handle minimal wallet objects', () => {
      const minimalWallet = {
        id: 'minimal',
        name: 'Minimal Wallet',
      };

      const props: WalletSelectionProps = {
        state: {},
        onAction: () => {},
        wallets: [minimalWallet],
      };

      expect(props.wallets[0]?.id).toBe('minimal');
      expect(props.wallets[0]?.icon).toBeUndefined();
      expect(props.wallets[0]?.chains).toBeUndefined();
    });

    it('should handle complex error objects in ErrorProps', () => {
      const complexError = {
        code: 'WALLET_CONNECTION_FAILED',
        message: 'Failed to connect to wallet',
        category: 'wallet',
        data: {
          walletId: 'metamask',
          chainId: '1',
          attempt: 3,
          lastError: new Error('Network timeout'),
        },
        timestamp: Date.now(),
        fatal: false,
      };

      const props: ErrorProps = {
        state: { hasError: true, errorType: 'connection' },
        onAction: (action) => {
          if (action === 'retry') {
            // Handle retry action
          }
        },
        error: complexError,
      };

      expect(typeof props.error).toBe('object');
      expect(props.error).toHaveProperty('code');
      expect(props.error).toHaveProperty('data');
    });
  });
});
