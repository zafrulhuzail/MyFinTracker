import { describe, test, expect } from 'vitest';

// Sample utility function to test
function formatClaimAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function validateClaimAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000;
}

describe('Claim Utility Functions', () => {
  describe('formatClaimAmount', () => {
    test('formats a claim amount with dollar sign and 2 decimal places', () => {
      expect(formatClaimAmount(123.45)).toBe('$123.45');
      expect(formatClaimAmount(100)).toBe('$100.00');
      expect(formatClaimAmount(0)).toBe('$0.00');
    });
  });

  describe('validateClaimAmount', () => {
    test('returns true for valid claim amounts', () => {
      expect(validateClaimAmount(100)).toBe(true);
      expect(validateClaimAmount(10000)).toBe(true);
      expect(validateClaimAmount(1234.56)).toBe(true);
    });

    test('returns false for invalid claim amounts', () => {
      expect(validateClaimAmount(0)).toBe(false);
      expect(validateClaimAmount(-100)).toBe(false);
      expect(validateClaimAmount(10001)).toBe(false);
    });
  });
});