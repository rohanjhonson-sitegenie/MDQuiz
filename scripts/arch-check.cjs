#!/usr/bin/env node

/**
 * Architecture validation helper script
 * Runs both ESLint boundaries and dependency-cruiser checks
 */

const { execSync } = require('child_process');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔍 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: path.resolve(__dirname, '..') 
    });
    console.log(`✅ ${description} passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

function main() {
  console.log('🏗️  Running Architecture Validation Checks\n');
  
  let allPassed = true;
  
  // Run ESLint boundaries check
  allPassed &= runCommand(
    'npm run lint', 
    'ESLint boundaries validation'
  );
  
  // Run dependency-cruiser architecture check
  allPassed &= runCommand(
    'npm run arch:check', 
    'Dependency-cruiser architecture validation'
  );
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All architecture checks passed!');
    process.exit(0);
  } else {
    console.log('💥 Architecture validation failed!');
    console.log('Please fix the violations before proceeding.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, main };