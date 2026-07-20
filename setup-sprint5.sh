# KOORA — Sprint 5 : Classement général (Ranking)

Document prêt à copier-coller dans GitHub (Epic → Issues) + script `gh` en fin de fichier.

**Milestone :** `Sprint 5 — Ranking System`
**Labels :** `epic`, `feature`, `database`, `repository`, `service`, `hooks`, `ui`, `testing`, `priority:high`, `priority:medium`
**Convention Git :** `main` seul · une branche `feature/*` par issue · une PR par issue · merge `--squash` avec `Closes #N` · `--delete-branch`.

---

## 🎯 EPIC

> **Titre :** `[EPIC] Classement général`
> **Labels :** `epic`, `feature`, `priority:high`

```markdown
## User story

En tant que joueur, je veux consulter le classement général de tous les
participants trié par points, afin de situer ma performance dans la communauté.

## Objectif

Exposer un classement global de tous les joueurs, trié par points décroissants,
avec gestion des égalités (même rang partagé). Le calcul est agrégé côté base
(fonction SQL SECURITY DEFINER), car la RLS interdit à un client de lire les
pronostics et pseudos des autres joueurs.

## Périmètre (couche par couche, TDD v1.2)

- Fonction d'agrégation SQL `get_ranking()` (source de vérité du classement)
- Accès données (`RankingRepository` via `supabase.rpc`)
- Logique métier + erreurs typées (`RankingService`)
- État serveur / cache (`useRanking`, queryKey `['ranking']`)
- Composants + écran (`RankingScreen`, `RankingItem`, `RankingHeader`, `EmptyRanking`)
- Intégration, navigation, tests manuels

## Hors périmètre

- Attribution des points (flux Admin « saisie du résultat » — CdC §4.4, sprint Admin)
- Évolution du rang dans le temps, historique
- Filtres / recherche dans le classement

## Références

- Cahier des Charges v1.1 — §3.6 Classement général
- TDD v1.2 — §6 (RankingRepository = vue/agrégat), §7 (queryKey `['ranking']`)

## Note technique importante

Tant que le flux Admin de saisie des résultats n'existe pas, `points_awarded`
vaut 0 partout : le classement affichera tout le monde à 0. Validation « réelle »
= seeder manuellement quelques `points_awarded` en base (voir Issue 1).

## Issues

- [ ] #1 [DB] Fonction d'agrégation `get_ranking()`
- [ ] #2 [Repository] RankingRepository + types + mapper
- [ ] #3 [Service] RankingService
- [ ] #4 [Hook] useRanking
- [ ] #5 [Components] RankingItem / RankingHeader / EmptyRanking
- [ ] #6 [Screen] RankingScreen
- [ ] #7 [QA] Intégration, navigation, tests manuels

## Definition of Done (Epic)

- [ ] Un joueur connecté voit tous les joueurs triés par points décroissants
- [ ] Les égalités partagent le même rang (RANK avec saut : 1, 1, 3)
- [ ] Chaque ligne affiche position, pseudo, points, pronostics, corrects, % réussite
- [ ] États loading / erreur / liste vide gérés
- [ ] Aucun écran n'appelle Supabase ni un Service directement
- [ ] Cache invalidé via `invalidateQueries(['ranking'])`
```

---

## Issue 1 — [DB] Fonction d'agrégation `get_ranking()`

> **Labels :** `database`, `feature`, `priority:high` · **Branche :** `feature/ranking-db-function` · **Dépend de :** —

```markdown
## Objectif

Créer la source de vérité du classement côté base. La RLS (`users` et
`predictions` limités à `auth.uid()`) empêche tout calcul client-side : on passe
par une fonction SQL `SECURITY DEFINER` qui n'expose que des colonnes agrégées
non sensibles (jamais les pronostics bruts).

## Fichier

- `supabase/get_ranking.sql` (versionné dans le repo, exécuté dans le SQL Editor Supabase)

## Tâches

- [ ] Fonction `public.get_ranking()` `SECURITY DEFINER`, `set search_path = ''`
- [ ] Colonnes : `user_id`, `username`, `points`, `matches_played`,
      `correct_predictions`, `accuracy`, `rank`
- [ ] `points` = `SUM(points_awarded)` (0 si aucun pronostic)
- [ ] `matches_played` = pronostics sur matchs **terminés** (`status = 'finished'`)
- [ ] `correct_predictions` = pronostics terminés avec `points_awarded > 0`
- [ ] `accuracy` = pourcentage entier 0–100 (`round(correct*100/played)`, 0 si played=0)
- [ ] `rank` = `RANK() OVER (ORDER BY points DESC)` (saut après égalité)
- [ ] Fonction `public.get_current_user_rank()` (ligne du joueur connecté)
- [ ] `REVOKE ... FROM public` + `GRANT EXECUTE ... TO authenticated`

## Critères d'acceptation

- [ ] Un utilisateur authentifié obtient TOUS les joueurs via `rpc('get_ranking')`
- [ ] Un `anon` ne peut pas exécuter la fonction
- [ ] La fonction n'expose aucun pronostic individuel
- [ ] Deux joueurs à égalité ont le même `rank`, le suivant saute (1, 1, 3)
- [ ] Un joueur sans pronostic apparaît avec 0 points / 0 % (pas absent)

## Note

Snippet de seed manuel fourni pour valider avec des points ≠ 0 (voir code de l'issue).
```

