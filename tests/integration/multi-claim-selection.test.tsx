import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import React from 'react';

// Mock MultiClaimSelection component
function MultiClaimSelection() {
  const [selectedClaims, setSelectedClaims] = React.useState({
    Books: { selected: false, amount: 0 },
    Insurance: { selected: false, amount: 0 },
    Travel: { selected: false, amount: 0 },
    Accommodation: { selected: false, amount: 0 },
    Other: { selected: false, amount: 0 }
  });
  
  const [totalAmount, setTotalAmount] = React.useState(0);
  
  const updateTotal = React.useCallback(() => {
    const total = Object.values(selectedClaims).reduce((sum, claim) => {
      return sum + (claim.selected ? claim.amount : 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedClaims]);
  
  React.useEffect(() => {
    updateTotal();
  }, [selectedClaims, updateTotal]);
  
  const handleClaimTypeToggle = (claimType) => {
    setSelectedClaims(prev => ({
      ...prev,
      [claimType]: {
        ...prev[claimType],
        selected: !prev[claimType].selected
      }
    }));
  };
  
  const handleAmountChange = (claimType, amount) => {
    setSelectedClaims(prev => ({
      ...prev,
      [claimType]: {
        ...prev[claimType],
        amount: Number(amount) || 0
      }
    }));
  };
  
  return (
    <div>
      <h2>Select Claim Types</h2>
      <div data-testid="claim-types-container">
        {Object.entries(selectedClaims).map(([claimType, { selected, amount }]) => (
          <div key={claimType} data-testid={`claim-type-${claimType.toLowerCase()}`}>
            <div>
              <input
                type="checkbox"
                id={`claim-type-${claimType}`}
                checked={selected}
                onChange={() => handleClaimTypeToggle(claimType)}
                data-testid={`checkbox-${claimType.toLowerCase()}`}
              />
              <label htmlFor={`claim-type-${claimType}`}>{claimType}</label>
            </div>
            
            {selected && (
              <div>
                <label htmlFor={`amount-${claimType}`}>Amount:</label>
                <input
                  type="number"
                  id={`amount-${claimType}`}
                  value={amount}
                  onChange={(e) => handleAmountChange(claimType, e.target.value)}
                  min="0"
                  data-testid={`amount-${claimType.toLowerCase()}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div data-testid="total-amount">
        Total Amount: ${totalAmount.toFixed(2)}
      </div>
    </div>
  );
}

describe('Multi-Claim Selection', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    render(<MultiClaimSelection />);
  });

  test('should display all claim types', () => {
    const claimTypes = ['Books', 'Insurance', 'Travel', 'Accommodation', 'Other'];
    
    claimTypes.forEach(type => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });
  
  test('should show amount input when a claim type is selected', async () => {
    // Initially amount field should not be visible
    expect(screen.queryByTestId('amount-books')).not.toBeInTheDocument();
    
    // Select the Books checkbox
    const booksCheckbox = screen.getByTestId('checkbox-books');
    await user.click(booksCheckbox);
    
    // Amount field should now be visible
    expect(screen.getByTestId('amount-books')).toBeInTheDocument();
  });
  
  test('should update total amount when claim amounts change', async () => {
    // Initial total should be zero
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: $0.00');
    
    // Select Books and set amount
    const booksCheckbox = screen.getByTestId('checkbox-books');
    await user.click(booksCheckbox);
    const booksAmountInput = screen.getByTestId('amount-books');
    await user.clear(booksAmountInput);
    await user.type(booksAmountInput, '250');
    
    // Total should update
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: $250.00');
    
    // Select Insurance and set amount
    const insuranceCheckbox = screen.getByTestId('checkbox-insurance');
    await user.click(insuranceCheckbox);
    const insuranceAmountInput = screen.getByTestId('amount-insurance');
    await user.clear(insuranceAmountInput);
    await user.type(insuranceAmountInput, '500');
    
    // Total should be sum of both amounts
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: $750.00');
    
    // Unselect Books (should remove its amount from total)
    await user.click(booksCheckbox);
    
    // Total should only include insurance now
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: $500.00');
  });
  
  test('should hide amount input when claim type is deselected', async () => {
    // Select the Books checkbox
    const booksCheckbox = screen.getByTestId('checkbox-books');
    await user.click(booksCheckbox);
    
    // Amount field should be visible
    expect(screen.getByTestId('amount-books')).toBeInTheDocument();
    
    // Deselect the Books checkbox
    await user.click(booksCheckbox);
    
    // Amount field should no longer be visible
    expect(screen.queryByTestId('amount-books')).not.toBeInTheDocument();
  });
});