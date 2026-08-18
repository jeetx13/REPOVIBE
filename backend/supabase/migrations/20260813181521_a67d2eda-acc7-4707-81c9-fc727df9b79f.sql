REVOKE EXECUTE ON FUNCTION public.increment_analyzed_count(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;