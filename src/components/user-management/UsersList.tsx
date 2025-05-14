
import React, { useState } from 'react';
import { useUserManagement, User, UserRole } from '@/contexts/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Copy, UserCheck, UserCog, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import UserDetailsDialog from '@/components/user-management/UserDetailsDialog';

interface UsersListProps {
  filter: 'all' | UserRole | 'cashier-supervisor';
}

const UsersList = ({ filter }: UsersListProps) => {
  const { users, updateUserStatus } = useUserManagement();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Apply filter
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'cashier-supervisor') return user.role === 'Cashier' || user.role === 'Supervisor';
    return user.role === filter;
  });

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(message);
      },
      () => {
        toast.error("Failed to copy to clipboard");
      }
    );
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const result = await updateUserStatus(user.userId, newStatus);
    
    if (result.success) {
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } else {
      toast.error("Failed to update user status");
    }
  };

  const showUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Administrator':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Administrator</Badge>;
      case 'Manager':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Manager</Badge>;
      case 'Supervisor':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Supervisor</Badge>;
      case 'Cashier':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Cashier</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Agent Code</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{user.agentCode}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(user.agentCode, "Agent code copied to clipboard")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div className="text-muted-foreground">{user.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.status === 'active'}
                          onCheckedChange={() => handleStatusToggle(user)}
                        />
                        <span>{user.status === 'active' ? 'Active' : 'Inactive'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => showUserDetails(user)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                            <UserX className="mr-2 h-4 w-4" />
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={userDetailsOpen}
          onOpenChange={setUserDetailsOpen}
        />
      )}
    </Card>
  );
};

export default UsersList;
