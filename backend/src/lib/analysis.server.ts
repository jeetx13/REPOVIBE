import { buildAnalysis, GitHubError } from "./github.server";
import { gradeFor, parseRepoInput, type RecentRepo, type RepoAnalysis } from "./analysis-types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Latest stored report for a repo, plus the row ids we need for deltas. */
async function loadLatest(fullName: string) {
  const db = await admin();
  const { data: repo } = await db
    .from("repos")
    .select("id, analyzed_count")
    .eq("full_name", fullName)
    .maybeSingle();
  if (!repo) return null;

  const { data: analysis } = await db
    .from("analyses")
    .select("report_json, analyzed_at, health_score, bus_factor_value, median_pr_hours")
    .eq("repo_id", repo.id)
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { repo, analysis };
}

async function persist(
  report: RepoAnalysis,
  meta: { stars: number; forks: number; language: string | null },
  /** The identifier the user requested — cache and bookmarks are keyed on it. */
  cacheKey: string,
) {
  const db = await admin();
  const { data: repo, error: repoErr } = await db
    .from("repos")
    .upsert(
      {
        owner: report.repo.owner,
        name: report.repo.name,
        full_name: cacheKey,
        description: report.repo.description,
        stars: meta.stars,
        forks: meta.forks,
        language: meta.language,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "full_name" },
    )
    .select("id")
    .maybeSingle();
  if (repoErr || !repo) {
    console.error("persist repo failed", repoErr);
    return;
  }

  await db.rpc("increment_analyzed_count", { p_repo_id: repo.id });

  const { data: analysis, error: aErr } = await db
    .from("analyses")
    .insert({
      repo_id: repo.id,
      health_score: report.healthScore,
      health_grade: report.healthGrade,
      commit_freq_score: report.commitFrequency.score,
      issue_staleness_score: report.issueStaleness.score,
      bus_factor_score: report.busFactor.score,
      contributor_growth_score: report.contributorGrowth.score,
      pr_merge_score: report.prMergeTime.score,
      activity_recency_score: report.activityRecency.score,
      bus_factor_value: report.busFactor.value,
      active_contributors: report.contributorGrowth.active,
      median_pr_hours: report.prMergeTime.medianHours,
      open_issues: report.issueStaleness.openIssues,
      last_push_days: report.activityRecency.lastPushDays,
      delta_health_score: report.deltas.healthScore,
      delta_commits: report.deltas.commits,
      delta_issues: report.deltas.issues,
      delta_bus_factor: report.deltas.busFactor,
      delta_pr_merge_hours: report.deltas.prMergeHours,
      report_json: report as never,
    })
    .select("id")
    .maybeSingle();
  if (aErr || !analysis) {
    console.error("persist analysis failed", aErr);
    return;
  }

  if (report.busFactor.topContributors.length) {
    const { error } = await db.from("contributors").insert(
      report.busFactor.topContributors.map((c, i) => ({
        analysis_id: analysis.id,
        login: c.login,
        avatar: c.avatar,
        commits: c.commits,
        share: c.share,
        rank: i + 1,
      })),
    );
    if (error) console.error("persist contributors failed", error);
  }
}

/** Main entry point used by the analyze server function. */
export async function runAnalysis(input: string, refresh: boolean): Promise<RepoAnalysis> {
  const { owner, name, fullName } = parseRepoInput(input);

  const previous = await loadLatest(fullName);
  if (!refresh && previous?.analysis) {
    const age = Date.now() - new Date(previous.analysis.analyzed_at).getTime();
    if (age < CACHE_TTL_MS) {
      return previous.analysis.report_json as unknown as RepoAnalysis;
    }
  }

  let report: RepoAnalysis;
  try {
    report = await buildAnalysis(owner, name);
  } catch (err) {
    // Fall back to a stale cached report rather than failing the request.
    if (previous?.analysis) return previous.analysis.report_json as unknown as RepoAnalysis;
    if (err instanceof GitHubError) throw new Error(err.message);
    throw new Error("Analysis failed. Please try again.");
  }

  if (previous?.analysis) {
    report.deltas.healthScore = report.healthScore - previous.analysis.health_score;
    report.deltas.busFactor = report.busFactor.value - previous.analysis.bus_factor_value;
    report.deltas.prMergeHours = report.prMergeTime.medianHours - previous.analysis.median_pr_hours;
  }

  await persist(report, { stars: 0, forks: 0, language: null }, fullName);
  return report;
}

export async function fetchRecentRepos(): Promise<RecentRepo[]> {
  const db = await admin();
  const { data, error } = await db
    .from("analyses")
    .select("health_score, health_grade, analyzed_at, repos!inner(full_name, analyzed_count)")
    .order("analyzed_at", { ascending: false })
    .limit(30);
  if (error || !data) return [];

  const seen = new Set<string>();
  const rows: RecentRepo[] = [];
  for (const r of data as unknown as {
    health_score: number;
    health_grade: string;
    repos: { full_name: string; analyzed_count: number };
  }[]) {
    if (seen.has(r.repos.full_name)) continue;
    seen.add(r.repos.full_name);
    rows.push({
      fullName: r.repos.full_name,
      analyzedCount: r.repos.analyzed_count,
      healthScore: r.health_score,
      healthGrade: r.health_grade,
    });
    if (rows.length >= 5) break;
  }
  return rows;
}

export async function fetchLatestScores(
  fullNames: string[],
): Promise<Record<string, { score: number; grade: string }>> {
  const db = await admin();
  const { data } = await db
    .from("analyses")
    .select("health_score, health_grade, analyzed_at, repos!inner(full_name)")
    .in("repos.full_name", fullNames)
    .order("analyzed_at", { ascending: false });

  const out: Record<string, { score: number; grade: string }> = {};
  for (const r of (data ?? []) as unknown as {
    health_score: number;
    health_grade: string;
    repos: { full_name: string };
  }[]) {
    if (out[r.repos.full_name]) continue;
    out[r.repos.full_name] = {
      score: r.health_score,
      grade: r.health_grade || gradeFor(r.health_score),
    };
  }
  return out;
}
