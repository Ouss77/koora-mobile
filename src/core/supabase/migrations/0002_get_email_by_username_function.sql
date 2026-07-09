-- ADR (voir TDD v1.2, section 10) : cette fonction traduit un username en
-- email pour permettre la connexion par pseudo via Supabase Auth (qui exige
-- un email en interne pour signInWithPassword). Elle expose indirectement
-- l'existence d'un username (retourne null sinon un email) — un risque
-- d'énumération jugé acceptable pour le MVP. À réévaluer (rate limiting ou
-- réponse toujours non-null) si la base d'utilisateurs grossit
-- significativement.
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.users where username = p_username limit 1;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;