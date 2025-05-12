
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateRangePicker from "./DateRangePicker";
import { useDateRange } from "@/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/utils";
import ReportExport from "./ReportExport";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { InventoryItem } from "@/types/inventory";
import { Transaction } from "@/types/pos";
import { Search } from "lucide-react";

const InventoryReports: React.FC = () => {
  const { dateRange } = useDateRange();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventoryWithSales, setInventoryWithSales] = useState<any[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeReport, setActiveReport] = useState<"inventory" | "sales" | "categories">("inventory");
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  // Load inventory and transactions from localStorage
  useEffect(() => {
    const storedInventory = localStorage.getItem('inventory');
    const storedTransactions = localStorage.getItem('transactions');
    
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);
  
  // Process inventory with sales data
  useEffect(() => {
    if (!inventory.length || !transactions.length) return;
    
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;
    
    // Filter transactions in date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= startDate && 
             transactionDate <= endDate &&
             transaction.status === "completed";
    });
    
    // Calculate sales for each inventory item
    const salesMap = new Map();
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existingSale = salesMap.get(item.id) || { quantity: 0, revenue: 0 };
        existingSale.quantity += item.quantity;
        existingSale.revenue += (item.price * item.quantity);
        salesMap.set(item.id, existingSale);
      });
    });
    
    // Combine inventory with sales data
    const inventoryWithSalesData = inventory.map(item => {
      const sales = salesMap.get(item.id) || { quantity: 0, revenue: 0 };
      return {
        ...item,
        sold: sales.quantity,
        revenue: sales.revenue,
        stockValue: item.price * item.stock,
      };
    });
    
    setInventoryWithSales(inventoryWithSalesData);
    setFilteredInventory(inventoryWithSalesData);
    
    // Create category breakdown
    const categories = new Map();
    inventoryWithSalesData.forEach(item => {
      const category = item.category || 'Uncategorized';
      const existingCategory = categories.get(category) || { 
        category, 
        count: 0, 
        totalStock: 0,
        totalValue: 0,
        sold: 0,
        revenue: 0
      };
      
      existingCategory.count += 1;
      existingCategory.totalStock += item.stock;
      existingCategory.totalValue += (item.price * item.stock);
      existingCategory.sold += item.sold || 0;
      existingCategory.revenue += item.revenue || 0;
      
      categories.set(category, existingCategory);
    });
    
    setCategoryBreakdown(Array.from(categories.values()));
    
  }, [inventory, transactions, dateRange]);
  
  // Handle search and filters
  useEffect(() => {
    if (!inventoryWithSales.length) return;
    
    let filtered = [...inventoryWithSales];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'in-stock') {
        filtered = filtered.filter(item => item.stock > 0);
      } else if (statusFilter === 'low-stock') {
        filtered = filtered.filter(item => item.stock > 0 && item.stock <= item.reorderLevel);
      } else if (statusFilter === 'out-of-stock') {
        filtered = filtered.filter(item => item.stock === 0);
      }
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => (item.category || 'Uncategorized') === categoryFilter);
    }
    
    setFilteredInventory(filtered);
    
  }, [inventoryWithSales, searchTerm, statusFilter, categoryFilter]);
  
  // Calculate inventory statistics
  const totalItems = filteredInventory.length;
  const totalStock = filteredInventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockItems = filteredInventory.filter(item => item.stock > 0 && item.stock <= item.reorderLevel).length;
  const outOfStockItems = filteredInventory.filter(item => item.stock === 0).length;
  
  // Get unique categories for filter
  const categories = Array.from(new Set(inventory.map(item => item.category || 'Uncategorized')));
  
  // Get stock status label
  const getStockStatus = (item: any) => {
    if (item.stock <= 0) return 'out-of-stock';
    if (item.stock <= item.reorderLevel) return 'low-stock';
    return 'in-stock';
  };
  
  // Get stock status badge
  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low-stock':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Low Stock</Badge>;
      case 'in-stock':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">In Stock</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DateRangePicker />
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={activeReport} onValueChange={(value: any) => setActiveReport(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory Status</SelectItem>
              <SelectItem value="sales">Inventory Sales</SelectItem>
              <SelectItem value="categories">Category Analysis</SelectItem>
            </SelectContent>
          </Select>
          
          <ReportExport 
            data={activeReport === "categories" ? categoryBreakdown : filteredInventory} 
            filename={`inventory-${activeReport}-report`} 
          />
        </div>
      </div>
      
      {/* Inventory Status Report */}
      {activeReport === "inventory" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Inventory Value</CardDescription>
                <CardTitle className="text-3xl text-green-500">{formatCurrency(totalValue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Based on current stock levels
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Stock Items</CardDescription>
                <CardTitle className="text-3xl text-green-500">{totalStock}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Across {totalItems} unique products
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Stock Alerts</CardDescription>
                <CardTitle className="text-3xl text-green-500">{lowStockItems + outOfStockItems}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{outOfStockItems} out of stock</p>
                  <p>{lowStockItems} low stock</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <CardTitle>Inventory Status</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search items..."
                      className="pl-8 w-full md:w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="Status filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Category filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Inventory status as of {new Date().toLocaleDateString()}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku || 'N/A'}</TableCell>
                        <TableCell>{item.category || 'Uncategorized'}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{formatCurrency(item.stockValue)}</TableCell>
                        <TableCell>{getStockStatusBadge(getStockStatus(item))}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No items found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Inventory Sales Report */}
      {activeReport === "sales" && (
        <>
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <CardTitle>Top Selling Products</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search items..."
                      className="pl-8 w-full md:w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Category filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {filteredInventory.filter(item => item.sold > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredInventory
                        .filter(item => item.sold > 0)
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 10)
                        .map(item => ({
                          ...item,
                          formattedRevenue: formatCurrency(item.revenue)
                        }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: any) => {
                          if (name === "revenue") return [formatCurrency(value), "Revenue"];
                          return [value, "Units Sold"];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                      <Bar dataKey="sold" fill="#8884d8" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No sales data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Product Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Sales performance during selected period</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.filter(item => item.sold > 0).length > 0 ? (
                    filteredInventory
                      .filter(item => item.sold > 0)
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category || 'Uncategorized'}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.sold}</TableCell>
                          <TableCell>{item.stock}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No sales data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Category Analysis Report */}
      {activeReport === "categories" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Value by Category</CardTitle>
                <CardDescription>Current inventory value breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="totalValue"
                          nameKey="category"
                          label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [formatCurrency(value), "Value"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Sales revenue vs. current stock value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryBreakdown}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any, name: any) => {
                            if (name === "revenue" || name === "totalValue") {
                              return [formatCurrency(value), name === "revenue" ? "Sales Revenue" : "Stock Value"];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="totalValue" fill="#8884d8" name="Stock Value" />
                        <Bar dataKey="revenue" fill="#10b981" name="Sales Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Category analysis as of {new Date().toLocaleDateString()}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Product Count</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead className="text-right">Sales Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryBreakdown.length > 0 ? (
                    categoryBreakdown.map((category, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>{category.count}</TableCell>
                        <TableCell>{category.totalStock}</TableCell>
                        <TableCell>{formatCurrency(category.totalValue)}</TableCell>
                        <TableCell>{category.sold}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.revenue)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No category data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default InventoryReports;
