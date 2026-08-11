#!/usr/bin/env bash
# =============================================================================
# KOORA V1 — Sprint 7 : My Results (Écran « Mes Résultats »)
# Milestone, projet, epic, 5 issues et branches liées, via GitHub CLI.
#
# Prérequis :
#   gh auth login
#   gh auth refresh -s project        # scope requis pour `gh project`
#   Exécuter depuis la racine du dépôt, sur un `main` à jour.
#
# Usage :
#   chmod +x koora_sprint7_github.sh && ./koora_sprint7_github.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
OWNER="${REPO%%/*}"
MILESTONE="Sprint 7 — My Results"
PROJECT_TITLE="KOORA V1"
DUE_ON="2026-08-25T23:59:59Z"   # ← ajuste la date de fin de sprint
CREATE_BRANCHES=true            # false = créer les branches une par une plus tard

echo "▶ Dépôt : $REPO"

BODIES="$(mktemp -d)"
trap 'rm -rf "$BODIES"' EXIT

# ---------------------------------------------------------------------------
# 1. Labels (idempotent)
# ---------------------------------------------------------------------------
echo "▶ Labels"
create_label() {
  gh label create "$1" --color "$2" --description "$3" --force >/dev/null
}
create_label "epic"            "6E40C9" "Regroupe plusieurs issues"
create_label "feature"         "0E8A16" "Nouvelle fonctionnalité"
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
    -f title="$MILESTONE" \
    -f state="open" \
    -f due_on="$DUE_ON" \
    -f description="Écran « Mes Résultats » : historique personnel des pronostics sur matchs terminés — pronostic, résultat réel, points. Remplace le placeholder Results du Sprint 6." \
    >/dev/null
  echo "  créé"
else
  echo "  existe déjà"
fi

# ---------------------------------------------------------------------------
# 3. Projet (Projects v2)
# ---------------------------------------------------------------------------
echo "▶ Projet"
PROJECT_NUMBER="$(gh project list --owner "$OWNER" --format json \
  -q ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" || true)"

if [ -z "$PROJECT_NUMBER" ]; then
  PROJECT_NUMBER="$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" \
    --format json -q .number)"
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

En tant que joueur, je veux consulter l'historique de mes pronostics sur les
matchs terminés — mon choix, le résultat réel et les points obtenus — afin de
suivre ma performance match par match.

## Objectif

Remplir l'onglet **Results** (placeholder créé au Sprint 6) avec le véritable
écran « Mes Résultats » (Cahier des Charges §3.7).

## Règles structurantes

1. **Aucun SQL nouveau.** Les résultats sont une jointure
   `predictions → matches` filtrée sur `status = 'finished'`. La RLS
   « Users manage own predictions » garantit déjà que chacun ne voit que ses
   propres pronostics — l'exigence de confidentialité (§3.7) est portée par
   la base, jamais par un filtre client.
2. **Correct/incorrect se dérive de `prediction === match.result`**, jamais
   de `points_awarded > 0` (le schéma a `DEFAULT 0` : en attente et perdant
   ont la même valeur). `points_awarded` ne sert qu'à l'affichage.
3. **Le résumé ne se recalcule pas.** Points totaux / corrects viennent de
   `['profile-stats']` (RPC Sprint 5), réaffichés via les `StatisticCard`
   du Sprint 6. La liste, elle, vient de `['results']`.

## Dépendances

✅ Sprint 6 livré : onglet Results (placeholder), `StatisticCard`,
`['profile-stats']`. Rien n'est bloqué — toutes les issues peuvent démarrer.

## Périmètre

- [ ] Couche domaine Results (types, repository, service)
- [ ] Hook TanStack Query `['results']`
- [ ] Composant `ResultCard`
- [ ] `ResultsScreen` (remplace le placeholder)
- [ ] QA, lint, build + mise à jour TDD §7 (clé `['results']`)

## Hors périmètre

- Les pronostics des autres joueurs (interdit, §3.7)
- Les matchs en cours / verrouillés sans résultat (§3.7 : « match terminé »)
- Historique détaillé / filtres avancés → V2
- Saisie des résultats par l'admin → Sprint 8
MD

cat > "$BODIES/1.md" <<'MD'
## Objectif

Créer la couche domaine complète de la feature `results` : types, repository,
service. Le repository ne contient aucune règle métier ; le service ne connaît
jamais le client Supabase.

## Fichiers

- `features/results/types/result.types.ts`
- `features/results/repositories/resultRepository.ts`
- `features/results/services/resultService.ts`

## Tâches

- [ ] Type `MyResult` : `{ id, match: { team1, team2, kickoffAt },
      prediction, actualResult, pointsAwarded, outcome: 'correct' | 'incorrect' }`
