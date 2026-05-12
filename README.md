# Trazadía

Trazadía es una aplicación móvil de bienestar integral diseñada para centralizar, simplificar y registrar tus rutinas diarias de salud. Combina la gestión precisa de medicamentos y procedimientos médicos con un sistema intuitivo de rastreo de estado de ánimo y bitácora personal.

Disponible en Android via Expo.
---

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | Expo SDK 54 · Expo Router v6 · React Native 0.81 |
| Estilos | NativeWind (Tailwind para React Native) |
| Backend | Supabase (PostgreSQL 15 + Auth + RLS) |
| Estado servidor | TanStack Query |
| Validación | Zod |
| Lenguaje | TypeScript strict |
| Monorepo | pnpm workspaces + Turborepo |

---

## Estructura

```
trazadia/
├── apps/
│   └── mobile/          # App Expo (Android)
├── packages/
│   ├── types/           # Tipos TypeScript del dominio
│   ├── validators/      # Zod schemas
│   ├── core/            # Lógica de negocio pura (sin React ni Supabase)
│   └── database/        # Queries Supabase (único punto de acceso)
└── supabase/
    └── migrations/      # Migraciones SQL
```

### Reglas de dependencia

```
apps/mobile
  ↓
packages/core      ← nunca importa React, React Native ni Supabase
  ↓
packages/database  ← único lugar que importa el cliente Supabase
  ↓
Supabase (PostgreSQL + Auth + RLS)
```

---

## Pantallas

| Pantalla | Descripción |
|----------|-------------|
| Login | Email/contraseña o Google OAuth |
| Mi Día | Vista del día: checklist de rutinas, navegación a días anteriores |
| Historial | Historial de adhesión por rango de fechas |
| Notas | Notas libres con selector de ánimo por entrada |
| Medicamentos | CRUD de medicamentos del usuario |
| Mi Cuenta | Email, cambio de contraseña, eliminar cuenta |

---

## Prerrequisitos

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- Cuenta en [supabase.com](https://supabase.com) (plan gratuito)
- Expo Go en el dispositivo Android

---

## Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear proyecto en supabase.com y copiar las credenciales
cp .env.example .env.local
# Editar .env.local con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Aplicar migraciones al proyecto Supabase
npx supabase link --project-ref <project-ref>
npx supabase db push

# 4. Iniciar la app
pnpm --filter mobile start
```

---

## Google OAuth (opcional)

Para activar el login con Google, sigue los pasos en [`docs/GOOGLE_OAUTH_SETUP.md`](docs/GOOGLE_OAUTH_SETUP.md).

---

## Comandos

```bash
pnpm install          # Instalar dependencias
pnpm build            # Compilar todos los paquetes
pnpm test             # Ejecutar tests

npx supabase db push  # Aplicar migraciones a Supabase Cloud
```

---

## Invariantes de seguridad

- **RLS obligatorio** — toda tabla tiene Row Level Security. Un usuario nunca ve datos de otro.
- **Sin secretos en código** — credenciales solo en variables de entorno, nunca en commits.
- **Sin recomendaciones médicas** — el sistema solo registra y muestra. Nunca sugiere repetir dosis.
- **Advertencia `not_sure`** — al marcar "no recuerdo", se muestra aviso médico antes de cualquier acción.
