#!/usr/bin/env node

/**
 * Database migration script for MARA Claim System
 * 
 * This script runs the Drizzle migration to ensure the database schema is up-to-date.
 * It should be run before starting the application in production.
 */

const { execSync } = require('child_process');
const path = require('path');

// Colorized output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}=== MARA Claim System Database Migration ====${colors.reset}`);

try {
  console.log(`${colors.yellow}Checking database connection...${colors.reset}`);
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  console.log(`${colors.yellow}Running database migration...${colors.reset}`);
  execSync('npm run db:push', { stdio: 'inherit' });
  
  console.log(`${colors.green}Database migration completed successfully!${colors.reset}`);
  
} catch (error) {
  console.error(`${colors.red}Error during database migration: ${error.message}${colors.reset}`);
  process.exit(1);
}