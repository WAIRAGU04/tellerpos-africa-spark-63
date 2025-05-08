
// Map of countries to their calling codes
export const countryCodes: Record<string, string> = {
  "Kenya": "+254",
  "Nigeria": "+234",
  "South Africa": "+27",
  "Egypt": "+20",
  "Ghana": "+233",
  "Ethiopia": "+251",
  "Tanzania": "+255",
  "Rwanda": "+250",
  "Uganda": "+256",
  "Côte d'Ivoire": "+225",
  "Angola": "+244",
  "Botswana": "+267",
  "Cameroon": "+237",
  "Democratic Republic of Congo": "+243",
  "Malawi": "+265",
  "Mali": "+223",
  "Morocco": "+212",
  "Mozambique": "+258",
  "Namibia": "+264",
  "Senegal": "+221",
  "Zambia": "+260",
  "Zimbabwe": "+263",
  "Other": ""
};

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateUserRegistration = (formData: UserFormData): { isValid: boolean; errorMessage?: string } => {
  if (!formData.firstName.trim()) {
    return { isValid: false, errorMessage: "Please enter your first name" };
  }
  if (!formData.lastName.trim()) {
    return { isValid: false, errorMessage: "Please enter your last name" };
  }
  if (!formData.email.trim()) {
    return { isValid: false, errorMessage: "Please enter your email" };
  }
  if (!validateEmail(formData.email)) {
    return { isValid: false, errorMessage: "Please enter a valid email address" };
  }
  if (!formData.phoneNumber.trim()) {
    return { isValid: false, errorMessage: "Please enter your phone number" };
  }
  if (!formData.password.trim()) {
    return { isValid: false, errorMessage: "Please create a password" };
  }
  if (formData.password.length < 6) {
    return { isValid: false, errorMessage: "Password must be at least 6 characters" };
  }
  if (formData.password !== formData.confirmPassword) {
    return { isValid: false, errorMessage: "Passwords do not match" };
  }
  
  return { isValid: true };
};
