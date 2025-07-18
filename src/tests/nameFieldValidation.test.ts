import { signupSchema } from '../schemas';

describe('Name Field Validation', () => {
  describe('Firstname Validation', () => {
    it('should accept valid first names', () => {
      const validNames = [
        'John',
        'Mary-Jane',
        "O'Connor",
        'Jean-Luc',
        'Anna Maria',
        'Li',
        'José',
        'François'
      ];

      validNames.forEach(firstname => {
        const result = signupSchema.safeParse({
          firstname,
          lastname: 'Doe',
          email: 'test@example.com',
          password: 'ValidPass123!'
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject first names that are too short', () => {
      const result = signupSchema.safeParse({
        firstname: 'A',
        lastname: 'Doe',
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name must be at least 2 characters');
      }
    });

    it('should reject first names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = signupSchema.safeParse({
        firstname: longName,
        lastname: 'Doe',
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name must not exceed 50 characters');
      }
    });

    it('should reject first names with invalid characters', () => {
      const invalidNames = [
        'John123',
        'Mary@Jane',
        'Test#Name',
        'User$Name',
        'Name%Test',
        'Test&Name',
        'Name*Test',
        'Test+Name',
        'Name=Test',
        'Test|Name',
        'Name\\Test',
        'Test/Name',
        'Name?Test',
        'Test<Name',
        'Name>Test',
        'Name,Test',
        'Test;Name',
        'Name:Test',
        'Test"Name',
        'Name[Test]',
        'Test{Name}',
        'Name(Test)',
        'Test^Name',
        'Name~Test',
        'Test`Name'
      ];

      invalidNames.forEach(firstname => {
        const result = signupSchema.safeParse({
          firstname,
          lastname: 'Doe',
          email: 'test@example.com',
          password: 'ValidPass123!'
        });
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'First name can only contain letters, spaces, hyphens, apostrophes, and periods'
          );
        }
      });
    });

    it('should handle whitespace trimming', () => {
      const result = signupSchema.safeParse({
        firstname: '  John  ',
        lastname: 'Doe',
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstname).toBe('John');
      }
    });
  });

  describe('Lastname Validation', () => {
    it('should accept valid last names', () => {
      const validNames = [
        'Smith',
        'O\'Brien',
        'Van Der Berg',
        'Martinez-Lopez',
        'Li',
        'MacDonald',
        'St. James'
      ];

      validNames.forEach(lastname => {
        const result = signupSchema.safeParse({
          firstname: 'John',
          lastname,
          email: 'test@example.com',
          password: 'ValidPass123!'
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject last names that are too short', () => {
      const result = signupSchema.safeParse({
        firstname: 'John',
        lastname: 'A',
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Last name must be at least 2 characters');
      }
    });

    it('should reject last names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = signupSchema.safeParse({
        firstname: 'John',
        lastname: longName,
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Last name must not exceed 50 characters');
      }
    });

    it('should reject last names with invalid characters', () => {
      const invalidNames = [
        'Smith123',
        'Test@Name',
        'Name#Test',
        'User$Name',
        'Name%Test'
      ];

      invalidNames.forEach(lastname => {
        const result = signupSchema.safeParse({
          firstname: 'John',
          lastname,
          email: 'test@example.com',
          password: 'ValidPass123!'
        });
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Last name can only contain letters, spaces, hyphens, apostrophes, and periods'
          );
        }
      });
    });

    it('should handle whitespace trimming', () => {
      const result = signupSchema.safeParse({
        firstname: 'John',
        lastname: '  Smith  ',
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastname).toBe('Smith');
      }
    });
  });

  describe('Combined Name Validation', () => {
    it('should validate both names together successfully', () => {
      const result = signupSchema.safeParse({
        firstname: 'Jean-Luc',
        lastname: "O'Connor",
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(true);
    });

    it('should fail if both names are invalid', () => {
      const result = signupSchema.safeParse({
        firstname: 'A',
        lastname: 'B',
        email: 'test@example.com',
        password: 'ValidPass123!'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(result.error.issues[0].message).toBe('First name must be at least 2 characters');
        expect(result.error.issues[1].message).toBe('Last name must be at least 2 characters');
      }
    });
  });
});
