import {
  gradeFor,
  type CommitPoint,
  type ContributorRow,
  type RepoAnalysis,
} from "./analysis-types";

const GH = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "RepoVibe",
  };
  const token = process.env["GITHUB_TOKEN"];
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function gh<T>(path: string, opts: { optional?: boolean } = {}): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${GH}${path}`, { headers: headers() });
  } catch {
    throw new GitHubError("Couldn't reach GitHub right now. Please try again.", 502);
  }
  if (res.status === 404) {
    if (opts.optional) return null;
    throw new GitHubError("That repository doesn't exist or is private.", 404);
  }
  if (res.status === 403 || res.status === 429) {
    if (opts.optional) return null;
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const mins = reset ? Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60000)) : 0;
    throw new GitHubError(
      mins
        ? `GitHub's request limit was reached. Try again in about ${mins} minute${mins === 1 ? "" : "s"}.`
        : "GitHub's request limit was reached. Please try again in a few minutes.",
      429,
    );
  }
  if (res.status === 202 || res.status === 204) return null; // stats still computing
  if (!res.ok) {
    if (opts.optional) return null;
    throw new GitHubError(`GitHub returned an error (${res.status}).`, 502);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── types of the GitHub payloads we consume ──────────────────────────────
interface GhRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  open_issues_count: number;
  pushed_at: string;
  archived: boolean;
  owner: { login: string };
}
interface GhContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}
interface GhIssue {
  created_at: string;
  closed_at: string | null;
  pull_request?: unknown;
}
interface GhPull {
  created_at: string;
  merged_at: string | null;
}
interface GhCommit {
  commit: { author: { date: string } | null };
  author: { login: string; avatar_url: string } | null;
}

const DAY = 86_400_000;
const daysAgo = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / DAY));
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] as number) : ((s[mid - 1] as number) + (s[mid] as number)) / 2;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.floor((p / 100) * s.length));
  return s[idx] as number;
}

function weekKey(date: Date, weeksAgo: number) {
  void date;
  return `W${weeksAgo}`;
}

