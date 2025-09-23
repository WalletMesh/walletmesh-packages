/**
 * Pre-built React test scenarios
 *
 * Provides fluent interface for testing React component interactions
 * and hook behaviors with WalletMesh.
 */

import { render, renderHook } from '@testing-library/react';
import type { WalletMeshState } from '@walletmesh/modal-core';
import { act } from 'react';
import React from 'react';
import { expect } from 'vitest';
import type { WalletMeshReactConfig } from '../types.js';
import { HookMockUtils, ReactMockPresets } from './centralizedMocks.js';
import { createConnectedWrapper, createTestWrapper } from './testHelpers.js';

// Define the return type for the store
interface MockStore {
  getState: () => WalletMeshState;
  setState: (updater: ((state: WalletMeshState) => WalletMeshState) | Partial<WalletMeshState>) => void;
  subscribe: (callback: (state: WalletMeshState) => void) => () => void;
  destroy: () => void;
}

interface FlowStep {
  type: 'action' | 'assertion';
  details: unknown;
}

interface RenderedHook {
  name: string;
  result: {
    current: Record<string, unknown>;
  };
}

interface RenderedComponent {
  name: string;
  result: {
    container: HTMLElement;
  };
}

/**
 * React hook testing scenario builder
 */
export class ReactHookScenarioBuilder {
  private config: {
    hookName: string;
    initialState: 'disconnected' | 'connecting' | 'connected' | 'error';
    walletId?: string;
    address?: string;
    error?: Error;
    providerConfig?: Partial<WalletMeshReactConfig>;
  };

  constructor(hookName: string) {
    this.config = {
      hookName,
      initialState: 'disconnected',
    };
  }

  /**
   * Set initial connection state
   */
  withInitialState(state: 'disconnected' | 'connecting' | 'connected' | 'error'): this {
    this.config.initialState = state;
    return this;
  }

  /**
   * Configure connected state
   */
  connected(walletId = 'metamask', address = '0x1234567890123456789012345678901234567890'): this {
    this.config.initialState = 'connected';
    this.config.walletId = walletId;
    this.config.address = address;
    return this;
  }

  /**
   * Configure error state
   */
  withError(error: Error | string): this {
    this.config.initialState = 'error';
    this.config.error = typeof error === 'string' ? new Error(error) : error;
    return this;
  }

  /**
   * Configure provider
   */
  withProvider(config: Partial<WalletMeshReactConfig>): this {
    this.config.providerConfig = config;
    return this;
  }

  /**
   * Build and render the hook scenario
   */
  build(): {
    wrapper: ReturnType<typeof createTestWrapper>['wrapper'];
    mockStore: MockStore;
    config: typeof ReactHookScenarioBuilder.prototype.config;
    renderHook: () => ReturnType<typeof renderHook>;
    triggerAction: (actionName: string, ...args: unknown[]) => Promise<unknown>;
    expectHookResult: (expectations: Record<string, unknown>) => void;
    updateState: (newState: Partial<WalletMeshState>) => void;
  } {
    // Set up mocks based on initial state
    this.setupMocks();

    // Create appropriate wrapper
    const { wrapper, mockStore } = this.createWrapper();

    // Create hook runner
    const hookRunner = this.createHookRunner();

    return {
      wrapper,
      mockStore,
      config: this.config,
      renderHook: () => renderHook(hookRunner, { wrapper }),

      async triggerAction(actionName: string, ...args: unknown[]) {
        const { result } = renderHook(hookRunner, { wrapper });
        const action = result.current[actionName];
        if (typeof action === 'function') {
          return act(async () => {
            return action(...args);
          });
        }
        throw new Error(`Action ${actionName} not found on hook result`);
      },

      expectHookResult(expectations: Record<string, unknown>) {
        const { result } = renderHook(hookRunner, { wrapper });
        for (const [key, expectedValue] of Object.entries(expectations)) {
          expect(result.current[key]).toEqual(expectedValue);
        }
      },

      updateState: (newState: Partial<WalletMeshState>) => {
        act(() => {
          mockStore.setState(newState);
        });
      },
    };
  }

