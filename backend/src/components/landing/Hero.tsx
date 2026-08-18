import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Sparkles } from 'lucide-react';
import { Button } from '@/components/rv/Button';
import { RepoCore } from '@/components/three/RepoCore';
import { LowPolyBg } from '@/components/three/LowPolyBg';
import { useToast } from '@/components/rv/Toast';
import { scrollToSection } from '@/hooks/useLenis';

interface HeroProps {
  onLaunch: (repo?: string) => void;
}

export function Hero({ onLaunch }: HeroProps) {
  const [repo, setRepo] = useState('');
  const toast = useToast();
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = repo.trim() || 'facebook/react';
    onLaunch(val);
  };

  return (
    <section id="top" className="relative min-h-[100svh] flex items-center pt-28 pb-16 overflow-hidden">
      {/* low-poly drifting bg */}
      <div className="absolute inset-0 -z-10 opacity-70">
        <LowPolyBg />
      </div>
      <div className="absolute inset-0 -z-10 bg-grain" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-50/40 via-transparent to-cream-100" />

      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
        {/* Left: copy + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50/80 px-3.5 py-1.5 text-xs font-semibold text-forest-600 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            The pulse of any repo, in seconds
          </motion.div>

          <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-semibold leading-[1.05] tracking-tight text-charcoal-900 text-balance">
            Feel the{' '}
            <span className="relative inline-block">
              <span className="text-forest-500">vibe</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute -bottom-1 left-0 right-0 h-1.5 bg-amber-300 rounded-full origin-left"
              />
            </span>{' '}
            of any GitHub repo.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-charcoal-700/80 leading-relaxed">
            RepoVibe turns raw commit history, issue backlog, and contributor dynamics into one
            honest health score — with a dashboard that actually explains why.
          </p>

          {/* Analyze form */}
          <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
            <div className="relative flex-1">
              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-700/50" />
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="owner/repo  ·  facebook/react"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-cream-50/80 border border-cream-300 text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-transparent transition-all shadow-soft"
              />
            </div>
            <Button type="submit" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Analyze
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-charcoal-700/60">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" /> No sign-up to try
            </span>
            <button
              onClick={() => {
                toast({ kind: 'info', title: 'Live demo', body: 'Scroll down to see a real health-score dial in action.' });
                scrollToSection('demo');
              }}
              className="underline decoration-amber-300 underline-offset-4 hover:text-forest-600 transition-colors"
            >
              See the live demo
            </button>
          </div>
        </motion.div>

        {/* Right: 3D repo core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[360px] sm:h-[460px] lg:h-[560px] perspective"
        >
          <Suspense fallback={<div className="w-full h-full rounded-full bg-forest-100/40 animate-pulse" />}>
            <RepoCore reduced={reduced} className="absolute inset-0" />
          </Suspense>
          {/* floating labels — positioned to avoid overlap with each other */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 right-0 sm:right-4 glass shadow-soft rounded-xl px-3 py-2 text-xs font-mono text-forest-600 border border-cream-300/60 z-10"
          >
            + 248 commits / wk
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-2 left-0 sm:left-4 glass shadow-soft rounded-xl px-3 py-2 text-xs font-mono text-amber-500 border border-cream-300/60 z-10"
          >
            bus factor · 4
          </motion.div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.button
        onClick={() => scrollToSection('demo')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-charcoal-700/50 hover:text-forest-600 transition-colors"
        aria-label="Scroll down"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="flex flex-col items-center gap-1">
          <span className="text-[11px] tracking-widest uppercase">Scroll</span>
          <span className="text-lg leading-none">↓</span>
        </motion.div>
      </motion.button>

      {/* bottom fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cream-300 to-transparent" />
    </section>
  );
}
