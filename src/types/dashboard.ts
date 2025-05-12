export interface UserData {
  firstName: string;
  lastName: string;
  businessName: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  agentCode?: string;
  // We could add more user fields here as needed
}

export interface BusinessSettings {
  businessId: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  postalAddress: string;
  logo: string;
  taxPin: string;
  businessFax?: string;
  businessCity?: string;
  businessWebsite?: string;
  currency: string; // Currency code (e.g., KES, USD)
  signature: string; // Base64 encoded signature image
  businessHours: {
    openingTime: string;
    closingTime: string;
    dailyReportTime: string;
    reportDeliveryMethod: string;
    reportRecipient: string;
  };
  documentFooters: {
    receipt?: string;
    invoice?: string;
    quotation?: string;
    purchaseOrder?: string;
    deliveryNote?: string;
  };
}

export interface SettingsFormProps {
  initialData?: Partial<BusinessSettings>;
  onSave: (data: BusinessSettings) => void;
  isSaving?: boolean;
}

export interface OTPVerificationProps {
  email: string;
  onVerify: () => void;
  onCancel: () => void;
  isOpen: boolean;
}
