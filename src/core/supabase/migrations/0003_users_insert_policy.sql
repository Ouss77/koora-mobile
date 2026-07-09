-- L'insertion se fait désormais côté serveur via le trigger (0003), plus besoin
-- que le client insère lui-même dans public.users.
drop policy if exists "Users can insert own profile" on public.users;