import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Gauge3D } from '@/components/three/Gauge3D';
import { useInView } from '@/hooks/useInView';
import { fetchDemoAnalysis, DEMO_REPOS } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/hooks/useLenis';

const gradeColor = (s: number) => (s >= 90 ? '#2A5238' : s >= 78 ? '#3B6E4B' : s >= 64 ? '#D98A2B' : '#D85A3E');

export function DemoStrip() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [score, setScore] = useState(0);
  const [data, setData] = useState<{ date: string; commits: number }[]>([]);
  const [active, setActive] = useState(0);
  const [chartDraw, setChartDraw] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    fetchDemoAnalysis(DEMO_REPOS[active].key).then((a) => {
      if (!alive) return;
      setScore(a.healthScore);
      setData(a.commitFrequency.trend);
      setChartDraw(false);
      requestAnimationFrame(() => setChartDraw(true));
    });
    return () => {
      alive = false;
    };
  }, [inView, active]);

  return (
    <section id="demo" ref={ref} className="relative py-24 sm:py-28 border-t border-cream-300/70">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-50/50 to-cream-100" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-amber-500 mb-3">Live demo</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal-900 text-balance">
            A health score you can actually trust.
          </h2>
          <p className="mt-4 text-charcoal-700/75 text-lg">
            One composite number, distilled from six signals. Tap a repo to see it live.
          </p>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* 3D gauge card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-cream-50/70 border border-cream-300 shadow-soft p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-charcoal-700">Composite score</span>
              <span className="text-xs font-mono text-charcoal-700/50">{DEMO_REPOS[active].name}</span>
            </div>
            <div className="relative h-64 sm:h-72">
              <Suspense fallback={null}>
                <Gauge3D fill={score} color={gradeColor(score)} className="absolute inset-0" />
              </Suspense>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 pointer-events-none">
                <motion.span
                  key={score}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-5xl font-semibold text-charcoal-900"
                >
                  {score}
                </motion.span>
                <span className="text-xs tracking-widest uppercase text-charcoal-700/50 mt-1">out of 100</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEMO_REPOS.map((r, i) => (
                <button
                  key={r.key}
                  onClick={() => setActive(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active === i ? 'bg-forest-500 text-cream-100' : 'bg-cream-200/70 text-charcoal-700 hover:bg-cream-300'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* trend chart card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-forest-50/50 border border-forest-200 shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-charcoal-900">Commit frequency</h3>
                <p className="text-xs text-charcoal-700/60">12-week trend, drawn live</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-forest-100 text-forest-600">weekly</span>
            </div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B6E4B" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3B6E4B" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} dy={6} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#FBFAF6', border: '1px solid #E2DCC9', borderRadius: 12 }}
                    labelStyle={{ color: '#2A2622', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="commits"
                    stroke="#2A5238"
                    strokeWidth={2.5}
                    fill="url(#commitFill)"
                    isAnimationActive={chartDraw}
                    animationDuration={1600}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={{ r: 5, fill: '#EBA84A' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => scrollToSection('features')}>
            What makes up the score?
          </Button>
        </div>
      </div>
    </section>
  );
}
