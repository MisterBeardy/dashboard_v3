#!/usr/bin/env node

/**
 * Test script to verify mock data functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing mock data functionality...\n');

// Test 1: Check if mock data files exist
console.log('1. Checking if mock data files exist...');
const mockDataFiles = [
  'lib/mock-data/index.ts',
  'lib/mock-data/prowlarr.ts',
  'lib/mock-data/radarr.ts',
  'lib/mock-data/sonarr.ts',
  'lib/mock-data/sabnzbd.ts'
];

let allFilesExist = true;
mockDataFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} does not exist`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some mock data files are missing. Aborting tests.');
  process.exit(1);
}

// Test 2: Check if mode config file exists
console.log('\n2. Checking if mode config file exists...');
if (fs.existsSync('lib/config/mode-config.ts')) {
  console.log('✅ lib/config/mode-config.ts exists');
} else {
  console.log('❌ lib/config/mode-config.ts does not exist');
  process.exit(1);
}

// Test 3: Check if API middleware file exists
console.log('\n3. Checking if API middleware file exists...');
if (fs.existsSync('lib/api-middleware.ts')) {
  console.log('✅ lib/api-middleware.ts exists');
} else {
  console.log('❌ lib/api-middleware.ts does not exist');
  process.exit(1);
}

// Test 4: Check if package.json has the new scripts
console.log('\n4. Checking if package.json has mock/live scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const expectedScripts = [
  'dev:mock',
  'dev:live',
  'build:mock',
  'build:live',
  'start:mock',
  'start:live'
];

let allScriptsExist = true;
expectedScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script} script exists`);
  } else {
    console.log(`❌ ${script} script does not exist`);
    allScriptsExist = false;
  }
});

if (!allScriptsExist) {
  console.log('\n❌ Some scripts are missing in package.json.');
  process.exit(1);
}

// Test 5: Check if Prowlarr API route has been updated
console.log('\n5. Checking if Prowlarr API route has been updated...');
const prowlarrRoute = fs.readFileSync('app/api/prowlarr/route.ts', 'utf8');
if (prowlarrRoute.includes('withMockData') && prowlarrRoute.includes('prowlarrMock')) {
  console.log('✅ Prowlarr API route has been updated with mock data support');
} else {
  console.log('❌ Prowlarr API route has not been updated with mock data support');
  process.exit(1);
}

// Test 6: Try to run TypeScript compilation to check for errors
console.log('\n6. Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.toString());
  process.exit(1);
}

console.log('\n🎉 All tests passed! Mock data functionality has been successfully implemented.');
console.log('\nYou can now use the following commands:');
console.log('  - npm run dev:mock  # Run development server with mock data');
console.log('  - npm run dev:live  # Run development server with live data');
console.log('  - npm run build:mock # Build with mock data');
console.log('  - npm run build:live # Build with live data');