-- Refresh PostgREST after verified divergence between direct role-scoped SQL and REST authorization.
notify pgrst, 'reload schema';
