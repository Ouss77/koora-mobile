-- =====================================================
-- KOORA — Outils de TEST (SQL)
-- =====================================================
-- ⚠️  OUTILS DE TEST UNIQUEMENT — PAS DU CODE DE PRODUCTION.
--
-- set_match_result() préfigure le flux Admin (CdC §4.4) mais reste à DURCIR
-- au sprint Admin :
--   - contrôle de rôle (seul un admin peut clôturer un match)
--   - contrôle d'état (autoriser 'locked' -> 'finished', pas 'upcoming' direct)
--   - invalidation du cache côté app (['matches'], ['ranking'])
--
-- À exécuter dans le SQL Editor Supabase.
-- =====================================================


-- =====================================================
-- 1) RESET (DÉSACTIVÉ PAR SÉCURITÉ)
-- Décommente ces deux lignes UNIQUEMENT quand tu veux repartir de zéro.
-- Les comptes (public.users / auth.users) ne sont pas touchés.
-- =====================================================
-- delete from public.predictions;
-- delete from public.matches;


-- =====================================================
-- 2) set_match_result() — clôture un match et attribue les points
--   - écrit result + status = 'finished' sur le match
--   - 3 points si prediction = result, 0 sinon
--   - relançable => recalcul automatique (correction d'un résultat)
-- =====================================================
create or replace function public.set_match_result(
    p_match_id uuid,
    p_result   public.match_result
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.matches
       set result = p_result,
           status = 'finished'
     where id = p_match_id;

    update public.predictions
       set points_awarded = case
             when prediction = p_result then 3
             else 0
           end
     where match_id = p_match_id;
end;
$$;

-- Pas de grant à 'authenticated' : la fonction n'est appelable que depuis
-- le SQL Editor / service role. Le contrôle de rôle viendra au sprint Admin.
revoke all on function public.set_match_result(uuid, public.match_result) from public;


-- =====================================================
-- 3) USAGE (exemples, à décommenter au besoin)
-- =====================================================
-- Lister les matchs et leur UUID :
--   select id, team1, team2, status from public.matches order by kickoff_at;
--
-- Saisir un résultat (attribue les points) :
--   select public.set_match_result('<UUID_MATCH>', 'team1');
--
-- Lire le classement recalculé :
--   select * from public.get_ranking();