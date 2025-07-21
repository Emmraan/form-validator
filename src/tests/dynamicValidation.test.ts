import request from 'supertest';
import app from '../index';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'GuhHU7Shu#77y7wygdwgv';

describe('Dynamic Validation System', () => {
  describe('Field Type Detection', () => {
    it('should automatically detect and validate email fields', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          user_email: 'test@example.com',
          contact_email: 'contact@company.com'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.fieldAnalysis.user_email).toBe('email');
      expect(response.body.fieldAnalysis.contact_email).toBe('email');
    });

    it('should detect and validate password fields', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          password: 'ValidPass123!',
          confirm_password: 'ValidPass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.fieldAnalysis.password).toBe('password');
      expect(response.body.fieldAnalysis.confirm_password).toBe('password');
    });

    it('should detect and validate name fields', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'Jane Smith'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.fieldAnalysis.first_name).toBe('firstName');
      expect(response.body.fieldAnalysis.last_name).toBe('lastName');
      expect(response.body.fieldAnalysis.full_name).toBe('fullName');
    });

    it('should detect phone fields', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          phone: '1234567890',
          mobile_number: '+1234567890'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.fieldAnalysis.phone).toBe('phone');
      expect(response.body.fieldAnalysis.mobile_number).toBe('phone');
    });
  });

  describe('Required vs Optional Fields', () => {
    it('should make all fields optional by default', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          optional_field: ''
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should enforce required fields when specified', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          email: '',
          name: 'John'
        },
        fieldRequirements: {
          email: { required: true },
          name: { required: false }
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['email'],
        message: 'Email is required'
      });
    });
  });

  describe('Custom Validation Rules', () => {
    it('should apply custom length rules', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          username: 'ab'
        },
        customRules: {
          username: {
            minLength: 3,
            maxLength: 20,
            message: 'Username must be 3-20 characters'
          }
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['username'],
        message: 'Username must be 3-20 characters'
      });
    });

    it('should apply custom pattern rules', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          username: 'invalid-username!'
        },
        customRules: {
          username: {
            pattern: '^[a-zA-Z0-9_]+$',
            message: 'Username can only contain letters, numbers, and underscores'
          }
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['username'],
        message: 'Username can only contain letters, numbers, and underscores'
      });
    });

    it('should pass validation with valid custom rules', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          username: 'valid_username123'
        },
        customRules: {
          username: {
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9_]+$'
          }
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Mixed Field Types', () => {
    it('should validate a complex form with multiple field types', async () => {
      const formData = {
        validationType: 'dynamic',
        formData: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          age: '25',
          website: 'https://johndoe.com',
          username: 'johndoe123'
        },
        fieldRequirements: {
          first_name: { required: true },
          last_name: { required: true },
          email: { required: true },
          phone: { required: false }
        },
        customRules: {
          username: {
            minLength: 3,
            pattern: '^[a-zA-Z0-9_]+$'
          }
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        age: '25',
        website: 'https://johndoe.com',
        username: 'johndoe123'
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should still work with legacy schemaType format', async () => {
      const formData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });
    });

    it('should work with validationType: schema', async () => {
      const formData = {
        validationType: 'schema',
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(formData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return error for missing formData', async () => {
      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send({ validationType: 'dynamic' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('formData is required');
    });

    it('should return error for invalid validationType', async () => {
      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send({
          validationType: 'invalid',
          formData: { test: 'value' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid validationType. Use 'schema' or 'dynamic'.");
    });
  });
});
