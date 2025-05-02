import { describe, it, expect } from 'vitest';
import { cn } from '../../client/src/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      // Test with simple strings
      expect(cn('class1', 'class2')).toBe('class1 class2');
      
      // Test with conditional classes
      expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
      
      // Test with undefined and null values
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
      
      // Test with object of class names
      expect(cn('class1', { 'class2': true, 'class3': false })).toBe('class1 class2');
      
      // Test with array of class names
      expect(cn('class1', ['class2', 'class3'])).toBe('class1 class2 class3');
    });
  });
});