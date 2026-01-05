'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-primary to-primary-dark text-white
      hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5
      focus:ring-primary
    `,
    secondary: `
      bg-gradient-to-r from-secondary to-teal-600 text-white
      hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5
      focus:ring-secondary
    `,
    outline: `
      border-2 border-primary text-primary bg-transparent
      hover:bg-primary/5 hover:-translate-y-0.5
      focus:ring-primary
    `,
    ghost: `
      text-slate-600 bg-transparent
      hover:bg-slate-100 hover:text-slate-900
      focus:ring-slate-400
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </motion.button>
  );
}


