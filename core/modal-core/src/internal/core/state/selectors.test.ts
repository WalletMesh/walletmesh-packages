/**
 * Tests for state selectors
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import {
  createCombinedSelector,
  createMemoizedSelector,
  createPathSelector,
  createPredicateSelector,
  createPropertySelector,
  createTransformSelector,
} from './selectors.js';

// Install custom matchers
installCustomMatchers();

// Test state interface
interface TestState {
  count: number;
  user: {
    name: string;
    email: string;
    profile: {
      age: number;
      avatar: string;
    };
  };
  items: string[];
  settings: {
    darkMode: boolean;
    notifications: boolean;
  };
}

describe('State Selectors', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  const testState: TestState = {
    count: 42,
    user: {
      name: 'Test User',
      email: 'test@example.com',
      profile: {
        age: 30,
        avatar: 'avatar.png',
      },
    },
    items: ['item1', 'item2', 'item3'],
    settings: {
      darkMode: true,
      notifications: false,
    },
  };

  describe('createPropertySelector', () => {
    it('should select specific properties from state', () => {
      const selector = createPropertySelector<TestState, 'count' | 'items'>(['count', 'items']);
      const result = selector(testState);

      expect(result).toEqual({
        count: 42,
        items: ['item1', 'item2', 'item3'],
      });
    });

    it('should handle empty property list', () => {
      const selector = createPropertySelector<TestState, never>([]);
      const result = selector(testState);

      expect(result).toEqual({});
    });
  });

  describe('createTransformSelector', () => {
    it('should transform selected values', () => {
      const baseSelector = (state: TestState) => state.items;
      const transformSelector = createTransformSelector(baseSelector, (items) =>
        items.map((item) => item.toUpperCase()),
      );

      const result = transformSelector(testState);
      expect(result).toEqual(['ITEM1', 'ITEM2', 'ITEM3']);
    });

    it('should handle complex transformations', () => {
      const userSelector = (state: TestState) => state.user;
      const transformSelector = createTransformSelector(userSelector, (user) => ({
        displayName: user.name,
        contactInfo: user.email,
        age: user.profile.age,
      }));

      const result = transformSelector(testState);
      expect(result).toEqual({
        displayName: 'Test User',
        contactInfo: 'test@example.com',
        age: 30,
      });
    });
  });

  describe('createCombinedSelector', () => {
    it('should combine multiple selectors', () => {
      const countSelector = (state: TestState) => state.count;
      const userNameSelector = (state: TestState) => state.user.name;
      const itemsCountSelector = (state: TestState) => state.items.length;

      // Combine selectors with proper typing
      const combinedSelector = createCombinedSelector<
        TestState,
        {
          count: number;
          userName: string;
          itemsCount: number;
        }
      >({
        count: countSelector,
        userName: userNameSelector,
        itemsCount: itemsCountSelector,
      });

      const result = combinedSelector(testState);
      expect(result).toEqual({
        count: 42,
        userName: 'Test User',
        itemsCount: 3,
      });
    });
  });

  describe('createMemoizedSelector', () => {
    it('should memoize results for same state reference', () => {
      const expensiveOperation = vi.fn((state: TestState) => {
        return state.items.reduce((sum, item) => sum + item.length, 0);
      });

      const memoizedSelector = createMemoizedSelector(expensiveOperation);

      // First call
      const result1 = memoizedSelector(testState);
      expect(result1).toBe(15); // 5 + 5 + 5
      expect(expensiveOperation).toHaveBeenCalledTimes(1);

      // Same state reference
      const result2 = memoizedSelector(testState);
      expect(result2).toBe(15);
      expect(expensiveOperation).toHaveBeenCalledTimes(1); // Not called again

      // Different state reference with same values
      const newState = { ...testState };
      const result3 = memoizedSelector(newState);
      expect(result3).toBe(15);
      expect(expensiveOperation).toHaveBeenCalledTimes(2); // Called again for new reference
    });
  });

  describe('createPredicateSelector', () => {
    it('should check conditions on state', () => {
      const hasDarkMode = createPredicateSelector<TestState>((state) => state.settings.darkMode);

      const hasNotifications = createPredicateSelector<TestState>((state) => state.settings.notifications);

      const hasItems = createPredicateSelector<TestState>((state) => state.items.length > 0);

      expect(hasDarkMode(testState)).toBe(true);
      expect(hasNotifications(testState)).toBe(false);
      expect(hasItems(testState)).toBe(true);
    });
  });

  describe('createPathSelector', () => {
    it('should select values by path', () => {
      const avatarSelector = createPathSelector<TestState, string>(['user', 'profile', 'avatar']);

      const emailSelector = createPathSelector<TestState, string>(['user', 'email']);

      const secondItemSelector = createPathSelector<TestState, string>(['items', 1]);

      expect(avatarSelector(testState)).toBe('avatar.png');
      expect(emailSelector(testState)).toBe('test@example.com');
      expect(secondItemSelector(testState)).toBe('item2');
    });

    it('should return default value for missing paths', () => {
      const missingSelector = createPathSelector<TestState, string>(
        ['user', 'profile', 'nonexistent'],
        'default',
      );

      expect(missingSelector(testState)).toBe('default');
    });

    it('should handle path through arrays', () => {
      // Create a selector that gets a character that doesn't exist (item1[4])
      // and provides a default value
      const itemCharSelector = createPathSelector<TestState, string>(
        ['items', 0, 4], // item1[4] doesn't exist (item1 is "item1")
        'x',
      );

      // Create a test state with modified items
      const modifiedState = {
        ...testState,
        items: ['a', 'b', 'c'], // shorter strings to ensure index 4 is out of bounds
      };

      expect(itemCharSelector(modifiedState)).toBe('x'); // Should return default value
    });
  });
});
