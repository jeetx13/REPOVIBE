import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

import {
  DEMO_REPO_MAP,
  parseRepoInput,
  type RecentRepo,
  type RepoAnalysis,
} from "./analysis-types";

const repoInput = z.object({
  repo: z.string().min(1).max(200),
  refresh: z.boolean().optional(),
});

/**
 * Analyze a GitHub repository. Returns a cached report when a fresh one
 * (< 24h) exists, otherwise pulls live data from GitHub, scores it, and
 * persists the result.
 */
export const analyzeRepo = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => repoInput.parse(input))
  .handler(async ({ data }): Promise<RepoAnalysis> => {
    const { runAnalysis } = await import("./analysis.server");
    return runAnalysis(data.repo, data.refresh === true);
  });

/** Cached-first analysis for the landing-page demo tiles. */
export const getDemoAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ key: z.string().min(1).max(40) }).parse(input))
  .handler(async ({ data }): Promise<RepoAnalysis> => {
    const full = DEMO_REPO_MAP[data.key] ?? "facebook/react";
    const { runAnalysis } = await import("./analysis.server");
    return runAnalysis(full, false);
  });

/** Public list of the most recently analyzed repositories. */
export const listRecentRepos = createServerFn({ method: "GET" }).handler(
  async (): Promise<RecentRepo[]> => {
    const { fetchRecentRepos } = await import("./analysis.server");
    return fetchRecentRepos();
  },
);

/** Repos the signed-in user bookmarked, with their latest score. */
export const listSavedRepos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RecentRepo[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("saved_repos")
      .select("repos!inner(full_name, analyzed_count)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Couldn't load your saved repositories.");

    const rows = (data ?? []) as unknown as {
      repos: { full_name: string; analyzed_count: number };
    }[];
    const names = rows.map((r) => r.repos.full_name);
    if (!names.length) return [];

    const { fetchLatestScores } = await import("./analysis.server");
    const scores = await fetchLatestScores(names);
    return rows.map((r) => ({
      fullName: r.repos.full_name,
      analyzedCount: r.repos.analyzed_count,
      healthScore: scores[r.repos.full_name]?.score ?? 0,
      healthGrade: scores[r.repos.full_name]?.grade ?? "-",
    }));
  });

/** Bookmark / un-bookmark a repository for the signed-in user. */
export const toggleSavedRepo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ repo: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<{ saved: boolean }> => {
    const { fullName } = parseRepoInput(data.repo);
    const { supabase, userId } = context;

    const { data: repoRow, error: repoErr } = await supabase
      .from("repos")
      .select("id")
      .eq("full_name", fullName)
      .maybeSingle();
    if (repoErr) throw new Error("Couldn't reach the database.");
    if (!repoRow) throw new Error("Analyze this repository before saving it.");

    const { data: existing } = await supabase
      .from("saved_repos")
      .select("id")
      .eq("user_id", userId)
      .eq("repo_id", repoRow.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("saved_repos").delete().eq("id", existing.id);
      if (error) throw new Error("Couldn't remove that bookmark.");
      return { saved: false };
    }

    const { error } = await supabase
      .from("saved_repos")
      .insert({ user_id: userId, repo_id: repoRow.id });
    if (error) throw new Error("Couldn't save that repository.");
    return { saved: true };
  });

/** Whether the signed-in user has bookmarked a given repository. */
export const isRepoSaved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ repo: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<{ saved: boolean }> => {
    const { fullName } = parseRepoInput(data.repo);
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from("saved_repos")
      .select("id, repos!inner(full_name)")
      .eq("user_id", userId)
      .eq("repos.full_name", fullName)
      .limit(1);
    return { saved: (rows ?? []).length > 0 };
  });
