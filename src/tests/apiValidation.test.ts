import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import validateRoute from '../routes/validate.route';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'GuhHU7Shu#77y7wygdwgv';

// Create test app
const app = express();
app.use(bodyParser.json());
app.use('/api', validateRoute);

describe('End-to-End API Validation Tests', () => {
  describe('Authentication Tests', () => {
    it('should reject request without authentication token', async () => {
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
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication token required.');
    });

    it('should reject request with invalid authentication token', async () => {
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
        .set('Authorization', 'Bearer invalid_token')
        .send(validFormData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid authentication token.');
    });

    it('should allow request with valid authentication token', async () => {
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(validFormData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
          email: 'oconnor@gmail.com',
          password: 'ValidPassword1!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(validFormData)
        .expect(200);

      expect(response.body.success).toBe(true);
    }, 10000);

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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(invalidSchema)
        .expect(400);

      expect(response.body.error).toBe("Invalid schema type. Use 'signup' or switch to dynamic validation.");
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
          firstname: 'A',
          lastname: 'B',
          email: 'invalid-email',
          password: 'ValidPassword123!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(1);

      const errorPaths = response.body.errors.map((error: any) => error.path[0]);
      expect(errorPaths).toContain('firstname');
      expect(errorPaths).toContain('lastname');
      expect(errorPaths).toContain('email');
    });

    it('should return both schema and password validation errors when schema passes', async () => {
      const invalidFormData = {
        schemaType: 'signup',
        formData: {
          firstname: 'John',
          lastname: 'Smith',
          email: 'john@example.com',
          password: 'MyJohnPassword1!'
        }
      };

      const response = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThanOrEqual(1);

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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
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
        .set('Authorization', `Bearer ${AUTH_TOKEN}`)
        .send(invalidFormData)
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });
});
