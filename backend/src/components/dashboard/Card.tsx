import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TiltCard } from '@/components/rv/TiltCard';

interface CardProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Card({ title, subtitle, right, children, className = '', delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <TiltCard intensity={5} className={`h-full rounded-3xl bg-cream-50/80 border border-cream-300 p-5 sm:p-6 shadow-soft hover:shadow-lift transition-shadow duration-300 ${className}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-charcoal-900">{title}</h3>
            {subtitle && <p className="text-xs text-charcoal-700/55 mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
        {children}
      </TiltCard>
    </motion.div>
  );
}