- [ ] `SupabaseResultRepository.getMyFinishedPredictions()` :
      `select('*, match:matches!inner(*)')` + `.eq('matches.status', 'finished')`
      — le `!inner` est indispensable, sinon les matchs non terminés
      remontent avec `match: null`
- [ ] Aucun filtre `user_id` côté client : la RLS s'en charge (documenter ce
      choix en commentaire dans le repository)
- [ ] `resultService.getMyResults()` : mappe les lignes brutes vers `MyResult`,
      dérive `outcome` par `prediction === match.result`
- [ ] Tri par `kickoff_at` décroissant (le plus récent en premier)

## Critères d'acceptation

- [ ] `outcome` jamais dérivé de `points_awarded`
- [ ] Aucune référence à Supabase dans le service
- [ ] Un match `locked` sans résultat n'apparaît jamais dans la liste
MD

cat > "$BODIES/2.md" <<'MD'
## Objectif

Exposer les résultats au travers de TanStack Query.

## Fichier

- `features/results/hooks/useMyResults.ts`

## Tâches

- [ ] `useMyResults()` sur la clé `['results']`, appelle
      `resultService.getMyResults()`
- [ ] `staleTime` raisonnable (ex. 60 s) : les résultats ne changent que
      lorsqu'un admin saisit/corrige un résultat
- [ ] `refetchOnWindowFocus` / focus de l'onglet actif — c'est le seul canal
      par lequel un joueur voit une correction admin faite sur un autre
      appareil (pas de realtime en V1)

## Point d'attention — invalidation

Le TDD §7 ne connaît pas encore `['results']`. Étendre la stratégie :
la mutation admin « soumettre/corriger un résultat » (Sprint 8) devra
invalider `matches`, `ranking` **et** `results`. À tracer dès maintenant
dans le TDD (case dédiée en QA) pour ne pas l'oublier au Sprint 8.

## Critères d'acceptation

- [ ] Clé `['results']` utilisée partout, aucune clé ad hoc
- [ ] Le hook ne contient aucune logique métier (pur relais service → cache)
MD

cat > "$BODIES/3.md" <<'MD'
## Objectif

Composant présentationnel `ResultCard` : une carte par match terminé.

## Fichier

- `features/results/components/ResultCard.tsx`

## Tâches

- [ ] Affiche : équipes, date/heure du match (fuseau local, `date-fns`),
      mon pronostic, résultat réel, points obtenus
