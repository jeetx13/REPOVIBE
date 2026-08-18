// ─────────────────────────────────────────────────────────────────────────
// RepoVibe API service layer
// The single place the UI talks to the backend. Every call goes through a
// TanStack server function which pulls live GitHub data, scores it, caches
// it in the database and returns a typed report.
// ─────────────────────────────────────────────────────────────────────────
import {
  analyzeRepo as analyzeRepoFn,
  getDemoAnalysis,
  listRecentRepos,
  listSavedRepos,
  toggleSavedRepo as toggleSavedRepoFn,
  isRepoSaved as isRepoSavedFn,
} from "@/lib/analysis.functions";
import { parseRepoInput, type RecentRepo, type RepoAnalysis } from "@/lib/analysis-types";

export type {
  CommitPoint,
  ContributorRow,
  IssueStaleness,
  PRMergeTime,
  RepoAnalysis,
  AnalysisResult,
  RecentRepo,
} from "@/lib/analysis-types";
export { DEMO_REPOS, parseRepoInput } from "@/lib/analysis-types";

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message && !err.message.startsWith("[object")) return err.message;
  return fallback;
}

export async function analyzeRepo(fullName: string, refresh = false): Promise<RepoAnalysis> {
  // Validate client-side so bad input never hits the network.
  parseRepoInput(fullName);
  try {
    return await analyzeRepoFn({ data: { repo: fullName, refresh } });
  } catch (err) {
    throw new Error(toMessage(err, "We couldn't analyze that repository. Please try again."));
  }
}

export async function fetchDemoAnalysis(repoKey: string): Promise<RepoAnalysis> {
  return getDemoAnalysis({ data: { key: repoKey } });
}

export async function fetchRecentRepos(): Promise<RecentRepo[]> {
  try {
    return await listRecentRepos();
  } catch {
    return [];
  }
}

export async function fetchSavedRepos(): Promise<RecentRepo[]> {
  return listSavedRepos();
}

export async function toggleSavedRepo(fullName: string): Promise<boolean> {
  const { saved } = await toggleSavedRepoFn({ data: { repo: fullName } });
  return saved;
}

export async function isRepoSaved(fullName: string): Promise<boolean> {
  const { saved } = await isRepoSavedFn({ data: { repo: fullName } });
  return saved;
}
