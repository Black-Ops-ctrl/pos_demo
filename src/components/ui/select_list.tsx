import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining class names

interface SelectListProps {
  options: { value: string; label: string; icon?: React.ElementType }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  iconClassName?: string;
}

const SelectList: React.FC<SelectListProps> = ({ options, value, onValueChange, className, iconClassName }) => {
  return (
    <div className={cn("inline-flex items-center justify-center rounded-md bg-white p-1 text-muted-foreground", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            value === option.value && "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm",
          )}
        >
          {option.icon && React.createElement(option.icon, { className: cn("h-4 w-4 mr-2", iconClassName) })}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SelectList;