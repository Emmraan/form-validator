import { z } from 'zod';

export const signupSchema = z.object({
  firstname: z.string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'.-]+$/, 'First name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  lastname: z.string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'.-]+$/, 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address'),
  password: z.string()
    .trim()
    .min(1, 'Password is required'),
});

export const schemas = {
  signup: signupSchema,
};

// Field type detection patterns
export const FIELD_TYPE_PATTERNS = {
  email: /^(email|e_mail|user_email|contact_email|email_address)$/i,
  password: /^(password|pass|pwd|user_password|confirm_password|password_confirmation)$/i,
  firstName: /^(firstname|first_name|fname|given_name)$/i,
  lastName: /^(lastname|last_name|lname|family_name|surname)$/i,
  username: /^(username|user_name|login|handle)$/i,
  fullName: /^(fullname|full_name|name|display_name)$/i,
  phone: /^(phone|telephone|mobile|cell|phone_number|mobile_number|contact_number)$/i,
  age: /^(age|years_old)$/i,
  url: /^(url|website|homepage|link)$/i,
  zipCode: /^(zip|zipcode|zip_code|postal_code|postcode)$/i,
  country: /^(country|nation)$/i,
  state: /^(state|province|region)$/i,
  city: /^(city|town|locality)$/i,
  address: /^(address|street|street_address|address_line)$/i,
  company: /^(company|organization|org|business)$/i,
  title: /^(title|job_title|position)$/i,
  date: /^(date|birthday|birth_date|created_at|updated_at)$/i,
};

// Field type enum for better type safety
export enum FieldType {
  EMAIL = 'email',
  PASSWORD = 'password',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  FULL_NAME = 'fullName',
  PHONE = 'phone',
  AGE = 'age',
  URL = 'url',
  USERNAME = 'username',
  ZIP_CODE = 'zipCode',
  COUNTRY = 'country',
  STATE = 'state',
  CITY = 'city',
  ADDRESS = 'address',
  COMPANY = 'company',
  TITLE = 'title',
  DATE = 'date',
  GENERIC = 'generic'
}

// Custom validation rule interface
export interface CustomValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  required?: boolean;
}

// Field requirement interface
export interface FieldRequirement {
  required?: boolean;
  type?: FieldType;
  customRule?: CustomValidationRule;
}

// Dynamic validation request interface
export interface DynamicValidationRequest {
  validationType: 'dynamic' | 'schema';
  schemaType?: string;
  formData: Record<string, any>;
  fieldRequirements?: Record<string, FieldRequirement>;
  customRules?: Record<string, CustomValidationRule>;
}
