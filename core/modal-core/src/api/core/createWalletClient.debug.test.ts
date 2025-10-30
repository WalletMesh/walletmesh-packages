import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createWalletMesh } from './createWalletClient.js';
import { resetServices } from '../../internal/core/factories/serviceFactory.js';
import { modalLogger, configureModalLogger } from '../../internal/core/logger/globalLogger.js';

describe('createWalletMesh debug wiring', () => {
  const originalDebug = console.debug;
  const originalInfo = console.info;
  const originalSetLevel = modalLogger.setLevel.bind(modalLogger);
  let debugCalls: unknown[][] = [];
  let infoCalls: unknown[][] = [];

  beforeEach(() => {
    debugCalls = [];
    infoCalls = [];
    console.debug = (...args: unknown[]) => {
      debugCalls.push(args);
    };
    console.info = ((...args: unknown[]) => {
      infoCalls.push(args);
    }) as any;
    // Ensure a clean service state per test
    resetServices();
  });

  afterEach(() => {
    console.debug = originalDebug;
    console.info = originalInfo;
    // Restore modal logger level
    try {
      originalSetLevel(4 as any);
    } catch {}
    resetServices();
  });

  it('emits debug logs when config.debug is true', async () => {
    await createWalletMesh({
      appName: 'Test dApp',
      debug: true,
    } as any);

    // Expect at least one debug log (from early createWalletMesh debug statements)
    expect(debugCalls.length).toBeGreaterThan(0);
  });

  it('does not emit component debug logs when config.debug is false/undefined', async () => {
    // Ensure global modal logger is silent for this test
    try {
      configureModalLogger(false);
    } catch {}
    await createWalletMesh({
      appName: 'Test dApp',
    } as any);

    // No debug logs expected from component-level logger path
    expect(debugCalls.length).toBe(0);
    expect(infoCalls.length).toBeGreaterThan(0);
  });
});
