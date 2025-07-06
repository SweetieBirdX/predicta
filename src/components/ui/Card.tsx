import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'dark' | 'gradient';
  hover?: boolean;
}

export function Card({ children, className = '', variant = 'default', hover = true }: CardProps) {
  const variantClasses = {
    default: 'glass border border-white/20',
    glass: 'glass border border-white/30',
    dark: 'glass-dark border border-white/10',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm',
  };

  const hoverClass = hover ? 'card-hover' : '';

  return (
    <div className={`rounded-2xl shadow-xl ${variantClasses[variant]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`flex flex-col space-y-2 p-6 pb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={`text-2xl font-bold leading-none tracking-tight text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardProps) {
  return (
    <p className={`text-sm text-white/70 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={`flex items-center p-6 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}
