#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script tests both local and production deployments to ensure
 * the dynamic validation system works correctly in all environments.
 */

const https = require('https');
const http = require('http');
require('dotenv').config();

const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Configuration
const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = process.argv[2] || 'https://your-app.vercel.app';

console.log('🧪 Form Validator Deployment Verification\n');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) => data.status === 'healthy' && data.runtime
  },
  
  {
    name: 'Legacy Validation (Backward Compatibility)',
    path: '/api/validate',
    method: 'POST',
    body: {
      schemaType: 'signup',
      formData: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      }
    },
    expectedStatus: 200,
    validate: (data) => data.success === true && data.data
  },
  
  {
    name: 'Dynamic Validation - Basic',
    path: '/api/validate',
    method: 'POST',
    body: {
      validationType: 'dynamic',
      formData: {
        email: 'user@example.com',
        first_name: 'John',
        phone: '1234567890'
      }
    },
    expectedStatus: 200,
    validate: (data) => data.success === true && data.fieldAnalysis
  },
  
  {
    name: 'Dynamic Validation - Required Fields',
    path: '/api/validate',
    method: 'POST',
    body: {
      validationType: 'dynamic',
      formData: {
        email: '',
        name: 'John'
      },
      fieldRequirements: {
        email: { required: true },
        name: { required: false }
      }
    },
    expectedStatus: 422,
    validate: (data) => data.success === false && data.errors && data.errors.length > 0
  },
  
  {
    name: 'Dynamic Validation - Custom Rules',
    path: '/api/validate',
    method: 'POST',
    body: {
      validationType: 'dynamic',
      formData: {
        username: 'johndoe123',
        bio: 'Software developer'
      },
      customRules: {
        username: {
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$'
        },
        bio: {
          maxLength: 500
        }
      }
    },
    expectedStatus: 200,
    validate: (data) => data.success === true
  },
  
  {
    name: 'Error Handling - Invalid Validation Type',
    path: '/api/validate',
    method: 'POST',
    body: {
      validationType: 'invalid',
      formData: { test: 'value' }
    },
    expectedStatus: 400,
    validate: (data) => data.success === false && data.error
  }
];

// Run tests for a specific environment
async function runTests(baseUrl, environment) {
  console.log(`\n🔍 Testing ${environment} Environment: ${baseUrl}`);
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const url = baseUrl + test.path;
      const options = {
        method: test.method,
        body: test.body
      };
      
      console.log(`\n📋 ${test.name}`);
      console.log(`   ${test.method} ${test.path}`);
      
      const result = await makeRequest(url, options);
      
      // Check status code
      const statusMatch = result.status === test.expectedStatus;
      
      // Check custom validation
      const validationPass = test.validate ? test.validate(result.data) : true;
      
      if (statusMatch && validationPass) {
        console.log(`   ✅ PASS (${result.status})`);
        passed++;
      } else {
        console.log(`   ❌ FAIL (${result.status})`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${result.status}`);
        if (!validationPass) {
          console.log(`   Validation failed for response:`, JSON.stringify(result.data, null, 2));
        }
        failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 ${environment} Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  return { passed, failed, total: passed + failed };
}

// Main execution
async function main() {
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Test local environment (if available)
  try {
    console.log('🏠 Checking local environment...');
    await makeRequest(LOCAL_URL + '/health');
    const localResults = await runTests(LOCAL_URL, 'LOCAL');
    totalPassed += localResults.passed;
    totalFailed += localResults.failed;
  } catch (error) {
    console.log('⚠️  Local environment not available (server not running)');
  }
  
  // Test production environment
  if (PRODUCTION_URL !== 'https://your-app.vercel.app') {
    try {
      const prodResults = await runTests(PRODUCTION_URL, 'PRODUCTION');
      totalPassed += prodResults.passed;
      totalFailed += prodResults.failed;
    } catch (error) {
      console.log(`❌ Production environment error: ${error.message}`);
    }
  } else {
    console.log('\n⚠️  Production URL not provided. Usage:');
    console.log('   node scripts/verify-deployment.js https://form-validator-rho.vercel.app');
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Overall Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Deployment is successful! 🚀');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the deployment.');
    process.exit(1);
  }
}

// Handle command line usage
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest };
