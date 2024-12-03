import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300';

  const getVariantStyles = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-text-base)] ';
      case 'secondary':
        return 'bg-[var(--theme-secondary)] hover:bg-[var(--theme-secondary-hover)] text-[var(--theme-text-base)]';
      case 'tertiary':
        return 'bg-transparent hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text-base)] ';
      case 'quaternary':
        return 'bg-transparent text-[var(--theme-text-base)] hover:text-[var(--theme-text-base)] hover:bg-[var(--theme-surface-hover)]';
      default:
        return '';
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseStyles}
        ${getVariantStyles(variant)}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;