---

## Issue 2 — [Repository] RankingRepository + types + mapper

> **Labels :** `repository`, `feature`, `priority:high` · **Branche :** `feature/ranking-repository` · **Dépend de :** #1

```markdown
## Objectif

Encapsuler l'appel `supabase.rpc('get_ranking')` et traduire snake_case → camelCase.
Aucune règle métier ici.

## Fichiers

- `features/ranking/types/ranking.ts`
- `features/ranking/mappers/rankingMapper.ts`
- `features/ranking/repositories/IRankingRepository.ts`
- `features/ranking/repositories/RankingRepository.ts`

## Tâches

- [ ] Type `RankingUser` : `id`, `username`, `points`, `rank`, `matchesPlayed`,
      `correctPredictions`, `accuracy`
- [ ] Interface `IRankingRepository` : `getRanking(): Promise<RankingUser[]>`,
      `getCurrentUserRank(): Promise<RankingUser | null>`
- [ ] Mapper `mapRowToRankingUser` (snake_case DB → camelCase domaine)
- [ ] Implémentation appelant `supabase.rpc('get_ranking')` / `get_current_user_rank`
- [ ] Conversion des erreurs Supabase → erreur typée du domaine (pas de `throw new Error(msg)` brut)

## Critères d'acceptation

- [ ] Aucune règle métier (aucun tri/filtre décisionnel, aucun calcul)
- [ ] Aucun `any` ; entrées/sorties entièrement typées
- [ ] Le domaine ne voit jamais un `matches_played` (camelCase only en sortie)
- [ ] Les erreurs réseau / RLS sont converties en erreur typée
```

---

## Issue 3 — [Service] RankingService

> **Labels :** `service`, `feature`, `priority:high` · **Branche :** `feature/ranking-service` · **Dépend de :** #2

```markdown
## Objectif

Centraliser la logique métier du classement et exposer une API simple aux hooks.
Ne connaît jamais Supabase.

## Fichier

- `features/ranking/services/RankingService.ts`

## Tâches

- [ ] `getRanking(): Promise<RankingUser[]>` (délègue au repository)
- [ ] `getMyRank(): Promise<RankingUser | null>`
- [ ] Gestion et propagation d'erreurs typées
- [ ] Point d'extension documenté si un tri/formatage supplémentaire devient nécessaire

## Critères d'acceptation

- [ ] Le Service n'importe jamais le client Supabase
- [ ] Aucun `any`
- [ ] Appelable depuis un hook et testable via celui-ci
```

---

## Issue 4 — [Hook] useRanking

> **Labels :** `hooks`, `feature`, `priority:medium` · **Branche :** `feature/ranking-hook` · **Dépend de :** #3

```markdown
## Objectif

Exposer l'état serveur du classement via TanStack Query.

## Fichier

- `features/ranking/hooks/useRanking.ts`

## Tâches

- [ ] `useRanking()` sur `queryKey: ['ranking']`, `queryFn` = `RankingService.getRanking`
- [ ] Expose `data`, `isLoading`, `isError`, `error`, `refetch`
- [ ] (Optionnel) `useMyRank()` sur `['ranking', 'me']`
- [ ] `staleTime` raisonnable (le classement ne change qu'à la saisie d'un résultat)

## Critères d'acceptation

- [ ] Le hook consomme le Service, jamais le repository ni Supabase
- [ ] loading / error / refetch / cache fonctionnels
- [ ] Prêt pour `invalidateQueries(['ranking'])` (sera déclenché côté Admin)
```

---

## Issue 5 — [Components] RankingItem / RankingHeader / EmptyRanking

> **Labels :** `ui`, `feature`, `priority:medium` · **Branche :** `feature/ranking-components` · **Dépend de :** #2 (types)

```markdown
## Objectif

Composants d'affichage réutilisables, sans logique métier, NativeWind uniquement.

## Fichiers

- `features/ranking/components/RankingItem.tsx`
- `features/ranking/components/RankingHeader.tsx`
- `features/ranking/components/EmptyRanking.tsx`

## Tâches

- [ ] `RankingItem` : position (🥇🥈🥉 pour 1/2/3, sinon numéro), pseudo, points,
      pronostics, corrects, % réussite — `React.memo`
- [ ] `RankingHeader` : en-tête de colonnes
- [ ] `EmptyRanking` : état liste vide
- [ ] Style via NativeWind + composants UI existants, zéro style inline

## Critères d'acceptation

- [ ] Composants purs (props in → UI out), aucun accès données
- [ ] Respect du Design System existant
- [ ] `RankingItem` mémoïsé
```

---

## Issue 6 — [Screen] RankingScreen

