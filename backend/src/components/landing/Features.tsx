import { motion } from 'framer-motion';
import { GitCommitHorizontal, CircleDot, Users, UserPlus, GitPullRequest, Gauge, type LucideIcon } from 'lucide-react';
import { TiltCard } from '@/components/rv/TiltCard';
import { useInView } from '@/hooks/useInView';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  accent: string;
  visual: 'bars' | 'rings' | 'dots' | 'line' | 'gauge' | 'pulse';
}

const features: Feature[] = [
  {
    icon: GitCommitHorizontal,
    title: 'Commit frequency',
    body: 'Is work flowing steadily, or did the repo go quiet last quarter? We track the rhythm, not just the total.',
    accent: '#3B6E4B',
    visual: 'bars',
  },
  {
    icon: CircleDot,
    title: 'Issue staleness',
    body: 'How long do issues sit open, and what fraction are rotting past 90 days? Backlog health, quantified.',
    accent: '#D98A2B',
    visual: 'rings',
  },
  {
    icon: Users,
    title: 'Bus factor',
    body: 'If the top two contributors vanished tomorrow, would the repo survive? We measure how concentrated the knowledge really is.',
    accent: '#D85A3E',
    visual: 'dots',
  },
  {
    icon: UserPlus,
    title: 'Contributor growth',
    body: 'Are new maintainers coming in, or is the core shrinking? Growth trend over the last 90 days.',
    accent: '#5E8E6C',
    visual: 'line',
  },
  {
    icon: GitPullRequest,
    title: 'PR merge time',
    body: 'Median and p90 time-to-merge. Slow reviews kill momentum — we show you exactly how slow.',
    accent: '#EBA84A',
    visual: 'pulse',
  },
  {
    icon: Gauge,
    title: 'Composite health score',
    body: 'All six signals weighted into one honest 0–100 number, with a letter grade and a breakdown you can drill into.',
    accent: '#2A5238',
    visual: 'gauge',
  },
];

function MiniVisual({ kind, accent }: { kind: Feature['visual']; accent: string }) {
  if (kind === 'bars') {
    return (
      <div className="flex items-end gap-1.5 h-16">
        {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
            className="flex-1 rounded-t-md"
            style={{ background: accent, opacity: 0.45 + (i / 7) * 0.55 }}
          />
        ))}
      </div>
    );
  }
  if (kind === 'rings') {
    return (
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 36 36" className="h-16 w-16">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2DCC9" strokeWidth="4" />
          <motion.circle
            cx="18" cy="18" r="15.5" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round"
            strokeDasharray="97.4"
            initial={{ strokeDashoffset: 97.4 }}
            whileInView={{ strokeDashoffset: 97.4 - (97.4 * 0.68) }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xs font-semibold" style={{ color: accent }}>68%</span>
      </div>
    );
  }
  if (kind === 'dots') {
    return (
      <div className="flex items-center gap-1.5 h-16">
        {[6, 5, 3, 2, 1].map((n, row) => (
          <div key={row} className="flex flex-col-reverse gap-1">
            {Array.from({ length: n }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (row * 5 + i) * 0.03 }}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: accent, opacity: row === 0 ? 1 : 0.35 + (1 - row / 5) * 0.5 }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'line') {
    const pts = '0,40 14,30 28,32 42,20 56,22 70,10 84,12';
    return (
      <svg viewBox="0 0 84 44" className="w-full h-16">
        <motion.polyline
          points={pts}
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
    );
  }
  if (kind === 'pulse') {
    return (
      <div className="flex items-center gap-1 h-16">
        {[3, 8, 5, 12, 6, 14, 7, 10, 4].map((h, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
            className="w-1.5 rounded-full origin-bottom"
            style={{ height: `${h * 3}px`, background: accent, opacity: 0.7 }}
          />
        ))}
      </div>
    );
  }
  // gauge
  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 36 36" className="h-16 w-16">
        <path d="M5 26 A 13 13 0 1 1 31 26" fill="none" stroke="#E2DCC9" strokeWidth="3.5" strokeLinecap="round" />
        <motion.path
          d="M5 26 A 13 13 0 1 1 31 26"
          fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 0.86 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold pt-1" style={{ color: accent }}>86</span>
    </div>
  );
}

export function Features() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-cream-50/60 border-t border-cream-300/70">
      <div className="absolute inset-0 bg-grain opacity-50" />
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-amber-500 mb-3">Six signals</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal-900 text-balance">
            One score. Six honest signals behind it.
          </h2>
          <p className="mt-4 text-charcoal-700/75 text-lg">
            No vanity stars. RepoVibe reads the activity that actually predicts whether a repo stays alive.
          </p>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 perspective">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              >
                <TiltCard className="h-full rounded-3xl bg-cream-100 border border-cream-300 p-6 shadow-soft hover:shadow-lift transition-shadow duration-300">
                  <div className="flex items-start justify-between">
                    <span
                      className="grid place-items-center w-11 h-11 rounded-2xl"
                      style={{ background: `${f.accent}1a`, color: f.accent }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </span>
                    <span className="text-[11px] font-mono text-charcoal-700/40">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-charcoal-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-charcoal-700/75 leading-relaxed">{f.body}</p>
                  <div className="mt-5" style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
                    <MiniVisual kind={f.visual} accent={f.accent} />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {inView ? null : null}
      </div>
    </section>
  );
}
