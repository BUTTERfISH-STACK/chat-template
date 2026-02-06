/**
 * Registration Validation Utility
 * Comprehensive input validation for user registration
 */

import { validatePassword, PasswordValidationResult } from './passwordValidator';
import crypto from 'crypto';

// Email regex - comprehensive but not overly strict
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Phone number regex - supports international formats
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

// Name validation
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

// Validation error codes
export const ValidationErrorCode = {
  // Phone errors
  PHONE_REQUIRED: 'PHONE_REQUIRED',
  PHONE_INVALID: 'PHONE_INVALID',
  PHONE_TOO_SHORT: 'PHONE_TOO_SHORT',
  PHONE_TOO_LONG: 'PHONE_TOO_LONG',
  
  // Email errors
  EMAIL_INVALID: 'EMAIL_INVALID',
  EMAIL_BLOCKED: 'EMAIL_BLOCKED',
  
  // Name errors
  NAME_REQUIRED: 'NAME_REQUIRED',
  NAME_TOO_SHORT: 'NAME_TOO_SHORT',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
  NAME_INVALID_CHARS: 'NAME_INVALID_CHARS',
  
  // Password errors
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  PASSWORD_NO_UPPERCASE: 'PASSWORD_NO_UPPERCASE',
  PASSWORD_NO_LOWERCASE: 'PASSWORD_NO_LOWERCASE',
  PASSWORD_NO_NUMBER: 'PASSWORD_NO_NUMBER',
  PASSWORD_NO_SPECIAL: 'PASSWORD_NO_SPECIAL',
  PASSWORD_WEAK: 'PASSWORD_WEAK',
  
  // General errors
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Blocked email domains (disposable emails)
const BLOCKED_EMAIL_DOMAINS = [
  'tempmail.com',
  'throwaway.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'yopmail.com',
  'sharklasers.com',
  'maildrop.cc',
];

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: {
    phoneNumber: string;
    email?: string;
    name: string;
    password: string;
  };
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: ValidationError;
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phoneNumber: string): FieldValidationResult {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return {
      isValid: false,
      error: {
        field: 'phoneNumber',
        message: 'Phone number is required',
        code: ValidationErrorCode.PHONE_REQUIRED,
      },
    };
  }

  // Remove all non-digit characters except +
  const normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  if (normalized.length < 7) {
    return {
      isValid: false,
      error: {
        field: 'phoneNumber',
        message: 'Phone number is too short (minimum 7 digits)',
        code: ValidationErrorCode.PHONE_TOO_SHORT,
      },
    };
  }

  if (normalized.length > 15) {
    return {
      isValid: false,
      error: {
        field: 'phoneNumber',
        message: 'Phone number is too long (maximum 15 digits)',
        code: ValidationErrorCode.PHONE_TOO_LONG,
      },
    };
  }

  if (!PHONE_REGEX.test(normalized)) {
    return {
      isValid: false,
      error: {
        field: 'phoneNumber',
        message: 'Invalid phone number format',
        code: ValidationErrorCode.PHONE_INVALID,
      },
    };
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): FieldValidationResult {
  if (!email || email.trim() === '') {
    // Email is optional, return valid if empty
    return { isValid: true };
  }

  const normalized = email.toLowerCase().trim();
  
  if (!EMAIL_REGEX.test(normalized)) {
    return {
      isValid: false,
      error: {
        field: 'email',
        message: 'Please enter a valid email address',
        code: ValidationErrorCode.EMAIL_INVALID,
      },
    };
  }

  // Check for blocked domains
  const domain = normalized.split('@')[1];
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: {
        field: 'email',
        message: 'This email provider is not allowed',
        code: ValidationErrorCode.EMAIL_BLOCKED,
      },
    };
  }

  return { isValid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): FieldValidationResult {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: {
        field: 'name',
        message: 'Name is required',
        code: ValidationErrorCode.NAME_REQUIRED,
      },
    };
  }

  const trimmed = name.trim();
  
  if (trimmed.length < NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: {
        field: 'name',
        message: `Name must be at least ${NAME_MIN_LENGTH} characters long`,
        code: ValidationErrorCode.NAME_TOO_SHORT,
      },
    };
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: {
        field: 'name',
        message: `Name cannot exceed ${NAME_MAX_LENGTH} characters`,
        code: ValidationErrorCode.NAME_TOO_LONG,
      },
    };
  }

  if (!NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: {
        field: 'name',
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
        code: ValidationErrorCode.NAME_INVALID_CHARS,
      },
    };
  }

  return { isValid: true };
}

