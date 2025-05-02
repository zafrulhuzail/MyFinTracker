import { describe, test, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import React from 'react';

// Mock component for testing
function ClaimInteraction() {
  return (
    <div>
      <h1>Claim Interaction Example</h1>
      <form data-testid="claim-form">
        <label htmlFor="amount">Amount</label>
        <input id="amount" data-testid="amount-input" type="number" />
        
        <div>
          <input id="type-books" type="checkbox" value="Books" />
          <label htmlFor="type-books">Books</label>
        </div>
        
        <div>
          <input id="type-insurance" type="checkbox" value="Insurance" />
          <label htmlFor="type-insurance">Insurance</label>
        </div>
        
        <button type="submit">Submit Claim</button>
      </form>
    </div>
  );
}

describe('Claim Interaction Integration', () => {
  test('should allow user to fill in claim form', async () => {
    const user = userEvent.setup();
    
    // Render the component with our custom renderer
    render(<ClaimInteraction />);
    
    // Fill in the amount field
    const amountInput = screen.getByTestId('amount-input');
    await user.type(amountInput, '1500');
    
    // Check the insurance checkbox
    const insuranceCheckbox = screen.getByLabelText(/Insurance/i);
    await user.click(insuranceCheckbox);
    
    // Verify the form state
    expect(amountInput).toHaveValue(1500);
    expect(insuranceCheckbox).toBeChecked();
  });
});