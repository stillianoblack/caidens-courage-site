import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  as?: 'a' | 'button' | typeof Link;
  href?: string;
  to?: string;
  /** Optional left icon. Defaults to FocusFlame for primary buttons. Set to null to disable. */
  leftIconSrc?: string | null;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  as = 'button',
  href,
  to,
  leftIconSrc,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-golden-500 text-navy-500 hover:bg-golden-400 focus:ring-golden-500 shadow-md hover:shadow-lg hover:scale-105 active:scale-95',
    secondary: 'bg-transparent border-2 border-navy-500 text-navy-500 hover:bg-navy-50 focus:ring-navy-500 hover:border-navy-600'
  };
  
  const sizeClasses = {
    sm: 'px-6 py-2.5 text-sm h-11 md:h-11',
    md: 'px-8 py-3 text-base h-14 md:h-14',
    lg: 'px-10 py-4 text-lg h-14 md:h-14'
  };
  
  // Mobile: full-width on screens ≤768px, unless fullWidth prop is explicitly false
  // Tablet/Desktop: respect fullWidth prop or default to auto-width with consistent min-width for paired buttons
  const widthClass = fullWidth ? 'w-full' : 'w-full md:w-auto md:min-w-[260px]';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  const effectiveLeftIconSrc =
    variant === 'primary' ? (leftIconSrc === undefined ? '/images/icons/button_icon.svg' : leftIconSrc) : null;

  const contents =
    effectiveLeftIconSrc ? (
      <span className="inline-flex items-center justify-center gap-2">
        <img
          src={effectiveLeftIconSrc}
          alt=""
          aria-hidden="true"
          className="h-5 w-auto object-contain flex-shrink-0"
          decoding="async"
        />
        <span>{children}</span>
      </span>
    ) : (
      children
    );
  
  // Handle React Router Link component - if to prop is provided and as is Link or not a string
  if (to) {
    if (as === Link || (typeof as !== 'string')) {
      return (
        <Link
          to={to}
          className={classes}
          {...(props as any)}
        >
          {contents}
        </Link>
      );
    }
  }
  
  // Internal paths: use Link for SPA navigation (no full document reload)
  if (href && href.startsWith('/')) {
    return (
      <Link
        to={href}
        className={classes}
        {...(props as any)}
      >
        {contents}
      </Link>
    );
  }
  // External links (https://, mailto:, etc.): keep as <a>
  if (as === 'a' && href) {
    return (
      <a
        href={href}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {contents}
      </a>
    );
  }
  
  return (
    <button
      className={classes}
      {...props}
    >
      {contents}
    </button>
  );
};

export default Button;

