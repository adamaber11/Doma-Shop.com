import { useContext } from 'react';
import { QuickViewContext, QuickViewContextType } from '@/context/QuickViewProvider';

export const useQuickView = (): QuickViewContextType => {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
};
