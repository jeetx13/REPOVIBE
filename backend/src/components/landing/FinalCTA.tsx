import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/rv/Button';
import { RepoCore } from '@/components/three/RepoCore';
import { useToast } from '@/components/rv/Toast';

interface FinalCTAProps {
  onLaunch: (repo?: string) => void;
}

export function FinalCTA({ onLaunch }: FinalCTAProps) {
  const [repo, setRepo] = useState('');
  const toast = useToast();
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch(repo.trim() || 'facebook/react');
  };

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden border-t border-forest-200/50">
      <div className="absolute inset-0 bg-gradient-to-b from-cream-100 to-cream-200/60" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-[2rem] bg-forest-50/60 border border-forest-200 shadow-lift overflow-hidden">
          <div className="grid md:grid-cols-[1.3fr_1fr] items-center">
            <div className="p-8 sm:p-12">
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-4xl sm:text-5xl font-semibold text-charcoal-900 text-balance"
              >
                Stop guessing. Start diagnosing.
              </motion.h2>
              <p className="mt-4 text-charcoal-700/80 text-lg max-w-md">
                Run your first analysis free — no account, no credit card. Just a repo name.
              </p>

              <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-700/50" />
                  <input
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="owner/repo"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-cream-50 border border-cream-300 text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 focus:ring-forest-300 transition-all"
                  />
                </div>
                <Button type="submit" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Analyze now
                </Button>
              </form>

              <button
                onClick={() => toast({ kind: 'success', title: 'Saved to favorites', body: 'We will keep an eye on this repo for you.' })}
                className="mt-4 text-sm text-forest-600 hover:text-forest-700 underline decoration-amber-300 underline-offset-4"
              >
                Or save a repo to your watchlist
              </button>
            </div>

            {/* reactive 3D element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-64 md:h-full min-h-[260px]"
            >
              <Suspense fallback={null}>
                <RepoCore reduced={reduced} className="absolute inset-0" />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
