import vm from 'vm';
import { CustomValidationRule, FieldRequirement } from '../schemas';
import { detectFieldType } from './fieldTypeDetector';

/**
 * Advanced custom validation rule interface with more options
 */
export interface AdvancedValidationRule extends CustomValidationRule {
  // String validations
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  
  // Numeric validations (for age, phone, etc.)
  min?: number;
  max?: number;
  
  // Array validations (for multi-select fields)
  minItems?: number;
  maxItems?: number;
  
  // Custom function validation (as string to be evaluated)
  customValidator?: string;
  
  // Conditional validation
  dependsOn?: string; // Field name this validation depends on
  dependsOnValue?: any; // Value the dependent field must have
  
  // Error message
  message?: string;
  required?: boolean;
}

/**
 * Validation context for advanced rules
 */
export interface ValidationContext {
  fieldName: string;
  fieldValue: any;
  allFormData: Record<string, any>;
  fieldType: string;
}

/**
 * Validates a single field against advanced custom rules
 * @param context - Validation context
 * @param rule - Advanced validation rule
 * @returns Error message if validation fails, null if passes
 */
export function validateAdvancedRule(
  context: ValidationContext, 
  rule: AdvancedValidationRule
): string | null {
  const { fieldName, fieldValue, allFormData } = context;
  const fieldDisplayName = fieldName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Skip validation if field is empty and not required
  if (!rule.required && (!fieldValue || fieldValue.toString().trim() === '')) {
    return null;
  }
  
  // Check conditional validation
  if (rule.dependsOn && rule.dependsOnValue !== undefined) {
    const dependentValue = allFormData[rule.dependsOn];
    if (dependentValue !== rule.dependsOnValue) {
      return null; // Skip validation if condition not met
    }
  }
  
  const stringValue = fieldValue?.toString() || '';
  
  // String length validations
  if (rule.minLength !== undefined && stringValue.length < rule.minLength) {
    return rule.message || `${fieldDisplayName} must be at least ${rule.minLength} characters`;
  }
  
  if (rule.maxLength !== undefined && stringValue.length > rule.maxLength) {
    return rule.message || `${fieldDisplayName} must not exceed ${rule.maxLength} characters`;
  }
  
  // Pattern validation
  if (rule.pattern) {
    try {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(stringValue)) {
        return rule.message || `${fieldDisplayName} format is invalid`;
      }
    } catch (error) {
      console.warn(`Invalid regex pattern for field ${fieldName}: ${rule.pattern}`);
    }
  }
  
  // String content validations
  if (rule.contains && !stringValue.toLowerCase().includes(rule.contains.toLowerCase())) {
    return rule.message || `${fieldDisplayName} must contain "${rule.contains}"`;
  }
  
  if (rule.startsWith && !stringValue.toLowerCase().startsWith(rule.startsWith.toLowerCase())) {
    return rule.message || `${fieldDisplayName} must start with "${rule.startsWith}"`;
  }
  
  if (rule.endsWith && !stringValue.toLowerCase().endsWith(rule.endsWith.toLowerCase())) {
    return rule.message || `${fieldDisplayName} must end with "${rule.endsWith}"`;
  }
  
  // Numeric validations
  if (rule.min !== undefined || rule.max !== undefined) {
    const numericValue = parseFloat(stringValue);
    if (isNaN(numericValue)) {
      return rule.message || `${fieldDisplayName} must be a valid number`;
    }
    
    if (rule.min !== undefined && numericValue < rule.min) {
      return rule.message || `${fieldDisplayName} must be at least ${rule.min}`;
    }
    
    if (rule.max !== undefined && numericValue > rule.max) {
      return rule.message || `${fieldDisplayName} must not exceed ${rule.max}`;
    }
  }
  
  // Array validations (for multi-select or comma-separated values)
  if (rule.minItems !== undefined || rule.maxItems !== undefined) {
    let arrayValue: any[];
    
    if (Array.isArray(fieldValue)) {
      arrayValue = fieldValue;
    } else if (typeof fieldValue === 'string') {
      arrayValue = fieldValue.split(',').map(item => item.trim()).filter(item => item);
    } else {
      arrayValue = [fieldValue];
    }
    
    if (rule.minItems !== undefined && arrayValue.length < rule.minItems) {
      return rule.message || `${fieldDisplayName} must have at least ${rule.minItems} items`;
    }
    
    if (rule.maxItems !== undefined && arrayValue.length > rule.maxItems) {
      return rule.message || `${fieldDisplayName} must not have more than ${rule.maxItems} items`;
    }
  }
  
  // Custom validator function (basic eval - use with caution)
  if (rule.customValidator) {
    try {
      // Create a safe evaluation context
      const evalContext = {
        value: fieldValue,
        allData: allFormData,
        fieldName: fieldName
      };
      
      // Simple function evaluation (in production, consider using a safer alternative)
      // Secure validation using a sandboxed evaluator
      const validatorFunction = (context: any) => {
        const { value, allData, fieldName } = context;
        try {
          return vm.runInNewContext(rule.customValidator ?? 'false', {
            value,
            allData,
            fieldName,
            // Allow only safe methods
            _: {
              includes: (s: string) => value.includes(s),
              matches: (regex: string) => new RegExp(regex).test(value)
            }
          });
        } catch (e) {
          return false;
        }
      };
      
      const isValid = validatorFunction(evalContext);
      if (!isValid) {
        return rule.message || `${fieldDisplayName} validation failed`;
      }
    } catch (error) {
      console.warn(`Custom validator error for field ${fieldName}:`, error);
      return rule.message || `${fieldDisplayName} validation error`;
    }
  }
  
  return null; // Validation passed
}

