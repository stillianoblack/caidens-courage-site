import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  as = 'button',
  href,
  onClick,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = variant === 'primary' ? 'btn--primary' : 'btn--secondary';
  const sizeClasses = size === 'sm' ? 'btn--sm' : size === 'lg' ? 'btn--lg' : 'btn--md';
  const widthClasses = fullWidth ? 'btn--full' : '';
  const disabledClasses = disabled ? 'btn--disabled' : '';
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${className}`.trim();

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={combinedClasses}
        aria-disabled={disabled}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

