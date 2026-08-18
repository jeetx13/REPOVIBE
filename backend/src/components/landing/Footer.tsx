import { Activity, Github, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '@/components/rv/Toast';
import { scrollToSection } from '@/hooks/useLenis';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', id: 'features' },
      { label: 'How it works', id: 'how' },
      { label: 'Examples', id: 'examples' },
      { label: 'Live demo', id: 'demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', id: 'top' },
      { label: 'Blog', id: 'top' },
      { label: 'Careers', id: 'top' },
      { label: 'Contact', id: 'top' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API docs', id: 'top' },
      { label: 'Pricing', id: 'top' },
      { label: 'Status', id: 'top' },
      { label: 'Changelog', id: 'top' },
    ],
  },
];

export function Footer() {
  const toast = useToast();

  return (
    <footer className="relative bg-cream-50 border-t border-cream-300 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-forest-500 text-cream-100">
                <Activity className="w-5 h-5" strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-semibold text-charcoal-900">
                Repo<span className="text-forest-500">Vibe</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-charcoal-700/70 max-w-xs leading-relaxed">
              The honest health check for any GitHub repository. Built for maintainers, contributors, and the curious.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Github, label: 'GitHub' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  onClick={() => toast({ kind: 'info', title: label, body: 'Social link coming soon.' })}
                  className="grid place-items-center w-9 h-9 rounded-xl bg-cream-200/70 text-charcoal-700 hover:bg-forest-100 hover:text-forest-600 transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-charcoal-900 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => scrollToSection(l.id)}
                      className="text-sm text-charcoal-700/70 hover:text-forest-600 transition-colors"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-cream-300 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-charcoal-700/50">
          <p>© {new Date().getFullYear()} RepoVibe. All signals, no vanity.</p>
          <div className="flex gap-5">
            <button onClick={() => toast({ kind: 'info', title: 'Privacy', body: 'Privacy policy coming soon.' })} className="hover:text-charcoal-800 transition-colors">Privacy</button>
            <button onClick={() => toast({ kind: 'info', title: 'Terms', body: 'Terms of service coming soon.' })} className="hover:text-charcoal-800 transition-colors">Terms</button>
            <button onClick={() => toast({ kind: 'info', title: 'Cookies', body: 'We use minimal cookies.' })} className="hover:text-charcoal-800 transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
