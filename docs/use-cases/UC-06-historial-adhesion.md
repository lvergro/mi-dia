---
id: UC-06
title: Consultar historial de adhesión
related_fr: [FR-06]
actor: usuario final
priority: must-have
---

## Preconditions
- Usuario autenticado.
- Existen logs de cumplimiento de al menos un día anterior.

## Main flow
1. Usuario abre la pantalla **Historial**.
2. Sistema carga los últimos 7 días por defecto.
3. Para cada día muestra el % de adhesión: `items_hechos / (items_hechos + items_omitidos + items_pendientes)`.
4. Usuario puede tocar un día para ver el detalle: lista de items del día con su estado (hecho / omitido / pendiente).
5. Usuario puede cambiar el filtro a **30 días**; la vista se recarga con el nuevo rango.

## Alternate flows
- **2a. No hay logs en el rango seleccionado** → muestra mensaje "Sin datos para este período".
- **4a. Día sin ningún item programado** → no aparece en el historial (no hay adhesión que calcular).

## Postconditions
- Vista renderizada con % de adhesión por día derivado de `logs` e `items`.
- Si el usuario accedió al detalle de un día, vio el estado de cada item para esa fecha.

## Notes
- Omitidos cuentan como no cumplidos en el cálculo (no se excluyen).
- Rango disponible: 7 días (default) o 30 días (filtro manual).
