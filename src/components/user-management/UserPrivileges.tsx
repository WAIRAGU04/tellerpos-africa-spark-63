
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPrivilege, UserPrivilegeGroup, PrivilegeCategories } from '@/types/users';

interface UserPrivilegesProps {
  selectedPrivileges: string[];
  onPrivilegesChange: (privileges: string[]) => void;
  userRole?: string;
}

const UserPrivileges: React.FC<UserPrivilegesProps> = ({ 
  selectedPrivileges, 
  onPrivilegesChange,
  userRole
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Define all available privileges grouped by category
  const privilegeGroups: UserPrivilegeGroup[] = [
    {
      category: 'customers',
      label: 'Customers',
      privileges: [
        { id: 'create_customer', name: 'Create Customer', description: 'Can create a customer', category: 'customers', enabled: false },
        { id: 'view_customers', name: 'View Customers', description: 'Can view list of customers', category: 'customers', enabled: false },
        { id: 'edit_customer', name: 'Edit Customer', description: 'Can edit customer details', category: 'customers', enabled: false },
        { id: 'delete_customer', name: 'Delete Customer', description: 'Can delete customers', category: 'customers', enabled: false },
        { id: 'view_customer_statement', name: 'View Customer Statement', description: 'View customers account transaction statement', category: 'customers', enabled: false },
      ]
    },
    {
      category: 'sales',
      label: 'Sales',
      privileges: [
        { id: 'create_sale', name: 'Create Sale', description: 'Can sell products and services', category: 'sales', enabled: false },
        { id: 'view_sales', name: 'View Sales', description: 'Can view sales records', category: 'sales', enabled: false },
        { id: 'issue_refunds', name: 'Issue Refunds', description: 'Issue refunds to orders & invoices', category: 'sales', enabled: false },
        { id: 'receive_account_payments', name: 'Receive Account Payments', description: 'Receive credit payments from customers', category: 'sales', enabled: false },
        { id: 'delete_orders_on_hold', name: 'Delete Orders on Hold', description: 'Can delete orders that are on hold', category: 'sales', enabled: false },
      ]
    },
    {
      category: 'inventory',
      label: 'Inventory',
      privileges: [
        { id: 'view_products', name: 'View Products', description: 'Can view list of products', category: 'inventory', enabled: false },
        { id: 'view_services', name: 'View Services', description: 'Can view list of services', category: 'inventory', enabled: false },
        { id: 'create_product', name: 'Create Product', description: 'Save new product', category: 'inventory', enabled: false },
        { id: 'create_services', name: 'Create Services', description: 'Create services', category: 'inventory', enabled: false },
        { id: 'edit_product', name: 'Edit Product', description: 'Can edit product details', category: 'inventory', enabled: false },
        { id: 'delete_product', name: 'Delete Product', description: 'Can delete products', category: 'inventory', enabled: false },
        { id: 'view_stock_quantities', name: 'View Stock Quantities', description: 'View remaining stock quantities', category: 'inventory', enabled: false },
        { id: 'view_buying_price', name: 'View Buying Price', description: 'Can see buying price of items', category: 'inventory', enabled: false },
        { id: 'view_selling_price', name: 'View Selling Price', description: 'Can see selling price of items', category: 'inventory', enabled: false },
        { id: 'edit_buying_price', name: 'Edit Buying Price', description: 'Can edit product buying price', category: 'inventory', enabled: false },
        { id: 'edit_selling_price', name: 'Edit Selling Price', description: 'Can edit product selling price', category: 'inventory', enabled: false },
        { id: 'receive_stock', name: 'Receive Stock', description: 'Can receive stock', category: 'inventory', enabled: false },
        { id: 'recount_stock', name: 'Recount Stock', description: 'Can perform stock recount', category: 'inventory', enabled: false },
        { id: 'transfer_stock', name: 'Transfer Stock', description: 'Can initiate, receive & dispatch stock transfer requests', category: 'inventory', enabled: false },
        { id: 'direct_transfer_stock', name: 'Direct Transfer Stock', description: 'Users can instantly transfer stock', category: 'inventory', enabled: false },
      ]
    },
    {
      category: 'accounts',
      label: 'Accounts & Finance',
      privileges: [
        { id: 'view_financial_statements', name: 'View Financial Statements', description: 'Can view financial statements TB, P&L BS etc...', category: 'accounts', enabled: false },
        { id: 'manage_chart_of_accounts', name: 'Manage Chart of Accounts', description: 'Can create, edit & manage chart of accounts', category: 'accounts', enabled: false },
        { id: 'create_invoices', name: 'Create Invoices', description: 'Can create invoices', category: 'accounts', enabled: false },
        { id: 'view_invoices', name: 'View Invoices', description: 'Can view invoices list', category: 'accounts', enabled: false },
        { id: 'edit_invoice', name: 'Edit Invoice', description: 'Can edit invoice details', category: 'accounts', enabled: false },
        { id: 'manage_invoices', name: 'Manage Invoices', description: 'Create, edit & convert invoices', category: 'accounts', enabled: false },
        { id: 'create_expense', name: 'Create Expense', description: 'Can create expenses', category: 'accounts', enabled: false },
        { id: 'view_expenses', name: 'View Expenses', description: 'Can view expenses list', category: 'accounts', enabled: false },
        { id: 'edit_expense', name: 'Edit Expense', description: 'Can edit expense details', category: 'accounts', enabled: false },
        { id: 'delete_expense', name: 'Delete Expense', description: 'Can delete expenses', category: 'accounts', enabled: false },
        { id: 'manage_expenses', name: 'Manage Expenses', description: 'Can view, create & edit expenses', category: 'accounts', enabled: false },
        { id: 'view_quotations', name: 'View Quotations', description: 'Can view quotations list', category: 'accounts', enabled: false },
        { id: 'create_quotations', name: 'Create Quotations', description: 'Can create quotations', category: 'accounts', enabled: false },
        { id: 'edit_quotations', name: 'Edit Quotations', description: 'Can edit quotation details', category: 'accounts', enabled: false },
        { id: 'delete_quotations', name: 'Delete Quotations', description: 'Can delete quotations', category: 'accounts', enabled: false },
        { id: 'view_supplier_statement', name: 'View Supplier Statement', description: 'View suppliers account transaction statement', category: 'accounts', enabled: false },
        { id: 'can_pay_supplier', name: 'Can Pay Supplier', description: 'Can process supplier payments', category: 'accounts', enabled: false },
        { id: 'delete_purchases', name: 'Delete Purchases', description: 'User can delete purchase records', category: 'accounts', enabled: false },
      ]
    },
    {
      category: 'suppliers',
      label: 'Suppliers',
      privileges: [
        { id: 'create_supplier', name: 'Create Supplier', description: 'Can create a supplier', category: 'suppliers', enabled: false },
        { id: 'view_suppliers', name: 'View Suppliers', description: 'Can view list of suppliers', category: 'suppliers', enabled: false },
        { id: 'edit_supplier', name: 'Edit Supplier', description: 'Can edit supplier details', category: 'suppliers', enabled: false },
        { id: 'delete_suppliers', name: 'Delete Suppliers', description: 'Can delete suppliers', category: 'suppliers', enabled: false },
      ]
    },
    {
      category: 'reports',
      label: 'Reports',
      privileges: [
        { id: 'view_reports', name: 'View Reports', description: 'View daily sales summary & other reports', category: 'reports', enabled: false },
        { id: 'filter_old_data', name: 'Filter Old Data', description: 'User can filter and view data older than a week old', category: 'reports', enabled: false },
      ]
    },
    {
      category: 'users',
      label: 'Users',
      privileges: [
        { id: 'create_user', name: 'Create User', description: 'Can create new users', category: 'users', enabled: false },
        { id: 'view_users', name: 'View Users', description: 'Can view list of users', category: 'users', enabled: false },
        { id: 'edit_users', name: 'Edit Users', description: 'Can edit user details', category: 'users', enabled: false },
        { id: 'delete_users', name: 'Delete Users', description: 'Can delete users', category: 'users', enabled: false },
        { id: 'manage_privileges', name: 'Manage Privileges', description: 'Manage other user privileges in the system', category: 'users', enabled: false },
      ]
    },
    {
      category: 'settings',
      label: 'Settings',
      privileges: [
        { id: 'manage_shop_settings', name: 'Manage Shop Settings', description: 'Can manage shop settings', category: 'settings', enabled: false },
        { id: 'manage_subscriptions', name: 'Manage Subscriptions', description: 'View & manage account subscription', category: 'settings', enabled: false },
        { id: 'manage_integrations', name: 'Manage Integrations', description: 'Manage system integration services', category: 'settings', enabled: false },
        { id: 'clear_data', name: 'Clear Data', description: 'Refresh all account data', category: 'settings', enabled: false },
        { id: 'delete_account', name: 'Delete Account', description: 'Can permanently delete account', category: 'settings', enabled: false },
      ]
    },
    {
      category: 'other',
      label: 'Other',
      privileges: [
        { id: 'view_categories', name: 'View Categories', description: 'Can view product categories', category: 'other', enabled: false },
        { id: 'create_categories', name: 'Create Categories', description: 'Can create product categories', category: 'other', enabled: false },
        { id: 'edit_categories', name: 'Edit Categories', description: 'Can edit product categories', category: 'other', enabled: false },
        { id: 'delete_categories', name: 'Delete Categories', description: 'Can delete product categories', category: 'other', enabled: false },
        { id: 'manage_raw_materials', name: 'Manage Raw Materials', description: 'Can manage raw materials', category: 'other', enabled: false },
        { id: 'manage_production', name: 'Manage Production', description: 'Record production of finished goods from raw materials', category: 'other', enabled: false },
        { id: 'recount_raw_materials', name: 'Recount Raw Materials', description: 'Can do recount of raw materials', category: 'other', enabled: false },
        { id: 'record_raw_material_purchases', name: 'Record Raw Material Purchases', description: 'Can record purchases for raw materials', category: 'other', enabled: false },
      ]
    }
  ];

  // Function to check if a privilege is selected
  const isPrivilegeSelected = (id: string) => {
    return selectedPrivileges.includes(id);
  };

  // Function to handle privilege toggle
  const handlePrivilegeToggle = (id: string) => {
    if (isPrivilegeSelected(id)) {
      onPrivilegesChange(selectedPrivileges.filter(p => p !== id));
    } else {
      onPrivilegesChange([...selectedPrivileges, id]);
    }
  };

  // Filter privileges based on search query
  const filterPrivileges = (privileges: UserPrivilege[]) => {
    if (!searchQuery) return privileges;
    
    return privileges.filter(privilege => 
      privilege.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      privilege.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Select all privileges in a category
  const handleSelectAll = (category: string) => {
    const categoryPrivileges = privilegeGroups.find(group => group.category === category)?.privileges || [];
    const categoryIds = categoryPrivileges.map(p => p.id);
    
    // If all are selected, deselect all; otherwise select all
    const allSelected = categoryIds.every(id => selectedPrivileges.includes(id));
    
    if (allSelected) {
      onPrivilegesChange(selectedPrivileges.filter(id => !categoryIds.includes(id)));
    } else {
      const newPrivileges = [...new Set([...selectedPrivileges, ...categoryIds])];
      onPrivilegesChange(newPrivileges);
    }
  };

  // Apply role-based default privileges
  React.useEffect(() => {
    if (userRole && selectedPrivileges.length === 0) {
      let defaultPrivileges: string[] = [];
      
      switch (userRole) {
        case 'Administrator':
          // Admin gets all privileges
          defaultPrivileges = privilegeGroups.flatMap(group => group.privileges.map(p => p.id));
          break;
        case 'Manager':
          // Managers get most privileges except critical ones
          defaultPrivileges = privilegeGroups.flatMap(group => 
            group.privileges
              .filter(p => !['delete_account', 'manage_privileges', 'clear_data'].includes(p.id))
              .map(p => p.id)
          );
          break;
        case 'Supervisor':
          // Supervisors get operational privileges
          defaultPrivileges = [
            'view_customers', 'create_customer', 'edit_customer',
            'create_sale', 'view_sales', 'view_products', 'view_services',
            'view_stock_quantities', 'view_selling_price', 'receive_stock',
            'view_reports', 'view_expenses', 'issue_refunds'
          ];
          break;
        case 'Cashier':
          // Cashiers get basic sales privileges
          defaultPrivileges = [
            'view_customers', 'create_sale', 'view_sales',
            'view_products', 'view_services', 'view_selling_price'
          ];
          break;
      }
      
      if (defaultPrivileges.length > 0) {
        onPrivilegesChange(defaultPrivileges);
      }
    }
  }, [userRole]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search privileges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8">
          {privilegeGroups.map(group => (
            <TabsTrigger key={group.category} value={group.category}>
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {privilegeGroups.map(group => (
          <TabsContent key={group.category} value={group.category} className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{group.label}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`select-all-${group.category}`} 
                      checked={group.privileges.every(p => selectedPrivileges.includes(p.id))}
                      onCheckedChange={() => handleSelectAll(group.category)}
                    />
                    <Label htmlFor={`select-all-${group.category}`}>Select All</Label>
                  </div>
                </div>
                <CardDescription>
                  {group.label} permissions control access to {group.category} functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterPrivileges(group.privileges).map(privilege => (
                      <div key={privilege.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={privilege.id} 
                          checked={isPrivilegeSelected(privilege.id)}
                          onCheckedChange={() => handlePrivilegeToggle(privilege.id)}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor={privilege.id}
                            className="font-medium"
                          >
                            {privilege.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{privilege.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserPrivileges;
