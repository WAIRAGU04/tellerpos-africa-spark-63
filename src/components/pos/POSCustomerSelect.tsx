
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerSelected: (customerId: string, name: string) => void;
}

const POSCustomerSelect: React.FC<POSCustomerSelectProps> = ({
  open,
  onOpenChange,
  onCustomerSelected
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    onCustomerSelected(customer.id, customer.name);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> New Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default POSCustomerSelect;
