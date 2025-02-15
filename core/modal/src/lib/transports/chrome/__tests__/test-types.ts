/**
 * @file test-types.ts
 * @packageDocumentation
 * Type definitions for Chrome transport tests.
 */

/**
 * Base handler type for tests
 */
type BaseHandler = {
  portName?: string;
};

/**
 * Extended handler function with port tracking.
 */
export type PortHandler = (() => void) & BaseHandler;

/**
 * Type guard for handlers with port tracking
 */
export function hasPortName<T extends BaseHandler>(handler: T): handler is T & Required<BaseHandler> {
  return typeof handler.portName === 'string';
}

/**
 * Type guard for PortHandler
 */
export function isPortHandler(value: unknown): value is PortHandler {
  return typeof value === 'function' && (value as PortHandler).portName !== undefined;
}

/**
 * Port disconnect handler with port name tracking
 */
export type DisconnectHandler = PortHandler;

/**
 * Creates a disconnect handler with port name
 */
export function createDisconnectHandler(handler: () => void, portName: string): DisconnectHandler {
  const wrappedHandler = () => handler();
  wrappedHandler.portName = portName;
  return wrappedHandler;
}

/**
 * Message handler type
 */
export type MessageHandler<T = unknown> = ((message: T) => void) & BaseHandler;

/**
 * Type guard for MessageHandler
 */
export function isMessageHandler<T>(handler: unknown): handler is MessageHandler<T> {
  return (
    typeof handler === 'function' &&
    ('portName' in handler || (handler as MessageHandler<T>).portName === undefined)
  );
}

/**
 * Creates a message handler with port name
 */
export function createMessageHandler<T>(handler: (message: T) => void, portName: string): MessageHandler<T> {
  const wrappedHandler = (message: T) => handler(message);
  wrappedHandler.portName = portName;
  return wrappedHandler;
}

/**
 * Gets the handler for a specific port
 */
export function findHandlerByPort<T extends BaseHandler>(handlers: T[], portName: string): T | undefined {
  return handlers.find((h) => h.portName === portName);
}
