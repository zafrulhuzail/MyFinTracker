import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import React from 'react';
import { mockUser, mockClaim } from '../mocks/handlers';
import Login from '../../client/src/pages/Login';
import NewClaim from '../../client/src/pages/NewClaim';
import Dashboard from '../../client/src/pages/Dashboard';

// Mock useAuth hook
vi.mock('../../client/src/contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../client/src/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn().mockResolvedValue(mockUser),
      logout: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(mockUser)
    })
  };
});

// Mock useNavigate from wouter
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/dashboard', vi.fn()],
    useRoute: () => [true, { id: '1' }],
    useNavigate: () => vi.fn()
  };
});

// Mock React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: ({ queryKey }) => {
      if (queryKey[0] === '/api/claims') {
        return {
          data: [mockClaim],
          isLoading: false,
          error: null
        };
      }
      return {
        data: null,
        isLoading: false,
        error: null
      };
    },
    useMutation: () => ({
      mutate: vi.fn().mockImplementation((data, { onSuccess }) => {
        onSuccess?.(mockClaim);
      }),
      isPending: false,
      isError: false,
      error: null
    })
  };
});

describe('End-to-End Claim Flow', () => {
  describe('Login Flow', () => {
    it('should allow a user to log in', async () => {
      const loginFn = vi.fn().mockResolvedValue(mockUser);
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: loginFn,
        logout: vi.fn(),
        register: vi.fn()
      });
      
      render(<Login />);
      
      // Fill in login form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'student1' }
      });
      
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Verify login function was called with correct credentials
      await waitFor(() => {
        expect(loginFn).toHaveBeenCalledWith('student1', 'password123');
      });
    });
  });
  
  describe('Create Claim Flow', () => {
    it('should allow a user to create a new claim', async () => {
      const mutateFn = vi.fn().mockImplementation((data, options) => {
        options?.onSuccess?.(mockClaim);
      });
      
      vi.mocked(useMutation).mockReturnValue({
        mutate: mutateFn,
        isPending: false,
        isError: false,
        error: null
      });
      
      const navigateFn = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(navigateFn);
      
      render(<NewClaim />);
      
      // Fill in claim form fields
      fireEvent.change(screen.getByLabelText(/claim type/i), {
        target: { value: 'Tuition Fee' }
      });
      
      fireEvent.change(screen.getByLabelText(/amount/i), {
        target: { value: '1000' }
      });
      
      fireEvent.change(screen.getByLabelText(/claim period/i), {
        target: { value: 'Fall 2023' }
      });
      
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Tuition fee for fall semester' }
      });
      
      // Check declaration checkbox
      fireEvent.click(screen.getByLabelText(/i declare/i));
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      
      // Verify claim creation and navigation
      await waitFor(() => {
        expect(mutateFn).toHaveBeenCalled();
        expect(navigateFn).toHaveBeenCalledWith('/claims');
      });
    });
  });
  
  describe('Dashboard View', () => {
    it('should display user claims on the dashboard', async () => {
      render(<Dashboard />);
      
      // Check if claims are displayed
      await waitFor(() => {
        expect(screen.getByText(mockClaim.claimType)).toBeInTheDocument();
        expect(screen.getByText(`€${mockClaim.amount.toFixed(2)}`, { exact: false })).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
      
      // Check if user information is displayed
      expect(screen.getByText(mockUser.fullName, { exact: false })).toBeInTheDocument();
    });
  });
});