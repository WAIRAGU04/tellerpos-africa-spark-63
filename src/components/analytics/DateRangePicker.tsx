
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const predefinedRanges = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

const DateRangePicker: React.FC = () => {
  const { dateRange, setDateRange, isCustomRange, setIsCustomRange } = useDateRange();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("last30days");
  
  const handleRangeSelect = (value: string) => {
    setSelectedRange(value);
    
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (value) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date();
        setIsCustomRange(false);
        break;
      case "yesterday":
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(today);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        setIsCustomRange(false);
        break;
      case "last7days":
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        setIsCustomRange(false);
        break;
      case "last30days":
        start = new Date(today);
        start.setDate(start.getDate() - 30);
        setIsCustomRange(false);
        break;
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        setIsCustomRange(false);
        break;
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        setIsCustomRange(false);
        break;
      case "custom":
        setIsCustomRange(true);
        return;
    }
    
    setDateRange({ startDate: start, endDate: end });
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setDateRange({ ...dateRange, startDate: date });
    setStartOpen(false);
    setTimeout(() => setEndOpen(true), 100);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setDateRange({ ...dateRange, endDate: date });
    setEndOpen(false);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
      <div className="w-full md:w-auto">
        <Select value={selectedRange} onValueChange={handleRangeSelect}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            {predefinedRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isCustomRange && (
        <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.startDate, "PP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.startDate}
                onSelect={handleStartDateSelect}
                initialFocus
                disabled={(date) => date > new Date() || date > dateRange.endDate}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <span className="hidden md:inline">to</span>
          
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.endDate, "PP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.endDate}
                onSelect={handleEndDateSelect}
                initialFocus
                disabled={(date) => date > new Date() || date < dateRange.startDate}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
