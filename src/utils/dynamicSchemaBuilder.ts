import { z } from 'zod';
import { FieldType, CustomValidationRule, FieldRequirement } from '../schemas';
import { detectFieldType } from './fieldTypeDetector';

/**
 * Creates a Zod schema for a specific field type with default validation rules
 * @param fieldType - The detected or specified field type
 * @param fieldName - The name of the field (for error messages)
 * @returns Zod schema for the field type
 */
export function createFieldSchema(fieldType: FieldType, fieldName: string): z.ZodTypeAny {
  const fieldDisplayName = fieldName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  switch (fieldType) {
    case FieldType.EMAIL:
      return z.string()
        .trim()
        .email(`Please enter a valid email address for ${fieldDisplayName}`);
    
    case FieldType.PASSWORD:
      return z.string()
        .trim()
        .min(1, `${fieldDisplayName} is required`);
    
    case FieldType.FIRST_NAME:
    case FieldType.LAST_NAME:
      return z.string()
        .trim()
        .min(2, `${fieldDisplayName} must be at least 2 characters`)
        .max(50, `${fieldDisplayName} must not exceed 50 characters`)
        .regex(
          /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'.-]+$/,
          `${fieldDisplayName} can only contain letters, spaces, hyphens, apostrophes, and periods`
        );
    
    case FieldType.FULL_NAME:
      return z.string()
        .trim()
        .min(2, `${fieldDisplayName} must be at least 2 characters`)
        .max(100, `${fieldDisplayName} must not exceed 100 characters`)
        .regex(
          /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'.-]+$/,
          `${fieldDisplayName} can only contain letters, spaces, hyphens, apostrophes, and periods`
        );
    
    case FieldType.PHONE:
      return z.string()
        .trim()
        .min(10, `${fieldDisplayName} must be at least 10 digits`)
        .max(15, `${fieldDisplayName} must not exceed 15 digits`)
        .regex(/^[\+]?[1-9][\d]{0,15}$/, `${fieldDisplayName} must be a valid phone number`);
    
    case FieldType.AGE:
      return z.string()
        .trim()
        .regex(/^\d+$/, `${fieldDisplayName} must be a valid number`)
        .refine(val => {
          const age = parseInt(val);
          return age >= 13 && age <= 120;
        }, `${fieldDisplayName} must be between 13 and 120`);
    
    case FieldType.URL:
      return z.string()
        .trim()
        .url(`${fieldDisplayName} must be a valid URL`);
    
    case FieldType.USERNAME:
      return z.string()
        .trim()
        .min(3, `${fieldDisplayName} must be at least 3 characters`)
        .max(30, `${fieldDisplayName} must not exceed 30 characters`)
        .regex(/^[a-zA-Z0-9_]+$/, `${fieldDisplayName} can only contain letters, numbers, and underscores`);
    
    case FieldType.ZIP_CODE:
      return z.string()
        .trim()
        .min(3, `${fieldDisplayName} must be at least 3 characters`)
        .max(10, `${fieldDisplayName} must not exceed 10 characters`)
        .regex(/^[a-zA-Z0-9\s-]+$/, `${fieldDisplayName} must be a valid postal code`);
    
    case FieldType.COUNTRY:
    case FieldType.STATE:
    case FieldType.CITY:
      return z.string()
        .trim()
        .min(2, `${fieldDisplayName} must be at least 2 characters`)
        .max(50, `${fieldDisplayName} must not exceed 50 characters`)
        .regex(/^[a-zA-Z\s'.-]+$/, `${fieldDisplayName} can only contain letters, spaces, hyphens, apostrophes, and periods`);
    
    case FieldType.ADDRESS:
      return z.string()
        .trim()
        .min(5, `${fieldDisplayName} must be at least 5 characters`)
        .max(200, `${fieldDisplayName} must not exceed 200 characters`);
    
    case FieldType.COMPANY:
    case FieldType.TITLE:
      return z.string()
        .trim()
        .min(2, `${fieldDisplayName} must be at least 2 characters`)
        .max(100, `${fieldDisplayName} must not exceed 100 characters`);
    
    case FieldType.DATE:
      return z.string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldDisplayName} must be in YYYY-MM-DD format`);
    
    case FieldType.GENERIC:
    default:
      return z.string()
        .trim()
        .max(500, `${fieldDisplayName} must not exceed 500 characters`);
  }
}

/**
 * Applies custom validation rules to a Zod schema
 * @param schema - The base Zod schema
 * @param customRule - Custom validation rules to apply
 * @param fieldName - The field name for error messages
 * @returns Modified Zod schema with custom rules applied
 */
export function applyCustomRules(
  schema: z.ZodTypeAny,
  customRule: CustomValidationRule,
  fieldName: string
): z.ZodTypeAny {
  // Only apply custom rules if the schema is a ZodString
  if (!(schema instanceof z.ZodString)) {
    console.warn(`Custom rules can only be applied to string fields. Skipping for field: ${fieldName}`);
    return schema;
  }

  let modifiedSchema = schema as z.ZodString;
  const fieldDisplayName = fieldName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (customRule.minLength !== undefined) {
    modifiedSchema = modifiedSchema.min(
      customRule.minLength,
      customRule.message || `${fieldDisplayName} must be at least ${customRule.minLength} characters`
    );
  }

  if (customRule.maxLength !== undefined) {
    modifiedSchema = modifiedSchema.max(
      customRule.maxLength,
      customRule.message || `${fieldDisplayName} must not exceed ${customRule.maxLength} characters`
    );
  }

  if (customRule.pattern) {
    try {
      const regex = new RegExp(customRule.pattern);
      modifiedSchema = modifiedSchema.regex(
        regex,
        customRule.message || `${fieldDisplayName} format is invalid`
      );
    } catch (error) {
      console.warn(`Invalid regex pattern for field ${fieldName}: ${customRule.pattern}`);
    }
  }

  return modifiedSchema;
}

/**
 * Builds a dynamic Zod schema based on form data and requirements
 * @param formData - The form data to validate
 * @param fieldRequirements - Optional field requirements
 * @param customRules - Optional custom validation rules
 * @returns Dynamic Zod schema
 */
export function buildDynamicSchema(
  formData: Record<string, any>,
  fieldRequirements?: Record<string, FieldRequirement>,
  customRules?: Record<string, CustomValidationRule>
): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  for (const [fieldName] of Object.entries(formData)) {
    // Determine field type
    const requirement = fieldRequirements?.[fieldName];
    const fieldType = requirement?.type || detectFieldType(fieldName);
    
    // Create base schema for the field type
    let fieldSchema = createFieldSchema(fieldType, fieldName);
    
    // Apply custom rules if provided
    const customRule = customRules?.[fieldName] || requirement?.customRule;
    if (customRule) {
      fieldSchema = applyCustomRules(fieldSchema, customRule, fieldName);
    }
    
    // Make field optional if not explicitly required
    const isRequired = requirement?.required === true || customRule?.required === true;
    if (!isRequired) {
      schemaFields[fieldName] = fieldSchema.optional();
    } else {
      schemaFields[fieldName] = fieldSchema;
    }
  }
  
  return z.object(schemaFields);
}

/**
 * Validates form data using dynamic schema generation
 * @param formData - The form data to validate
 * @param fieldRequirements - Optional field requirements
 * @param customRules - Optional custom validation rules
 * @returns Validation result with parsed data or errors
 */
export function validateDynamicForm(
  formData: Record<string, any>,
  fieldRequirements?: Record<string, FieldRequirement>,
  customRules?: Record<string, CustomValidationRule>
) {
  const schema = buildDynamicSchema(formData, fieldRequirements, customRules);
  return schema.safeParse(formData);
}
