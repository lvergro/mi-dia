---
id: UC-05
title: Recibir recordatorio push por item
related_fr: [FR-05]
actor: sistema (scheduler de notificaciones)
priority: must-have
---

## Preconditions
- Usuario tiene al menos un item activo con hora programada para hoy.
- El item no ha sido marcado como hecho u omitido antes de su hora.
- El usuario concedió permiso de notificaciones.

## Main flow
1. Llega la hora configurada de un item.
2. Sistema verifica que el item sigue pendiente para el día actual.
3. Sistema envía notificación push al dispositivo con nombre del item (y dosis si es medicamento).
4. Notificación se entrega y el usuario la recibe.
5. Usuario toca la notificación → la app se abre (en primer plano si estaba en background, o se lanza si estaba cerrada).

## Alternate flows
- **2a. Item ya marcado como hecho u omitido antes de la hora** → sistema cancela el push; no se entrega notificación.
- **4a. Push falla (sin conexión, dispositivo apagado)** → sistema reintenta hasta entregar; sin límite de intentos definido por ahora.
- **Permiso de notificaciones denegado** → no se envía push; el item sigue visible en "Mi Día" pero sin recordatorio (registrado en FR-01 alternate flow 6b).

## Postconditions
- Evento de notificación enviada registrado (log con item_id, timestamp, estado: enviada|cancelada|fallida).
- App abierta en pantalla principal si el usuario interactuó con la notificación.