/** Fetch every signal we need and turn it into a RepoAnalysis. */
export async function buildAnalysis(owner: string, name: string): Promise<RepoAnalysis> {
  const repo = await gh<GhRepo>(`/repos/${owner}/${name}`);
  if (!repo) throw new GitHubError("That repository doesn't exist or is private.", 404);

  const [participation, contributors, issues, pulls, commits] = await Promise.all([
    gh<{ all: number[]; owner: number[] }>(`/repos/${owner}/${name}/stats/participation`, {
      optional: true,
    }),
    gh<GhContributor[]>(`/repos/${owner}/${name}/contributors?per_page=100`, { optional: true }),
    gh<GhIssue[]>(`/repos/${owner}/${name}/issues?state=all&per_page=100&sort=created&direction=desc`, {
      optional: true,
    }),
    gh<GhPull[]>(`/repos/${owner}/${name}/pulls?state=closed&per_page=100&sort=updated&direction=desc`, {
      optional: true,
    }),
    gh<GhCommit[]>(`/repos/${owner}/${name}/commits?per_page=100`, { optional: true }),
  ]);

  // ── commit frequency ───────────────────────────────────────────────────
  let weekly: number[] = [];
  if (participation?.all?.length) {
    weekly = participation.all.slice(-12);
  } else if (commits?.length) {
    const buckets = new Array(12).fill(0) as number[];
    for (const c of commits) {
      const d = c.commit.author?.date;
      if (!d) continue;
      const w = Math.floor(daysAgo(d) / 7);
      if (w < 12) buckets[11 - w] = (buckets[11 - w] ?? 0) + 1;
    }
    weekly = buckets;
  }
  if (!weekly.length) weekly = new Array(12).fill(0) as number[];

  const commitTrend: CommitPoint[] = weekly.map((commits, i) => ({
    date: weekKey(new Date(), weekly.length - i),
    commits,
  }));
  const commitsRecent = weekly.slice(-4).reduce((a, b) => a + b, 0);
  const commitsPrev = weekly.slice(-8, -4).reduce((a, b) => a + b, 0);
  const commitsPerWeek = weekly.reduce((a, b) => a + b, 0) / Math.max(1, weekly.length);
  const commitFreqScore = clamp(20 + Math.log10(1 + commitsPerWeek) * 55);

  // ── contributors / bus factor ──────────────────────────────────────────
  const contribList = (contributors ?? []).slice(0, 100);
  const totalContributions = contribList.reduce((a, c) => a + c.contributions, 0) || 1;
  const topContributors: ContributorRow[] = contribList.slice(0, 5).map((c) => ({
    login: c.login,
    avatar: c.avatar_url,
    commits: c.contributions,
    share: c.contributions / totalContributions,
  }));

  let cumulative = 0;
  let busFactor = 0;
  for (const c of contribList) {
    cumulative += c.contributions;
    busFactor += 1;
    if (cumulative / totalContributions >= 0.5) break;
  }
  busFactor = Math.max(1, busFactor);
  const busFactorScore = clamp(Math.min(100, 25 + busFactor * 15));

  // active contributors: distinct commit authors in the last 100 commits
  const recentAuthors = new Set<string>();
  const authors30d = new Set<string>();
  for (const c of commits ?? []) {
    const login = c.author?.login;
    if (!login) continue;
    recentAuthors.add(login);
    const d = c.commit.author?.date;
    if (d && daysAgo(d) <= 30) authors30d.add(login);
  }
  const active = recentAuthors.size || Math.min(contribList.length, 5);
  const knownLogins = new Set(contribList.slice(5).map((c) => c.login));
  const new30d = [...authors30d].filter((l) => !knownLogins.has(l) && !topContributors.some((t) => t.login === l)).length;
  const contributorGrowthScore = clamp(25 + Math.log10(1 + active) * 45 + Math.min(15, new30d * 3));

  // ── issues ────────────────────────────────────────────────────────────
  const realIssues = (issues ?? []).filter((i) => !i.pull_request);
  const open = realIssues.filter((i) => !i.closed_at);
  const openIssues = repo.open_issues_count;
  const openAges = open.map((i) => daysAgo(i.created_at));
  const medianAgeDays = Math.round(median(openAges));
  const staleRatio = open.length ? open.filter((_, idx) => (openAges[idx] ?? 0) > 90).length / open.length : 0;

  const issueTrend: { week: string; opened: number; closed: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const opened = realIssues.filter((i) => Math.floor(daysAgo(i.created_at) / 7) === w).length;
    const closed = realIssues.filter((i) => i.closed_at && Math.floor(daysAgo(i.closed_at) / 7) === w).length;
    issueTrend.push({ week: `W${8 - w}`, opened, closed });
  }
  const issuesRecent = issueTrend.slice(-4).reduce((a, r) => a + r.opened, 0);
  const issuesPrev = issueTrend.slice(0, 4).reduce((a, r) => a + r.opened, 0);
  const issueStalenessScore = clamp(100 - staleRatio * 60 - Math.min(30, medianAgeDays / 8));

  // ── PR merge time ─────────────────────────────────────────────────────
  const merged = (pulls ?? []).filter((p) => p.merged_at);
  const mergeHours = merged.map(
    (p) => (new Date(p.merged_at as string).getTime() - new Date(p.created_at).getTime()) / 3_600_000,
  );
  const medianHours = Math.round(median(mergeHours));
  const p90Hours = Math.round(percentile(mergeHours, 90));
  const prTrend: { week: string; hours: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const inWeek = merged
      .filter((p) => Math.floor(daysAgo(p.merged_at as string) / 7) === w)
      .map((p) => (new Date(p.merged_at as string).getTime() - new Date(p.created_at).getTime()) / 3_600_000);
    prTrend.push({ week: `W${8 - w}`, hours: Math.round(median(inWeek)) });
  }
  const prMergeScore = mergeHours.length ? clamp(100 - Math.log10(1 + medianHours) * 28) : 50;

  // ── recency ───────────────────────────────────────────────────────────
  const lastPushDays = daysAgo(repo.pushed_at);
  const lastCommitDate = commits?.[0]?.commit.author?.date;
  const lastCommitDays = lastCommitDate ? daysAgo(lastCommitDate) : lastPushDays;
  const activityRecencyScore = clamp(100 - lastPushDays * 2.2);
  const label =
    lastPushDays <= 3 ? "Very active" : lastPushDays <= 14 ? "Active" : lastPushDays <= 60 ? "Slowing" : "Dormant";

  // ── composite ─────────────────────────────────────────────────────────
  const healthScore = clamp(
    commitFreqScore * 0.2 +
      issueStalenessScore * 0.15 +
      busFactorScore * 0.2 +
      contributorGrowthScore * 0.15 +
      prMergeScore * 0.15 +
      activityRecencyScore * 0.15 -
      (repo.archived ? 20 : 0),
  );

  return {
    repo: {
      owner: repo.owner.login,
      name: repo.name,
      fullName: `${repo.owner.login}/${repo.name}`,
      description: repo.description ?? "No description provided.",
    },
    analyzedAt: new Date().toISOString(),
    healthScore,
    healthGrade: gradeFor(healthScore),
    deltas: {
      healthScore: 0,
      commits: commitsRecent - commitsPrev,
      issues: issuesRecent - issuesPrev,
      busFactor: 0,
      prMergeHours: 0,
    },
    commitFrequency: { score: commitFreqScore, trend: commitTrend },
    issueStaleness: {
      score: issueStalenessScore,
      openIssues,
      medianAgeDays,
      staleRatio: Number(staleRatio.toFixed(3)),
      trend: issueTrend,
    },
    busFactor: { score: busFactorScore, value: busFactor, topContributors },
    contributorGrowth: { score: contributorGrowthScore, active, new30d },
    prMergeTime: { score: prMergeScore, medianHours, p90Hours, trend: prTrend },
    activityRecency: { score: activityRecencyScore, lastPushDays, lastCommitDays, label },
  };
}
