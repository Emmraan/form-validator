import { detectFieldType, analyzeFormFields, getFieldTypeDescription } from '../utils/fieldTypeDetector';
import { FieldType } from '../schemas';

describe('Field Type Detector', () => {
  describe('detectFieldType', () => {
    it('should detect email fields correctly', () => {
      expect(detectFieldType('email')).toBe(FieldType.EMAIL);
      expect(detectFieldType('user_email')).toBe(FieldType.EMAIL);
      expect(detectFieldType('contact_email')).toBe(FieldType.EMAIL);
      expect(detectFieldType('email_address')).toBe(FieldType.EMAIL);
      expect(detectFieldType('work_email')).toBe(FieldType.EMAIL);
    });

    it('should detect password fields correctly', () => {
      expect(detectFieldType('password')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('pass')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('pwd')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('user_password')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('confirm_password')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('password_confirmation')).toBe(FieldType.PASSWORD);
    });

    it('should detect name fields correctly', () => {
      expect(detectFieldType('firstname')).toBe(FieldType.FIRST_NAME);
      expect(detectFieldType('first_name')).toBe(FieldType.FIRST_NAME);
      expect(detectFieldType('fname')).toBe(FieldType.FIRST_NAME);
      expect(detectFieldType('given_name')).toBe(FieldType.FIRST_NAME);

      expect(detectFieldType('lastname')).toBe(FieldType.LAST_NAME);
      expect(detectFieldType('last_name')).toBe(FieldType.LAST_NAME);
      expect(detectFieldType('lname')).toBe(FieldType.LAST_NAME);
      expect(detectFieldType('family_name')).toBe(FieldType.LAST_NAME);
      expect(detectFieldType('surname')).toBe(FieldType.LAST_NAME);

      expect(detectFieldType('fullname')).toBe(FieldType.FULL_NAME);
      expect(detectFieldType('full_name')).toBe(FieldType.FULL_NAME);
      expect(detectFieldType('name')).toBe(FieldType.FULL_NAME);
      expect(detectFieldType('display_name')).toBe(FieldType.FULL_NAME);
    });

    it('should detect phone fields correctly', () => {
      expect(detectFieldType('phone')).toBe(FieldType.PHONE);
      expect(detectFieldType('telephone')).toBe(FieldType.PHONE);
      expect(detectFieldType('mobile')).toBe(FieldType.PHONE);
      expect(detectFieldType('cell')).toBe(FieldType.PHONE);
      expect(detectFieldType('phone_number')).toBe(FieldType.PHONE);
      expect(detectFieldType('mobile_number')).toBe(FieldType.PHONE);
      expect(detectFieldType('contact_number')).toBe(FieldType.PHONE);
    });

    it('should detect other field types correctly', () => {
      expect(detectFieldType('age')).toBe(FieldType.AGE);
      expect(detectFieldType('years_old')).toBe(FieldType.AGE);

      expect(detectFieldType('url')).toBe(FieldType.URL);
      expect(detectFieldType('website')).toBe(FieldType.URL);
      expect(detectFieldType('homepage')).toBe(FieldType.URL);
      expect(detectFieldType('link')).toBe(FieldType.URL);

      expect(detectFieldType('username')).toBe(FieldType.USERNAME);
      expect(detectFieldType('user_name')).toBe(FieldType.USERNAME);
      expect(detectFieldType('login')).toBe(FieldType.USERNAME);
      expect(detectFieldType('handle')).toBe(FieldType.USERNAME);

      expect(detectFieldType('zip')).toBe(FieldType.ZIP_CODE);
      expect(detectFieldType('zipcode')).toBe(FieldType.ZIP_CODE);
      expect(detectFieldType('zip_code')).toBe(FieldType.ZIP_CODE);
      expect(detectFieldType('postal_code')).toBe(FieldType.ZIP_CODE);
      expect(detectFieldType('postcode')).toBe(FieldType.ZIP_CODE);
    });

    it('should handle case insensitive matching', () => {
      expect(detectFieldType('EMAIL')).toBe(FieldType.EMAIL);
      expect(detectFieldType('Password')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('FIRST_NAME')).toBe(FieldType.FIRST_NAME);
      expect(detectFieldType('Phone_Number')).toBe(FieldType.PHONE);
    });

    it('should use fuzzy matching for partial matches', () => {
      expect(detectFieldType('user_email_address')).toBe(FieldType.EMAIL);
      expect(detectFieldType('my_password_field')).toBe(FieldType.PASSWORD);
      expect(detectFieldType('customer_phone_number')).toBe(FieldType.PHONE);
      expect(detectFieldType('user_first_name')).toBe(FieldType.FIRST_NAME);
    });

    it('should return GENERIC for unknown field types', () => {
      expect(detectFieldType('unknown_field')).toBe(FieldType.GENERIC);
      expect(detectFieldType('custom_data')).toBe(FieldType.GENERIC);
      expect(detectFieldType('random_input')).toBe(FieldType.GENERIC);
    });
  });

  describe('analyzeFormFields', () => {
    it('should analyze all fields in form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'secret123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        age: '25',
        custom_field: 'some value'
      };

      const analysis = analyzeFormFields(formData);

      expect(analysis).toEqual({
        email: FieldType.EMAIL,
        password: FieldType.PASSWORD,
        first_name: FieldType.FIRST_NAME,
        last_name: FieldType.LAST_NAME,
        phone: FieldType.PHONE,
        age: FieldType.AGE,
        custom_field: FieldType.GENERIC
      });
    });

    it('should handle empty form data', () => {
      const analysis = analyzeFormFields({});
      expect(analysis).toEqual({});
    });
  });

  describe('getFieldTypeDescription', () => {
    it('should return correct descriptions for all field types', () => {
      expect(getFieldTypeDescription(FieldType.EMAIL)).toBe('Valid email address format');
      expect(getFieldTypeDescription(FieldType.PASSWORD)).toBe('Secure password with complexity requirements');
      expect(getFieldTypeDescription(FieldType.FIRST_NAME)).toBe('First name with proper character validation');
      expect(getFieldTypeDescription(FieldType.LAST_NAME)).toBe('Last name with proper character validation');
      expect(getFieldTypeDescription(FieldType.FULL_NAME)).toBe('Full name with proper character validation');
      expect(getFieldTypeDescription(FieldType.PHONE)).toBe('Valid phone number format');
      expect(getFieldTypeDescription(FieldType.AGE)).toBe('Valid age (numeric value)');
      expect(getFieldTypeDescription(FieldType.URL)).toBe('Valid URL format');
      expect(getFieldTypeDescription(FieldType.USERNAME)).toBe('Username with alphanumeric and underscore characters');
      expect(getFieldTypeDescription(FieldType.ZIP_CODE)).toBe('Valid postal/zip code format');
      expect(getFieldTypeDescription(FieldType.COUNTRY)).toBe('Country name validation');
      expect(getFieldTypeDescription(FieldType.STATE)).toBe('State/province name validation');
      expect(getFieldTypeDescription(FieldType.CITY)).toBe('City name validation');
      expect(getFieldTypeDescription(FieldType.ADDRESS)).toBe('Street address validation');
      expect(getFieldTypeDescription(FieldType.COMPANY)).toBe('Company/organization name validation');
      expect(getFieldTypeDescription(FieldType.TITLE)).toBe('Job title/position validation');
      expect(getFieldTypeDescription(FieldType.DATE)).toBe('Valid date format');
      expect(getFieldTypeDescription(FieldType.GENERIC)).toBe('Basic string validation');
    });
  });

  describe('Edge Cases', () => {
    it('should handle fields with special characters', () => {
      expect(detectFieldType('user-email')).toBe(FieldType.EMAIL);
      expect(detectFieldType('first.name')).toBe(FieldType.FIRST_NAME);
      expect(detectFieldType('phone#number')).toBe(FieldType.PHONE);
    });

    it('should handle empty and whitespace field names', () => {
      expect(detectFieldType('')).toBe(FieldType.GENERIC);
      expect(detectFieldType('   ')).toBe(FieldType.GENERIC);
      expect(detectFieldType('\t\n')).toBe(FieldType.GENERIC);
    });

    it('should prioritize exact matches over fuzzy matches', () => {
      // 'email' should match exactly rather than fuzzy matching 'name'
      expect(detectFieldType('email')).toBe(FieldType.EMAIL);
      // 'password' should match exactly rather than fuzzy matching 'pass'
      expect(detectFieldType('password')).toBe(FieldType.PASSWORD);
    });
  });
});
