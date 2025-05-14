
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserPrivileges from './UserPrivileges';
import { useState } from 'react';

interface UserDetailsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsDialog = ({ user, open, onOpenChange }: UserDetailsDialogProps) => {
  const [viewPrivileges, setViewPrivileges] = useState<string[]>(user?.privileges || []);
  
  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-500';
      case 'Manager':
        return 'bg-blue-500';
      case 'Supervisor':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // If user is undefined or null, don't render the dialog
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="privileges">User Privileges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="py-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarFallback className="text-lg">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
              <div className="flex mt-2 space-x-2">
                <Badge className={getStatusColor(user.status)}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p>{user.phoneNumber}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Agent Code</p>
                <p className="font-mono bg-muted px-2 py-1 rounded">{user.agentCode}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono">{user.userId}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Created At</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Password Status</p>
                <p>{user.isTemporaryPassword ? 'Temporary Password (Not Changed)' : 'Password Set'}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privileges" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>User Privileges</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <UserPrivileges 
                    selectedPrivileges={viewPrivileges} 
                    onPrivilegesChange={setViewPrivileges} 
                    userRole=""
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
