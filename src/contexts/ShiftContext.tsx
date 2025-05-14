
// This file is kept for backwards compatibility
// It re-exports all the components from the new structure
export { ShiftProvider, ShiftContext, useShift } from './shift';
export type { ShiftContextType } from './shift/shiftContextTypes';
export type { PaymentMethod } from '@/types/pos';
export { AnalyticsProvider, useAnalytics } from './AnalyticsContext';
