export interface CommitPoint {
  date: string;
  commits: number;
}

export interface ContributorRow {
  login: string;
  avatar: string;
  commits: number;
  share: number; // 0..1
}

export interface IssueStaleness {
  openIssues: number;
  medianAgeDays: number;
  staleRatio: number; // 0..1
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
  healthGrade: "A" | "B" | "C" | "D" | "F";
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
  activityRecency: {
    score: number;
    lastPushDays: number;
    lastCommitDays: number;
    label: string;
  };
}

export interface AnalysisResult {
  status: "idle" | "loading" | "success" | "error";
  data?: RepoAnalysis;
  error?: string;
}

export interface RecentRepo {
  fullName: string;
  analyzedCount: number;
  healthScore: number;
  healthGrade: string;
}

export const DEMO_REPOS = [
  { key: "react", name: "React", score: 92, repo: "facebook/react" },
  { key: "vue", name: "Vue", score: 88, repo: "vuejs/core" },
  { key: "next", name: "Next.js", score: 90, repo: "vercel/next.js" },
  { key: "tailwind", name: "Tailwind", score: 85, repo: "tailwindlabs/tailwindcss" },
  { key: "vite", name: "Vite", score: 87, repo: "vitejs/vite" },
  { key: "svelte", name: "Svelte", score: 84, repo: "sveltejs/kit" },
] as const;

export const DEMO_REPO_MAP: Record<string, string> = {
  react: "facebook/react",
  vue: "vuejs/core",
  next: "vercel/next.js",
  tailwind: "tailwindlabs/tailwindcss",
  vite: "vitejs/vite",
  svelte: "sveltejs/kit",
};

/** Normalizes user input into `owner/repo`. Throws on invalid input. */
export function parseRepoInput(input: string): { owner: string; name: string; fullName: string } {
  const clean = (input || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Use the format owner/repo (e.g. facebook/react).");
  }
  const [owner, name] = parts as [string, string];
  const valid = /^[A-Za-z0-9._-]{1,100}$/;
  if (!valid.test(owner) || !valid.test(name)) {
    throw new Error("That doesn't look like a valid GitHub repository name.");
  }
  return { owner, name, fullName: `${owner}/${name}` };
}

export function gradeFor(score: number): RepoAnalysis["healthGrade"] {
  if (score >= 90) return "A";
  if (score >= 78) return "B";
  if (score >= 64) return "C";
  if (score >= 50) return "D";
  return "F";
}
