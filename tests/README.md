# MyFinTracker Testing Documentation

## Overview

This project implements a comprehensive testing strategy with multiple test types to ensure code quality and functionality. The testing framework uses Vitest, React Testing Library, and Mock Service Worker (MSW) for API mocking.

## Test Structure

The tests are organized into the following categories:

### Unit Tests (`tests/unit/`)

Unit tests focus on testing individual functions and components in isolation.

- `utils.test.ts`: Tests utility functions like className merging
- `validators.test.ts`: Tests form validation schemas
- `status-badge.test.tsx`: Tests the StatusBadge UI component

### Integration Tests (`tests/integration/`)

Integration tests verify that multiple components work together correctly.

- `claim-card.test.tsx`: Tests the ClaimCard component with its dependencies
- `multi-claim.test.tsx`: Tests the multi-claim selection feature with form validation

### API Tests (`tests/api/`)

API tests verify the application's interaction with backend endpoints.

- `claims-api.test.ts`: Tests claim-related API calls and responses

### End-to-End Tests (`tests/e2e/`)

E2E tests simulate complete user workflows across multiple pages.

- `claim-flow.test.tsx`: Tests the full claim submission process from login to submission

## Test Utilities

- `test-utils.tsx`: Custom render function that wraps components with necessary providers
- `mocks/handlers.ts`: MSW request handlers for API mocking
- `mocks/server.ts`: MSW server setup for intercepting and mocking API requests

## Running Tests

Use the `run-tests.sh` script to run different test suites:

```bash
# Run all tests
./run-tests.sh all

# Run only unit tests
./run-tests.sh unit

# Run only integration tests
./run-tests.sh integration

# Run only API tests
./run-tests.sh api

# Run only E2E tests
./run-tests.sh e2e

# Run tests in watch mode
./run-tests.sh watch

# Run tests with coverage
./run-tests.sh coverage
```

## Test Patterns

### Component Testing Pattern

1. Render the component with test props
2. Query elements using Testing Library (getBy*, queryBy*, findBy*)
3. Interact with elements using fireEvent or userEvent
4. Assert on expected outcomes

### API Testing Pattern

1. Mock API endpoints using MSW
2. Make API requests using the application's fetch utilities
3. Assert on response status and data

### Form Testing Pattern

1. Render the form component
2. Fill in form fields using fireEvent
3. Submit the form
4. Assert that validation works as expected
5. Assert that submission handlers are called with correct data

## Coverage Goals

- Unit tests: Target 80% coverage of utility functions and UI components
- Integration tests: Cover all major user interactions and form submissions
- API tests: Cover all API endpoints used by the application
- E2E tests: Cover critical user flows from end to end

## Continuous Improvement

As new features are added to the application, corresponding tests should be created to maintain test coverage and ensure functionality. The testing strategy should evolve alongside the application.