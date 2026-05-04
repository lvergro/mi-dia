# Architecture — Mi Día
updated: 2026-05-04

## System Overview
MVP mobile-first. Monorepo pnpm + Turborepo. App Expo (React Native) con Supabase como BaaS.
Sin app web en MVP. Sin sincronización offline avanzada en MVP.

## Apps
- `apps/mobile`: Expo Router v4, React Native. Interfaz de uso diario en Android.

## Packages (dependency order: bottom → top)
```
packages/types       ← sin dependencias internas
packages/validators  ← depende de: types
packages/core        ← depende de: types, validators
packages/database    ← depende de: types (+ Supabase client)
apps/mobile          ← depende de: core, database, validators, types
```

## Dependency Rules (ENFORCED)
- `packages/core` NUNCA importa React, React Native, Supabase
- `packages/database` es el ÚNICO lugar que importa el cliente Supabase
- `apps/mobile/components/` NUNCA importa Supabase directamente
- `packages/validators` NUNCA importa Supabase ni UI

## Layer Rules — Mobile App
```
Screen (app/*.tsx)
  ↓
Custom Hook (hooks/use*.ts)       ← estado, efectos, mutaciones
  ↓
Package core (packages/core/)     ← lógica de negocio pura
  ↓
Package database (packages/database/) ← queries Supabase
  ↓
Supabase (PostgreSQL + Auth + RLS)
```

## Mobile App Screens (Expo Router)
```
app/
  _layout.tsx                  ← root: auth guard
  (auth)/
    _layout.tsx
    login.tsx                  ← login + register
  (tabs)/
    _layout.tsx                ← tab navigator
    index.tsx                  ← Mi Día (checklist diario) — pantalla principal
    medications.tsx            ← CRUD de medicamentos
    history.tsx                ← historial de días anteriores
```

## Core Functions (packages/core/src/)
- `generateDailyChecklist(routines, date)` → DailyItem[]
- `groupItemsByTimeBlock(items)` → { morning, afternoon, night }
- `getPendingItems(items)` → DailyItem[]
- `calculateAdherence(items)` → { total, done, skipped, not_sure, pct }

## Database Tables
- `medications` — catálogo de medicamentos del usuario
- `routines` — configuración de tareas diarias recurrentes
- `daily_items` — checklist generado por día (instancias de rutinas)
- `daily_notes` — notas personales libres por día

Ver `schema.md` para columnas detalladas.

## RLS Pattern
Todas las tablas tienen `user_id uuid references auth.users(id)`.
Política universal: `user_id = auth.uid()` para SELECT, INSERT, UPDATE, DELETE.

## Auth
Supabase Auth (email + password). JWT validado por el cliente Supabase en mobile.
El root layout de Expo Router actúa como auth guard.

## Conventions
- Screens: `apps/mobile/app/(group)/screen.tsx`
- Components: `apps/mobile/components/{domain}/{Component}.tsx`
- Hooks: `apps/mobile/hooks/use{Name}.ts`
- Core: `packages/core/src/{domain}.ts`
- DB queries: `packages/database/src/{domain}.ts`
- Validators: `packages/validators/src/{domain}.ts`
- Types: `packages/types/src/{domain}.ts`

## Styling
NativeWind (Tailwind para React Native). Tokens de color definidos en tailwind.config.js del mobile app.
Diseño: pocos colores, botones grandes, baja carga cognitiva.

## State Management
- Server state: TanStack Query (`@tanstack/react-query`)
- Client/UI state: Zustand (solo si es necesario — preferir estado local primero)

## Decisions Log
Ver `decisions/DEC-*.md` para decisiones arquitectónicas documentadas.
