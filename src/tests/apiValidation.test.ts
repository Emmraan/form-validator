import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import validateRoute from '../routes/validate.route';

// Create test app
const app = express();
app.use(bodyParser.json());
app.use('/api', validateRoute);

describe('End-to-End API Validation Tests', () => {
  describe('Successful Validation Cases', () => {
    it('should successfully validate a complete valid signup form', async () => {
      const validFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@gmail.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(validFormData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@gmail.com',
        password: 'SecurePass123!'
      });
    });

    it('should handle names with special characters', async () => {
      const validFormData = {
        schemaType: 'signup',
        formData: {
          firstname: "O'Connor",
          lastname: 'Martinez-Lopez',
          email: 'oconnor@gmail.com',  // Use gmail.com to avoid domain validation delays
          password: 'ValidPassword1!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(validFormData)
        .expect(200);

      expect(response.body.success).toBe(true);
    }, 10000);  // Increase timeout to 10 seconds

    it('should trim whitespace from all fields', async () => {
      const formDataWithWhitespace = {
        schemaType: 'signup',
        formData: {
          firstname: '  John  ',
          lastname: '  Doe  ',
          email: '  john@example.com  ',
          password: '  SecurePass123!  '
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(formDataWithWhitespace)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstname).toBe('John');
      expect(response.body.data.lastname).toBe('Doe');
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data.password).toBe('SecurePass123!');
    });
  });

  describe('Schema Validation Errors', () => {
    it('should reject invalid schema type', async () => {
      const invalidSchema = {
        schemaType: 'invalid',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidSchema)
        .expect(400);

      expect(response.body.error).toBe('Invalid schema type.');
    });

    it('should return multiple validation errors for invalid firstname', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'A',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['firstname'],
        message: 'First name must be at least 2 characters'
      });
    });

    it('should reject firstname with invalid characters', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John123',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['firstname'],
        message: 'First name can only contain letters, spaces, hyphens, apostrophes, and periods'
      });
    });

    it('should reject lastname that is too long', async () => {
      const longLastname = 'A'.repeat(51);
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: longLastname,
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['lastname'],
        message: 'Last name must not exceed 50 characters'
      });
    });

    it('should reject invalid email format', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'invalid-email',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['email'],
        message: 'Please enter a valid email address'
      });
    });
  });

  describe('Password Validation Integration', () => {
    it('should reject password containing firstname', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'MyJohnPassword1!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['password'],
        message: 'Password must not contain your first or last name.'
      });
    });

    it('should reject password containing lastname', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Smith',
          email: 'john@example.com',
          password: 'MySmithPassword1!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['password'],
        message: 'Password must not contain your first or last name.'
      });
    });

    it('should reject password that is too short', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'Short1!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual({
        path: ['password'],
        message: 'Password must be 10-20 characters.'
      });
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should return all validation errors at once', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'A',  // Too short
          lastname: 'B',   // Too short
          email: 'invalid-email',  // Invalid format
          password: 'ValidPassword123!'  // Valid password to avoid schema validation failure
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(1);

      // Check that we get errors for multiple fields (schema validation errors only)
      const errorPaths = response.body.errors.map((error: any) => error.path[0]);
      expect(errorPaths).toContain('firstname');
      expect(errorPaths).toContain('lastname');
      expect(errorPaths).toContain('email');
      // Password validation won't run because schema validation fails first
    });

    it('should return both schema and password validation errors when schema passes', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Smith',
          email: 'john@example.com',
          password: 'MyJohnPassword1!'  // Contains firstname - will fail password validation
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThanOrEqual(1);

      // Should get password validation error
      const errorPaths = response.body.errors.map((error: any) => error.path[0]);
      expect(errorPaths).toContain('password');
    });
  });

  describe('Missing Fields', () => {
    it('should reject request with missing firstname', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          lastname: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with missing lastname', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });
});
