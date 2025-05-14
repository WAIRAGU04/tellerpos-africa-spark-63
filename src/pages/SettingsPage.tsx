
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BusinessSettingsForm from "@/components/settings/BusinessSettingsForm";
import UserProfileForm from "@/components/settings/UserProfileForm";
import { BusinessSettings, UserData, ThemeSettings } from "@/types/dashboard";
import { toast } from "sonner";
import { 
  loadBusinessSettings, 
  loadUserData, 
  saveBusinessSettings, 
  saveUserData 
} from "@/utils/settingsUtils";
import DocumentSettingsForm from "@/components/settings/DocumentSettingsForm";
import ThemeSettingsForm from "@/components/settings/ThemeSettingsForm";
import { useNavigate, useSearchParams } from "react-router-dom";

const SettingsPage = () => {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const navigate = useNavigate();
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [businessSettings, setBusinessSettings] = useState<Partial<BusinessSettings>>({});
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
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
  
  const handleSaveDocumentSettings = (data: Partial<BusinessSettings>) => {
    setIsSavingDocument(true);
    
    try {
      // Merge with existing business settings
      const updatedSettings: BusinessSettings = {
        ...businessSettings as BusinessSettings,
        currency: data.currency || businessSettings.currency || "KES",
        logo: data.logo || businessSettings.logo || "",
        signature: data.signature || businessSettings.signature || "",
        documentFooters: {
          receipt: data.documentFooters?.receipt || businessSettings.documentFooters?.receipt || "",
          invoice: data.documentFooters?.invoice || businessSettings.documentFooters?.invoice || "",
          quotation: data.documentFooters?.quotation || businessSettings.documentFooters?.quotation || "",
          purchaseOrder: data.documentFooters?.purchaseOrder || businessSettings.documentFooters?.purchaseOrder || "",
          deliveryNote: data.documentFooters?.deliveryNote || businessSettings.documentFooters?.deliveryNote || ""
        }
      };
      
      // Save to localStorage
      saveBusinessSettings(updatedSettings);
      
      // Update state
      setBusinessSettings(updatedSettings);
      toast.success("Document settings updated successfully!");
    } catch (error) {
      console.error("Error saving document settings:", error);
      toast.error("Failed to save document settings");
    } finally {
      setIsSavingDocument(false);
    }
  };

  const handleSaveThemeSettings = (themeSettings: ThemeSettings) => {
    setIsSavingTheme(true);
    
    try {
      // Save theme settings to localStorage
      localStorage.setItem("tellerpos_theme_settings", JSON.stringify(themeSettings));
      
      // Apply sidebar collapsed state if the setting was changed
      if (themeSettings.sidebarCollapsed !== undefined) {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(themeSettings.sidebarCollapsed));
      }
      
      toast.success("Theme settings updated successfully!");
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast.error("Failed to save theme settings");
    } finally {
      setIsSavingTheme(false);
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
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="profile">User Profile</TabsTrigger>
            <TabsTrigger value="business">Business Settings</TabsTrigger>
            <TabsTrigger value="documents">Document Settings</TabsTrigger>
            <TabsTrigger value="theme">Theme & Display</TabsTrigger>
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
          
          <TabsContent value="documents" className="space-y-6">
            <DocumentSettingsForm
              initialData={businessSettings}
              onSave={handleSaveDocumentSettings}
              isSaving={isSavingDocument}
            />
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-6">
            <ThemeSettingsForm
              onSave={handleSaveThemeSettings}
              isSaving={isSavingTheme}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
