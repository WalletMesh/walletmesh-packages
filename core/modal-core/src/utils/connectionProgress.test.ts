import { describe, expect, it } from 'vitest';
import {
  ConnectionProgressTracker,
  ConnectionStages,
  createCustomProgress,
  createProgress,
  createProgressTracker,
  getStageDescription,
  getStageProgress,
  interpolateProgress,
  isInProgress,
  isTerminalStage,
  type ConnectionProgressInfo,
} from './connectionProgress.js';

describe('connectionProgress utils', () => {
  describe('createProgress', () => {
    it('should create progress for initializing stage', () => {
      const progress = createProgress('initializing');

      expect(progress).toEqual({
        progress: 10,
        stage: 'initializing',
        step: 'Initializing connection...',
      });
    });

    it('should create progress for connecting stage', () => {
      const progress = createProgress('connecting');

      expect(progress).toEqual({
        progress: 40,
        stage: 'connecting',
        step: 'Connecting to wallet...',
      });
    });

    it('should create progress with custom details', () => {
      const progress = createProgress('connecting', 'Connecting to MetaMask...');

      expect(progress).toEqual({
        progress: 40,
        stage: 'connecting',
        step: 'Connecting to wallet...',
        details: 'Connecting to MetaMask...',
      });
    });

    it('should create progress for connected stage', () => {
      const progress = createProgress('connected');

      expect(progress).toEqual({
        progress: 100,
        stage: 'connected',
        step: 'Connected successfully',
      });
    });

    it('should create progress for failed stage', () => {
      const progress = createProgress('failed', 'Connection timeout');

      expect(progress).toEqual({
        progress: 0,
        stage: 'failed',
        step: 'Connection failed',
        details: 'Connection timeout',
      });
    });
  });

  describe('createCustomProgress', () => {
    it('should create custom progress with specified values', () => {
      const progress = createCustomProgress(60, 'connecting', 'Waiting for approval...', 'Check your wallet');

      expect(progress).toEqual({
        progress: 60,
        stage: 'connecting',
        step: 'Waiting for approval...',
        details: 'Check your wallet',
      });
    });

    it('should clamp progress to 0-100 range', () => {
      const progressNegative = createCustomProgress(-10, 'connecting', 'Test');
      expect(progressNegative.progress).toBe(0);

      const progressOverMax = createCustomProgress(150, 'connecting', 'Test');
      expect(progressOverMax.progress).toBe(100);
    });

    it('should work without details', () => {
      const progress = createCustomProgress(75, 'authenticating', 'Authenticating...');

      expect(progress).toEqual({
        progress: 75,
        stage: 'authenticating',
        step: 'Authenticating...',
      });
    });
  });

  describe('getStageProgress', () => {
    it('should return correct progress for each stage', () => {
      expect(getStageProgress('initializing')).toBe(10);
      expect(getStageProgress('connecting')).toBe(40);
      expect(getStageProgress('authenticating')).toBe(70);
      expect(getStageProgress('connected')).toBe(100);
      expect(getStageProgress('failed')).toBe(0);
    });
  });

  describe('getStageDescription', () => {
    it('should return correct description for each stage', () => {
      expect(getStageDescription('initializing')).toBe('Initializing connection...');
      expect(getStageDescription('connecting')).toBe('Connecting to wallet...');
      expect(getStageDescription('authenticating')).toBe('Authenticating...');
      expect(getStageDescription('connected')).toBe('Connected successfully');
      expect(getStageDescription('failed')).toBe('Connection failed');
    });
  });

  describe('interpolateProgress', () => {
    it('should interpolate between stages', () => {
      // Halfway between initializing (10) and connecting (40)
      const progress = interpolateProgress('initializing', 'connecting', 0.5);
      expect(progress).toBe(25);
    });

    it('should return start progress when factor is 0', () => {
      const progress = interpolateProgress('initializing', 'connecting', 0);
      expect(progress).toBe(10);
    });

    it('should return end progress when factor is 1', () => {
      const progress = interpolateProgress('initializing', 'connecting', 1);
      expect(progress).toBe(40);
    });

    it('should clamp factor to 0-1 range', () => {
      const progressNegative = interpolateProgress('initializing', 'connecting', -0.5);
      expect(progressNegative).toBe(10); // Same as factor 0

      const progressOverMax = interpolateProgress('initializing', 'connecting', 1.5);
      expect(progressOverMax).toBe(40); // Same as factor 1
    });
  });

  describe('isTerminalStage', () => {
    it('should return true for terminal stages', () => {
      expect(isTerminalStage('connected')).toBe(true);
      expect(isTerminalStage('failed')).toBe(true);
    });

    it('should return false for non-terminal stages', () => {
      expect(isTerminalStage('initializing')).toBe(false);
      expect(isTerminalStage('connecting')).toBe(false);
      expect(isTerminalStage('authenticating')).toBe(false);
    });
  });

  describe('isInProgress', () => {
    it('should return true for non-terminal stages', () => {
      expect(isInProgress('initializing')).toBe(true);
      expect(isInProgress('connecting')).toBe(true);
      expect(isInProgress('authenticating')).toBe(true);
    });

    it('should return false for terminal stages', () => {
      expect(isInProgress('connected')).toBe(false);
      expect(isInProgress('failed')).toBe(false);
    });
  });

  describe('ConnectionProgressTracker', () => {
    it('should initialize with initializing stage', () => {
      const tracker = new ConnectionProgressTracker();

      expect(tracker.getCurrentStage()).toBe('initializing');
      expect(tracker.getCurrent()).toEqual({
        progress: 10,
        stage: 'initializing',
        step: 'Initializing connection...',
      });
    });

    it('should update stage', () => {
      const tracker = new ConnectionProgressTracker();

      const progress = tracker.updateStage('connecting', 'Connecting to MetaMask...');

      expect(progress).toEqual({
        progress: 40,
        stage: 'connecting',
        step: 'Connecting to wallet...',
        details: 'Connecting to MetaMask...',
      });
      expect(tracker.getCurrentStage()).toBe('connecting');
    });

    it('should update with custom progress', () => {
      const tracker = new ConnectionProgressTracker();
      tracker.updateStage('connecting');

      const progress = tracker.updateCustom(60, 'Waiting for approval...', 'Check your wallet');

      expect(progress).toEqual({
        progress: 60,
        stage: 'connecting', // Stage stays the same
        step: 'Waiting for approval...',
        details: 'Check your wallet',
      });
    });

    it('should track in-progress state', () => {
      const tracker = new ConnectionProgressTracker();

      expect(tracker.isInProgress()).toBe(true);

      tracker.updateStage('connecting');
      expect(tracker.isInProgress()).toBe(true);

      tracker.updateStage('connected');
      expect(tracker.isInProgress()).toBe(false);
    });

    it('should track completion state', () => {
      const tracker = new ConnectionProgressTracker();

      expect(tracker.isComplete()).toBe(false);

      tracker.updateStage('connecting');
      expect(tracker.isComplete()).toBe(false);

      tracker.updateStage('connected');
      expect(tracker.isComplete()).toBe(true);
    });

    it('should reset to initial state', () => {
      const tracker = new ConnectionProgressTracker();

      tracker.updateStage('connected');
      expect(tracker.isComplete()).toBe(true);

      tracker.reset();

      expect(tracker.getCurrentStage()).toBe('initializing');
      expect(tracker.isInProgress()).toBe(true);
      expect(tracker.getCurrent()).toEqual({
        progress: 10,
        stage: 'initializing',
        step: 'Initializing connection...',
      });
    });

    it('should return a copy of current progress', () => {
      const tracker = new ConnectionProgressTracker();

      const progress1 = tracker.getCurrent();
      const progress2 = tracker.getCurrent();

      expect(progress1).toEqual(progress2);
      expect(progress1).not.toBe(progress2); // Different objects
    });
  });

  describe('createProgressTracker', () => {
    it('should create a new tracker instance', () => {
      const tracker = createProgressTracker();

      expect(tracker).toBeInstanceOf(ConnectionProgressTracker);
      expect(tracker.getCurrentStage()).toBe('initializing');
    });
  });

  describe('ConnectionStages constants', () => {
    it('should have all expected stage constants', () => {
      expect(ConnectionStages.INITIALIZING).toBe('initializing');
      expect(ConnectionStages.CONNECTING).toBe('connecting');
      expect(ConnectionStages.AUTHENTICATING).toBe('authenticating');
      expect(ConnectionStages.CONNECTED).toBe('connected');
      expect(ConnectionStages.FAILED).toBe('failed');
    });
  });
});
