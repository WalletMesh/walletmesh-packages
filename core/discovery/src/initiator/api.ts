import type {
  CapabilityPreferences,
  CapabilityRequirements,
  QualifiedResponder,
} from '../types/capabilities.js';
import type { InitiatorInfo } from '../types/core.js';
import { DiscoveryInitiator, type DiscoveryInitiatorOptions } from '../initiator.js';

export interface InitiatorSessionParams {
  requirements: CapabilityRequirements;
  initiator: InitiatorInfo;
  preferences?: CapabilityPreferences;
  options?: DiscoveryInitiatorOptions;
}

/**
 * Create a reusable discovery session handle that exposes the same methods as
 * {@link DiscoveryInitiator}. Prefer this helper when you want to keep a
 * session instance around and manually control its lifecycle.
 */
export function createInitiatorSession(params: InitiatorSessionParams): DiscoveryInitiator {
  const { requirements, initiator, preferences, options } = params;
  return new DiscoveryInitiator(requirements, initiator, options ?? {}, preferences);
}

/**
 * Run a single discovery cycle and resolve with qualified responders. The
 * underlying session is disposed automatically once the promise settles.
 */
export async function runDiscovery(params: InitiatorSessionParams): Promise<QualifiedResponder[]> {
  const session = createInitiatorSession(params);
  try {
    return await session.startDiscovery();
  } finally {
    session.dispose();
  }
}
