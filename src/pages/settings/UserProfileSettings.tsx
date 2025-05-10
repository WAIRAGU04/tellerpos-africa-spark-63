
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserData } from "@/types/dashboard";
import { User, Mail, Phone, Key, Shield } from "lucide-react";
import { toast } from "sonner";

interface ExtendedUserData extends UserData {
  email?: string;
  phoneNumber?: string;
  role?: string;
  agentCode?: string;
}

interface UserProfileSettingsProps {
  userData: ExtendedUserData;
}

const UserProfileSettings = ({ userData }: UserProfileSettingsProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    // In a real app, this would make an API call to change password
    setIsChangingPassword(true);
    
    setTimeout(() => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    }, 1500);
  };
  
  const handleToggleMFA = () => {
    const newStatus = !mfaEnabled;
    setMfaEnabled(newStatus);
    
    if (newStatus) {
      toast.success("Multi-factor authentication enabled");
    } else {
      toast.success("Multi-factor authentication disabled");
    }
  };
  
  return (
    <div className="space-y-8">
      {/* User Profile Information */}
      <Card className="bg-tellerpos-dark-accent/10">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Your personal account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>First Name</span>
              </Label>
              <Input 
                id="firstName" 
                value={userData.firstName} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Last Name</span>
              </Label>
              <Input 
                id="lastName" 
                value={userData.lastName} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </Label>
              <Input 
                id="userEmail" 
                value={userData.email} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="userPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </Label>
              <Input 
                id="userPhone" 
                value={userData.phoneNumber} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Role</span>
              </Label>
              <Input 
                id="role" 
                value={userData.role} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Agent Code */}
            <div className="space-y-2">
              <Label htmlFor="agentCode" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span>Agent Code</span>
              </Label>
              <Input 
                id="agentCode" 
                value={userData.agentCode} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Change Password */}
      <Card className="bg-tellerpos-dark-accent/10">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-tellerpos-bg/20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isChangingPassword} 
              className="bg-tellerpos hover:bg-tellerpos/90"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Security Settings */}
      <Card className="bg-tellerpos-dark-accent/10">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Enhance your account security with additional features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-base">Multi-Factor Authentication (MFA)</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              checked={mfaEnabled} 
              onCheckedChange={handleToggleMFA} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileSettings;
