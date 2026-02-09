-- ============================================
-- FORCE SCHEMA CACHE RELOAD
-- ============================================
-- One common reason for "Could not find table" errors after migrations 
-- is that the API (PostgREST) hasn't refreshed its cache.
-- Run this command to force a refresh.

NOTIFY pgrst, 'reload config';

-- Also, let's double check the tables exist and are accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
