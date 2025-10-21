/**
 * Connection progress utilities
 *
 * Framework-agnostic utilities for tracking and calculating connection progress.
 * These can be used by any UI framework package (React, Vue, Svelte, etc.) to
 * provide consistent progress semantics across implementations.
 *
 * @module utils/connectionProgress
 * @packageDocumentation
 * @since 3.0.0
 */

/**
 * Connection progress stages
 */
export const ConnectionStages = {
  INITIALIZING: 'initializing',
  CONNECTING: 'connecting',
  AUTHENTICATING: 'authenticating',
  CONNECTED: 'connected',
  FAILED: 'failed',
} as const;

export type ConnectionStage = (typeof ConnectionStages)[keyof typeof ConnectionStages];

/**
 * Connection progress information
 *
 * Note: This is distinct from ConnectionService's ConnectionProgress interface.
 * ConnectionProgressInfo provides framework-agnostic progress tracking with stages,
 * while ConnectionService's interface is used internally for service communication.
 */
export interface ConnectionProgressInfo {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current stage */
  stage: ConnectionStage;
  /** Step description */
  step: string;
  /** Optional step details */
  details?: string;
}

/**
 * Progress percentage mapping for each stage
 */
export const StageProgressMap: Record<ConnectionStage, number> = {
  [ConnectionStages.INITIALIZING]: 10,
  [ConnectionStages.CONNECTING]: 40,
  [ConnectionStages.AUTHENTICATING]: 70,
  [ConnectionStages.CONNECTED]: 100,
  [ConnectionStages.FAILED]: 0,
};

/**
 * Default step descriptions for each stage
 */
export const StageDescriptionMap: Record<ConnectionStage, string> = {
  [ConnectionStages.INITIALIZING]: 'Initializing connection...',
  [ConnectionStages.CONNECTING]: 'Connecting to wallet...',
  [ConnectionStages.AUTHENTICATING]: 'Authenticating...',
  [ConnectionStages.CONNECTED]: 'Connected successfully',
  [ConnectionStages.FAILED]: 'Connection failed',
};

/**
 * Create progress information for a given stage
 *
 * @param stage - Current connection stage
 * @param details - Optional additional details
 * @returns Connection progress information
 *
 * @example
 * ```typescript
 * const progress = createProgress('connecting', 'Connecting to MetaMask...');
 * console.log(progress);
 * // {
 * //   progress: 40,
 * //   stage: 'connecting',
 * //   step: 'Connecting to wallet...',
 * //   details: 'Connecting to MetaMask...'
 * // }
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function createProgress(stage: ConnectionStage, details?: string): ConnectionProgressInfo {
  return {
    progress: StageProgressMap[stage],
    stage,
    step: StageDescriptionMap[stage],
    ...(details && { details }),
  };
}

/**
 * Create custom progress with specific percentage
 *
 * Useful for granular progress tracking within a stage.
 *
 * @param progress - Progress percentage (0-100)
 * @param stage - Current connection stage
 * @param step - Step description
 * @param details - Optional additional details
 * @returns Connection progress information
 *
 * @example
 * ```typescript
 * // Custom progress between stages
 * const progress = createCustomProgress(60, 'connecting', 'Waiting for approval...', 'Check your wallet');
 * console.log(progress);
 * // {
 * //   progress: 60,
 * //   stage: 'connecting',
 * //   step: 'Waiting for approval...',
 * //   details: 'Check your wallet'
 * // }
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function createCustomProgress(
  progress: number,
  stage: ConnectionStage,
  step: string,
  details?: string,
): ConnectionProgressInfo {
  // Ensure progress is within 0-100 range
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return {
    progress: clampedProgress,
    stage,
    step,
    ...(details && { details }),
  };
}

/**
 * Get progress percentage for a stage
 *
 * @param stage - Connection stage
 * @returns Progress percentage (0-100)
 *
 * @example
 * ```typescript
 * const progress = getStageProgress('connecting');
 * console.log(progress); // 40
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function getStageProgress(stage: ConnectionStage): number {
  return StageProgressMap[stage];
}

/**
 * Get step description for a stage
 *
 * @param stage - Connection stage
 * @returns Step description
 *
 * @example
 * ```typescript
 * const description = getStageDescription('connecting');
 * console.log(description); // "Connecting to wallet..."
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function getStageDescription(stage: ConnectionStage): string {
  return StageDescriptionMap[stage];
}

/**
 * Calculate progress between two stages
 *
 * Useful for smooth progress animations between stages.
 *
 * @param fromStage - Starting stage
 * @param toStage - Ending stage
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated progress percentage
 *
 * @example
 * ```typescript
 * // Calculate progress halfway between initializing and connecting
 * const progress = interpolateProgress('initializing', 'connecting', 0.5);
 * console.log(progress); // 25 (halfway between 10 and 40)
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function interpolateProgress(
  fromStage: ConnectionStage,
  toStage: ConnectionStage,
  factor: number,
): number {
  const startProgress = StageProgressMap[fromStage];
  const endProgress = StageProgressMap[toStage];
  const clampedFactor = Math.max(0, Math.min(1, factor));

  return Math.round(startProgress + (endProgress - startProgress) * clampedFactor);
}

/**
 * Check if a stage is terminal
 *
 * Terminal stages are 'connected' or 'failed'.
 *
 * @param stage - Connection stage to check
 * @returns True if stage is terminal
 *
 * @example
 * ```typescript
 * console.log(isTerminalStage('connecting')); // false
 * console.log(isTerminalStage('connected')); // true
 * console.log(isTerminalStage('failed')); // true
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function isTerminalStage(stage: ConnectionStage): boolean {
  return stage === ConnectionStages.CONNECTED || stage === ConnectionStages.FAILED;
}

/**
 * Check if a stage is in progress
 *
 * In-progress stages are all non-terminal stages.
 *
 * @param stage - Connection stage to check
 * @returns True if stage is in progress
 *
 * @example
 * ```typescript
 * console.log(isInProgress('initializing')); // true
 * console.log(isInProgress('connecting')); // true
 * console.log(isInProgress('connected')); // false
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function isInProgress(stage: ConnectionStage): boolean {
  return !isTerminalStage(stage);
}

/**
 * Connection progress tracker
 *
 * Provides a stateful progress tracker with stage management.
 */
