/**
 * Dynamic Validation Examples
 * 
 * This file demonstrates how to use the new dynamic validation system
 * with various field types and validation rules.
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Example 1: Basic Dynamic Validation
async function basicDynamicValidation() {
  console.log('🚀 Example 1: Basic Dynamic Validation');
  
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      validationType: 'dynamic',
      formData: {
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        age: '25'
      }
    })
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('Field Analysis:', result.fieldAnalysis);
  console.log('---\n');
}

// Example 2: Required Fields
async function requiredFieldsValidation() {
  console.log('📋 Example 2: Required Fields Validation');
  
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      validationType: 'dynamic',
      formData: {
        email: 'user@example.com',
        name: '', // This will fail validation
        phone: '1234567890'
      },
      fieldRequirements: {
        email: { required: true },
        name: { required: true },
        phone: { required: false }
      }
    })
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('---\n');
}

// Example 3: Custom Validation Rules
async function customValidationRules() {
  console.log('⚙️ Example 3: Custom Validation Rules');
  
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      validationType: 'dynamic',
      formData: {
        username: 'johndoe123',
        bio: 'Software developer with 5 years experience',
        skills: 'JavaScript,React,Node.js'
      },
      customRules: {
        username: {
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$',
          message: 'Username must be 3-20 characters with letters, numbers, and underscores only'
        },
        bio: {
          maxLength: 500
        },
        skills: {
          minItems: 1,
          maxItems: 10
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('---\n');
}

// Example 4: Complex Form with Mixed Field Types
async function complexFormValidation() {
  console.log('🏢 Example 4: Complex Form Validation');
  
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      validationType: 'dynamic',
      formData: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        age: '28',
        website: 'https://johndoe.dev',
        username: 'johndoe123',
        company: 'Tech Solutions Inc',
        job_title: 'Senior Developer',
        address: '123 Main St, City, State 12345',
        bio: 'Experienced full-stack developer specializing in modern web technologies'
      },
      fieldRequirements: {
        first_name: { required: true },
        last_name: { required: true },
        email: { required: true },
        phone: { required: false },
        website: { required: false }
      },
      customRules: {
        username: {
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$'
        },
        bio: {
          maxLength: 1000
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('Detected Field Types:', result.fieldAnalysis);
  console.log('---\n');
}

// Example 5: Backward Compatibility - Legacy Schema
async function legacySchemaValidation() {
  console.log('🔄 Example 5: Legacy Schema (Backward Compatibility)');
  
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schemaType: 'signup',
      formData: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      }
    })
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('---\n');
}

// Example 6: Error Handling
async function errorHandlingExample() {
  console.log('❌ Example 6: Error Handling');
  
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      validationType: 'dynamic',
      formData: {
        email: 'invalid-email',
        username: 'ab', // Too short
        age: '15' // Too young
      },
      fieldRequirements: {
        email: { required: true }
      },
      customRules: {
        username: {
          minLength: 3,
          message: 'Username must be at least 3 characters'
        },
        age: {
          min: 18,
          message: 'Must be 18 or older'
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('Errors found:', result.errors?.length || 0);
  console.log('---\n');
}

// Run all examples
async function runAllExamples() {
  console.log('🧪 Dynamic Validation System Examples\n');
  
  try {
    await basicDynamicValidation();
    await requiredFieldsValidation();
    await customValidationRules();
    await complexFormValidation();
    await legacySchemaValidation();
    await errorHandlingExample();
    
    console.log('✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
    console.log('Make sure the API server is running on http://localhost:3000');
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    basicDynamicValidation,
    requiredFieldsValidation,
    customValidationRules,
    complexFormValidation,
    legacySchemaValidation,
    errorHandlingExample,
    runAllExamples
  };
}

// Run examples if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAllExamples();
}
