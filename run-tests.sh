#!/bin/bash

# Script to run various test suites

case "$1" in
  unit)
    echo "Running unit tests..."
    npx vitest run tests/unit/**/*.test.{ts,tsx}
    ;;
  
  integration)
    echo "Running integration tests..."
    npx vitest run tests/integration/**/*.test.{ts,tsx}
    ;;
  
  api)
    echo "Running API tests..."
    npx vitest run tests/api/**/*.test.ts
    ;;
  
  e2e)
    echo "Running end-to-end tests..."
    npx vitest run tests/e2e/**/*.test.{ts,tsx}
    ;;
  
  all)
    echo "Running all tests..."
    npx vitest run
    ;;
  
  watch)
    echo "Running tests in watch mode..."
    npx vitest
    ;;
  
  coverage)
    echo "Running tests with coverage..."
    npx vitest run --coverage
    ;;
  
  *)
    echo "Usage: $0 {unit|integration|api|e2e|all|watch|coverage}"
    exit 1
esac