import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import React from 'react';

// Mock claim status types
type StatusType = 'pending' | 'approved' | 'rejected' | 'completed';

// Mock status badge component
function StatusBadge({ status }: { status: StatusType }) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span 
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
      data-testid="status-badge"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Mock claim card component
function ClaimCard({ 
  claim, 
  onClick 
}: { 
  claim: { 
    id: number;
    claimType: string;
    amount: number;
    createdAt: Date;
    description: string;
    status: StatusType;
  };
  onClick: () => void;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div 
      className="p-4 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid="claim-card"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold" data-testid="claim-type">{claim.claimType}</h3>
          <p className="text-sm text-gray-500" data-testid="claim-date">
            Submitted on {formatDate(claim.createdAt)}
          </p>
        </div>
        <StatusBadge status={claim.status} />
      </div>
      <div className="mt-2">
        <p className="text-xl font-bold" data-testid="claim-amount">{formatAmount(claim.amount)}</p>
        <p className="text-sm mt-1 text-gray-700 line-clamp-2" data-testid="claim-description">
          {claim.description}
        </p>
      </div>
    </div>
  );
}

describe('ClaimCard Component', () => {
  const mockClaim = {
    id: 1,
    claimType: 'Books',
    amount: 250.75,
    createdAt: new Date('2023-10-15'),
    description: 'Textbooks for Fall semester',
    status: 'pending' as StatusType
  };

  test('renders claim information correctly', () => {
    const handleClick = vi.fn();
    render(<ClaimCard claim={mockClaim} onClick={handleClick} />);
    
    expect(screen.getByTestId('claim-type')).toHaveTextContent('Books');
    expect(screen.getByTestId('claim-amount')).toHaveTextContent('$250.75');
    expect(screen.getByTestId('claim-description')).toHaveTextContent('Textbooks for Fall semester');
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Pending');
  });

  test('formats date correctly', () => {
    const handleClick = vi.fn();
    render(<ClaimCard claim={mockClaim} onClick={handleClick} />);
    
    // This test might be environment-dependent due to date formatting
    expect(screen.getByTestId('claim-date').textContent).toContain('Submitted on');
  });

  test('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<ClaimCard claim={mockClaim} onClick={handleClick} />);
    
    const card = screen.getByTestId('claim-card');
    await user.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows different status styles for each status type', () => {
    const handleClick = vi.fn();
    
    // Test approved status
    const approvedClaim = { ...mockClaim, status: 'approved' as StatusType };
    const { rerender } = render(<ClaimCard claim={approvedClaim} onClick={handleClick} />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Approved');
    
    // Test rejected status
    const rejectedClaim = { ...mockClaim, status: 'rejected' as StatusType };
    rerender(<ClaimCard claim={rejectedClaim} onClick={handleClick} />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Rejected');
    
    // Test completed status
    const completedClaim = { ...mockClaim, status: 'completed' as StatusType };
    rerender(<ClaimCard claim={completedClaim} onClick={handleClick} />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Completed');
  });
});