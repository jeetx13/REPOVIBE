import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DEMO_REPOS } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const gradeColor = (s: number) => (s >= 90 ? '#2A5238' : s >= 78 ? '#3B6E4B' : s >= 64 ? '#D98A2B' : '#D85A3E');

const examples = [
  { repo: 'facebook/react', score: 92 },
  { repo: 'vuejs/core', score: 88 },
  { repo: 'vercel/next.js', score: 90 },
  { repo: 'tailwindlabs/tailwindcss', score: 85 },
  { repo: 'vitejs/vite', score: 87 },
  { repo: 'sveltejs/kit', score: 84 },
  { repo: 'facebook/react', score: 92 },
  { repo: 'vuejs/core', score: 88 },
  { repo: 'vercel/next.js', score: 90 },
  { repo: 'tailwindlabs/tailwindcss', score: 85 },
  { repo: 'vitejs/vite', score: 87 },
  { repo: 'sveltejs/kit', score: 84 },
];

interface SocialProofProps {
  onLaunch: (repo: string) => void;
}

export function SocialProof({ onLaunch }: SocialProofProps) {
  const toast = useToast();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="examples" className="relative py-24 sm:py-28 bg-forest-600 text-cream-100 overflow-hidden border-t border-forest-400/40">
      <div className="absolute inset-0 opacity-10 bg-grain" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-amber-200 mb-3">In the wild</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream-50 text-balance">
            See how the big ones score.
          </h2>
          <p className="mt-4 text-cream-200/80 text-lg">
            Real repos, real signals. Hover any card and jump straight to a full analysis.
          </p>
        </motion.div>
      </div>

      {/* marquee */}
      <div className="relative mt-12 overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
        <div className="flex gap-4 animate-marquee w-max">
          {examples.map((ex, i) => (
            <button
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onLaunch(ex.repo)}
              className={`group flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-300 ${
                hovered === i ? 'bg-forest-500 border-amber-300/40 scale-[1.03]' : 'bg-forest-700/60 border-forest-400/30'
              }`}
            >
              <div className="text-left">
                <p className="font-mono text-sm text-cream-100">{ex.repo}</p>
                <p className="text-xs text-cream-200/50 mt-0.5">composite score</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-3xl font-semibold" style={{ color: gradeColor(ex.score) === '#D85A3E' ? '#F4C97A' : '#F4C97A' }}>
                  {ex.score}
                </span>
                <ArrowUpRight className="w-4 h-4 text-cream-200/40 group-hover:text-amber-200 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 mt-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {DEMO_REPOS.map((r) => (
            <Button
              key={r.key}
              variant="secondary"
              size="sm"
              onClick={() => {
                onLaunch(r.repo);
                toast({ kind: 'info', title: `Analyzing ${r.name}`, body: 'Jumping to the dashboard…' });
              }}
            >
              Analyze {r.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
