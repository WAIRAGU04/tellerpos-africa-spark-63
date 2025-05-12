
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BusinessSettingsForm from "@/components/settings/BusinessSettingsForm";
import UserProfileForm from "@/components/settings/UserProfileForm";
import { BusinessSettings, UserData } from "@/types/dashboard";
import { toast } from "sonner";
import { 
  loadBusinessSettings, 
  loadUserData, 
  saveBusinessSettings, 
  saveUserData 
} from "@/utils/settingsUtils";

const SettingsPage = () => {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [businessSettings, setBusinessSettings] = useState<Partial<BusinessSettings>>({});
  
  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const userDataFromStorage = loadUserData();
      const businessSettingsFromStorage = loadBusinessSettings();
      
      setUserData(userDataFromStorage);
      setBusinessSettings(businessSettingsFromStorage);
    } catch (error) {
      console.error("Error loading settings data:", error);
      toast.error("Failed to load settings");
    }
  }, []);
  
  const handleSaveUserProfile = (data: UserData) => {
    setIsSavingProfile(true);
    
    try {
      // Save to localStorage
      saveUserData(data);
      
      // Update state
      setUserData(data);
      toast.success("User profile updated successfully!");
    } catch (error) {
      console.error("Error saving user profile:", error);
      toast.error("Failed to save user profile");
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleSaveBusinessSettings = (data: BusinessSettings) => {
    setIsSavingBusiness(true);
    
    try {
      // Save to localStorage
      saveBusinessSettings(data);
      
      // Update state
      setBusinessSettings(data);
      toast.success("Business settings updated successfully!");
    } catch (error) {
      console.error("Error saving business settings:", error);
      toast.error("Failed to save business settings");
    } finally {
      setIsSavingBusiness(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and business settings
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">User Profile</TabsTrigger>
            <TabsTrigger value="business">Business Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <UserProfileForm 
              initialData={userData} 
              onSave={handleSaveUserProfile} 
              isSaving={isSavingProfile} 
            />
          </TabsContent>
          
          <TabsContent value="business" className="space-y-6">
            <BusinessSettingsForm 
              initialData={businessSettings} 
              onSave={handleSaveBusinessSettings} 
              isSaving={isSavingBusiness} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
