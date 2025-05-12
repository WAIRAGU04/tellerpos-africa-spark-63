
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isCustomRange: boolean;
  setIsCustomRange: (isCustom: boolean) => void;
}

const defaultDateRange = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
  endDate: new Date()
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};

export const DateRangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  
  const value = {
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange
  };
  
  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
};
