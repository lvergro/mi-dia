---
id: UC-07
title: Registrar cuenta e iniciar sesión
related_fr: [FR-07]
actor: usuario final
priority: must-have
---

## Preconditions
- App instalada en el dispositivo.
- No hay sesión activa persistida.

## Main flow — registro
1. Usuario abre la app y elige **Crear cuenta**.
2. Ingresa email y contraseña.
3. Sistema solicita permiso de notificaciones push.
4. Sistema crea la cuenta y persiste la sesión en el dispositivo.
5. Usuario accede directamente a las pantallas principales (Mi Día, Medicamentos/Actividades, Historial).

## Main flow — login
1. Usuario abre la app con cuenta ya existente y elige **Iniciar sesión**.
2. Ingresa email y contraseña.
3. Sistema valida credenciales y persiste la sesión.
4. Usuario accede directamente a las pantallas principales.

## Alternate flows
- **2a. Email inválido o contraseña vacía** → botón deshabilitado + error inline en el campo.
- **2b. Login con credenciales incorrectas** → error "Email o contraseña incorrectos" (sin especificar cuál).
- **2c. Email ya registrado al intentar crear cuenta** → error indicando que ya existe una cuenta con ese email.
- **3a. Usuario deniega permiso de notificaciones** → cuenta se crea igual; los recordatorios push no se programarán hasta que el usuario habilite el permiso desde ajustes del sistema.
- **Sesión persistente** → si el usuario ya tiene sesión guardada al abrir la app, va directo a Mi Día sin pasar por login.

## Postconditions
- Fila en tabla `users` (registro nuevo) o sesión validada (login).
- Token de sesión persistido localmente en el dispositivo.
- Permiso de notificaciones solicitado (estado: concedido o denegado).
