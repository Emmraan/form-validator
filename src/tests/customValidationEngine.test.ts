import { 
  validateAdvancedRule, 
  validateWithCustomRules, 
  mergeValidationRules, 
  validateRequiredFields,
  AdvancedValidationRule 
} from '../utils/customValidationEngine';
import { FieldRequirement, CustomValidationRule } from '../schemas';

describe('Custom Validation Engine', () => {
  describe('validateAdvancedRule', () => {
    const baseContext = {
      fieldName: 'username',
      fieldValue: 'testuser',
      allFormData: { username: 'testuser', email: 'test@example.com' },
      fieldType: 'username'
    };

    it('should validate minLength rule', () => {
      const rule: AdvancedValidationRule = { minLength: 5 };
      
      // Should pass
      expect(validateAdvancedRule(baseContext, rule)).toBeNull();
      
      // Should fail
      const shortContext = { ...baseContext, fieldValue: 'abc' };
      expect(validateAdvancedRule(shortContext, rule)).toBe('Username must be at least 5 characters');
    });

    it('should validate maxLength rule', () => {
      const rule: AdvancedValidationRule = { maxLength: 10 };
      
      // Should pass
      expect(validateAdvancedRule(baseContext, rule)).toBeNull();
      
      // Should fail
      const longContext = { ...baseContext, fieldValue: 'verylongusername' };
      expect(validateAdvancedRule(longContext, rule)).toBe('Username must not exceed 10 characters');
    });

    it('should validate pattern rule', () => {
      const rule: AdvancedValidationRule = { pattern: '^[a-zA-Z0-9_]+$' };
      
      // Should pass
      expect(validateAdvancedRule(baseContext, rule)).toBeNull();
      
      // Should fail
      const invalidContext = { ...baseContext, fieldValue: 'test-user!' };
      expect(validateAdvancedRule(invalidContext, rule)).toBe('Username format is invalid');
    });

    it('should use custom error messages', () => {
      const rule: AdvancedValidationRule = { 
        minLength: 5, 
        message: 'Custom error message' 
      };
      
      const shortContext = { ...baseContext, fieldValue: 'abc' };
      expect(validateAdvancedRule(shortContext, rule)).toBe('Custom error message');
    });

    it('should validate contains rule', () => {
      const rule: AdvancedValidationRule = { contains: 'user' };
      
      // Should pass
      expect(validateAdvancedRule(baseContext, rule)).toBeNull();
      
      // Should fail
      const noContainsContext = { ...baseContext, fieldValue: 'admin123' };
      expect(validateAdvancedRule(noContainsContext, rule)).toBe('Username must contain "user"');
    });

    it('should validate startsWith rule', () => {
      const rule: AdvancedValidationRule = { startsWith: 'test' };
      
      // Should pass
      expect(validateAdvancedRule(baseContext, rule)).toBeNull();
      
      // Should fail
      const noStartsWithContext = { ...baseContext, fieldValue: 'username' };
      expect(validateAdvancedRule(noStartsWithContext, rule)).toBe('Username must start with "test"');
    });

    it('should validate endsWith rule', () => {
      const rule: AdvancedValidationRule = { endsWith: 'user' };
      
      // Should pass
      expect(validateAdvancedRule(baseContext, rule)).toBeNull();
      
      // Should fail
      const noEndsWithContext = { ...baseContext, fieldValue: 'testname' };
      expect(validateAdvancedRule(noEndsWithContext, rule)).toBe('Username must end with "user"');
    });

    it('should validate numeric min/max rules', () => {
      const ageContext = {
        fieldName: 'age',
        fieldValue: '25',
        allFormData: { age: '25' },
        fieldType: 'age'
      };

      const rule: AdvancedValidationRule = { min: 18, max: 65 };
      
      // Should pass
      expect(validateAdvancedRule(ageContext, rule)).toBeNull();
      
      // Should fail - too young
      const youngContext = { ...ageContext, fieldValue: '16' };
      expect(validateAdvancedRule(youngContext, rule)).toBe('Age must be at least 18');
      
      // Should fail - too old
      const oldContext = { ...ageContext, fieldValue: '70' };
      expect(validateAdvancedRule(oldContext, rule)).toBe('Age must not exceed 65');
    });

    it('should validate array rules', () => {
      const tagsContext = {
        fieldName: 'tags',
        fieldValue: ['tag1', 'tag2', 'tag3'],
        allFormData: { tags: ['tag1', 'tag2', 'tag3'] },
        fieldType: 'generic'
      };

      const rule: AdvancedValidationRule = { minItems: 2, maxItems: 5 };
      
      // Should pass
      expect(validateAdvancedRule(tagsContext, rule)).toBeNull();
      
      // Should fail - too few items
      const fewItemsContext = { ...tagsContext, fieldValue: ['tag1'] };
      expect(validateAdvancedRule(fewItemsContext, rule)).toBe('Tags must have at least 2 items');
      
      // Should fail - too many items
      const manyItemsContext = { ...tagsContext, fieldValue: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] };
      expect(validateAdvancedRule(manyItemsContext, rule)).toBe('Tags must not have more than 5 items');
    });

    it('should handle conditional validation', () => {
      const context = {
        fieldName: 'password_confirm',
        fieldValue: 'password123',
        allFormData: { password: 'password123', password_confirm: 'password123' },
        fieldType: 'password'
      };

      const rule: AdvancedValidationRule = { 
        dependsOn: 'password',
        dependsOnValue: 'password123',
        minLength: 8
      };
      
      // Should validate when condition is met
      expect(validateAdvancedRule(context, rule)).toBeNull();
      
      // Should skip validation when condition is not met
      const noConditionContext = {
        ...context,
        allFormData: { password: 'different', password_confirm: 'password123' }
      };
      expect(validateAdvancedRule(noConditionContext, rule)).toBeNull();
    });

    it('should skip validation for non-required empty fields', () => {
      const emptyContext = {
        fieldName: 'optional_field',
        fieldValue: '',
        allFormData: { optional_field: '' },
        fieldType: 'generic'
      };

      const rule: AdvancedValidationRule = { minLength: 5, required: false };
      
      // Should skip validation for empty non-required field
      expect(validateAdvancedRule(emptyContext, rule)).toBeNull();
    });

    it('should validate required empty fields', () => {
      const emptyContext = {
        fieldName: 'required_field',
        fieldValue: '',
        allFormData: { required_field: '' },
        fieldType: 'generic'
      };

      const rule: AdvancedValidationRule = { minLength: 5, required: true };
      
      // Should validate even if empty when required
      expect(validateAdvancedRule(emptyContext, rule)).toBe('Required Field must be at least 5 characters');
    });
  });

  describe('validateWithCustomRules', () => {
    it('should validate multiple fields with custom rules', () => {
      const formData = {
        username: 'ab',
        email: 'invalid-email',
        age: '15'
      };

      const customRules: Record<string, AdvancedValidationRule> = {
        username: { minLength: 3, message: 'Username too short' },
        email: { pattern: '^[^@]+@[^@]+\\.[^@]+$', message: 'Invalid email format' },
        age: { min: 18, message: 'Must be 18 or older' }
      };

      const errors = validateWithCustomRules(formData, customRules);

      expect(errors).toHaveLength(3);
      expect(errors).toContainEqual({ path: ['username'], message: 'Username too short' });
      expect(errors).toContainEqual({ path: ['email'], message: 'Invalid email format' });
      expect(errors).toContainEqual({ path: ['age'], message: 'Must be 18 or older' });
    });

    it('should return no errors for valid data', () => {
      const formData = {
        username: 'validuser',
        email: 'user@example.com'
      };

      const customRules: Record<string, AdvancedValidationRule> = {
        username: { minLength: 3, maxLength: 20 },
        email: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
      };

      const errors = validateWithCustomRules(formData, customRules);
      expect(errors).toHaveLength(0);
    });
  });

  describe('mergeValidationRules', () => {
    it('should merge field requirements and custom rules', () => {
      const fieldRequirements: Record<string, FieldRequirement> = {
        username: { required: true },
        email: { required: false, customRule: { minLength: 5 } }
      };

      const customRules: Record<string, CustomValidationRule> = {
        username: { minLength: 3, pattern: '^[a-zA-Z0-9_]+$' },
        password: { minLength: 8 }
      };

      const merged = mergeValidationRules(fieldRequirements, customRules);

      expect(merged.username).toEqual({
        required: true,
        minLength: 3,
        pattern: '^[a-zA-Z0-9_]+$'
      });

      expect(merged.email).toEqual({
        required: false,
        minLength: 5
      });

      expect(merged.password).toEqual({
        minLength: 8
      });
    });
  });

  describe('validateRequiredFields', () => {
    it('should identify missing required fields', () => {
      const formData = {
        username: 'testuser',
        email: ''
      };

      const fieldRequirements: Record<string, FieldRequirement> = {
        username: { required: true },
        email: { required: true },
        phone: { required: false }
      };

      const errors = validateRequiredFields(formData, fieldRequirements);

      expect(errors).toHaveLength(1);
      expect(errors).toContainEqual({
        path: ['email'],
        message: 'Email is required'
      });
    });

    it('should return no errors when all required fields are present', () => {
      const formData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const fieldRequirements: Record<string, FieldRequirement> = {
        username: { required: true },
        email: { required: true }
      };

      const errors = validateRequiredFields(formData, fieldRequirements);
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined field requirements', () => {
      const formData = { username: 'testuser' };
      const errors = validateRequiredFields(formData);
      expect(errors).toHaveLength(0);
    });
  });
});
