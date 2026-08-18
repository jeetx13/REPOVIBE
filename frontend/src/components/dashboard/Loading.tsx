import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Progress3D } from '@/components/three/Progress3D';

const STEPS = [
  'Resolving repository…',
  'Fetching commit history…',
  'Reading issue backlog…',
  'Analyzing contributor graph…',
  'Computing health score…',
];

interface LoadingProps {
  repo: string;
}

export function Loading({ repo }: LoadingProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i + 1), 350 + i * 420));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="font-mono text-sm text-charcoal-700/60">{repo}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-charcoal-900">Analyzing…</h2>
      </motion.div>

      <div className="relative h-64 sm:h-72">
        <Suspense fallback={<div className="w-full h-full rounded-full bg-forest-100/40 animate-pulse mx-auto" />}>
          <Progress3D className="absolute inset-0" />
        </Suspense>
      </div>

      <ul className="mt-10 max-w-md mx-auto space-y-2.5">
        {STEPS.map((s, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <li key={s}>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: done || active ? 1 : 0.35, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 text-sm"
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-forest-500" />
                  ) : active ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-amber-300 border-t-transparent"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-cream-300" />
                  )}
                  <span className={done ? 'text-charcoal-900 font-medium' : active ? 'text-charcoal-800 font-semibold' : 'text-charcoal-700/50'}>
                    {s}
                  </span>
                </motion.div>
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