/**
 * Validate password with comprehensive checks
 */
export function validatePasswordField(password: string): FieldValidationResult {
  if (!password || password === '') {
    return {
      isValid: false,
      error: {
        field: 'password',
        message: 'Password is required',
        code: ValidationErrorCode.PASSWORD_REQUIRED,
      },
    };
  }

  const result: PasswordValidationResult = validatePassword(password);

  if (!result.isValid) {
    // Return the first error
    return {
      isValid: false,
      error: {
        field: 'password',
        message: result.errors[0] || 'Password does not meet requirements',
        code: ValidationErrorCode.PASSWORD_WEAK,
      },
    };
  }

  return { isValid: true };
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove JavaScript protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+=/gi, '')
    // Remove potential SQL injection patterns
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Keep only digits and +
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string | undefined {
  if (!email || typeof email !== 'string') {
    return undefined;
  }
  
  const sanitized = email.toLowerCase().trim();
  
  // Basic email validation
  if (!sanitized.includes('@') || !sanitized.includes('.')) {
    return undefined;
  }
  
  return sanitized;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate complete registration data
 */
export function validateRegistrationData(data: {
  phoneNumber: string;
  email?: string;
  name: string;
  password: string;
  confirmPassword?: string;
}): RegistrationValidationResult {
  const errors: ValidationError[] = [];

  // Validate each field
  const phoneResult = validatePhoneNumber(data.phoneNumber);
  if (!phoneResult.isValid && phoneResult.error) {
    errors.push(phoneResult.error);
  }

  const emailResult = validateEmail(data.email || '');
  if (!emailResult.isValid && emailResult.error) {
    errors.push(emailResult.error);
  }

  const nameResult = validateName(data.name);
  if (!nameResult.isValid && nameResult.error) {
    errors.push(nameResult.error);
  }

  const passwordResult = validatePasswordField(data.password);
  if (!passwordResult.isValid && passwordResult.error) {
    errors.push(passwordResult.error);
  }

  // Validate password confirmation if provided
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
      code: 'PASSWORD_MISMATCH',
    });
  }

  // If there are errors, return early
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Return sanitized data
  return {
    isValid: true,
    errors: [],
    sanitizedData: {
      phoneNumber: sanitizePhoneNumber(data.phoneNumber),
      email: sanitizeEmail(data.email || ''),
      name: sanitizeInput(data.name),
      password: data.password, // Don't sanitize password, just validate
    },
  };
}

/**
 * Validate a single field
 */
export function validateField(field: string, value: string): FieldValidationResult {
  switch (field) {
    case 'phoneNumber':
      return validatePhoneNumber(value);
    case 'email':
      return validateEmail(value);
    case 'name':
      return validateName(value);
    case 'password':
      return validatePasswordField(value);
    default:
      return { isValid: true };
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: ValidationError): string {
  const errorMessages: Record<string, string> = {
    [ValidationErrorCode.PHONE_REQUIRED]: 'Please enter your phone number',
    [ValidationErrorCode.PHONE_INVALID]: 'Please enter a valid phone number',
    [ValidationErrorCode.PHONE_TOO_SHORT]: 'Phone number is too short',
    [ValidationErrorCode.PHONE_TOO_LONG]: 'Phone number is too long',
    [ValidationErrorCode.EMAIL_INVALID]: 'Please enter a valid email address',
    [ValidationErrorCode.EMAIL_BLOCKED]: 'This email provider is not supported',
    [ValidationErrorCode.NAME_REQUIRED]: 'Please enter your name',
    [ValidationErrorCode.NAME_TOO_SHORT]: 'Name is too short',
    [ValidationErrorCode.NAME_TOO_LONG]: 'Name is too long',
    [ValidationErrorCode.NAME_INVALID_CHARS]: 'Name contains invalid characters',
    [ValidationErrorCode.PASSWORD_REQUIRED]: 'Please enter a password',
    [ValidationErrorCode.PASSWORD_WEAK]: 'Password does not meet requirements',
    [ValidationErrorCode.FIELD_REQUIRED]: 'This field is required',
  };

  return errorMessages[error.code] || error.message;
}

export default {
  validatePhoneNumber,
  validateEmail,
  validateName,
  validatePasswordField,
  sanitizeInput,
  sanitizePhoneNumber,
  sanitizeEmail,
  generateCSRFToken,
  validateRegistrationData,
  validateField,
  getUserFriendlyError,
  ValidationErrorCode,
};
