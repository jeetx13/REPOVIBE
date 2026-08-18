import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { SearchBar } from "@/components/dashboard/SearchBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Loading } from "@/components/dashboard/Loading";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/rv/Button";
import { useRepoAnalysis } from "@/hooks/useRepoAnalysis";
import { analyzeRepo, isRepoSaved, toggleSavedRepo } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/rv/Toast";

const searchSchema = z.object({ repo: z.string().optional() });

const TITLE = "Analyze a repository — RepoVibe";
const DESCRIPTION =
  "Run a live health analysis on any public GitHub repository: commit rhythm, bus factor, issue staleness, PR merge time and a composite score.";

export const Route = createFileRoute("/analyze")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const { repo } = Route.useSearch();
  const navigate = useNavigate();
  const toast = useToast();
  const { result, run, reset } = useRepoAnalysis();
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session || !repo || result.status !== "success") {
      setSaved(false);
      return;
    }
    let alive = true;
    isRepoSaved(repo)
      .then((v) => alive && setSaved(v))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [session, repo, result.status]);

  const onToggleSave = async () => {
    if (!repo) return;
    if (!session) {
      navigate({ to: "/auth" });
      return;
    }
    try {
      const next = await toggleSavedRepo(repo);
      setSaved(next);
      toast({ kind: "success", title: next ? "Saved" : "Removed", body: repo });
    } catch (err) {
      toast({
        kind: "error",
        title: "Couldn't update bookmark",
        body: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  useEffect(() => {
    if (repo) run(repo);
    else reset();
  }, [repo, run, reset]);

  const onAnalyze = (next: string) => {
    navigate({ to: "/analyze", search: { repo: next } });
  };

  const onRefresh = async () => {
    if (!repo || refreshing) return;
    setRefreshing(true);
    try {
      await analyzeRepo(repo, true);
      await run(repo);
      toast({ kind: "success", title: "Refreshed", body: "Pulled the latest data from GitHub." });
    } catch (err) {
      toast({
        kind: "error",
        title: "Refresh failed",
        body: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <SearchBar onAnalyze={onAnalyze} onHome={() => navigate({ to: "/" })} initial={repo ?? ""} />

      {result.status === "idle" && (
        <div className="mx-auto max-w-3xl px-4 py-28 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal-900">
            Analyze a repository
          </h1>
          <p className="mt-3 text-charcoal-700/70">
            Paste an <span className="font-mono text-sm">owner/repo</span> or a GitHub URL above to
            get a live health report.
          </p>
        </div>
      )}

      {result.status === "loading" && <Loading repo={repo ?? ""} />}

      {result.status === "error" && (
        <div className="mx-auto max-w-xl px-4 py-28 text-center">
          <h1 className="font-display text-2xl font-semibold text-charcoal-900">
            We couldn't analyze that repo
          </h1>
          <p className="mt-3 text-charcoal-700/70">{result.error}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => repo && run(repo)}>Try again</Button>
            <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
              Back home
            </Button>
          </div>
        </div>
      )}

      {result.status === "success" && result.data && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onToggleSave}>
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {saved ? "Saved" : "Save repo"}
          </Button>
        </div>
      )}

      {result.status === "success" && result.data && (
        <Dashboard data={result.data} onRefresh={onRefresh} refreshing={refreshing} />
      )}
    </div>
  );
}
