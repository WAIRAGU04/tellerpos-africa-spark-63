
import { z } from "zod";

// Password validation schema with strong requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Business ID validation
const businessIdSchema = z
  .string()
  .min(1, "Business ID is required")
  .regex(/^TP-\d{3,}$/, "Business ID must be in format TP-XXX (e.g., TP-001)");

// Phone number validation with country code
const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\+\d{1,4}\s?\d{9,15}$/, "Phone number must include country code (e.g., +254 712345678)");

// Email validation with business rules
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254, "Email address is too long")
  .refine((email) => !email.includes(".."), "Email cannot contain consecutive dots")
  .refine((email) => !email.startsWith("."), "Email cannot start with a dot")
  .refine((email) => !email.endsWith("."), "Email cannot end with a dot");

// Name validation
const nameSchema = z
  .string()
  .min(1, "This field is required")
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .refine((name) => name.trim().length > 0, "Name cannot be just whitespace");

// Sign in form schema
export const signInSchema = z.object({
  businessId: businessIdSchema,
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// User registration schema
export const userRegistrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  businessId: businessIdSchema,
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Business recovery schema
export const businessRecoverySchema = z.object({
  email: emailSchema,
});

// Business registration schema
export const businessRegistrationSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters long")
    .max(100, "Business name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s&.,'-]+$/, "Business name contains invalid characters"),
  businessCategory: z
    .string()
    .min(1, "Please select a business category"),
  country: z
    .string()
    .min(1, "Please select your country"),
});

// Export type definitions
export type SignInFormData = z.infer<typeof signInSchema>;
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type BusinessRecoveryFormData = z.infer<typeof businessRecoverySchema>;
export type BusinessRegistrationFormData = z.infer<typeof businessRegistrationSchema>;

