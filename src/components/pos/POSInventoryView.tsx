
import React, { useState, useEffect } from 'react';
import { InventoryItem, Product, Service } from '@/types/inventory';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package2, FileText, Search, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface POSInventoryViewProps {
  inventory: InventoryItem[];
  addToCart: (item: InventoryItem) => void;
}

const POSInventoryView: React.FC<POSInventoryViewProps> = ({
  inventory,
  addToCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(inventory);

  // Filter items based on search query and active tab
  useEffect(() => {
    let filtered = inventory;

    // Filter by tab
    if (activeTab === 'products') {
      filtered = filtered.filter(item => item.type === 'product');
    } else if (activeTab === 'services') {
      filtered = filtered.filter(item => item.type === 'service');
    } else if (activeTab === 'available') {
      filtered = filtered.filter(item => item.type === 'product' && (item as Product).quantity > 0 || item.type === 'service' && (item as Service).isAvailable);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    }
    setFilteredItems(filtered);
  }, [inventory, searchQuery, activeTab]);

  // Helper to render the item's image or color
  const renderItemVisual = (item: InventoryItem) => {
    if (item.imageUrl) {
      return (
        <AspectRatio ratio={4/3}>
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-t-md" />
        </AspectRatio>
      );
    } else if (item.color) {
      const colorMap: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500'
      };
      return (
        <AspectRatio ratio={4/3}>
          <div className={`w-full h-full ${colorMap[item.color]} rounded-t-md flex items-center justify-center`}>
            {item.type === 'product' ? <Package2 className="w-12 h-12 text-white opacity-50" /> : <FileText className="w-12 h-12 text-white opacity-50" />}
          </div>
        </AspectRatio>
      );
    }

    // Fallback
    return (
      <AspectRatio ratio={4/3}>
        <div className="w-full h-full bg-gray-200 dark:bg-tellerpos-dark-accent rounded-t-md flex items-center justify-center">
          {item.type === 'product' ? <Package2 className="w-12 h-12 text-gray-400" /> : <FileText className="w-12 h-12 text-gray-400" />}
        </div>
      </AspectRatio>
    );
  };

  // Helper to check if an item can be added to cart
  const canAddToCart = (item: InventoryItem): boolean => {
    if (item.type === 'product') {
      return (item as Product).quantity > 0;
    } else {
      return (item as Service).isAvailable;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search inventory..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 bg-green-400">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredItems.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden transition-all ${canAddToCart(item) ? 'hover:shadow-md' : 'opacity-60'}`}
                >
                  {renderItemVisual(item)}
                  
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-base text-inherit">{item.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.type === 'product' ? `Stock: ${(item as Product).quantity}` : (item as Service).isAvailable ? 'Available' : 'Unavailable'}
                        </p>
                        <p className="font-semibold text-sm mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      
                      {canAddToCart(item) ? (
                        <Button
                          size="sm"
                          className="flex-none mt-1"
                          onClick={() => addToCart(item)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" /> Add
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-xs mt-1">
                          {item.type === 'product' ? 'Out of stock' : 'Unavailable'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default POSInventoryView;
