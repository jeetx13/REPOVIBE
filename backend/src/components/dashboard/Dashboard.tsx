import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Clock, GitCommitHorizontal, GitPullRequest, RefreshCw, Users, Zap } from 'lucide-react';
import type { RepoAnalysis } from '@/services/api';
import { Card } from './Card';
import { Delta } from './Delta';
import { Button } from '@/components/rv/Button';
import { Gauge3D } from '@/components/three/Gauge3D';
import { useCountUp } from '@/hooks/useCountUp';

const gradeColor = (s: number) => (s >= 90 ? '#2A5238' : s >= 78 ? '#3B6E4B' : s >= 64 ? '#D98A2B' : '#D85A3E');

interface DashboardProps {
  data: RepoAnalysis;
  onRefresh: () => void;
  refreshing: boolean;
}

type RangeKey = '30d' | '90d' | '1y';
const RANGES: { key: RangeKey; label: string }[] = [
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: '1y', label: '1y' },
];

export function Dashboard({ data, onRefresh, refreshing }: DashboardProps) {
  const [range, setRange] = useState<RangeKey>('90d');
  const score = useCountUp(data.healthScore, 1400);
  const bus = useCountUp(data.busFactor.value, 1100);
  const active = useCountUp(data.contributorGrowth.active, 1100);
  const openIssues = useCountUp(data.issueStaleness.openIssues, 1100);
  const medianHours = useCountUp(data.prMergeTime.medianHours, 1100);

  const rangeN = range === '30d' ? 4 : range === '90d' ? 8 : 12;
  const commitData = data.commitFrequency.trend.slice(-rangeN).map((d) => ({ date: d.date, commits: d.commits }));
  const issueData = data.issueStaleness.trend.slice(-rangeN).map((d) => ({ week: d.week, opened: d.opened, closed: d.closed }));
  const prData = data.prMergeTime.trend.slice(-rangeN).map((d) => ({ week: d.week, hours: d.hours }));

  // re-trigger draw on range change
  const [drawKey, setDrawKey] = useState(0);
  useEffect(() => setDrawKey((k) => k + 1), [range]);

  const donutData = [
    { name: 'Top contributor', value: data.busFactor.topContributors[0]?.share ?? 0.4, color: '#2A5238' },
    { name: 'Rest of core', value: 1 - (data.busFactor.topContributors[0]?.share ?? 0.4), color: '#E2DCC9' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* header row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"
      >
        <div>
          <div className="flex items-center gap-2 text-sm text-charcoal-700/55 font-mono">
            <Activity className="w-4 h-4" />
            {data.repo.fullName}
          </div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-charcoal-900">
            Health report
          </h1>
          <p className="mt-1 text-sm text-charcoal-700/60 max-w-xl">{data.repo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* date range filter */}
          <div className="flex items-center bg-cream-200/70 rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  range === r.key ? 'bg-cream-50 text-forest-600 shadow-soft' : 'text-charcoal-700/60 hover:text-charcoal-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />} onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* top row: score + activity badge */}
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-5 mb-5">
        <Card title="Composite health score" subtitle="0–100, weighted across six signals" delay={0.05}
          right={<Delta value={data.deltas.healthScore} />}>
          <div className="relative h-56">
            <Suspense fallback={null}>
              <Gauge3D fill={score} color={gradeColor(data.healthScore)} className="absolute inset-0" />
            </Suspense>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 pointer-events-none">
              <motion.span
                key={score}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-6xl font-semibold"
                style={{ color: gradeColor(data.healthScore) }}
              >
                {score}
              </motion.span>
              <span className="text-sm tracking-widest uppercase text-charcoal-700/50 mt-1">Grade {data.healthGrade}</span>
            </div>
          </div>
        </Card>

        {/* activity + quick stats */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Card title="Activity recency" subtitle="How alive is it right now" delay={0.1}
            right={<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-50 text-forest-600"><Zap className="w-3.5 h-3.5" />{data.activityRecency.label}</span>}>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-charcoal-700/55">Last push</p>
                <p className="font-display text-3xl font-semibold text-charcoal-900">{data.activityRecency.lastPushDays}d</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-700/55">Last commit</p>
                <p className="font-display text-3xl font-semibold text-charcoal-900">{data.activityRecency.lastCommitDays}d</p>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-cream-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.activityRecency.score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: gradeColor(data.activityRecency.score) }}
              />
            </div>
          </Card>

          <Card title="PR merge time" subtitle="Median time-to-merge" delay={0.15}
            right={<Delta value={data.deltas.prMergeHours} invert suffix="h" />}>
            <div className="flex items-end gap-3">
              <GitPullRequest className="w-6 h-6 text-amber-500 mb-1" />
              <p className="font-display text-4xl font-semibold text-charcoal-900">{medianHours}h</p>
            </div>
            <p className="mt-1 text-xs text-charcoal-700/55">p90: {data.prMergeTime.p90Hours}h</p>
            <div className="mt-3 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prData} key={drawKey}>
                  <Bar dataKey="hours" radius={[3, 3, 0, 0]} fill="#EBA84A" isAnimationActive animationDuration={900} />
                  <XAxis dataKey="week" hide />
                  <YAxis hide />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* charts row */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card title="Commit frequency" subtitle={`${range} trend`} delay={0.1}
          right={<Delta value={data.deltas.commits} />}>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={commitData} key={drawKey} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="dCommit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B6E4B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3B6E4B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} dy={6} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#FBFAF6', border: '1px solid #E2DCC9', borderRadius: 12 }} />
                <Area type="monotone" dataKey="commits" stroke="#2A5238" strokeWidth={2.5} fill="url(#dCommit)" isAnimationActive animationDuration={1400} animationEasing="ease-out" dot={false} activeDot={{ r: 5, fill: '#EBA84A' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Issue staleness" subtitle={`${range} · opened vs closed`} delay={0.15}
          right={<Delta value={data.deltas.issues} invert />}>
          <div className="flex items-center gap-5 mb-3">
            <div>
              <p className="text-xs text-charcoal-700/55">Open</p>
              <p className="font-display text-2xl font-semibold text-charcoal-900">{openIssues}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-700/55">Median age</p>
              <p className="font-display text-2xl font-semibold text-charcoal-900">{data.issueStaleness.medianAgeDays}d</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-700/55">Stale ratio</p>
              <p className="font-display text-2xl font-semibold" style={{ color: data.issueStaleness.staleRatio > 0.3 ? '#D85A3E' : '#3B6E4B' }}>
                {Math.round(data.issueStaleness.staleRatio * 100)}%
              </p>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueData} key={drawKey} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} dy={6} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#FBFAF6', border: '1px solid #E2DCC9', borderRadius: 12 }} />
                <Bar dataKey="opened" stackId="a" fill="#D98A2B" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={1000} />
                <Bar dataKey="closed" stackId="a" fill="#5E8E6C" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* bus factor + contributors */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <Card title="Bus factor" subtitle="Knowledge concentration" delay={0.1}
          right={<Delta value={data.deltas.busFactor} />}>
          <div className="flex items-center gap-5">
            <div className="relative h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" innerRadius={42} outerRadius={62} startAngle={90} endAngle={-270} isAnimationActive animationDuration={1100}>
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-4xl font-semibold text-charcoal-900">{bus}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-charcoal-700/55">If the top contributor left</p>
              <p className="font-display text-lg font-semibold text-charcoal-900 mt-0.5">
                {bus <= 2 ? 'High risk' : bus <= 4 ? 'Moderate' : 'Healthy'}
              </p>
              <p className="mt-2 text-xs text-charcoal-700/55">Active contributors</p>
              <p className="font-display text-2xl font-semibold text-forest-600">{active}</p>
            </div>
          </div>
        </Card>

        <Card title="Contributor leaderboard" subtitle="By commit share" delay={0.15}>
          <ul className="space-y-3">
            {data.busFactor.topContributors.map((c, i) => (
              <motion.li
                key={c.login}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="w-5 text-xs font-mono text-charcoal-700/40">{i + 1}</span>
                <img src={c.avatar} alt={c.login} className="w-9 h-9 rounded-full border border-cream-300" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal-900 truncate">{c.login}</span>
                    <span className="text-xs font-mono text-charcoal-700/60">{c.commits} commits</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.share * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? '#D98A2B' : '#3B6E4B' }}
                    />
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>

      {/* footer stat row */}
      <div className="mt-5 grid sm:grid-cols-3 gap-5">
        <MiniStat icon={GitCommitHorizontal} label="Commits / wk (avg)" value={Math.round(commitData.reduce((s, d) => s + d.commits, 0) / (commitData.length || 1))} accent="#3B6E4B" />
        <MiniStat icon={Users} label="New contributors (30d)" value={data.contributorGrowth.new30d} accent="#5E8E6C" />
        <MiniStat icon={Clock} label="Analyzed" value="just now" accent="#D98A2B" raw />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent, raw }: { icon: typeof Activity; label: string; value: number | string; accent: string; raw?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-cream-50/80 border border-cream-300 p-4 flex items-center gap-3"
    >
      <span className="grid place-items-center w-10 h-10 rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-xs text-charcoal-700/55">{label}</p>
        <p className="font-display text-xl font-semibold text-charcoal-900">
          {raw ? value : <CountStr v={value as number} />}
        </p>
      </div>
    </motion.div>
  );
}

function CountStr({ v }: { v: number }) {
  const n = useCountUp(v, 900);
  return <>{n}</>;
}
