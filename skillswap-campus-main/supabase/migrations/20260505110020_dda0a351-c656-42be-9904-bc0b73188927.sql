
REVOKE EXECUTE ON FUNCTION public.update_reputation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_exchanges() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
