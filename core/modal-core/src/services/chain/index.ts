/**
 * Chain service exports
 */

// All chain functionality consolidated into ChainService
export { ChainService } from './ChainService.js';

export type {
  ChainInfo,
  ChainServiceConfig,
  SwitchChainArgs,
  SwitchChainResult,
  ChainValidationOptions,
  ChainValidationResult,
  ChainCompatibilityOptions,
  ChainCompatibilityResult,
  ChainSwitchingEventData,
  ChainSwitchCompletedEventData,
  ChainValidationEventData,
  ChainServiceEvents,
} from './types.js';

// Chain ensurance types are now exported from ChainService.consolidated
export type {
  ChainEnsuranceConfig,
  ChainSwitchContext,
  ChainMismatchAnalysis,
  ChainSwitchRecommendation,
} from './ChainService.js';
