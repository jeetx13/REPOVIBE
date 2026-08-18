/*
# Add increment_analyzed_count RPC

A SECURITY DEFINER function that atomically increments the
`analyzed_count` column on the `repos` table. Called from the
frontend after upserting a repo, to track how many times each
repository has been analyzed.

## 1. Functions
- `increment_analyzed_count(p_repo_id uuid)` — increments
  `repos.analyzed_count` by 1 for the given repo id, returns
  the new count. SECURITY DEFINER so the UPDATE is atomic.
- Granted EXECUTE to `anon` and `authenticated`.

## 2. Notes
- SECURITY DEFINER is used for atomicity (read-modify-write
  without race conditions). The function only increments a
  counter — it does not expose any sensitive data.
*/

CREATE OR REPLACE FUNCTION increment_analyzed_count(p_repo_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count int;
BEGIN
  UPDATE repos SET analyzed_count = analyzed_count + 1
    WHERE id = p_repo_id
    RETURNING analyzed_count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_analyzed_count TO anon, authenticated;
