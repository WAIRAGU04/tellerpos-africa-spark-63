
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReportExportProps {
  data: any[];
  filename: string;
}

const ReportExport: React.FC<ReportExportProps> = ({ data, filename }) => {
  const exportToCSV = () => {
    try {
      if (!data.length) {
        toast({
          title: "No data to export",
          description: "There is no data available to export",
          variant: "destructive"
        });
        return;
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV rows
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Handle commas, quotes and special characters
          const escapedValue = value === null || value === undefined ? '' : 
                             typeof value === 'object' ? JSON.stringify(value).replace(/"/g, '""') : 
                             String(value).replace(/"/g, '""');
          return `"${escapedValue}"`;
        });
        csvContent += values.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${filename} exported to CSV successfully`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive"
      });
    }
  };
  
  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export will be available in a future update",
    });
  };
  
  const exportToExcel = () => {
    toast({
      title: "Excel Export",
      description: "Excel export will be available in a future update",
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Export to CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Export to Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Export to PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReportExport;
