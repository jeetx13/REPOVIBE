/*
# Create RepoVibe database schema

RepoVibe analyzes GitHub repositories and produces a health report
(score, grade, contributor stats, commit/issue/PR trends). This
migration creates the persistence layer so analyses are saved and
can be re-viewed without re-running the analysis.

This is a single-tenant app with NO sign-in screen. All policies
use `TO anon, authenticated` so the anon-key frontend can read and
write its own data.

## 1. New Tables

### `repos`
Catalog of repositories that have been analyzed.
- `id` (uuid, PK)
- `owner` (text, GitHub owner/org, e.g. "facebook")
- `name` (text, repo name, e.g. "react")
- `full_name` (text, "owner/repo", unique)
- `description` (text, nullable — GitHub repo description)
- `analyzed_count` (int, how many times analyzed, default 1)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `analyses`
One row per analysis run for a repo. Key scalar metrics are stored
as typed columns for queryability; the full nested report (trend
arrays, contributor details, sub-scores) is stored as JSONB in
`report_json`.
- `id` (uuid, PK)
- `repo_id` (uuid, FK -> repos.id ON DELETE CASCADE)
- `health_score` (int, 0-100)
- `health_grade` (text, A/B/C/D/F)
- `commit_freq_score` (int)
- `issue_staleness_score` (int)
- `bus_factor_score` (int)
- `contributor_growth_score` (int)
- `pr_merge_score` (int)
- `activity_recency_score` (int)
- `bus_factor_value` (int)
- `active_contributors` (int)
- `median_pr_hours` (int)
- `open_issues` (int)
- `last_push_days` (int)
- `delta_health_score` (int)
- `delta_commits` (int)
- `delta_issues` (int)
- `delta_bus_factor` (int)
- `delta_pr_merge_hours` (int)
- `report_json` (jsonb, full RepoAnalysis object for the dashboard)
- `analyzed_at` (timestamptz, default now())

### `contributors`
Normalized top-contributor rows per analysis. One row per
contributor per analysis.
- `id` (uuid, PK)
- `analysis_id` (uuid, FK -> analyses.id ON DELETE CASCADE)
- `login` (text, GitHub username)
- `avatar` (text, avatar URL)
- `commits` (int)
- `share` (numeric, 0..1)
- `rank` (int, 1-based ranking)
- `created_at` (timestamptz)

## 2. Indexes
- `repos.full_name` — unique lookup by "owner/repo"
- `analyses.repo_id` — list analyses for a repo
- `analyses(analyzed_at DESC)` — recent analyses first
- `contributors.analysis_id` — contributors for an analysis

## 3. Security (RLS)
- Enable RLS on all three tables.
- `repos`, `analyses`, `contributors`: full CRUD for
  `anon, authenticated` (single-tenant, intentionally public data).

## 4. Notes
- `report_json` stores the complete RepoAnalysis payload so the
  dashboard can re-render identically from a saved analysis.
- `repos.analyzed_count` increments when a repo is re-analyzed.
- Cascade deletes: deleting a repo removes its analyses and
  their contributors.
*/

-- ── repos ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner         text NOT NULL,
  name          text NOT NULL,
  full_name     text NOT NULL UNIQUE,
  description   text,
  analyzed_count int NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE repos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_repos" ON repos;
CREATE POLICY "anon_select_repos" ON repos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_repos" ON repos;
CREATE POLICY "anon_insert_repos" ON repos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_repos" ON repos;
CREATE POLICY "anon_update_repos" ON repos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_repos" ON repos;
CREATE POLICY "anon_delete_repos" ON repos FOR DELETE
  TO anon, authenticated USING (true);

-- ── analyses ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id                uuid NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  health_score           int NOT NULL DEFAULT 0,
  health_grade           text NOT NULL DEFAULT 'F',
  commit_freq_score      int NOT NULL DEFAULT 0,
  issue_staleness_score  int NOT NULL DEFAULT 0,
  bus_factor_score       int NOT NULL DEFAULT 0,
  contributor_growth_score int NOT NULL DEFAULT 0,
  pr_merge_score         int NOT NULL DEFAULT 0,
  activity_recency_score int NOT NULL DEFAULT 0,
  bus_factor_value       int NOT NULL DEFAULT 0,
  active_contributors    int NOT NULL DEFAULT 0,
  median_pr_hours        int NOT NULL DEFAULT 0,
  open_issues            int NOT NULL DEFAULT 0,
  last_push_days         int NOT NULL DEFAULT 0,
  delta_health_score     int NOT NULL DEFAULT 0,
  delta_commits          int NOT NULL DEFAULT 0,
  delta_issues           int NOT NULL DEFAULT 0,
  delta_bus_factor       int NOT NULL DEFAULT 0,
  delta_pr_merge_hours   int NOT NULL DEFAULT 0,
  report_json            jsonb NOT NULL DEFAULT '{}'::jsonb,
  analyzed_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analyses" ON analyses;
CREATE POLICY "anon_select_analyses" ON analyses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analyses" ON analyses;
CREATE POLICY "anon_insert_analyses" ON analyses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analyses" ON analyses;
CREATE POLICY "anon_update_analyses" ON analyses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analyses" ON analyses;
CREATE POLICY "anon_delete_analyses" ON analyses FOR DELETE
  TO anon, authenticated USING (true);

-- ── contributors ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contributors (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id  uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  login        text NOT NULL,
  avatar       text,
  commits      int NOT NULL DEFAULT 0,
  share        numeric(5,4) NOT NULL DEFAULT 0,
  rank         int NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contributors" ON contributors;
CREATE POLICY "anon_select_contributors" ON contributors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contributors" ON contributors;
CREATE POLICY "anon_insert_contributors" ON contributors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contributors" ON contributors;
CREATE POLICY "anon_update_contributors" ON contributors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contributors" ON contributors;
CREATE POLICY "anon_delete_contributors" ON contributors FOR DELETE
  TO anon, authenticated USING (true);

-- ── indexes ────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_repos_full_name ON repos(full_name);
CREATE INDEX IF NOT EXISTS idx_analyses_repo_id ON analyses(repo_id);
CREATE INDEX IF NOT EXISTS idx_analyses_analyzed_at_desc ON analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributors_analysis_id ON contributors(analysis_id);

-- ── updated_at trigger for repos ───────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repos_updated_at ON repos;
CREATE TRIGGER trg_repos_updated_at
  BEFORE UPDATE ON repos
  FOR EACH ROW
  EXECUTE FUNCTION touch_updated_at();
