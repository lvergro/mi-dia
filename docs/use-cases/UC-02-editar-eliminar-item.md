---
id: UC-02
title: Editar o eliminar medicamento o actividad
related_fr: [FR-02]
actor: usuario final
priority: must-have
---

## Preconditions
- Usuario autenticado.
- Existe al menos un item registrado.

## Main flow — editar
1. Usuario entra al tab **Medicamentos/Actividades**.
2. Selecciona un item existente.
3. Se abre el mismo formulario de FR-01 con los datos actuales precargados.
4. Modifica los campos deseados; las mismas validaciones aplican (nombre + hora obligatorios, no duplicar nombre+hora).
5. Toca **Guardar**.
6. Sistema actualiza el item manteniendo todo el historial de logs previo intacto.
7. Vuelve a la lista; el item refleja los nuevos datos.

## Main flow — eliminar
1. Usuario selecciona un item y elige **Eliminar**.
2. Sistema solicita confirmación ("¿Eliminar este item? Esta acción no se puede deshacer").
3. Usuario confirma.
4. Sistema marca el item como eliminado (soft-delete); desaparece del checklist del día en curso y de todos los días futuros.

## Alternate flows
- **3a. Usuario sale del formulario de edición con cambios sin guardar** → sistema pide confirmación antes de descartar (igual que UC-01).
- **4a. Edición genera conflicto nombre+hora con otro item** → bloquea guardado con error inline.
- **3b. Usuario cancela confirmación de eliminación** → no se realiza ningún cambio.

## Postconditions — editar
- Fila en `items` actualizada con nuevos datos.
- Logs históricos previos conservados sin modificación.
- Recordatorio push re-programado si cambió la hora.

## Postconditions — eliminar
- Item marcado como eliminado en `items` (soft-delete).
- Item ausente en checklist del día actual y días futuros.
- Logs históricos previos conservados para historial de adhesión.
