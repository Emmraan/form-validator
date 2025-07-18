import validatePassword from '../validators/passwordValidator';

describe('Password Validator with Firstname/Lastname Integration', () => {
  describe('Basic Password Requirements', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'ValidPass123!',
        'SecurePassword1@',
        'MyStrongPass9#',
        'ComplexPass2024$'
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password, 'John', 'Doe');
        expect(result).toBeNull();
      });
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1!', 'John', 'Doe');
      expect(result).toBe('Password must be 10-20 characters.');
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'VeryLongPassword123!' + 'ExtraChars';
      const result = validatePassword(longPassword, 'John', 'Doe');
      expect(result).toBe('Password must be 10-20 characters.');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('lowercase123!', 'John', 'Doe');
      expect(result).toBe('Password must contain at least one uppercase.');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('UPPERCASE123!', 'John', 'Doe');
      expect(result).toBe('Password must contain at least one lowercase.');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('NoSpecial123', 'John', 'Doe');
      expect(result).toBe('Password must contain at least one special character.');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbers!@#', 'John', 'Doe');
      expect(result).toBe('Password must contain at least one number.');
    });
  });

  describe('Name Integration Tests', () => {
    it('should reject passwords containing firstname (case insensitive)', () => {
      const testCases = [
        { password: 'MyJohnPassword1!', firstname: 'John', lastname: 'Doe' },
        { password: 'johnIsGreat123!', firstname: 'John', lastname: 'Doe' },
        { password: 'JOHN_Password1!', firstname: 'John', lastname: 'Doe' },
        { password: 'Password_john1!', firstname: 'John', lastname: 'Doe' },
        { password: 'AliceInWonderland1!', firstname: 'Alice', lastname: 'Smith' },
        { password: 'MichaelJordan23!', firstname: 'Michael', lastname: 'Johnson' }
      ];

      testCases.forEach(({ password, firstname, lastname }) => {
        const result = validatePassword(password, firstname, lastname);
        expect(result).toBe('Password must not contain your first or last name.');
      });
    });

    it('should reject passwords containing lastname (case insensitive)', () => {
      const testCases = [
        // Only test names longer than 3 characters as per the validator logic
        { password: 'SmithAndWesson1!', firstname: 'Alice', lastname: 'Smith' },
        { password: 'JohnsonFamily23!', firstname: 'Michael', lastname: 'Johnson' },
        { password: 'WilliamsPass123!', firstname: 'Sarah', lastname: 'Williams' },
        { password: 'MyAndersonPass1!', firstname: 'Tom', lastname: 'Anderson' }
      ];

      testCases.forEach(({ password, firstname, lastname }) => {
        const result = validatePassword(password, firstname, lastname);
        expect(result).toBe('Password must not contain your first or last name.');
      });
    });

    it('should allow passwords with short names (3 characters or less)', () => {
      const testCases = [
        { password: 'MyLiPassword1!', firstname: 'Li', lastname: 'Wu' },
        { password: 'AnnIsGreat123!', firstname: 'Ann', lastname: 'Lee' },
        { password: 'JoeSmithPass1!', firstname: 'Joe', lastname: 'Kim' }
      ];

      testCases.forEach(({ password, firstname, lastname }) => {
        const result = validatePassword(password, firstname, lastname);
        expect(result).toBeNull();
      });
    });

    it('should handle names with special characters correctly', () => {
      const testCases = [
        { password: 'ValidPassword1!', firstname: "O'Connor", lastname: 'Smith' },
        { password: 'SecurePass123!', firstname: 'Jean-Luc', lastname: 'Van Der Berg' },
        { password: 'MyPassword456!', firstname: 'Mary Jane', lastname: 'Martinez-Lopez' }
      ];

      testCases.forEach(({ password, firstname, lastname }) => {
        const result = validatePassword(password, firstname, lastname);
        expect(result).toBeNull();
      });
    });

    it('should reject passwords containing parts of hyphenated names', () => {
      // The validator checks the full name as-is, so 'Jean-Luc' won't match 'JeanLuc'
      // Let's test with the actual hyphenated name
      const result = validatePassword('MyJean-LucPassword1!', 'Jean-Luc', 'Picard');
      expect(result).toBe('Password must not contain your first or last name.');
    });

    it('should handle edge cases with whitespace in names', () => {
      const testCases = [
        { password: 'ValidPassword1!', firstname: '  John  ', lastname: '  Doe  ' },
        { password: 'SecurePass123!', firstname: 'Mary Jane', lastname: 'Smith Wilson' }
      ];

      testCases.forEach(({ password, firstname, lastname }) => {
        const result = validatePassword(password, firstname, lastname);
        expect(result).toBeNull();
      });
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should validate complete password requirements with name checking', () => {
      // Valid password that meets all requirements and doesn't contain names
      const result = validatePassword('SecurePass2024!', 'Alexander', 'Thompson');
      expect(result).toBeNull();
    });

    it('should prioritize length validation over name validation', () => {
      // Short password that contains name - should fail on length first
      const result = validatePassword('John1!', 'John', 'Doe');
      expect(result).toBe('Password must be 10-20 characters.');
    });

    it('should check all requirements in order', () => {
      const testCases = [
        { password: 'short', expected: 'Password must be 10-20 characters.' },
        { password: 'toolongpasswordthatexceedslimit123!', expected: 'Password must be 10-20 characters.' },
        { password: 'nouppercase123!', expected: 'Password must contain at least one uppercase.' },
        { password: 'NOLOWERCASE123!', expected: 'Password must contain at least one lowercase.' },
        { password: 'NoSpecialChars123', expected: 'Password must contain at least one special character.' },
        { password: 'NoNumbers!@#$%', expected: 'Password must contain at least one number.' },
        { password: 'ContainsJohn123!', expected: 'Password must not contain your first or last name.' }
      ];

      testCases.forEach(({ password, expected }) => {
        const result = validatePassword(password, 'John', 'Doe');
        expect(result).toBe(expected);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty names gracefully', () => {
      const result = validatePassword('ValidPassword123!', '', '');
      expect(result).toBeNull();
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(100);
      const result = validatePassword('ValidPassword123!', longName, 'Smith');
      expect(result).toBeNull();
    });

    it('should handle names with numbers (which should not be in valid names)', () => {
      // This tests robustness even if invalid names somehow get through
      const result = validatePassword('ValidPassword123!', 'John123', 'Doe456');
      expect(result).toBeNull();
    });
  });
});
