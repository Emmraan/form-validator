import { FIELD_TYPE_PATTERNS, FieldType } from '../schemas';

/**
 * Detects the field type based on the field name using pattern matching
 * @param fieldName - The name of the field to analyze
 * @returns The detected field type
 */
export function detectFieldType(fieldName: string): FieldType {
  const normalizedFieldName = fieldName.toLowerCase().trim();
  
  // Check each pattern to find a match
  for (const [type, pattern] of Object.entries(FIELD_TYPE_PATTERNS)) {
    if (pattern.test(normalizedFieldName)) {
      return type as FieldType;
    }
  }
  
  // Additional fuzzy matching for common variations (order matters - more specific first)
  if (normalizedFieldName.includes('email')) return FieldType.EMAIL;
  if (normalizedFieldName.includes('password') || normalizedFieldName.includes('pass')) return FieldType.PASSWORD;
  if (normalizedFieldName.includes('phone') || normalizedFieldName.includes('mobile')) return FieldType.PHONE;
  // Check for username patterns before general name patterns
  if (normalizedFieldName.includes('username') || normalizedFieldName === 'user_name' || normalizedFieldName.includes('user_name')) return FieldType.USERNAME;
  if (normalizedFieldName.includes('name') && normalizedFieldName.includes('first')) return FieldType.FIRST_NAME;
  if (normalizedFieldName.includes('name') && normalizedFieldName.includes('last')) return FieldType.LAST_NAME;
  // Only match general name patterns if it's not a username field
  if (normalizedFieldName.includes('name') && !normalizedFieldName.includes('user') && !normalizedFieldName.includes('username')) return FieldType.FULL_NAME;
  if (normalizedFieldName.includes('age')) return FieldType.AGE;
  if (normalizedFieldName.includes('url') || normalizedFieldName.includes('website')) return FieldType.URL;
  if (normalizedFieldName.includes('zip') || normalizedFieldName.includes('postal')) return FieldType.ZIP_CODE;
  if (normalizedFieldName.includes('country')) return FieldType.COUNTRY;
  if (normalizedFieldName.includes('state') || normalizedFieldName.includes('province')) return FieldType.STATE;
  if (normalizedFieldName.includes('city') || normalizedFieldName.includes('town')) return FieldType.CITY;
  if (normalizedFieldName.includes('address') || normalizedFieldName.includes('street')) return FieldType.ADDRESS;
  if (normalizedFieldName.includes('company') || normalizedFieldName.includes('organization')) return FieldType.COMPANY;
  if (normalizedFieldName.includes('title') || normalizedFieldName.includes('position')) return FieldType.TITLE;
  if (normalizedFieldName.includes('date') || normalizedFieldName.includes('birth')) return FieldType.DATE;
  
  // Default to generic if no pattern matches
  return FieldType.GENERIC;
}

/**
 * Analyzes all fields in form data and returns their detected types
 * @param formData - The form data object to analyze
 * @returns Object mapping field names to their detected types
 */
export function analyzeFormFields(formData: Record<string, any>): Record<string, FieldType> {
  const fieldTypes: Record<string, FieldType> = {};
  
  for (const fieldName of Object.keys(formData)) {
    fieldTypes[fieldName] = detectFieldType(fieldName);
  }
  
  return fieldTypes;
}

/**
 * Gets a human-readable description of what a field type validates
 * @param fieldType - The field type to describe
 * @returns Description string
 */
export function getFieldTypeDescription(fieldType: FieldType): string {
  const descriptions: Record<FieldType, string> = {
    [FieldType.EMAIL]: 'Valid email address format',
    [FieldType.PASSWORD]: 'Secure password with complexity requirements',
    [FieldType.FIRST_NAME]: 'First name with proper character validation',
    [FieldType.LAST_NAME]: 'Last name with proper character validation',
    [FieldType.FULL_NAME]: 'Full name with proper character validation',
    [FieldType.PHONE]: 'Valid phone number format',
    [FieldType.AGE]: 'Valid age (numeric value)',
    [FieldType.URL]: 'Valid URL format',
    [FieldType.USERNAME]: 'Username with alphanumeric and underscore characters',
    [FieldType.ZIP_CODE]: 'Valid postal/zip code format',
    [FieldType.COUNTRY]: 'Country name validation',
    [FieldType.STATE]: 'State/province name validation',
    [FieldType.CITY]: 'City name validation',
    [FieldType.ADDRESS]: 'Street address validation',
    [FieldType.COMPANY]: 'Company/organization name validation',
    [FieldType.TITLE]: 'Job title/position validation',
    [FieldType.DATE]: 'Valid date format',
    [FieldType.GENERIC]: 'Basic string validation'
  };
  
  return descriptions[fieldType] || 'Basic validation';
}
