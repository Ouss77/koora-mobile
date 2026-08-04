#!/usr/bin/env bash
# =============================================================================
# KOORA V1 — Sprint 6 : User Profile & Dashboard
# Milestone, projet, epic, 7 issues et branches liées, via GitHub CLI.
#
# Prérequis :
#   gh auth login
#   gh auth refresh -s project        # scope requis pour `gh project`
#   Exécuter depuis la racine du dépôt, sur un `main` à jour.
#
# Usage :
#   chmod +x koora_sprint6_github.sh && ./koora_sprint6_github.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
OWNER="${REPO%%/*}"
MILESTONE="Sprint 6 — User Profile & Dashboard"
PROJECT_TITLE="KOORA V1"
DUE_ON="2026-08-06T23:59:59Z"   # ← ajuste la date de fin de sprint
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
create_label "navigation"      "0366D6" "Routing / navigation"
create_label "repository"      "1D76DB" "Couche accès données"
create_label "service"         "0052CC" "Logique métier"
create_label "hooks"           "FBCA04" "TanStack Query"
create_label "ui"              "D93F0B" "Écrans et composants"
create_label "testing"         "C2E0C6" "QA, lint, build"
create_label "priority:high"   "B60205" "À faire en premier"
create_label "priority:medium" "FBCA04" "Priorité normale"
create_label "blocked"         "000000" "Bloqué par une dépendance"

# ---------------------------------------------------------------------------
# 2. Milestone (idempotent)
# ---------------------------------------------------------------------------
echo "▶ Milestone"
if ! gh api "repos/$REPO/milestones?state=all" -q '.[].title' | grep -Fxq "$MILESTONE"; then
  gh api "repos/$REPO/milestones" \
    -f title="$MILESTONE" \
    -f state="open" \
    -f due_on="$DUE_ON" \
    -f description="Espace personnel : navigation par onglets, profil, statistiques agrégées, accès aux résultats et déconnexion." \
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

En tant que joueur, je veux naviguer entre les pages via une barre d'onglets et
disposer d'un espace personnel affichant mes informations et mes statistiques,
afin de suivre ma performance sans naviguer à l'URL.

## Objectif

Deux livrables complémentaires :
1. Une **bottom navigation** (Expo Router `(tabs)`) : Home · Ranking · Results ·
   Profile · Admin. Fin de la navigation manuelle par URL.
2. Le **Dashboard utilisateur**, point d'entrée personnel après connexion. Le
   Sprint 7 s'appuiera dessus pour l'écran « Mes Résultats ».

## Règle structurante

Le profil **consomme** le classement, il ne le recalcule pas. Toutes les stats
agrégées (points, rang, pronostics, corrects, réussite) proviennent de la RPC
`get_current_user_rank` livrée au Sprint 5. Une seconde agrégation ici créerait
deux sources de vérité pour la même donnée.

## Dépendances