  private setupMocks() {
    const preset = this.getPresetForState();
    if (preset) {
      HookMockUtils.applyPreset(preset);
    }
  }

  private getPresetForState() {
    switch (this.config.initialState) {
      case 'connected':
        return ReactMockPresets.connectedState(this.config.walletId, this.config.address);
      case 'connecting':
        return ReactMockPresets.connectingState();
      case 'error':
        return ReactMockPresets.errorState(this.config.error);
      default:
        return null;
    }
  }

  private createWrapper() {
    if (this.config.initialState === 'connected') {
      return createConnectedWrapper(this.config.walletId, this.config.address);
    }
    return createTestWrapper(
      this.config.providerConfig ? { walletMeshConfig: this.config.providerConfig } : {},
    );
  }

  private createHookRunner() {
    // Dynamic hook import based on hook name
    return () => {
      try {
        const hookModule = require(`../hooks/${this.config.hookName}.js`);
        const hook = hookModule[this.config.hookName];
        if (!hook) {
          throw new Error(`Hook ${this.config.hookName} not found`);
        }
        return hook();
      } catch (error) {
        throw new Error(`Failed to import hook ${this.config.hookName}: ${error}`);
      }
    };
  }
}

/**
 * React component testing scenario builder
 */
export class ReactComponentScenarioBuilder {
  private config: {
    componentName: string;
    props: Record<string, unknown>;
    initialState: 'disconnected' | 'connecting' | 'connected' | 'error';
    walletId?: string;
    address?: string;
    providerConfig?: Partial<WalletMeshReactConfig>;
  };

  constructor(componentName: string) {
    this.config = {
      componentName,
      props: {},
      initialState: 'disconnected',
    };
  }

  /**
   * Set component props
   */
  withProps(props: Record<string, unknown>): this {
    this.config.props = { ...this.config.props, ...props };
    return this;
  }

  /**
   * Set initial state
   */
  withInitialState(state: 'disconnected' | 'connecting' | 'connected' | 'error'): this {
    this.config.initialState = state;
    return this;
  }

  /**
   * Configure connected state
   */
  connected(walletId = 'metamask', address = '0x1234567890123456789012345678901234567890'): this {
    this.config.initialState = 'connected';
    this.config.walletId = walletId;
    this.config.address = address;
    return this;
  }

  /**
   * Configure provider
   */
  withProvider(config: Partial<WalletMeshReactConfig>): this {
    this.config.providerConfig = config;
    return this;
  }

  /**
   * Build and render the component scenario
   */
  build(): {
    wrapper: ReturnType<typeof createTestWrapper>['wrapper'];
    mockStore: MockStore;
    config: typeof ReactComponentScenarioBuilder.prototype.config;
    render: () => ReturnType<typeof render>;
    clickButton: (testId: string) => void;
    findElement: (selector: string) => HTMLElement | null;
    expectElement: (selector: string, expectations: Record<string, unknown>) => void;
    updateState: (newState: Partial<WalletMeshState>) => void;
    triggerEvent: (eventName: string, eventData?: unknown) => void;
  } {
    // Set up mocks
    this.setupMocks();

    // Create wrapper
    const { wrapper, mockStore } = this.createWrapper();

    // Create component runner
    const ComponentRunner = this.createComponentRunner();

    return {
      wrapper,
      mockStore,
      config: this.config,
      render: () => render(React.createElement(ComponentRunner, this.config.props), { wrapper }),

      clickButton(testId: string) {
        const rendered = render(React.createElement(ComponentRunner, this.config.props), { wrapper });
        const button = rendered.getByTestId(testId);
        act(() => {
          button.click();
        });
      },

      findElement(selector: string): HTMLElement | null {
        const rendered = render(React.createElement(ComponentRunner, this.config.props), { wrapper });
        return rendered.container.querySelector(selector);
      },

      updateState: (newState: Partial<WalletMeshState>) => {
        act(() => {
          mockStore.setState(newState);
        });
      },

      async triggerEvent(eventName: string, eventData?: unknown) {
        const rendered = render(React.createElement(ComponentRunner, this.config.props), { wrapper });
        const element = rendered.container.firstChild as HTMLElement;
        const event = eventData
          ? new CustomEvent(eventName, { detail: eventData, bubbles: true })
          : new Event(eventName, { bubbles: true });
        return act(async () => {
          element.dispatchEvent(event);
        });
      },

      expectElement(selector: string, expectations?: Record<string, unknown>) {
        const rendered = render(React.createElement(ComponentRunner, this.config.props), { wrapper });
        const element = rendered.container.querySelector(selector);
        expect(element).toBeDefined();

        if (expectations) {
          for (const [attr, expectedValue] of Object.entries(expectations)) {
            if (attr === 'textContent') {
              expect(element?.textContent).toEqual(expectedValue);
            } else {
              expect(element?.getAttribute(attr)).toEqual(expectedValue);
            }
          }
        }

        return element;
      },
    };
  }

