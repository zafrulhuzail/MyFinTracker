# MyFinTracker Testing Documentation

This directory contains tests for the MyFinTracker application. The testing setup uses:

- **Vitest** as the test runner
- **Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking

## Test Structure

The tests are organized into the following categories:

### 1. Unit Tests (`/unit`)
- Test individual functions and small components in isolation
- Focus on pure logic and UI rendering
- Example: `claim-utils.test.ts`

### 2. Integration Tests (`/integration`)
- Test interactions between components
- Focus on how components work together
- Example: `claim-interaction.test.tsx`

### 3. API Tests (`/api`)
- Test API endpoints and data fetching
- Use MSW to mock server responses
- Example: `claims-api-test.ts`

### 4. End-to-End Tests (`/e2e`)
- Test complete user flows
- Simulate real user interactions across multiple pages
- Example: `claim-submission.test.tsx`

## Running Tests

You can run tests using the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test categories
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh api
./run-tests.sh e2e
./run-tests.sh all

# Run a specific test file
npx vitest run tests/unit/claim-utils.test.ts
```

## Test Utilities

The `test-utils.tsx` file provides:

- Custom render function that includes all providers (authentication, routing, etc.)
- Helper functions for common testing tasks

## Writing Tests

### Test Naming Convention

Follow this pattern for test names:
- `describe`: Name the feature or component being tested
- `test`: Describe what is being tested and the expected outcome

Example:
```typescript
describe('ClaimCard component', () => {
  test('should display claim status correctly', () => {
    // Test implementation
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's built.
2. **Use Data-Test Attributes**: For component selection, use `data-testid` attributes.
3. **Mock External Dependencies**: Use MSW to mock API calls, don't rely on real network requests.
4. **Keep Tests Independent**: Each test should run in isolation without depending on other tests.
5. **Use Setup and Teardown**: Utilize `beforeEach`, `afterEach`, etc. for common setup and cleanup.