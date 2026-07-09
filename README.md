## 🏗️ Architecture

KOORA V1 repose sur une architecture multicouche stricte : **UI → Services → Repositories → Supabase**.

### Règles architecturales critiques

- **Zéro communication directe** : aucun écran ou composant ne communique directement avec Supabase.
- **Logique centralisée** : toute la logique métier passe exclusivement par un **Service**.
- **Accès aux données isolé** : tous les accès aux données passent exclusivement par un **Repository** dédié.

```
[ UI / Écrans ]
      │
      ▼
[ Services ] ◄─── (Cache : TanStack Query)
      │
      ▼
[ Repositories ]
      │
      ▼
[ Supabase Client ] ─► Auth | API | PostgreSQL
```

## 📦 Stack technique

| Domaine          | Technologie      |
|-------------------|------------------|
| Mobile            | React Native (Expo) |
| Langage           | TypeScript |
| Navigation        | Expo Router (file-based routing) |
| UI                | NativeWind (Tailwind CSS) |
| Backend           | Supabase (BaaS) |
| Base de données   | PostgreSQL |
| Authentification  | Supabase Auth |
| Server State      | TanStack Query |
| Validation        | Zod |
| Formulaires       | React Hook Form |
| Icônes            | Lucide Icons |
| Dates             | date-fns |

## 📁 Organisation du projet (Feature First)

```
src/
├── app/            # Points d'entrée de navigation (Expo Router)
├── assets/         # Fichiers statiques
├── core/           # Logique transverse globale
│   ├── config/
│   ├── constants/
│   ├── supabase/   # Client Supabase initialisé
│   ├── types/
│   └── utils/
├── shared/         # Code partagé réutilisable partout (agnostique du métier)
│   ├── components/
│   ├── hooks/      # Hooks génériques (ex: useDebounce) — PAS les hooks métier
│   └── ui/         # Design system atomique (Input, Button, Logo...)
└── features/       # Organisation par domaine fonctionnel
    ├── auth/
    ├── matches/
    ├── predictions/
    ├── ranking/
    └── admin/
```

### Structure d'une feature

```
feature_name/
├── screens/         # Vues et écrans principaux
├── components/      # Sous-composants locaux
├── hooks/           # Hooks TanStack Query dédiés (queries & mutations)
├── services/        # Logique métier du domaine
├── repositories/     # Requêtes vers Supabase
├── types/
└── schemas/         # Schémas Zod
```

> **Règle de placement des hooks** : un hook qui dépend d'un Service métier (ex: `useLogin`) va dans `features/<domaine>/hooks/`. Un hook totalement générique, réutilisable dans n'importe quel projet (ex: `useDebounce`) va dans `shared/hooks/`.

## 🧑‍💻 Conventions de code

- **camelCase** : variables, fonctions
- **PascalCase** : composants, classes, interfaces
- **Validation** : Zod obligatoire sur tous les formulaires utilisateurs

## 🔐 Variables d'environnement

Fichier `.env` à la racine :

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 🗄️ Base de données

| Table | Description |
|---|---|
| `users` | `id`, `username` (unique), `email` (unique, sécurité interne — jamais utilisé pour se connecter), `role` (`user`/`admin`), `created_at` |
| `matches` | `id`, `team1`, `team2`, `kickoff_at`, `status`, `result` |
| `predictions` | `id`, `user_id`, `match_id`, `prediction`, `points_awarded` (contrainte `unique(user_id, match_id)`) |

**Authentification** : connexion **par pseudo uniquement** (pas par email). L'email est collecté à l'inscription pour la sécurité/récupération de compte, jamais comme identifiant de connexion. La traduction username → email nécessaire pour Supabase Auth est encapsulée dans une fonction SQL `get_email_by_username` (`SECURITY DEFINER`), elle-même appelée uniquement par l'`AuthRepository`.

## 🔒 Sécurité

- Authentification via Supabase Auth (JWT, session persistante chiffrée)
- Row Level Security (RLS) activée sur toutes les tables : un utilisateur ne peut lire/modifier que ses propres données
- Tous les contrôles de rôle (`admin`) sont revalidés côté serveur, jamais uniquement côté UI

## 📌 Product Backlog — hors scope V1

Google Auth, authentification par email, reset password self-service, API Football, ligues privées, chat, notifications, réseau social — voir le Cahier des Charges (section 9) pour la liste complète.