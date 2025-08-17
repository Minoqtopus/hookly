#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Hookly
 * Tests all major flows and functionality
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')}`, 'cyan');
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  const rootDir = __dirname;
  const backendDir = path.join(rootDir, 'backend');
  const frontendDir = path.join(rootDir, 'frontend');

  log('🚀 Starting Hookly Test Suite', 'bright');
  log('=====================================', 'blue');

  try {
    // Backend Tests
    log('\n📦 Running Backend Tests...', 'yellow');
    log('----------------------------', 'blue');
    
    log('Installing backend dependencies...', 'cyan');
    await runCommand('npm', ['install'], backendDir);
    
    log('Running payment service tests...', 'cyan');
    await runCommand('npm', ['run', 'test:payments'], backendDir);
    
    log('Running generation service tests...', 'cyan');
    await runCommand('npm', ['run', 'test:generation'], backendDir);
    
    log('Running team collaboration tests...', 'cyan');
    await runCommand('npm', ['run', 'test:teams'], backendDir);
    
    log('Running full backend test suite...', 'cyan');
    await runCommand('npm', ['run', 'test:coverage'], backendDir);

    // Frontend Tests
    log('\n🎨 Running Frontend Tests...', 'yellow');
    log('-----------------------------', 'blue');
    
    log('Installing frontend dependencies...', 'cyan');
    await runCommand('npm', ['install'], frontendDir);
    
    log('Running conversion flow tests...', 'cyan');
    await runCommand('npm', ['run', 'test:conversion'], frontendDir);
    
    log('Running full frontend test suite...', 'cyan');
    await runCommand('npm', ['run', 'test:coverage'], frontendDir);

    // Build Tests
    log('\n🔨 Running Build Tests...', 'yellow');
    log('---------------------------', 'blue');
    
    log('Building backend...', 'cyan');
    await runCommand('npm', ['run', 'build'], backendDir);
    
    log('Building frontend...', 'cyan');
    await runCommand('npm', ['run', 'build'], frontendDir);
    
    log('Running frontend linting...', 'cyan');
    await runCommand('npm', ['run', 'lint'], frontendDir);

    // Success
    log('\n✅ All Tests Passed!', 'green');
    log('====================', 'green');
    log('🎉 Hookly is ready for deployment!', 'bright');
    
    // Test Summary
    log('\n📊 Test Summary:', 'bright');
    log('- ✅ Payment & Tier System: Tested', 'green');
    log('- ✅ Generation Flow: Tested', 'green');
    log('- ✅ Team Collaboration: Tested', 'green');
    log('- ✅ Conversion Flows: Tested', 'green');
    log('- ✅ Build Process: Verified', 'green');
    log('- ✅ Code Quality: Verified', 'green');

    log('\n🚀 Ready for Production Deployment!', 'bright');

  } catch (error) {
    log('\n❌ Test Suite Failed!', 'red');
    log('===================', 'red');
    log(`Error: ${error.message}`, 'red');
    
    log('\n🔍 Troubleshooting Tips:', 'yellow');
    log('- Check that Node.js and npm are installed', 'yellow');
    log('- Ensure all environment variables are set', 'yellow');
    log('- Verify database connection for backend tests', 'yellow');
    log('- Run individual test commands to isolate issues', 'yellow');
    
    process.exit(1);
  }
}

// Run test suite
if (require.main === module) {
  runTests();
}

module.exports = { runTests };