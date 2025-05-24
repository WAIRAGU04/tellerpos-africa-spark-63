
import { z } from 'zod';
import { useState } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useFormValidation = <T extends Record<string, any>>(
  schema: z.ZodObject<any>
) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: Partial<T>): ValidationResult => {
    try {
      schema.parse(data);
      setErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(fieldErrors);
        return { isValid: false, errors: fieldErrors };
      }
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  };

  const validateField = (fieldName: keyof T, value: any): string | null => {
    try {
      // Create a partial schema for single field validation
      const fieldSchema = schema.pick({ [fieldName as string]: true });
      fieldSchema.parse({ [fieldName]: value });
      
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName as string];
        return newErrors;
      });
      
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Invalid value';
        
        setErrors(prev => ({
          ...prev,
          [fieldName as string]: errorMessage
        }));
        
        return errorMessage;
      }
      return 'Validation failed';
    }
  };

  return {
    validate,
    validateField,
    errors,
    clearErrors: () => setErrors({})
  };
};
