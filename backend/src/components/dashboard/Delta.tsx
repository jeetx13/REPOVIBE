import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeltaProps {
  value: number;
  invert?: boolean; // when true, down is good (e.g. issue count, merge time)
  suffix?: string;
}

export function Delta({ value, invert = false, suffix = '' }: DeltaProps) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-700/50">
        <Minus className="w-3.5 h-3.5" /> no change
      </span>
    );
  }
  const up = value > 0;
  const good = invert ? !up : up;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        good ? 'bg-forest-50 text-forest-600' : 'bg-coral-500/10 text-coral-500'
      }`}
    >
      {up ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
      {Math.abs(value)}
      {suffix}
      <span className="font-normal opacity-70">vs last</span>
    </motion.span>
  );
}
