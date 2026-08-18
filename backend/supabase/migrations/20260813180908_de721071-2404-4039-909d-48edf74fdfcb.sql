CREATE TABLE public.repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner text NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  stars integer NOT NULL DEFAULT 0,
  forks integer NOT NULL DEFAULT 0,
  language text,
  analyzed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.repos TO anon, authenticated;
GRANT ALL ON public.repos TO service_role;
ALTER TABLE public.repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Repos are publicly readable" ON public.repos FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id uuid NOT NULL REFERENCES public.repos(id) ON DELETE CASCADE,
  health_score integer NOT NULL,
  health_grade text NOT NULL,
  commit_freq_score integer NOT NULL DEFAULT 0,
  issue_staleness_score integer NOT NULL DEFAULT 0,
  bus_factor_score integer NOT NULL DEFAULT 0,
  contributor_growth_score integer NOT NULL DEFAULT 0,
  pr_merge_score integer NOT NULL DEFAULT 0,
  activity_recency_score integer NOT NULL DEFAULT 0,
  bus_factor_value integer NOT NULL DEFAULT 0,
  active_contributors integer NOT NULL DEFAULT 0,
  median_pr_hours integer NOT NULL DEFAULT 0,
  open_issues integer NOT NULL DEFAULT 0,
  last_push_days integer NOT NULL DEFAULT 0,
  delta_health_score integer NOT NULL DEFAULT 0,
  delta_commits integer NOT NULL DEFAULT 0,
  delta_issues integer NOT NULL DEFAULT 0,
  delta_bus_factor integer NOT NULL DEFAULT 0,
  delta_pr_merge_hours integer NOT NULL DEFAULT 0,
  report_json jsonb NOT NULL,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analyses_repo_analyzed_idx ON public.analyses (repo_id, analyzed_at DESC);
GRANT SELECT ON public.analyses TO anon, authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analyses are publicly readable" ON public.analyses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  login text NOT NULL,
  avatar text NOT NULL DEFAULT '',
  commits integer NOT NULL DEFAULT 0,
  share numeric NOT NULL DEFAULT 0,
  rank integer NOT NULL DEFAULT 1
);
CREATE INDEX contributors_analysis_idx ON public.contributors (analysis_id, rank);
GRANT SELECT ON public.contributors TO anon, authenticated;
GRANT ALL ON public.contributors TO service_role;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors are publicly readable" ON public.contributors FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.saved_repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES public.repos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, repo_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_repos TO authenticated;
GRANT ALL ON public.saved_repos TO service_role;
ALTER TABLE public.saved_repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own saved repos" ON public.saved_repos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own saved repos" ON public.saved_repos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own saved repos" ON public.saved_repos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_analyzed_count(p_repo_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.repos SET analyzed_count = analyzed_count + 1, updated_at = now() WHERE id = p_repo_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();