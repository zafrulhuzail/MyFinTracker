#!/bin/bash

# Script to run various test suites

# Function to restart the application
restart_app() {
  echo "Restarting application..."
  echo "Please press Enter to continue after tests have completed."
  read -p "Application will restart after you press Enter."
  npm run dev
}

# Check if application is running and ask to stop
check_and_stop() {
  echo "Running tests..."
  echo "NOTE: If the application is running, you need to stop it first (Ctrl+C)."
}

run_test() {
  check_and_stop
  $1
  echo "Tests completed."
  echo "Would you like to restart the application? (y/n)"
  read restart_choice
  if [[ $restart_choice == "y" ]]; then
    restart_app
  fi
}

case "$1" in
  unit)
    echo "Running unit tests..."
    run_test "npx vitest run tests/unit/claim-utils.test.ts"
    ;;
  
  integration)
    echo "Running integration tests..."
    run_test "npx vitest run tests/integration/claim-interaction.test.tsx"
    ;;
  
  api)
    echo "Running API tests..."
    run_test "npx vitest run tests/api/claims-api-test.ts"
    ;;
  
  e2e)
    echo "Running end-to-end tests..."
    run_test "npx vitest run tests/e2e/claim-submission.test.tsx"
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