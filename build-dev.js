#!/usr/bin/env node

/**
 * Build wrapper for Lovable compatibility
 * This script runs the standard vite build
 */

const { execSync } = require('child_process');

try {
  console.log('🔨 Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
