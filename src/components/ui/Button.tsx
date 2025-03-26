
import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled,
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none",
        {
          // Variants
          "bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-primary/30": variant === 'primary',
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary/30": variant === 'secondary',
          "border border-border bg-transparent hover:bg-muted focus-visible:ring-primary/30": variant === 'outline',
          "bg-transparent hover:bg-muted focus-visible:ring-primary/30": variant === 'ghost',
          "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto": variant === 'link',
          
          // Sizes
          "h-9 px-4 rounded-md text-sm": size === 'sm',
          "h-10 px-5 rounded-md text-sm": size === 'default',
          "h-12 px-8 rounded-md text-base": size === 'lg',
          "h-10 w-10 rounded-md": size === 'icon',
        },
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
      <span className={cn("flex items-center gap-2", { "opacity-0": isLoading })}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </button>
  );
};

export default Button;
