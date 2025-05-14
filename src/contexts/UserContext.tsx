
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAuthUser, getBusinessData } from "@/utils/authUtils";

export type UserRole = "Administrator" | "Manager" | "Supervisor" | "Cashier";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  agentCode: string;
  businessId: string;
  password?: string;
  isTemporaryPassword?: boolean;
  createdAt: string;
  status: "active" | "inactive";
}

interface UserContextType {
  users: User[];
  addUser: (user: Omit<User, "userId" | "agentCode" | "isTemporaryPassword" | "password" | "createdAt" | "status">) => Promise<{ success: boolean; message?: string; user?: User }>;
  updateUserStatus: (userId: string, status: "active" | "inactive") => Promise<{ success: boolean; message?: string }>;
  generateTemporaryPassword: () => string;
  generateAgentCode: () => string;
  currentUser?: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load users from localStorage
    loadUsers();
    
    // Set current user
    const authUser = getAuthUser();
    if (authUser) {
      setCurrentUser(authUser as User);
    }
    
    setIsLoading(false);
  }, []);

  const loadUsers = () => {
    try {
      const businessData = getBusinessData();
      if (!businessData) return;

      const businessId = businessData.businessId;
      const allUsers: User[] = [];

      // Check localStorage for users
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          try {
            const userData = JSON.parse(localStorage.getItem(key) || '{}');
            if (userData.businessId === businessId) {
              allUsers.push(userData as User);
            }
          } catch (e) {
            console.error("Error parsing user data", e);
          }
        }
      }

      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users", error);
    }
  };

  // Generate a unique 6-character alphanumeric agent code
  const generateAgentCode = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let agentCode;
    
    do {
      agentCode = 'AG';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        agentCode += charset[randomIndex];
      }
    } while (users.some(user => user.agentCode === agentCode));
    
    return agentCode;
  };

  // Generate a temporary password
  const generateTemporaryPassword = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  };

  // Add new user
  const addUser = async (userData: Omit<User, "userId" | "agentCode" | "isTemporaryPassword" | "password" | "createdAt" | "status">): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      // Check if email already exists
      const emailExists = users.some(user => user.email === userData.email);
      if (emailExists) {
        return { success: false, message: "Email already exists" };
      }

      // Check if phone number already exists
      const phoneExists = users.some(user => user.phoneNumber === userData.phoneNumber);
      if (phoneExists) {
        return { success: false, message: "Phone number already exists" };
      }

      const agentCode = generateAgentCode();
      const temporaryPassword = generateTemporaryPassword();
      const userId = `U-${uuidv4().substring(0, 6).toUpperCase()}`;
      
      const newUser: User = {
        ...userData,
        userId,
        agentCode,
        password: temporaryPassword,
        isTemporaryPassword: true,
        createdAt: new Date().toISOString(),
        status: "active"
      };

      // Save to localStorage
      localStorage.setItem(`user_${newUser.email}`, JSON.stringify(newUser));
      
      // Update state
      setUsers(prev => [...prev, newUser]);
      
      return { 
        success: true, 
        message: "User added successfully", 
        user: newUser 
      };
      
    } catch (error) {
      console.error("Error adding user", error);
      return { success: false, message: "Error adding user" };
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, status: "active" | "inactive"): Promise<{ success: boolean; message?: string }> => {
    try {
      const userIndex = users.findIndex(user => user.userId === userId);
      if (userIndex === -1) {
        return { success: false, message: "User not found" };
      }
      
      // Update user
      const updatedUser = { ...users[userIndex], status };
      
      // Save to localStorage
      localStorage.setItem(`user_${updatedUser.email}`, JSON.stringify(updatedUser));
      
      // Update state
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;
      setUsers(updatedUsers);
      
      return { success: true, message: "User status updated successfully" };
    } catch (error) {
      console.error("Error updating user status", error);
      return { success: false, message: "Error updating user status" };
    }
  };

  return (
    <UserContext.Provider value={{ 
      users, 
      addUser, 
      updateUserStatus, 
      generateTemporaryPassword, 
      generateAgentCode, 
      currentUser,
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserManagement = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserManagement must be used within a UserProvider");
  }
  return context;
};
