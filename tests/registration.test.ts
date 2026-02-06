/**
 * Registration System Test Suite
 * Tests all edge cases including validation, security, and error handling
 */

import { validatePassword, getPasswordStrengthLabel } from '../src/lib/validators/passwordValidator';
import { validatePhoneNumber, validateEmail, validateName, validatePasswordField, validateRegistrationData, ValidationErrorCode } from '../src/lib/validators/registrationValidator';
import { sanitizeString, sanitizeEmail, sanitizePhoneNumber, containsSQLInjection, containsXSS } from '../src/lib/sanitizer';

// ============================================================================
// PASSWORD VALIDATION TESTS
// ============================================================================

describe('Password Validation', () => {
  test('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password is required');
  });

  test('should reject password less than 8 characters', () => {
    const result = validatePassword('Ab1!');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('at least 8 characters'))).toBe(true);
  });

  test('should reject password without uppercase', () => {
    const result = validatePassword('abcdefg1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  test('should reject password without lowercase', () => {
    const result = validatePassword('ABCDEFG1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  test('should reject password without numbers', () => {
    const result = validatePassword('Abcdefg!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  test('should reject password without special characters', () => {
    const result = validatePassword('Abcdefg1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character');
  });

  test('should reject password with repeated characters', () => {
    const result = validatePassword('Aaaa1111!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password cannot contain more than 3 repeated characters');
  });

  test('should reject common weak passwords', () => {
    const weakPasswords = ['password123', 'qwerty123', 'abc123'];
    weakPasswords.forEach(pw => {
      const result = validatePassword(pw);
      expect(result.isValid).toBe(false);
    });
  });

  test('should accept valid strong password', () => {
    const result = validatePassword('SecureP@ss1');
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  test('should reject sequential characters', () => {
    const result = validatePassword('Abc123456!');
    expect(result.isValid).toBe(false);
  });

  test('should provide correct strength labels', () => {
    expect(getPasswordStrengthLabel(0)).toBe('Very Weak');
    expect(getPasswordStrengthLabel(1)).toBe('Weak');
    expect(getPasswordStrengthLabel(2)).toBe('Fair');
    expect(getPasswordStrengthLabel(3)).toBe('Strong');
    expect(getPasswordStrengthLabel(4)).toBe('Very Strong');
  });
});

// ============================================================================
// PHONE NUMBER VALIDATION TESTS
// ============================================================================

describe('Phone Number Validation', () => {
  test('should reject empty phone number', () => {
    const result = validatePhoneNumber('');
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.PHONE_REQUIRED);
  });

  test('should accept valid phone numbers', () => {
    const validPhones = ['+1234567890', '+27123456789', '1234567890', '+44 20 7946 0958'];
    validPhones.forEach(phone => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(true);
    });
  });

  test('should reject phone numbers that are too short', () => {
    const result = validatePhoneNumber('+12345');
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.PHONE_TOO_SHORT);
  });

  test('should reject phone numbers that are too long', () => {
    const longPhone = '+12345678901234567890';
    const result = validatePhoneNumber(longPhone);
    expect(result.isValid).toBe(false);
  });

  test('should reject invalid phone format', () => {
    const result = validatePhoneNumber('abc-def-ghij');
    expect(result.isValid).toBe(false);
  });
});

// ============================================================================
// EMAIL VALIDATION TESTS
// ============================================================================

describe('Email Validation', () => {
  test('should accept valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.isValid).toBe(true);
  });

  test('should accept optional empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid email formats', () => {
    const invalidEmails = ['user@', '@example.com', 'user@example', 'user@.com'];
    invalidEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
    });
  });

  test('should reject blocked email domains', () => {
    const result = validateEmail('user@tempmail.com');
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.EMAIL_BLOCKED);
  });
});

// ============================================================================
// NAME VALIDATION TESTS
// ============================================================================

describe('Name Validation', () => {
  test('should reject empty name', () => {
    const result = validateName('');
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.NAME_REQUIRED);
  });

  test('should accept valid names', () => {
    const validNames = ['John', "O'Connor", 'Jean-Paul', 'Mary Jane'];
    validNames.forEach(name => {
      const result = validateName(name);
      expect(result.isValid).toBe(true);
    });
  });

  test('should reject name with numbers', () => {
    const result = validateName('John123');
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.NAME_INVALID_CHARS);
  });

  test('should reject name that is too short', () => {
    const result = validateName('J');
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.NAME_TOO_SHORT);
  });

  test('should reject name that is too long', () => {
    const longName = 'A'.repeat(51);
    const result = validateName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error?.code).toBe(ValidationErrorCode.NAME_TOO_LONG);
  });
});

