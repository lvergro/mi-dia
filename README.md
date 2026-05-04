# Mi Día

App móvil de checklist diario de medicamentos, procedimientos y autocuidado. Permite registrar qué tomó el usuario, a qué hora, con qué estado (hecho / saltado / no recuerdo), y llevar una bitácora diaria.

MVP orientado a Android con Expo + Supabase.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | Expo SDK 52 · Expo Router v4 · React Native |
| Estilos | NativeWind (Tailwind para React Native) |
| Backend | Supabase (PostgreSQL 15 + Auth + RLS) |
| Estado servidor | TanStack Query |
| Validación | Zod |
| Lenguaje | TypeScript strict |
| Monorepo | pnpm workspaces + Turborepo |

---

## Estructura

```
mi-dia/
├── apps/
│   └── mobile/          # App Expo (Android MVP)
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

## Pantallas MVP

| Pantalla | Descripción |
|----------|-------------|
| Login | Autenticación con email y contraseña (Supabase Auth) |
| Mi Día | Checklist diario agrupado por bloques: Mañana / Tarde / Noche |
| Medicamentos | CRUD de medicamentos del usuario |
| Historial | Días anteriores con estado de cada ítem |

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
npx supabase db push

# 4. Iniciar la app
pnpm --filter mobile start
```

---

## Comandos

```bash
pnpm install          # Instalar dependencias
pnpm build            # Compilar todos los paquetes
pnpm type-check       # Verificar tipos en todo el monorepo
pnpm test             # Ejecutar tests
pnpm lint             # Linting

npx supabase db push  # Aplicar migraciones a Supabase Cloud
```

---

## Invariantes de seguridad

- **RLS obligatorio** — toda tabla tiene Row Level Security. Un usuario nunca ve datos de otro.
- **Sin secretos en código** — credenciales solo en variables de entorno, nunca en commits.
- **Sin recomendaciones médicas** — el sistema solo registra y muestra. Nunca sugiere repetir dosis.
- **`completed_at` obligatorio** — al marcar un ítem como "done", se registra el timestamp exacto en UTC.
- **Advertencia `not_sure`** — al marcar "no recuerdo", se muestra: *"No hay confirmación de toma. Revisa tu pastillero o consulta tus indicaciones médicas antes de repetir una dosis."*
