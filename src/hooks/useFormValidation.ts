
import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/services/errorService';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

export const useFormValidation = <T extends Record<string, any>>(
  schema: ZodSchema<T>
) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: keyof T, value: any): boolean => {
    try {
      // Create a partial schema for single field validation
      const fieldSchema = schema.pick({ [field]: true } as any);
      fieldSchema.parse({ [field]: value });
      
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find(e => e.path[0] === field);
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [field as string]: fieldError.message
          }));
        }
      }
      return false;
    }
  }, [schema]);

  const validateForm = useCallback((data: T): ValidationResult => {
    setIsValidating(true);
    
    try {
      schema.parse(data);
      setErrors({});
      setIsValidating(false);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        
        error.errors.forEach(err => {
          const field = err.path[0];
          if (field && typeof field === 'string') {
            fieldErrors[field] = err.message;
          }
        });
        
        setErrors(fieldErrors);
        setIsValidating(false);
        
        const firstError = Object.values(fieldErrors)[0];
        return { 
          isValid: false, 
          errors: fieldErrors, 
          firstError 
        };
      }
      
      setIsValidating(false);
      return { 
        isValid: false, 
        errors: { general: 'Validation failed' },
        firstError: 'Validation failed'
      };
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return errors[field as string];
  }, [errors]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    isValidating,
    hasErrors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    getFieldError,
  };
};

// Utility function for async validation
export const validateAsync = async <T>(
  schema: ZodSchema<T>,
  data: T
): Promise<{ isValid: boolean; data?: T; errors?: Record<string, string> }> => {
  try {
    const validData = await schema.parseAsync(data);
    return { isValid: true, data: validData };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      
      error.errors.forEach(err => {
        const field = err.path[0];
        if (field && typeof field === 'string') {
          fieldErrors[field] = err.message;
        }
      });
      
      return { isValid: false, errors: fieldErrors };
    }
    
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