> **Labels :** `ui`, `feature`, `priority:medium` · **Branche :** `feature/ranking-screen` · **Dépend de :** #4, #5

```markdown
## Objectif

Assembler l'écran de classement à partir du hook et des composants.

## Fichier

- `features/ranking/screens/RankingScreen.tsx`

## Tâches

- [ ] Consomme `useRanking()`
- [ ] `FlatList` (keyExtractor sur `id`, `renderItem` = `RankingItem`)
- [ ] États : loading (spinner), erreur (message + retry), vide (`EmptyRanking`), liste
- [ ] `RankingHeader` en `ListHeaderComponent`

## Critères d'acceptation

- [ ] Zéro logique métier dans l'écran
- [ ] N'appelle ni Service ni Supabase directement (uniquement le hook)
- [ ] Les 4 états sont visibles et corrects
```

---

## Issue 7 — [QA] Intégration, navigation, tests manuels

> **Labels :** `testing`, `priority:high` · **Branche :** `feature/ranking-integration` · **Dépend de :** #1–#6

```markdown
## Objectif

Brancher l'écran dans la navigation et valider le sprint de bout en bout.

## Tâches

- [ ] Enregistrer `RankingScreen` dans la navigation (Expo Router)
- [ ] Vérifier TypeScript (0 erreur), ESLint (0 warning), imports/ fichiers morts
- [ ] Confirmer qu'aucun écran ne parle à Supabase ; logique métier bien dans le Service

## Tests manuels (checklist CdC §3.6)

- [ ] Le classement charge correctement
- [ ] Le loading s'affiche
- [ ] Une erreur (couper le réseau) s'affiche proprement
- [ ] Liste vide gérée
- [ ] Joueurs triés par points décroissants
- [ ] Égalités : même rang, saut ensuite (seed 45/45/42 → 1,1,3)
- [ ] Cache : après `invalidateQueries(['ranking'])`, refetch OK
```

---

## ⚡ Création via GitHub CLI

À exécuter depuis le dossier du dépôt. Les labels déjà créés au Sprint 4 renverront
une erreur inoffensive (ignorable).

```bash
# 1. Labels (idempotent : ignore les erreurs "already exists")
gh label create epic --color 5319E7 2>/dev/null || true
gh label create feature --color 0E8A16 2>/dev/null || true
gh label create database --color 0052CC 2>/dev/null || true
gh label create repository --color 1D76DB 2>/dev/null || true
gh label create service --color 1D76DB 2>/dev/null || true
gh label create hooks --color 1D76DB 2>/dev/null || true
gh label create ui --color 1D76DB 2>/dev/null || true
gh label create testing --color FBCA04 2>/dev/null || true
gh label create "priority:high" --color B60205 2>/dev/null || true
gh label create "priority:medium" --color D93F0B 2>/dev/null || true

# 2. Milestone
gh api repos/:owner/:repo/milestones -f title="Sprint 5 — Ranking System" \
  -f description="Classement général : fonction SQL, repository, service, hook, UI, intégration" \
  2>/dev/null || true

MS="Sprint 5 — Ranking System"

# 3. Epic
gh issue create --title "[EPIC] Classement général" \
  --label epic --label feature --label "priority:high" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir le body de l'EPIC dans KOORA_Sprint5_GitHub.md (copier tel quel).
EOF
)"

# 4. Issues
gh issue create --title "[DB] Fonction d'agrégation get_ranking()" \
  --label database --label feature --label "priority:high" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 1 dans KOORA_Sprint5_GitHub.md.
EOF
)"

gh issue create --title "[Repository] RankingRepository + types + mapper" \
  --label repository --label feature --label "priority:high" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 2 dans KOORA_Sprint5_GitHub.md.
EOF
)"

gh issue create --title "[Service] RankingService" \
  --label service --label feature --label "priority:high" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 3 dans KOORA_Sprint5_GitHub.md.
EOF
)"

gh issue create --title "[Hook] useRanking" \
  --label hooks --label feature --label "priority:medium" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 4 dans KOORA_Sprint5_GitHub.md.
EOF
)"

gh issue create --title "[Components] RankingItem / RankingHeader / EmptyRanking" \
  --label ui --label feature --label "priority:medium" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 5 dans KOORA_Sprint5_GitHub.md.
EOF
)"

gh issue create --title "[Screen] RankingScreen" \
  --label ui --label feature --label "priority:medium" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 6 dans KOORA_Sprint5_GitHub.md.
EOF
)"

gh issue create --title "[QA] Intégration, navigation, tests manuels" \
  --label testing --label "priority:high" --milestone "$MS" \
  --body "$(cat <<'EOF'
Voir Issue 7 dans KOORA_Sprint5_GitHub.md.
EOF
)"
```

> Astuce : pour des bodies complets sans placeholder, découpe chaque section en
> `issue1.md … issue7.md` et remplace `--body "$(...)"` par `--body-file issueN.md`
> (comme au Sprint 4). Puis remplace les `#1…#7` de la checklist de l'epic par les
> vrais numéros pour le suivi automatique des cases.