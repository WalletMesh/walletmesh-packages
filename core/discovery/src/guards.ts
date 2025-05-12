import type { BaseWalletInfo, WalletInfo, ExtensionWalletInfo, WebWalletInfo } from './types.js';
import type { DiscoveryRequestEvent, DiscoveryResponseEvent, DiscoveryAckEvent } from './types.js';
import { WM_PROTOCOL_VERSION } from './constants.js';

/**
 * Validates that a string array contains non-empty strings
 * @param arr Array to validate
 * @returns boolean indicating if array contains only non-empty strings
 * @internal
 */
function isNonEmptyStringArray(arr: unknown): boolean {
  if (!Array.isArray(arr)) return false;
  if (arr.length === 0) return false;
  return arr.every((item) => typeof item === 'string' && item.trim().length > 0);
}

/**
 * Type guard to check if an object is a valid BaseWalletInfo
 * @param obj Object to check
 * @returns boolean indicating if object is valid BaseWalletInfo
 * @internal
 */
export function isBaseWalletInfo(obj: unknown): obj is BaseWalletInfo {
  if (!obj || typeof obj !== 'object') return false;

  const info = obj as BaseWalletInfo;
  if (!info.name || typeof info.name !== 'string') return false;
  if (!info.icon || typeof info.icon !== 'string' || !info.icon.startsWith('data:')) return false;
  if (!info.rdns || typeof info.rdns !== 'string') return false;

  if (info.technologies !== undefined) {
    if (!isNonEmptyStringArray(info.technologies)) return false;
  }

  return true;
}

/**
 * Type guard to check if an object is a valid ExtensionWalletInfo
 * @param obj Object to check
 * @returns boolean indicating if object is valid ExtensionWalletInfo
 * @internal
 */
export function isExtensionWalletInfo(obj: unknown): obj is ExtensionWalletInfo {
  if (!isBaseWalletInfo(obj)) return false;

  const info = obj as ExtensionWalletInfo;
  if (info.url !== undefined) return false;

  if (info.extensionId !== undefined && typeof info.extensionId !== 'string') return false;
  if (info.code !== undefined && typeof info.code !== 'string') return false;

  return true;
}

/**
 * Type guard to check if an object is a valid WebWalletInfo
 * @param obj Object to check
 * @returns boolean indicating if object is valid WebWalletInfo
 * @internal
 */
export function isWebWalletInfo(obj: unknown): obj is WebWalletInfo {
  if (!isBaseWalletInfo(obj)) return false;

  const info = obj as WebWalletInfo;
  if (info.code !== undefined) return false;
  if (info.extensionId !== undefined) return false;

  if (info.url !== undefined && typeof info.url !== 'string') return false;

  return true;
}

/**
 * Type guard to check if an object is a valid WalletInfo
 * @param obj Object to check
 * @returns boolean indicating if object is valid WalletInfo
 */
export function isWalletInfo(obj: unknown): obj is WalletInfo {
  return isExtensionWalletInfo(obj) || isWebWalletInfo(obj);
}

/**
 * Type guard to check if an object is a valid DiscoveryRequestEvent
 * @param obj Object to check
 * @returns boolean indicating if object is valid DiscoveryRequestEvent
 */
export function isDiscoveryRequestEvent(obj: unknown): obj is DiscoveryRequestEvent {
  if (!obj || typeof obj !== 'object') return false;

  const event = obj as DiscoveryRequestEvent;
  if (event.version !== WM_PROTOCOL_VERSION) return false;
  if (!event.discoveryId || typeof event.discoveryId !== 'string') return false;

  if (event.technologies !== undefined) {
    if (!isNonEmptyStringArray(event.technologies)) return false;
  }

  return true;
}

/**
 * Type guard to check if an object is a valid DiscoveryResponseEvent
 * @param obj Object to check
 * @returns boolean indicating if object is valid DiscoveryResponseEvent
 */
export function isDiscoveryResponseEvent(obj: unknown): obj is DiscoveryResponseEvent {
  if (!obj || typeof obj !== 'object') return false;

  const event = obj as DiscoveryResponseEvent;
  if (event.version !== WM_PROTOCOL_VERSION) return false;
  if (!event.discoveryId || typeof event.discoveryId !== 'string') return false;
  if (!event.walletId || typeof event.walletId !== 'string') return false;

  return isWalletInfo(event.wallet);
}

/**
 * Type guard to check if an object is a valid DiscoveryAckEvent
 * @param obj Object to check
 * @returns boolean indicating if object is valid DiscoveryAckEvent
 */
export function isDiscoveryAckEvent(obj: unknown): obj is DiscoveryAckEvent {
  if (!obj || typeof obj !== 'object') return false;

  const event = obj as DiscoveryAckEvent;
  if (event.version !== WM_PROTOCOL_VERSION) return false;
  if (!event.discoveryId || typeof event.discoveryId !== 'string') return false;
  if (!event.walletId || typeof event.walletId !== 'string') return false;

  return true;
}
