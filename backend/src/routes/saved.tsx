import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, LogOut } from "lucide-react";

import { Button } from "@/components/rv/Button";
import { useToast } from "@/components/rv/Toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedRepos } from "@/services/api";
import type { RecentRepo } from "@/lib/analysis-types";

const TITLE = "Saved repositories — RepoVibe";
const DESCRIPTION = "Your bookmarked GitHub repositories and their latest RepoVibe health scores.";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, loading, signOut } = useAuth();
  const [rows, setRows] = useState<RecentRepo[] | null>(null);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    fetchSavedRepos()
      .then((r) => alive && setRows(r))
      .catch((err) => {
        if (!alive) return;
        setRows([]);
        toast({
          kind: "error",
          title: "Couldn't load bookmarks",
          body: err instanceof Error ? err.message : "Please try again.",
        });
      });
    return () => {
      alive = false;
    };
  }, [session, toast]);

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-charcoal-900">Saved repositories</h1>
            <p className="mt-1.5 text-sm text-charcoal-700/70">{session?.user.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>

        <div className="mt-8 rounded-3xl border border-cream-300 bg-cream-50/80 shadow-soft divide-y divide-cream-300/70">
          {rows === null && <p className="p-6 text-sm text-charcoal-700/60">Loading…</p>}
          {rows?.length === 0 && (
            <div className="p-8 text-center">
              <Bookmark className="mx-auto w-6 h-6 text-forest-300" />
              <p className="mt-3 text-sm text-charcoal-700/70">
                No bookmarks yet. Analyze a repository and save it.
              </p>
              <Link to="/analyze" className="mt-4 inline-block">
                <Button>Analyze a repo</Button>
              </Link>
            </div>
          )}
          {rows?.map((r) => (
            <Link
              key={r.fullName}
              to="/analyze"
              search={{ repo: r.fullName }}
              className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-cream-200/50 transition-colors"
            >
              <span className="font-mono text-sm text-charcoal-800">{r.fullName}</span>
              <span className="flex items-center gap-3 text-sm">
                <span className="text-charcoal-700/60">{r.healthScore}</span>
                <span className="w-7 text-center font-bold text-forest-600">{r.healthGrade}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