  private setupMocks() {
    const preset = this.getPresetForState();
    if (preset) {
      HookMockUtils.applyPreset(preset);
    }
  }

  private getPresetForState() {
    switch (this.config.initialState) {
      case 'connected':
        return ReactMockPresets.connectedState(this.config.walletId, this.config.address);
      case 'connecting':
        return ReactMockPresets.connectingState();
      case 'error':
        return ReactMockPresets.errorState();
      default:
        return null;
    }
  }

  private createWrapper() {
    if (this.config.initialState === 'connected') {
      return createConnectedWrapper(this.config.walletId, this.config.address);
    }
    return createTestWrapper(
      this.config.providerConfig ? { walletMeshConfig: this.config.providerConfig } : {},
    );
  }

  private createComponentRunner() {
    return (props: unknown) => {
      try {
        const componentModule = require(`../components/${this.config.componentName}.js`);
        const Component = componentModule[this.config.componentName] || componentModule.default;
        if (!Component) {
          throw new Error(`Component ${this.config.componentName} not found`);
        }
        return React.createElement(Component, props as Record<string, unknown>);
      } catch (error) {
        throw new Error(`Failed to import component ${this.config.componentName}: ${error}`);
      }
    };
  }
}

/**
 * Integration scenario builder for testing hook + component interactions
 */
export class ReactIntegrationScenarioBuilder {
  private config: {
    hooks: string[];
    components: string[];
    flow: Array<FlowStep>;
    providerConfig?: Partial<WalletMeshReactConfig>;
  };

  constructor() {
    this.config = {
      hooks: [],
      components: [],
      flow: [],
    };
  }

  /**
   * Add hooks to test
   */
  withHooks(...hookNames: string[]): this {
    this.config.hooks.push(...hookNames);
    return this;
  }

  /**
   * Add components to test
   */
  withComponents(...componentNames: string[]): this {
    this.config.components.push(...componentNames);
    return this;
  }

  /**
   * Add action to flow
   */
  action(actionName: string, target: string, ...args: unknown[]): this {
    this.config.flow.push({
      type: 'action',
      details: { actionName, target, args },
    });
    return this;
  }

  /**
   * Add assertion to flow
   */
  expect(target: string, property: string, expectedValue: unknown): this {
    this.config.flow.push({
      type: 'assertion',
      details: { target, property, expectedValue },
    });
    return this;
  }

  /**
   * Configure provider
   */
  withProvider(config: Partial<WalletMeshReactConfig>): this {
    this.config.providerConfig = config;
    return this;
  }

