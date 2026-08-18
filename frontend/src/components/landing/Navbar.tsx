import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/hooks/useLenis';

interface NavbarProps {
  onLaunch: () => void;
}

const links = [
  { label: 'Features', id: 'features' },
  { label: 'How it works', id: 'how' },
  { label: 'Examples', id: 'examples' },
];

export function Navbar({ onLaunch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.nav
            key={scrolled ? 'solid' : 'clear'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={`mt-3 flex items-center justify-between rounded-2xl px-4 sm:px-5 py-3 transition-colors duration-300 ${
              scrolled ? 'glass shadow-soft border border-cream-300/60' : 'bg-transparent'
            }`}
          >
            <button onClick={() => go('top')} className="flex items-center gap-2.5 group">
              <motion.span
                whileHover={{ rotate: 20, scale: 1.1 }}
                className="grid place-items-center w-9 h-9 rounded-xl bg-forest-500 text-cream-100"
              >
                <Activity className="w-5 h-5" strokeWidth={2.4} />
              </motion.span>
              <span className="font-display text-xl font-semibold tracking-tight text-charcoal-900">
                Repo<span className="text-forest-500">Vibe</span>
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="px-3.5 py-2 text-sm font-medium text-charcoal-700 hover:text-forest-600 rounded-lg hover:bg-cream-200/60 transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onLaunch}>
                Sign in
              </Button>
              <Button size="sm" onClick={onLaunch} rightIcon={<span className="text-base leading-none">→</span>}>
                Launch app
              </Button>
            </div>

            <button className="md:hidden p-2 text-charcoal-800" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </motion.nav>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mx-4 sm:mx-6 mt-2 glass shadow-lift rounded-2xl border border-cream-300/60 overflow-hidden"
          >
            <div className="flex flex-col p-3">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="text-left px-4 py-3 text-sm font-medium text-charcoal-700 hover:bg-cream-200/60 rounded-xl"
                >
                  {l.label}
                </button>
              ))}
              <Button className="mt-2" onClick={onLaunch}>
                Launch app
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
