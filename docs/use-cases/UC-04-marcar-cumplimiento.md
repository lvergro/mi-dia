---
id: UC-04
title: Marcar cumplimiento de un item del día
related_fr: [FR-04]
actor: usuario final
priority: must-have
---

## Preconditions
- Usuario autenticado.
- Pantalla "Mi Día" abierta con al menos un item visible para hoy.

## Main flow — marcar como hecho
1. Usuario toca el control de estado de un item pendiente.
2. Sistema registra el item como **hecho** con timestamp actual.
3. El item se actualiza visualmente en el checklist (estado hecho).

## Main flow — marcar como omitido
1. Usuario toca el control de estado de un item pendiente y selecciona **omitir**.
2. Sistema solicita una nota opcional con el motivo de la omisión.
3. Usuario escribe la nota (o la deja vacía) y confirma.
4. Sistema registra el item como **omitido** con timestamp y nota.
5. El item se actualiza visualmente en el checklist (estado omitido).

## Alternate flows
- **2a. Usuario deshace un marcado por error (hecho → pendiente o omitido → pendiente)** → toca el control nuevamente; sistema revierte el estado a pendiente y elimina el log del día para ese item.
- **3a. Sin conexión** → el cambio de estado se guarda localmente y se sincroniza al restablecer conexión.

## Postconditions
- Fila en tabla `logs` con (item_id, fecha_hoy, estado: hecho|omitido, timestamp, nota?).
- Si se revirtió: la fila en `logs` para ese item y fecha es eliminada o marcada como revertida.
- El estado visual en "Mi Día" refleja el estado actual del item.