// ============================================================================
// REGISTRATION DATA VALIDATION TESTS
// ============================================================================

describe('Registration Data Validation', () => {
  test('should validate complete registration data', () => {
    const result = validateRegistrationData({
      phoneNumber: '+1234567890',
      email: 'user@example.com',
      name: 'John Doe',
      password: 'SecureP@ss1',
      confirmPassword: 'SecureP@ss1',
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData).toBeDefined();
  });

  test('should return errors for invalid registration data', () => {
    const result = validateRegistrationData({
      phoneNumber: 'abc',
      email: 'invalid',
      name: '',
      password: 'weak',
      confirmPassword: 'different',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should reject password mismatch', () => {
    const result = validateRegistrationData({
      phoneNumber: '+1234567890',
      email: '',
      name: 'John',
      password: 'SecureP@ss1',
      confirmPassword: 'DifferentP@ss',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'confirmPassword')).toBe(true);
  });
});

// ============================================================================
// SANITIZATION TESTS
// ============================================================================

describe('Input Sanitization', () => {
  test('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("xss")</script>';
    const result = sanitizeString(malicious);
    expect(result).not.toContain('<script>');
  });

  test('should sanitize SQL injection attempts', () => {
    const malicious = "'; DROP TABLE users; --";
    const result = sanitizeString(malicious);
    expect(result).not.toContain('DROP');
    expect(result).not.toContain('--');
  });

  test('should sanitize email', () => {
    const result = sanitizeEmail('  USER@EXAMPLE.COM  ');
    expect(result).toBe('user@example.com');
  });

  test('should reject invalid email', () => {
    const result = sanitizeEmail('invalid-email');
    expect(result).toBe('');
  });

  test('should sanitize phone number', () => {
    const result = sanitizePhoneNumber('+1 (234) 567-8900');
    expect(result).toBe('+12345678900');
  });

  test('should detect SQL injection patterns', () => {
    const malicious = "'; DELETE FROM users WHERE '1'='1";
    expect(containsSQLInjection(malicious)).toBe(true);
  });

  test('should detect XSS patterns', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    expect(containsXSS(malicious)).toBe(true);
  });

  test('should not flag normal input', () => {
    const normal = 'Hello World!';
    expect(containsSQLInjection(normal)).toBe(false);
    expect(containsXSS(normal)).toBe(false);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  test('should handle null/undefined inputs gracefully', () => {
    expect(validatePhoneNumber(null as unknown as string).isValid).toBe(false);
    expect(validateEmail(null as unknown as string).isValid).toBe(true); // Optional
    expect(validateName(undefined as unknown as string).isValid).toBe(false);
  });

  test('should handle extremely long inputs', () => {
    const longString = 'A'.repeat(10000);
    const result = validatePassword(longString + '1!');
    expect(result.isValid).toBe(false); // Too long
  });

  test('should handle special characters in name', () => {
    expect(validateName("O'Brien").isValid).toBe(true);
    expect(validateName("Smith-Jones").isValid).toBe(true);
  });

  test('should handle Unicode characters', () => {
    const result = validatePassword('Pàssw0rd!123');
    expect(result.isValid).toBe(true);
  });

  test('should handle whitespace-only input', () => {
    expect(validateName('   ').isValid).toBe(false);
    expect(validatePhoneNumber('   ').isValid).toBe(false);
  });
});

// ============================================================================
// ERROR RECOVERY
// ============================================================================

describe('Error Recovery', () => {
  test('should clear errors on successful re-validation', () => {
    // This tests the form's ability to clear errors when user fixes input
    const invalidPhone = validatePhoneNumber('abc');
    expect(invalidPhone.isValid).toBe(false);

    const validPhone = validatePhoneNumber('+1234567890');
    expect(validPhone.isValid).toBe(true);
  });

  test('should preserve partial data on validation failure', () => {
    const result = validateRegistrationData({
      phoneNumber: '+1234567890', // Valid
      email: 'invalid-email', // Invalid
      name: 'John Doe', // Valid
      password: 'weak', // Invalid
      confirmPassword: 'weak', // May be valid
    });

    expect(result.isValid).toBe(false);
    // The valid fields should still be present in sanitizedData
    expect(result.sanitizedData?.phoneNumber).toBe('+1234567890');
    expect(result.sanitizedData?.name).toBe('John Doe');
  });
});
