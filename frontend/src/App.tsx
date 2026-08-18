import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Github } from 'lucide-react';
import { ToastProvider } from '@/components/ui/Toast';
import { useLenis } from '@/hooks/useLenis';
import { useRepoAnalysis } from '@/hooks/useRepoAnalysis';
import { Button } from '@/components/ui/Button';

import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { DemoStrip } from '@/components/landing/DemoStrip';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SocialProof } from '@/components/landing/SocialProof';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

import { SearchBar } from '@/components/dashboard/SearchBar';
import { Loading } from '@/components/dashboard/Loading';
import { Dashboard } from '@/components/dashboard/Dashboard';

type View = 'landing' | 'app';

function AppInner() {
  const [view, setView] = useState<View>('landing');
  const [pendingRepo, setPendingRepo] = useState<string>('');
  const { result, run, reset } = useRepoAnalysis();

  // Lenis only on the landing page (dashboard uses native scroll for sticky search)
  useLenis(view === 'landing');

  const launch = useCallback((repo?: string) => {
    const r = (repo || '').trim();
    setPendingRepo(r || 'facebook/react');
    setView('app');
    if (r) run(r);
    else run('facebook/react');
  }, [run]);

  const goHome = useCallback(() => {
    setView('landing');
    reset();
    window.scrollTo({ top: 0 });
  }, [reset]);

  const analyze = useCallback((repo: string) => {
    setPendingRepo(repo);
    run(repo);
  }, [run]);

  // scroll to top when entering app
  useEffect(() => {
    if (view === 'app') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  return (
    <div className="min-h-screen bg-cream-100 text-charcoal-800">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <Navbar onLaunch={() => launch()} />
            <Hero onLaunch={launch} />
            <DemoStrip />
            <Features />
            <HowItWorks />
            <SocialProof onLaunch={launch} />
            <FinalCTA onLaunch={launch} />
            <Footer />
          </motion.main>
        ) : (
          <motion.main
            key="app"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SearchBar onAnalyze={analyze} onHome={goHome} initial={pendingRepo} />
            <AppBody result={result} pendingRepo={pendingRepo} onRetry={analyze} onRefresh={() => analyze(pendingRepo)} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppBody({
  result,
  pendingRepo,
  onRetry,
  onRefresh,
}: {
  result: ReturnType<typeof useRepoAnalysis>['result'];
  pendingRepo: string;
  onRetry: (r: string) => void;
  onRefresh: () => void;
}) {
  if (result.status === 'loading') return <Loading repo={pendingRepo} />;
  if (result.status === 'error')
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-500/10 text-coral-500 mx-auto mb-5">
          <AlertTriangle className="w-7 h-7" />
        </span>
        <h2 className="font-display text-2xl font-semibold text-charcoal-900">Couldn’t analyze that repo</h2>
        <p className="mt-2 text-charcoal-700/70">{result.error}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="outline" onClick={() => onRetry(pendingRepo)}>Try again</Button>
          <Button onClick={() => onRetry('facebook/react')} leftIcon={<Github className="w-4 h-4" />}>Try facebook/react</Button>
        </div>
      </div>
    );
  if (result.status === 'success' && result.data)
    return <Dashboard data={result.data} onRefresh={onRefresh} refreshing={false} />;

  // idle empty state
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-forest-50 text-forest-500 mx-auto mb-5">
        <Github className="w-7 h-7" />
      </span>
      <h2 className="font-display text-2xl font-semibold text-charcoal-900">Search for a repo to begin</h2>
      <p className="mt-2 text-charcoal-700/70">Enter any owner/repo in the bar above — or try a popular one.</p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {['facebook/react', 'vuejs/core', 'vercel/next.js'].map((r) => (
          <Button key={r} variant="outline" size="sm" onClick={() => onRetry(r)} rightIcon={<ArrowRight className="w-4 h-4" />}>
            {r}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
