import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Github, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchRecentRepos } from '@/services/api';

interface SearchBarProps {
  onAnalyze: (repo: string) => void;
  onHome: () => void;
  initial?: string;
}

const SUGGESTIONS = ['facebook/react', 'vuejs/core', 'vercel/next.js', 'tailwindlabs/tailwindcss', 'vitejs/vite'];

interface RecentRepo {
  fullName: string;
  analyzedCount: number;
  healthScore: number;
  healthGrade: string;
}

export function SearchBar({ onAnalyze, onHome, initial = '' }: SearchBarProps) {
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<RecentRepo[]>([]);

  useEffect(() => {
    fetchRecentRepos().then(setRecent).catch(() => setRecent([]));
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (v) onAnalyze(v);
  };

  return (
    <div className="sticky top-0 z-40 glass border-b border-cream-300/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          onClick={onHome}
          className="flex items-center gap-2 text-charcoal-800 hover:text-forest-600 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-display text-lg font-semibold">
            Repo<span className="text-forest-500">Vibe</span>
          </span>
        </button>

        <form onSubmit={submit} className="relative flex-1 max-w-xl">
          <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700/50" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="owner/repo  ·  facebook/react"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-cream-50/90 border border-cream-300 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 focus:ring-forest-300 transition-all"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-700/40 hover:text-charcoal-800"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {focused && (
            <motion.ul
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 glass shadow-lift rounded-xl border border-cream-300/60 overflow-hidden"
            >
              {recent.length > 0 && (
                <li className="px-4 pt-2.5 pb-1 text-[10px] font-bold tracking-widest uppercase text-charcoal-700/40 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recently analyzed
                </li>
              )}
              {recent.map((r) => (
                <li key={r.fullName}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setValue(r.fullName);
                      onAnalyze(r.fullName);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-mono text-charcoal-700 hover:bg-cream-200/60 flex items-center gap-2"
                  >
                    <span className={`w-7 text-xs font-bold text-center rounded ${r.healthGrade <= 'B' ? 'text-forest-600' : r.healthGrade <= 'C' ? 'text-amber-600' : 'text-red-500'}`}>
                      {r.healthGrade}
                    </span>
                    {r.fullName}
                  </button>
                </li>
              ))}
              {recent.length > 0 && <li className="border-t border-cream-300/40" />}
              <li className="px-4 pt-2.5 pb-1 text-[10px] font-bold tracking-widest uppercase text-charcoal-700/40">
                Try one of these
              </li>
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setValue(s);
                      onAnalyze(s);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-mono text-charcoal-700 hover:bg-cream-200/60 flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-charcoal-700/40" />
                    {s}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </form>

        <Button type="submit" onClick={submit} size="sm" leftIcon={<Search className="w-4 h-4" />}>
          Analyze
        </Button>
      </div>
    </div>
  );
}
