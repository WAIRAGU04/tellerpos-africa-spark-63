
import { useState } from 'react';
import { z } from 'zod';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useFormValidation = <T extends Record<string, any>>(
  schema: z.ZodObject<any>
) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (data: T): ValidationResult => {
    try {
      schema.parse(data);
      setErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            validationErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(validationErrors);
        return { isValid: false, errors: validationErrors };
      }
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const validateField = (fieldName: keyof T, value: any): string | null => {
    try {
      // For single field validation, we'll validate the entire form but only return the specific field error
      const partialData = { [fieldName]: value } as Partial<T>;
      schema.partial().parse(partialData);
      
      // Clear error for this field
      clearFieldError(fieldName as string);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => 
          err.path.length > 0 && err.path[0] === fieldName
        );
        
        if (fieldError) {
          const errorMessage = fieldError.message;
          setErrors(prev => ({ ...prev, [fieldName as string]: errorMessage }));
          return errorMessage;
        }
      }
      return 'Validation error';
    }
  };

  return {
    errors,
    validateForm,
    validateField,
    clearErrors,
    clearFieldError,
  };
};
