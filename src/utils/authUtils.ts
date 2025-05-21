import { BusinessFormData } from "@/components/business-registration/businessRegistrationUtils";
import { UserFormData } from "@/components/user-registration/userRegistrationUtils";

// Get the next business ID in sequence
const getNextBusinessId = (): string => {
  try {
    // Get all existing business IDs from localStorage
    const existingBusinesses = getAllBusinessIds();
    
    if (existingBusinesses.length === 0) {
      return "TP-001"; // First business
    }
    
    // Find the highest number
    const highestNum = existingBusinesses
      .map(id => {
        const match = id.match(/TP-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, num) => Math.max(max, num), 0);
    
    // Format the next number with leading zeros
    const nextNum = highestNum + 1;
    const paddedNum = String(nextNum).padStart(3, '0');
    
    return `TP-${paddedNum}`;
  } catch (error) {
    console.error('Error generating business ID:', error);
    return `TP-001`; // Fallback
  }
};

// Get all business IDs from localStorage
const getAllBusinessIds = (): string[] => {
  const ids: string[] = [];
  
  try {
    // Check localStorage for all items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('business_')) {
        const businessData = JSON.parse(localStorage.getItem(key) || '{}');
        if (businessData.businessId) {
          ids.push(businessData.businessId);
        }
      }
    }
  } catch (error) {
    console.error('Error getting business IDs:', error);
  }
  
  return ids;
};

// Generate a unique 6-character alphanumeric user ID
const generateUserId = (): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let userId;
  
  do {
    userId = 'U-';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      userId += charset[randomIndex];
    }
  } while (userIdExists(userId)); // Ensure uniqueness
  
  return userId;
};

// Check if user ID already exists
const userIdExists = (userId: string): boolean => {
  try {
    // Check localStorage for this specific user ID
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        if (userData.userId === userId) {
          return true;
        }
      }
    }
  } catch (error) {
    console.error('Error checking user ID:', error);
  }
  
  return false;
};