export class ConnectionProgressTracker {
  private currentStage: ConnectionStage = ConnectionStages.INITIALIZING;
  private currentProgress: ConnectionProgressInfo;

  constructor() {
    this.currentProgress = createProgress(this.currentStage);
  }

  /**
   * Update to a new stage
   *
   * @param stage - New connection stage
   * @param details - Optional additional details
   * @returns Current progress information
   */
  updateStage(stage: ConnectionStage, details?: string): ConnectionProgressInfo {
    this.currentStage = stage;
    this.currentProgress = createProgress(stage, details);
    return this.currentProgress;
  }

  /**
   * Update with custom progress
   *
   * @param progress - Progress percentage (0-100)
   * @param step - Step description
   * @param details - Optional additional details
   * @returns Current progress information
   */
  updateCustom(progress: number, step: string, details?: string): ConnectionProgressInfo {
    this.currentProgress = createCustomProgress(progress, this.currentStage, step, details);
    return this.currentProgress;
  }

  /**
   * Get current progress
   *
   * @returns Current progress information
   */
  getCurrent(): ConnectionProgressInfo {
    return { ...this.currentProgress };
  }

  /**
   * Get current stage
   *
   * @returns Current connection stage
   */
  getCurrentStage(): ConnectionStage {
    return this.currentStage;
  }

  /**
   * Check if connection is in progress
   *
   * @returns True if connection is in progress
   */
  isInProgress(): boolean {
    return isInProgress(this.currentStage);
  }

  /**
   * Check if connection is complete (connected or failed)
   *
   * @returns True if connection is complete
   */
  isComplete(): boolean {
    return isTerminalStage(this.currentStage);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentStage = ConnectionStages.INITIALIZING;
    this.currentProgress = createProgress(this.currentStage);
  }
}

/**
 * Create a connection progress tracker
 *
 * @returns New connection progress tracker instance
 *
 * @example
 * ```typescript
 * const tracker = createProgressTracker();
 *
 * // Update to connecting stage
 * const progress = tracker.updateStage('connecting', 'Connecting to MetaMask...');
 * console.log(progress);
 * // { progress: 40, stage: 'connecting', step: 'Connecting to wallet...', details: 'Connecting to MetaMask...' }
 *
 * // Check if in progress
 * console.log(tracker.isInProgress()); // true
 *
 * // Update to connected
 * tracker.updateStage('connected');
 * console.log(tracker.isComplete()); // true
 * ```
 *
 * @category Connection Progress
 * @public
 */
export function createProgressTracker(): ConnectionProgressTracker {
  return new ConnectionProgressTracker();
}