- ✅ **Navigation** (#nav) ne dépend de rien → **point de départ recommandé** du
  sprint, à faire pendant que le Sprint 5 se termine.
- ⚠️ **Domaine** et **Hooks** du profil sont bloqués tant que le Sprint 5 n'a
  pas livré `get_current_user_rank`.

## Périmètre

- [ ] Bottom navigation par onglets + gating de l'onglet Admin par rôle
- [ ] Couche domaine Profile (types, repository, service)
- [ ] Hooks TanStack Query `['profile']` et `['profile-stats']`
- [ ] `ProfileScreen` + en-tête
- [ ] Cartes de statistiques
- [ ] Menu (Mes résultats · Déconnexion)
- [ ] QA, lint, build

## Hors périmètre

- Modification des informations du profil (lecture seule en V1)
- Upload d'un avatar (initiales générées à partir du pseudo)
- Écran « Mes Résultats » lui-même → Sprint 7
- Tab bar custom avec pilule active → polish optionnel, pas MVP
MD

cat > "$BODIES/1.md" <<'MD'
## Objectif

Mettre en place la **bottom navigation** de l'app via un groupe Expo Router
`(tabs)`, pour remplacer la navigation manuelle par URL. Onglets visés :
Home · Ranking · Results · Profile · Admin.

## Pourquoi en premier

Cette issue ne dépend **pas** de la RPC du Sprint 5. C'est le meilleur point de
départ du sprint : elle avance pendant que le classement se termine.

## Dépendances

```bash
npx expo install lucide-react-native react-native-svg
```

## Structure cible

```
app/
├── _layout.tsx            # racine : Stack + redirection login si pas de session
├── (auth)/                # login, register (existant)
└── (tabs)/
    ├── _layout.tsx        # navigateur Tabs
    ├── index.tsx          # Home → écran Pronostics (existant)
    ├── ranking.tsx        # → RankingScreen (Sprint 5)
    ├── results.tsx        # placeholder (Sprint 7)
    ├── profile.tsx        # placeholder, rempli par l'issue [Screen]
    └── admin.tsx          # → AdminScreen (existant/à venir)
```

## Tâches

- [ ] Installer `lucide-react-native` + `react-native-svg`
- [ ] Créer le groupe `app/(tabs)/` et son `_layout.tsx` (navigateur `Tabs`)
- [ ] **Déplacer l'écran Pronostics existant en `index.tsx`** (= onglet Home)
- [ ] Déplacer l'écran Ranking en `ranking.tsx`
- [ ] Créer `results.tsx` en placeholder (« Bientôt disponible »)
- [ ] Créer `profile.tsx` en placeholder (rempli par l'issue Screen)
- [ ] Rattacher l'écran Admin en `admin.tsx`
- [ ] Icônes Lucide : Home, BarChart3, Flag, User, ShieldCheck
- [ ] Onglet Admin masqué aux non-admins via `href: isAdmin ? undefined : null`
      (rôle lu depuis `useSession`)
- [ ] Chaque fichier d'onglet reste fin : il ne fait que rendre l'écran de la
      feature, aucune logique métier dans `app/`

## Mapping à valider

« Home » pointe vers l'écran **Pronostics** (Écran 1 du CdC). La maquette n'a pas
d'onglet « Pronostics » distinct : c'est bien l'écran principal qui devient Home.

## ⚠️ Sécurité

Masquer l'onglet Admin est purement cosmétique. La protection réelle des
opérations admin reste **côté serveur** (RLS + vérification du rôle), conformément
au CdC §4.0. Ne jamais se reposer sur l'onglet masqué.

## Critères d'acceptation

- [ ] La barre d'onglets s'affiche sur toutes les pages du groupe `(tabs)`
- [ ] Le passage d'un onglet à l'autre fonctionne sans saisir d'URL
- [ ] L'onglet Admin est invisible pour un compte `user`, visible pour `admin`
- [ ] Aucun écran verrouillé pour un non-admin même s'il force l'URL `/admin`
- [ ] Aucune logique métier ni appel Supabase dans `app/`
- [ ] `npx tsc --noEmit` et ESLint sans erreur
MD

cat > "$BODIES/2.md" <<'MD'
## Objectif

Créer la couche domaine complète de la feature `profile` : types, repository,
service. Le repository ne contient aucune règle métier ; le service ne connaît
jamais le client Supabase.

> Les Issues 1 et 2 du markdown d'origine décrivaient le même travail
> (créer le repository et ses deux méthodes). Elles sont fusionnées ici.

## Fichiers

```
features/profile/
├── types/profile.ts
├── mappers/profileMapper.ts
├── repositories/IProfileRepository.ts
├── repositories/SupabaseProfileRepository.ts
├── services/profileService.ts
└── schemas/profile.schema.ts
```

## Types

- [ ] `Profile` : `id`, `username`, `email`, `role`, `createdAt`
- [ ] `ProfileStats` : `points`, `rank`, `matchesPlayed`,
      `correctPredictions`, `wrongPredictions`, `accuracy`

## Repository

- [ ] `getProfile(): Promise<Profile>` — `select` sur `public.users`,
      la RLS restreint déjà à la ligne du joueur connecté
- [ ] `getStats(): Promise<ProfileStats>` — appelle
      `supabase.rpc('get_current_user_rank')`, **pas** une nouvelle agrégation
- [ ] Mapper snake_case → camelCase (`created_at` → `createdAt`)
- [ ] Erreurs Supabase converties en erreurs typées du domaine

## Service

- [ ] `getProfile()` — délègue au repository
- [ ] `getStats()` — délègue, puis dérive les champs calculés
- [ ] `calculateSuccessRate(correct, matchesPlayed)` — **fonction pure**,
      testable sans réseau

## ⚠️ Définition de la réussite (alignée Sprint 5)

Le markdown d'origine proposait `correctPredictions / predictions`. C'est
faux : un pronostic sur un match non joué entrerait au dénominateur et ferait
chuter le taux. Définition retenue, identique au classement :

```
matchesPlayed      = pronostics sur des matchs status = 'finished'
correctPredictions = points_awarded > 0
wrongPredictions   = matchesPlayed - correctPredictions
accuracy           = matchesPlayed === 0 ? 0 : correct / matchesPlayed
```

Un pronostic en attente n'est ni correct ni mauvais : il ne compte nulle part.

## Critères d'acceptation

- [ ] Aucun `import` du client Supabase dans le Service
- [ ] Aucune règle métier dans le Repository
- [ ] Aucun `any` ; le domaine ne voit jamais de `snake_case`
- [ ] Le profil et le classement affichent **le même** taux pour un même
      utilisateur (à vérifier explicitement)
- [ ] Garde-fou division par zéro : un compte sans pronostic terminé → 0 %

## Dépendance

⚠️ Bloquée tant que la RPC `get_current_user_rank` (Sprint 5) n'est pas déployée.
MD

cat > "$BODIES/3.md" <<'MD'
## Objectif

Exposer l'état serveur du profil via TanStack Query, en suivant la convention
du projet : le service est instancié **une seule fois au module**
(motif `authService`), jamais dans le corps du hook.

## Fichiers

- `features/profile/hooks/useProfile.ts`
- `features/profile/hooks/useProfileStats.ts`

## Query Keys

- `['profile']` — informations personnelles
- `['profile-stats']` — statistiques agrégées

## Tâches

- [ ] `useProfile()` → `profileService.getProfile()`
- [ ] `useProfileStats()` → `profileService.getStats()`
- [ ] Exposer `data`, `isLoading`, `isError`, `error`, `refetch`
- [ ] `staleTime` distinct : le profil ne bouge quasiment jamais,
      les stats changent à chaque résultat saisi par l'admin
- [ ] Prévoir l'invalidation de `['profile-stats']` au même moment que
      `['ranking']` (déclenchée côté Admin, sprint ultérieur)

## Critères d'acceptation

- [ ] Les hooks consomment le Service, jamais le Repository ni Supabase
- [ ] Un seul point de construction du service
- [ ] `['profile-stats']` et `['ranking']` restent cohérents entre eux

## Dépendance

⚠️ Bloquée tant que la RPC `get_current_user_rank` (Sprint 5) n'est pas déployée.
MD

cat > "$BODIES/4.md" <<'MD'
## Objectif

Assembler l'écran de profil : en-tête, avatar, identité. Aucune logique
métier, aucun calcul. Remplace le placeholder `profile.tsx` créé à l'issue
Navigation.

## Fichiers

- `features/profile/screens/ProfileScreen.tsx`
- `features/profile/components/ProfileHeader.tsx`
- `features/profile/components/ProfileAvatar.tsx`

## Tâches

- [ ] `ProfileScreen` consomme `useProfile()` et `useProfileStats()`
- [ ] `ProfileAvatar` : initiales dérivées du pseudo (pas d'upload en V1)
- [ ] `ProfileHeader` : pseudo, `@username`, email, date d'inscription
- [ ] Email affiché en **lecture seule**, sans champ de saisie
- [ ] Date formatée avec `date-fns`, fuseau local (stockage UTC)
- [ ] États : chargement, erreur (message + retry)
- [ ] Brancher l'écran dans `app/(tabs)/profile.tsx`

## Critères d'acceptation

- [ ] L'écran n'importe ni Service ni client Supabase (TDD §2)
- [ ] NativeWind uniquement, zéro style inline
- [ ] Les deux requêtes chargent indépendamment : des stats en cours de
      chargement ne masquent pas l'identité déjà disponible
- [ ] Aucune donnée d'un autre utilisateur n'est accessible
MD

cat > "$BODIES/5.md" <<'MD'
## Objectif

Afficher la grille de statistiques. Composants présentationnels purs,
réutilisables tels quels dans le futur écran « Mes Résultats ».

## Fichiers

- `features/profile/components/StatisticCard.tsx`
- `features/profile/components/ProfileStatsGrid.tsx`

## Tâches

- [ ] `StatisticCard` : icône, libellé, valeur — `props in → UI out`
- [ ] Grille : 🏆 Rang · ⭐ Points · ⚽ Pronostics · ✅ Corrects ·
      ❌ Incorrects · 📈 Réussite
- [ ] Formatage du taux **dans le composant** (`66 %`), la valeur brute reste
      un nombre dans le domaine
- [ ] Cas limite affiché proprement : 0 pronostic terminé → `—` plutôt que `0 %`
- [ ] Palette et icônes cohérentes avec le design system existant

## Critères d'acceptation

- [ ] Aucun calcul dans les composants — ils reçoivent des valeurs prêtes
- [ ] `StatisticCard` mémoïsé (`React.memo`)
- [ ] Les chiffres correspondent à ceux du classement pour le même compte
- [ ] Design homogène avec `RankingItem` (Sprint 5)
MD

cat > "$BODIES/6.md" <<'MD'
## Objectif

Menu du profil : navigation vers « Mes Résultats » et déconnexion.

## Fichier

- `features/profile/components/ProfileMenu.tsx`

## Tâches

- [ ] Entrée « Mes résultats » → navigue vers l'onglet Results
- [ ] Entrée « Déconnexion » → dialogue de confirmation
- [ ] Brancher le hook **existant** `useLogout()` (sprint Auth) —
      ne pas réécrire `AuthService.logout()`
- [ ] Après déconnexion : `queryClient.clear()` puis redirection vers Login
- [ ] État `isPending` sur le bouton pendant la déconnexion

## Point d'attention

`useLogout` n'invalide aujourd'hui que `['session']`. Après déconnexion, le
cache contient encore `['profile']`, `['profile-stats']`, `['predictions']` —
donc les données du compte précédent. Sur un appareil partagé, le prochain
utilisateur peut les voir brièvement. Utiliser `clear()`, pas une invalidation
ciblée.

## Note

L'entrée « Mes résultats » pointe vers l'onglet Results, qui n'est qu'un
placeholder jusqu'au Sprint 7 (créé à l'issue Navigation). La navigation doit
fonctionner dès maintenant, même si l'écran est vide.

## Critères d'acceptation

- [ ] La déconnexion ferme la session et redirige vers Login
- [ ] Aucune donnée du compte précédent ne subsiste en cache
- [ ] Retour arrière impossible vers le profil après déconnexion
MD

cat > "$BODIES/7.md" <<'MD'
## Objectif

Valider le sprint de bout en bout et vérifier le respect de l'architecture.

## Tests fonctionnels

- [ ] La barre d'onglets permet de passer partout sans URL
- [ ] L'onglet Admin est masqué pour un compte `user`
- [ ] L'utilisateur voit uniquement son profil
- [ ] Le pseudo est correct
- [ ] L'email est affiché en lecture seule
- [ ] La date d'inscription est correcte et dans le fuseau local
- [ ] Les statistiques correspondent aux données en base
- [ ] Le taux de réussite est **identique** à celui du classement
- [ ] Un compte sans pronostic terminé n'affiche pas `NaN %`
- [ ] « Mes résultats » ouvre l'onglet Results
- [ ] « Déconnexion » ferme la session et redirige vers Login

## Vérification de données

- [ ] `select count(*) from public.users where email is null;` retourne 0
      (comptes créés avant l'ajout de la colonne)
- [ ] Mettre à jour `KOORA_supabase_schema_v1.sql` (ou ajouter un dossier
      `migrations/`) pour que le schéma versionné reflète l'état réel de la base

## Tests techniques

- [ ] `grep -r "supabase" src/features/profile/screens src/features/profile/components app/`
      ne retourne rien
- [ ] Toute la logique métier est dans `profileService`
- [ ] Tout l'accès données est dans `SupabaseProfileRepository`
- [ ] Query Keys `['profile']` et `['profile-stats']` utilisées
- [ ] Aucune agrégation SQL dupliquée entre `profile` et `ranking`
- [ ] `npx tsc --noEmit` sans erreur
- [ ] ESLint sans erreur, imports morts supprimés
- [ ] Build Expo Go réussi
MD

# ---------------------------------------------------------------------------
# 5. Epic
# ---------------------------------------------------------------------------
echo "▶ Epic"
EPIC_URL="$(gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Navigation & User Profile" \
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
  "[Nav] Bottom tab bar (Expo Router)"
  "[Domain] Profile — types, repository, service"
  "[Hooks] useProfile / useProfileStats"
  "[Screen] ProfileScreen + header & avatar"
  "[Components] StatisticCard & grille de statistiques"
  "[Menu] ProfileMenu — navigation & déconnexion"
  "[QA] Cleanup, review & tests fonctionnels"
)
declare -a LABELS=(
  "navigation,ui,feature,priority:high"
  "repository,service,feature,priority:high,blocked"
  "hooks,feature,priority:high,blocked"
  "ui,feature,priority:medium"
  "ui,feature,priority:medium"
  "ui,feature,priority:medium"
  "testing,priority:high"
)
declare -a BRANCHES=(
  "feature/app-navigation"
  "feature/profile-domain"
  "feature/profile-query"
  "feature/profile-screen"
  "feature/profile-statistics"
  "feature/profile-menu"
  "feature/profile-cleanup"
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
  Sprint 6 créé
═══════════════════════════════════════════════════════════════
  Milestone : $MILESTONE
  Projet    : $PROJECT_TITLE (#$PROJECT_NUMBER)
  Epic      : #$EPIC_NUM

  #${NUMS[0]}  ${BRANCHES[0]}   ← démarre ici (non bloqué)
  #${NUMS[1]}  ${BRANCHES[1]}   ⚠️ dépend du Sprint 5
  #${NUMS[2]}  ${BRANCHES[2]}   ⚠️ dépend du Sprint 5
  #${NUMS[3]}  ${BRANCHES[3]}
  #${NUMS[4]}  ${BRANCHES[4]}
  #${NUMS[5]}  ${BRANCHES[5]}
  #${NUMS[6]}  ${BRANCHES[6]}
═══════════════════════════════════════════════════════════════

Les 7 branches partent du \`main\` actuel. Dès que tu en mergeras une, les
autres seront en retard. Donc AVANT de commencer chaque issue :

  git checkout ${BRANCHES[0]}
  git fetch origin && git rebase origin/main

Pour fermer une issue :

  git push -u origin ${BRANCHES[0]}
  gh pr create --base main --title "feat(nav): bottom tab bar" --body "Closes #${NUMS[0]}"
  gh pr merge --squash --delete-branch

EOF