// RepoVibe frontend API service layer.
// The frontend talks only to the deployed/local backend API.
// No GitHub token, Supabase service-role key, or database credentials belong here.

export interface CommitPoint {
  date: string;
  commits: number;
}

export interface ContributorRow {
  login: string;
  avatar: string;
  commits: number;
  share: number;
}

export interface IssueStaleness {
  openIssues: number;
  medianAgeDays: number;
  staleRatio: number;
  trend: { week: string; opened: number; closed: number }[];
}

export interface PRMergeTime {
  medianHours: number;
  p90Hours: number;
  trend: { week: string; hours: number }[];
}

export interface RepoAnalysis {
  repo: { owner: string; name: string; fullName: string; description: string };
  analyzedAt: string;
  healthScore: number;
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  deltas: {
    healthScore: number;
    commits: number;
    issues: number;
    busFactor: number;
    prMergeHours: number;
  };
  commitFrequency: { score: number; trend: CommitPoint[] };
  issueStaleness: IssueStaleness & { score: number };
  busFactor: { score: number; value: number; topContributors: ContributorRow[] };
  contributorGrowth: { score: number; active: number; new30d: number };
  prMergeTime: PRMergeTime & { score: number };
  activityRecency: { score: number; lastPushDays: number; lastCommitDays: number; label: string };
}

export interface AnalysisResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: RepoAnalysis;
  error?: string;
}

export interface RecentRepo {
  fullName: string;
  analyzedCount: number;
  healthScore: number;
  healthGrade: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init.headers },
  });

  const body = (await response.json().catch(() => null)) as { error?: string } | T | null;

  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body ? body.error : undefined;
    throw new Error(message || `Request failed (${response.status}).`);
  }

  return body as T;
}

export async function analyzeRepo(fullName: string): Promise<RepoAnalysis> {
  return requestJson<RepoAnalysis>('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo: fullName }),
  });
}

export async function fetchDemoAnalysis(repoKey: string): Promise<RepoAnalysis> {
  return requestJson<RepoAnalysis>('/api/demo-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: repoKey }),
  });
}

export async function fetchRecentRepos(): Promise<RecentRepo[]> {
  return requestJson<RecentRepo[]>('/api/recent-repos');
}

export const DEMO_REPOS = [
  { key: 'react', name: 'React', score: 92, repo: 'facebook/react' },
  { key: 'vue', name: 'Vue', score: 88, repo: 'vuejs/core' },
  { key: 'next', name: 'Next.js', score: 90, repo: 'vercel/next.js' },
  { key: 'tailwind', name: 'Tailwind', score: 85, repo: 'tailwindlabs/tailwindcss' },
  { key: 'vite', name: 'Vite', score: 87, repo: 'vitejs/vite' },
  { key: 'svelte', name: 'Svelte', score: 84, repo: 'sveltejs/kit' },
] as const;
