---
id: UC-03
title: Visualizar checklist diario agrupado por bloque
related_fr: [FR-03]
actor: usuario final
priority: must-have
---

## Preconditions
- Usuario autenticado.
- Es el día actual (la pantalla siempre muestra el día de hoy).

## Main flow
1. Usuario abre la pantalla **Mi Día** (tab principal).
2. Sistema calcula los items que corresponden a hoy según recurrencia (diaria o días específicos).
3. Agrupa los items por bloque según su hora: mañana (06–14), tarde (14–20), noche (20–06).
4. Renderiza las tres secciones siempre visibles, con sus items y estado actual (pendiente / hecho / omitido).
5. Si un bloque no tiene items para hoy, muestra "Sin items" en esa sección.

## Alternate flows
- **2a. Item con días específicos y hoy no corresponde** → no se incluye en la lista del día; no aparece en ningún bloque.
- **2b. No hay ningún item registrado** → las tres secciones muestran "Sin items".
- **4a. Item marcado anteriormente en el día** → se muestra con su estado (hecho/omitido) ya aplicado.

## Postconditions
- Pantalla renderizada con los bloques mañana/tarde/noche y sus items correspondientes al día actual.
- Ningún item de otro día ni de recurrencias que no apliquen hoy es mostrado.
