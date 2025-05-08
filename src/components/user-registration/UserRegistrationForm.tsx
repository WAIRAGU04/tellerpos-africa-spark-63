
import { useState } from "react";
import { User, Mail, Phone, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { validateUserRegistration } from "./userRegistrationUtils";

interface UserRegistrationFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  };
  handleChange: (field: string, value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSignInClick: () => void;
}

const UserRegistrationForm = ({
  formData,
  handleChange,
  isSubmitting,
  onSubmit,
  onSignInClick,
}: UserRegistrationFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-6 py-6">
        <div className="grid gap-2">
          <label htmlFor="firstName" className="text-sm font-medium text-white">
            First Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 text-tellerpos/70" />
            </div>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="lastName" className="text-sm font-medium text-white">
            Last Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 text-tellerpos/70" />
            </div>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium text-white">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-4 w-4 text-tellerpos/70" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium text-white">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone className="h-4 w-4 text-tellerpos/70" />
            </div>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
            />
          </div>
          <p className="text-xs text-gray-400">Including country code (e.g. +254 7XX XXX XXX)</p>
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium text-white">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 text-tellerpos/70" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Create password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
            />
          </div>
          <p className="text-xs text-gray-400">Must be at least 6 characters</p>
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 text-tellerpos/70" />
            </div>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
            />
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 text-base"
        >
          {isSubmitting ? "Processing..." : "Register"}
        </Button>
        
        <div className="mt-4 flex items-center justify-center gap-6 text-white/80">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm">Secure Registration</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm">Start Using Immediately</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={onSignInClick}
            className="text-tellerpos hover:text-tellerpos/80 text-sm underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserRegistrationForm;
