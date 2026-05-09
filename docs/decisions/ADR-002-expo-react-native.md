---
id: ADR-002
title: Usar Expo (React Native) para la app mobile
status: accepted
date: 2026-05-08
deciders: [Luis Vergara]
---

## Context
El sistema necesita una app mobile **Android únicamente** (v1). La versión web futura se hará en Next.js, por lo que compartir el ecosistema React reduce la carga cognitiva y permite reutilizar lógica y tipos.

## Decision
Usar Expo SDK (React Native) para la app mobile Android. Expo provee push notifications vía FCM, builds administrados (EAS Build) y acceso a APIs nativas sin configuración manual de Android Studio en desarrollo.

## Options considered
| Option | Pros | Cons |
|--------|------|------|
| Expo / React Native | rápido de desarrollar, comparte ecosistema con Next.js (web), push nativo gratuito | performance inferior a nativo para apps intensivas en gráficos |
| Flutter | excelente performance, un codebase para móvil+web | ecosistema Dart separado, sin sinergia con Next.js |
| Swift / Kotlin nativo | máxima performance y control | dos codebases, tiempo de desarrollo muy superior |
| Capacitor / Ionic | web skills reutilizables | experiencia de usuario inferior en móvil |

## Consequences
- Positive: desarrollo rápido, Expo Push Notifications gratuito, monorepo compartido con Next.js.
- Negative: limitaciones de Expo managed workflow para módulos nativos muy específicos.
- Neutral: OTA updates disponibles con Expo, útiles para hotfixes sin pasar por Play Store.
- Neutral: iOS queda fuera de scope v1; si se incorpora en el futuro, Expo facilita la extensión sin reescritura.

## Related
- Containers: Mi Día Mobile
- ADRs: ADR-003 (monorepo)