/**
 * Validates all form data against custom rules
 * @param formData - Form data to validate
 * @param customRules - Custom validation rules
 * @returns Array of validation errors
 */
export function validateWithCustomRules(
  formData: Record<string, any>,
  customRules: Record<string, AdvancedValidationRule>
): Array<{ path: string[]; message: string }> {
  const errors: Array<{ path: string[]; message: string }> = [];
  
  for (const [fieldName, rule] of Object.entries(customRules)) {
    const fieldValue = formData[fieldName];
    const fieldType = detectFieldType(fieldName);
    
    const context: ValidationContext = {
      fieldName,
      fieldValue,
      allFormData: formData,
      fieldType
    };
    
    const error = validateAdvancedRule(context, rule);
    if (error) {
      errors.push({
        path: [fieldName],
        message: error
      });
    }
  }
  
  return errors;
}

/**
 * Merges field requirements with custom rules for unified processing
 * @param fieldRequirements - Field requirements
 * @param customRules - Custom validation rules
 * @returns Merged advanced validation rules
 */
export function mergeValidationRules(
  fieldRequirements?: Record<string, FieldRequirement>,
  customRules?: Record<string, CustomValidationRule>
): Record<string, AdvancedValidationRule> {
  const merged: Record<string, AdvancedValidationRule> = {};
  
  // Add field requirements
  if (fieldRequirements) {
    for (const [fieldName, requirement] of Object.entries(fieldRequirements)) {
      merged[fieldName] = {
        required: requirement.required,
        ...requirement.customRule
      };
    }
  }
  
  // Add/override with custom rules
  if (customRules) {
    for (const [fieldName, rule] of Object.entries(customRules)) {
      merged[fieldName] = {
        ...merged[fieldName],
        ...rule
      };
    }
  }
  
  return merged;
}

/**
 * Validates required fields are present in form data
 * @param formData - Form data to check
 * @param fieldRequirements - Field requirements
 * @returns Array of missing field errors
 */
export function validateRequiredFields(
  formData: Record<string, any>,
  fieldRequirements?: Record<string, FieldRequirement>
): Array<{ path: string[]; message: string }> {
  const errors: Array<{ path: string[]; message: string }> = [];
  
  if (!fieldRequirements) return errors;
  
  for (const [fieldName, requirement] of Object.entries(fieldRequirements)) {
    if (requirement.required && (!formData[fieldName] || formData[fieldName].toString().trim() === '')) {
      const fieldDisplayName = fieldName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      errors.push({
        path: [fieldName],
        message: `${fieldDisplayName} is required`
      });
    }
  }
  
  return errors;
}
