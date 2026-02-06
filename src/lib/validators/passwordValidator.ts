/**
 * Password Strength Validator
 * Comprehensive password validation with strength scoring
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  suggestions: string[];
}

// Password requirements configuration
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxRepeatedChars: 3,
  disallowCommonPatterns: true,
};

// Common weak passwords to block
const COMMON_WEAK_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'password1', '123456789', '111111', '123123',
  'admin', 'letmein', 'welcome', 'monkey',
  'master', 'dragon', 'baseball', 'football',
  'shadow', 'trustno1', 'superman', 'batman',
];

/**
 * Validate password strength with detailed feedback
 * @param password - The password to validate
 * @returns PasswordValidationResult with validity, score, errors, and suggestions
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      errors: ['Password is required'],
      suggestions: ['Create a password with at least 8 characters'],
    };
  }

  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  } else if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password cannot exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  } else {
    score += 1;
  }

  // Check for uppercase
  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
      suggestions.push('Add uppercase letters (A-Z)');
    } else {
      score += 1;
    }
  }

  // Check for lowercase
  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
      suggestions.push('Add lowercase letters (a-z)');
    } else {
      score += 1;
    }
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers) {
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
      suggestions.push('Add numbers (0-9)');
    } else {
      score += 1;
    }
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
      suggestions.push('Add special characters (!@#$%^&*)');
    } else {
      score += 1;
    }
  }

  // Check for repeated characters
  const repeatedCharRegex = new RegExp(`(.)\\1{${PASSWORD_REQUIREMENTS.maxRepeatedChars},}`);
  if (repeatedCharRegex.test(password)) {
    errors.push('Password cannot contain more than 3 repeated characters');
    suggestions.push('Avoid repeating characters (e.g., "aaa")');
  } else {
    score += 1;
  }

  // Check for common patterns
  if (PASSWORD_REQUIREMENTS.disallowCommonPatterns) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_WEAK_PASSWORDS.some(weak => lowerPassword.includes(weak))) {
      errors.push('Password contains a common pattern that is too weak');
      suggestions.push('Choose a less common password');
    }
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    errors.push('Password contains sequential characters');
    suggestions.push('Avoid sequential character patterns');
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'poiuy', 'lkjhgf'];
  const lowerPassword = password.toLowerCase();
  if (keyboardPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Password contains keyboard patterns');
    suggestions.push('Avoid keyboard row patterns');
  }

  // Calculate additional score points for extra security
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && /[0-9]/.test(password) && /[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1; // Bonus for meeting all character types
  }

  // Normalize score to 0-4 range
  score = Math.min(Math.floor(score / 3), 4);

  return {
    isValid: errors.length === 0,
    score,
    errors,
    suggestions: suggestions.slice(0, 3), // Limit suggestions
  };
}

/**
 * Get password strength label
 * @param score - Password score (0-4)
 * @returns Human-readable strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get password strength color
 * @param score - Password score (0-4)
 * @returns CSS color class
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
      return 'bg-red-500';
    case 1:
      return 'bg-orange-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-green-500';
    case 4:
      return 'bg-emerald-600';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Validate password confirmation
 * @param password - Original password
 * @param confirmPassword - Password to confirm
 * @returns True if passwords match, false otherwise
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Hash password using SHA-256 (for simple use cases)
 * Note: For production, use bcrypt or argon2
 * @param password - Password to hash
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Compare password with hash
 * @param password - Password to compare
 * @param hash - Hash to compare against
 * @returns True if password matches hash
 */
export function comparePasswordHash(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

export default {
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  validatePasswordConfirmation,
  hashPassword,
  comparePasswordHash,
};
