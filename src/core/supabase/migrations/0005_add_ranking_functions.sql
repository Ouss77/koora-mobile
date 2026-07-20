-- =====================================================
-- KOORA V1 — Sprint 5 / Issue 1
-- Classement général : agrégation côté base
-- =====================================================
-- Pourquoi une fonction SECURITY DEFINER et non un SELECT client :
--   Les policies RLS limitent `users` et `predictions` à auth.uid().
--   Un client ne peut donc PAS lire les pseudos/points des autres joueurs.
--   Cette fonction s'exécute avec les droits du propriétaire (bypass RLS),
--   mais ne renvoie QUE des colonnes agrégées non sensibles.
-- =====================================================

-- =====================
-- get_ranking()
-- Retourne le classement complet, un enregistrement par joueur.
-- =====================
create or replace function public.get_ranking()
returns table (
    user_id             uuid,
    username            text,
    points              integer,
    matches_played      integer,
    correct_predictions integer,
    accuracy            integer,   -- pourcentage entier 0..100
    rank                integer
)
language sql
stable
security definer
set search_path = ''
as $$
    with stats as (
        select
            u.id                                        as user_id,
            u.username::text                            as username,
            coalesce(sum(p.points_awarded), 0)::integer as points,
            count(p.id) filter (
                where m.status = 'finished'
            )::integer                                  as matches_played,
            count(p.id) filter (
                where m.status = 'finished' and p.points_awarded > 0
            )::integer                                  as correct_predictions
        from public.users u
        left join public.predictions p on p.user_id = u.id
        left join public.matches m     on m.id = p.match_id
        group by u.id, u.username
    )
    select
        s.user_id,
        s.username,
        s.points,
        s.matches_played,
        s.correct_predictions,
        case
            when s.matches_played > 0
                then round(s.correct_predictions * 100.0 / s.matches_played)::integer
            else 0
        end                                             as accuracy,
        rank() over (order by s.points desc)::integer   as rank
    from stats s
    order by rank, s.username;
$$;

-- =====================
-- get_current_user_rank()
-- Retourne uniquement la ligne du joueur connecté.
-- =====================
create or replace function public.get_current_user_rank()
returns table (
    user_id             uuid,
    username            text,
    points              integer,
    matches_played      integer,
    correct_predictions integer,
    accuracy            integer,
    rank                integer
)
language sql
stable
security definer
set search_path = ''
as $$
    select r.*
    from public.get_ranking() r
    where r.user_id = auth.uid();
$$;

-- =====================
-- Permissions
-- Anon interdit ; seuls les utilisateurs authentifiés exécutent.
-- =====================
revoke all on function public.get_ranking()            from public;
revoke all on function public.get_current_user_rank()  from public;
grant execute on function public.get_ranking()           to authenticated;
grant execute on function public.get_current_user_rank() to authenticated;

-- =====================================================
-- SEED DE TEST (optionnel) — à exécuter à part pour valider
-- des points ≠ 0 tant que le flux Admin n'existe pas.
-- Remplace les UUID par de vrais id de public.users / public.matches.
-- =====================================================
-- 1) Marquer un match comme terminé avec un résultat :
--    update public.matches
--       set status = 'finished', result = 'team1'
--     where id = '<MATCH_UUID>';
--
-- 2) Attribuer les points manuellement (3 si correct, 0 sinon) :
--    update public.predictions
--       set points_awarded = 3
--     where match_id = '<MATCH_UUID>' and prediction = 'team1';
--    update public.predictions
--       set points_awarded = 0
--     where match_id = '<MATCH_UUID>' and prediction <> 'team1';
--
-- 3) Vérifier :
--    select * from public.get_ranking();