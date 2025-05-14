
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUserManagement, UserRole } from "@/contexts/UserContext";
import { 
  UserPlus, 
  UserX, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Plus 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddUserDialog from "@/components/user-management/AddUserDialog";
import UsersList from "@/components/user-management/UsersList";

const UserManagementPage = () => {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const { users, isLoading } = useUserManagement();

  const getRoleCount = (role: UserRole) => {
    return users.filter(user => user.role === role).length;
  };

  const getActiveUserCount = () => {
    return users.filter(user => user.status === "active").length;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={() => setAddUserDialogOpen(true)} className="bg-tellerpos">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {getActiveUserCount()} active users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administrators
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getRoleCount("Administrator")}
              </div>
              <p className="text-xs text-muted-foreground">
                Full system access
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Managers
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getRoleCount("Manager")}
              </div>
              <p className="text-xs text-muted-foreground">
                Business operations access
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cashiers
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getRoleCount("Cashier") + getRoleCount("Supervisor")}
              </div>
              <p className="text-xs text-muted-foreground">
                Point of sale access
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="administrators">Administrators</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="cashiers">Cashiers & Supervisors</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <UsersList filter="all" />
          </TabsContent>
          <TabsContent value="administrators">
            <UsersList filter="Administrator" />
          </TabsContent>
          <TabsContent value="managers">
            <UsersList filter="Manager" />
          </TabsContent>
          <TabsContent value="cashiers">
            <UsersList filter="cashier-supervisor" />
          </TabsContent>
        </Tabs>
      </div>

      <AddUserDialog 
        open={addUserDialogOpen} 
        onOpenChange={setAddUserDialogOpen}
        onUserAdded={(user) => {
          toast.success("User added successfully", {
            description: `${user.firstName} ${user.lastName} has been added as a ${user.role}`,
          });
        }} 
      />
    </DashboardLayout>
  );
};

export default UserManagementPage;
