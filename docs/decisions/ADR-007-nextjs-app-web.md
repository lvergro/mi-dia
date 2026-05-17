---
id: ADR-007
title: Next.js 15 (App Router) en Vercel para apps/web
status: accepted
date: 2026-05-16
deciders: [lvergara]
---

## Context

Con la decisión de agregar una app web a Mi Día, se necesita elegir framework y plataforma de hosting. El monorepo ya tiene `packages/core`, `packages/database`, `packages/types` y `packages/validators` en TypeScript puro (sin dependencias de React Native), listos para ser reutilizados. La app web debe compartir el mismo Supabase project (Auth + Postgres) que usa `apps/mobile`.

## Decision

Se usa **Next.js 15 con App Router** como framework web, desplegado en **Vercel**. `apps/web` vive en el mismo monorepo pnpm + Turborepo. Comparte todos los `packages/*` sin modificaciones. El styling usa Tailwind CSS estándar (no NativeWind, que es exclusivo de React Native).

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **Next.js 15 App Router** (elegido) | SSR/RSC para carga inicial rápida; integración nativa con Vercel; soporte oficial de Supabase Auth (SSR helpers); mismo ecosistema Tailwind | Más complejo que una SPA pura; curva de App Router |
| Vite + React 18 (SPA) | Más simple, sin SSR; menor fricción inicial | Sin SSR: peor performance en carga inicial; sin soporte de Supabase Auth SSR helpers; hosting estático menos flexible |
| Remix | SSR maduro, buena DX | Menor adopción, menos soporte de Supabase; no agrega ventajas sobre Next.js en este contexto |

## Consequences

- **Positivo:** Los `packages/*` se reutilizan directamente — sin adaptar código de negocio ni de acceso a datos.
- **Positivo:** Supabase provee helpers oficiales para Next.js App Router (`@supabase/ssr`) que manejan cookies y JWT en server components.
- **Positivo:** Vercel Hobby (gratuito) cubre el MVP sin costo adicional.
- **Negativo:** Tailwind CSS en web y NativeWind en mobile son configuraciones separadas (mismo sistema de tokens, pero distinto setup).
- **Negativo:** El equipo debe conocer la distinción Server Components / Client Components del App Router.
- **Neutral:** No hay offline ni push en `apps/web` MVP — sin impacto en la decisión de framework.

## Related

- Containers: Mi Día Web, Shared Packages (c4-container.md)
- ADR-001 (Supabase como backend) — mismo proyecto Supabase para web y mobile
- ADR-003 (Monorepo Turborepo) — apps/web se agrega como nueva app en el monorepo existente
