---
id: ADR-005
title: Usar Expo Push Notifications para recordatorios
status: accepted
date: 2026-05-08
deciders: [Luis Vergara]
---

## Context
El sistema necesita enviar notificaciones push a dispositivos **Android** (v1) a la hora configurada por cada item (FR-05). Se requiere una solución gratuita compatible con Expo.

## Decision
Usar Expo Push Notifications Service como intermediario entre Supabase Edge Functions y FCM. Expo abstrae la gestión de claves FCM y permite escalar a iOS en el futuro sin cambiar la integración.

## Options considered
| Option | Pros | Cons |
|--------|------|------|
| Expo Push Service | gratuito, integrado nativamente con expo-notifications, sin gestión de certificados | dependencia de infraestructura de Expo |
| FCM / APNs directo | control total, sin intermediario | requiere gestionar certificados y dos integraciones separadas |
| OneSignal | free tier generoso, dashboard de analytics | servicio externo adicional, más setup |
| Firebase Cloud Messaging | maduro, gratuito | requiere configuración nativa adicional en Expo managed workflow |

## Consequences
- Positive: cero costo, setup mínimo con `expo-notifications`, funciona en managed workflow sin eject.
- Negative: dependencia de la infraestructura de Expo; si Expo cambia su política, requiere migrar.
- Neutral: Expo actúa como proxy — el token de push del dispositivo es un Expo Push Token, no un token FCM directo.
- Neutral: si en el futuro se añade iOS, la integración en Edge Functions no cambia (Expo abstrae FCM vs APNs).

## Related
- Containers: Push Scheduler (Supabase Edge Functions), Mi Día Mobile
- NFRs: NFR-OBS-01
- FRs: FR-05
- UCs: UC-05
