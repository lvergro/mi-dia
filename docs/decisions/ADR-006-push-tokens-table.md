---
id: ADR-006
title: Tabla dedicada push_tokens para almacenar Expo Push Tokens
status: accepted
date: 2026-05-09
deciders: [Luis]
---

## Context
Necesitamos persistir el Expo Push Token de cada usuario para que el Edge Function scheduler pueda enviarlo notificaciones. Las opciones son: (a) columna en una tabla profiles auxiliar, (b) tabla dedicada push_tokens.

## Decision
Tabla dedicada `push_tokens` con UNIQUE(user_id) — MVP con un token por usuario, upsert al iniciar sesión.

## Options considered
| Option | Pros | Cons |
|--------|------|------|
| Tabla dedicada | Clara separación, fácil multi-token futuro | Una tabla más |
| Columna en profiles | Menos tablas | Requiere tabla profiles que no existe aún |

## Consequences
- Positivo: RLS limpio, extensible a multi-token (multi-device) en v2.
- Negativo: JOIN extra en el scheduler SQL.
- Neutral: upsert simple por user_id garantiza idempotencia.
