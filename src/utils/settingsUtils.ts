
import { BusinessSettings, UserData } from "@/types/dashboard";
import { getAuthUser, getBusinessData } from "./authUtils";

// Default business settings
export const defaultBusinessSettings: BusinessSettings = {
  businessId: "TP12345",
  businessName: "TellerPOS",
  email: "info@tellerpos.com",
  phone: "+2341234567890",
  country: "Nigeria",
  address: "123 Main Street, Lagos",
  postalAddress: "P.O Box 12345",
  logo: "",
  taxPin: "",
  currency: "KES", // Default currency (Kenyan Shilling)
  signature: "", // Authorized signature for documents
  businessHours: {
    openingTime: "08:00",
    closingTime: "18:00",
    dailyReportTime: "20:00",
    reportDeliveryMethod: "email",
    reportRecipient: "info@tellerpos.com",
  },
  documentFooters: {
    receipt: "Thank you for shopping with us!",
    invoice: "Payment terms: 30 days net",
    quotation: "This quotation is valid for 30 days",
    purchaseOrder: "Standard terms and conditions apply",
    deliveryNote: "Please check goods before signing",
  },
};

// Default user data
export const defaultUserData: UserData = {
  firstName: "John",
  lastName: "Doe",
  businessName: "TellerPOS",
  email: "john.doe@example.com",
  phoneNumber: "+2341234567890",
  role: "Administrator",
  agentCode: "AG001",
};

// Load business settings from localStorage or return defaults
export const loadBusinessSettings = (): BusinessSettings => {
  try {
    // Try to get from the business data first (set during registration/login)
    const businessData = getBusinessData();
    
    // Then check for settings specifically
    const storedSettings = localStorage.getItem("tellerpos_business_settings");
    
    // Combine both data sources with precedence to settings
    let mergedData: Partial<BusinessSettings> = {};
    
    if (businessData) {
      mergedData = { ...mergedData, ...businessData };
    }
    
    if (storedSettings) {
      mergedData = { ...mergedData, ...JSON.parse(storedSettings) };
    }
    
    // Apply defaults for any missing fields
    return {
      ...defaultBusinessSettings,
      ...mergedData,
      businessHours: {
        ...defaultBusinessSettings.businessHours,
        ...(mergedData.businessHours || {}),
      },
      documentFooters: {
        ...defaultBusinessSettings.documentFooters,
        ...(mergedData.documentFooters || {})
      },
    };
  } catch (error) {
    console.error("Error loading business settings:", error);
    return defaultBusinessSettings;
  }
};

// Load user data from localStorage or return defaults
export const loadUserData = (): UserData => {
  try {
    // First try to get from auth user data (set during login/registration)
    const authUser = getAuthUser();
    
    // Then check for user data specifically saved in settings
    const storedSettings = localStorage.getItem("tellerpos_user_data");
    
    // Combine both data sources with precedence to settings
    let mergedData: Partial<UserData> = {};
    
    if (authUser) {
      mergedData = { ...mergedData, ...authUser };
    }
    
    if (storedSettings) {
      mergedData = { ...mergedData, ...JSON.parse(storedSettings) };
    }
    
    // Get business name from business data if available
    const businessData = getBusinessData();
    if (businessData?.businessName && !mergedData.businessName) {
      mergedData.businessName = businessData.businessName;
    }
    
    return { ...defaultUserData, ...mergedData };
  } catch (error) {
    console.error("Error loading user data:", error);
    return defaultUserData;
  }
};

// Save business settings to localStorage
export const saveBusinessSettings = (settings: BusinessSettings): void => {
  try {
    localStorage.setItem("tellerpos_business_settings", JSON.stringify(settings));
    
    // Also update the businessName in the businessData for consistency
    const businessData = getBusinessData();
    if (businessData) {
      localStorage.setItem("businessData", JSON.stringify({
        ...businessData,
        businessName: settings.businessName,
        email: settings.email,
        phone: settings.phone,
        country: settings.country,
        currency: settings.currency
      }));
    }
  } catch (error) {
    console.error("Error saving business settings:", error);
  }
};

// Save user data to localStorage
export const saveUserData = (data: UserData): void => {
  try {
    localStorage.setItem("tellerpos_user_data", JSON.stringify(data));
    
    // Also update the user data in the auth user for consistency
    const authUser = getAuthUser();
    if (authUser) {
      localStorage.setItem("userData", JSON.stringify({
        ...authUser,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber
      }));
    }
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

// Get document footer for a specific document type
export const getDocumentFooter = (documentType: keyof BusinessSettings['documentFooters']): string => {
  const settings = loadBusinessSettings();
  return settings.documentFooters[documentType] || "";
};

// Get business logo
export const getBusinessLogo = (): string => {
  const settings = loadBusinessSettings();
  return settings.logo || "";
};

// Get business currency
export const getBusinessCurrency = (): string => {
  const settings = loadBusinessSettings();
  return settings.currency || "KES";
};

// Get business signature
export const getBusinessSignature = (): string => {
  const settings = loadBusinessSettings();
  return settings.signature || "";
};

// Get business contact information formatted for documents
export const getBusinessContactInfo = (): { 
  name: string;
  address: string;
  postalAddress: string;
  phone: string;
  email: string;
  taxPin: string;
  currency: string;
} => {
  const settings = loadBusinessSettings();
  return {
    name: settings.businessName,
    address: settings.address || "",
    postalAddress: settings.postalAddress || "",
    phone: settings.phone,
    email: settings.email,
    taxPin: settings.taxPin || "",
    currency: settings.currency || "KES",
  };
};

// Format money according to business currency
export const formatMoney = (amount: number): string => {
  const settings = loadBusinessSettings();
  const currency = settings.currency || "KES";
  
  let locale;
  switch (currency) {
    case "KES":
      locale = "en-KE";
      break;
    case "USD":
      locale = "en-US";
      break;
    case "GBP":
      locale = "en-GB";
      break;
    case "EUR":
      locale = "de-DE";
      break;
    case "NGN":
      locale = "en-NG";
      break;
    default:
      locale = "en-US";
  }
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};
