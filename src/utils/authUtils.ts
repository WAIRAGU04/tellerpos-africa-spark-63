
import { BusinessFormData } from "@/components/business-registration/businessRegistrationUtils";
import { UserFormData } from "@/components/user-registration/userRegistrationUtils";

// Save user registration data to localStorage
export const saveUserRegistrationData = (userData: UserFormData, businessData: BusinessFormData) => {
  try {
    // Generate a unique business ID
    const businessId = `TP${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Save user data
    localStorage.setItem('userData', JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: 'Administrator', // Default role for the first user
      agentCode: `AG${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    
    // Save business data
    localStorage.setItem('businessData', JSON.stringify({
      businessId,
      businessName: businessData.businessName,
      email: userData.email, // Use the admin's email initially
      phone: userData.phoneNumber,
      country: businessData.country,
      businessCategory: businessData.businessCategory,
      address: '',
      postalAddress: '',
      logo: '',
      taxPin: '',
      currency: getCurrencyForCountry(businessData.country),
      signature: '',
      businessHours: {
        openingTime: '08:00',
        closingTime: '17:00',
        dailyReportTime: '18:00',
        reportDeliveryMethod: 'email',
        reportRecipient: userData.email,
      },
      documentFooters: {}
    }));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving registration data:', error);
    return { success: false, error };
  }
};

// Get currency code based on country
const getCurrencyForCountry = (country: string): string => {
  const currencyMap: Record<string, string> = {
    'Kenya': 'KES',
    'Nigeria': 'NGN',
    'South Africa': 'ZAR',
    'Ghana': 'GHS',
    'Uganda': 'UGX',
    'Tanzania': 'TZS',
    'Rwanda': 'RWF',
    'Egypt': 'EGP',
    'Ethiopia': 'ETB',
    'Morocco': 'MAD',
    // Default to KES if country not found
    'default': 'KES'
  };
  
  return currencyMap[country] || currencyMap.default;
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('userData') !== null;
};

// Get authenticated user data
export const getAuthUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
};

// Get business data
export const getBusinessData = () => {
  try {
    const businessData = localStorage.getItem('businessData');
    if (businessData) {
      return JSON.parse(businessData);
    }
    return null;
  } catch (error) {
    console.error('Error getting business data:', error);
    return null;
  }
};
