import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-forest-500 text-cream-100 hover:bg-forest-600 shadow-soft hover:shadow-lift',
  secondary: 'bg-amber-300 text-charcoal-900 hover:bg-amber-400 shadow-soft hover:shadow-lift',
  ghost: 'text-charcoal-800 hover:bg-cream-200/70',
  outline: 'border border-forest-300 text-forest-600 hover:bg-forest-50 bg-cream-100/40',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = 'primary', size = 'md', leftIcon, rightIcon, className = '', children, ...rest }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className={`inline-flex items-center justify-center font-semibold transition-colors duration-200 select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </motion.button>
  ),
);
Button.displayName = 'Button';
