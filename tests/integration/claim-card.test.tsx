import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { mockClaim } from '../mocks/handlers';
import ClaimCard from '@/components/claim/ClaimCard';

// Mock wouter's useLocation
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => (
      <a href={to} data-testid="mock-link">{children}</a>
    )
  };
});

describe('ClaimCard Integration', () => {
  it('renders the claim card with correct data', () => {
    render(<ClaimCard claim={mockClaim} />);
    
    // Check if claim type is displayed
    expect(screen.getByText(mockClaim.claimType)).toBeInTheDocument();
    
    // Check if claim period is displayed
    expect(screen.getByText(mockClaim.claimPeriod)).toBeInTheDocument();
    
    // Check if amount is displayed correctly
    expect(screen.getByText(`€${mockClaim.amount.toFixed(2)}`, { exact: false })).toBeInTheDocument();
    
    // Check if status badge is displayed
    expect(screen.getByText('Pending')).toBeInTheDocument();
    
    // Check if claim ID is displayed
    const claimIdText = `ID: CL${mockClaim.id.toString().padStart(4, '0')}`;
    expect(screen.getByText(claimIdText)).toBeInTheDocument();
    
    // Check if the details link is rendered
    const detailsLink = screen.getByTestId('mock-link');
    expect(detailsLink).toHaveAttribute('href', `/claims/${mockClaim.id}`);
  });
  
  it('formats the date correctly', () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const claimWithCurrentDate = {
      ...mockClaim,
      createdAt: today
    };
    
    render(<ClaimCard claim={claimWithCurrentDate} />);
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});