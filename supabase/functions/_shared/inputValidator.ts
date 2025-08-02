
// Comprehensive Input Validation for Edge Functions
// Provides sanitization and validation for request data

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  sanitize?: boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Common validation schemas
export const COMMON_SCHEMAS = {
  email: {
    type: 'string' as const,
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  uuid: {
    type: 'string' as const,
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  deviceFingerprint: {
    type: 'string' as const,
    maxLength: 1000,
    sanitize: true
  },
  ipAddress: {
    type: 'string' as const,
    maxLength: 45,
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/i
  },
  userAgent: {
    type: 'string' as const,
    maxLength: 1000,
    sanitize: true
  },
  MODEL_STATUS: {
    models: {
      type: 'array' as const,
      required: true
    }
  },
  CHAT_MESSAGE: {
    message: {
      type: 'string' as const,
      required: true,
      maxLength: 10000
    },
    conversationHistory: {
      type: 'array' as const,
      required: false
    }
  }
};

// Standalone schemas for direct use
export const MODEL_STATUS_SCHEMA = {
  models: {
    type: 'array' as const,
    required: true
  }
};

export const CHAT_MESSAGE_SCHEMA = {
  message: {
    type: 'string' as const,
    required: true,
    maxLength: 10000
  },
  conversationHistory: {
    type: 'array' as const,
    required: false
  }
};

/**
 * Sanitizes string input by removing dangerous characters
 */
function sanitizeString(input: string): string {
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Validates a single value against a rule
 */
function validateValue(value: any, rule: ValidationRule, fieldName: string): string[] {
  const errors: string[] = [];
  
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }
  
  // Skip validation if value is not provided and not required
  if (!rule.required && (value === undefined || value === null)) {
    return errors;
  }
  
  // Type validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        break;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldName} must be at most ${rule.maxLength} characters long`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${fieldName} has invalid format`);
      }
      
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        errors.push(`${fieldName} must be one of: ${rule.allowedValues.join(', ')}`);
      }
      break;
      
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${fieldName} must be a valid number`);
        break;
      }
      
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${fieldName} must be at least ${rule.min}`);
      }
      
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${fieldName} must be at most ${rule.max}`);
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${fieldName} must be a boolean`);
      }
      break;
      
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        errors.push(`${fieldName} must be an object`);
      }
      break;
      
    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${fieldName} must be an array`);
      }
      break;
  }
  
  return errors;
}

/**
 * Sanitizes data based on rules
 */
function sanitizeData(data: any, schema: ValidationSchema): any {
  const sanitized: any = {};
  
  for (const [key, rule] of Object.entries(schema)) {
    if (data[key] !== undefined && data[key] !== null) {
      if (rule.type === 'string' && rule.sanitize) {
        sanitized[key] = sanitizeString(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    } else if (!rule.required) {
      // Include undefined/null values for optional fields
      sanitized[key] = data[key];
    }
  }
  
  return sanitized;
}

/**
 * Validates request body against a schema
 */
export async function validateRequestBody(
  request: Request,
  schema: ValidationSchema
): Promise<ValidationResult> {
  try {
    let data: any;
    
    // Parse request body
    try {
      const text = await request.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      return {
        valid: false,
        errors: ['Invalid JSON in request body']
      };
    }
    
    const errors: string[] = [];
    
    // Validate each field
    for (const [fieldName, rule] of Object.entries(schema)) {
      const fieldErrors = validateValue(data[fieldName], rule, fieldName);
      errors.push(...fieldErrors);
    }
    
    // Check for unexpected fields (security measure)
    const allowedFields = Object.keys(schema);
    const providedFields = Object.keys(data);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
    
    if (unexpectedFields.length > 0) {
      errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
    }
    
    if (errors.length > 0) {
      return {
        valid: false,
        errors
      };
    }
    
    // Sanitize data
    const sanitizedData = sanitizeData(data, schema);
    
    return {
      valid: true,
      errors: [],
      sanitizedData
    };
    
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to validate request body']
    };
  }
}

/**
 * Validates query parameters
 */
export function validateQueryParams(
  url: URL,
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = [];
  const data: any = {};
  
  // Extract query parameters
  for (const [key, value] of url.searchParams.entries()) {
    data[key] = value;
  }
  
  // Validate each field
  for (const [fieldName, rule] of Object.entries(schema)) {
    let value = data[fieldName];
    
    // Convert types for query parameters (they're always strings)
    if (value !== undefined && rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${fieldName} must be a valid number`);
        continue;
      }
      value = numValue;
      data[fieldName] = value;
    } else if (value !== undefined && rule.type === 'boolean') {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else {
        errors.push(`${fieldName} must be 'true' or 'false'`);
        continue;
      }
      data[fieldName] = value;
    }
    
    const fieldErrors = validateValue(value, rule, fieldName);
    errors.push(...fieldErrors);
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }
  
  const sanitizedData = sanitizeData(data, schema);
  
  return {
    valid: true,
    errors: [],
    sanitizedData
  };
}

/**
 * Creates a validation error response
 */
export function createValidationErrorResponse(
  errors: string[],
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      error: 'Validation failed',
      details: errors
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
