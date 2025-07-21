# 🚀 Dynamic Validation System Guide

## Overview

The Form Validator now includes a powerful **Dynamic Validation System** that can automatically validate any form fields without requiring code changes. This system intelligently detects field types, applies appropriate validation rules, and supports custom validation logic.

## Key Features

✅ **Automatic Field Type Detection** - Recognizes common field patterns (email, password, phone, etc.)  
✅ **Optional by Default** - All fields are optional unless explicitly marked as required  
✅ **Custom Validation Rules** - Apply custom patterns, lengths, and logic per field  
✅ **Backward Compatible** - Existing `schemaType: "signup"` continues to work  
✅ **Scalable** - Add new forms without modifying the API  
✅ **Intelligent** - Applies contextual validation based on field names  

## Quick Start

### Basic Dynamic Validation

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "email": "user@example.com",
      "first_name": "John",
      "phone": "1234567890"
    }
  }'
```

### With Field Requirements

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "email": "user@example.com",
      "phone": ""
    },
    "fieldRequirements": {
      "email": { "required": true },
      "phone": { "required": false }
    }
  }'
```

### With Custom Rules

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "validationType": "dynamic",
    "formData": {
      "username": "johndoe123",
      "bio": "Software developer"
    },
    "customRules": {
      "username": {
        "minLength": 3,
        "maxLength": 20,
        "pattern": "^[a-zA-Z0-9_]+$",
        "message": "Username must be 3-20 characters with letters, numbers, and underscores only"
      },
      "bio": {
        "maxLength": 500
      }
    }
  }'
```

## Field Type Detection

The system automatically detects field types based on field names:

| Field Type | Detected Patterns | Validation Applied |
|------------|------------------|-------------------|
| **Email** | `email`, `user_email`, `contact_email` | Email format validation |
| **Password** | `password`, `pass`, `confirm_password` | Complexity requirements |
| **Name** | `first_name`, `last_name`, `full_name` | Character validation, length limits |
| **Phone** | `phone`, `mobile`, `phone_number` | Phone number format |
| **Username** | `username`, `user_name`, `login` | Alphanumeric + underscore |
| **Age** | `age`, `years_old` | Numeric, 13-120 range |
| **URL** | `url`, `website`, `homepage` | URL format validation |
| **Address** | `address`, `street`, `street_address` | Address format |
| **Generic** | Any other field | Basic string validation |

## API Reference

### Request Format

```typescript
{
  "validationType": "dynamic" | "schema",
  "formData": Record<string, any>,
  "fieldRequirements"?: Record<string, FieldRequirement>,
  "customRules"?: Record<string, CustomValidationRule>
}
```

### Field Requirements

```typescript
interface FieldRequirement {
  required?: boolean;           // Whether field is required
  type?: FieldType;            // Override detected field type
  customRule?: CustomValidationRule;
}
```

### Custom Validation Rules

```typescript
interface CustomValidationRule {
  // String validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;            // Regex pattern
  contains?: string;           // Must contain this text
  startsWith?: string;         // Must start with this text
  endsWith?: string;           // Must end with this text
  
  // Numeric validation
  min?: number;                // Minimum numeric value
  max?: number;                // Maximum numeric value
  
  // Array validation
  minItems?: number;           // Minimum array length
  maxItems?: number;           // Maximum array length
  
  // Conditional validation
  dependsOn?: string;          // Field name this depends on
  dependsOnValue?: any;        // Required value of dependent field
  
  // General
  required?: boolean;          // Override required status
  message?: string;            // Custom error message
}
```

### Response Format

```typescript
{
  "success": boolean,
  "data"?: Record<string, any>,        // Validated form data
  "errors"?: Array<{
    "path": string[],
    "message": string
  }>,
  "fieldAnalysis"?: Record<string, FieldType>  // Field type detection results
}
```

## Advanced Examples

### Complex Form with Mixed Field Types

```json
{
  "validationType": "dynamic",
  "formData": {
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "age": "28",
    "website": "https://johndoe.dev",
    "username": "johndoe123",
    "bio": "Full-stack developer with 5 years experience",
    "skills": ["JavaScript", "Python", "React"]
  },
  "fieldRequirements": {
    "first_name": { "required": true },
    "last_name": { "required": true },
    "email": { "required": true },
    "phone": { "required": false },
    "website": { "required": false }
  },
  "customRules": {
    "username": {
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$"
    },
    "bio": {
      "maxLength": 1000
    },
    "skills": {
      "minItems": 1,
      "maxItems": 10
    }
  }
}
```

### Conditional Validation

```json
{
  "validationType": "dynamic",
  "formData": {
    "account_type": "premium",
    "premium_features": "advanced_analytics,priority_support"
  },
  "customRules": {
    "premium_features": {
      "dependsOn": "account_type",
      "dependsOnValue": "premium",
      "required": true,
      "message": "Premium features must be selected for premium accounts"
    }
  }
}
```

## Migration Guide

### From Fixed Schema to Dynamic

**Before (Fixed Schema):**
```json
{
  "schemaType": "signup",
  "formData": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
}
```

**After (Dynamic):**
```json
{
  "validationType": "dynamic",
  "formData": {
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "password": "SecurePass123!"
  },
  "fieldRequirements": {
    "first_name": { "required": true },
    "last_name": { "required": true },
    "email": { "required": true },
    "password": { "required": true }
  }
}
```

## Best Practices

1. **Use Descriptive Field Names** - The system works best with clear field names like `user_email` instead of `field1`

2. **Leverage Auto-Detection** - Let the system detect field types automatically before adding custom rules

3. **Start Simple** - Begin with basic validation and add custom rules as needed

4. **Test Field Analysis** - Use the `fieldAnalysis` in the response to verify field type detection

5. **Combine Approaches** - Use field requirements for simple required/optional logic and custom rules for complex validation

## Backward Compatibility

The existing `schemaType: "signup"` format continues to work unchanged:

```json
{
  "schemaType": "signup",
  "formData": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com", 
    "password": "SecurePass123!"
  }
}
```

You can also use `validationType: "schema"` with `schemaType` for explicit schema-based validation.

## Error Handling

The system provides detailed error messages for validation failures:

```json
{
  "success": false,
  "errors": [
    {
      "path": ["email"],
      "message": "Please enter a valid email address for Email"
    },
    {
      "path": ["username"],
      "message": "Username must be 3-20 characters with letters, numbers, and underscores only"
    }
  ]
}
```

## Performance

- **Field Type Detection**: O(1) pattern matching per field
- **Validation**: Efficient Zod schema compilation and validation
- **Caching**: Redis caching for email domain validation
- **Memory**: Minimal overhead for dynamic schema generation
