
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
  address?: string;
  postalAddress?: string;
  logo?: string;
  taxPin?: string;
  businessHours: {
    openingTime: string;
    closingTime: string;
    dailyReportTime: string;
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
