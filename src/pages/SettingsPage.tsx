
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BusinessSettingsForm from "@/components/settings/BusinessSettingsForm";
import UserProfileForm from "@/components/settings/UserProfileForm";
import { BusinessSettings, UserData } from "@/types/dashboard";
import { toast } from "sonner";

const SettingsPage = () => {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  
  // Mock initial data - in a real application, this would come from API/localStorage
  const [userData, setUserData] = useState<Partial<UserData>>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    businessName: "TellerPOS",
    phoneNumber: "+123456789",
    role: "Admin",
    agentCode: "AG001"
  });
  
  const [businessSettings, setBusinessSettings] = useState<Partial<BusinessSettings>>({
    businessId: "BP123456",
    businessName: "TellerPOS",
    email: "info@tellerpos.com",
    phone: "+234123456789",
    country: "Nigeria",
    address: "123 Business Street",
    businessHours: {
      openingTime: "08:00",
      closingTime: "18:00",
      dailyReportTime: "20:00",
    },
    documentFooters: {
      receipt: "Thank you for your business!",
      invoice: "Payment terms: Net 30 days",
      quotation: "This quotation is valid for 30 days",
    }
  });
  
  const handleSaveUserProfile = (data: UserData) => {
    setIsSavingProfile(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setUserData(data);
      setIsSavingProfile(false);
      toast.success("User profile updated successfully!");
      
      // In a real app, you would save to API/localStorage here
      localStorage.setItem("tellerpos_user_data", JSON.stringify(data));
      console.log("Saved user profile:", data);
    }, 1000);
  };
  
  const handleSaveBusinessSettings = (data: BusinessSettings) => {
    setIsSavingBusiness(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setBusinessSettings(data);
      setIsSavingBusiness(false);
      toast.success("Business settings updated successfully!");
      
      // In a real app, you would save to API/localStorage here
      localStorage.setItem("tellerpos_business_settings", JSON.stringify(data));
      console.log("Saved business settings:", data);
    }, 1000);
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
