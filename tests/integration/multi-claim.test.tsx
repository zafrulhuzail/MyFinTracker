import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import React from 'react';
import { mockUser } from '../mocks/handlers';
import MultiClaimForm from '../../client/src/components/claim/MultiClaimForm';

// Mock React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: () => ({
      mutate: vi.fn().mockImplementation((data, { onSuccess }) => {
        onSuccess?.(data);
      }),
      isPending: false,
      isError: false,
      error: null
    })
  };
});

// Mock useAuth hook
vi.mock('../../client/src/contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../client/src/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    })
  };
});

// Mock useNavigate
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock toast
vi.mock('../../client/src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('MultiClaimForm Integration', () => {
  it('should allow selecting multiple claim types with amounts', async () => {
    const onSubmitMock = vi.fn();
    
    render(<MultiClaimForm onSubmit={onSubmitMock} />);
    
    // Check Tuition Fee checkbox
    const tuitionCheckbox = screen.getByLabelText(/tuition fee/i);
    fireEvent.click(tuitionCheckbox);
    
    // Enter tuition fee amount
    const tuitionInput = screen.getByLabelText(/tuition fee amount/i);
    fireEvent.change(tuitionInput, { target: { value: '1000' } });
    
    // Check Insurance checkbox
    const insuranceCheckbox = screen.getByLabelText(/insurance/i);
    fireEvent.click(insuranceCheckbox);
    
    // Enter insurance amount
    const insuranceInput = screen.getByLabelText(/insurance amount/i);
    fireEvent.change(insuranceInput, { target: { value: '500' } });
    
    // Check if total is updated correctly
    const totalElement = screen.getByText(/total:/i);
    expect(totalElement.textContent).toContain('1500');
    
    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/claim period/i), {
      target: { value: 'Fall 2023' }
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Multiple claim types for semester' }
    });
    
    // Check declaration checkbox
    const declarationCheckbox = screen.getByLabelText(/i declare/i);
    fireEvent.click(declarationCheckbox);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Verify form submission with correct data
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith(expect.objectContaining({
        selectedClaims: expect.arrayContaining([
          { type: 'Tuition Fee', amount: 1000 },
          { type: 'Insurance', amount: 500 }
        ]),
        totalAmount: 1500,
        claimPeriod: 'Fall 2023',
        description: 'Multiple claim types for semester'
      }));
    });
  });
  
  it('should validate that at least one claim type is selected', async () => {
    const onSubmitMock = vi.fn();
    
    render(<MultiClaimForm onSubmit={onSubmitMock} />);
    
    // Fill other required fields without selecting any claim type
    fireEvent.change(screen.getByLabelText(/claim period/i), {
      target: { value: 'Fall 2023' }
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Multiple claim types for semester' }
    });
    
    // Check declaration checkbox
    const declarationCheckbox = screen.getByLabelText(/i declare/i);
    fireEvent.click(declarationCheckbox);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/at least one claim type must be selected/i)).toBeInTheDocument();
    });
    
    // Verify form wasn't submitted
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
  
  it('should validate that all selected claim types have positive amounts', async () => {
    const onSubmitMock = vi.fn();
    
    render(<MultiClaimForm onSubmit={onSubmitMock} />);
    
    // Check Tuition Fee checkbox
    const tuitionCheckbox = screen.getByLabelText(/tuition fee/i);
    fireEvent.click(tuitionCheckbox);
    
    // Enter invalid tuition fee amount (zero)
    const tuitionInput = screen.getByLabelText(/tuition fee amount/i);
    fireEvent.change(tuitionInput, { target: { value: '0' } });
    
    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/claim period/i), {
      target: { value: 'Fall 2023' }
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Multiple claim types for semester' }
    });
    
    // Check declaration checkbox
    const declarationCheckbox = screen.getByLabelText(/i declare/i);
    fireEvent.click(declarationCheckbox);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Verify error message about amounts
    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });
    
    // Verify form wasn't submitted
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});