# Testing Guide for MyFinTracker

This guide explains the testing framework implemented in MyFinTracker and provides instructions on writing and running tests.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Tools](#testing-tools)
3. [Test Types](#test-types)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Mocking](#mocking)
7. [Testing Best Practices](#testing-best-practices)

## Testing Overview

MyFinTracker uses a comprehensive testing approach with multiple layers of tests:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                      End-to-End Tests                     │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                    Integration Tests                      │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                    │                  │                   │
│     Unit Tests     │    API Tests     │  Component Tests  │
│                    │                  │                   │
└────────────────────┴──────────────────┴───────────────────┘
```

This pyramid structure follows testing best practices, with more unit tests at the base and fewer, more complex end-to-end tests at the top.

## Testing Tools

MyFinTracker uses the following testing tools:

- **Vitest**: A fast JavaScript testing framework compatible with Vite
- **Testing Library**: A set of utilities for testing React components
- **MSW (Mock Service Worker)**: Library for mocking API requests
- **user-event**: Library for simulating user interactions

## Test Types

### Unit Tests

Unit tests verify that individual functions and components work correctly in isolation.

**Location**: `tests/unit/`

**Examples**:
- Utility function tests
- Form validation logic
- Individual component rendering
- Status formatting and display

```typescript
// Example unit test for a utility function
import { describe, test, expect } from 'vitest';

function formatClaimAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

describe('formatClaimAmount', () => {
  test('formats a claim amount with dollar sign and 2 decimal places', () => {
    expect(formatClaimAmount(123.45)).toBe('$123.45');
    expect(formatClaimAmount(100)).toBe('$100.00');
    expect(formatClaimAmount(0)).toBe('$0.00');
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly.

**Location**: `tests/integration/`

**Examples**:
- Multi-claim selection functionality
- Notification system interactions
- Form submissions and validations
- Component interactions

```typescript
// Example integration test
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClaimForm from '../../client/src/components/claim/ClaimForm';

describe('ClaimForm', () => {
  test('should update total when multiple claims are selected', async () => {
    const user = userEvent.setup();
    render(<ClaimForm />);
    
    // Check initial total
    expect(screen.getByTestId('total-amount')).toHaveTextContent('$0.00');
    
    // Select first claim type
    await user.click(screen.getByLabelText('Books'));
    await user.type(screen.getByTestId('books-amount'), '250');
    
    // Select second claim type
    await user.click(screen.getByLabelText('Insurance'));
    await user.type(screen.getByTestId('insurance-amount'), '1000');
    
    // Check updated total
    expect(screen.getByTestId('total-amount')).toHaveTextContent('$1250.00');
  });
});
```

### API Tests

API tests verify that API endpoints work correctly.

**Location**: `tests/api/`

**Examples**:
- Authentication endpoints
- Claim CRUD operations
- Data validation and error handling

```typescript
// Example API test
import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Setup mock server
const handlers = [
  http.get('/api/claims', () => {
    return HttpResponse.json([
      { id: 1, claimType: 'Books', amount: 250.75, status: 'pending' }
    ]);
  })
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Claims API', () => {
  test('fetches claims successfully', async () => {
    const response = await fetch('/api/claims');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].claimType).toBe('Books');
  });
});
```

### End-to-End Tests

End-to-end tests verify complete user flows and interactions.

**Location**: `tests/e2e/`

**Examples**:
- User registration and login
- Complete claim submission flow
- Multi-step processes

```typescript
// Example E2E test
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../client/src/App';

describe('Claim Submission Flow', () => {
  test('user can submit a claim', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Login
    await user.type(screen.getByLabelText('Username'), 'student1');
    await user.type(screen.getByLabelText('Password'), 'student123');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    // Navigate to new claim page
    await user.click(screen.getByRole('link', { name: 'Submit New Claim' }));
    
    // Fill claim form
    await user.click(screen.getByLabelText('Books'));
    await user.type(screen.getByTestId('books-amount'), '250');
    await user.type(screen.getByLabelText('Description'), 'Textbooks for fall semester');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    // Verify success message
    expect(screen.getByText('Claim submitted successfully')).toBeInTheDocument();
  });
});
```

## Running Tests

Tests can be run using the `run-tests.sh` script:

```bash
# Run all tests
./run-tests.sh all

# Run specific test categories
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh api
./run-tests.sh e2e

# Run specific feature tests
./run-tests.sh claim-card
./run-tests.sh form-validation
./run-tests.sh multi-claim
./run-tests.sh notifications

# Run a specific test file
./run-tests.sh single tests/unit/claim-utils.test.ts
```

## Writing Tests

### Test Structure

Tests should follow this structure:

1. **Arrange**: Set up the test conditions
2. **Act**: Perform the action being tested
3. **Assert**: Verify the expected outcomes

```typescript
import { describe, test, expect } from 'vitest';

describe('Component or function name', () => {
  test('should describe expected behavior', () => {
    // Arrange
    const input = 100;
    
    // Act
    const result = formatClaimAmount(input);
    
    // Assert
    expect(result).toBe('$100.00');
  });
});
```

### Testing React Components

For testing React components:

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClaimCard } from '../../client/src/components/claim';

describe('ClaimCard', () => {
  test('renders claim information correctly', () => {
    // Arrange
    const claim = {
      id: 1,
      claimType: 'Books',
      amount: 250.75,
      status: 'pending',
      createdAt: new Date('2023-10-15')
    };
    
    // Act
    render(<ClaimCard claim={claim} onClick={() => {}} />);
    
    // Assert
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('$250.75')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
  
  test('calls onClick handler when clicked', async () => {
    // Arrange
    const claim = {
      id: 1,
      claimType: 'Books',
      amount: 250.75,
      status: 'pending',
      createdAt: new Date('2023-10-15')
    };
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    // Act
    render(<ClaimCard claim={claim} onClick={handleClick} />);
    await user.click(screen.getByTestId('claim-card'));
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Mocking

### Mocking API Calls

Use MSW to mock API calls:

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  http.get('/api/claims', () => {
    return HttpResponse.json([
      { id: 1, claimType: 'Books', amount: 250.75, status: 'pending' }
    ]);
  }),
  
  http.post('/api/claims', async ({ request }) => {
    const reqBody = await request.json();
    return HttpResponse.json({ id: 2, ...reqBody, status: 'pending' });
  })
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
```

### Mocking Functions

Use Vitest's mocking functions:

```typescript
import { vi } from 'vitest';

// Mock a specific function
const formatDate = vi.fn().mockReturnValue('10/15/2023');

// Mock a module
vi.mock('../../client/src/utils/formatters', () => ({
  formatDate: vi.fn().mockReturnValue('10/15/2023'),
  formatAmount: vi.fn().mockReturnValue('$250.75')
}));

// Spy on a method
const consoleSpy = vi.spyOn(console, 'log');

// Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
```

## Testing Best Practices

1. **Focus on Behavior, Not Implementation**: Test what the code does, not how it's implemented

2. **Use Descriptive Test Names**: Make test names clearly explain expected behavior

3. **Isolate Tests**: Each test should be independent of others

4. **Use Data-Test Attributes**: Use `data-testid` for selecting elements in tests

   ```tsx
   // In component
   <div data-testid="claim-card">...</div>
   
   // In test
   screen.getByTestId('claim-card')
   ```

5. **Test Edge Cases**: Include tests for boundary conditions and error cases

6. **Keep Tests Fast**: Tests should execute quickly to support rapid development

7. **Group Related Tests**: Use `describe` blocks to group related tests

8. **Test Accessibility**: Ensure components meet accessibility standards

9. **Avoid Testing Implementation Details**: Focus on public API and user interactions

10. **Follow the Testing Pyramid**: Write more unit tests than integration and E2E tests