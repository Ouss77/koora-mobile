#!/usr/bin/env bash
# =============================================================================
# KOORA V1 — Sprint 8 : Administration (dernier sprint du périmètre V1)
# Milestone, projet, epic, 7 issues et branches liées, via GitHub CLI.
#
# Prérequis : gh auth login + gh auth refresh -s project
# Exécuter depuis la racine du dépôt, sur un `main` à jour. UNE SEULE FOIS.
# =============================================================================

set -euo pipefail

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
OWNER="${REPO%%/*}"
MILESTONE="Sprint 8 — Administration"
PROJECT_TITLE="KOORA V1"
DUE_ON="2026-08-31T23:59:59Z"   # ← ajuste la date de fin de sprint
CREATE_BRANCHES=true

echo "▶ Dépôt : $REPO"
BODIES="$(mktemp -d)"
trap 'rm -rf "$BODIES"' EXIT

# ---------------------------------------------------------------------------
# 1. Labels (idempotent)
# ---------------------------------------------------------------------------
echo "▶ Labels"
create_label() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null; }
create_label "epic"            "6E40C9" "Regroupe plusieurs issues"
create_label "feature"         "0E8A16" "Nouvelle fonctionnalité"
create_label "sql"             "336791" "Fonctions et policies PostgreSQL"
create_label "security"        "B60205" "Sécurité / RLS / autorisation"
create_label "repository"      "1D76DB" "Couche accès données"
create_label "service"         "0052CC" "Logique métier"
create_label "hooks"           "FBCA04" "TanStack Query"
create_label "ui"              "D93F0B" "Écrans et composants"
create_label "testing"         "C2E0C6" "QA, lint, build"
create_label "priority:high"   "B60205" "À faire en premier"
create_label "priority:medium" "FBCA04" "Priorité normale"

# ---------------------------------------------------------------------------
# 2. Milestone (idempotent)
# ---------------------------------------------------------------------------
echo "▶ Milestone"
if ! gh api "repos/$REPO/milestones?state=all" -q '.[].title' | grep -Fxq "$MILESTONE"; then
  gh api "repos/$REPO/milestones" \
    -f title="$MILESTONE" -f state="open" -f due_on="$DUE_ON" \
    -f description="Module Administration : fondations SQL (is_admin, set_match_result atomique, policies), autorisation par rôle, CRUD matchs, saisie/correction des résultats avec recalcul automatique des points. Clôture le périmètre fonctionnel V1." \
    >/dev/null
  echo "  créé"
else
  echo "  existe déjà"
fi

# ---------------------------------------------------------------------------
# 3. Projet
# ---------------------------------------------------------------------------
echo "▶ Projet"
PROJECT_NUMBER="$(gh project list --owner "$OWNER" --format json \
  -q ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" || true)"
if [ -z "$PROJECT_NUMBER" ]; then
  PROJECT_NUMBER="$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json -q .number)"
  echo "  créé (#$PROJECT_NUMBER)"
else
  echo "  existe déjà (#$PROJECT_NUMBER)"
fi

# ---------------------------------------------------------------------------
# 4. Corps des tickets
# ---------------------------------------------------------------------------
echo "▶ Rédaction des tickets"

cat > "$BODIES/epic.md" <<'MD'
## User story

En tant qu'administrateur, je veux gérer les matchs et saisir/corriger les
résultats afin que les points et le classement se mettent à jour
automatiquement pour tous les joueurs.

## Règles structurantes

1. **Le recalcul des points vit dans PostgreSQL, jamais dans le client.**
   Une fonction atomique `set_match_result(match_id, result)` en
   SECURITY DEFINER met à jour le match ET tous les `points_awarded` dans
   une seule transaction. Saisie et correction = le même appel (idempotent).
   → C'est ce qui rend impossible l'état incohérent observé en fin de
   Sprint 7 (résultat changé, points non recalculés).
2. **La sécurité est portée par la base.** `is_admin()` + policies RLS :
   masquer un bouton n'est jamais une protection. Un utilisateur `user`
   qui appelle directement l'API doit être refusé par PostgreSQL.
