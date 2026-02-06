/**
 * Input Sanitization Utilities
 * Prevents XSS and SQL injection attacks
 */

/**
 * Sanitize a string to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '')
    // Remove JavaScript protocol
    .replace(/javascript:/gi, '')
    // Remove data: URLs
    .replace(/data:/gi, '')
    // Remove vbscript: URLs
    .replace(/vbscript:/gi, '')
    // Remove potential SQL injection patterns
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|Xp_)\b)/gi, '')
    // Remove SQL comments
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove multiple semicolons
    .replace(/;{2,}/g, ';')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize HTML content (for rich text)
 * @param input - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Allow only specific HTML tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'];
  const allowedAttributes = ['href', 'title'];

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = input;

  // Remove all tags except allowed ones
  const elements = tempDiv.querySelectorAll('*');
  elements.forEach((element) => {
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.remove();
    } else {
      // Remove all attributes except allowed ones
      Array.from(element.attributes).forEach((attr) => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        }
      });
    }
  });

  return tempDiv.innerHTML;
}

/**
 * Sanitize phone number
 * @param phone - The phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhoneNumber(phone: unknown): string {
  if (typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except leading +
  const digitsOnly = phone.replace(/\D/g, '');
  // Preserve leading + if the phone number starts with it
  return phone.startsWith('+') ? '+' + digitsOnly : digitsOnly;
}

/**
 * Sanitize email
 * @param email - The email to sanitize
 * @returns Sanitized email or empty string
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    return '';
  }

  const sanitized = email.toLowerCase().trim();
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize name
 * @param name - The name to sanitize
 * @returns Sanitized name
 */
export function sanitizeName(name: unknown): string {
  if (typeof name !== 'string') {
    return '';
  }

  return name
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-Z\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize search query
 * @param query - The search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: unknown): string {
  if (typeof query !== 'string') {
    return '';
  }

  return query
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .replace(/(\b(SELECT|DELETE|UPDATE|DROP|UNION|INSERT)\b)/gi, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/;/g, '')
    .trim();
}

/**
 * Sanitize URL
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string
 */
export function sanitizeURL(url: unknown): string {
  if (typeof url !== 'string') {
    return '';
  }

  const sanitized = url.trim().toLowerCase();
  
  // Check for dangerous protocols
  if (/^(javascript|vbscript|data):/i.test(sanitized)) {
    return '';
  }

  // Only allow http, https, mailto, and relative URLs
  if (!/^(https?:|mailto:|\/|#)/i.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Escape HTML entities
 * @param input - The input string
 * @returns Escaped string
 */
export function escapeHTML(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#47;')
    .replace(/`/g, '&#96;')
    .replace(/=/g, '&#61;');
}

/**
 * Validate and sanitize input for database queries
 * @param input - The input to validate
 * @param type - The expected type
 * @returns Sanitized input
 */
export function sanitizeForDatabase(input: unknown, type: 'string' | 'number' | 'boolean' | 'email' | 'phone' | 'uuid'): unknown {
  switch (type) {
    case 'string':
      return sanitizeString(input);
    case 'number':
      const num = parseFloat(input as string);
      return isNaN(num) ? null : num;
    case 'boolean':
      return Boolean(input);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhoneNumber(input);
    case 'uuid':
      const uuid = input as string;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid) ? uuid : null;
    default:
      return input;
  }
}

/**
 * Check if input contains potential SQL injection
 * @param input - The input to check
 * @returns True if suspicious patterns found
 */
export function containsSQLInjection(input: unknown): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|Xp_)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\'\s*(OR|AND)\s*\')/i,
    /CHAR\s*\(/i,
    /CONCAT\s*\(/i,
    /GROUP_CONCAT/i,
    /BENCHMARK\s*\(/i,
    /SLEEP\s*\(/i,
    /LOAD_FILE\s*\(/i,
    /INTO\s+OUTFILE/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check if input contains potential XSS
 * @param input - The input to check
 * @returns True if suspicious patterns found
 */
export function containsXSS(input: unknown): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /expression\s*\(/gi,
    /data:/gi,
    /alert\s*\(/gi,
    /prompt\s*\(/gi,
    /confirm\s*\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize object
 * @param obj - The object to sanitize
 * @param schema - The schema defining fields and their types
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'email' | 'phone' | 'uuid'>
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      continue;
    }

    const type = schema[key];
    if (!type) {
      continue;
    }

    (sanitized as Record<string, unknown>)[key] = sanitizeForDatabase(value, type);
  }

  return sanitized;
}

export default {
  sanitizeString,
  sanitizeHTML,
  sanitizePhoneNumber,
  sanitizeEmail,
  sanitizeName,
  sanitizeSearchQuery,
  sanitizeURL,
  escapeHTML,
  sanitizeForDatabase,
  containsSQLInjection,
  containsXSS,
  sanitizeObject,
};