  /**
   * Build and execute integration scenario
   */
  async build(): Promise<{
    wrapper: ReturnType<typeof createTestWrapper>['wrapper'];
    mockStore: MockStore;
    results: { [key: string]: RenderedHook | RenderedComponent };
    steps: FlowStep[];
    expectFlow: () => void;
    hooks: { [key: string]: RenderedHook };
  }> {
    const { wrapper, mockStore } = createTestWrapper(
      this.config.providerConfig ? { walletMeshConfig: this.config.providerConfig } : {},
    );

    // Render all hooks and components
    const renderedHooks = this.config.hooks.map((hookName) => {
      const runner = () => {
        const hookModule = require(`../hooks/${hookName}.js`);
        return hookModule[hookName]();
      };
      return { name: hookName, result: renderHook(runner, { wrapper }).result };
    });

    const renderedComponents = this.config.components.map((componentName) => {
      const ComponentRunner = (props: unknown) => {
        const componentModule = require(`../components/${componentName}.js`);
        const Component = componentModule[componentName] || componentModule.default;
        return React.createElement(Component, props as Record<string, unknown>);
      };
      return { name: componentName, result: render(React.createElement(ComponentRunner, {}), { wrapper }) };
    });

    // Execute flow
    for (const step of this.config.flow) {
      if (step.type === 'action') {
        await this.executeAction(step.details, renderedHooks, renderedComponents);
      } else if (step.type === 'assertion') {
        this.executeAssertion(step.details, renderedHooks, renderedComponents);
      }
    }

    const hooksMap: { [key: string]: RenderedHook } = {};
    for (const hook of renderedHooks) {
      hooksMap[hook.name] = hook;
    }

    const componentsMap: { [key: string]: RenderedComponent } = {};
    for (const comp of renderedComponents) {
      componentsMap[comp.name] = comp;
    }

    return {
      wrapper,
      mockStore,
      hooks: hooksMap,
      results: { ...hooksMap, ...componentsMap },
      steps: this.config.flow,
      expectFlow: () => {
        for (const step of this.config.flow) {
          if (step.type === 'assertion') {
            this.executeAssertion(step.details, renderedHooks, renderedComponents);
          }
        }
      },
    };
  }

  private async executeAction(
    details: unknown,
    hooks: Array<RenderedHook>,
    components: Array<RenderedComponent>,
  ) {
    const { actionName, target, args } = details as { actionName: string; target: string; args: unknown[] };

    // Find target in hooks
    const hook = hooks.find((h) => h.name === target);
    if (hook) {
      const action = hook.result.current[actionName];
      if (typeof action === 'function') {
        return act(async () => {
          return action(...args);
        });
      }
    }

    // Find target in components
    const component = components.find((c) => c.name === target);
    if (component) {
      const element = component.result.container.querySelector(`[data-action="${actionName}"]`);
      if (element) {
        return act(async () => {
          element.dispatchEvent(new Event('click', { bubbles: true }));
        });
      }
    }
  }

  private executeAssertion(
    details: unknown,
    hooks: Array<RenderedHook>,
    components: Array<RenderedComponent>,
  ) {
    const { target, property, expectedValue } = details as {
      target: string;
      property: string;
      expectedValue: unknown;
    };

    // Check hooks
    const hook = hooks.find((h) => h.name === target);
    if (hook) {
      expect(hook.result.current[property]).toEqual(expectedValue);
      return;
    }

    // Check components
    const component = components.find((c) => c.name === target);
    if (component) {
      const element = component.result.container.querySelector(`[data-property="${property}"]`);
      expect(element?.textContent).toEqual(expectedValue);
      return;
    }
  }
}

/**
 * Factory functions for common React test scenarios
 */
export const ReactTestScenarios = {
  /**
   * Test useAccount hook
   */
  accountHook: (initialState?: 'disconnected' | 'connecting' | 'connected' | 'error') =>
    new ReactHookScenarioBuilder('useAccount').withInitialState(initialState || 'disconnected'),

  /**
   * Test useConnect hook
   */
  connectHook: () => new ReactHookScenarioBuilder('useConnect'),

  /**
   * Test WalletMeshModal component
   */
  modalComponent: () => new ReactComponentScenarioBuilder('WalletMeshModal'),

  /**
   * Test ConnectButton component
   */
  connectButton: () => new ReactComponentScenarioBuilder('ConnectButton'),

  /**
   * Full connection flow integration test
   */
  connectionFlow: () =>
    new ReactIntegrationScenarioBuilder()
      .withHooks('useAccount', 'useConnect')
      .withComponents('ConnectButton')
      .action('connect', 'useConnect', 'metamask')
      .expect('useAccount', 'isConnected', true),

  /**
   * Modal interaction flow
   */
  modalFlow: () =>
    new ReactIntegrationScenarioBuilder()
      .withHooks('useModal', 'useAccount')
      .withComponents('WalletMeshModal')
      .action('open', 'useModal')
      .expect('useModal', 'isOpen', true),
} as const;