3. **Le FK `predictions.match_id` est en ON DELETE CASCADE** : sans policy
   de garde `NOT EXISTS (predictions)`, supprimer un match supprimerait
   silencieusement les pronostics (violation CdC §4.3). La policy DELETE
   porte ce garde-fou.
4. **Le statut affiché se dérive**, il ne se stocke pas : `finished` si
   résultat, sinon `locked` si `kickoff_at < now()`, sinon `upcoming`.
   Seule `set_match_result` écrit la colonne `status`.
5. **Invalidation après résultat** : `['matches']` + `['ranking']` +
   `['results']` ensemble (TDD §7, noté depuis le Sprint 7).

## Décisions actées

- **resetUserPassword : hors app pour la V1.** Réinitialiser le mot de
  passe d'un tiers exige la clé service_role, interdite dans un client
  mobile. Le CdC (« réinitialisation manuelle par l'administrateur ») est
  satisfait via le Dashboard Supabase. Version in-app = Edge Function → V2.
- Barème 3/0 points codé dans la fonction SQL (constante MVP).

## Suivi

(complété automatiquement par le script)
MD

cat > "$BODIES/1.md" <<'MD'
## Objectif

Poser les fondations SQL du module admin : autorisation, opération atomique
de résultat, policies. **Tout le reste du sprint dépend de cette issue.**

## Fichier

- `migrations/002_admin.sql` (nouveau — versionné dans le repo, puis exécuté
  dans le SQL Editor Supabase)

## Tâches

- [ ] Fonction `public.is_admin()` : `security definer`, `stable`,
      `set search_path = public` — retourne true si
      `users.role = 'admin'` pour `auth.uid()`
- [ ] Fonction `public.set_match_result(p_match_id uuid, p_result match_result)` :
      `security definer`, transactionnelle :
      1. `raise exception` si `not is_admin()`
      2. `update matches set result = p_result, status = 'finished'`
      3. `update predictions set points_awarded = case when prediction = p_result then 3 else 0 end where match_id = p_match_id`
      — sert pour la saisie ET la correction (idempotente)
- [ ] Policies `matches` : INSERT (admin, avec `kickoff_at > now()` en
      with check), UPDATE (admin), DELETE (admin **et**
      `not exists (select 1 from predictions p where p.match_id = id)`)
- [ ] Vérifier qu'aucune policy UPDATE n'existe sur `public.users`
      (deny par défaut = un utilisateur ne peut pas changer son rôle) —
      documenter cette vérification en commentaire
- [ ] `grant execute` sur les deux fonctions à `authenticated`
- [ ] Optionnel (durcissement) : trigger interdisant la modification de
      team1/team2/kickoff_at quand des pronostics existent (CdC §4.2)

## Critères d'acceptation

- [ ] Depuis une session `user` : `select set_match_result(...)` → exception
- [ ] Depuis une session `user` : insert/update/delete sur `matches` → refusé
- [ ] Depuis une session `admin` : `set_match_result` met à jour match +
      points en un appel ; relancer avec un autre résultat recalcule tout
- [ ] Supprimer un match avec ≥1 pronostic → refusé par la policy
- [ ] Le fichier migration est commité (leçon Sprint 6 : le schéma versionné
      reflète toujours l'état réel de la base)
MD

cat > "$BODIES/2.md" <<'MD'
## Objectif

Couche domaine de la feature admin : types, schémas Zod, repository, service.

## Fichiers

- `features/admin/types/admin.types.ts`
- `features/admin/schemas/match.schema.ts`
- `features/admin/repositories/IAdminRepository.ts`
- `features/admin/repositories/SupabaseAdminRepository.ts`
- `features/admin/services/adminService.ts`

## Tâches

- [ ] Types : `AdminMatch` (avec compteur de pronostics), payloads
      create/update
- [ ] Schéma Zod création/édition : team1 et team2 obligatoires et
      différents, date/heure obligatoires et **dans le futur**
- [ ] Repository : `getAllMatches()` (avec `predictions(count)` embarqué),
      `createMatch()`, `updateMatch()`, `deleteMatch()`,
      `setResult()` → `supabase.rpc('set_match_result', …)`
- [ ] Service : règles métier — refuser l'édition de teams/date si
      `predictionsCount > 0` (CdC §4.2), refuser la suppression si
      `predictionsCount > 0` (message clair AVANT l'erreur RLS),
      dérivation du statut d'affichage (`finished`/`locked`/`upcoming`)
- [ ] **Pas de `resetUserPassword`** (décision epic : Dashboard Supabase en V1)

## Critères d'acceptation

- [ ] Même pattern que les features results/profile (interface +
      implémentation + injection)
- [ ] La double protection est en place : le service refuse proprement,
      la base refuse de toute façon
- [ ] Aucun import Supabase hors du repository
MD

cat > "$BODIES/3.md" <<'MD'
## Objectif

Réserver l'accès admin : hook de rôle + protection de route.

## Fichiers

- `features/admin/hooks/useIsAdmin.ts`
- Garde de route sur l'écran admin (`app/(tabs)/admin.tsx` ou layout)

## Tâches

- [ ] `useIsAdmin()` : lit le rôle depuis le profil (`public.users.role`)
      — réutiliser la query session/profil existante si elle expose déjà
      le rôle, sinon l'étendre (pas de requête dupliquée)
- [ ] Garde : un `user` qui atteint la route admin est redirigé
      (ou onglet masqué + redirect en défense)
- [ ] États : pendant le chargement du rôle, ne rien flasher (pas d'écran
      admin visible une fraction de seconde pour un `user`)

## Rappel sécurité

La garde de route est de l'UX, pas de la sécurité : la vraie protection est
l'issue SQL (policies + is_admin). Les deux couches doivent exister.

## Critères d'acceptation

- [ ] Compte `user` : jamais d'accès à l'UI admin, même via deep link
- [ ] Compte `admin` : accès normal
- [ ] Aucun appel réseau supplémentaire si le rôle est déjà en cache
MD

cat > "$BODIES/4.md" <<'MD'
## Objectif

Les deux écrans du flux admin : dashboard d'entrée et gestion des matchs.

## Fichiers

- `features/admin/screens/AdminDashboard.tsx`
- `features/admin/screens/AdminMatchManagement.tsx`
- `features/admin/components/AdminMatchCard.tsx`
- `features/admin/hooks/useAdminMatches.ts` (clé `['admin','matches']`)
- `app/(tabs)/admin.tsx` : remplace le placeholder `ComingSoon`

## Tâches

- [ ] Dashboard : actions « Ajouter un match » / « Gestion des matchs »,
      header KOORA cohérent (style RankingScreen/ResultsScreen)
- [ ] Gestion : liste de tous les matchs via `useAdminMatches()`,
      AdminMatchCard = équipes, date/heure, **badge de statut dérivé**
      (upcoming/locked/finished — jamais lu de la colonne status seule),
      compteur de pronostics, actions Modifier / Supprimer / Résultat
- [ ] Actions désactivées selon les règles : Modifier/Supprimer grisés si
      pronostics > 0 (avec explication), Résultat masqué si upcoming
- [ ] États : loading, erreur (retry), vide
- [ ] Si `ComingSoon` n'est plus utilisé nulle part après ce remplacement,
      le supprimer

## Critères d'acceptation

- [ ] Un match passé sans résultat s'affiche `locked` même si la colonne
      status dit encore `upcoming`
- [ ] Zéro import Supabase dans screens/components
MD

cat > "$BODIES/5.md" <<'MD'
## Objectif

Le CRUD des matchs : formulaire de création, édition, suppression.
(CdC §4.1, §4.2, §4.3)

## Fichiers

- `features/admin/screens/AdminMatchForm.tsx` (création ET édition)
- `features/admin/hooks/useMatchMutations.ts` (create/update/delete)
- Dialog de confirmation de suppression

## Tâches

- [ ] Formulaire React Hook Form + Zod (schéma Issue Domain) : team1,
      team2, date picker, time picker
- [ ] Création : refus si date passée ou team1 = team2 (messages clairs)
- [ ] Édition : si le match a ≥1 pronostic, champs teams/date/heure
      désactivés avec explication — seul l'accès au résultat reste
- [ ] Suppression : confirmation « Supprimer ce match ? Cette action est
      irréversible. » ; refus propre si pronostics existants
- [ ] Mutations : invalidation `['admin','matches']` + `['matches']`
      (la liste joueur doit voir un nouveau match)
- [ ] Loading / success / error sur chaque mutation

## Critères d'acceptation

- [ ] Tests fonctionnels 1 à 7 du plan de sprint passent
- [ ] Un contournement du formulaire (appel direct) est quand même refusé
      par la base (vérifié en Issue QA)
MD

cat > "$BODIES/6.md" <<'MD'
## Objectif

Saisie ET correction du résultat d'un match, avec recalcul automatique des
points et synchronisation classement/résultats. (CdC §4.4 — fusionne les
anciens tickets set result / points / correction / sync : c'est UNE opération.)

## Fichiers

- `features/admin/components/ResultSelector.tsx` (team1 / nul / team2)
- `features/admin/hooks/useSetResult.ts` (mutation)

## Tâches

- [ ] Sélecteur de résultat accessible depuis AdminMatchCard (matchs locked
      et finished — finished = mode correction, pré-sélectionné)
- [ ] Mutation → `adminService.setResult()` → RPC `set_match_result`
      (un seul appel, atomique — AUCUN calcul de points côté client)
- [ ] Invalidation après succès : `['admin','matches']` + `['matches']` +
      `['ranking']` + `['results']` (TDD §7)
- [ ] Correction : même flux, même RPC — vérifier que relancer avec un
      autre résultat écrase et recalcule
- [ ] Loading / error

## Critères d'acceptation

- [ ] Résultat saisi → match `finished`, corrects = 3 pts, incorrects = 0,
      **aucun pronostic oublié** (vérifier en base sur un match multi-joueurs)
- [ ] Correction team1 → draw : tous les points recalculés, classement et
      écran Mes Résultats des joueurs cohérents après refresh
- [ ] L'incohérence observée en fin de Sprint 7 (résultat changé, points
      figés) est devenue impossible via l'app
MD

cat > "$BODIES/7.md" <<'MD'
## Objectif

Tests de sécurité + QA finale du sprint — et du périmètre V1.

## Tests sécurité (les plus importants du projet)

Depuis une session **user** (pas l'UI : appels directs via le client
supabase en console ou un script) :

- [ ] `insert` sur matches → refusé
- [ ] `update` sur matches → refusé
- [ ] `delete` sur matches → refusé
- [ ] `rpc('set_match_result', …)` → exception
- [ ] `update users set role = 'admin'` sur soi-même → refusé
- [ ] Depuis une session **admin** : tout ce qui précède fonctionne

## Tests fonctionnels (plan de sprint)

- [ ] Tests 1–9 : création valide, team1=team2 refusé, date passée refusée,
      édition avec/sans pronostics, suppression avec/sans pronostics,
      résultat + points, correction + recalcul complet
- [ ] Non-régression : Auth, Pronostics, Classement, Profil, Mes Résultats

## Tests techniques

- [ ] `grep -r "supabase" src/features/admin/screens src/features/admin/components` → vide
- [ ] Aucun `any`, `npx tsc --noEmit` et ESLint sans erreur
- [ ] Build Expo OK
- [ ] `ComingSoon` supprimé s'il est devenu orphelin

## Documentation

- [ ] `migrations/002_admin.sql` reflète exactement l'état de la base
- [ ] TDD : cocher l'implémentation de l'invalidation admin (§7) et de la
      sécurité (§9)
- [ ] Vérifier la définition « corrects » de la RPC stats (points > 0 vs
      comparaison) et noter la réponse — cohérence avec le recalcul
MD

# ---------------------------------------------------------------------------
# 5. Epic
# ---------------------------------------------------------------------------
echo "▶ Epic"
EPIC_URL="$(gh issue create --repo "$REPO" \
  --title "[EPIC] Administration Module" \
  --body-file "$BODIES/epic.md" \
  --label "epic,feature,security,priority:high" \
  --milestone "$MILESTONE")"
EPIC_NUM="${EPIC_URL##*/}"
echo "  #$EPIC_NUM"

# ---------------------------------------------------------------------------
# 6. Issues
# ---------------------------------------------------------------------------
echo "▶ Issues"

declare -a TITLES=(
  "[SQL] Fondations admin — is_admin, set_match_result, policies"
  "[Domain] Admin — types, schémas Zod, repository, service"
  "[Auth] Autorisation admin — useIsAdmin + garde de route"
  "[Screens] AdminDashboard + gestion des matchs"
  "[Feature] CRUD matchs — création, édition, suppression"
  "[Feature] Résultats — saisie, correction, recalcul, sync"
  "[QA] Tests sécurité + QA finale V1"
)
declare -a LABELS=(
  "sql,security,priority:high"
  "repository,service,feature,priority:high"
  "hooks,security,feature,priority:high"
  "ui,feature,priority:medium"
  "ui,hooks,feature,priority:high"
  "hooks,service,feature,priority:high"
  "testing,security,priority:high"
)
declare -a BRANCHES=(
  "feature/admin-sql"
  "feature/admin-domain"
  "feature/admin-authorization"
  "feature/admin-screens"
  "feature/admin-match-crud"
  "feature/admin-results"
  "feature/admin-security-qa"
)

declare -a NUMS=()
declare -a URLS=()
for i in "${!TITLES[@]}"; do
  n=$((i + 1))
  url="$(gh issue create --repo "$REPO" \
    --title "${TITLES[$i]}" \
    --body-file "$BODIES/$n.md" \
    --label "${LABELS[$i]}" \
    --milestone "$MILESTONE")"
  NUMS+=("${url##*/}")
  URLS+=("$url")
  echo "  #${url##*/} — ${TITLES[$i]}"
done

# ---------------------------------------------------------------------------
# 7. Checklist de suivi dans l'epic
# ---------------------------------------------------------------------------
echo "▶ Checklist de l'epic"
{
  sed 's/(complété automatiquement par le script)//' "$BODIES/epic.md"
  for i in "${!NUMS[@]}"; do
    echo "- [ ] #${NUMS[$i]} — ${TITLES[$i]} · \`${BRANCHES[$i]}\`"
  done
} > "$BODIES/epic_final.md"
gh issue edit "$EPIC_NUM" --repo "$REPO" --body-file "$BODIES/epic_final.md" >/dev/null

# ---------------------------------------------------------------------------
# 8. Ajout au projet
# ---------------------------------------------------------------------------
echo "▶ Ajout au projet #$PROJECT_NUMBER"
gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$EPIC_URL" >/dev/null
for url in "${URLS[@]}"; do
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" >/dev/null
done

# ---------------------------------------------------------------------------
# 9. Branches liées aux issues
# ---------------------------------------------------------------------------
if [ "$CREATE_BRANCHES" = true ]; then
  echo "▶ Branches"
  for i in "${!NUMS[@]}"; do
    gh issue develop "${NUMS[$i]}" --repo "$REPO" --base main \
      --name "${BRANCHES[$i]}" >/dev/null
    echo "  ${BRANCHES[$i]} → #${NUMS[$i]}"
  done
  git fetch origin --prune >/dev/null 2>&1
fi

# ---------------------------------------------------------------------------
# 10. Récapitulatif
# ---------------------------------------------------------------------------
cat <<EOF

═══════════════════════════════════════════════════════════════
  Sprint 8 créé — dernier sprint du périmètre V1
═══════════════════════════════════════════════════════════════
  Milestone : $MILESTONE
  Epic      : #$EPIC_NUM

  #${NUMS[0]}  ${BRANCHES[0]}        ← TOUT commence ici (SQL)
  #${NUMS[1]}  ${BRANCHES[1]}
  #${NUMS[2]}  ${BRANCHES[2]}   (parallélisable avec le domaine)
  #${NUMS[3]}  ${BRANCHES[3]}
  #${NUMS[4]}  ${BRANCHES[4]}
  #${NUMS[5]}  ${BRANCHES[5]}
  #${NUMS[6]}  ${BRANCHES[6]}
═══════════════════════════════════════════════════════════════

Ordre : SQL → Domain → (Auth ∥ Screens) → CRUD → Résultats → QA.
L'issue SQL bloque tout le reste : le domaine appelle la RPC, les
écrans dépendent des policies. Ne commence rien avant qu'elle soit
mergée ET exécutée dans Supabase.

Avant chaque issue :
  git checkout <branche> && git fetch origin && git rebase origin/main
EOF
