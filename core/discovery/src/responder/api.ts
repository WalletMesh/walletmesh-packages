import { DiscoveryResponder, type DiscoveryResponderOptions } from '../responder.js';
import type { ResponderInfo } from '../types/capabilities.js';

export interface ResponderServerParams {
  responder: ResponderInfo;
  options?: DiscoveryResponderOptions;
}

export interface ResponderServerHandle {
  instance: DiscoveryResponder;
  stop: () => void;
}

/**
 * Construct a responder instance without starting it. Use this when you need
 * to coordinate responder lifecycle manually or hook into additional events
 * before listening begins.
 */
export function createResponderServer(params: ResponderServerParams): DiscoveryResponder {
  const { responder, options } = params;
  return new DiscoveryResponder(responder, options ?? {});
}

/**
 * Start a responder immediately and receive a simple handle for shutting it
 * down. The underlying responder instance is also returned for advanced
 * interactions.
 */
export function startResponder(params: ResponderServerParams): ResponderServerHandle {
  const instance = createResponderServer(params);
  instance.startListening();
  return {
    instance,
    stop: () => instance.stopListening(),
  };
}
