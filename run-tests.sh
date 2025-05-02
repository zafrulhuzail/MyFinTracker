#!/bin/bash

# Script to run various test suites

run_test() {
  echo "Running tests..."
  $1
  echo "Tests completed."
}

case "$1" in
  unit)
    echo "Running unit tests..."
    run_test "npx vitest run tests/unit"
    ;;
  
  integration)
    echo "Running integration tests..."
    run_test "npx vitest run tests/integration"
    ;;
  
  api)
    echo "Running API tests..."
    run_test "npx vitest run tests/api"
    ;;
  
  e2e)
    echo "Running end-to-end tests..."
    run_test "npx vitest run tests/e2e"
    ;;
  
  claim-card)
    echo "Running claim card tests..."
    run_test "npx vitest run tests/unit/claim-card.test.tsx"
    ;;

  form-validation)
    echo "Running form validation tests..."
    run_test "npx vitest run tests/unit/form-validation.test.ts"
    ;;

  multi-claim)
    echo "Running multi-claim tests..."
    run_test "npx vitest run tests/integration/multi-claim-selection.test.tsx"
    ;;

  notifications)
    echo "Running notification system tests..."
    run_test "npx vitest run tests/integration/notification-system.test.tsx"
    ;;

  api-endpoints)
    echo "Running API endpoints tests..."
    run_test "npx vitest run tests/api/claims-endpoints.test.ts"
    ;;
  
  single)
    echo "Running a single test file..."
    if [ -z "$2" ]; then
      echo "Please specify a test file path."
      echo "Example: ./run-tests.sh single tests/unit/claim-utils.test.ts"
      exit 1
    fi
    run_test "npx vitest run $2"
    ;;
  
  all)
    echo "Running all tests..."
    run_test "npx vitest run"
    ;;
  
  *)
    echo "Usage: $0 {unit|integration|api|e2e|single|all}"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh unit       - Run unit tests"
    echo "  ./run-tests.sh integration - Run integration tests"
    echo "  ./run-tests.sh api        - Run API tests"
    echo "  ./run-tests.sh e2e        - Run end-to-end tests"
    echo "  ./run-tests.sh single tests/unit/claim-utils.test.ts - Run a specific test file"
    echo "  ./run-tests.sh all        - Run all tests"
    exit 1
esac