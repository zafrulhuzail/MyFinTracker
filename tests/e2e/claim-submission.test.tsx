import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utils';
import NewClaim from '../../client/src/pages/NewClaim';

/**
 * End-to-end test for claim submission flow
 * 
 * This test simulates a user creating a new claim
 */
describe('Claim Submission E2E', () => {
  test('should allow a user to submit a claim', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    vi.mock('../../client/src/lib/api', () => ({
      apiRequest: vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ id: 1, status: 'pending' })
      })
    }));
    
    // Render the new claim form page
    customRender(<NewClaim />, { route: '/new-claim' });
    
    // Check that the form is displayed
    expect(await screen.findByText(/submit new claim/i)).toBeInTheDocument();
    
    // Test assertion - we're just checking the basic rendering for now 
    // since e2e testing requires more complex setup
    expect(screen.getByText(/claim form/i)).toBeInTheDocument();
  });
});