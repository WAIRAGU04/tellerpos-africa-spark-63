
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserManagement, User, UserRole } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserPrivileges from './UserPrivileges';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded?: (user: User) => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number' }),
  role: z.enum(['Administrator', 'Manager', 'Supervisor', 'Cashier'], {
    required_error: 'Please select a role',
  }),
  privileges: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddUserDialog = ({ open, onOpenChange, onUserAdded }: AddUserDialogProps) => {
  const { addUser } = useUserManagement();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: 'Cashier',
      privileges: [],
    },
  });

  const watchedRole = form.watch('role');

  // Update form value when privileges change
  React.useEffect(() => {
    form.setValue('privileges', selectedPrivileges);
  }, [selectedPrivileges, form]);

  const onSubmit = async (data: FormValues) => {
    // Include privileges in the user data
    const result = await addUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role as UserRole,
      businessId: '', // This will be set in the context
      privileges: selectedPrivileges,
    });

    if (result.success && result.user) {
      form.reset();
      setSelectedPrivileges([]);
      setActiveTab("basic");
      onOpenChange(false);
      if (onUserAdded) {
        onUserAdded(result.user);
      }
    } else {
      toast.error("Error adding user", {
        description: result.message || "An unknown error occurred",
      });
    }
  };

  const handlePrivilegesChange = (privileges: string[]) => {
    setSelectedPrivileges(privileges);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with role-based access to the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="privileges">Privileges</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
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
                          <Input placeholder="Last name" {...field} />
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
                        <Input placeholder="user@example.com" type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be used for login and notifications
                      </FormDescription>
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
                        <Input placeholder="Phone number with country code" {...field} />
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
                      <FormLabel>User Role</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset privileges when role changes
                          setSelectedPrivileges([]);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Administrator: Full access | Manager: Business operations | Supervisor: Shift management | Cashier: POS only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("privileges")}
                    className="bg-tellerpos hover:bg-tellerpos/90"
                  >
                    Next: Configure Privileges
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="privileges" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="privileges"
                  render={() => (
                    <FormItem>
                      <FormLabel>User Privileges</FormLabel>
                      <FormControl>
                        <UserPrivileges 
                          selectedPrivileges={selectedPrivileges}
                          onPrivilegesChange={handlePrivilegesChange}
                          userRole={watchedRole}
                        />
                      </FormControl>
                      <FormDescription>
                        Customize what actions this user can perform in the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back to Basic Information
                  </Button>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        form.reset();
                        setSelectedPrivileges([]);
                        onOpenChange(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-tellerpos hover:bg-tellerpos/90"
                    >
                      Add User
                    </Button>
                  </DialogFooter>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
