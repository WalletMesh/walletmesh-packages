import type { SecurityPolicy } from '../types/security.js';
import { SECURITY_PRESETS } from '../presets/security.js';

export type SecurityPresetKey = keyof typeof SECURITY_PRESETS;

interface ResolveSecurityPolicyOptions {
  /** Optional preset key to use when no value is provided */
  fallbackPreset?: SecurityPresetKey;
  /** Optional explicit fallback policy */
  fallbackPolicy?: SecurityPolicy;
}

/**
 * Resolve a security policy from either a preset name or an inline policy object.
 */
export function resolveSecurityPolicy(
  presetOrPolicy: SecurityPresetKey | SecurityPolicy | undefined,
  options: ResolveSecurityPolicyOptions = {},
): SecurityPolicy | undefined {
  if (!presetOrPolicy) {
    if (options.fallbackPreset) {
      return SECURITY_PRESETS[options.fallbackPreset];
    }
    return options.fallbackPolicy;
  }

  if (typeof presetOrPolicy === 'string') {
    return SECURITY_PRESETS[presetOrPolicy];
  }

  return presetOrPolicy;
}
