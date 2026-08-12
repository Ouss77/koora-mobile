-- =====================================================
-- KOORA V1 — Migration 002 : Fondations Administration
-- Sprint 8 — Issue [SQL]
--
-- À exécuter dans le SQL Editor Supabase APRÈS commit.
-- Complète 001 (schéma v1) : « Admin policies should be
-- added later using a role check function » — c'est ici.
-- =====================================================

-- =====================
-- 1. is_admin()
-- =====================
-- SECURITY DEFINER : doit lire public.users en contournant la RLS
-- (la policy SELECT ne laisse voir que son propre profil, ce qui
-- suffit ici, mais DEFINER + STABLE rend la fonction utilisable
-- dans les policies sans récursion RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- =====================
-- 2. set_match_result()
-- =====================
-- LE cœur du module admin. Une seule transaction :
--   résultat du match + recalcul de TOUS les points liés.
-- Sert pour la saisie ET la correction (idempotente : relancer
-- avec un autre résultat écrase et recalcule tout).
-- Barème MVP : correct = 3, incorrect = 0 (CdC §4.4).
create or replace function public.set_match_result(
  p_match_id uuid,
  p_result public.match_result
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Autorisation vérifiée EN BASE, jamais seulement dans l'UI.
  if not public.is_admin() then
    raise exception 'Accès refusé : privilèges administrateur requis'
      using errcode = '42501';
  end if;

  -- Le match doit exister et son coup d'envoi être passé :
  -- on ne saisit pas le résultat d'un match à venir (CdC §3.4/§4.4).
  if not exists (
    select 1 from public.matches
    where id = p_match_id
      and kickoff_at <= now()
  ) then
    raise exception 'Match introuvable ou pas encore commencé';
  end if;

  update public.matches
  set result = p_result,
      status = 'finished'
  where id = p_match_id;

  -- Recalcul atomique : si cette ligne échoue, l'UPDATE du match
  -- est annulé aussi (même transaction). L'état « résultat changé,
  -- points figés » observé en fin de Sprint 7 devient impossible.
  update public.predictions
  set points_awarded = case
        when prediction = p_result then 3
        else 0
      end
  where match_id = p_match_id;
end;
$$;

revoke execute on function public.set_match_result(uuid, public.match_result) from public, anon;
grant execute on function public.set_match_result(uuid, public.match_result) to authenticated;

-- =====================
-- 3. Policies admin sur matches
-- =====================
-- Rappel : la policy SELECT « Authenticated users can read matches »
-- (migration 001) couvre déjà la lecture, admins inclus.

create policy "Admins can create future matches"
on public.matches
for insert
to authenticated
with check (
  public.is_admin()
  and kickoff_at > now()          -- CdC §4.1 : jamais de match dans le passé
);

create policy "Admins can update matches"
on public.matches
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- GARDE-FOU CRITIQUE : le FK predictions.match_id est en
-- ON DELETE CASCADE. Sans le NOT EXISTS, supprimer un match
-- effacerait silencieusement les pronostics (violation CdC §4.3).
create policy "Admins can delete matches without predictions"
on public.matches
for delete
to authenticated
using (
  public.is_admin()
  and not exists (
    select 1 from public.predictions p
    where p.match_id = matches.id
  )
);

-- =====================
-- 4. Durcissement : figer un match pronostiqué (CdC §4.2)
-- =====================
-- Si ≥1 pronostic existe, équipes et coup d'envoi deviennent
-- immuables. Seuls result/status restent modifiables (donc
-- set_match_result passe, la modification d'équipes est bloquée
-- même pour un admin qui contournerait le service).
create or replace function public.protect_predicted_match()
returns trigger
language plpgsql
as $$
begin
  if (new.team1      is distinct from old.team1
   or new.team2      is distinct from old.team2
   or new.kickoff_at is distinct from old.kickoff_at)
  and exists (
    select 1 from public.predictions p
    where p.match_id = old.id
  ) then
    raise exception 'Match verrouillé : des pronostics existent, seuls le résultat et le statut sont modifiables';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_predicted_match on public.matches;
create trigger trg_protect_predicted_match
before update on public.matches
for each row
execute function public.protect_predicted_match();

-- Ajout découvert lors des tests : l'admin doit lire tous les
-- pronostics (compteurs, vérifications). Les policies permissives
-- se cumulent en OR : les users gardent l'accès aux leurs uniquement.
-- La restriction CdC §3.7 vise les joueurs, pas l'administrateur.
create policy "Admins can read all predictions"
on public.predictions
for select
to authenticated
using (public.is_admin());

-- =====================
-- 5. Vérification : rôle non modifiable par l'utilisateur
-- =====================
-- AUCUNE policy UPDATE n'existe sur public.users (migration 001) :
-- avec RLS activée, absence de policy = refus par défaut.
-- Un utilisateur ne peut donc PAS modifier son propre rôle.
-- Cette section est volontairement vide — ne jamais ajouter de
-- policy UPDATE ouverte sur users sans exclure la colonne role.

-- =====================================================
-- TESTS (à dérouler dans le SQL Editor — critères de l'issue)
-- =====================================================
-- Session USER (Run as… un compte role='user') :
--   select public.set_match_result('<match_id>', 'team1');
--     → attendu : exception « privilèges administrateur requis »
--   insert into public.matches (team1, team2, kickoff_at)
--     values ('X', 'Y', now() + interval '1 day');
--     → attendu : violation de policy
--   update public.users set role = 'admin' where id = auth.uid();
--     → attendu : 0 ligne modifiée (refus RLS)
--
-- Session ADMIN :
--   select public.set_match_result('<match_id_passé>', 'team1');
--     → attendu : match finished, corrects = 3, incorrects = 0
--   select public.set_match_result('<même_id>', 'draw');
--     → attendu : tous les points recalculés (correction)
--   delete from public.matches where id = '<match_avec_pronostics>';
--     → attendu : 0 ligne supprimée (policy NOT EXISTS)
--   update public.matches set team1 = 'Z' where id = '<match_avec_pronostics>';
--     → attendu : exception « Match verrouillé »
-- =====================================================