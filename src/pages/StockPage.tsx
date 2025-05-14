
import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileUp, FileDown, Grid, List, Edit } from "lucide-react";
import { InventoryItem, Product, Service } from "@/types/inventory";
import ProductForm from "@/components/inventory/ProductForm";
import ServiceForm from "@/components/inventory/ServiceForm";
import InventoryList from "@/components/inventory/InventoryList";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import ImportProducts from "@/components/inventory/ImportProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UpdateStockDialog from "@/components/inventory/UpdateStockDialog";

const StockPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [updateStockOpen, setUpdateStockOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  // Load inventory from localStorage
  useEffect(() => {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
    setIsLoading(false);
  }, []);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory, isLoading]);

  // Add a new product to inventory
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: nanoid(),
      type: 'product',
      createdAt: now,
      updatedAt: now
    };
    setInventory(prev => [...prev, newProduct]);
    setAddProductOpen(false);
    toast({
      title: 'Product Added',
      description: `${product.name} has been added to inventory.`
    });
  };

  // Add a new service to inventory
  const addService = (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => {
    const now = new Date().toISOString();
    const newService: Service = {
      ...service,
      id: nanoid(),
      type: 'service',
      createdAt: now,
      updatedAt: now
    };
    setInventory(prev => [...prev, newService]);
    setAddServiceOpen(false);
    toast({
      title: 'Service Added',
      description: `${service.name} has been added to your services.`
    });
  };

  // Import multiple products
  const importProducts = (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'type'>[]) => {
    const now = new Date().toISOString();
    const newProducts: Product[] = products.map(product => ({
      ...product,
      id: nanoid(),
      type: 'product',
      createdAt: now,
      updatedAt: now
    }));
    setInventory(prev => [...prev, ...newProducts]);
    setImportOpen(false);
    toast({
      title: 'Products Imported',
      description: `${newProducts.length} products have been added to inventory.`
    });
  };

  // Update an existing item in inventory
  const updateItem = (updatedItem: InventoryItem) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, updatedAt: new Date().toISOString() } 
          : item
      )
    );
    
    setSelectedItem(null);
    toast({
      title: 'Item Updated',
      description: `${updatedItem.name} has been updated successfully.`
    });
  };

  // Update stock level of a product
  const updateStock = (id: string, newQuantity: number, reason: string) => {
    setInventory(prev => 
      prev.map(item => {
        if (item.id === id && item.type === 'product') {
          const product = item as Product;
          return {
            ...product,
            quantity: newQuantity,
            stock: newQuantity,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
    
    setUpdateStockOpen(false);
    setSelectedItem(null);
    
    toast({
      title: 'Stock Updated',
      description: `Stock level updated. ${reason}`
    });
  };

  // Handle edit button click
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    if (item.type === 'product') {
      setUpdateStockOpen(true);
    }
  };

  // Filter inventory based on active tab
  const filteredInventory = inventory.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'products') return item.type === 'product';
    if (activeTab === 'services') return item.type === 'service';
    if (activeTab === 'low-stock') {
      return item.type === 'product' && (item as Product).quantity <= (item as Product).reorderLevel;
    }
    return true;
  });

  // Add to cart functionality (will be implemented in the Sell module later)
  const addToCart = (item: InventoryItem) => {
    toast({
      title: 'Added to Cart',
      description: `${item.name} has been added to cart.`
    });
    // In a real app, this would add the item to a cart state
  };

  // Download inventory template
  const downloadTemplate = () => {
    // Create a simple CSV template
    const template = 'name,description,price,sku,barcode,quantity,unitOfMeasurement,reorderLevel,costPrice\nExample Product,Product Description,1000,SKU001,,10,pieces,5,800';

    // Create a Blob from the CSV string
    const blob = new Blob([template], {
      type: 'text/csv'
    });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: 'Template Downloaded',
      description: 'Inventory template has been downloaded.'
    });
  };

  if (isLoading) {
    return <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-t-4 border-b-4 border-tellerpos rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>;
  }

  return <DashboardLayout>
      <div className="p-6 max-w-full mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="font-bold text-tellerpos-dark text-2xl">Inventory Management</h1>
            
            <div className="flex flex-wrap gap-2">
              <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Product</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <ProductForm onSubmit={addProduct} onCancel={() => setAddProductOpen(false)} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Service</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <ServiceForm onSubmit={addService} onCancel={() => setAddServiceOpen(false)} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileUp size={18} />
                    <span>Import</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Import Products</DialogTitle>
                  </DialogHeader>
                  <ImportProducts 
                    onImport={importProducts} 
                    onCancel={() => setImportOpen(false)}
                    existingItems={inventory} 
                  />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="flex items-center gap-2" onClick={downloadTemplate}>
                <FileDown size={18} />
                <span>Template</span>
              </Button>
              
              <div className="flex rounded-md overflow-hidden border">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} className="rounded-none" onClick={() => setViewMode('grid')}>
                  <Grid size={18} />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} className="rounded-none" onClick={() => setViewMode('list')}>
                  <List size={18} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Inventory content */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {filteredInventory.length === 0 ? <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-medium mb-4">No items found</h2>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'all' ? "Start by adding products or services to your inventory" : activeTab === 'products' ? "No products in your inventory" : activeTab === 'services' ? "No services added yet" : "No items with low stock"}
                  </p>
                  {activeTab === 'all' || activeTab === 'products' ? <Button onClick={() => setAddProductOpen(true)}>Add Product</Button> : activeTab === 'services' ? <Button onClick={() => setAddServiceOpen(true)}>Add Service</Button> : null}
                </div> : viewMode === 'grid' ? 
                <InventoryGrid 
                  items={filteredInventory} 
                  onAddToCart={addToCart}
                  onEdit={handleEdit}
                /> : 
                <InventoryList 
                  items={filteredInventory} 
                  onAddToCart={addToCart}
                  onEdit={handleEdit} 
                />
              }
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Update Stock Dialog */}
      <Dialog open={updateStockOpen && selectedItem !== null} onOpenChange={setUpdateStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
          </DialogHeader>
          {selectedItem && selectedItem.type === 'product' && (
            <UpdateStockDialog 
              product={selectedItem as Product} 
              onUpdate={updateStock}
              onCancel={() => {
                setUpdateStockOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>;
};

export default StockPage;