- [ ] Libellés lisibles : `team1` → nom de l'Équipe 1, `draw` → « Match nul »
      (jamais la valeur brute de l'enum)
- [ ] État visuel `correct` (ex. bordure/badge vert, « +3 pts ») vs
      `incorrect` (neutre/rouge, « 0 pt ») piloté par la prop `outcome`
- [ ] `props in → UI out` : aucun calcul, aucune comparaison dans le composant
- [ ] `React.memo`
- [ ] Design homogène avec `RankingItem` (Sprint 5) et `StatisticCard`
      (Sprint 6)

## Critères d'acceptation

- [ ] Le composant est réutilisable hors contexte (storybook mental :
      il ne dépend que de ses props)
- [ ] Aucune référence à Supabase ni aux hooks
MD

cat > "$BODIES/4.md" <<'MD'
## Objectif

Remplacer le placeholder `results.tsx` (Sprint 6) par le véritable
`ResultsScreen`.

## Fichiers

- `features/results/screens/ResultsScreen.tsx`
- `app/(tabs)/results.tsx` (branche l'écran, supprime le placeholder)

## Tâches

- [ ] En-tête résumé : Points · Corrects · Réussite — **réutilise
      `StatisticCard` / les données `['profile-stats']`** (Sprint 6),
      aucun total recalculé depuis la liste
- [ ] Liste des `ResultCard` via `useMyResults()` (FlatList)
- [ ] États : chargement (skeleton), erreur (retry), vide
      (« Aucun match terminé pour l'instant » + invitation à pronostiquer)
- [ ] Pull-to-refresh → refetch `['results']` et `['profile-stats']`
- [ ] L'entrée « Mes résultats » du `ProfileMenu` (Sprint 6) atterrit
      désormais sur le vrai écran — vérifier la navigation

## Critères d'acceptation

- [ ] Le total de l'en-tête et la somme visuelle de la liste racontent la
      même histoire (même source de vérité côté stats)
- [ ] Un compte sans pronostic terminé voit l'état vide, pas `NaN` ni `0 %`
- [ ] Aucune référence à Supabase dans l'écran
MD

cat > "$BODIES/5.md" <<'MD'
## Objectif

Valider le sprint de bout en bout et vérifier le respect de l'architecture.

## Tests fonctionnels

- [ ] L'utilisateur ne voit que ses propres résultats (vérifier avec 2 comptes)
- [ ] Seuls les matchs `finished` apparaissent ; un match `locked` sans
      résultat est absent
- [ ] Pronostic correct → badge correct + points affichés = `points_awarded`
- [ ] Pronostic incorrect → 0 pt, état visuel distinct
- [ ] Correction d'un résultat en base → après refocus/refresh, la carte et
      l'en-tête se mettent à jour ensemble
- [ ] Tri : match le plus récent en premier
- [ ] Compte sans pronostic terminé → état vide propre
- [ ] Navigation depuis l'onglet Results ET depuis le ProfileMenu

## Test RLS (sécurité §3.7)

- [ ] Depuis la session du compte A, requêter `predictions` sans filtre :
      seules les lignes de A remontent (la RLS bloque, pas le client)

## Tests techniques

- [ ] `grep -r "supabase" src/features/results/screens src/features/results/components`
      ne retourne rien
- [ ] Logique métier dans `resultService`, accès données dans
      `SupabaseResultRepository`
- [ ] Query Key `['results']` utilisée, aucune duplication avec `['predictions']`
- [ ] `outcome` dérivé de `prediction === match.result` (revue de code)
- [ ] `npx tsc --noEmit` sans erreur
- [ ] ESLint sans erreur, imports morts supprimés
- [ ] Build Expo Go réussi

## Documentation

- [ ] TDD §7 : ajouter la clé `['results']` et étendre la stratégie
      d'invalidation admin (matches + ranking + results) pour le Sprint 8
- [ ] Supprimer tout code résiduel du placeholder `results.tsx`
MD

# ---------------------------------------------------------------------------
# 5. Epic
# ---------------------------------------------------------------------------
echo "▶ Epic"
EPIC_URL="$(gh issue create \
  --repo "$REPO" \
  --title "[EPIC] My Results Screen" \
  --body-file "$BODIES/epic.md" \
  --label "epic,feature,priority:high" \
  --milestone "$MILESTONE")"
EPIC_NUM="${EPIC_URL##*/}"
echo "  #$EPIC_NUM"

# ---------------------------------------------------------------------------
# 6. Issues
# ---------------------------------------------------------------------------
echo "▶ Issues"

declare -a TITLES=(
  "[Domain] Results — types, repository, service"
  "[Hooks] useMyResults — clé ['results']"
  "[Component] ResultCard"
  "[Screen] ResultsScreen — remplace le placeholder"
  "[QA] Cleanup, RLS, review & tests fonctionnels"
)
declare -a LABELS=(
  "repository,service,feature,priority:high"
  "hooks,feature,priority:high"
  "ui,feature,priority:medium"
  "ui,feature,priority:medium"
  "testing,priority:high"
)
declare -a BRANCHES=(
  "feature/results-domain"
  "feature/results-query"
  "feature/results-card"
  "feature/results-screen"
  "feature/results-cleanup"
)

declare -a NUMS=()
declare -a URLS=()

for i in "${!TITLES[@]}"; do
  n=$((i + 1))
  url="$(gh issue create \
    --repo "$REPO" \
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
  cat "$BODIES/epic.md"
  echo
  echo "---"
  echo
  echo "## Suivi"
  echo
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
# `gh issue develop` crée la branche sur le remote ET la rattache à l'issue :
# elle apparaît dans le ticket, et la PR se lie automatiquement.
if [ "$CREATE_BRANCHES" = true ]; then
  echo "▶ Branches"
  for i in "${!NUMS[@]}"; do
    gh issue develop "${NUMS[$i]}" \
      --repo "$REPO" \
      --base main \
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
  Sprint 7 créé
═══════════════════════════════════════════════════════════════
  Milestone : $MILESTONE
  Projet    : $PROJECT_TITLE (#$PROJECT_NUMBER)
  Epic      : #$EPIC_NUM

  #${NUMS[0]}  ${BRANCHES[0]}   ← démarre ici
  #${NUMS[1]}  ${BRANCHES[1]}
  #${NUMS[2]}  ${BRANCHES[2]}   (parallélisable avec le domaine)
  #${NUMS[3]}  ${BRANCHES[3]}
  #${NUMS[4]}  ${BRANCHES[4]}
═══════════════════════════════════════════════════════════════

Aucune issue bloquée par un autre sprint. Ordre conseillé :
domaine → hooks → screen, la ResultCard pouvant se faire en
parallèle (composant pur, props seulement).

Les 5 branches partent du \`main\` actuel. AVANT de commencer
chaque issue :

  git checkout ${BRANCHES[0]}
  git fetch origin && git rebase origin/main

Pour fermer une issue :

  git push -u origin ${BRANCHES[0]}
  gh pr create --base main --title "feat(results): domain layer" --body "Closes #${NUMS[0]}"
  gh pr merge --squash --delete-branch

EOF
