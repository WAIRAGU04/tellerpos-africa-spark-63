
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import OTPVerification from "./OTPVerification";

const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().optional(),
  agentCode: z.string().optional(),
  role: z.string().optional(),
  businessName: z.string().optional(),
});

interface UserProfileFormProps {
  initialData?: Partial<UserData>;
  onSave: (data: UserData) => void;
  isSaving: boolean;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSave,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const defaultValues: Partial<UserData> = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    agentCode: "",
    role: "",
    businessName: "",
    ...initialData,
  };

  const form = useForm<UserData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues,
  });

  const handleEditRequest = () => {
    setShowOtpVerification(true);
  };

  const handleOtpVerify = () => {
    setShowOtpVerification(false);
    setIsEditing(true);
    toast.success("Identity verified. You can now edit your profile.");
  };

  const handleOtpCancel = () => {
    setShowOtpVerification(false);
  };

  const onSubmit = (data: UserData) => {
    onSave(data);
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setIsEditing(false);
  };

  return (
    <>
      <OTPVerification
        email={form.getValues("email") || ""}
        onVerify={handleOtpVerify}
        onCancel={handleOtpCancel}
        isOpen={showOtpVerification}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Your personal information
                </CardDescription>
              </div>
              {!isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleEditRequest}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" /> Modify Details
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter first name" 
                          {...field} 
                          disabled={!isEditing} 
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter last name" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter email address" 
                        {...field} 
                        value={field.value || ""}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        {...field} 
                        value={field.value || ""}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter agent code" 
                        {...field} 
                        value={field.value || ""}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter role" 
                        {...field} 
                        value={field.value || ""}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};

export default UserProfileForm;
