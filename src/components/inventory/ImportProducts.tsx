
import React, { useState } from 'react';
import { ImportProductRow, Product, UnitOfMeasurement, InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUp, AlertTriangle, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ImportProductsProps {
  onImport: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'type'>[]) => void;
  onCancel: () => void;
  existingItems?: InventoryItem[]; // Add this to check for duplicates
}

const ImportProducts = ({ onImport, onCancel, existingItems = [] }: ImportProductsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ImportProductRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      parseFile(e.target.files[0]);
    }
  };
  
  const parseFile = (file: File) => {
    setIsLoading(true);
    setErrors([]);
    setDuplicateWarnings([]);
    setParsedProducts([]);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        
        // Check if the file is empty
        if (rows.length <= 1) {
          setErrors(['The file appears to be empty or improperly formatted.']);
          setIsLoading(false);
          return;
        }
        
        // Extract headers and validate
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'price', 'sku', 'quantity', 'unitofmeasurement'];
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
          setIsLoading(false);
          return;
        }
        
        // Parse data rows
        const products: ImportProductRow[] = [];
        const rowErrors: string[] = [];
        const duplicates: string[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          // Skip empty rows
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',').map(v => v.trim());
          
          // Check if we have enough values
          if (values.length < requiredHeaders.length) {
            rowErrors.push(`Row ${i} has missing values`);
            continue;
          }
          
          // Create a product object
          const product: Partial<ImportProductRow> = {};
          
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = values[j] || '';
            
            switch (header) {
              case 'name':
                product.name = value;
                break;
              case 'description':
                product.description = value;
                break;
              case 'price':
                product.price = parseFloat(value) || 0;
                break;
              case 'sku':
                product.sku = value;
                break;
              case 'barcode':
                product.barcode = value || undefined;
                break;
              case 'quantity':
                product.quantity = parseInt(value, 10) || 0;
                break;
              case 'unitofmeasurement':
                product.unitOfMeasurement = value as UnitOfMeasurement;
                break;
              case 'reorderlevel':
                product.reorderLevel = parseInt(value, 10) || 5;
                break;
              case 'costprice':
                product.costPrice = parseFloat(value) || 0;
                break;
            }
          }
          
          // Validate required fields
          if (!product.name || product.price === undefined || !product.sku || product.quantity === undefined || !product.unitOfMeasurement) {
            rowErrors.push(`Row ${i} has missing required values`);
            continue;
          }
          
          // Check for duplicates in existing inventory
          const duplicateInInventory = existingItems.find(item => 
            item.type === 'product' && 
            ((item as Product).sku === product.sku || item.name.toLowerCase() === product.name?.toLowerCase())
          );
          
          if (duplicateInInventory) {
            duplicates.push(`Row ${i}: "${product.name}" (SKU: ${product.sku}) already exists in inventory`);
          }
          
          // Check for duplicates within the import file
          const duplicateInImport = products.find(p => 
            p.sku === product.sku || p.name.toLowerCase() === product.name?.toLowerCase()
          );
          
          if (duplicateInImport) {
            duplicates.push(`Row ${i}: "${product.name}" (SKU: ${product.sku}) appears multiple times in the import file`);
          }
          
          // Add defaults if needed
          product.description = product.description || '';
          product.reorderLevel = product.reorderLevel || 5;
          product.costPrice = product.costPrice || 0;
          
          products.push(product as ImportProductRow);
        }
        
        if (rowErrors.length > 0) {
          setErrors(rowErrors);
        }
        
        if (duplicates.length > 0) {
          setDuplicateWarnings(duplicates);
        }
        
        if (products.length === 0) {
          setErrors(prev => [...prev, 'No valid products found in the file.']);
          setIsLoading(false);
          return;
        }
        
        setParsedProducts(products);
        setIsLoading(false);
      } catch (error) {
        setErrors(['Failed to parse the file. Please check the format.']);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setErrors(['Error reading the file.']);
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    // Convert to the expected format
    const validRows = parsedProducts.filter((row) => row.name && row.price && row.sku && row.quantity && row.unitOfMeasurement);
    const productsToImport = validRows.map((row) => ({
      name: row.name,
      description: row.description || '',
      price: Number(row.price),
      sku: row.sku,
      barcode: row.barcode || '',
      quantity: Number(row.quantity),
      unitOfMeasurement: row.unitOfMeasurement as UnitOfMeasurement,
      reorderLevel: Number(row.reorderLevel),
      costPrice: Number(row.costPrice),
      category: row.category || '',
      stock: Number(row.quantity) // Add this line to map quantity to stock
    }));
    
    onImport(productsToImport);
  };
  
  const removeProduct = (index: number) => {
    setParsedProducts(prev => prev.filter((_, i) => i !== index));
    
    // Clean up any warnings related to the removed product
    const removedProduct = parsedProducts[index];
    if (removedProduct) {
      setDuplicateWarnings(prev => 
        prev.filter(warning => 
          !warning.includes(removedProduct.name) && !warning.includes(removedProduct.sku)
        )
      );
    }
  };
  
  const downloadTemplate = () => {
    // Create a simple CSV template
    const template = 'name,description,price,sku,barcode,quantity,unitOfMeasurement,reorderLevel,costPrice\nExample Product,Product Description,1000,SKU001,,10,pieces,5,800';
    
    // Create a Blob from the CSV string
    const blob = new Blob([template], { type: 'text/csv' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {!parsedProducts.length && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md">
            <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="mb-2 text-sm font-medium">Upload a CSV file with your products</p>
            <p className="mb-4 text-xs text-muted-foreground">
              The file should have columns for name, price, sku, quantity, and unitOfMeasurement at minimum
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="max-w-xs"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Don't have a template? 
            </p>
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center">
          <div className="w-10 h-10 border-t-4 border-tellerpos rounded-full animate-spin"></div>
        </div>
      )}
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {duplicateWarnings.length > 0 && (
        <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Duplicate Products Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {duplicateWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm font-medium">You may continue with import, but duplicate products will be added as new items.</p>
          </AlertDescription>
        </Alert>
      )}
      
      {parsedProducts.length > 0 && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Ready to Import</AlertTitle>
            <AlertDescription>
              Found {parsedProducts.length} products in the file. Review them below and click "Import" when ready.
            </AlertDescription>
          </Alert>
          
          <div className="border rounded-md overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(product.price)}
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.unitOfMeasurement}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        {parsedProducts.length > 0 ? (
          <>
            <Button variant="outline" onClick={() => {
              setParsedProducts([]);
              setSelectedFile(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={parsedProducts.length === 0}>
              Import {parsedProducts.length} Products
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImportProducts;
