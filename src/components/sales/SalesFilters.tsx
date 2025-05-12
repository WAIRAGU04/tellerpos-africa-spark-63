
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, Download, ArrowUpDown, Calendar as CalendarIcon, Grid, List } from "lucide-react";
import { format } from "date-fns";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface SalesFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: 'newest' | 'oldest';
  setSortOrder: (order: 'newest' | 'oldest') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  customerFilter: string;
  setCustomerFilter: (filter: string) => void;
  amountFilter: { min: string; max: string };
  setAmountFilter: (filter: { min: string; max: string }) => void;
  onExport: () => void;
}

const SalesFilters: React.FC<SalesFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  dateRange,
  setDateRange,
  customerFilter,
  setCustomerFilter,
  amountFilter,
  setAmountFilter,
  onExport
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by receipt/invoice number, item or customer..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-2">
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Sales</h4>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Date Range</h5>
                <div className="grid gap-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      From
                      {dateRange.from && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 font-normal" 
                          onClick={() => setDateRange({ ...dateRange, from: undefined })}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, 'PPP') : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      To
                      {dateRange.to && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 font-normal" 
                          onClick={() => setDateRange({ ...dateRange, to: undefined })}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, 'PPP') : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  placeholder="Filter by customer"
                  value={customerFilter}
                  onChange={e => setCustomerFilter(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={amountFilter.min}
                    onChange={e => setAmountFilter({ ...amountFilter, min: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={amountFilter.max}
                    onChange={e => setAmountFilter({ ...amountFilter, max: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateRange({ from: undefined, to: undefined });
                    setCustomerFilter('');
                    setAmountFilter({ min: '', max: '' });
                  }}
                >
                  Reset
                </Button>
                <Button onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        
        <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={onExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default SalesFilters;
