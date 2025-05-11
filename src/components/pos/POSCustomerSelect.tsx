
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Search, UserPlus, Check } from 'lucide-react';
import { Customer } from '@/types/pos';

interface POSCustomerSelectProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCustomerSelected?: (customerId: string, name: string) => void;
  onSelectCustomer?: (customerId: string) => void;
  selectedCustomerId: string | null;
}

const POSCustomerSelect: React.FC<POSCustomerSelectProps> = ({
  open,
  onOpenChange,
  onCustomerSelected,
  onSelectCustomer,
  selectedCustomerId
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  
  // Handle open state either from props or internal state
  const isOpen = open !== undefined ? open : isDialogVisible;
  
  // Handle dialog open/close
  const handleOpenChange = (newOpenState: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpenState);
    } else {
      setIsDialogVisible(newOpenState);
    }
  };
  
  // Load customers (in a real app, this would come from an API or database)
  useEffect(() => {
    // Simulate loading customers
    setTimeout(() => {
      const dummyCustomers: Customer[] = [
        { id: '1', name: 'John Doe', phone: '0712345678', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', phone: '0723456789', email: 'jane@example.com' },
        { id: '3', name: 'Michael Johnson', phone: '0734567890', email: 'michael@example.com' },
        { id: '4', name: 'Emily Brown', phone: '0745678901', email: 'emily@example.com' },
        { id: '5', name: 'David Wilson', phone: '0756789012', email: 'david@example.com' },
      ];
      
      setCustomers(dummyCustomers);
      setFilteredCustomers(dummyCustomers);
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Filter customers based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(query) || 
      customer.phone.includes(query) || 
      (customer.email && customer.email.toLowerCase().includes(query))
    );
    
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);
  
  const handleSelectCustomer = (customer: Customer) => {
    if (onCustomerSelected) {
      onCustomerSelected(customer.id, customer.name);
      handleOpenChange(false);
    } else if (onSelectCustomer) {
      onSelectCustomer(customer.id);
      handleOpenChange(false);
    }
  };
  
  // For inline selection (no dialog)
  if (!open && !isDialogVisible) {
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="customerSelect">Customer</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleOpenChange(true)}
          >
            {selectedCustomerId ? 'Change' : 'Select'} Customer
          </Button>
        </div>
        
        {selectedCustomerId && selectedCustomer ? (
          <div className="p-2 border rounded flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => {
                if (onSelectCustomer) onSelectCustomer("");
                if (onCustomerSelected) onCustomerSelected("", "");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="p-2 border border-dashed rounded text-center text-muted-foreground">
            No customer selected
          </div>
        )}
        
        {/* Hidden dialog that will be shown when needed */}
        <Dialog open={isDialogVisible} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-md">
            {/* Dialog content will be rendered when open */}
            <CustomerSelectDialogContent 
              isLoading={isLoading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredCustomers={filteredCustomers}
              handleSelectCustomer={handleSelectCustomer}
              handleOpenChange={handleOpenChange}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Dialog version
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <CustomerSelectDialogContent 
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredCustomers={filteredCustomers}
          handleSelectCustomer={handleSelectCustomer}
          handleOpenChange={handleOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
};

// Extracted dialog content to avoid duplication
interface CustomerSelectDialogContentProps {
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCustomers: Customer[];
  handleSelectCustomer: (customer: Customer) => void;
  handleOpenChange: (open: boolean) => void;
}

const CustomerSelectDialogContent: React.FC<CustomerSelectDialogContentProps> = ({
  isLoading,
  searchQuery,
  setSearchQuery,
  filteredCustomers,
  handleSelectCustomer,
  handleOpenChange
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Select Customer</DialogTitle>
        <DialogDescription>
          Select a customer for credit sale or create a new customer.
        </DialogDescription>
      </DialogHeader>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="py-4 text-center">
          <div className="w-8 h-8 border-t-4 border-b-4 border-tellerpos rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No customers found</p>
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Customer
          </Button>
        </div>
      ) : (
        <div className="max-h-60 overflow-auto">
          <div className="divide-y">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id}
                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-2 mr-3">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <DialogFooter>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </DialogFooter>
    </>
  );
};

export default POSCustomerSelect;
