import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  as?: 'a' | 'button';
  href?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  as = 'button',
  href,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-golden-500 text-navy-500 hover:bg-golden-400 focus:ring-golden-500 shadow-md hover:shadow-lg hover:scale-105 active:scale-95',
    secondary: 'bg-transparent border-2 border-navy-500 text-navy-500 hover:bg-navy-50 focus:ring-navy-500'
  };
  
  const sizeClasses = {
    sm: 'px-6 py-2.5 text-sm min-h-[44px]',
    md: 'px-8 py-3 text-base min-h-[52px]',
    lg: 'px-10 py-4 text-lg min-h-[56px]'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
  
  if (as === 'a' && href) {
    return (
      <a
        href={href}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }
  
  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

