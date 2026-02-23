import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ColorfulTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface ColorfulTabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface ColorfulTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  activeValue?: string;
  className?: string;
}

interface ColorfulTabsContentProps {
  value: string;
  children: React.ReactNode;
  activeValue?: string;
  className?: string;
}

const ColorfulTabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const ColorfulTabs = React.forwardRef<HTMLDivElement, ColorfulTabsProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => {
    return (
      <ColorfulTabsContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn('w-full', className)}
          {...props}
        >
          {children}
        </div>
      </ColorfulTabsContext.Provider>
    );
  }
);
ColorfulTabs.displayName = 'ColorfulTabs';

const ColorfulTabsList = React.forwardRef<HTMLDivElement, ColorfulTabsListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-gray-50 to-white backdrop-blur-sm p-1.5 shadow-xl border border-gray-200/50 overflow-x-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ColorfulTabsList.displayName = 'ColorfulTabsList';

const getTabColors = (value: string) => {
  const colorMap: Record<string, { bg: string; hover: string; light: string; text: string; gradient: string }> = {
    overview: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', gradient: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    quotations: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', gradient: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    orders: { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-50', text: 'text-red-700', gradient: 'bg-gradient-to-r from-red-500 to-red-600' },
    invoices: { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-50', text: 'text-green-700', gradient: 'bg-gradient-to-r from-green-500 to-green-600' },
    pos: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', light: 'bg-orange-50', text: 'text-orange-700', gradient: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    reports: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', light: 'bg-yellow-50', text: 'text-yellow-700', gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    dashboard: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', gradient: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    sales: { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-50', text: 'text-red-700', gradient: 'bg-gradient-to-r from-red-500 to-red-600' },
    inventory: { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-50', text: 'text-green-700', gradient: 'bg-gradient-to-r from-green-500 to-green-600' },
    purchasing: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', light: 'bg-orange-50', text: 'text-orange-700', gradient: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    hr: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', gradient: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    accounting: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-700', gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    crm: { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', light: 'bg-pink-50', text: 'text-pink-700', gradient: 'bg-gradient-to-r from-pink-500 to-pink-600' },
    security: { bg: 'bg-gray-500', hover: 'hover:bg-gray-600', light: 'bg-gray-50', text: 'text-gray-700', gradient: 'bg-gradient-to-r from-gray-500 to-gray-600' },
    balance: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', gradient: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    ledger: { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-50', text: 'text-green-700', gradient: 'bg-gradient-to-r from-green-500 to-green-600' },
    journal: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-700', gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    coa: { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-50', text: 'text-red-700', gradient: 'bg-gradient-to-r from-red-500 to-red-600' },
    more: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-700', gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
  };
  
  return colorMap[value] || colorMap.dashboard;
};

const ColorfulTabsTrigger = React.forwardRef<HTMLButtonElement, ColorfulTabsTriggerProps>(
  ({ value, children, icon: Icon, activeValue, className, ...props }, ref) => {
    const context = React.useContext(ColorfulTabsContext);
    if (!context) {
      throw new Error('ColorfulTabsTrigger must be used within ColorfulTabs');
    }
    
    const { value: contextValue, onValueChange } = context;
    const isActive = contextValue === value;
    const colorScheme = getTabColors(value);
    
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'transform hover:scale-105 active:scale-95 min-w-fit',
          isActive
            ? `${colorScheme.gradient} text-white shadow-lg shadow-${value}-500/25 border border-white/20 ring-2 ring-white/30`
            : `${colorScheme.light} ${colorScheme.text} hover:shadow-md border border-transparent hover:border-${value}-200`,
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {Icon && <Icon className={cn('h-4 w-4', children ? 'mr-2' : '')} />}
        {children}
      </button>
    );
  }
);
ColorfulTabsTrigger.displayName = 'ColorfulTabsTrigger';

const ColorfulTabsContent = React.forwardRef<HTMLDivElement, ColorfulTabsContentProps>(
  ({ value, children, className, activeValue, ...props }, ref) => {
    const context = React.useContext(ColorfulTabsContext);
    if (!context) {
      throw new Error('ColorfulTabsContent must be used within ColorfulTabs');
    }
    
    const { value: contextValue } = context;
    if (contextValue !== value) return null;
    
    return (
      <div
        ref={ref}
        className={cn(
          'mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'animate-in fade-in-50 slide-in-from-bottom-2 duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ColorfulTabsContent.displayName = 'ColorfulTabsContent';

export { ColorfulTabs, ColorfulTabsList, ColorfulTabsTrigger, ColorfulTabsContent };