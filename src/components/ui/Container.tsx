
import React from 'react';
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  size?: 'default' | 'sm' | 'lg' | 'full';
}

const Container = ({
  children,
  as: Component = 'div',
  size = 'default',
  className,
  ...props
}: ContainerProps) => {
  return (
    <Component
      className={cn(
        "mx-auto px-4 sm:px-6 w-full",
        {
          'max-w-7xl': size === 'default',
          'max-w-5xl': size === 'sm',
          'max-w-screen-2xl': size === 'lg',
          'max-w-none': size === 'full',
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
