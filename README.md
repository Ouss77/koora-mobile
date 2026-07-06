# ⚽ KOORA

KOORA is a mobile football prediction application built with React Native (Expo) and Supabase.

The objective of the project is to provide a simple MVP where users can predict football match results, earn points, and compete in a global ranking.

---

# Features (MVP)

- User registration
- Login with username + password
- Email stored for account recovery (not used for login)
- View upcoming matches
- Submit predictions
- Edit predictions before kickoff
- Automatic prediction locking
- Personal results
- Global ranking
- Admin dashboard
- Match management
- Result management
- Automatic points calculation

---

# Tech Stack

Frontend

- React Native
- Expo
- Expo Router
- NativeWind
- TypeScript

Backend

- Supabase
- PostgreSQL

Libraries

- TanStack Query
- React Hook Form
- Zod
- date-fns
- Lucide Icons

---

# Architecture

The project follows a Feature First architecture.

```
src/
│
├── app/
├── assets/
├── core/
│   ├── config/
│   ├── constants/
│   ├── supabase/
│   ├── types/
│   └── utils/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   └── ui/
│
└── features/
    ├── auth/
    ├── matches/
    ├── predictions/
    ├── ranking/
    └── admin/
```

---

# Project Layers

UI

↓

TanStack Query

↓

Services

↓

Repositories

↓

Supabase

↓

PostgreSQL

---

# Database

Main tables

- users
- matches
- predictions

Main relations

Users (1) ----< Predictions >---- (1) Matches

---

# Authentication

The application uses Supabase Auth.

Users login with:

- username
- password

Internally:

username

↓

lookup email

↓

Supabase signInWithPassword(email, password)

Email is stored only for:

- account recovery
- future password reset (V2)

---

# Roles

- user
- admin

The admin is simply a normal user with role = admin.

---

# Match Status

- upcoming
- locked
- finished

---

# Prediction Results

- team1
- draw
- team2

Correct prediction

= 3 points

Wrong prediction

= 0 point

---

# Installation

Clone repository

```bash
git clone https://github.com/your-org/koora-mobile.git
```

Install dependencies

```bash
npm install
```

Create .env

```env
EXPO_PUBLIC_SUPABASE_URL=

EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Run project

```bash
npx expo start
```

---

# Development Rules

- No direct Supabase calls inside screens
- Business logic belongs to Services
- Data access belongs to Repositories
- Validate all forms using Zod
- Use TanStack Query for server state

---

# Git Workflow

main

↓

develop

↓

feature/*

↓

Pull Request

↓

Code Review

↓

Merge

---

# Roadmap

V1

- Authentication
- Predictions
- Ranking
- Administration

V2

- Football API
- Notifications
- Private leagues
- Friends
- Google Login
- Email Login
- Password Reset