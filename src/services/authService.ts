
import { BusinessFormData } from "@/components/business-registration/businessRegistrationUtils";
import { UserFormData } from "@/components/user-registration/userRegistrationUtils";

// Simple password hashing using Web Crypto API
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate secure token
const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    sessionStorage.setItem('authToken', token);
  },
  
  getToken: (): string | null => {
    return sessionStorage.getItem('authToken');
  },
  
  removeToken: () => {
    sessionStorage.removeItem('authToken');
  },
  
  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;
    
    try {
      const session = sessionStorage.getItem('currentSession');
      return session !== null;
    } catch {
      return false;
    }
  }
};

// Get the next business ID in sequence
const getNextBusinessId = (): string => {
  try {
    const existingBusinesses = getAllBusinessIds();
    
    if (existingBusinesses.length === 0) {
      return "TP-001";
    }
    
    const highestNum = existingBusinesses
      .map(id => {
        const match = id.match(/TP-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, num) => Math.max(max, num), 0);
    
    const nextNum = highestNum + 1;
    const paddedNum = String(nextNum).padStart(3, '0');
    
    return `TP-${paddedNum}`;
  } catch (error) {
    console.error('Error generating business ID:', error);
    return `TP-001`;
  }
};

// Get all business IDs from localStorage
const getAllBusinessIds = (): string[] => {
  const ids: string[] = [];
  
  try {
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
  } while (userIdExists(userId));
  
  return userId;
};

// Check if user ID already exists
const userIdExists = (userId: string): boolean => {
  try {
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
    'default': 'KES'
  };
  
  return currencyMap[country] || currencyMap.default;
};

// Async user registration
export const registerUser = async (userData: UserFormData, businessData: BusinessFormData) => {
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
    const hashedPassword = await hashPassword(userData.password);
    
    // Save user data with hashed password
    const userObj = {
      userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: hashedPassword,
      role: 'Administrator',
      agentCode: `AG${Math.floor(1000 + Math.random() * 9000)}`,
      businessId,
      status: "active",
      isTemporaryPassword: false,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${userData.email}`, JSON.stringify(userObj));
    
    // Save business data
    const businessObj = {
      businessId,
      businessName: businessData.businessName,
      email: userData.email,
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
    
    return { success: true, userId, businessId };
  } catch (error) {
    console.error('Error during registration:', error);
    return { success: false, error: "Registration failed. Please try again." };
  }
};

// Async user authentication
export const authenticateUser = async (businessId: string, email: string, password: string) => {
  try {
    // Simulate network delay for realistic async behavior
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "User not found" };
    }
    
    const user = JSON.parse(userData);
    
    // Verify business ID
    if (user.businessId !== businessId) {
      return { success: false, message: "Invalid business ID" };
    }
    
    // Check password
    const hashedPassword = await hashPassword(password);
    if (user.password) {
      if (user.password !== hashedPassword) {
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
    
    // Clear any existing session
    await logoutUser();
    
    // Generate secure token and create session
    const token = generateSecureToken();
    tokenManager.setToken(token);
    
    const sessionData = {
      userId: user.userId,
      businessId,
      email,
      token,
      createdAt: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
    
    // Set legacy items for backward compatibility
    localStorage.setItem('userData', userData);
    localStorage.setItem('businessData', businessData);
    
    return { 
      success: true,
      isTemporaryPassword: user.isTemporaryPassword || false,
      token
    };
  } catch (error) {
    console.error('Error during authentication:', error);
    return { success: false, message: "Authentication error" };
  }
};

// Async password change
export const changeUserPassword = async (email: string, oldPassword: string, newPassword: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "User not found" };
    }
    
    const user = JSON.parse(userData);
    
    // Verify old password
    const hashedOldPassword = await hashPassword(oldPassword);
    if (user.password) {
      if (user.password !== hashedOldPassword) {
        return { success: false, message: "Current password is incorrect" };
      }
    } else {
      // Legacy users (admin) use email as password
      if (email !== oldPassword) { 
        return { success: false, message: "Current password is incorrect" };
      }
    }
    
    // Update password
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.isTemporaryPassword = false;
    
    localStorage.setItem(`user_${email}`, JSON.stringify(user));
    
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: "Error changing password" };
  }
};

// Request business ID recovery
export const requestBusinessIdRecovery = async (email: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "Email not registered" };
    }
    
    const user = JSON.parse(userData);
    const businessId = user.businessId;
    
    if (!businessId) {
      return { success: false, message: "No business ID associated with this email" };
    }
    
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
export const requestPasswordReset = async (businessId: string, email: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userData = localStorage.getItem(`user_${email}`);
    if (!userData) {
      return { success: false, message: "Email not registered" };
    }
    
    const user = JSON.parse(userData);
    
    if (user.businessId !== businessId) {
      return { success: false, message: "Invalid business ID for this email" };
    }
    
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
  return tokenManager.isTokenValid() && sessionStorage.getItem('currentSession') !== null;
};

// Get authenticated user data
export const getAuthUser = () => {
  try {
    if (!isAuthenticated()) return null;
    
    const session = sessionStorage.getItem('currentSession');
    if (!session) return null;
    
    const { email } = JSON.parse(session);
    const userData = localStorage.getItem(`user_${email}`);
    
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
    if (!isAuthenticated()) return null;
    
    const session = sessionStorage.getItem('currentSession');
    if (!session) return null;
    
    const { businessId } = JSON.parse(session);
    const businessData = localStorage.getItem(`business_${businessId}`);
    
    if (businessData) {
      return JSON.parse(businessData);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting business data:', error);
    return null;
  }
};

// Async logout
export const logoutUser = async () => {
  try {
    // Clear session storage
    tokenManager.removeToken();
    sessionStorage.removeItem('currentSession');
    
    // Clear legacy localStorage items
    localStorage.removeItem('userData');
    localStorage.removeItem('businessData');
    
    // Clear cached data
    localStorage.removeItem('cachedInventory');
    localStorage.removeItem('cachedSales');
    localStorage.removeItem('cachedDashboardData');
    localStorage.removeItem('cachedUserSettings');
    localStorage.removeItem('cachedShiftData');
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: "Logout failed" };
  }
};