// Check if email already exists in the system
const emailExists = (email: string): boolean => {
  try {
    return localStorage.getItem(`user_${email}`) !== null;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
};

// Check if phone number already exists in the system
const phoneNumberExists = (phone: string): boolean => {
  try {
    // Iterate through all user records to check for phone number
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        if (userData.phoneNumber === phone) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking phone number existence:', error);
    return false;
  }
};

// Save user registration data to localStorage
export const saveUserRegistrationData = (userData: UserFormData, businessData: BusinessFormData) => {
  try {
    // Check if email already exists
    if (emailExists(userData.email)) {
      return { success: false, error: "Email is already registered" };
    }
    
    // Check if phone number already exists
    if (phoneNumberExists(userData.phoneNumber)) {
      return { success: false, error: "Phone number is already registered" };
    }
    
    const businessId = getNextBusinessId();
    const userId = generateUserId();
    
    // Save user data
    const userObj = {
      userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: 'Administrator', // Default role for the first user
      agentCode: `AG${Math.floor(1000 + Math.random() * 9000)}`,
      businessId, // Link to business
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${userData.email}`, JSON.stringify(userObj));
    
    // Save business data
    const businessObj = {
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
    };
    
    localStorage.setItem(`business_${businessId}`, JSON.stringify(businessObj));
    
    // Set current session
    localStorage.setItem('currentSession', JSON.stringify({
      userId,
      businessId,
      email: userData.email
    }));
    
    return { success: true, userId, businessId };
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

// Authenticate user with credentials
export const authenticateUser = (businessId: string, email: string, password: string) => {
  try {
    // Check for the user in localStorage
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "User not found" };
    }
    
    const user = JSON.parse(userData);
    
    // Verify business ID
    if (user.businessId !== businessId) {
      return { success: false, message: "Invalid business ID" };
    }
    
    // For regular users, check password
    if (user.password) {
      if (user.password !== password) {
        return { success: false, message: "Invalid password" };
      }
    } else {
      // Legacy users (admin) use email as password
      if (email !== password) { 
        return { success: false, message: "Invalid password" };
      }
    }
    
    // Check if user is active
    if (user.status === "inactive") {
      return { success: false, message: "This user account is inactive" };
    }
    
    // Get business data
    const businessData = localStorage.getItem(`business_${businessId}`);
    if (!businessData) {
      return { success: false, message: "Business not found" };
    }
    
    // Clean any existing session data to ensure fresh session
    logoutUser();
    
    // Set current session
    localStorage.setItem('currentSession', JSON.stringify({
      userId: user.userId,
      businessId,
      email
    }));
    
    // Set legacy items for backward compatibility
    localStorage.setItem('userData', userData);
    localStorage.setItem('businessData', businessData);
    
    // Return info about temporary password
    return { 
      success: true,
      isTemporaryPassword: user.isTemporaryPassword || false 
    };
  } catch (error) {
    console.error('Error authenticating:', error);
    return { success: false, message: "Authentication error" };
  }
};

// Change user password
export const changeUserPassword = (email: string, oldPassword: string, newPassword: string) => {
  try {
    // Check for the user in localStorage
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "User not found" };
    }
    
    const user = JSON.parse(userData);
    
    // Verify old password
    if (user.password) {
      if (user.password !== oldPassword) {
        return { success: false, message: "Current password is incorrect" };
      }
    } else {
      // Legacy users (admin) use email as password
      if (email !== oldPassword) { 
        return { success: false, message: "Current password is incorrect" };
      }
    }
    
    // Update password
    user.password = newPassword;
    user.isTemporaryPassword = false;
    
    // Save updated user data
    localStorage.setItem(`user_${email}`, JSON.stringify(user));
    
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: "Error changing password" };
  }
};

// Request business ID recovery
export const requestBusinessIdRecovery = (email: string) => {
  try {
    // Check if user exists
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "Email not registered" };
    }
    
    const user = JSON.parse(userData);
    const businessId = user.businessId;
    
    if (!businessId) {
      return { success: false, message: "No business ID associated with this email" };
    }
    
    // In a real app, send an email with the business ID
    console.log(`Recovery email would be sent to ${email} with business ID: ${businessId}`);
    
    return { 
      success: true, 
      message: "If this email is registered, a recovery link will be sent"
    };
  } catch (error) {
    console.error('Error requesting business ID recovery:', error);
    return { success: false, message: "Recovery request failed" };
  }
};

// Request password reset
export const requestPasswordReset = (businessId: string, email: string) => {
  try {
    // Check if user exists
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "Email not registered" };
    }
    
    const user = JSON.parse(userData);
    
    // Verify business ID
    if (user.businessId !== businessId) {
      return { success: false, message: "Invalid business ID for this email" };
    }
    
    // In a real app, send password reset email
    console.log(`Password reset email would be sent to ${email}`);
    
    return { 
      success: true, 
      message: "If this email is registered, a password reset link will be sent"
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return { success: false, message: "Password reset request failed" };
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('currentSession') !== null;
};

// Get authenticated user data
export const getAuthUser = () => {
  try {
    const session = localStorage.getItem('currentSession');
    if (!session) return null;
    
    const { email } = JSON.parse(session);
    const userData = localStorage.getItem(`user_${email}`);
    
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Fallback to legacy storage
    const legacyUserData = localStorage.getItem('userData');
    if (legacyUserData) {
      return JSON.parse(legacyUserData);
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
    const session = localStorage.getItem('currentSession');
    if (!session) return null;
    
    const { businessId } = JSON.parse(session);
    const businessData = localStorage.getItem(`business_${businessId}`);
    
    if (businessData) {
      return JSON.parse(businessData);
    }
    
    // Fallback to legacy storage
    const legacyBusinessData = localStorage.getItem('businessData');
    if (legacyBusinessData) {
      return JSON.parse(legacyBusinessData);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting business data:', error);
    return null;
  }
};

// Logout the current user
export const logoutUser = () => {
  // Clear all session-related data
  localStorage.removeItem('currentSession');
  localStorage.removeItem('userData');
  localStorage.removeItem('businessData');
  
  // Clear any cached data that might be specific to a user's session
  localStorage.removeItem('cachedInventory');
  localStorage.removeItem('cachedSales');
  localStorage.removeItem('cachedDashboardData');
  localStorage.removeItem('cachedUserSettings');
  localStorage.removeItem('cachedShiftData');
  
  return true;
};
