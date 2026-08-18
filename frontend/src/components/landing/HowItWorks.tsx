import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Database, Gauge, GitBranch, CircleDot, Users } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    icon: Search,
    n: '01',
    title: 'Enter a repo',
    body: 'Paste any owner/repo — public or yours. We accept URLs too.',
    accent: '#3B6E4B',
  },
  {
    icon: Database,
    n: '02',
    title: 'We fetch & cache',
    body: 'RepoVibe pulls commits, issues, PRs and contributors, then caches so repeat analyses are instant.',
    accent: '#D98A2B',
  },
  {
    icon: Gauge,
    n: '03',
    title: 'See your score',
    body: 'A composite health score with a full breakdown — and deltas since your last analysis.',
    accent: '#2A5238',
  },
];

// Small satellite signals feeding into the "fetch & cache" node — purely
// decorative, reinforces that several data streams are pulled at once.
const satellites = [
  { icon: GitBranch, angle: -34 },
  { icon: CircleDot, angle: 0 },
  { icon: Users, angle: 34 },
];

/** Node position along the diagram, expressed as % of the rail width. */
const NODE_X = [8, 50, 92];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // Drives how far the connecting line has "grown" and which node is lit.
  const pathProgress = useTransform(scrollYProgress, [0.08, 0.92], [0, 1]);
  const pathScaleX = useTransform(pathProgress, [0, 1], [0, 1]);
  const pulseX = useTransform(pathProgress, [0, 1], [NODE_X[0], NODE_X[2]]);
  const pulseOpacity = useTransform(pathProgress, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);

  const node1Glow = useTransform(scrollYProgress, [0.05, 0.18, 0.3], [0, 1, 1]);
  const node2Glow = useTransform(scrollYProgress, [0.32, 0.48, 0.62], [0, 1, 1]);
  const node3Glow = useTransform(scrollYProgress, [0.64, 0.8, 0.95], [0, 1, 1]);
  const nodeGlows = [node1Glow, node2Glow, node3Glow];

  const node1Scale = useTransform(scrollYProgress, [0.05, 0.18, 0.3], [0.7, 1, 1]);
  const node2Scale = useTransform(scrollYProgress, [0.32, 0.48, 0.62], [0.7, 1, 1]);
  const node3Scale = useTransform(scrollYProgress, [0.64, 0.8, 0.95], [0.7, 1, 1]);
  const nodeScales = [node1Scale, node2Scale, node3Scale];

  return (
    <section id="how" ref={ref} className="relative border-t border-cream-300/70 bg-cream-50/40" style={{ height: '260vh' }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-16">
        <div className="mx-auto max-w-5xl w-full px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-xl mb-14 sm:mb-20"
          >
            <p className="text-sm font-semibold tracking-widest uppercase text-amber-500 mb-3">How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal-900 text-balance">
              Three steps. About ten seconds.
            </h2>
          </motion.div>

          {/* connected node diagram */}
          <div className="relative h-[210px] sm:h-[240px] mb-10 sm:mb-14">
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="how-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B6E4B" />
                  <stop offset="50%" stopColor="#D98A2B" />
                  <stop offset="100%" stopColor="#2A5238" />
                </linearGradient>
              </defs>
              {/* base rail */}
              <line x1={NODE_X[0]} y1="20" x2={NODE_X[2]} y2="20" stroke="#E2DCC9" strokeWidth="0.6" />
              {/* animated fill, grows left-to-right as you scroll */}
              <motion.line
                x1={NODE_X[0]}
                y1="20"
                x2={NODE_X[2]}
                y2="20"
                stroke="url(#how-line-grad)"
                strokeWidth="0.6"
                strokeLinecap="round"
                style={{ scaleX: pathScaleX, transformOrigin: `${NODE_X[0]}% 50%` }}
              />
              {/* pulse travelling along the rail */}
              <motion.circle
                r="0.9"
                fill="#F4C97A"
                cy="20"
                style={{ cx: pulseX, opacity: pulseOpacity } as unknown as CSSProperties}
              />
            </svg>

            {steps.map((s, i) => {
              const Icon = s.icon;
              const left = NODE_X[i];
              return (
                <div
                  key={s.n}
                  className="absolute top-1/2 flex flex-col items-center"
                  style={{ left: `${left}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div style={{ scale: nodeScales[i] }} className="relative">
                    <motion.span
                      style={{
                        opacity: nodeGlows[i],
                        background: `radial-gradient(circle, ${s.accent}55 0%, transparent 70%)`,
                      }}
                      className="absolute -inset-5 rounded-full blur-md"
                    />
                    <span
                      style={{ backgroundColor: s.accent }}
                      className="relative grid place-items-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-lift text-cream-50"
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
                    </span>

                    {/* satellites only on the middle "fetch & cache" node */}
                    {i === 1 &&
                      satellites.map((sat, si) => {
                        const SatIcon = sat.icon;
                        const rad = (sat.angle * Math.PI) / 180;
                        const dist = 44;
                        const x = Math.sin(rad) * dist;
                        const y = -Math.cos(rad) * dist - 34;
                        return (
                          <motion.span
                            key={si}
                            style={{ opacity: nodeGlows[i] }}
                            className="absolute grid place-items-center w-7 h-7 rounded-full bg-cream-50 border border-cream-300 text-forest-500 shadow-soft"
                            initial={{ x, y: y + 10 }}
                            animate={{ x, y }}
                            transition={{ duration: 0.6, ease: EASE, delay: si * 0.08 }}
                          >
                            <SatIcon className="w-3.5 h-3.5" />
                          </motion.span>
                        );
                      })}
                  </motion.div>

                  <span className="mt-4 font-mono text-xs text-charcoal-700/40">{s.n}</span>
                </div>
              );
            })}
          </div>

          {/* step copy — fades the active step in as its node lights up */}
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.n} style={{ opacity: nodeGlows[i] }} className="text-center sm:text-left">
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal-900">{s.title}</h3>
                <p className="mt-2 text-charcoal-700/75 leading-relaxed text-sm sm:text-base">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
