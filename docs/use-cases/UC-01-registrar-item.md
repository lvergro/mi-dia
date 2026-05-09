---
id: UC-01
title: Registrar medicamento o actividad con horario
related_fr: [FR-01]
actor: usuario final
priority: must-have
---

## Preconditions
- Usuario autenticado.
- Permiso de notificaciones ya solicitado en login (puede estar concedido o denegado).

## Main flow
1. Usuario entra al tab **Medicamentos/Actividades**.
2. Toca el botón "+" para crear un nuevo item.
3. Se abre el formulario con campos: tipo (medicamento/actividad), nombre, dosis (si medicamento), hora específica, recurrencia (diaria o días específicos lun–dom).
4. Mientras los campos obligatorios (nombre, hora) estén vacíos o inválidos, el botón **Guardar** permanece deshabilitado y se muestra error inline en el campo afectado.
5. Usuario completa los campos y toca **Guardar**.
6. Sistema persiste el item (localmente si no hay conexión, encolado para sincronizar).
7. Sistema registra el recordatorio push según la hora del item.
8. Vuelve a la lista de items; el nuevo item aparece bajo el bloque correspondiente (mañana 06–14, tarde 14–20, noche 20–06).

## Alternate flows
- **3a. Usuario sale del formulario con cambios sin guardar** → sistema pide confirmación antes de descartar.
- **5a. Existe ya un item con mismo nombre + misma hora** → sistema bloquea el guardado y muestra error indicando el conflicto.
- **6a. Sin conexión** → item se guarda localmente y queda en cola; se sincroniza al restablecer conexión sin intervención del usuario.
- **6b. Permiso de notificaciones denegado** → item se guarda igual, pero no se programa el push (queda registrado para programar si el usuario habilita el permiso luego).

## Postconditions
- Fila en tabla `items` con nombre, tipo, dosis (si aplica), hora, recurrencia, usuario.
- Si hay permiso, recordatorio push programado para la(s) próxima(s) ocurrencia(s).
- Item visible en la lista de gestión y, si corresponde al día actual, en "Mi Día".
