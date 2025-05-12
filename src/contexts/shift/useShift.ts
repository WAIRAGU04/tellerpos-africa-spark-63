
import { useContext } from 'react';
import { ShiftContext } from './ShiftProvider';
import { ShiftContextType } from './shiftContextTypes';

export const useShift = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};
